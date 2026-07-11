import React, { useState } from 'react';
import { searchAll } from '../services/api.js';
import { safetyBadgeVariant } from '../utils/safetyScore.js';

function CompareSlot({ index, item, onPick, onClear }) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);

  const onSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await searchAll(query);
      setOptions(results.slice(0, 6));
    } finally {
      setSearching(false);
    }
  };

  if (item) {
    return (
      <div className="ca-card p-3 h-100">
        <div className="d-flex justify-content-between align-items-start">
          <h6 className="fw-semibold">{item.name}</h6>
          <button className="btn btn-sm btn-link text-danger" onClick={() => onClear(index)}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <span className={`badge text-bg-${safetyBadgeVariant(item.safetyScore?.level)} mb-2`}>
          Safety: {item.safetyScore?.score ?? '—'}
        </span>
        <table className="table table-sm mt-2">
          <tbody>
            <tr><th className="text-muted fw-normal small">Formula</th><td className="small">{item.molecularFormula || '—'}</td></tr>
            <tr><th className="text-muted fw-normal small">Manufacturer</th><td className="small">{item.manufacturer || '—'}</td></tr>
            <tr><th className="text-muted fw-normal small">Category</th><td className="small text-capitalize">{item.category || '—'}</td></tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="ca-card p-3 h-100">
      <form onSubmit={onSearch} className="d-flex gap-2 mb-3">
        <input
          className="form-control form-control-sm"
          placeholder={`Product ${index + 1}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-sm btn-primary" type="submit" disabled={searching}>
          {searching ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-search" />}
        </button>
      </form>
      <div className="d-flex flex-column gap-2">
        {options.map((o) => (
          <button
            key={`${o.source}-${o.id}`}
            className="btn btn-sm btn-outline-secondary text-start"
            onClick={() => onPick(index, o)}
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Compare() {
  const [slots, setSlots] = useState([null, null, null]);

  const pick = (index, item) => setSlots((prev) => prev.map((s, i) => (i === index ? item : s)));
  const clear = (index) => setSlots((prev) => prev.map((s, i) => (i === index ? null : s)));

  return (
    <div className="container ca-section">
      <h1 className="h4 fw-bold mb-2">Compare Products</h1>
      <p className="text-muted mb-4">Search and select up to 3 products to compare side by side.</p>
      <div className="row g-3">
        {slots.map((item, i) => (
          <div className="col-12 col-md-4" key={i}>
            <CompareSlot index={i} item={item} onPick={pick} onClear={clear} />
          </div>
        ))}
      </div>
    </div>
  );
}
