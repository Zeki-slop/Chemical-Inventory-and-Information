import React from 'react';

export default function VerifiedBadge({ txHash, size = 'md' }) {
  const explorerUrl = txHash ? `https://sepolia.etherscan.io/tx/${txHash}` : null;
  const content = (
    <span className={`ca-badge-verified d-inline-flex align-items-center gap-1 ${size === 'sm' ? 'py-1 px-2' : ''}`}>
      <i className="bi bi-patch-check-fill" />
      Verified on Blockchain
    </span>
  );

  if (!explorerUrl) return content;

  return (
    <a href={explorerUrl} target="_blank" rel="noreferrer" className="text-decoration-none" title={txHash}>
      {content}
    </a>
  );
}
