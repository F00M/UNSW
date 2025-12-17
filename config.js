const CHAIN = { id:11155111, hex:"0xaa36a7", name:"Sepolia", explorer:"https://sepolia.etherscan.io" };
const ROUTER = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
const FACTORY= "0xF62c03E08ada871A0bEb309762E260a7a6a880E6";

const V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const V3_QUOTER  = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
const V3_FEES = [100, 500, 3000, 10000];

const TOKENS=[
  {sym:"ETH", addr:"ETH_NATIVE", dec:18},
  {sym:"WETH",addr:"0xfff9976782d46cc05630d1f6ebab18b2324d6b14",dec:18},
  {sym:"USDC",addr:"0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",dec:6},
];
const WETH_ADDR = TOKENS.find(t=>t.sym==="WETH").addr;

const ERC20_ABI=[
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)"
];
const FACTORY_ABI=[ "function getPair(address,address) external view returns (address)" ];
const ROUTER_ABI=[
  "function getAmountsOut(uint256,address[]) view returns (uint256[])",
  "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
  "function swapExactETHForTokens(uint256,address[],address,uint256) payable",
  "function swapExactTokensForETH(uint256,uint256,address[],address,uint256)"
];
const V3_FACTORY_ABI=[ "function getPool(address,address,uint24) view returns (address)" ];
const V3_QUOTER_ABI=[ "function quoteExactInputSingle(address,address,uint24,uint256,uint160) returns (uint256)" ];
