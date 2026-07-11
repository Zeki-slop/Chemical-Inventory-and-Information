import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container ca-section text-center">
      <i className="bi bi-exclamation-octagon display-1 text-primary mb-3 d-block" />
      <h1 className="h3 fw-bold mb-2">Page not found</h1>
      <p className="text-muted mb-4">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
