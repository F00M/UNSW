const $=id=>document.getElementById(id);
const log= m=>{ const el=$("log"); el.textContent+=(el.textContent? "\n":"")+m; el.scrollTop=el.scrollHeight; console.log(m); };

let provider, signer, me, balanceTimer;

/* UI Init */
function initTokens(){
  ["tokenA","tokenB"].forEach(id=>{
    const el=$(id); el.innerHTML="";
    TOKENS.forEach((t,i)=> el.add(new Option(t.sym,i)));
  });
  $("tokenA").value=1;
  $("tokenB").value=2;
}
initTokens();

/* Wallet */
async function ensureProvider(){
  if(window.ethereum){
    if(!provider) provider=new ethers.providers.Web3Provider(window.ethereum,"any");
    return;
  }
  await new Promise((resolve,reject)=>{
    let t=0;
    const iv=setInterval(()=>{
      if(window.ethereum){
        clearInterval(iv);
        provider=new ethers.providers.Web3Provider(window.ethereum,"any");
        resolve();
      }
      if(++t>20){
        clearInterval(iv);
        reject(new Error("MetaMask belum tersedia"));
      }
    },100);
  });
}

async function connect(){
  try{
    await ensureProvider();
    await provider.send("eth_requestAccounts",[]);
    signer=provider.getSigner();
    me=await signer.getAddress();
    const net=await provider.getNetwork();
    if(net.chainId!==CHAIN.id){
      await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN.hex}]});
    }
    $("btnConnect").textContent=me.slice(0,6)+"…"+me.slice(-4);
    log(`✅ Connected: ${me}`);
    startAutoBalances();
    estimateOut();
  }catch(e){ log("❌ Connect error: "+(e.message||e)); }
}

/* Balances */
async function readBalanceOf(addr,dec){
  if(addr==="ETH_NATIVE"){
    const v=await provider.getBalance(me);
    return ethers.utils.formatUnits(v,dec);
  }
  const c=new ethers.Contract(addr,ERC20_ABI,provider);
  const v=await c.balanceOf(me);
  return ethers.utils.formatUnits(v,dec);
}
async function refreshBalances(){
  const ta=TOKENS[+$("tokenA").value], tb=TOKENS[+$("tokenB").value];
  $("balA").textContent=`Balance: ${(await readBalanceOf(ta.addr,ta.dec)).slice(0,10)} ${ta.sym}`;
  $("balB").textContent=`Balance: ${(await readBalanceOf(tb.addr,tb.dec)).slice(0,10)} ${tb.sym}`;
}
function startAutoBalances(){
  clearInterval(balanceTimer);
  refreshBalances();
  balanceTimer=setInterval(refreshBalances,10000);
}

/* Helpers */
function toUnits(v,d){return ethers.utils.parseUnits(String(v||"0"),d);}
function fromUnits(b,d){return Number(ethers.utils.formatUnits(b,d));}
function buildPath(){
  const A=TOKENS[+$("tokenA").value], B=TOKENS[+$("tokenB").value];
  return [(A.addr==="ETH_NATIVE"?WETH_ADDR:A.addr),(B.addr==="ETH_NATIVE"?WETH_ADDR:B.addr)];
}

/* detect V3 */
async function detectV3Fee(a,b){
  const f=new ethers.Contract(V3_FACTORY,V3_FACTORY_ABI,provider);
  for(const fee of V3_FEES){
    const p=await f.getPool(a,b,fee);
    if(p!==ethers.constants.AddressZero) return fee;
  }
  return null;
}

/* estimate */
async function estimateOut(){
  const ta=TOKENS[+$("tokenA").value], tb=TOKENS[+$("tokenB").value];
  const amt=parseFloat($("amtA").value||0); if(!amt) return;
  const path=buildPath();
  const amountIn=toUnits(amt,ta.dec);

  const fee=await detectV3Fee(path[0],path[1]);
  if(fee){
    const q=new ethers.Contract(V3_QUOTER,V3_QUOTER_ABI,provider);
    const out=await q.quoteExactInputSingle(path[0],path[1],fee,amountIn,0);
    $("amtB").value=fromUnits(out,tb.dec);
    $("rateText").textContent=`V3 • ${fromUnits(out,tb.dec)/amt}`;
    return;
  }

  const r=new ethers.Contract(ROUTER,ROUTER_ABI,provider);
  const out=(await r.getAmountsOut(amountIn,path)).pop();
  $("amtB").value=fromUnits(out,tb.dec);
}

$("btnConnect").onclick=connect;
$("amtA").oninput=estimateOut;
