import { useCallback, useState } from 'react';
import { searchAll } from '../services/api.js';

export function useSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSearch = useCallback(async (query) => {
    if (!query?.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchAll(query);
      setResults(data);
    } catch (err) {
      setError(err?.message || 'Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, runSearch };
}
