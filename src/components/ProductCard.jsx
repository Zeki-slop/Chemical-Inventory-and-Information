import React from 'react';
import { Link } from 'react-router-dom';
import { safetyBadgeVariant } from '../utils/safetyScore.js';
import { useUserData } from '../context/UserDataContext.jsx';

const CATEGORY_ICONS = {
  chemical: 'bi-droplet-half',
  medicine: 'bi-capsule',
  food: 'bi-egg-fried',
};

export default function ProductCard({ product }) {
  const { toggleFavorite, isFavorite } = useUserData();
  const favorite = isFavorite(product.id, product.source);
  const variant = safetyBadgeVariant(product.safetyScore?.level);

  return (
    <div className="col-12 col-sm-6 col-lg-4">
      <div className="card ca-card h-100">
        <div className="position-relative">
          {product.image ? (
            <img src={product.image} className="card-img-top" alt={product.name} style={{ height: 160, objectFit: 'cover', borderRadius: 'var(--ca-radius) var(--ca-radius) 0 0' }} />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center text-white"
              style={{ height: 160, background: 'var(--ca-gradient)', borderRadius: 'var(--ca-radius) var(--ca-radius) 0 0' }}
            >
              <i className={`bi ${CATEGORY_ICONS[product.category] || 'bi-box'} display-4`} />
            </div>
          )}
          <button
            className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-2 shadow-sm"
            onClick={() => toggleFavorite(product)}
            aria-label="Toggle favorite"
          >
            <i className={`bi ${favorite ? 'bi-heart-fill text-danger' : 'bi-heart'}`} />
          </button>
        </div>

        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <h6 className="card-title mb-0">{product.name}</h6>
          </div>
          <p className="text-muted small mb-2">{product.manufacturer || product.iupacName || 'Unknown source'}</p>

          <div className="d-flex flex-wrap gap-2 mb-2">
            <span className={`badge text-bg-${variant}`}>
              Safety: {product.safetyScore?.score ?? '—'}
            </span>
            {product.molecularFormula && (
              <span className="badge text-bg-secondary-subtle text-secondary-emphasis">
                {product.molecularFormula}
              </span>
            )}
            {product.additives?.length > 0 && (
              <span className="badge text-bg-secondary-subtle text-secondary-emphasis">
                {product.additives.length} additive(s)
              </span>
            )}
          </div>

          <div className="mt-auto d-flex gap-2">
            <Link to={`/chemical/${product.source}/${product.id}`} className="btn btn-sm btn-primary flex-grow-1">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
