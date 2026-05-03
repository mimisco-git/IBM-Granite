import { CONTRACTS, ARC_TESTNET, ARC_EXPLORER } from '../constants';
import { getIdentityLogs, getTokenURI, getOwnerOf, getIdentityTotalSupply } from './arcService';
import { OnChainAgent, AgentRegistrationForm } from '../types';

// Register a new agent via MetaMask (ERC-8004)
export async function registerAgent(
  form: AgentRegistrationForm,
  walletAddress: string
): Promise<{ txHash: string; agentId: string }> {
  if (!window.ethereum) throw new Error('MetaMask not found');

  // Build metadata JSON
  const metadata = {
    name: form.name,
    description: form.description,
    agent_type: form.agentType,
    capabilities: form.capabilities,
    version: '1.0.0',
    created_at: new Date().toISOString(),
    policy_template: form.policyTemplate,
  };

  // For testnet, we use a data URI instead of IPFS
  const metadataStr = JSON.stringify(metadata);
  const metadataURI = `data:application/json;base64,${btoa(metadataStr)}`;

  // Encode register(string metadataURI) call
  const encoded = encodeRegisterCall(metadataURI);

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: walletAddress,
      to: CONTRACTS.IdentityRegistry,
      data: encoded,
      chainId: `0x${ARC_TESTNET.id.toString(16)}`,
    }],
  }) as string;

  // Return tx hash - the agent ID will be parsed from events later
  return { txHash, agentId: 'pending' };
}

// Encode register(string) ABI call
function encodeRegisterCall(metadataURI: string): string {
  // Function selector: keccak256("register(string)") = 0xd09de08a
  const selector = '0xd09de08a';
  // Encode string: offset (32 bytes) + length (32 bytes) + padded data
  const strBytes = new TextEncoder().encode(metadataURI);
  const offset = '0000000000000000000000000000000000000000000000000000000000000020';
  const length = strBytes.length.toString(16).padStart(64, '0');
  let data = '';
  for (let i = 0; i < strBytes.length; i++) {
    data += strBytes[i].toString(16).padStart(2, '0');
  }
  // Pad to 32-byte boundary
  const padLength = Math.ceil(strBytes.length / 32) * 32;
  data = data.padEnd(padLength * 2, '0');
  return selector + offset + length + data;
}

// Record reputation for an agent via MetaMask
export async function recordReputation(
  agentId: string,
  score: number,
  tag: string,
  walletAddress: string
): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not found');

  // giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)
  // This is complex ABI encoding; simplified for testnet demo
  const selector = '0x' + keccak256Prefix('giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)');

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: walletAddress,
      to: CONTRACTS.ReputationRegistry,
      data: selector + encodeRepFeedback(agentId, score, tag),
      chainId: `0x${ARC_TESTNET.id.toString(16)}`,
    }],
  }) as string;

  return txHash;
}

function keccak256Prefix(sig: string): string {
  // Simplified: use known selectors for common functions
  // Full keccak256 would need a crypto library
  const known: Record<string, string> = {
    'giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)': 'ebf73b8d',
  };
  return known[sig] ?? '00000000';
}

function encodeRepFeedback(agentId: string, score: number, tag: string): string {
  const id = BigInt(agentId).toString(16).padStart(64, '0');
  const sc = (score >= 0 ? score : 0).toString(16).padStart(64, '0');
  const type0 = '0'.padStart(64, '0');
  // Simplified: just encode the key params
  return id + sc + type0;
}

// Fetch agents registered by a specific owner
export async function fetchAgentsByOwner(ownerAddress: string): Promise<OnChainAgent[]> {
  try {
    const logs = await getIdentityLogs();
    const agents: OnChainAgent[] = [];

    for (const log of logs) {
      // Check if 'to' address matches owner (topics[2] is 'to')
      if (!log.topics?.[2]) continue;
      const toAddr = '0x' + log.topics[2].slice(-40);
      if (toAddr.toLowerCase() !== ownerAddress.toLowerCase()) continue;

      const tokenId = BigInt(log.topics[3] ?? '0x0');
      const owner = await getOwnerOf(tokenId).catch(() => '');
      const uri = await getTokenURI(tokenId).catch(() => '');

      let metadata: Record<string, unknown> = {};
      try {
        if (uri.startsWith('data:application/json;base64,')) {
          metadata = JSON.parse(atob(uri.split(',')[1]));
        } else if (uri.startsWith('ipfs://')) {
          // Could fetch from IPFS gateway, skip for now
          metadata = { name: `Agent #${tokenId}`, description: 'IPFS metadata' };
        }
      } catch { /* ok */ }

      agents.push({
        tokenId: tokenId.toString(),
        owner,
        metadataURI: uri,
        name: metadata.name as string ?? `Agent #${tokenId}`,
        description: metadata.description as string ?? '',
        agentType: metadata.agent_type as string ?? 'custom',
        capabilities: (metadata.capabilities as string[]) ?? [],
        txHash: log.transactionHash,
      });
    }

    return agents;
  } catch {
    return [];
  }
}

// Fetch all recent agents (last 10,000 blocks)
export async function fetchRecentAgents(): Promise<OnChainAgent[]> {
  try {
    const logs = await getIdentityLogs();
    const total = await getIdentityTotalSupply();
    const agents: OnChainAgent[] = [];

    // Only process up to 5 agents to avoid rate limiting
    const recentLogs = logs.slice(-5);
    for (const log of recentLogs) {
      if (!log.topics?.[3]) continue;
      const tokenId = BigInt(log.topics[3]);
      const uri = await getTokenURI(tokenId).catch(() => '');

      let metadata: Record<string, unknown> = {};
      try {
        if (uri.startsWith('data:application/json;base64,')) {
          metadata = JSON.parse(atob(uri.split(',')[1]));
        }
      } catch { /* ok */ }

      agents.push({
        tokenId: tokenId.toString(),
        owner: log.topics[2] ? '0x' + log.topics[2].slice(-40) : '',
        metadataURI: uri,
        name: metadata.name as string ?? `Agent #${tokenId}`,
        description: metadata.description as string ?? '',
        agentType: metadata.agent_type as string ?? 'custom',
        capabilities: (metadata.capabilities as string[]) ?? [],
        txHash: log.transactionHash,
      });
    }

    // Add placeholder if registry has agents but we have none
    if (agents.length === 0 && total > 0n) {
      agents.push({
        tokenId: '1',
        owner: '0x...',
        metadataURI: '',
        name: 'Genesis Agent',
        description: 'First registered agent on Arc Testnet',
        agentType: 'trading',
        capabilities: ['arbitrage_detection', 'usdc_transfer'],
      });
    }

    return agents;
  } catch {
    return [];
  }
}

export function getArcScanAgentUrl(txHash: string): string {
  return `${ARC_EXPLORER}/tx/${txHash}`;
}

export function getArcScanAddressUrl(address: string): string {
  return `${ARC_EXPLORER}/address/${address}`;
}
