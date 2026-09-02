import React, { useState, useEffect, useCallback } from 'react';
import { Compass, Flame, Users, RefreshCw, Camera, Layers } from 'lucide-react';
import { postService } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/PostCard';
import PostDetailModal from '../components/PostDetailModal';
import EditPostModal from '../components/EditPostModal';
import PostGridSkeleton from '../components/SkeletonLoader';

const POPULAR_TAGS = [
  'all',
  'landscape',
  'street',
  'astrophotography',
  'wildlife',
  'architecture',
  'nightphotography',
  'minimalism',
  'patagonia',
  'tokyo',
];

export const FeedPage = ({ onOpenCreateModal }) => {
  const { isAuthenticated } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('latest');
  const [selectedTag, setSelectedTag] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filter === 'trending') params.filter = 'trending';
      if (filter === 'following') params.filter = 'following';
      if (selectedTag && selectedTag !== 'all') params.tag = selectedTag;

      const data = await postService.getPosts(params);
      if (data.success) {
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filter, selectedTag]);

  useEffect(() => {
    document.title = 'Framora — Photography Community';
    fetchFeed();
  }, [fetchFeed]);

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    setSelectedPost(null);
  };

  const handlePostUpdated = () => fetchFeed();

  return (
    <div className="page-container">

      {/* ── Hero Banner ── */}
      <div className="feed-hero">
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          {/* Eyebrow label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent-border)',
            padding: '4px 13px', borderRadius: '20px',
            fontSize: '11px', fontWeight: '700',
            color: 'var(--accent)', marginBottom: '18px',
            letterSpacing: '0.07em', textTransform: 'uppercase',
          }}>
            <Camera size={12} />
            <span>Photography Community</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: '900', letterSpacing: '-0.04em',
            color: 'var(--text-main)', lineHeight: '1.1',
            marginBottom: '16px',
          }}>
            Where Visual Storytellers
            <br />
            <span style={{ color: 'var(--accent)' }}>Share Their Best Frames</span>
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '28px', maxWidth: '520px' }}>
            Explore high-resolution captures alongside camera settings, lens notes,
            and the stories from photographers around the world.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {isAuthenticated && (
              <button onClick={onOpenCreateModal} className="btn btn-primary" style={{ padding: '11px 22px', fontSize: '14px' }}>
                <Camera size={16} />
                <span>Share a Photo</span>
              </button>
            )}
            <button
              onClick={() => { setFilter('trending'); setSelectedTag('all'); setPage(1); }}
              className="btn btn-secondary"
              style={{ padding: '11px 22px', fontSize: '14px' }}
            >
              <Flame size={16} color="var(--accent)" />
              <span>Browse Trending</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'latest', label: 'Discover', icon: <Compass size={15} /> },
              { id: 'trending', label: 'Trending', icon: <Flame size={15} /> },
              ...(isAuthenticated ? [{ id: 'following', label: 'Following', icon: <Users size={15} /> }] : []),
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => { setFilter(id); setPage(1); }}
                className={`btn ${filter === id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '7px 14px', fontSize: '13px' }}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={fetchFeed}
            className="btn btn-ghost"
            style={{ fontSize: '12.5px', color: 'var(--text-dim)' }}
            title="Refresh Feed"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tag pills */}
        <div style={{ display: 'flex', gap: '7px', overflowX: 'auto', paddingBottom: '2px' }}>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => { setSelectedTag(tag); setPage(1); }}
              className={`tag-pill ${selectedTag === tag ? 'active' : ''}`}
            >
              {tag === 'all' ? 'All Genres' : `#${tag}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid / States ── */}
      {loading ? (
        <PostGridSkeleton count={8} />
      ) : posts.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '72px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={26} color="var(--text-dim)" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
              No photos found
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginTop: '4px' }}>
              {filter === 'following'
                ? 'Follow some photographers to see their work here.'
                : 'Be the first to share a photo in this category.'}
            </p>
          </div>
          {isAuthenticated && (
            <button onClick={onOpenCreateModal} className="btn btn-primary">
              <Camera size={15} />
              <span>Upload a Photo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="photo-grid">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onSelectPost={(p) => setSelectedPost(p)}
              onPostUpdated={handlePostUpdated}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '40px',
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Page <strong style={{ color: 'var(--text-main)' }}>{page}</strong> of{' '}
            <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onPostDeleted={handlePostDeleted}
          onPostUpdated={handlePostUpdated}
          onOpenEditPost={(p) => setEditingPost(p)}
        />
      )}

      {editingPost && (
        <EditPostModal
          isOpen={!!editingPost}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
};

export default FeedPage;
