// Arc Testnet Chain Config
export const ARC_TESTNET = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
    public: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
} as const;

export const ARC_RPC = 'https://rpc.testnet.arc.network';
export const ARC_EXPLORER = 'https://testnet.arcscan.app';
export const ARC_FAUCET = 'https://faucet.circle.com';

// Stablecoin Contracts (Arc Testnet)
export const CONTRACTS = {
  USDC:            '0x3600000000000000000000000000000000000000',
  EURC:            '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
  USYC:            '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C',

  // CCTP v2
  TokenMessengerV2:   '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
  MessageTransmitterV2: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275',
  TokenMinterV2:      '0xb43db544E2c27092c107639Ad201b3dEfAbcF192',

  // Gateway (Unified Balance)
  GatewayWallet:   '0x0077777d7EBA4688BDeF3E311b846F25870A19B9',
  GatewayMinter:   '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B',

  // StableFX
  FxEscrow:        '0x867650F5eAe8df91445971f14d89fd84F0C9a9f8',

  // Memo & Batch
  Memo:            '0x9702466268ccF55eAB64cdf484d272Ac08d3b75b',
  Multicall3From:  '0xEb7cc06E3D3b5F9F9a5fA2B31B477ff72bB9c8b6',
  Multicall3:      '0xcA11bde05977b3631167028862bE2a173976CA11',
  Permit2:         '0x000000000022D473030F116dDEE9F6B43aC78BA3',

  // ERC-8004: Agentic Identity
  IdentityRegistry:   '0x8004A818BFB912233c491871b3d84c89A494BD9e',
  ReputationRegistry: '0x8004B663056A597Dffe9eCcC1965A193B7388713',
  ValidationRegistry: '0x8004Cb1BF31DAf7788923b405b754f57acEB4272',
} as const;

// CCTP Domain IDs
export const CCTP_DOMAINS: Record<string, { domain: number; chainId: number; name: string; rpc: string }> = {
  arc:      { domain: 26, chainId: 5042002, name: 'Arc Testnet', rpc: 'https://rpc.testnet.arc.network' },
  ethereum: { domain: 0,  chainId: 11155111, name: 'Ethereum Sepolia', rpc: 'https://rpc.sepolia.org' },
  avalanche:{ domain: 1,  chainId: 43113, name: 'Avalanche Fuji', rpc: 'https://api.avax-fuji.network/ext/bc/C/rpc' },
  optimism: { domain: 2,  chainId: 11155420, name: 'OP Sepolia', rpc: 'https://sepolia.optimism.io' },
  arbitrum: { domain: 3,  chainId: 421614, name: 'Arb Sepolia', rpc: 'https://sepolia-rollup.arbitrum.io/rpc' },
  base:     { domain: 6,  chainId: 84532, name: 'Base Sepolia', rpc: 'https://sepolia.base.org' },
  polygon:  { domain: 7,  chainId: 80002, name: 'Polygon Amoy', rpc: 'https://rpc-amoy.polygon.technology' },
  solana:   { domain: 5,  chainId: 0, name: 'Solana Devnet', rpc: '' },
};

// ERC-20 ABI (minimal)
export const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint8' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'string' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }] },
] as const;

// ERC-8004 Identity Registry ABI
export const IDENTITY_REGISTRY_ABI = [
  { name: 'register', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'metadataURI', type: 'string' }], outputs: [] },
  { name: 'ownerOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }] },
  { name: 'tokenURI', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }] },
  { name: 'totalSupply', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'Transfer', type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
    ] },
] as const;

// ERC-8004 Reputation Registry ABI
export const REPUTATION_REGISTRY_ABI = [
  { name: 'giveFeedback', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'score', type: 'int128' },
      { name: 'feedbackType', type: 'uint8' },
      { name: 'tag', type: 'string' },
      { name: 'metadataURI', type: 'string' },
      { name: 'evidenceURI', type: 'string' },
      { name: 'comment', type: 'string' },
      { name: 'feedbackHash', type: 'bytes32' },
    ], outputs: [] },
] as const;

// Agent capability presets
export const AGENT_CAPABILITIES = [
  'usdc_transfer', 'eurc_fx', 'cctp_bridge', 'yield_harvest',
  'liquidity_rebalance', 'payroll_execution', 'compliance_check',
  'arbitrage_detection', 'unified_balance',
] as const;

// Policy templates
export const POLICY_TEMPLATES = {
  conservative: `// Conservative Agent Policy
// Max transfer per cycle: 100 USDC
// Only trusted recipients
const MAX_TRANSFER = 100;
const ALLOWED_CHAINS = ['arc', 'base'];

function shouldExecute(intent) {
  if (intent.amount > MAX_TRANSFER) return false;
  if (!ALLOWED_CHAINS.includes(intent.targetChain)) return false;
  if (!intent.recipientVerified) return false;
  return true;
}

function onCycleComplete(result) {
  log('Cycle complete', result.hash);
  if (result.gasUsed > 0.01) alert('High gas warning');
}`,

  aggressive: `// Aggressive Agent Policy
// Max transfer: unlimited with daily cap 10,000 USDC
// Multi-chain enabled
const DAILY_CAP = 10000;
const ALLOWED_CHAINS = ['arc', 'base', 'ethereum', 'avalanche', 'polygon'];
let dailySpent = 0;

function shouldExecute(intent) {
  if (dailySpent + intent.amount > DAILY_CAP) return false;
  dailySpent += intent.amount;
  return true;
}

function onArbitrage(opportunity) {
  if (opportunity.profitPercent > 0.5) {
    execute(opportunity.path);
  }
}`,

  balanced: `// Balanced Agent Policy
// Mid-risk: 500 USDC/tx, 2000 USDC/day
// Smart routing enabled
const MAX_TX = 500;
const DAILY_CAP = 2000;
const RISK_SCORE_LIMIT = 70;
let dailySpent = 0;

function shouldExecute(intent) {
  if (intent.amount > MAX_TX) return false;
  if (dailySpent + intent.amount > DAILY_CAP) return false;
  if (intent.riskScore > RISK_SCORE_LIMIT) return false;
  dailySpent += intent.amount;
  return true;
}`,
};
