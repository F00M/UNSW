const $ = id => document.getElementById(id);
const log = m => { $("log").textContent += "\n" + m; };

let provider, signer, me;

function initTokens(){
  ["tokenA","tokenB"].forEach(id=>{
    const el=$(id); el.innerHTML="";
    TOKENS.forEach((t,i)=>el.add(new Option(t.sym,i)));
  });
  $("tokenA").value=1;
  $("tokenB").value=2;
}
initTokens();

/* ===== Wallet ===== */
async function connect(){
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts",[]);
  signer = provider.getSigner();
  me = await signer.getAddress();
  $("btnConnect").textContent = me.slice(0,6)+"…"+me.slice(-4);
  refreshBalances();
}

/* ===== Balances ===== */
async function readBal(t){
  if(t.addr==="ETH_NATIVE"){
    const b=await provider.getBalance(me);
    return ethers.utils.formatUnits(b,t.dec);
  }
  const c=new ethers.Contract(t.addr,ERC20_ABI,provider);
  return ethers.utils.formatUnits(await c.balanceOf(me),t.dec);
}

async function refreshBalances(){
  const ta=TOKENS[$("tokenA").value];
  const tb=TOKENS[$("tokenB").value];
  $("balA").textContent="Balance: "+await readBal(ta)+" "+ta.sym;
  $("balB").textContent="Balance: "+await readBal(tb)+" "+tb.sym;
}

/* ===== Helpers ===== */
const toUnits=(v,d)=>ethers.utils.parseUnits(v||"0",d);

/* ===== Estimate ===== */
async function estimateOut(){
  const amt=$("amtA").value;
  if(!amt) return;
  const ta=TOKENS[$("tokenA").value];
  const tb=TOKENS[$("tokenB").value];
  const router=new ethers.Contract(ROUTER,ROUTER_ABI,provider);
  const path=[ta.addr==="ETH_NATIVE"?WETH_ADDR:ta.addr,
              tb.addr==="ETH_NATIVE"?WETH_ADDR:tb.addr];
  const out=(await router.getAmountsOut(toUnits(amt,ta.dec),path)).pop();
  $("amtB").value=ethers.utils.formatUnits(out,tb.dec);
}

$("amtA").oninput=estimateOut;

/* ===== Swap ===== */
$("btnSwap").onclick=async()=>{
  const ta=TOKENS[$("tokenA").value];
  const tb=TOKENS[$("tokenB").value];
  const amt=toUnits($("amtA").value,ta.dec);
  const router=new ethers.Contract(ROUTER,ROUTER_ABI,signer);
  const path=[ta.addr==="ETH_NATIVE"?WETH_ADDR:ta.addr,
              tb.addr==="ETH_NATIVE"?WETH_ADDR:tb.addr];
  if(ta.addr==="ETH_NATIVE"){
    await router.swapExactETHForTokens(0,path,me,Date.now()+600,{value:amt});
  }else{
    const c=new ethers.Contract(ta.addr,ERC20_ABI,signer);
    await c.approve(ROUTER,amt);
    await router.swapExactTokensForTokens(amt,0,path,me,Date.now()+600);
  }
  refreshBalances();
};

$("btnConnect").onclick=connect;
$("flipBtn").onclick=()=>{
  [$("tokenA").value,$("tokenB").value]=[$("tokenB").value,$("tokenA").value];
};
