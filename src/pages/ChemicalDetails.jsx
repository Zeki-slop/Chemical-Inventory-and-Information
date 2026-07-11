import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDetailsFor } from '../services/api.js';
import { computeSafetyScore, safetyBadgeVariant } from '../utils/safetyScore.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useUserData } from '../context/UserDataContext.jsx';
import { downloadProductReportPdf } from '../utils/pdfReport.js';
import QRCode from 'qrcode.react';

function ListSection({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-3">
      <h6 className="fw-semibold">{title}</h6>
      <ul className="mb-0">
        {items.map((t, i) => <li key={i} className="text-muted small">{t}</li>)}
      </ul>
    </div>
  );
}

export default function ChemicalDetails() {
  const { source, id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toggleFavorite, isFavorite } = useUserData();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDetailsFor(source, id);
        if (!cancelled) setItem(data);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Could not load details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [source, id]);

  if (loading) return <LoadingSpinner label="Fetching chemical data..." />;
  if (error) return <div className="container ca-section"><div className="alert alert-danger">{error}</div></div>;
  if (!item) return null;

  const safety = item.safetyScore || computeSafetyScore(item);
  const variant = safetyBadgeVariant(safety.level);
  const favorite = isFavorite(item.id, item.source);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="container ca-section">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 className="h3 fw-bold mb-1">{item.name}</h1>
              <p className="text-muted mb-0">{item.iupacName || item.manufacturer || item.categories}</p>
            </div>
            <button className="btn btn-outline-secondary" onClick={() => toggleFavorite(item)}>
              <i className={`bi ${favorite ? 'bi-heart-fill text-danger' : 'bi-heart'}`} />
            </button>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <span className={`badge text-bg-${variant} fs-6`}>Safety Score: {safety.score}/100 ({safety.level})</span>
            {item.casNumber && <span className="badge text-bg-light border">CAS: {item.casNumber}</span>}
            {item.molecularFormula && <span className="badge text-bg-light border">{item.molecularFormula}</span>}
            {item.category && <span className="badge text-bg-primary-subtle text-primary-emphasis text-capitalize">{item.category}</span>}
          </div>

          <div className="card ca-card mb-4">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Scientific Information</h6>
              <table className="table table-sm mb-0">
                <tbody>
                  {item.molecularFormula && <tr><th className="text-muted fw-normal">Molecular Formula</th><td>{item.molecularFormula}</td></tr>}
                  {item.molecularWeight && <tr><th className="text-muted fw-normal">Molecular Weight</th><td>{item.molecularWeight} g/mol</td></tr>}
                  {item.casNumber && <tr><th className="text-muted fw-normal">CAS Number</th><td>{item.casNumber}</td></tr>}
                  {item.smiles && <tr><th className="text-muted fw-normal">SMILES</th><td className="text-break">{item.smiles}</td></tr>}
                  {item.genericName && <tr><th className="text-muted fw-normal">Generic Name</th><td>{item.genericName}</td></tr>}
                  {item.manufacturer && <tr><th className="text-muted fw-normal">Manufacturer</th><td>{item.manufacturer}</td></tr>}
                  {item.nutriScore && <tr><th className="text-muted fw-normal">Nutri-Score</th><td className="text-uppercase">{item.nutriScore}</td></tr>}
                  {item.novaGroup && <tr><th className="text-muted fw-normal">NOVA Group</th><td>{item.novaGroup}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="accordion" id="detailsAccordion">
            {[
              { id: 'uses', title: 'Common Uses', items: item.uses || item.indications },
              { id: 'sideeffects', title: 'Side Effects', items: item.sideEffects },
              { id: 'toxicity', title: 'Toxicity', items: item.toxicity },
              { id: 'hazards', title: 'Health Risks / Hazards', items: item.hazards || item.warnings },
              { id: 'env', title: 'Environmental Impact', items: item.environmentalImpact },
              { id: 'ingredients', title: 'Ingredients', items: item.ingredientsList || (item.ingredients ? [item.ingredients] : []) },
              { id: 'allergens', title: 'Allergens', items: item.allergens },
              { id: 'synonyms', title: 'Also Known As', items: item.synonyms },
            ].filter((s) => s.items && s.items.length > 0).map((s, idx) => (
              <div className="accordion-item" key={s.id}>
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button ${idx !== 0 ? 'collapsed' : ''}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${s.id}`}
                  >
                    {s.title}
                  </button>
                </h2>
                <div id={`collapse-${s.id}`} className={`accordion-collapse collapse ${idx === 0 ? 'show' : ''}`} data-bs-parent="#detailsAccordion">
                  <div className="accordion-body">
                    <ListSection title="" items={s.items} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {item.pubchemUrl && (
            <p className="small text-muted mt-3">
              Reference: <a href={item.pubchemUrl} target="_blank" rel="noreferrer">PubChem Compound Page</a>
            </p>
          )}
        </div>

        <div className="col-lg-4">
          <div className="card ca-card mb-3">
            <div className="card-body text-center">
              <h6 className="fw-semibold mb-3">Share / Verify</h6>
              <div className="d-flex justify-content-center mb-3">
                <QRCode value={shareUrl} size={128} bgColor="transparent" fgColor="currentColor" />
              </div>
              <button className="btn btn-outline-primary btn-sm w-100 mb-2" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                <i className="bi bi-link-45deg me-1" /> Copy Link
              </button>
              <button className="btn btn-primary btn-sm w-100" onClick={() => downloadProductReportPdf(item, safety)}>
                <i className="bi bi-file-earmark-pdf me-1" /> Download PDF Report
              </button>
            </div>
          </div>

          <div className="card ca-card">
            <div className="card-body">
              <h6 className="fw-semibold mb-2">Blockchain Verification</h6>
              <p className="text-muted small">
                Have information to add or correct? Submit a community report — it will be hashed
                and permanently timestamped on-chain.
              </p>
              <Link to="/reports" className="btn btn-sm btn-outline-primary w-100">
                <i className="bi bi-patch-check me-1" /> View Verified Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
