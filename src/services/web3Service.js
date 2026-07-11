import { BrowserProvider, Contract, formatEther, keccak256, toUtf8Bytes } from 'ethers';
import ChemAwareRegistryAbi from '../contracts/ChemAwareRegistry.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

const CHAIN_LABELS = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia Testnet',
  31337: 'Hardhat Local',
  1337: 'Localhost',
};

/**
 * Thin wrapper around window.ethereum + ethers.js.
 * Every function here is defensive: if MetaMask isn't installed, or the
 * contract address isn't configured yet, callers get a clear error instead
 * of a silent crash, so the rest of the UI can degrade gracefully.
 */

export function isMetaMaskInstalled() {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
}

export async function getProvider() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install it from metamask.io');
  }
  return new BrowserProvider(window.ethereum);
}

export async function requestAccounts() {
  const provider = await getProvider();
  const accounts = await provider.send('eth_requestAccounts', []);
  return accounts;
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function getNetworkInfo() {
  const provider = await getProvider();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  return {
    chainId,
    name: CHAIN_LABELS[chainId] || network.name || `Chain ${chainId}`,
  };
}

export async function getBalance(address) {
  const provider = await getProvider();
  const balanceWei = await provider.getBalance(address);
  return formatEther(balanceWei);
}

export function getContract(signerOrProvider) {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      'Contract address is not configured. Set VITE_CONTRACT_ADDRESS after running the deploy script.'
    );
  }
  return new Contract(CONTRACT_ADDRESS, ChemAwareRegistryAbi.abi, signerOrProvider);
}

/**
 * Hashes a report's JSON content so only the hash (not the raw content)
 * goes on-chain. The full content is meant to be pinned to IPFS separately;
 * see ipfsService.js.
 */
export function hashReport(reportObject) {
  const json = JSON.stringify(reportObject);
  return keccak256(toUtf8Bytes(json));
}

/**
 * Submits a verified report on-chain: productId, productName, report hash,
 * and the IPFS CID pointing to the full report content.
 */
export async function submitReportOnChain({ productId, productName, reportHash, ipfsCid }) {
  const signer = await getSigner();
  const contract = getContract(signer);
  const tx = await contract.submitReport(productId, productName, reportHash, ipfsCid);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

export async function upvoteReportOnChain(reportId) {
  const signer = await getSigner();
  const contract = getContract(signer);
  const tx = await contract.upvoteReport(reportId);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

export async function flagReportOnChain(reportId, reason) {
  const signer = await getSigner();
  const contract = getContract(signer);
  const tx = await contract.flagReport(reportId, reason);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

export async function getReportCount() {
  const provider = await getProvider();
  const contract = getContract(provider);
  const count = await contract.getReportCount();
  return Number(count);
}

export async function getReportByIndex(index) {
  const provider = await getProvider();
  const contract = getContract(provider);
  const r = await contract.getReport(index);
  return {
    id: index,
    productId: r.productId,
    productName: r.productName,
    reportHash: r.reportHash,
    ipfsCid: r.ipfsCid,
    submitter: r.submitter,
    timestamp: Number(r.timestamp) * 1000,
    upvotes: Number(r.upvotes),
    flags: Number(r.flags),
  };
}

export async function getAllReports() {
  const count = await getReportCount();
  const reports = [];
  for (let i = 0; i < count; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    reports.push(await getReportByIndex(i));
  }
  return reports.reverse(); // newest first
}

export function subscribeToAccountChanges(callback) {
  if (!isMetaMaskInstalled()) return () => {};
  window.ethereum.on('accountsChanged', callback);
  return () => window.ethereum.removeListener('accountsChanged', callback);
}

export function subscribeToChainChanges(callback) {
  if (!isMetaMaskInstalled()) return () => {};
  window.ethereum.on('chainChanged', callback);
  return () => window.ethereum.removeListener('chainChanged', callback);
}
