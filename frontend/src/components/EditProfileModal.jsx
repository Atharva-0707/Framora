import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  Globe,
  MapPin,
  User,
  Image,
  Trash2,
  Camera,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import CoverCropEditor from './CoverCropEditor';

// ─── Constants ──────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXT_RE = /\.(jpe?g|png|webp)$/i;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_SIZE_LABEL = '10 MB';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function validateImageFile(file) {
  if (!file) return null;
  const extOk = ACCEPTED_EXT_RE.test(file.name);
  const mimeOk = ACCEPTED_TYPES.includes(file.type);
  if (!extOk || !mimeOk) {
    return 'Please choose a JPG, PNG, or WEBP image.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Cover image must be smaller than ${MAX_SIZE_LABEL}.`;
  }
  return null;
}

// ─── Cover Upload Zone Component ─────────────────────────────────────────────
const CoverUploadZone = ({
  currentUrl,
  file,
  preview,
  coverPosition,
  onPositionChange,
  onPositionReset,
  onFileSelect,
  onRemove,
  error,
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const displayUrl = preview || currentUrl;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  };
  const handleInputChange = (e) => {
    const picked = e.target.files[0];
    if (picked) onFileSelect(picked);
    // Reset so re-selecting same file triggers onChange
    e.target.value = '';
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="cover-upload-section">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        id="cover-image-input"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-label="Upload cover photo"
      />

      {/* Label and Top Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <label
          style={{
            fontSize: '12.5px',
            fontWeight: '600',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Image size={13} color="var(--accent)" />
          Cover Photo
        </label>

        {displayUrl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn btn-ghost"
              style={{
                fontSize: '11.5px',
                padding: '3px 10px',
                color: 'var(--text-soft)',
                gap: '4px',
              }}
              aria-label="Change cover image file"
            >
              <Camera size={12} />
              <span>Change Photo</span>
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="btn btn-ghost"
              style={{
                fontSize: '11.5px',
                padding: '3px 10px',
                color: 'var(--danger)',
                gap: '4px',
              }}
              aria-label="Remove cover photo"
            >
              <Trash2 size={12} />
              <span>Remove</span>
            </button>
          </div>
        )}
      </div>

      {displayUrl ? (
        /* When image is selected or existing, show interactive framing & cropping editor */
        <CoverCropEditor
          imageUrl={displayUrl}
          initialPosition={coverPosition}
          onChange={onPositionChange}
          onReset={onPositionReset}
        />
      ) : (
        /* Empty state: Drop zone to select cover */
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload cover photo — click or drag an image here"
          onClick={() => inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="cover-upload-zone"
          style={{
            border: isDragging
              ? '2px dashed var(--accent)'
              : error
              ? '2px dashed var(--danger)'
              : '2px dashed var(--border-mid)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
            aspectRatio: '3.2 / 1',
            background:
              'linear-gradient(135deg, rgba(231,184,106,0.04) 0%, rgba(15,17,23,0.7) 100%)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: isDragging ? '0 0 0 3px rgba(231,184,106,0.18)' : 'none',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(231,184,106,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(231,184,106,0.2)',
            }}
          >
            <Upload size={18} color="var(--accent)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-soft)',
              }}
            >
              {isDragging ? 'Drop to upload cover photo' : 'Click or drag to upload cover photo'}
            </div>
            <div
              style={{
                fontSize: '11.5px',
                color: 'var(--text-dim)',
                marginTop: '3px',
              }}
            >
              JPG · PNG · WEBP · Max {MAX_SIZE_LABEL}
            </div>
          </div>
        </div>
      )}

      {/* File info pill when a newly picked file is selected */}
      {file && (
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '12px',
            color: 'var(--text-dim)',
          }}
        >
          <Image size={12} color="var(--accent)" />
          <span style={{ color: 'var(--text-soft)', fontWeight: 500 }}>
            {file.name}
          </span>
          <span>·</span>
          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      )}

      {/* Field-level error */}
      {error && (
        <div
          role="alert"
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            color: 'var(--danger)',
          }}
        >
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// ─── EditProfileModal ────────────────────────────────────────────────────────
export const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user, updateCurrentUser } = useAuth();
  const { showToast } = useToast();

  // Avatar upload
  const avatarInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  // Cover upload & positioning
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverPosition, setCoverPosition] = useState(
    user?.coverPosition || { x: 50, y: 50, zoom: 1 }
  );
  const [coverError, setCoverError] = useState('');
  // removeCover = true means user explicitly cleared it
  const [removeCover, setRemoveCover] = useState(false);

  // Text fields
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');

  const [loading, setLoading] = useState(false);

  // Re-sync with user when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
      setAvatarPreview(user.avatar || '');
      setCoverPosition(user.coverPosition || { x: 50, y: 50, zoom: 1 });
      setRemoveCover(false);
      setCoverFile(null);
      setCoverPreview('');
      setCoverError('');
    }
  }, [isOpen, user]);

  // Clean up object URLs on unmount / file change
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
      if (coverPreview && coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    };
  }, []); // only on unmount

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Avatar handlers ──
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Revoke previous blob preview if any
    if (avatarPreview && avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Cover handlers ──
  const handleCoverFileSelect = useCallback((file) => {
    const err = validateImageFile(file);
    if (err) {
      setCoverError(err);
      return;
    }
    setCoverError('');
    // Revoke previous blob
    if (coverPreview && coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverPosition({ x: 50, y: 50, zoom: 1 });
    setRemoveCover(false);
  }, [coverPreview]);

  const handleCoverRemove = () => {
    if (coverPreview && coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview('');
    setCoverError('');
    setCoverPosition({ x: 50, y: 50, zoom: 1 });
    setRemoveCover(true); // signal backend to clear existing cover
  };

  const handleCoverPositionChange = (newPos) => {
    setCoverPosition(newPos);
  };

  const handleCoverPositionReset = () => {
    setCoverPosition({ x: 50, y: 50, zoom: 1 });
  };

  // Current cover URL from user (before any changes)
  const existingCoverUrl = removeCover ? '' : (user?.coverImage || '');

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (coverError) {
      showToast(coverError, 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('bio', bio.trim());
      formData.append('location', location.trim());
      formData.append('website', website.trim());
      formData.append('coverPosition', JSON.stringify(coverPosition));

      // Avatar: send file if changed
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // Cover: send file if new one selected
      if (coverFile) {
        formData.append('coverImage', coverFile);
      } else if (removeCover) {
        // Tell backend to clear cover (send empty string)
        formData.append('coverImage', '');
      }

      const res = await userService.updateProfile(formData);
      if (res.success && res.user) {
        updateCurrentUser(res.user);
        showToast('Profile updated successfully!', 'success');
        onClose();
        if (onProfileUpdated) onProfileUpdated(res.user);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 413) {
        showToast('Image file is too large. Please use a file under 10 MB.', 'error');
      } else {
        showToast(err.response?.data?.message || 'Failed to update profile', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className="modal-dialog edit-profile-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100dvh - 32px)' }}
      >
        {/* ── Fixed Header ── */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
            flexShrink: 0,
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={18} color="var(--accent)" />
            <h3
              id="edit-profile-title"
              style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}
            >
              Edit Photographer Profile
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div
          className="modal-body-scroll"
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px' }}
        >
          <form id="edit-profile-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Profile Photo ── */}
            <div>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Camera size={13} color="var(--accent)" />
                Profile Photo
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src={
                    avatarPreview ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`
                  }
                  alt={name || 'Profile avatar'}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--border-mid)',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    aria-label="Upload profile photo"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="btn btn-secondary"
                    style={{ fontSize: '12.5px', padding: '6px 14px' }}
                  >
                    <Upload size={14} />
                    <span>Upload New Photo</span>
                  </button>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '5px' }}>
                    JPG, PNG or WEBP · Max 10 MB
                  </div>
                </div>
              </div>
            </div>

            {/* ── Cover Photo ── */}
            <CoverUploadZone
              currentUrl={existingCoverUrl}
              file={coverFile}
              preview={coverPreview}
              onFileSelect={handleCoverFileSelect}
              onRemove={handleCoverRemove}
              error={coverError}
            />

            {/* ── Divider ── */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0 -24px' }} />

            {/* ── Full Name ── */}
            <div>
              <label
                htmlFor="edit-profile-name"
                style={{
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Full Name *
              </label>
              <input
                id="edit-profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* ── Bio ── */}
            <div>
              <label
                htmlFor="edit-profile-bio"
                style={{
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Photographer Bio
              </label>
              <textarea
                id="edit-profile-bio"
                placeholder="Tell others about your photography style, favorite subjects, awards..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-field"
                rows={3}
              />
            </div>

            {/* ── Location ── */}
            <div>
              <label
                htmlFor="edit-profile-location"
                style={{
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                <MapPin size={13} color="var(--accent)" />
                <span>Location</span>
              </label>
              <input
                id="edit-profile-location"
                type="text"
                placeholder="e.g. Kyoto, Japan"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field"
              />
            </div>

            {/* ── Website ── */}
            <div>
              <label
                htmlFor="edit-profile-website"
                style={{
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                <Globe size={13} color="var(--accent)" />
                <span>Portfolio Website</span>
              </label>
              <input
                id="edit-profile-website"
                type="url"
                placeholder="https://myphotos.art"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="input-field"
              />
            </div>

          </form>
        </div>

        {/* ── Fixed Footer ── */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: 'var(--bg-surface)',
            flexShrink: 0,
            borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            disabled={loading || !!coverError}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Saving...</span>
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
