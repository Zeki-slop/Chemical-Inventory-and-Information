import React, { createContext, useContext, useEffect, useState } from 'react';

const UserDataContext = createContext(null);

const STORAGE_KEY = 'chemaware:userdata';

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('[UserDataContext] Failed to parse stored user data', err);
  }
  return { favorites: [], searchHistory: [], myReports: [] };
}

export function UserDataProvider({ children }) {
  const [data, setData] = useState(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const toggleFavorite = (product) => {
    setData((prev) => {
      const exists = prev.favorites.some((f) => f.id === product.id && f.source === product.source);
      return {
        ...prev,
        favorites: exists
          ? prev.favorites.filter((f) => !(f.id === product.id && f.source === product.source))
          : [...prev.favorites, product],
      };
    });
  };

  const isFavorite = (id, source) =>
    data.favorites.some((f) => f.id === id && f.source === source);

  const addSearchHistory = (term) => {
    if (!term?.trim()) return;
    setData((prev) => {
      const deduped = prev.searchHistory.filter((t) => t.toLowerCase() !== term.toLowerCase());
      return { ...prev, searchHistory: [term, ...deduped].slice(0, 15) };
    });
  };

  const clearSearchHistory = () => setData((prev) => ({ ...prev, searchHistory: [] }));

  const recordMyReport = (report) => {
    setData((prev) => ({ ...prev, myReports: [report, ...prev.myReports] }));
  };

  const value = {
    favorites: data.favorites,
    searchHistory: data.searchHistory,
    myReports: data.myReports,
    toggleFavorite,
    isFavorite,
    addSearchHistory,
    clearSearchHistory,
    recordMyReport,
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
}
