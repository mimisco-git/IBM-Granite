import { useState, useCallback, useEffect } from 'react';
import { WalletState } from '../types';
import { ARC_TESTNET } from '../constants';
import { getUSDCBalance, getEURCBalance } from '../services/arcService';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

const ARC_CHAIN_PARAMS = {
  chainId: `0x${ARC_TESTNET.id.toString(16)}`,
  chainName: ARC_TESTNET.name,
  nativeCurrency: ARC_TESTNET.nativeCurrency,
  rpcUrls: [ARC_TESTNET.rpcUrls.default.http[0]],
  blockExplorerUrls: [ARC_TESTNET.blockExplorers.default.url],
};

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    usdcBalance: null,
    eurcBalance: null,
    error: null,
  });

  const fetchBalances = useCallback(async (address: string) => {
    try {
      const [usdc, eurc] = await Promise.all([
        getUSDCBalance(address),
        getEURCBalance(address),
      ]);
      setState(s => ({ ...s, usdcBalance: usdc, eurcBalance: eurc }));
    } catch {
      // balances might fail if Arc is down
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState(s => ({ ...s, error: 'MetaMask not found. Install MetaMask to connect.' }));
      return;
    }

    setState(s => ({ ...s, isConnecting: true, error: null }));
    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      const address = accounts[0];

      // Switch to Arc Testnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ARC_CHAIN_PARAMS.chainId }],
        });
      } catch (switchError: unknown) {
        // Chain not added yet: add it
        if ((switchError as { code?: number })?.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ARC_CHAIN_PARAMS],
          });
        } else {
          throw switchError;
        }
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;

      setState(s => ({
        ...s,
        address,
        chainId: parseInt(chainId, 16),
        isConnected: true,
        isConnecting: false,
        error: null,
      }));

      await fetchBalances(address);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setState(s => ({ ...s, isConnecting: false, error: message }));
    }
  }, [fetchBalances]);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      usdcBalance: null,
      eurcBalance: null,
      error: null,
    });
  }, []);

  const switchToArc = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_CHAIN_PARAMS.chainId }],
      });
    } catch {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ARC_CHAIN_PARAMS],
      });
    }
  }, []);

  // Send a raw transaction via MetaMask
  const sendTransaction = useCallback(async (tx: {
    to: string; data?: string; value?: string;
  }): Promise<string> => {
    if (!window.ethereum || !state.address) throw new Error('Not connected');
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: state.address,
        to: tx.to,
        data: tx.data ?? '0x',
        value: tx.value ?? '0x0',
        chainId: `0x${ARC_TESTNET.id.toString(16)}`,
      }],
    }) as string;
    return txHash;
  }, [state.address]);

  // Refresh balances
  const refreshBalances = useCallback(() => {
    if (state.address) fetchBalances(state.address);
  }, [state.address, fetchBalances]);

  // Listen to MetaMask events
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        disconnect();
      } else {
        setState(s => ({ ...s, address: accs[0] }));
        fetchBalances(accs[0]);
      }
    };

    const handleChainChanged = (chainId: unknown) => {
      setState(s => ({ ...s, chainId: parseInt(chainId as string, 16) }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect, fetchBalances]);

  // Auto-connect if already authorized
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts) => {
        const accs = accounts as string[];
        if (accs.length > 0) {
          setState(s => ({ ...s, address: accs[0], isConnected: true }));
          fetchBalances(accs[0]);
        }
      })
      .catch(() => { /* not connected */ });
  }, [fetchBalances]);

  const isOnArc = state.chainId === ARC_TESTNET.id;

  return {
    ...state,
    isOnArc,
    connect,
    disconnect,
    switchToArc,
    sendTransaction,
    refreshBalances,
    shortAddress: state.address
      ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
      : null,
  };
}
