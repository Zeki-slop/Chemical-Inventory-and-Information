import axios from 'axios';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
const PINATA_PIN_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

/**
 * Pins a JSON report to IPFS via Pinata and returns the CID.
 * Only the CID + a keccak256 hash of this same object are ever written
 * on-chain (see web3Service.hashReport) — the full content lives on IPFS,
 * keeping gas costs low while still being publicly verifiable.
 *
 * If no Pinata credentials are configured, falls back to a local mock CID
 * so the rest of the app (and local development/demoing) still works.
 */
export async function pinReportToIpfs(reportObject) {
  if (!PINATA_JWT) {
    console.warn('[ipfsService] No VITE_PINATA_JWT set — using mock CID for local dev.');
    return mockCid(reportObject);
  }

  try {
    const { data } = await axios.post(PINATA_PIN_URL, reportObject, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
    });
    return data.IpfsHash;
  } catch (err) {
    console.error('[ipfsService] Pinata pin failed, falling back to mock CID', err);
    return mockCid(reportObject);
  }
}

export function ipfsUrl(cid) {
  if (!cid) return '';
  return `${PINATA_GATEWAY}${cid}`;
}

function mockCid(reportObject) {
  // Deterministic-looking pseudo CID for offline/demo use only — NOT a real IPFS hash.
  const str = JSON.stringify(reportObject);
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `bafy-mock-${Math.abs(hash)}`;
}
