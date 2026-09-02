import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Camera,
  Search,
  Plus,
  Bookmark,
  Compass,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Info,
  ShoppingBag,
} from 'lucide-react';

export const Navbar = ({ onOpenCreateModal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="glass-nav" aria-label="Main navigation">
      <div className="nav-inner">
        {/* Brand */}
        <Link to="/" className="nav-brand" aria-label="Framora home">
          <div className="nav-logo-mark">
            <Camera size={18} color="var(--accent)" strokeWidth={2} />
          </div>
          <span className="nav-brand-name">Framora</span>
        </Link>

        {/* Global Search — center */}
        <form
          onSubmit={handleSearchSubmit}
          className="nav-search"
          role="search"
          aria-label="Search photos"
        >
          <Search size={14} className="nav-search-icon" />
          <input
            type="search"
            placeholder="Search photos, tags, cameras, creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
            aria-label="Search query"
          />
        </form>

        {/* Desktop Nav */}
        <div className="nav-links desktop-nav">
          <Link to="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>
            <Compass size={16} />
            <span>Feed</span>
          </Link>

          <Link to="/about" className={`nav-link${isActive('/about') ? ' active' : ''}`}>
            <Info size={16} />
            <span>About</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/bookmarks" className={`nav-link${isActive('/bookmarks') ? ' active' : ''}`}>
                <Bookmark size={16} />
                <span>Saved</span>
              </Link>

              <button
                onClick={onOpenCreateModal}
                className="btn btn-primary"
                style={{ padding: '7px 14px', fontSize: '13px', marginLeft: '6px' }}
                aria-label="Create new post"
              >
                <Plus size={16} />
                <span>Post</span>
              </button>

              {/* User Dropdown */}
              <div style={{ position: 'relative', marginLeft: '4px' }} ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="user-pill"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  aria-label="User menu"
                >
                  <img
                    src={
                      user?.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`
                    }
                    alt={user?.name}
                    className="user-pill-avatar"
                  />
                  <span className="user-pill-name">{user?.username}</span>
                </button>

                {userMenuOpen && (
                  <div className="nav-dropdown" role="menu">
                    <Link
                      to={`/profile/${user?.username}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="dropdown-item"
                      role="menuitem"
                    >
                      <UserIcon size={15} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/purchases"
                      onClick={() => setUserMenuOpen(false)}
                      className="dropdown-item"
                      role="menuitem"
                    >
                      <ShoppingBag size={15} color="var(--accent)" />
                      <span>Purchases & Sales</span>
                    </Link>
                    <Link
                      to="/bookmarks"
                      onClick={() => setUserMenuOpen(false)}
                      className="dropdown-item"
                      role="menuitem"
                    >
                      <Bookmark size={15} />
                      <span>Saved Posts</span>
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="dropdown-item danger"
                      role="menuitem"
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: '13.5px' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '13.5px' }}>
                Join Framora
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-ghost btn-icon mobile-menu-btn"
          style={{ display: 'none' }}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '12px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: 'slideDown 0.18s ease-out',
          }}
          role="navigation"
          aria-label="Mobile navigation"
        >
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} style={{ padding: '0 0 8px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '13px', top: '12px', color: 'var(--text-dim)', pointerEvents: 'none' }} />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nav-search-input"
              style={{ width: '100%', height: '40px', paddingLeft: '38px' }}
              aria-label="Mobile search"
            />
          </form>

          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <Compass size={18} />
            <span>Explore Feed</span>
          </Link>

          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <Info size={18} />
            <span>About Framora</span>
          </Link>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenCreateModal(); }}
                className="btn btn-primary"
                style={{ justifyContent: 'flex-start', margin: '4px 0' }}
              >
                <Plus size={18} />
                <span>Share New Photo</span>
              </button>
              <Link to={`/profile/${user?.username}`} onClick={() => setMobileMenuOpen(false)} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                <UserIcon size={18} />
                <span>My Profile (@{user?.username})</span>
              </Link>
              <Link to="/purchases" onClick={() => setMobileMenuOpen(false)} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                <ShoppingBag size={18} color="var(--accent)" />
                <span>Purchases & Sales</span>
              </Link>
              <Link to="/bookmarks" onClick={() => setMobileMenuOpen(false)} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                <Bookmark size={18} />
                <span>Saved Posts</span>
              </Link>
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); navigate('/login'); }}
                className="btn btn-danger"
                style={{ justifyContent: 'flex-start' }}
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary">Join Framora</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
