import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  Download,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Camera,
  Loader2,
} from 'lucide-react';
import { purchaseService } from '../services/purchaseService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export const PurchasesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' | 'sales'
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    document.title = 'Marketplace & Purchases — Framora';
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purchasesRes, salesRes] = await Promise.allSettled([
        purchaseService.getMyPurchases(),
        purchaseService.getMySales(),
      ]);

      if (purchasesRes.status === 'fulfilled' && purchasesRes.value.success) {
        setPurchases(purchasesRes.value.purchases || []);
      }
      if (salesRes.status === 'fulfilled' && salesRes.value.success) {
        setSales(salesRes.value.sales || []);
        setTotalEarnings(salesRes.value.totalEarnings || 0);
      }
    } catch {
      showToast('Could not load transaction history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (postId, postTitle) => {
    setDownloadingId(postId);
    try {
      const data = await purchaseService.getDownloadAccess(postId);
      if (data.success && data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename || `${postTitle || 'framora_photo'}.jpg`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Download started for original high-resolution photo', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not retrieve download link', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatPrice = (val, curr = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(231, 184, 106, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={18} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Marketplace Ledger
          </h1>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', margin: 0 }}>
          Manage your collected 1-of-1 digital photograph masters and sales revenue.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`btn ${activeTab === 'purchases' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '14px', padding: '8px 18px' }}
        >
          <ShoppingBag size={16} />
          <span>My Purchases ({purchases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '14px', padding: '8px 18px' }}
        >
          <TrendingUp size={16} />
          <span>My Sales ({sales.length})</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
          <Loader2 size={32} className="spinner" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p>Loading ledger records...</p>
        </div>
      ) : activeTab === 'purchases' ? (
        /* My Purchases (Collector View) */
        <div>
          {purchases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <Camera size={40} style={{ color: 'var(--text-dim)', margin: '0 auto 16px', opacity: 0.6 }} />
              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>No Collected Photographs Yet</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                Explore the Framora marketplace to discover and acquire exclusive 1-of-1 digital originals directly from creators.
              </p>
              <Link to="/" className="btn btn-primary">
                Explore Feed
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {purchases.map((purchase) => {
                const post = purchase.post;
                if (!post) return null;

                return (
                  <div
                    key={purchase._id}
                    style={{
                      background: 'var(--surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: 'rgba(10, 11, 14, 0.85)',
                          backdropFilter: 'blur(8px)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: '1px solid rgba(231, 184, 106, 0.3)',
                        }}
                      >
                        <ShieldCheck size={12} />
                        <span>COLLECTED ORIGINAL</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>
                        {post.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <img
                          src={purchase.seller?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${purchase.seller?.username}`}
                          alt={purchase.seller?.name}
                          style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                          by <strong style={{ color: 'var(--text-main)' }}>@{purchase.seller?.username || 'photographer'}</strong>
                        </span>
                      </div>

                      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: 'auto 0 12px' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '12.5px', color: 'var(--text-dim)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          <span>{new Date(purchase.completedAt || purchase.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>
                          {formatPrice(purchase.amount, purchase.currency)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          to={`/posts/${post._id}`}
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '7px 10px', fontSize: '12.5px', justifyContent: 'center' }}
                        >
                          <ExternalLink size={14} />
                          <span>View Post</span>
                        </Link>
                        <button
                          onClick={() => handleDownload(post._id, post.title)}
                          className="btn btn-primary"
                          style={{ flex: 1.3, padding: '7px 10px', fontSize: '12.5px', justifyContent: 'center' }}
                          disabled={downloadingId === post._id}
                        >
                          {downloadingId === post._id ? (
                            <Loader2 size={14} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Download size={14} />
                          )}
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* My Sales (Photographer View) */
        <div>
          {/* Revenue Metric Box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', marginBottom: '8px' }}>
                <DollarSign size={16} color="var(--accent)" />
                <span>Total Net Earnings</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--accent)' }}>
                {formatPrice(totalEarnings)}
              </div>
            </div>

            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', marginBottom: '8px' }}>
                <CheckCircle2 size={16} color="#4ade80" />
                <span>1-of-1 Assets Sold</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#fff' }}>
                {sales.length}
              </div>
            </div>
          </div>

          {sales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <TrendingUp size={40} style={{ color: 'var(--text-dim)', margin: '0 auto 16px', opacity: 0.6 }} />
              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>No Sales Recorded Yet</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                Put your best shots up for sale in the marketplace by clicking "Manage Sale Settings" on any of your posts.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sales.map((sale) => (
                <div
                  key={sale._id}
                  style={{
                    background: 'var(--surface)',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {sale.post?.imageUrl && (
                      <img
                        src={sale.post.imageUrl}
                        alt={sale.post?.title}
                        style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
                        {sale.post?.title || 'Sold Photograph'}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', margin: 0 }}>
                        Collected by <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>@{sale.buyer?.username || 'collector'}</span> on {new Date(sale.completedAt || sale.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent)' }}>
                        +{formatPrice(sale.amount, sale.currency)}
                      </span>
                      <span style={{ display: 'block', fontSize: '11px', color: '#4ade80' }}>
                        PAID & TRANSFERRED
                      </span>
                    </div>
                    {sale.post?._id && (
                      <Link to={`/posts/${sale.post._id}`} className="btn btn-ghost btn-icon" aria-label="View Post">
                        <ExternalLink size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
