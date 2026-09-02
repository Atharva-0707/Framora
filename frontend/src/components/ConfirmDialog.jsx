import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => !loading && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        className="modal-dialog"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ padding: '16px 20px' }}>
          <div className="modal-title" id="confirm-dialog-title" style={{ fontSize: '15px' }}>
            {isDestructive && (
              <AlertTriangle size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
            )}
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn btn-ghost btn-icon"
            aria-label="Close dialog"
          >
            <X size={17} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <p
            id="confirm-dialog-message"
            style={{
              fontSize: '14px',
              color: 'var(--text-soft)',
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            {message}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '24px',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
