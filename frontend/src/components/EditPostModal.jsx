import React, { useState, useEffect } from 'react';
import { X, Camera, MapPin, Tag } from 'lucide-react';
import { postService } from '../services/postService';
import { useToast } from '../context/ToastContext';

export const EditPostModal = ({ isOpen, post, onClose, onPostUpdated }) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [camera, setCamera] = useState('');
  const [lens, setLens] = useState('');
  const [focalLength, setFocalLength] = useState('');
  const [aperture, setAperture] = useState('');
  const [shutterSpeed, setShutterSpeed] = useState('');
  const [iso, setIso] = useState('');

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setCaption(post.caption || '');
      setLocation(post.location || '');
      setCamera(post.camera || '');
      setLens(post.lens || '');
      setFocalLength(post.focalLength || '');
      setAperture(post.aperture || '');
      setShutterSpeed(post.shutterSpeed || '');
      setIso(post.iso || '');
      setTags(post.tags || []);
    }
  }, [post]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !post) return null;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title cannot be empty', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('caption', caption.trim());
      formData.append('location', location.trim());
      formData.append('camera', camera.trim());
      formData.append('lens', lens.trim());
      formData.append('focalLength', focalLength.trim());
      formData.append('aperture', aperture.trim());
      formData.append('shutterSpeed', shutterSpeed.trim());
      formData.append('iso', iso.trim());
      formData.append('tags', JSON.stringify(tags));

      const res = await postService.updatePost(post._id, formData);
      if (res.success) {
        showToast('Post updated successfully!', 'success');
        onClose();
        if (onPostUpdated) onPostUpdated(res.post);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update post', 'error');
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
      aria-labelledby="edit-post-title"
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0 }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Camera size={18} color="var(--accent)" />
            <h3 id="edit-post-title" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
              Edit Photo Details
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Story / Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="input-field"
              rows={3}
            />
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <MapPin size={13} color="var(--accent)" />
              <span>Location</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              EXIF & Equipment Specs
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                type="text"
                placeholder="Camera"
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Lens"
                value={lens}
                onChange={(e) => setLens(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Focal Length"
                value={focalLength}
                onChange={(e) => setFocalLength(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Aperture"
                value={aperture}
                onChange={(e) => setAperture(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Shutter Speed"
                value={shutterSpeed}
                onChange={(e) => setShutterSpeed(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="ISO"
                value={iso}
                onChange={(e) => setIso(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <Tag size={13} color="var(--accent)" />
              <span>Tags</span>
            </label>
            <input
              type="text"
              placeholder="Add tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="input-field"
            />
            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'var(--accent-dim)',
                      border: '1px solid var(--accent-border)',
                      color: 'var(--accent)',
                      padding: '2px 8px',
                      borderRadius: '14px',
                      fontSize: '11.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
