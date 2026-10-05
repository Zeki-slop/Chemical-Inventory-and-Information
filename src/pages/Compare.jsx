import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchAll } from '../services/api.js';
import { safetyBadgeVariant } from '../utils/safetyScore.js';

function CompareSlot({ index, item, onPick, onClear }) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [searchError, setSearchError] = useState(null);

  const onSearch = async (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearching(true);
    setSearchError(null);
    setSearchedQuery(trimmed);

    try {
      const results = await searchAll(trimmed);
      setOptions(results.slice(0, 6));
    } catch (err) {
      console.error('[Compare] Search error:', err);
      setSearchError(err?.message || 'Search failed. Please try again.');
      setOptions([]);
    } finally {
      setSearching(false);
    }
  };

  if (item) {
    return (
      <div className="ca-card p-3 h-100 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="fw-semibold mb-0 text-truncate" title={item.name}>
            {item.name}
          </h6>
          <button
            className="btn btn-sm btn-link text-danger p-0 ms-2"
            onClick={() => onClear(index)}
            aria-label="Remove item"
            title="Remove item"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="d-flex flex-wrap gap-1 mb-2">
          <span className={`badge text-bg-${safetyBadgeVariant(item.safetyScore?.level)}`}>
            Safety: {item.safetyScore?.score ?? '—'}
          </span>
          <span className="badge text-bg-light border text-capitalize">
            {item.category || 'Product'}
          </span>
        </div>

        <div className="table-responsive flex-grow-1">
          <table className="table table-sm align-middle mt-2 mb-3">
            <tbody>
              <tr>
                <th className="text-muted fw-normal small" style={{ width: '38%' }}>Formula</th>
                <td className="small fw-semibold text-primary">
                  {item.molecularFormula || '—'}
                </td>
              </tr>
              <tr>
                <th className="text-muted fw-normal small">Manufacturer</th>
                <td className="small text-truncate" style={{ maxWidth: '140px' }} title={item.manufacturer}>
                  {item.manufacturer || '—'}
                </td>
              </tr>
              <tr>
                <th className="text-muted fw-normal small">Category</th>
                <td className="small text-capitalize">{item.category || '—'}</td>
              </tr>
              {item.additives && item.additives.length > 0 && (
                <tr>
                  <th className="text-muted fw-normal small">Additives</th>
                  <td className="small">{item.additives.length} additive(s)</td>
                </tr>
              )}
              {item.activeIngredients && item.activeIngredients.length > 0 && (
                <tr>
                  <th className="text-muted fw-normal small">Active</th>
                  <td className="small text-truncate" style={{ maxWidth: '140px' }}>
                    {Array.isArray(item.activeIngredients) ? item.activeIngredients.join(', ') : item.activeIngredients}
                  </td>
                </tr>
              )}
              {item.nutriScore && (
                <tr>
                  <th className="text-muted fw-normal small">Nutri-Score</th>
                  <td className="small text-uppercase fw-bold">{item.nutriScore}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-auto pt-2 border-top">
          <Link
            to={`/chemical/${item.source}/${item.id}`}
            className="btn btn-sm btn-outline-primary w-100"
          >
            <i className="bi bi-box-arrow-up-right me-1" /> View Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ca-card p-3 h-100 d-flex flex-column">
      <form onSubmit={onSearch} className="d-flex gap-2 mb-3">
        <input
          className="form-control form-control-sm"
          placeholder={`Search product ${index + 1} (e.g. cheese, paracetamol)...`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (searchError) setSearchError(null);
          }}
          disabled={searching}
        />
        <button
          className="btn btn-sm btn-primary d-flex align-items-center justify-content-center"
          type="submit"
          disabled={searching || !query.trim()}
          style={{ minWidth: 42 }}
          title="Search products"
        >
          {searching ? (
            <span className="spinner-border spinner-border-sm" role="status" />
          ) : (
            <i className="bi bi-search" />
          )}
        </button>
      </form>

      {searching && (
        <div className="text-center py-4 text-muted small">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          <span>Searching public databases...</span>
        </div>
      )}

      {searchError && (
        <div className="alert alert-warning py-2 px-3 small mb-2 d-flex justify-content-between align-items-center">
          <span>{searchError}</span>
          <button className="btn btn-sm btn-outline-dark py-0 px-2" onClick={onSearch}>
            Retry
          </button>
        </div>
      )}

      {!searching && searchedQuery && options.length === 0 && !searchError && (
        <div className="text-center py-4 text-muted small px-2">
          <i className="bi bi-search mb-2 d-block fs-5 text-secondary" />
          No products found for <strong>"{searchedQuery}"</strong>.
          <div className="mt-1 text-secondary">
            Try searching for a general food (e.g. <em>cheese</em>), medicine (e.g. <em>aspirin</em>), or chemical name.
          </div>
        </div>
      )}

      {!searching && options.length > 0 && (
        <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '360px' }}>
          {options.map((o) => (
            <button
              key={`${o.source}-${o.id}`}
              className="btn btn-sm btn-outline-secondary text-start p-2 d-flex flex-column"
              onClick={() => onPick(index, o)}
              type="button"
            >
              <div className="d-flex justify-content-between align-items-center w-100">
                <span className="fw-semibold text-truncate me-1">{o.name}</span>
                <span className={`badge text-bg-${safetyBadgeVariant(o.safetyScore?.level)}`}>
                  {o.safetyScore?.score ?? '—'}
                </span>
              </div>
              <div className="d-flex flex-wrap gap-1 align-items-center mt-1 small">
                <span className="badge text-bg-light border text-capitalize">{o.category}</span>
                {o.molecularFormula && (
                  <span className="text-primary small fw-semibold text-truncate" style={{ maxWidth: '200px' }}>
                    {o.molecularFormula}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
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
