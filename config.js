const CHAIN = { id:11155111, hex:"0xaa36a7", name:"Sepolia", explorer:"https://sepolia.etherscan.io" };

const ROUTER = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";

const TOKENS = [
  { sym:"ETH", addr:"ETH_NATIVE", dec:18 },
  { sym:"WETH", addr:"0xfff9976782d46cc05630d1f6ebab18b2324d6b14", dec:18 },
  { sym:"USDC", addr:"0x1c7d4b196cb0c7b01d743fbc6116a902379c7238", dec:6 }
];

const WETH_ADDR = TOKENS[1].addr;

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)"
];

const ROUTER_ABI = [
  "function getAmountsOut(uint256,address[]) view returns (uint256[])",
  "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
  "function swapExactETHForTokens(uint256,address[],address,uint256) payable",
  "function swapExactTokensForETH(uint256,uint256,address[],address,uint256)"
];
