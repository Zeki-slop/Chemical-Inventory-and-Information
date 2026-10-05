import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext.jsx';
import { useVerifiedReports } from '../hooks/useVerifiedReports.js';
import { useUserData } from '../context/UserDataContext.jsx';
import VerifiedBadge from '../components/VerifiedBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { ipfsUrl } from '../services/ipfsService.js';
import { isMetaMaskInstalled } from '../services/web3Service.js';

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
      const { txHash, ipfsCid } = await submitReport(form, address);
      recordMyReport({ ...form, txHash, ipfsCid, timestamp: Date.now() });
      setForm({ productId: '', productName: '', content: '' });
      setShowForm(false);
    } catch {
      // error toast already shown by the hook
    }
  };

  const hasMetaMask = isMetaMaskInstalled();

  return (
    <div className="container ca-section">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Community Verified Reports</h1>
          <p className="text-muted small mb-0">Immutable, blockchain-timestamped submissions from the community</p>
        </div>
        <div className="d-flex gap-2">
          {isConnected ? (
            <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
              <i className="bi bi-plus-lg me-1" /> Submit a Report
            </button>
          ) : hasMetaMask ? (
            <button className="btn btn-primary" onClick={connect}>
              <i className="bi bi-wallet2 me-1" /> Connect Wallet to Submit
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
              <i className="bi bi-plus-lg me-1" /> Submit Report (Demo Mode)
            </button>
          )}
        </div>
      </div>

      {!hasMetaMask && (
        <div className="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-0 shadow-sm" style={{ background: 'rgba(13, 110, 253, 0.08)' }}>
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-info-circle-fill text-primary fs-4" />
            <div>
              <div className="fw-semibold">Viewing in Read-Only Community Mode</div>
              <small className="text-muted">
                MetaMask is not detected in your browser. You can browse all verified community reports or test submissions in demo mode.
              </small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-primary"
            >
              <i className="bi bi-download me-1" /> Install MetaMask
            </a>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card ca-card mb-4 shadow-sm border-primary">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold mb-0">New Verified Report</h6>
              {!hasMetaMask && (
                <span className="badge text-bg-warning-subtle text-warning-emphasis">
                  Demo Submission Mode
                </span>
              )}
            </div>
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Product ID (e.g. PubChem CID, barcode)</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 1983 or 6111246721278"
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Product Name</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Paracetamol 500mg"
                    value={form.productName}
                    onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">Report Content & Evidence</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe laboratory findings, active compound verification, or label cross-check..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Submitting report...</>
                  ) : (
                    'Submit Report'
                  )}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
              <p className="small text-muted mt-2 mb-0">
                Submitted by <strong>{shortenAddress(address || '0x71C8364...39A2')}</strong>. Full report is pinned to IPFS and its cryptographic hash is verified on the blockchain registry.
              </p>
            </form>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <LoadingSpinner label="Reading verified reports..." />
      ) : reports.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-clipboard-x display-4 d-block mb-3" />
          No reports submitted yet. Be the first to contribute.
        </div>
      ) : (
        <div className="row g-3">
          {reports.map((r) => (
            <div className="col-12 col-md-6" key={r.id}>
              <div className="card ca-card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-semibold mb-0 text-truncate me-2">{r.productName}</h6>
                    <VerifiedBadge txHash={r.txHash} size="sm" />
                  </div>
                  <p className="text-muted small mb-2">Product ID: {r.productId}</p>
                  {r.content && (
                    <p className="small text-secondary mb-3 flex-grow-1" style={{ whiteSpace: 'pre-line' }}>
                      {r.content}
                    </p>
                  )}
                  <div className="d-flex flex-wrap gap-3 small text-muted mb-3 border-top pt-2">
                    <span><i className="bi bi-person-circle me-1" />{shortenAddress(r.submitter)}</span>
                    <span><i className="bi bi-clock me-1" />{new Date(r.timestamp).toLocaleDateString()}</span>
                  </div>
                  {r.ipfsCid && (
                    <a href={ipfsUrl(r.ipfsCid)} target="_blank" rel="noreferrer" className="small mb-3 d-inline-block text-truncate">
                      <i className="bi bi-box-seam me-1" /> IPFS: {r.ipfsCid.slice(0, 18)}...
                    </a>
                  )}
                  <div className="mt-auto d-flex gap-2">
                    <button className="btn btn-sm btn-outline-success" onClick={() => upvote(r.id)} type="button">
                      <i className="bi bi-hand-thumbs-up me-1" /> {r.upvotes || 0}
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => flag(r.id, 'Flagged by community')} type="button">
                      <i className="bi bi-flag me-1" /> {r.flags || 0}
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
