import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Compass } from 'lucide-react';

export const NotFoundPage = () => {
  React.useEffect(() => {
    document.title = '404 — Framora';
  }, []);

  return (
    <div className="page-container flex-center" style={{ minHeight: '70vh', textAlign: 'center' }}>
      <div style={{ maxWidth: '440px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <Camera size={26} color="var(--accent)" />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
          404 — Lost Exposure
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '14.5px', marginBottom: '24px' }}>
          The page or photography post you are looking for has vanished or does not exist.
        </p>
        <Link to="/" className="btn btn-primary">
          <Compass size={16} />
          <span>Return to Feed</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
