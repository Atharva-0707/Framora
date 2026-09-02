import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Camera, Users } from 'lucide-react';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import PostDetailModal from '../components/PostDetailModal';
import EditPostModal from '../components/EditPostModal';
import PostGridSkeleton from '../components/SkeletonLoader';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('tag') || searchParams.get('location') || '';
  const initialTag = searchParams.get('tag') || '';
  const initialLocation = searchParams.get('location') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'users'
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  const executeSearch = async (term) => {
    setLoading(true);
    try {
      if (activeTab === 'posts') {
        const params = {};
        if (initialTag) {
          params.tag = initialTag;
        } else if (initialLocation) {
          params.location = initialLocation;
        } else if (term) {
          params.search = term;
        }
        const data = await postService.getPosts(params);
        if (data.success) {
          setPosts(data.posts || []);
        }
      } else {
        const data = await userService.searchUsers(term);
        if (data.success) {
          setUsers(data.users || []);
        }
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Explore — Framora';
    executeSearch(searchTerm);
  }, [activeTab, searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  return (
    <div className="page-container">
      {/* Search Header */}
      <div style={{ maxWidth: '720px', margin: '0 auto 36px auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>
          Explore Photography & Creators
        </h1>

        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
          <Search
            size={17}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
            }}
          />
          <input
            type="text"
            placeholder="Search by keywords, tags (#street), cameras, locations, or creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{
              paddingLeft: '46px',
              paddingRight: '100px',
              height: '48px',
              borderRadius: '30px',
              fontSize: '14px',
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              position: 'absolute',
              right: '5px',
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: '24px',
              padding: '7px 16px',
            }}
          >
            Search
          </button>
        </form>

        {/* Tab Toggle */}
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '30px',
            padding: '4px',
            marginTop: '18px',
            gap: '4px',
          }}
        >
          <button
            onClick={() => setActiveTab('posts')}
            className={`btn ${activeTab === 'posts' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '24px', padding: '6px 18px', fontSize: '13px' }}
          >
            <Camera size={14} />
            <span>Photos ({posts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '24px', padding: '6px 18px', fontSize: '13px' }}
          >
            <Users size={14} />
            <span>Creators ({users.length})</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      {loading ? (
        <PostGridSkeleton count={6} />
      ) : activeTab === 'posts' ? (
        posts.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '48px 20px',
              textAlign: 'center',
              color: 'var(--text-dim)',
            }}
          >
            No photos found matching your search. Try different tags or keywords.
          </div>
        ) : (
          <div className="photo-grid">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onSelectPost={(p) => setSelectedPost(p)}
                onPostUpdated={() => executeSearch(searchTerm)}
              />
            ))}
          </div>
        )
      ) : users.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '48px 20px',
            textAlign: 'center',
            color: 'var(--text-dim)',
          }}
        >
          No creators found with that name or username.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {users.map((u) => (
            <UserCard key={u._id} user={u} />
          ))}
        </div>
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onPostDeleted={() => {
            setPosts((prev) => prev.filter((p) => p._id !== selectedPost._id));
            setSelectedPost(null);
          }}
          onPostUpdated={() => executeSearch(searchTerm)}
          onOpenEditPost={(p) => setEditingPost(p)}
        />
      )}

      {editingPost && (
        <EditPostModal
          isOpen={!!editingPost}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={() => executeSearch(searchTerm)}
        />
      )}
    </div>
  );
};

export default SearchPage;
