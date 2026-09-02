import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, MapPin, Camera } from 'lucide-react';
import { postService } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import GearBadge from './GearBadge';

export const PostCard = ({ post, onSelectPost, onPostUpdated }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(
    post.likesCount || (post.likes ? post.likes.length : 0)
  );
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please sign in to like photos', 'info');
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await postService.toggleLike(post._id);
      if (res.success) {
        setIsLiked(res.isLiked);
        setLikesCount(res.likesCount);
      }
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      showToast('Could not update like. Try again.', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please sign in to bookmark photos', 'info');
      return;
    }
    if (isBookmarking) return;

    setIsBookmarking(true);
    const prev = isBookmarked;
    setIsBookmarked(!prev);

    try {
      const res = await postService.toggleBookmark(post._id);
      if (res.success) {
        setIsBookmarked(res.isBookmarked);
        showToast(res.message, 'success');
      }
    } catch {
      setIsBookmarked(prev);
      showToast('Could not save post. Try again.', 'error');
    } finally {
      setIsBookmarking(false);
    }
  };

  const imageUrl = post.imageUrl;

  return (
    <div className="post-card">
      {/* Image */}
      <div className="post-card-image-wrap" onClick={() => onSelectPost(post)}>
        <img
          src={imageUrl}
          alt={post.title}
          className="post-card-image"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="post-image-overlay">
          {/* Top row: location + bookmark */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {post.location && (
                <span
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(6px)',
                    padding: '3px 9px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <MapPin size={10} color="var(--accent)" />
                  <span className="truncate-text" style={{ maxWidth: '110px' }}>
                    {post.location}
                  </span>
                </span>
              )}

              {post.saleStatus === 'FOR_SALE' && (
                <span
                  style={{
                    background: 'rgba(231, 184, 106, 0.95)',
                    color: '#0a0b0e',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  FOR SALE · ₹{post.price}
                </span>
              )}

              {post.saleStatus === 'SOLD' && (
                <span
                  style={{
                    background: 'rgba(15, 17, 23, 0.85)',
                    color: 'var(--text-dim)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px',
                  }}
                >
                  SOLD
                </span>
              )}
            </div>

            <button
              onClick={handleBookmark}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark photo'}
              style={{
                background: isBookmarked ? 'var(--accent)' : 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)',
                border: 'none',
                color: isBookmarked ? '#0A0800' : '#ffffff',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <Bookmark size={13} fill={isBookmarked ? '#0A0800' : 'none'} />
            </button>
          </div>

          {/* Bottom: title + tags */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontSize: '14.5px',
                fontWeight: '700',
                textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                marginBottom: '5px',
                lineHeight: '1.3',
              }}
            >
              {post.title}
            </h4>
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {post.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(4px)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      color: '#f0ede8',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div
        onClick={() => onSelectPost(post)}
        style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '9px', flex: 1 }}
      >
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            to={`/profile/${post.user?.username || ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <img
              src={
                post.user?.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user?.username || 'user'}`
              }
              alt={post.user?.name}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid var(--border-subtle)',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.2' }}>
                {post.user?.name || 'Photographer'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                @{post.user?.username || 'creator'}
              </div>
            </div>
          </Link>

          {post.camera && (
            <span
              title={post.camera}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10.5px',
                color: 'var(--text-dim)',
                background: 'var(--bg-surface)',
                padding: '2px 7px',
                borderRadius: '5px',
                maxWidth: '110px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Camera size={10} />
              <span className="truncate-text">{post.camera}</span>
            </span>
          )}
        </div>

        {/* EXIF Gear */}
        {(post.lens || post.aperture || post.shutterSpeed || post.iso) && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {post.lens && <GearBadge type="lens" value={post.lens} />}
            {post.aperture && <GearBadge type="aperture" value={post.aperture} />}
            {post.shutterSpeed && <GearBadge type="shutter" value={post.shutterSpeed} />}
            {post.iso && <GearBadge type="iso" value={`ISO ${post.iso}`} />}
          </div>
        )}

        {/* Footer actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '7px',
            borderTop: '1px solid rgba(255, 255, 255, 0.055)',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={handleLike}
              style={{
                background: 'transparent',
                border: 'none',
                color: isLiked ? '#E07070' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '600',
                padding: '2px 0',
                transition: 'color 0.15s',
              }}
            >
              <Heart
                size={15}
                fill={isLiked ? '#E07070' : 'none'}
                strokeWidth={isLiked ? 0 : 2}
              />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onSelectPost(post); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '500',
                padding: '2px 0',
              }}
            >
              <MessageCircle size={15} />
              <span>{post.commentsCount || 0}</span>
            </button>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onSelectPost(post); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '11.5px',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            View →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
