import React from 'react';
import { useWallet } from '../context/WalletContext.jsx';

function shortenAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletButton() {
  const { address, isConnected, connecting, connect, disconnect, network, balance, error } = useWallet();

  if (!isConnected) {
    return (
      <div>
        <button className="btn btn-primary rounded-pill px-3" onClick={connect} disabled={connecting}>
          {connecting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Connecting...
            </>
          ) : (
            <>
              <i className="bi bi-wallet2 me-2" />
              Connect Wallet
            </>
          )}
        </button>
        {error && <div className="text-danger small mt-1" style={{ maxWidth: 220 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-primary rounded-pill px-3 dropdown-toggle d-flex align-items-center gap-2"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span className="ca-avatar-gradient" style={{ width: 24, height: 24, fontSize: 11 }}>
          {address.slice(2, 4).toUpperCase()}
        </span>
        {shortenAddress(address)}
      </button>
      <ul className="dropdown-menu dropdown-menu-end shadow">
        <li className="px-3 py-2">
          <div className="small text-muted">Network</div>
          <div className="fw-semibold">{network?.name || 'Unknown'}</div>
        </li>
        <li className="px-3 py-2">
          <div className="small text-muted">Balance</div>
          <div className="fw-semibold">{balance ? `${Number(balance).toFixed(4)} ETH` : '—'}</div>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button className="dropdown-item text-danger" onClick={disconnect}>
            <i className="bi bi-box-arrow-right me-2" />
            Disconnect
          </button>
        </li>
      </ul>
    </div>
  );
}
