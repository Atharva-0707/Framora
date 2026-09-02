import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export const UserCard = ({ user: initialUser }) => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [isFollowing, setIsFollowing] = useState(initialUser.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(initialUser.followersCount || 0);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to follow creators', 'info');
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const res = await userService.toggleFollow(initialUser._id);
      if (res.success) {
        setIsFollowing(res.isFollowing);
        setFollowersCount(res.followersCount);
        showToast(res.message, 'success');
      }
    } catch {
      showToast('Could not update follow', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isSelf = currentUser && currentUser._id === initialUser._id;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'all var(--ease-smooth)',
      }}
    >
      <Link
        to={`/profile/${initialUser.username}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          textDecoration: 'none',
          color: 'inherit',
          flex: 1,
          minWidth: 0,
        }}
      >
        <img
          src={
            initialUser.avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${initialUser.username}`
          }
          alt={initialUser.name}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid var(--border-subtle)',
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--text-main)' }} className="truncate-text">
            {initialUser.name}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--accent)', fontWeight: '500' }} className="truncate-text">
            @{initialUser.username}
          </div>
          {initialUser.bio && (
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }} className="truncate-text">
              {initialUser.bio}
            </div>
          )}
        </div>
      </Link>

      {!isSelf && (
        <button
          onClick={handleFollowToggle}
          disabled={loading}
          className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
          style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '20px' }}
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
  );
};

export default UserCard;
