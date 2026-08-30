import React from 'react';

/**
 * Breadcrumbs — navigation trail for dashboard views.
 * Provides consistent back-navigation and visual orientation.
 */
export function Breadcrumbs({ items, lang = 'en' }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumb-bar" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="breadcrumb-separator">›</span>}
            <span className="breadcrumb-item">
              {isLast ? (
                <span className="breadcrumb-current">{item.label}</span>
              ) : (
                <button type="button" onClick={item.onClick}>
                  {item.label}
                </button>
              )}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
