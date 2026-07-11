import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext.jsx';
import { useVerifiedReports } from '../hooks/useVerifiedReports.js';
import { useUserData } from '../context/UserDataContext.jsx';
import VerifiedBadge from '../components/VerifiedBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { ipfsUrl } from '../services/ipfsService.js';

function shortenAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function VerifiedReports() {
  const { isConnected, connect, address } = useWallet();
  const { reports, loading, submitting, error, fetchReports, submitReport, upvote, flag } = useVerifiedReports();
  const { recordMyReport } = useUserData();

  const [form, setForm] = useState({ productId: '', productName: '', content: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.productName || !form.content) return;
    try {
      const { txHash, ipfsCid } = await submitReport(form);
      recordMyReport({ ...form, txHash, ipfsCid, timestamp: Date.now() });
      setForm({ productId: '', productName: '', content: '' });
      setShowForm(false);
    } catch {
      // error toast already shown by the hook
    }
  };

  return (
    <div className="container ca-section">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Community Verified Reports</h1>
          <p className="text-muted small mb-0">Immutable, blockchain-timestamped submissions from the community</p>
        </div>
        {isConnected ? (
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            <i className="bi bi-plus-lg me-1" /> Submit a Report
          </button>
        ) : (
          <button className="btn btn-outline-primary" onClick={connect}>
            <i className="bi bi-wallet2 me-1" /> Connect Wallet to Submit
          </button>
        )}
      </div>

      {showForm && (
        <div className="card ca-card mb-4">
          <div className="card-body">
            <h6 className="fw-semibold mb-3">New Verified Report</h6>
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small">Product ID (e.g. PubChem CID, barcode)</label>
                  <input
                    className="form-control"
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Product Name</label>
                  <input
                    className="form-control"
                    value={form.productName}
                    onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small">Report Content</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="e.g. Contains Acetaminophen 500mg. Verified against manufacturer label..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Submitting to blockchain...</>
                  ) : (
                    'Submit Report'
                  )}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
              <p className="small text-muted mt-2 mb-0">
                Submitted by <strong>{shortenAddress(address)}</strong>. Full content is pinned to IPFS;
                only its hash and CID are stored on-chain.
              </p>
            </form>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <LoadingSpinner label="Reading reports from the blockchain..." />
      ) : reports.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-clipboard-x display-4 d-block mb-3" />
          No reports submitted yet. Be the first to contribute.
        </div>
      ) : (
        <div className="row g-3">
          {reports.map((r) => (
            <div className="col-12 col-md-6" key={r.id}>
              <div className="card ca-card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-semibold mb-0">{r.productName}</h6>
                    <VerifiedBadge txHash={null} size="sm" />
                  </div>
                  <p className="text-muted small mb-2">Product ID: {r.productId}</p>
                  <div className="d-flex flex-wrap gap-3 small text-muted mb-3">
                    <span><i className="bi bi-person-circle me-1" />{shortenAddress(r.submitter)}</span>
                    <span><i className="bi bi-clock me-1" />{new Date(r.timestamp).toLocaleString()}</span>
                  </div>
                  {r.ipfsCid && (
                    <a href={ipfsUrl(r.ipfsCid)} target="_blank" rel="noreferrer" className="small mb-3 d-inline-block">
                      <i className="bi bi-box-seam me-1" /> View full report on IPFS
                    </a>
                  )}
                  <div className="mt-auto d-flex gap-2">
                    <button className="btn btn-sm btn-outline-success" onClick={() => upvote(r.id)}>
                      <i className="bi bi-hand-thumbs-up me-1" /> {r.upvotes}
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => flag(r.id, 'Flagged by community')}>
                      <i className="bi bi-flag me-1" /> {r.flags}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
