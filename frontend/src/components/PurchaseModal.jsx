import React, { useState } from 'react';
import { X, ShieldCheck, ShoppingBag, AlertCircle, CheckCircle2, Download, ArrowRight, Loader2 } from 'lucide-react';
import { purchaseService } from '../services/purchaseService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';

/**
 * Dynamically load Razorpay checkout script
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PurchaseModal = ({ isOpen, onClose, post, onPurchaseSuccess }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [paymentStatusText, setPaymentStatusText] = useState('');

  if (!isOpen || !post) return null;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: post.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(post.price || 0);

  const handleStartPayment = async () => {
    setLoading(true);
    setPaymentStatusText('Initializing secure checkout...');

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast('Failed to load Razorpay checkout SDK. Please check your internet connection.', 'error');
        setLoading(false);
        setPaymentStatusText('');
        return;
      }

      // 2. Create order on backend
      const orderData = await purchaseService.createOrder(post._id);
      if (!orderData.success) {
        showToast(orderData.message || 'Could not initiate purchase', 'error');
        setLoading(false);
        setPaymentStatusText('');
        return;
      }

      // 3. Configure Razorpay checkout options
      const options = {
        key: orderData.keyId,
        amount: Math.round(orderData.amount * 100),
        currency: orderData.currency || 'INR',
        name: 'Framora Marketplace',
        description: `1-of-1 Digital Asset: "${post.title}"`,
        image: 'https://api.dicebear.com/7.x/bottts/svg?seed=framora',
        order_id: orderData.orderId,
        handler: async (response) => {
          setLoading(true);
          setPaymentStatusText('Verifying signature & securing photograph ownership...');
          try {
            // 4. Send payment signature to backend for verification
            const verifyRes = await purchaseService.verifyPayment(post._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setPurchaseComplete(true);
              setPurchaseResult(verifyRes);
              showToast('🎉 Purchase successful! You now own this 1-of-1 photograph.', 'success');
              if (onPurchaseSuccess) {
                onPurchaseSuccess(verifyRes);
              }
            } else {
              showToast(verifyRes.message || 'Payment verification failed', 'error');
              setPaymentStatusText('Payment verification failed.');
            }
          } catch (verifyErr) {
            const errMsg = verifyErr.response?.data?.message || 'Verification failed. Please contact support.';
            showToast(errMsg, 'error');
            setPaymentStatusText(errMsg);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#e7b86a',
          backdrop_color: 'rgba(10, 11, 14, 0.85)',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setPaymentStatusText('Payment cancelled.');
            showToast('Payment cancelled. The photograph remains available.', 'info');
          },
        },
      };

      // Open Razorpay Checkout modal
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (failResponse) => {
        setLoading(false);
        setPaymentStatusText(`Payment failed: ${failResponse.error?.description || 'Transaction unsuccessful'}`);
        showToast(`Payment failed: ${failResponse.error?.description || 'Try again'}`, 'error');
      });

      rzp.open();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Could not initiate purchase order';
      showToast(errMsg, 'error');
      setPaymentStatusText(errMsg);
      setLoading(false);
    }
  };

  const handleDownloadOriginal = async () => {
    setDownloading(true);
    try {
      const data = await purchaseService.getDownloadAccess(post._id);
      if (data.success && data.downloadUrl) {
        // Open download link in new tab or trigger direct download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename || `${post.title}.jpg`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Download started for original photograph!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not retrieve download link', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        style={{ maxWidth: '520px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(231, 184, 106, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', margin: 0 }}>
                {purchaseComplete ? 'Photograph Acquired' : 'Acquire 1-of-1 Original'}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                {purchaseComplete ? 'Ownership verified & transferred' : 'Digital Master & Personal Collector License'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {!purchaseComplete ? (
            <>
              {/* Photo Preview Card */}
              <div style={{ display: 'flex', gap: '16px', background: 'var(--surface-hover)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  style={{ width: '84px', height: '84px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {post.title}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '0 0 6px' }}>
                    by <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>@{post.user?.username || 'photographer'}</span>
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent)', background: 'rgba(231, 184, 106, 0.1)', padding: '2px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                    <span>1-OF-1 DIGITAL ORIGINAL</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13.5px', color: 'var(--text-dim)' }}>
                  <span>Original Photography Master</span>
                  <span style={{ color: '#fff' }}>{formattedPrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13.5px', color: 'var(--text-dim)' }}>
                  <span>Platform & Processing Fee</span>
                  <span style={{ color: 'var(--badge-green, #4ade80)' }}>₹0 (Covered)</span>
                </div>
                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Total Amount</span>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent)' }}>
                    {formattedPrice}
                  </span>
                </div>
              </div>

              {/* License Details */}
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Collector Rights & License:</strong>
                {post.licenseInfo || 'Includes full resolution non-watermarked original file, archival personal usage, and verified Framora collector provenance.'}
              </div>

              {/* Status text if any */}
              {paymentStatusText && (
                <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(231, 184, 106, 0.08)', border: '1px solid rgba(231, 184, 106, 0.2)', fontSize: '13px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={15} />
                  <span>{paymentStatusText}</span>
                </div>
              )}

              {/* Secure Checkout Trust Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '18px' }}>
                <ShieldCheck size={14} color="var(--accent)" />
                <span>Powered by Razorpay Secure Checkout (Test Mode)</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartPayment}
                  className="btn btn-primary"
                  style={{ flex: 2, position: 'relative' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Payment</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Purchase Completed View */
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Photograph Successfully Collected!
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-dim)', maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                You are now the verified owner of <strong>"{post.title}"</strong>. The photograph has been marked as SOLD on the platform.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '340px', margin: '0 auto' }}>
                <button
                  onClick={handleDownloadOriginal}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                  disabled={downloading}
                >
                  <Download size={16} />
                  <span>{downloading ? 'Preparing Download...' : 'Download Full-Res Original'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Close & View Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
