import { BrowserProvider, Contract, formatEther, keccak256, toUtf8Bytes } from 'ethers';
import ChemAwareRegistryAbi from '../contracts/ChemAwareRegistry.json';

const CONTRACT_ADDRESS = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTRACT_ADDRESS) || '';

const CHAIN_LABELS = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia Testnet',
  31337: 'Hardhat Local',
  1337: 'Localhost',
};

const LOCAL_REPORTS_KEY = 'chemaware:local_reports';

const SEED_REPORTS = [
  {
    id: 'seed-1',
    productId: '54670067',
    productName: 'Vitamin C (Ascorbic Acid) Chewables',
    reportHash: '0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b',
    ipfsCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    submitter: '0x71C836466a72C420423737734f0bd1AE38E439A2',
    timestamp: Date.now() - 3600000 * 24 * 2,
    upvotes: 18,
    flags: 0,
    txHash: '0x8f2b3a1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
    content: 'Laboratory HPLC analysis verified ascorbic acid purity at 99.4%. Excipients confirmed: microcrystalline cellulose and vegetable magnesium stearate.',
  },
  {
    id: 'seed-2',
    productId: '1983',
    productName: 'Paracetamol 500mg Extra Relief',
    reportHash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    ipfsCid: 'bafybeicg4f6vd5y2d7jgt7m42uh7y26nf3efuylqabf3oclgtqy12fbzfe',
    submitter: '0x34B219808383a1c93847384729384729384788F1',
    timestamp: Date.now() - 3600000 * 24 * 5,
    upvotes: 31,
    flags: 1,
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    content: 'Cross-checked active ingredient with OpenFDA monograph. Inactive binders: Microcrystalline cellulose, magnesium stearate.',
  },
  {
    id: 'seed-3',
    productId: '6111246721278',
    productName: 'Cream Cheese Traditional',
    reportHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    ipfsCid: 'bafybeih5f6vd5y2d7jgt7m42uh7y26nf3efuylqabf3oclgtqy99fbzab',
    submitter: '0x99D10472938472938472938472938472938411E4',
    timestamp: Date.now() - 3600000 * 24 * 8,
    upvotes: 12,
    flags: 0,
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    content: 'Verified ingredients: Pasteurized cow milk, lactic ferments (C3H6O3), rennet, and salt (NaCl). Free of artificial stabilizers.',
  },
];

export function isMetaMaskInstalled() {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
}

export function isContractConfigured() {
  return Boolean(CONTRACT_ADDRESS);
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

export function hashReport(reportObject) {
  const json = JSON.stringify(reportObject);
  return keccak256(toUtf8Bytes(json));
}

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

function getStoredLocalReports() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function submitLocalReport({ productId, productName, content, ipfsCid, reportHash, submitter = '0x12aF...9e2B' }) {
  const stored = getStoredLocalReports();
  const newReport = {
    id: `local-${Date.now()}`,
    productId,
    productName,
    content,
    reportHash,
    ipfsCid,
    submitter,
    timestamp: Date.now(),
    upvotes: 1,
    flags: 0,
    txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
  };

  const updated = [newReport, ...stored];
  localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(updated));
  return newReport;
}

export function upvoteLocalReport(reportId) {
  const stored = getStoredLocalReports();
  const updated = stored.map((r) => (r.id === reportId ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r));
  localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(updated));
}

export function flagLocalReport(reportId) {
  const stored = getStoredLocalReports();
  const updated = stored.map((r) => (r.id === reportId ? { ...r, flags: (r.flags || 0) + 1 } : r));
  localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(updated));
}

/**
 * Loads reports: attempts on-chain query if contract & MetaMask are active,
 * otherwise returns local demo & community reports seamlessly.
 */
export async function getAllReports() {
  if (isMetaMaskInstalled() && CONTRACT_ADDRESS) {
    try {
      const count = await getReportCount();
      const onChain = [];
      for (let i = 0; i < count; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        onChain.push(await getReportByIndex(i));
      }
      if (onChain.length > 0) {
        return onChain.reverse();
      }
    } catch (err) {
      console.warn('[web3Service] Failed to read on-chain reports, showing local/demo reports:', err?.message);
    }
  }

  // Fallback to local stored reports + curated seed reports
  const local = getStoredLocalReports();
  return [...local, ...SEED_REPORTS];
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
