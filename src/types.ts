export enum NodeType {
  WALLET = 'wallet',
  AGENT = 'agent',
  INTENT = 'intent',
  CHAIN = 'chain',
}

export interface Node {
  id: string;
  type: NodeType | string;
  title: string;
  balance?: string;
  status?: string;
  chain?: string;
  policy?: string;
  securityScore?: number;
  agentId?: string;
  contractAddress?: string;
  reputationScore?: number;
  x: number;
  y: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  health?: 'good' | 'warning' | 'critical';
  amount?: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  valueUsd: string;
  chain: string;
  isUnified: boolean;
  contractAddress?: string;
}

export interface Transaction {
  id: string;
  type: 'transfer' | 'bridge' | 'fx' | 'mint' | 'agent_register' | 'payroll';
  asset: string;
  amount: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  from: string;
  to: string;
  hash: string;
  blockNumber?: number;
  gasUsed?: string;
  network?: string;
}

export interface ArcanaSynthesis {
  logicSteps: string[];
  synthesis: string;
  suggestions: string[];
  simulation?: {
    expectedGas: string;
    savedFees: string;
    isQuantumSafe: boolean;
  };
}

export interface IntentStep {
  id: string;
  action: string;
  description: string;
  params: Record<string, string>;
  estimatedGas?: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'done' | 'failed';
  txHash?: string;
}

export interface DecomposedIntent {
  rawIntent: string;
  summary: string;
  totalEstimatedGas: string;
  riskScore: number;
  steps: IntentStep[];
  warnings: string[];
}

export interface CCTPRoute {
  id: string;
  fromChain: string;
  toChain: string;
  estimatedTime: string;
  estimatedFee: string;
  feeUsd: string;
  hops: string[];
  recommended: boolean;
  securityScore: number;
  notes: string;
}

export interface PayrollEntry {
  id: string;
  name: string;
  recipientAddress: string;
  recipientLabel: string;
  amount: string;
  asset: 'USDC' | 'EURC';
  chain: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  nextExecution: number;
  lastExecution?: number;
  lastTxHash?: string;
  status: 'active' | 'paused' | 'completed';
  executionCount: number;
  totalPaid: string;
  agentId?: string;
}

export interface OnChainAgent {
  tokenId: string;
  owner: string;
  metadataURI: string;
  name?: string;
  description?: string;
  agentType?: string;
  capabilities?: string[];
  reputationScore?: number;
  registeredAt?: number;
  txHash?: string;
}

export interface AgentRegistrationForm {
  name: string;
  description: string;
  agentType: string;
  capabilities: string[];
  policyTemplate: string;
  customPolicy?: string;
}

export interface PolicyValidation {
  isValid: boolean;
  riskScore: number;
  riskLabel: 'safe' | 'moderate' | 'risky' | 'critical';
  issues: string[];
  suggestions: string[];
  explanation: string;
}

export interface ArcNetworkData {
  blockNumber: bigint | null;
  gasPrice: string | null;
  isConnected: boolean;
  latency: number | null;
  tps: number | null;
  lastUpdated: number;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  usdcBalance: string | null;
  eurcBalance: string | null;
  error: string | null;
}
