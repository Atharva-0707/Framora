import React from 'react';

export const PostCardSkeleton = () => {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="skeleton" style={{ width: '100%', aspectRatio: '4/3' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '4px' }} />
            <div className="skeleton" style={{ width: '40%', height: '11px' }} />
          </div>
        </div>
        <div className="skeleton" style={{ width: '85%', height: '16px' }} />
        <div style={{ display: 'flex', gap: '6px' }}>
          <div className="skeleton" style={{ width: '50px', height: '22px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ width: '60px', height: '22px', borderRadius: '12px' }} />
        </div>
      </div>
    </div>
  );
};

export const PostGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="photo-grid">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default PostGridSkeleton;
