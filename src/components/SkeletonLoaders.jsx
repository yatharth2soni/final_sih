import React from 'react';

/**
 * Skeleton loader components for shimmer loading states.
 * Used across all dashboard views while data is being fetched.
 */

export function SkeletonKpiGrid({ count = 6 }) {
  return (
    <div className="skeleton-kpi-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className={`skeleton skeleton-line ${j === 0 ? '' : j % 3 === 0 ? 'w-40' : j % 2 === 0 ? 'w-60' : 'w-80'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 200 }) {
  return (
    <div className="skeleton" style={{ height, borderRadius: 'var(--gesso-radius-md)' }} />
  );
}

export function SkeletonLine({ width = '80%' }) {
  return <div className="skeleton skeleton-line" style={{ width }} />;
}

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-spinner">
      <div className="spinner-icon" />
      <span>{text}</span>
    </div>
  );
}
