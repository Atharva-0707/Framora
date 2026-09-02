import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { userService } from '../services/userService';
import PostCard from '../components/PostCard';
import PostDetailModal from '../components/PostDetailModal';
import EditPostModal from '../components/EditPostModal';
import PostGridSkeleton from '../components/SkeletonLoader';

export const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const data = await userService.getBookmarks();
      if (data.success) {
        setBookmarks(data.posts || []);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Saved — Framora';
    fetchBookmarks();
  }, []);

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Bookmark size={22} color="var(--accent)" />
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
            Saved Inspirations
          </h1>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
          Your private collection of bookmarked photography, lighting ideas, and camera gear setups.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <PostGridSkeleton count={6} />
      ) : bookmarks.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '60px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <Bookmark size={32} color="var(--text-dim)" />
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)' }}>
            No saved photos yet
          </h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
            Click the bookmark icon on any photo in your feed to save it here for inspiration.
          </p>
        </div>
      ) : (
        <div className="photo-grid">
          {bookmarks.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onSelectPost={(p) => setSelectedPost(p)}
              onPostUpdated={fetchBookmarks}
            />
          ))}
        </div>
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onPostDeleted={() => {
            setBookmarks((prev) => prev.filter((p) => p._id !== selectedPost._id));
            setSelectedPost(null);
          }}
          onPostUpdated={fetchBookmarks}
          onOpenEditPost={(p) => setEditingPost(p)}
        />
      )}

      {editingPost && (
        <EditPostModal
          isOpen={!!editingPost}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={fetchBookmarks}
        />
      )}
    </div>
  );
};

export default BookmarksPage;
