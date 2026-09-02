import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
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
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  Lock,
} from 'lucide-react';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { purchaseService } from '../services/purchaseService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../hooks/useSocket';
import EditPostModal from '../components/EditPostModal';
import ConfirmDialog from '../components/ConfirmDialog';
import PurchaseModal from '../components/PurchaseModal';
import ManageSaleModal from '../components/ManageSaleModal';

export const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Socket connection & room management
  const { status: socketStatus, on: onSocketEvent } = useSocket(id);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  // Modals
  const [isEditing, setIsEditing] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isManageSaleOpen, setIsManageSaleOpen] = useState(false);
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [downloadingOriginal, setDownloadingOriginal] = useState(false);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const data = await postService.getPostById(id);
      if (data.success && data.post) {
        setPost(data.post);
        setComments(data.post.comments || []);
        setIsLiked(data.post.isLiked);
        setLikesCount(data.post.likesCount);
        setIsBookmarked(data.post.isBookmarked);
      }
    } catch {
      showToast('Photo post not found', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (post?.title) {
      document.title = `${post.title} — Framora`;
    } else {
      document.title = 'Framora — Photography Community';
    }
  }, [post]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    const cleanId = id ? String(id).trim() : '';
    if (!cleanId) return;

    // 1. New comment created
    const unsubscribeCommentCreated = onSocketEvent('comment:created', (data) => {
      if (data && data.comment && String(data.postId) === cleanId) {
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
      if (data && data.commentId && String(data.postId) === cleanId) {
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
      if (data && String(data.postId) === cleanId) {
        setPost((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            saleStatus: 'SOLD',
            soldAt: data.soldAt || new Date(),
          };
        });
      }
    });

    return () => {
      unsubscribeCommentCreated();
      unsubscribeCommentDeleted();
      unsubscribePhotoSold();
    };
  }, [id, onSocketEvent]);

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
      }
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      showToast('Could not like post', 'error');
    }
  };

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
      }
    } catch {
      setIsBookmarked(prevBookmarked);
      showToast('Could not save post', 'error');
    }
  };

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
        // Optimistic / deduplicated insertion
        setComments((prev) => {
          if (prev.some((c) => c._id === res.comment._id)) return prev;
          return [res.comment, ...prev];
        });
        setNewComment('');
        showToast('Comment added!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsDeletingComment(true);
    try {
      const res = await postService.deleteComment(commentToDelete);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentToDelete));
        showToast('Comment deleted', 'success');
      }
    } catch {
      showToast('Could not delete comment', 'error');
    } finally {
      setIsDeletingComment(false);
      setCommentToDelete(null);
    }
  };

  const handleDeletePost = async () => {
    setIsDeletingPost(true);
    try {
      const res = await postService.deletePost(post._id);
      if (res.success) {
        showToast('Photo post deleted', 'success');
        navigate('/');
      }
    } catch {
      showToast('Could not delete post', 'error');
    } finally {
      setIsDeletingPost(false);
      setShowDeletePostConfirm(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to follow creators', 'info');
      return;
    }
    if (followingLoading || !post?.user?._id) return;

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
  };

  if (loading) {
    return (
      <div className="page-container flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ color: 'var(--accent)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Loader2 size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
          <span>Loading visual story...</span>
        </div>
      </div>
    );
  }

  if (!post) return null;

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

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost"
        style={{ marginBottom: '20px', paddingLeft: 0 }}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Creator & Marketplace Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to={`/profile/${post.user?.username}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
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
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid var(--border-subtle)',
                }}
              />
              <div>
                <div style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--text-main)' }}>
                  {post.user?.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  @{post.user?.username}
                </div>
              </div>
            </Link>

            {currentUser && !isOwner && (
              <button
                onClick={handleFollowToggle}
                className="btn btn-secondary"
                style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '20px' }}
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

          {/* Right side: Marketplace Status & Author Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* If photo is FOR SALE */}
            {isForSale && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    background: 'rgba(231, 184, 106, 0.12)',
                    border: '1px solid rgba(231, 184, 106, 0.3)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Tag size={14} color="var(--accent)" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>
                    {formattedPrice}
                  </span>
                </div>

                {!isOwner ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        showToast('Please sign in to purchase this photograph', 'info');
                        navigate('/login');
                        return;
                      }
                      setIsPurchaseModalOpen(true);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13.5px' }}
                  >
                    <ShoppingBag size={15} />
                    <span>Buy 1-of-1 Photo</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsManageSaleOpen(true)}
                    className="btn btn-secondary"
                    style={{ fontSize: '13px' }}
                  >
                    <Tag size={14} />
                    <span>Manage Sale</span>
                  </button>
                )}
              </div>
            )}

            {/* If photo is SOLD */}
            {isSold && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    background: 'rgba(15, 17, 23, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    color: 'var(--text-dim)',
                  }}
                >
                  <Lock size={13} />
                  <span>1-OF-1 ASSET SOLD</span>
                </div>

                {isBuyer && (
                  <button
                    onClick={handleDownloadOriginal}
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '13px' }}
                    disabled={downloadingOriginal}
                  >
                    {downloadingOriginal ? (
                      <Loader2 size={14} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Download size={14} />
                    )}
                    <span>Download Original</span>
                  </button>
                )}
              </div>
            )}

            {/* If owner and NOT_FOR_SALE */}
            {isOwner && !isForSale && !isSold && (
              <button
                onClick={() => setIsManageSaleOpen(true)}
                className="btn btn-secondary"
                style={{ fontSize: '13px' }}
              >
                <Tag size={14} />
                <span>Sell This Photo</span>
              </button>
            )}

            {(isOwner || isModerator) && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {isOwner && (
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-icon" title="Edit details">
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
              </div>
            )}
          </div>
        </div>

        {/* Photo View with SOLD Watermark Protection */}
        <div
          style={{
            position: 'relative',
            background: '#060708',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: '750px',
            overflow: 'hidden',
          }}
        >
          <img
            src={post.imageUrl}
            alt={post.title}
            style={{ width: '100%', maxHeight: '750px', objectFit: 'contain' }}
          />

          {/* Tasteful SOLD Watermark Overlay */}
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
                  padding: '12px 28px',
                  borderRadius: '8px',
                  background: 'rgba(10, 11, 14, 0.65)',
                  backdropFilter: 'blur(6px)',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  transform: 'rotate(-8deg)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  userSelect: 'none',
                }}
              >
                SOLD — FRAMORA
              </div>
            </div>
          )}

          {/* Buyer Provenance Badge */}
          {isBuyer && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'rgba(10, 11, 14, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#4ade80',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={14} />
              <span>COLLECTED BY YOU</span>
            </div>
          )}
        </div>

        {/* Post Info & Story */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
              {post.title}
            </h1>
            {post.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent)', fontSize: '13.5px' }}>
                <MapPin size={14} />
                <span>{post.location}</span>
              </div>
            )}
          </div>

          {post.caption && (
            <p style={{ color: 'var(--text-soft)', fontSize: '14.5px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {post.caption}
            </p>
          )}

          {/* EXIF Panel */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-dim)',
                fontWeight: '700',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Camera size={13} color="var(--accent)" />
              <span>Camera Gear & Shooting Settings</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              {post.camera && (
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Camera</span>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)' }}>{post.camera}</span>
                </div>
              )}
              {post.lens && (
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Lens</span>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)' }}>{post.lens}</span>
                </div>
              )}
              {post.focalLength && (
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Focal Length</span>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>{post.focalLength}</span>
                </div>
              )}
              {post.aperture && (
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Aperture</span>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>{post.aperture}</span>
                </div>
              )}
              {post.shutterSpeed && (
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Shutter</span>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>{post.shutterSpeed}</span>
                </div>
              )}
              {post.iso && (
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>ISO</span>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>{post.iso}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              {post.tags.map((tag, i) => (
                <Link key={i} to={`/search?tag=${encodeURIComponent(tag)}`} className="tag-pill">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Like / Bookmark Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleLike}
                className="btn btn-secondary"
                style={{
                  color: isLiked ? '#E07070' : 'var(--text-soft)',
                  borderColor: isLiked ? 'rgba(224, 112, 112, 0.35)' : 'var(--border-subtle)',
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
                }}
              >
                <Bookmark size={16} fill={isBookmarked ? 'var(--accent)' : 'none'} />
                <span>{isBookmarked ? 'Saved to Bookmarks' : 'Bookmark'}</span>
              </button>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={13} />
              <span>Published on {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Real-time Comments Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '7px', margin: 0 }}>
                <MessageCircle size={16} color="var(--accent)" />
                <span>Community Comments ({comments.length})</span>
              </h3>

              {/* Live Socket Status Indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11.5px',
                  color:
                    socketStatus === 'connected'
                      ? '#4ade80'
                      : socketStatus === 'reconnecting'
                      ? 'var(--accent)'
                      : 'var(--text-dim)',
                }}
                title={`Real-time Sync Status: ${socketStatus}`}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background:
                      socketStatus === 'connected'
                        ? '#4ade80'
                        : socketStatus === 'reconnecting'
                        ? 'var(--accent)'
                        : '#64748b',
                    boxShadow: socketStatus === 'connected' ? '0 0 6px rgba(74, 222, 128, 0.6)' : 'none',
                    display: 'inline-block',
                  }}
                />
                <span style={{ textTransform: 'capitalize' }}>
                  {socketStatus === 'connected'
                    ? 'Live Sync'
                    : socketStatus === 'reconnecting'
                    ? 'Reconnecting...'
                    : 'Offline'}
                </span>
              </div>
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder={isAuthenticated ? 'Join the discussion...' : 'Sign in to add a comment'}
                disabled={!isAuthenticated || submittingComment}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-field"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                disabled={!isAuthenticated || !newComment.trim() || submittingComment}
                className="btn btn-primary"
              >
                {submittingComment ? (
                  <Loader2 size={15} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Send size={15} />
                )}
                <span>{submittingComment ? 'Posting...' : 'Post'}</span>
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {comments.map((c) => (
                <div
                  key={c._id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    gap: '12px',
                  }}
                >
                  <Link to={`/profile/${c.user?.username}`}>
                    <img
                      src={
                        c.user?.avatar ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${c.user?.username || 'user'}`
                      }
                      alt={c.user?.name}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </Link>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <Link
                        to={`/profile/${c.user?.username}`}
                        style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', textDecoration: 'none' }}
                      >
                        @{c.user?.username || 'user'}
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                        {currentUser &&
                          (currentUser._id === c.user?._id ||
                            currentUser._id === c.user ||
                            currentUser.role === 'admin') && (
                            <button
                              onClick={() => setCommentToDelete(c._id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                              aria-label="Delete comment"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-soft)', margin: 0 }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditing && (
        <EditPostModal
          isOpen={isEditing}
          post={post}
          onClose={() => setIsEditing(false)}
          onPostUpdated={fetchPost}
        />
      )}

      {isPurchaseModalOpen && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          post={post}
          onClose={() => setIsPurchaseModalOpen(false)}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {isManageSaleOpen && (
        <ManageSaleModal
          isOpen={isManageSaleOpen}
          post={post}
          onClose={() => setIsManageSaleOpen(false)}
          onSaleUpdated={(updated) => setPost((prev) => ({ ...prev, ...updated }))}
        />
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showDeletePostConfirm}
        title="Delete Photo Post"
        message="Are you sure you want to permanently delete this photo? This action cannot be undone."
        confirmText="Delete Post"
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

export default PostDetailPage;
