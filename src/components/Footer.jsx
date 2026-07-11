import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-top py-4 mt-5 bg-body">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-shield-check text-primary fs-5" />
          <span className="fw-semibold">ChemAware</span>
          <span className="text-muted small">— transparency in what you consume.</span>
        </div>
        <ul className="nav gap-3">
          <li className="nav-item"><Link className="nav-link p-0 text-muted small" to="/about">About</Link></li>
          <li className="nav-item"><Link className="nav-link p-0 text-muted small" to="/reports">Verified Reports</Link></li>
          <li className="nav-item">
            <a className="nav-link p-0 text-muted small" href="https://pubchem.ncbi.nlm.nih.gov" target="_blank" rel="noreferrer">
              PubChem
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link p-0 text-muted small" href="https://open.fda.gov" target="_blank" rel="noreferrer">
              OpenFDA
            </a>
          </li>
        </ul>
        <div className="text-muted small">&copy; {new Date().getFullYear()} ChemAware. Educational project.</div>
      </div>
    </footer>
  );
}
