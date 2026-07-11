import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch.js';
import ProductCard from '../components/ProductCard.jsx';
import { CardSkeleton } from '../components/LoadingSpinner.jsx';
import { useUserData } from '../context/UserDataContext.jsx';

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'chemical', label: 'Chemicals' },
  { key: 'medicine', label: 'Medicines' },
  { key: 'food', label: 'Food' },
];

const SAFETY_FILTERS = [
  { key: 'all', label: 'Any safety level' },
  { key: 'high', label: 'High safety' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'low', label: 'Low safety' },
];

const PAGE_SIZE = 9;

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { results, loading, error, runSearch } = useSearch();
  const { addSearchHistory } = useUserData();

  const [category, setCategory] = useState('all');
  const [safety, setSafety] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (q) {
      runSearch(q);
      addSearchHistory(q);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (category !== 'all' && r.category !== category) return false;
      if (safety !== 'all' && r.safetyScore?.level !== safety) return false;
      return true;
    });
  }, [results, category, safety]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="container ca-section">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Search results for "{q}"</h1>
          <p className="text-muted small mb-0">{filtered.length} result(s) found</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <select className="form-select form-select-sm" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            {CATEGORY_FILTERS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <select className="form-select form-select-sm" value={safety} onChange={(e) => { setSafety(e.target.value); setPage(1); }}>
            {SAFETY_FILTERS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {loading ? (
          <CardSkeleton count={9} />
        ) : pageItems.length > 0 ? (
          pageItems.map((p) => <ProductCard key={`${p.source}-${p.id}`} product={p} />)
        ) : (
          <div className="col-12 text-center py-5 text-muted">
            <i className="bi bi-search display-4 d-block mb-3" />
            No results found. Try a different search term.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="mt-4 d-flex justify-content-center">
          <ul className="pagination">
            {Array.from({ length: totalPages }).map((_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
