import React from 'react';

export function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
      <div className="spinner-border text-primary mb-2" role="status">
        <span className="visually-hidden">{label}</span>
      </div>
      <div className="small">{label}</div>
    </div>
  );
}

export function CardSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div className="col-12 col-sm-6 col-lg-4" key={i}>
          <div className="ca-card p-3">
            <div className="ca-loading-shimmer" style={{ height: 160, marginBottom: 12 }} />
            <div className="ca-loading-shimmer" style={{ height: 16, width: '70%', marginBottom: 8 }} />
            <div className="ca-loading-shimmer" style={{ height: 12, width: '50%' }} />
          </div>
        </div>
      ))}
    </>
  );
}

export default LoadingSpinner;
