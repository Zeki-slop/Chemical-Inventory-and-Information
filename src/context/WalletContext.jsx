import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  isMetaMaskInstalled,
  requestAccounts,
  getNetworkInfo,
  getBalance,
  subscribeToAccountChanges,
  subscribeToChainChanges,
} from '../services/web3Service.js';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const refreshWalletData = useCallback(async (addr) => {
    try {
      const [net, bal] = await Promise.all([getNetworkInfo(), getBalance(addr)]);
      setNetwork(net);
      setBalance(bal);
    } catch (err) {
      console.error('[WalletContext] Failed to refresh wallet data', err);
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install the browser extension from metamask.io.');
      return;
    }
    setConnecting(true);
    try {
      const accounts = await requestAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts returned by MetaMask.');
      }
      setAddress(accounts[0]);
      await refreshWalletData(accounts[0]);
    } catch (err) {
      setError(err?.message || 'Failed to connect wallet.');
    } finally {
      setConnecting(false);
    }
  }, [refreshWalletData]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setNetwork(null);
    setBalance(null);
  }, []);

  useEffect(() => {
    const unsubAccounts = subscribeToAccountChanges((accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        refreshWalletData(accounts[0]);
      }
    });
    const unsubChain = subscribeToChainChanges(() => {
      if (address) refreshWalletData(address);
    });
    return () => {
      unsubAccounts();
      unsubChain();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const value = {
    address,
    isConnected: Boolean(address),
    network,
    balance,
    connecting,
    error,
    connect,
    disconnect,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
