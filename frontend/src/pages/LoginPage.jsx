import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const DEMO_ACCOUNTS = [
  {
    email: 'elena@framora.art',
    name: 'Elena Rodriguez',
    role: 'Landscape · Astro',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
  },
  {
    email: 'kai@framora.art',
    name: 'Kai Takahashi',
    role: 'Street · Tokyo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
  },
  {
    email: 'maya@framora.art',
    name: 'Maya Chen',
    role: 'Wildlife · Nature',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80',
  },
  {
    email: 'marcus@framora.art',
    name: 'Marcus Vance',
    role: 'Architecture · Admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
  },
];

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  React.useEffect(() => {
    document.title = 'Sign In — Framora';
  }, []);

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email or username is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFieldErrors({});
    try {
      const res = await login({ email: email.trim(), password });
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setFieldErrors({ general: msg });
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setLoading(true);
    try {
      const res = await login({ email: demoEmail, password: 'password123' });
      if (res.success) {
        showToast(`Signed in as ${res.user.name}`, 'success');
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to sign in to the demo account.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT — Cinematic Visual Panel */}
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=90"
          alt="Photography landscape"
          className="auth-visual-img"
        />
        <div className="auth-visual-overlay" />

        {/* Brand mark in top-left */}
        <div className="auth-visual-brand">
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(231, 184, 106, 0.2)',
            border: '1px solid rgba(231, 184, 106, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Camera size={17} color="var(--accent)" strokeWidth={2} />
          </div>
          <span className="auth-visual-brand-name">Framora</span>
        </div>

        {/* Bottom editorial quote */}
        <div className="auth-visual-content">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(231, 184, 106, 0.15)',
            border: '1px solid rgba(231, 184, 106, 0.3)',
            padding: '4px 12px',
            borderRadius: '20px',
            marginBottom: '16px',
          }}>
            <Camera size={11} color="var(--accent)" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Photography Community
            </span>
          </div>
          <div className="auth-visual-tagline">
            Every frame<br />has a story.
          </div>
          <p className="auth-visual-sub">
            Share your photographs, camera gear, and the moments behind every shot with a community that cares about craft.
          </p>
        </div>
      </div>

      {/* RIGHT — Auth Form Panel */}
      <div className="auth-panel">
        <div className="auth-form-container">
          {/* Logo mark — mobile only */}
          <div className="auth-logo-mark" style={{ display: 'flex' }}>
            <Camera size={22} color="var(--accent)" strokeWidth={2} />
          </div>

          <p className="auth-eyebrow">Framora Community</p>
          <h1 className="auth-heading">Welcome back.</h1>
          <p className="auth-subheading">
            Sign in to discover photographs, stories, and creators.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {fieldErrors.general && (
              <div
                style={{
                  background: 'var(--danger-dim)',
                  border: '1px solid rgba(224, 85, 85, 0.3)',
                  color: 'var(--danger)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                }}
                role="alert"
              >
                {fieldErrors.general}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="input-label">Email or Username</label>
              <div className="input-wrapper">
                <Mail size={15} className="input-icon" />
                <input
                  id="login-email"
                  type="text"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={`input-field ${fieldErrors.email ? 'is-invalid' : ''}`}
                  style={fieldErrors.email ? { borderColor: 'var(--danger)' } : {}}
                  autoComplete="email"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p style={{ color: 'var(--danger)', fontSize: '11.5px', marginTop: '4px' }}>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="input-label">Password</label>
              <div className="input-wrapper has-right-icon">
                <Lock size={15} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  className={`input-field ${fieldErrors.password ? 'is-invalid' : ''}`}
                  style={fieldErrors.password ? { borderColor: 'var(--danger)' } : {}}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p style={{ color: 'var(--danger)', fontSize: '11.5px', marginTop: '4px' }}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '14.5px', marginTop: '4px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '15px', height: '15px', border: '2px solid rgba(0,0,0,0.2)',
                    borderTopColor: 'rgba(0,0,0,0.7)', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">Quick Access</span>
            <div className="auth-divider-line" />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginBottom: '10px', textAlign: 'center' }}>
              Try a demo photographer account — password is <code style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent)', fontSize: '11px' }}>password123</code>
            </p>
            <div className="demo-grid">
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.email}
                  type="button"
                  onClick={() => handleDemoLogin(acct.email)}
                  disabled={loading}
                  className="demo-card"
                >
                  <img
                    src={acct.avatar}
                    alt={acct.name}
                    className="demo-card-avatar"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${acct.email}`;
                    }}
                  />
                  <div>
                    <div className="demo-card-name">{acct.name.split(' ')[0]}</div>
                    <div className="demo-card-role">{acct.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one free</Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
