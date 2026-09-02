import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Mail, Lock, User, MapPin, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;

  if (score <= 1) return { level: 1, label: 'Too weak', color: 'weak' };
  if (score <= 3) return { level: 2, label: 'Could be stronger', color: 'medium' };
  return { level: 3, label: 'Strong password', color: 'strong' };
}

const REGISTER_PERKS = [
  'Upload photos with EXIF gear metadata',
  'Follow photographers you admire',
  'Bookmark shots for later inspiration',
  'Share the story behind every frame',
];

export const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  React.useEffect(() => {
    document.title = 'Create Account — Framora';
  }, []);

  const pwStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    const { name, username, email, password } = formData;
    if (!name.trim()) errors.name = 'Full name is required';
    if (!username.trim()) errors.username = 'Username is required';
    else if (username.length < 3) errors.username = 'Username must be at least 3 characters';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFieldErrors({});
    try {
      const res = await register(formData);
      if (res.success) {
        showToast(`Welcome to Framora, ${res.user.name}!`, 'success');
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setFieldErrors({ general: msg });
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT — Visual Panel */}
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1400&q=90"
          alt="Photography creative workspace"
          className="auth-visual-img"
        />
        <div className="auth-visual-overlay" />

        {/* Brand mark */}
        <div className="auth-visual-brand">
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(231, 184, 106, 0.2)',
            border: '1px solid rgba(231, 184, 106, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Camera size={17} color="var(--accent)" strokeWidth={2} />
          </div>
          <span className="auth-visual-brand-name">Framora</span>
        </div>

        {/* Bottom content */}
        <div className="auth-visual-content">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(231, 184, 106, 0.15)',
            border: '1px solid rgba(231, 184, 106, 0.3)',
            padding: '4px 12px', borderRadius: '20px', marginBottom: '16px',
          }}>
            <Camera size={11} color="var(--accent)" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Join the Community
            </span>
          </div>
          <div className="auth-visual-tagline">
            Share the story<br />behind the shot.
          </div>
          <p className="auth-visual-sub">
            Framora is where photographers share not just the image, but the craft, gear, and moments that made it possible.
          </p>

          {/* Perks list */}
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {REGISTER_PERKS.map((perk) => (
              <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'rgba(93, 173, 121, 0.2)',
                  border: '1px solid rgba(93, 173, 121, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Check size={11} color="var(--success)" strokeWidth={3} />
                </div>
                <span style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.65)' }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Register Form */}
      <div className="auth-panel">
        <div className="auth-form-container">
          {/* Mobile logo */}
          <div className="auth-logo-mark" style={{ display: 'flex' }}>
            <Camera size={22} color="var(--accent)" strokeWidth={2} />
          </div>

          <p className="auth-eyebrow">Free · No credit card</p>
          <h1 className="auth-heading">Join Framora.</h1>
          <p className="auth-subheading">
            Join photographers documenting their craft, gear, and visual stories.
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

            {/* Name */}
            <div>
              <label htmlFor="reg-name" className="input-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div className="input-wrapper">
                <User size={15} className="input-icon" />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  placeholder="Ansel Adams"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${fieldErrors.name ? 'is-invalid' : ''}`}
                  style={fieldErrors.name ? { borderColor: 'var(--danger)' } : {}}
                  autoComplete="name"
                  required
                />
              </div>
              {fieldErrors.name && (
                <p style={{ color: 'var(--danger)', fontSize: '11.5px', marginTop: '4px' }}>
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Username + Email row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label htmlFor="reg-username" className="input-label">Username <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="input-wrapper">
                  <span style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '14px', color: 'var(--text-dim)', pointerEvents: 'none', fontFamily: 'JetBrains Mono',
                  }}>@</span>
                  <input
                    id="reg-username"
                    name="username"
                    type="text"
                    placeholder="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`input-field ${fieldErrors.username ? 'is-invalid' : ''}`}
                    style={{ paddingLeft: '28px', ...(fieldErrors.username ? { borderColor: 'var(--danger)' } : {}) }}
                    autoComplete="username"
                    required
                  />
                </div>
                {fieldErrors.username && (
                  <p style={{ color: 'var(--danger)', fontSize: '11.5px', marginTop: '4px' }}>
                    {fieldErrors.username}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="reg-email" className="input-label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="input-wrapper">
                  <Mail size={14} className="input-icon" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={handleChange}
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
            </div>

            {/* Location (optional) */}
            <div>
              <label htmlFor="reg-location" className="input-label">Location <span style={{ color: 'var(--text-dim)' }}>(optional)</span></label>
              <div className="input-wrapper">
                <MapPin size={15} className="input-icon" />
                <input
                  id="reg-location"
                  name="location"
                  type="text"
                  placeholder="New York, NY"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                  autoComplete="address-level2"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="input-label">Password <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div className="input-wrapper has-right-icon">
                <Lock size={15} className="input-icon" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field ${fieldErrors.password ? 'is-invalid' : ''}`}
                  style={fieldErrors.password ? { borderColor: 'var(--danger)' } : {}}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p style={{ color: 'var(--danger)', fontSize: '11.5px', marginTop: '4px' }}>
                  {fieldErrors.password}
                </p>
              )}

              {/* Strength bar */}
              {formData.password && (
                <div>
                  <div className="pw-strength-bar">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`pw-strength-segment ${
                          pwStrength.level >= i ? `active-${pwStrength.color}` : ''
                        }`}
                      />
                    ))}
                  </div>
                  <p className="pw-strength-label" style={{
                    color: pwStrength.color === 'strong' ? 'var(--success)'
                         : pwStrength.color === 'medium' ? 'var(--warning)'
                         : 'var(--danger)',
                  }}>
                    {pwStrength.label}
                  </p>
                </div>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '14.5px', marginTop: '4px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '15px', height: '15px',
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderTopColor: 'rgba(0,0,0,0.7)',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Creating your account...
                </span>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>

            <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: '1.6' }}>
              By creating an account you agree to our{' '}
              <span style={{ color: 'var(--text-muted)' }}>Terms of Service</span> and{' '}
              <span style={{ color: 'var(--text-muted)' }}>Privacy Policy</span>.
            </p>
          </form>

          <div className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
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

export default RegisterPage;
