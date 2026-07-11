import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import WalletButton from './WalletButton.jsx';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow-sm bg-body">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <i className="bi bi-shield-check text-primary fs-4" />
          ChemAware
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <form className="d-flex flex-grow-1 mx-lg-4 my-3 my-lg-0" onSubmit={onSearchSubmit} role="search">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0">
                <i className="bi bi-search" />
              </span>
              <input
                type="search"
                className="form-control border-start-0"
                placeholder="Search medicines, food, cosmetics, chemicals..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search"
              />
            </div>
          </form>

          <ul className="navbar-nav align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <Link className="nav-link" to="/reports">Verified Reports</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/compare">Compare</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-sm btn-outline-secondary rounded-circle me-lg-2"
                onClick={toggleTheme}
                title="Toggle dark mode"
                aria-label="Toggle dark mode"
              >
                <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} />
              </button>
            </li>
            <li className="nav-item">
              <WalletButton />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
