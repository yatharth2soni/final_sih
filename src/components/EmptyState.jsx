import React from 'react';

/**
 * EmptyState — shown when a data table/list has zero results.
 * Provides a clear CTA instead of a blank white screen.
 */
export function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <div className="empty-state-title">{title}</div>
      {description && <div className="empty-state-desc">{description}</div>}
      {actionLabel && onAction && (
        <button className="btn btn-primary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
