import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin,
  Globe,
  Calendar,
  Grid,
  Edit3,
  UserPlus,
  UserCheck,
  Camera,
  Layers,
} from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/PostCard';
import PostDetailModal from '../components/PostDetailModal';
import EditPostModal from '../components/EditPostModal';
import EditProfileModal from '../components/EditProfileModal';
import PostGridSkeleton from '../components/SkeletonLoader';

export const ProfilePage = ({ onOpenCreateModal }) => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [postFilter, setPostFilter] = useState('all'); // 'all' | 'for-sale' | 'sold'

  // Modals
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUserProfile(username);
      if (data.success && data.user) {
        setProfileUser(data.user);
        setPosts(data.posts || []);
        setIsFollowing(data.user.isFollowing);
        setFollowersCount(data.user.followersCount);
      }
    } catch (err) {
      showToast('Could not load user profile', 'error');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profileUser) {
      document.title = `${profileUser.name} (@${profileUser.username}) — Framora`;
    } else {
      document.title = 'Profile — Framora';
    }
  }, [profileUser]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to follow photographers', 'info');
      return;
    }
    if (followingLoading || !profileUser?._id) return;

    setFollowingLoading(true);
    try {
      const res = await userService.toggleFollow(profileUser._id);
      if (res.success) {
        setIsFollowing(res.isFollowing);
        setFollowersCount(res.followersCount);
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast('Could not update follow status', 'error');
    } finally {
      setFollowingLoading(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    setSelectedPost(null);
  };

  const isSelf =
    currentUser &&
    profileUser &&
    (currentUser._id === profileUser._id ||
      currentUser.username.toLowerCase() === profileUser.username.toLowerCase());

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ width: '100%', height: '220px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }} />
        <PostGridSkeleton count={6} />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="page-container flex-center" style={{ minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#ffffff', marginBottom: '8px' }}>Photographer Not Found</h2>
          <p style={{ color: 'var(--text-dim)' }}>The creator you are looking for does not exist on Framora.</p>
        </div>
      </div>
    );
  }

  // Determine cover image URL (explicit user cover > first post image > null)
  const rawCover = profileUser?.coverImage || (posts.length > 0 ? posts[0].imageUrl : null);
  const coverUrl = rawCover && rawCover.startsWith('/uploads')
    ? `${window.location.origin}${rawCover}`
    : rawCover;

  const coverPos = profileUser?.coverPosition || { x: 50, y: 50, zoom: 1 };

  return (
    <div className="page-container">
      {/* Profile Card */}
      <div className="profile-card">
        {/* Cinematic Cover Banner */}
        <div className="profile-cover">
          {coverUrl && !coverError ? (
            <>
              <img
                src={coverUrl}
                alt={`${profileUser.name} Cover`}
                className="profile-cover-img"
                style={{
                  objectPosition: `${coverPos.x ?? 50}% ${coverPos.y ?? 50}%`,
                  transform: `scale(${coverPos.zoom ?? 1})`,
                  transformOrigin: `${coverPos.x ?? 50}% ${coverPos.y ?? 50}%`,
                }}
                onError={() => setCoverError(true)}
                decoding="async"
              />
              <div className="profile-cover-overlay" />
            </>
          ) : (
            <div className="profile-cover-fallback" />
          )}
        </div>

        {/* Profile body */}
        <div className="profile-body">
          {/* Avatar & Action Button Row */}
          <div className="profile-identity-row">
            <div className="profile-avatar-wrapper">
              <img
                src={
                  profileUser.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${profileUser.username}`
                }
                alt={profileUser.name}
                className="profile-avatar-ring"
              />
            </div>

            {/* Action Button */}
            <div className="profile-actions">
              {isSelf ? (
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  disabled={followingLoading}
                  className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ minWidth: '130px', padding: '8px 18px', fontSize: '13px' }}
                >
                  {isFollowing ? (
                    <><UserCheck size={14} color="var(--accent)" /><span>Following</span></>
                  ) : (
                    <><UserPlus size={14} /><span>Follow Creator</span></>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Profile Identity & Bio Information */}
          <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{profileUser.name}</h1>
              {profileUser.role === 'admin' && (
                <span className="badge-curator">Curator</span>
              )}
            </div>
            <div className="profile-username">@{profileUser.username}</div>

            {profileUser.bio && (
              <p className="profile-bio">{profileUser.bio}</p>
            )}

            {/* Metadata (Location, Website, Joined date) */}
            <div className="profile-meta">
              {profileUser.location && (
                <div className="profile-meta-item">
                  <MapPin size={13} color="var(--accent)" />
                  <span>{profileUser.location}</span>
                </div>
              )}
              {profileUser.website && (
                <a
                  href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-meta-item profile-link"
                >
                  <Globe size={13} />
                  <span>{profileUser.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              <div className="profile-meta-item">
                <Calendar size={13} />
                <span>Joined {new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Stats row below profile info */}
          <div className="profile-stats-row">
            <div className="profile-stat">
              <span className="profile-stat-value">{posts.length}</span>
              <span className="profile-stat-label">{posts.length === 1 ? 'Photo' : 'Photos'}</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{followersCount}</span>
              <span className="profile-stat-label">Followers</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{profileUser.followingCount || 0}</span>
              <span className="profile-stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section Filter Tabs & Title */}
      <div className="profile-section-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <Grid size={17} color="var(--accent)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Portfolio & Marketplace
          </h2>
        </div>

        {/* Marketplace Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setPostFilter('all')}
            className={`btn ${postFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '5px 12px', fontSize: '12.5px' }}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setPostFilter('for-sale')}
            className={`btn ${postFilter === 'for-sale' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '5px 12px', fontSize: '12.5px' }}
          >
            For Sale ({posts.filter((p) => p.saleStatus === 'FOR_SALE').length})
          </button>
          <button
            onClick={() => setPostFilter('sold')}
            className={`btn ${postFilter === 'sold' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '5px 12px', fontSize: '12.5px' }}
          >
            Sold ({posts.filter((p) => p.saleStatus === 'SOLD').length})
          </button>
        </div>
      </div>

      {/* Filtered Posts Grid */}
      {(() => {
        const filteredPosts = posts.filter((post) => {
          if (postFilter === 'for-sale') return post.saleStatus === 'FOR_SALE';
          if (postFilter === 'sold') return post.saleStatus === 'SOLD';
          return true;
        });

        if (filteredPosts.length === 0) {
          return (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '48px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <Layers size={32} color="var(--text-dim)" />
              <h3 style={{ color: '#ffffff', fontSize: '18px', margin: 0 }}>
                {postFilter === 'for-sale'
                  ? 'No photographs currently listed for sale'
                  : postFilter === 'sold'
                  ? 'No sold photograph records in this portfolio'
                  : 'No photos uploaded yet'}
              </h3>
              {isSelf && postFilter === 'all' && (
                <button onClick={onOpenCreateModal} className="btn btn-primary">
                  <Camera size={16} />
                  <span>Share First Photo</span>
                </button>
              )}
            </div>
          );
        }

        return (
          <div className="photo-grid">
            {filteredPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onSelectPost={(p) => setSelectedPost(p)}
                onPostUpdated={fetchProfile}
              />
            ))}
          </div>
        );
      })()}

      {/* Modals */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onPostDeleted={handlePostDeleted}
          onPostUpdated={fetchProfile}
          onOpenEditPost={(p) => setEditingPost(p)}
        />
      )}

      {editingPost && (
        <EditPostModal
          isOpen={!!editingPost}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={fetchProfile}
        />
      )}

      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onProfileUpdated={fetchProfile}
        />
      )}
    </div>
  );
};

export default ProfilePage;
