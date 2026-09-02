import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Heart,
  Bookmark,
  MessageCircle,
  MapPin,
  Camera,
  Trash2,
  Edit,
  Send,
  UserPlus,
  UserCheck,
  Calendar,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Download,
  Lock,
  Loader2,
} from 'lucide-react';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { purchaseService } from '../services/purchaseService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../hooks/useSocket';
import ConfirmDialog from './ConfirmDialog';
import PurchaseModal from './PurchaseModal';
import ManageSaleModal from './ManageSaleModal';

export const PostDetailModal = ({
  post: initialPost,
  onClose,
  onPostDeleted,
  onPostUpdated,
  onOpenEditPost,
}) => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [isLiked, setIsLiked] = useState(initialPost.isLiked || false);
  const [likesCount, setLikesCount] = useState(
    initialPost.likesCount || (initialPost.likes ? initialPost.likes.length : 0)
  );
  const [isBookmarked, setIsBookmarked] = useState(initialPost.isBookmarked || false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  // Modals
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isManageSaleOpen, setIsManageSaleOpen] = useState(false);
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [downloadingOriginal, setDownloadingOriginal] = useState(false);

  // Socket connection & room management
  const { status: socketStatus, on: onSocketEvent } = useSocket(initialPost?._id);

  // Fetch full details and comments
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await postService.getPostById(initialPost._id);
        if (data.success && data.post) {
          setPost(data.post);
          setComments(data.post.comments || []);
          setIsLiked(data.post.isLiked);
          setLikesCount(data.post.likesCount);
          setIsBookmarked(data.post.isBookmarked);
        }
      } catch (err) {
        console.error('Error fetching post details:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchDetails();
  }, [initialPost._id]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    const postId = initialPost?._id ? String(initialPost._id) : '';
    if (!postId) return;

    // 1. New comment created
    const unsubscribeCommentCreated = onSocketEvent('comment:created', (data) => {
      if (data && data.comment && String(data.postId) === postId) {
        setComments((prev) => {
          if (prev.some((c) => String(c._id) === String(data.comment._id))) {
            return prev;
          }
          return [data.comment, ...prev];
        });
        setPost((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            commentsCount:
              data.commentsCount !== undefined
                ? data.commentsCount
                : (prev.commentsCount || 0) + 1,
          };
        });
      }
    });

    // 2. Comment deleted
    const unsubscribeCommentDeleted = onSocketEvent('comment:deleted', (data) => {
      if (data && data.commentId && String(data.postId) === postId) {
        setComments((prev) =>
          prev.filter((c) => String(c._id) !== String(data.commentId))
        );
        setPost((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            commentsCount:
              data.commentsCount !== undefined
                ? data.commentsCount
                : Math.max(0, (prev.commentsCount || 1) - 1),
          };
        });
      }
    });

    // 3. Photo sold in real-time
    const unsubscribePhotoSold = onSocketEvent('photo:sold', (data) => {
      if (data && String(data.postId) === postId) {
        setPost((prev) => ({
          ...prev,
          saleStatus: 'SOLD',
          soldAt: data.soldAt || new Date(),
        }));
      }
    });

    return () => {
      unsubscribeCommentCreated();
      unsubscribeCommentDeleted();
      unsubscribePhotoSold();
    };
  }, [initialPost?._id, onSocketEvent]);

  // Handle Like
  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to like this photo', 'info');
      return;
    }
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await postService.toggleLike(post._id);
      if (res.success) {
        setIsLiked(res.isLiked);
        setLikesCount(res.likesCount);
        if (onPostUpdated) onPostUpdated();
      }
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      showToast('Could not like post.', 'error');
    }
  };

  // Handle Bookmark
  const handleBookmark = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to bookmark this photo', 'info');
      return;
    }
    const prevBookmarked = isBookmarked;
    setIsBookmarked(!prevBookmarked);

    try {
      const res = await postService.toggleBookmark(post._id);
      if (res.success) {
        setIsBookmarked(res.isBookmarked);
        showToast(res.message, 'success');
        if (onPostUpdated) onPostUpdated();
      }
    } catch {
      setIsBookmarked(prevBookmarked);
      showToast('Could not save post.', 'error');
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to comment', 'info');
      return;
    }
    if (!newComment.trim() || submittingComment) return;

    const commentText = newComment.trim();
    setSubmittingComment(true);
    try {
      const res = await postService.addComment(post._id, commentText);
      if (res.success && res.comment) {
        setComments((prev) => {
          if (prev.some((c) => c._id === res.comment._id)) return prev;
          return [res.comment, ...prev];
        });
        setNewComment('');
        showToast('Comment posted!', 'success');
        if (onPostUpdated) onPostUpdated();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsDeletingComment(true);
    try {
      const res = await postService.deleteComment(commentToDelete);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentToDelete));
        showToast('Comment deleted', 'success');
        if (onPostUpdated) onPostUpdated();
      }
    } catch {
      showToast('Could not delete comment', 'error');
    } finally {
      setIsDeletingComment(false);
      setCommentToDelete(null);
    }
  };

  // Handle Delete Post
  const handleDeletePost = async () => {
    setIsDeletingPost(true);
    try {
      const res = await postService.deletePost(post._id);
      if (res.success) {
        showToast('Photo deleted successfully', 'success');
        onClose();
        if (onPostDeleted) onPostDeleted(post._id);
      }
    } catch {
      showToast('Could not delete post', 'error');
    } finally {
      setIsDeletingPost(false);
      setShowDeletePostConfirm(false);
    }
  };

  // Handle Follow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to follow photographers', 'info');
      return;
    }
    if (followingLoading || !post.user?._id) return;

    setFollowingLoading(true);
    try {
      const res = await userService.toggleFollow(post.user._id);
      if (res.success) {
        setIsFollowing(res.isFollowing);
        showToast(res.message, 'success');
      }
    } catch {
      showToast('Could not update follow status', 'error');
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleDownloadOriginal = async () => {
    setDownloadingOriginal(true);
    try {
      const data = await purchaseService.getDownloadAccess(post._id);
      if (data.success && data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename || `${post.title || 'framora_photo'}.jpg`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Download started for original high-resolution photo!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not retrieve download link', 'error');
    } finally {
      setDownloadingOriginal(false);
    }
  };

  const handlePurchaseSuccess = (result) => {
    setPost((prev) => ({
      ...prev,
      saleStatus: 'SOLD',
      soldTo: currentUser,
      soldAt: result.purchase?.completedAt || new Date(),
      isPurchasedByCurrentUser: true,
    }));
    if (onPostUpdated) onPostUpdated();
  };

  const currentUserId = currentUser ? currentUser._id?.toString() : null;
  const postOwnerId = post.user ? (post.user._id ? post.user._id.toString() : post.user.toString()) : null;
  const isOwner = Boolean(currentUserId && postOwnerId && currentUserId === postOwnerId);
  const isModerator = Boolean(currentUser && currentUser.role === 'admin');
  const isBuyer = post.isPurchasedByCurrentUser || (post.soldTo && (post.soldTo._id ? post.soldTo._id.toString() === currentUserId : post.soldTo.toString() === currentUserId));

  const isForSale = post.saleStatus === 'FOR_SALE';
  const isSold = post.saleStatus === 'SOLD';

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: post.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(post.price || 0);

  const imageUrl = post.imageUrl;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog modal-dialog-large"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          background: 'var(--bg-modal)',
          padding: 0,
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
          }}
        >
          {/* Creator Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to={`/profile/${post.user?.username}`}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
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
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid var(--border-subtle)',
                }}
              />
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>
                  {post.user?.name || 'Photographer'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                  @{post.user?.username || 'creator'}
                </div>
              </div>
            </Link>

            {/* Follow button if not own post */}
            {currentUser && !isOwner && (
              <button
                onClick={handleFollowToggle}
                className="btn btn-secondary"
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  borderRadius: '20px',
                }}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={13} color="var(--accent)" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={13} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Header Actions: Marketplace & Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* For Sale Pill */}
            {isForSale && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    background: 'rgba(231, 184, 106, 0.12)',
                    border: '1px solid rgba(231, 184, 106, 0.3)',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                  }}
                >
                  {formattedPrice}
                </span>

                {!isOwner ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        showToast('Please sign in to purchase this photograph', 'info');
                        return;
                      }
                      setIsPurchaseModalOpen(true);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '5px 12px', fontSize: '12.5px' }}
                  >
                    <ShoppingBag size={14} />
                    <span>Buy</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsManageSaleOpen(true)}
                    className="btn btn-secondary"
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                  >
                    <Tag size={13} />
                    <span>Sale Settings</span>
                  </button>
                )}
              </div>
            )}

            {/* Sold Pill */}
            {isSold && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    background: 'rgba(15, 17, 23, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'var(--text-dim)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  SOLD
                </span>
                {isBuyer && (
                  <button
                    onClick={handleDownloadOriginal}
                    className="btn btn-primary"
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                    disabled={downloadingOriginal}
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                )}
              </div>
            )}

            {/* If owner and NOT_FOR_SALE */}
            {isOwner && !isForSale && !isSold && (
              <button
                onClick={() => setIsManageSaleOpen(true)}
                className="btn btn-secondary"
                style={{ padding: '5px 10px', fontSize: '12px' }}
              >
                <Tag size={13} />
                <span>Sell Photo</span>
              </button>
            )}

            {/* Owner/Moderator Controls */}
            {(isOwner || isModerator) && (
              <>
                {isOwner && (
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenEditPost) onOpenEditPost(post);
                    }}
                    className="btn btn-secondary btn-icon"
                    title="Edit post"
                  >
                    <Edit size={15} />
                  </button>
                )}
                <button
                  onClick={() => setShowDeletePostConfirm(true)}
                  className="btn btn-danger btn-icon"
                  title="Delete post"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              style={{ color: 'var(--text-main)' }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            overflowY: 'auto',
          }}
          className="modal-content-grid"
        >
          {/* Left / Top: High-Res Image View with Watermark Protection */}
          <div
            style={{
              background: '#060708',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '380px',
              maxHeight: '620px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <img
              src={imageUrl}
              alt={post.title}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '620px',
                objectFit: 'contain',
              }}
            />

            {/* SOLD Watermark Overlay */}
            {isSold && !isBuyer && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
                }}
              >
                <div
                  style={{
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    background: 'rgba(10, 11, 14, 0.65)',
                    backdropFilter: 'blur(6px)',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '18px',
                    fontWeight: 800,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    transform: 'rotate(-8deg)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  }}
                >
                  SOLD — FRAMORA
                </div>
              </div>
            )}

            {/* Buyer Badge Overlay */}
            {isBuyer && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(10, 11, 14, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#4ade80',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <ShieldCheck size={13} />
                <span>COLLECTED BY YOU</span>
              </div>
            )}
          </div>

          {/* Right / Bottom: Story, Camera Specs & Comments */}
          <div
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              background: 'var(--bg-modal)',
            }}
          >
            {/* Title & Location */}
            <div>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: 'var(--text-main)',
                  marginBottom: '4px',
                }}
              >
                {post.title}
              </h2>
              {post.location && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: 'var(--accent)',
                    fontSize: '12.5px',
                  }}
                >
                  <MapPin size={13} />
                  <span>{post.location}</span>
                </div>
              )}
            </div>

            {/* Story / Caption */}
            {post.caption && (
              <p
                style={{
                  color: 'var(--text-soft)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                }}
              >
                {post.caption}
              </p>
            )}

            {/* EXIF Technical Panel */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-dim)',
                  fontWeight: '700',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Camera size={13} color="var(--accent)" />
                <span>EXIF Equipment & Specs</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '10px',
                }}
              >
                {post.camera && (
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Camera</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{post.camera}</span>
                  </div>
                )}
                {post.lens && (
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Lens</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{post.lens}</span>
                  </div>
                )}
                {post.focalLength && (
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Focal Length</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>{post.focalLength}</span>
                  </div>
                )}
                {post.aperture && (
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Aperture</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>{post.aperture}</span>
                  </div>
                )}
                {post.shutterSpeed && (
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Shutter</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>{post.shutterSpeed}</span>
                  </div>
                )}
                {post.iso && (
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>ISO</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>{post.iso}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {post.tags.map((tag, i) => (
                  <Link
                    key={i}
                    to={`/search?tag=${encodeURIComponent(tag)}`}
                    onClick={onClose}
                    className="tag-pill"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Interaction Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handleLike}
                  className="btn btn-secondary"
                  style={{
                    color: isLiked ? '#E07070' : 'var(--text-soft)',
                    borderColor: isLiked ? 'rgba(224, 112, 112, 0.35)' : 'var(--border-subtle)',
                    padding: '7px 14px',
                    fontSize: '13px',
                  }}
                >
                  <Heart size={16} fill={isLiked ? '#E07070' : 'none'} strokeWidth={isLiked ? 0 : 2} />
                  <span>{likesCount} Likes</span>
                </button>

                <button
                  onClick={handleBookmark}
                  className="btn btn-secondary"
                  style={{
                    color: isBookmarked ? 'var(--accent)' : 'var(--text-soft)',
                    borderColor: isBookmarked ? 'var(--accent-border)' : 'var(--border-subtle)',
                    padding: '7px 14px',
                    fontSize: '13px',
                  }}
                >
                  <Bookmark size={16} fill={isBookmarked ? 'var(--accent)' : 'none'} />
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Calendar size={13} />
                <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Comments Section with Socket.IO Realtime Indicator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    margin: 0,
                  }}
                >
                  <MessageCircle size={15} color="var(--accent)" />
                  <span>Comments ({comments.length})</span>
                </h3>

                {/* Live Socket Status Dot */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    color: socketStatus === 'connected' ? '#4ade80' : 'var(--text-dim)',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: socketStatus === 'connected' ? '#4ade80' : '#64748b',
                    }}
                  />
                  <span>{socketStatus === 'connected' ? 'Live' : 'Offline'}</span>
                </div>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder={
                    isAuthenticated
                      ? 'Add to the discussion or ask about gear...'
                      : 'Sign in to join the discussion...'
                  }
                  disabled={!isAuthenticated || submittingComment}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input-field"
                  style={{ flex: 1, fontSize: '13px' }}
                />
                <button
                  type="submit"
                  disabled={!isAuthenticated || !newComment.trim() || submittingComment}
                  className="btn btn-primary"
                  style={{ padding: '0 16px' }}
                >
                  {submittingComment ? (
                    <Loader2 size={15} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </form>

              {/* Comments List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >
                {loadingComments ? (
                  <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px 0',
                      color: 'var(--text-dim)',
                      fontSize: '13px',
                    }}
                  >
                    No comments yet. Be the first to start the conversation!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        gap: '10px',
                      }}
                    >
                      <Link to={`/profile/${comment.user?.username}`} onClick={onClose}>
                        <img
                          src={
                            comment.user?.avatar ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user?.username || 'user'}`
                          }
                          alt={comment.user?.name}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      </Link>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '2px',
                          }}
                        >
                          <Link
                            to={`/profile/${comment.user?.username}`}
                            onClick={onClose}
                            style={{
                              fontSize: '12.5px',
                              fontWeight: '600',
                              color: 'var(--text-main)',
                              textDecoration: 'none',
                            }}
                          >
                            @{comment.user?.username || 'photographer'}
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            {currentUser &&
                              (currentUser._id === comment.user?._id ||
                                currentUser._id === comment.user ||
                                currentUser.role === 'admin') && (
                                <button
                                  onClick={() => setCommentToDelete(comment._id)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--danger)',
                                    cursor: 'pointer',
                                    padding: '2px',
                                  }}
                                  title="Delete comment"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                          </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-soft)', lineHeight: '1.4', margin: 0 }}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 900px) {
            .modal-content-grid {
              grid-template-columns: 1.15fr 0.85fr !important;
            }
          }
        `}</style>
      </div>

      {/* Purchase Modal */}
      {isPurchaseModalOpen && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          post={post}
          onClose={() => setIsPurchaseModalOpen(false)}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Manage Sale Modal */}
      {isManageSaleOpen && (
        <ManageSaleModal
          isOpen={isManageSaleOpen}
          post={post}
          onClose={() => setIsManageSaleOpen(false)}
          onSaleUpdated={(updated) => {
            setPost((prev) => ({ ...prev, ...updated }));
            if (onPostUpdated) onPostUpdated();
          }}
        />
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showDeletePostConfirm}
        title="Delete Photo"
        message="Are you sure you want to permanently delete this photo? This action cannot be undone."
        confirmText="Delete Photo"
        cancelText="Cancel"
        isDestructive={true}
        loading={isDeletingPost}
        onConfirm={handleDeletePost}
        onCancel={() => setShowDeletePostConfirm(false)}
      />

      <ConfirmDialog
        isOpen={!!commentToDelete}
        title="Delete Comment"
        message="Are you sure you want to remove this comment?"
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        loading={isDeletingComment}
        onConfirm={handleDeleteComment}
        onCancel={() => setCommentToDelete(null)}
      />
    </div>
  );
};

export default PostDetailModal;
