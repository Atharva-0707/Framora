import React, { useState, useEffect } from 'react';
import {
  X,
  Tag,
  Check,
  ShieldCheck,
  AlertCircle,
  Lock,
  Loader2,
} from 'lucide-react';
import { purchaseService } from '../services/purchaseService';
import { useToast } from '../context/ToastContext';

export const ManageSaleModal = ({ isOpen, onClose, post, onSaleUpdated }) => {
  const { showToast } = useToast();

  const isAlreadySold = post?.saleStatus === 'SOLD';
  const [isForSale, setIsForSale] = useState(post?.saleStatus === 'FOR_SALE');
  const [price, setPrice] = useState(post?.price ? String(post.price) : '1499');
  const [licenseInfo, setLicenseInfo] = useState(
    post?.licenseInfo ||
      'One-of-one original, high-resolution master. Personal and non-commercial usage included.'
  );
  const [priceError, setPriceError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setIsForSale(post.saleStatus === 'FOR_SALE');
      setPrice(post.price ? String(post.price) : '1499');
      setLicenseInfo(
        post.licenseInfo ||
          'One-of-one original, high-resolution master. Personal and non-commercial usage included.'
      );
      setPriceError('');
    }
  }, [post]);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !post) return null;

  const handlePriceChange = (e) => {
    const val = e.target.value;
    setPrice(val);
    if (priceError) {
      const num = Number(val);
      if (num > 0) {
        setPriceError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAlreadySold) return;

    if (isForSale) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        setPriceError('Enter a valid price greater than ₹0.');
        return;
      }
      if (numPrice > 10000000) {
        setPriceError('Price cannot exceed ₹1,00,00,000.');
        return;
      }
    }

    setPriceError('');
    setLoading(true);

    try {
      const numPrice = isForSale ? Number(price) : 0;
      const res = await purchaseService.updatePostSaleSettings(post._id, {
        saleStatus: isForSale ? 'FOR_SALE' : 'NOT_FOR_SALE',
        price: numPrice,
        currency: 'INR',
        licenseInfo: licenseInfo.trim(),
      });

      if (res.success) {
        showToast(res.message, 'success');
        if (onSaleUpdated) {
          onSaleUpdated(res.post);
        }
        onClose();
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        showToast(
          err.response?.data?.message || "You don't have permission to manage this photograph's sale.",
          'error'
        );
        onClose();
      } else {
        showToast(
          err.response?.data?.message || 'Could not update sale configuration',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="marketplace-modal-title"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="modal-dialog marketplace-modal"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: 'calc(100dvh - 36px)',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: 'var(--bg-modal, #0f1117)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          animation: 'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. FIXED HEADER ── */}
        <div
          className="modal-header"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            background: 'var(--bg-surface, #141721)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(231, 184, 106, 0.12)',
                border: '1px solid rgba(231, 184, 106, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Tag size={19} color="var(--accent, #e7b86a)" />
            </div>
            <div>
              <h3
                id="marketplace-modal-title"
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: '0 0 2px',
                  letterSpacing: '-0.01em',
                }}
              >
                Photography Marketplace
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-dim, #94a3b8)',
                  margin: 0,
                }}
              >
                Configure this one-of-one digital asset
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-dim, #94a3b8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* ── 2. BODY & 3. FOOTER ── */}
        {isAlreadySold ? (
          /* Sold Notice View */
          <div
            className="modal-body-scroll"
            style={{
              padding: '36px 24px',
              textAlign: 'center',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(231, 184, 106, 0.12)',
                border: '1px solid rgba(231, 184, 106, 0.3)',
                color: 'var(--accent, #e7b86a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Lock size={26} />
            </div>
            <h4
              style={{
                fontSize: '19px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '8px',
              }}
            >
              Photograph Has Been Sold
            </h4>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-dim, #94a3b8)',
                lineHeight: 1.6,
                maxWidth: '420px',
                margin: '0 auto 24px',
              }}
            >
              This 1-of-1 photograph was purchased for{' '}
              <strong style={{ color: 'var(--accent, #e7b86a)' }}>
                ₹{post.price?.toLocaleString('en-IN')}
              </strong>
              . Ownership and original download rights have been permanently transferred to the collector.
            </p>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '10px 18px', fontSize: '14px' }}
            >
              Close
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* ── 2. SCROLLABLE BODY ── */}
            <div
              className="modal-body-scroll"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '24px',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Sale Activation Selectable Card */}
              <div
                onClick={() => {
                  setIsForSale(!isForSale);
                  if (priceError) setPriceError('');
                }}
                role="checkbox"
                aria-checked={isForSale}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setIsForSale(!isForSale);
                    if (priceError) setPriceError('');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-md, 12px)',
                  background: isForSale
                    ? 'rgba(231, 184, 106, 0.07)'
                    : 'var(--surface-hover, rgba(255, 255, 255, 0.03))',
                  border: isForSale
                    ? '1px solid rgba(231, 184, 106, 0.45)'
                    : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  marginBottom: isForSale ? '22px' : '20px',
                  outline: 'none',
                }}
              >
                {/* Custom Accessible Check Indicator */}
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    background: isForSale
                      ? 'var(--accent, #e7b86a)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isForSale
                      ? '1px solid var(--accent, #e7b86a)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {isForSale && <Check size={14} color="#0a0b0e" strokeWidth={3} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: isForSale ? '#ffffff' : 'var(--text-main, #e2e8f0)',
                      fontSize: '15px',
                      fontWeight: 600,
                      marginBottom: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>List this photograph for sale</span>
                    {isForSale && (
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(231, 184, 106, 0.2)',
                          color: 'var(--accent, #e7b86a)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-dim, #94a3b8)',
                      lineHeight: 1.45,
                    }}
                  >
                    Offer this one-of-one digital original to a single collector.
                  </div>
                </div>
              </div>

              {/* Configured Fields when For Sale */}
              {isForSale && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    animation: 'fadeIn 0.2s ease-out',
                  }}
                >
                  {/* Price Input */}
                  <div>
                    <label
                      htmlFor="sale-price-input"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: 'var(--text-main, #e2e8f0)',
                        marginBottom: '8px',
                      }}
                    >
                      <span>Sale Price</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim, #94a3b8)', fontWeight: 400 }}>
                        Currency: INR (₹)
                      </span>
                    </label>

                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--accent, #e7b86a)',
                          fontSize: '16px',
                          fontWeight: 700,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                      >
                        ₹
                      </div>
                      <input
                        id="sale-price-input"
                        type="number"
                        min="1"
                        step="1"
                        value={price}
                        onChange={handlePriceChange}
                        placeholder="1499"
                        className="input-field"
                        style={{
                          width: '100%',
                          height: '46px',
                          paddingLeft: '34px',
                          paddingRight: '14px',
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#ffffff',
                          background: 'var(--bg-surface, #141721)',
                          border: priceError
                            ? '1px solid #ef4444'
                            : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                          borderRadius: 'var(--radius-sm, 8px)',
                          boxSizing: 'border-box',
                        }}
                        required
                      />
                    </div>

                    {priceError ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '6px',
                          fontSize: '12.5px',
                          color: '#ef4444',
                          fontWeight: 500,
                        }}
                      >
                        <AlertCircle size={14} />
                        <span>{priceError}</span>
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-dim, #94a3b8)',
                          margin: '6px 0 0',
                          lineHeight: 1.4,
                        }}
                      >
                        One-time purchase price for the original high-resolution master.
                      </p>
                    )}
                  </div>

                  {/* License & Usage Information Textarea */}
                  <div>
                    <label
                      htmlFor="license-info-textarea"
                      style={{
                        display: 'block',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: 'var(--text-main, #e2e8f0)',
                        marginBottom: '8px',
                      }}
                    >
                      License & Usage Information
                    </label>
                    <textarea
                      id="license-info-textarea"
                      value={licenseInfo}
                      onChange={(e) => setLicenseInfo(e.target.value)}
                      rows={4}
                      placeholder="One-of-one original, high-resolution master. Personal and non-commercial usage included."
                      className="input-field"
                      style={{
                        width: '100%',
                        minHeight: '105px',
                        maxHeight: '160px',
                        padding: '12px 14px',
                        fontSize: '13.5px',
                        lineHeight: '1.55',
                        color: '#ffffff',
                        background: 'var(--bg-surface, #141721)',
                        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                        borderRadius: 'var(--radius-sm, 8px)',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-dim, #94a3b8)',
                        margin: '6px 0 0',
                        lineHeight: 1.4,
                      }}
                    >
                      Specify what collector rights and usage terms accompany this photograph.
                    </p>
                  </div>
                </div>
              )}

              {/* One-of-One Information Panel */}
              <div
                style={{
                  marginTop: isForSale ? '20px' : '0',
                  marginBottom: '6px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md, 10px)',
                  background: 'rgba(231, 184, 106, 0.05)',
                  border: '1px solid rgba(231, 184, 106, 0.2)',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <ShieldCheck
                  size={18}
                  color="var(--accent, #e7b86a)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
                  <div
                    style={{
                      color: 'var(--accent, #e7b86a)',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: '3px',
                    }}
                  >
                    One-of-One Asset
                  </div>
                  <div style={{ color: 'var(--text-dim, #cbd5e1)' }}>
                    Once purchased, this photograph can no longer be purchased by another collector. The public version will display a SOLD watermark after the sale is completed.
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. FIXED / STICKY FOOTER ── */}
            <div
              className="modal-footer"
              style={{
                flexShrink: 0,
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '16px 24px',
                borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                background: 'var(--bg-surface, #141721)',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{
                  minWidth: '100px',
                  padding: '9px 18px',
                  fontSize: '13.5px',
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  minWidth: '140px',
                  padding: '9px 20px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={15}
                      className="spinner"
                      style={{ animation: 'spin 1s linear infinite' }}
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManageSaleModal;
