import React from 'react';

/**
 * ConfirmDialog — modal confirmation for destructive actions.
 * Prevents accidental data loss and shows product maturity.
 */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel }) {
  if (!open) return null;

  const WarningIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`confirm-dialog-icon ${variant}`}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: 420 }}>
        <div className="confirm-dialog-body">
          <WarningIcon />
          <div className="confirm-dialog-title">{title}</div>
          <div className="confirm-dialog-message">{message}</div>
        </div>
        <div className="confirm-dialog-actions">
          <button className="btn btn-ghost" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={variant === 'danger' ? 'btn-danger' : 'btn btn-primary'} type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
