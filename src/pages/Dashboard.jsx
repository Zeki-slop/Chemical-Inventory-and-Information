import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext.jsx';
import { useUserData } from '../context/UserDataContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

function shortenAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Dashboard() {
  const { isConnected, connect, address, network, balance } = useWallet();
  const { favorites, searchHistory, myReports, clearSearchHistory } = useUserData();

  if (!isConnected) {
    return (
      <div className="container ca-section text-center">
        <i className="bi bi-wallet2 display-3 text-primary mb-3 d-block" />
        <h2 className="h4 fw-bold mb-2">Connect your wallet to view your dashboard</h2>
        <p className="text-muted mb-4">Track your submitted reports, favorites, search history, and reputation.</p>
        <button className="btn btn-primary btn-lg" onClick={connect}>Connect Wallet</button>
      </div>
    );
  }

  const reputationScore = Math.min(100, myReports.length * 15 + favorites.length * 2);

  return (
    <div className="container ca-section">
      <h1 className="h4 fw-bold mb-4">Your Dashboard</h1>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="ca-card p-3 h-100">
            <div className="text-muted small mb-1">Wallet</div>
            <div className="fw-semibold text-truncate">{shortenAddress(address)}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="ca-card p-3 h-100">
            <div className="text-muted small mb-1">Network</div>
            <div className="fw-semibold">{network?.name || '—'}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="ca-card p-3 h-100">
            <div className="text-muted small mb-1">Balance</div>
            <div className="fw-semibold">{balance ? `${Number(balance).toFixed(4)} ETH` : '—'}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="ca-card p-3 h-100">
            <div className="text-muted small mb-1">Reputation Score</div>
            <div className="fw-semibold">{reputationScore}/100</div>
            <div className="progress mt-2" style={{ height: 6 }}>
              <div className="progress-bar" style={{ width: `${reputationScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="ca-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold mb-0">Submitted Reports ({myReports.length})</h6>
              <Link to="/reports" className="small">View all →</Link>
            </div>
            {myReports.length === 0 ? (
              <p className="text-muted small mb-0">You haven't submitted any reports yet.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {myReports.slice(0, 5).map((r, i) => (
                  <li key={i} className="list-group-item px-0">
                    <div className="fw-semibold small">{r.productName}</div>
                    <div className="text-muted small">{new Date(r.timestamp).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="ca-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold mb-0">Search History</h6>
              {searchHistory.length > 0 && (
                <button className="btn btn-sm btn-link text-decoration-none" onClick={clearSearchHistory}>Clear</button>
              )}
            </div>
            {searchHistory.length === 0 ? (
              <p className="text-muted small mb-0">No recent searches.</p>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {searchHistory.map((term) => (
                  <Link key={term} to={`/search?q=${encodeURIComponent(term)}`} className="badge text-bg-light border text-decoration-none">
                    {term}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <h6 className="fw-semibold mt-5 mb-3">Favorite Products ({favorites.length})</h6>
      {favorites.length === 0 ? (
        <p className="text-muted small">You haven't favorited any products yet.</p>
      ) : (
        <div className="row g-4">
          {favorites.map((p) => <ProductCard key={`${p.source}-${p.id}`} product={p} />)}
        </div>
      )}
    </div>
  );
}
