import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAll } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { CardSkeleton } from '../components/LoadingSpinner.jsx';
import { useUserData } from '../context/UserDataContext.jsx';

const CATEGORIES = [
  { key: 'medicine', label: 'Medicines', icon: 'bi-capsule', query: 'paracetamol' },
  { key: 'food', label: 'Food Products', icon: 'bi-egg-fried', query: 'chocolate' },
  { key: 'cosmetic', label: 'Cosmetics', icon: 'bi-brush', query: 'shampoo' },
  { key: 'cleaning', label: 'Cleaning Products', icon: 'bi-droplet', query: 'bleach' },
  { key: 'chemical', label: 'Raw Chemicals', icon: 'bi-flask', query: 'ethanol' },
];

const STATS = [
  { value: '3', label: 'Public data sources integrated' },
  { value: '100%', label: 'On-chain report immutability' },
  { value: '24/7', label: 'Community verification' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { addSearchHistory } = useUserData();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const results = await searchAll('vitamin c');
        if (!cancelled) setFeatured(results.slice(0, 6));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    addSearchHistory(query.trim());
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <section className="ca-hero py-5">
        <div className="container py-5 text-center">
          <h1 className="display-5 fw-bold mb-3">Know what's really in your products</h1>
          <p className="lead mb-4 opacity-90">
            Search medicines, food, cosmetics, and cleaning products for chemical transparency —
            backed by public science databases and blockchain-verified community reports.
          </p>
          <form onSubmit={onSubmit} className="mx-auto" style={{ maxWidth: 640 }}>
            <div className="input-group input-group-lg shadow">
              <input
                type="search"
                className="form-control"
                placeholder="e.g. Paracetamol, Coca-Cola, Shampoo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-light fw-semibold" type="submit">
                <i className="bi bi-search me-1" /> Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="ca-section container">
        <h2 className="h4 fw-bold mb-4 text-center">Browse by Category</h2>
        <div className="row g-3">
          {CATEGORIES.map((c) => (
            <div className="col-6 col-md-4 col-lg" key={c.key}>
              <button
                className="btn w-100 ca-card border-0 py-4 d-flex flex-column align-items-center gap-2 bg-transparent"
                onClick={() => navigate(`/search?q=${encodeURIComponent(c.query)}`)}
              >
                <i className={`bi ${c.icon} fs-2 text-primary`} />
                <span className="fw-semibold small">{c.label}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="ca-section bg-body-tertiary">
        <div className="container">
          <h2 className="h4 fw-bold mb-4 text-center">Featured Products</h2>
          <div className="row g-4">
            {loading ? <CardSkeleton count={6} /> : featured.map((p) => <ProductCard key={`${p.source}-${p.id}`} product={p} />)}
          </div>
        </div>
      </section>

      <section className="ca-section container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <h2 className="h4 fw-bold mb-3">Why Chemical Awareness Matters</h2>
            <p className="text-muted">
              Everyday products contain chemicals whose names most people can't decode. ChemAware
              translates scientific data — molecular structure, toxicity, regulatory status — into
              a searchable, understandable format, and lets the community cross-verify claims with
              tamper-proof blockchain records instead of trusting a single source blindly.
            </p>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><i className="bi bi-check-circle-fill text-success me-2" />Sourced from PubChem, OpenFDA & Open Food Facts</li>
              <li><i className="bi bi-check-circle-fill text-success me-2" />Community reports are hashed and timestamped on-chain</li>
              <li><i className="bi bi-check-circle-fill text-success me-2" />No single party can silently edit past submissions</li>
            </ul>
          </div>
          <div className="col-lg-6">
            <div className="row g-3">
              {STATS.map((s) => (
                <div className="col-4" key={s.label}>
                  <div className="ca-card text-center p-3 h-100">
                    <div className="ca-stat text-primary">{s.value}</div>
                    <div className="small text-muted">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
