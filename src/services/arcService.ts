import { ARC_RPC, CONTRACTS } from '../constants';

// Direct JSON-RPC call to Arc Testnet
async function rpc(method: string, params: unknown[] = []) {
  const t0 = Date.now();
  const res = await fetch(ARC_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const data = await res.json();
  const latency = Date.now() - t0;
  if (data.error) throw new Error(data.error.message);
  return { result: data.result, latency };
}

export async function getBlockNumber(): Promise<{ blockNumber: bigint; latency: number }> {
  const { result, latency } = await rpc('eth_blockNumber');
  return { blockNumber: BigInt(result), latency };
}

export async function getGasPrice(): Promise<string> {
  const { result } = await rpc('eth_gasPrice');
  // Arc uses USDC for gas. Convert from wei-like units to USDC (6 decimals)
  const raw = BigInt(result);
  const usdc = Number(raw) / 1e6;
  return usdc.toFixed(8);
}

export async function getNativeBalance(address: string): Promise<string> {
  // On Arc, native balance IS USDC (18 decimal precision internally)
  const { result } = await rpc('eth_getBalance', [address, 'latest']);
  const raw = BigInt(result);
  // Native USDC uses 18 decimals internally
  const usdc = Number(raw) / 1e18;
  return usdc.toFixed(6);
}

// ERC-20 balanceOf call via eth_call
export async function getERC20Balance(tokenAddress: string, walletAddress: string): Promise<string> {
  // balanceOf(address) = 0x70a08231 + padded address
  const paddedAddr = walletAddress.slice(2).padStart(64, '0');
  const data = '0x70a08231' + paddedAddr;
  const { result } = await rpc('eth_call', [
    { to: tokenAddress, data },
    'latest',
  ]);
  if (!result || result === '0x') return '0.000000';
  const raw = BigInt(result);
  // ERC-20 USDC interface uses 6 decimals on Arc
  const value = Number(raw) / 1e6;
  return value.toFixed(6);
}

export async function getUSDCBalance(address: string): Promise<string> {
  try {
    // Try native balance first (Arc native USDC)
    return await getNativeBalance(address);
  } catch {
    return '0.000000';
  }
}

export async function getEURCBalance(address: string): Promise<string> {
  try {
    return await getERC20Balance(CONTRACTS.EURC, address);
  } catch {
    return '0.000000';
  }
}

export async function getBlock(blockNumber: string | 'latest' = 'latest') {
  const { result } = await rpc('eth_getBlockByNumber', [
    blockNumber === 'latest' ? 'latest' : `0x${Number(blockNumber).toString(16)}`,
    false
  ]);
  return result;
}

export async function getTransaction(hash: string) {
  const { result } = await rpc('eth_getTransactionByHash', [hash]);
  return result;
}

export async function getTransactionReceipt(hash: string) {
  const { result } = await rpc('eth_getTransactionReceipt', [hash]);
  return result;
}

// Estimate TPS from recent block
export async function estimateTPS(): Promise<number> {
  try {
    const latest = await getBlock('latest');
    if (!latest) return 0;
    const txCount = latest.transactions?.length ?? 0;
    // Arc has sub-second finality, so approx ~800ms per block
    return Math.round(txCount / 0.8);
  } catch {
    return 0;
  }
}

// Get logs from ERC-8004 IdentityRegistry
export async function getIdentityLogs(fromBlock?: bigint, toBlock?: bigint) {
  const { result: latest } = await rpc('eth_blockNumber');
  const latestNum = BigInt(latest);
  const from = fromBlock ?? (latestNum > 10000n ? latestNum - 10000n : 0n);
  const to = toBlock ?? latestNum;

  const { result } = await rpc('eth_getLogs', [{
    address: CONTRACTS.IdentityRegistry,
    fromBlock: `0x${from.toString(16)}`,
    toBlock: `0x${to.toString(16)}`,
    topics: [
      // Transfer(address,address,uint256) event topic
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    ],
  }]);
  return result ?? [];
}

// Read tokenURI from IdentityRegistry
export async function getTokenURI(tokenId: bigint): Promise<string> {
  // tokenURI(uint256) = 0xc87b56dd + padded tokenId
  const paddedId = tokenId.toString(16).padStart(64, '0');
  const data = '0xc87b56dd' + paddedId;
  const { result } = await rpc('eth_call', [
    { to: CONTRACTS.IdentityRegistry, data },
    'latest',
  ]);
  if (!result || result === '0x') return '';
  // Decode ABI-encoded string
  try {
    // result is ABI-encoded: offset (32 bytes) + length (32 bytes) + data
    const hex = result.slice(2);
    const offset = parseInt(hex.slice(0, 64), 16) * 2;
    const length = parseInt(hex.slice(offset, offset + 64), 16);
    const strHex = hex.slice(offset + 64, offset + 64 + length * 2);
    let str = '';
    for (let i = 0; i < strHex.length; i += 2) {
      str += String.fromCharCode(parseInt(strHex.slice(i, i + 2), 16));
    }
    return str;
  } catch {
    return '';
  }
}

// Read ownerOf from IdentityRegistry
export async function getOwnerOf(tokenId: bigint): Promise<string> {
  const paddedId = tokenId.toString(16).padStart(64, '0');
  const data = '0x6352211e' + paddedId; // ownerOf(uint256)
  const { result } = await rpc('eth_call', [
    { to: CONTRACTS.IdentityRegistry, data },
    'latest',
  ]);
  if (!result || result === '0x') return '';
  return '0x' + result.slice(-40);
}

// Get total supply of identity tokens
export async function getIdentityTotalSupply(): Promise<bigint> {
  const data = '0x18160ddd'; // totalSupply()
  try {
    const { result } = await rpc('eth_call', [
      { to: CONTRACTS.IdentityRegistry, data },
      'latest',
    ]);
    if (!result || result === '0x') return 0n;
    return BigInt(result);
  } catch {
    return 0n;
  }
}

// Get Arc network status
export async function getNetworkStatus() {
  try {
    const [blockResult, tps] = await Promise.all([
      getBlockNumber(),
      estimateTPS(),
    ]);
    let gasPrice = '0.000001';
    try { gasPrice = await getGasPrice(); } catch { /* ok */ }
    return {
      blockNumber: blockResult.blockNumber,
      latency: blockResult.latency,
      gasPrice,
      tps,
      isConnected: true,
    };
  } catch {
    return {
      blockNumber: null,
      latency: null,
      gasPrice: null,
      tps: null,
      isConnected: false,
    };
  }
}
