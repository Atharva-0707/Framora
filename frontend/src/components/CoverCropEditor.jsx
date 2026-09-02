import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Monitor,
  Smartphone,
  Grid3X3,
  Sliders,
} from 'lucide-react';

/**
 * CoverCropEditor
 *
 * Props:
 * - imageUrl: string (blob URL or Cloudinary URL)
 * - initialPosition: { x: number, y: number, zoom: number }
 * - onChange: (position: { x: number, y: number, zoom: number }) => void
 * - onReset: () => void
 */
export const CoverCropEditor = ({
  imageUrl,
  initialPosition = { x: 50, y: 50, zoom: 1 },
  onChange,
  onReset,
}) => {
  const [position, setPosition] = useState({
    x: initialPosition?.x ?? 50,
    y: initialPosition?.y ?? 50,
    zoom: initialPosition?.zoom ?? 1,
  });

  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' (3.2:1) | 'mobile' (2.4:1)
  const [showGrid, setShowGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 50, initialY: 50 });

  // Update internal state if initialPosition prop changes
  useEffect(() => {
    if (initialPosition) {
      setPosition({
        x: initialPosition.x ?? 50,
        y: initialPosition.y ?? 50,
        zoom: initialPosition.zoom ?? 1,
      });
    }
  }, [initialPosition?.x, initialPosition?.y, initialPosition?.zoom]);

  // Notify parent on position change
  const updatePosition = useCallback((newPos) => {
    setPosition(newPos);
    if (onChange) {
      onChange(newPos);
    }
  }, [onChange]);

  // ── Drag Handlers (Pointer Events: Mouse + Touch) ──
  const handlePointerDown = (e) => {
    // Only primary button
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
        // ignore fallback
      }
    }

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    // Movement responsiveness: convert delta pixels to percentage shifts
    // Dragging right -> moves content right -> shifts focus left (decreases x%)
    // Dragging left -> moves content left -> shifts focus right (increases x%)
    const sensitivityX = (100 / rect.width) * 0.85;
    const sensitivityY = (100 / rect.height) * 0.85;

    let newX = dragStartRef.current.initialX - deltaX * sensitivityX;
    let newY = dragStartRef.current.initialY - deltaY * sensitivityY;

    // Clamp boundaries strictly within 0% - 100% so no blank margins appear
    newX = Math.max(0, Math.min(100, Math.round(newX * 10) / 10));
    newY = Math.max(0, Math.min(100, Math.round(newY * 10) / 10));

    updatePosition({
      ...position,
      x: newX,
      y: newY,
    });
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      if (e.currentTarget.releasePointerCapture) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (err) {
          // ignore
        }
      }
    }
  };

  // ── Zoom Handlers ──
  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.max(1, Math.min(2.5, Math.round(newZoom * 100) / 100));
    updatePosition({
      ...position,
      zoom: clampedZoom,
    });
  };

  const handleReset = () => {
    const defaultPos = { x: 50, y: 50, zoom: 1 };
    updatePosition(defaultPos);
    if (onReset) onReset();
  };

  const currentAspectRatio = previewMode === 'mobile' ? '2.4 / 1' : '3.2 / 1';

  return (
    <div className="cover-crop-editor-container">
      {/* Editor Header Bar */}
      <div className="cover-editor-header">
        <div className="cover-editor-title">
          <Sliders size={13} color="var(--accent)" />
          <span>Cover Framing & Position</span>
        </div>

        <div className="cover-editor-header-actions">
          {/* Device Preview Toggle */}
          <div className="cover-preview-mode-group" role="group" aria-label="Preview aspect ratio">
            <button
              type="button"
              className={`cover-mode-btn ${previewMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setPreviewMode('desktop')}
              title="Desktop Banner View (3.2:1)"
              aria-label="Desktop Banner View"
            >
              <Monitor size={13} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              className={`cover-mode-btn ${previewMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setPreviewMode('mobile')}
              title="Mobile Banner View (2.4:1)"
              aria-label="Mobile Banner View"
            >
              <Smartphone size={13} />
              <span>Mobile</span>
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            type="button"
            className={`cover-mode-btn ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Rule-of-Thirds Grid"
            aria-label="Toggle Composition Grid"
          >
            <Grid3X3 size={13} />
          </button>
        </div>
      </div>

      {/* Interactive Crop Viewport */}
      <div
        ref={containerRef}
        className={`cover-crop-viewport ${isDragging ? 'is-dragging' : ''}`}
        style={{
          aspectRatio: currentAspectRatio,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="region"
        aria-label="Draggable cover photo cropping area"
        tabIndex={0}
      >
        {/* Rendered Cover Image with precise positioning and zoom */}
        <img
          src={imageUrl}
          alt="Cover positioning preview"
          className="cover-crop-image"
          style={{
            objectPosition: `${position.x}% ${position.y}%`,
            transform: `scale(${position.zoom})`,
            transformOrigin: `${position.x}% ${position.y}%`,
          }}
          draggable={false}
        />

        {/* Rule of Thirds Composition Guide */}
        {showGrid && (
          <div className="cover-crop-grid">
            <div className="grid-line vertical" style={{ left: '33.333%' }} />
            <div className="grid-line vertical" style={{ left: '66.666%' }} />
            <div className="grid-line horizontal" style={{ top: '33.333%' }} />
            <div className="grid-line horizontal" style={{ top: '66.666%' }} />
          </div>
        )}

        {/* Safe Area Framing Border */}
        <div className="cover-crop-frame-border" />

        {/* Floating Drag Hint Pill */}
        <div className={`cover-drag-pill ${isDragging ? 'dragging' : ''}`}>
          <Move size={12} />
          <span>{isDragging ? 'Repositioning...' : 'Drag to reposition photograph'}</span>
        </div>

        {/* Live Coordinate Pill */}
        <div className="cover-coord-pill">
          {position.zoom > 1 && <span>{position.zoom.toFixed(1)}x • </span>}
          <span>X: {Math.round(position.x)}% Y: {Math.round(position.y)}%</span>
        </div>
      </div>

      {/* Controls Bar: Zoom Slider + Reset Button */}
      <div className="cover-editor-controls">
        {/* Zoom Controls */}
        <div className="cover-zoom-control">
          <button
            type="button"
            className="cover-zoom-btn"
            onClick={() => handleZoomChange(position.zoom - 0.2)}
            disabled={position.zoom <= 1}
            aria-label="Zoom Out"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>

          <input
            type="range"
            min="1"
            max="2.5"
            step="0.05"
            value={position.zoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            className="cover-zoom-slider"
            aria-label="Cover Image Zoom Level"
          />

          <button
            type="button"
            className="cover-zoom-btn"
            onClick={() => handleZoomChange(position.zoom + 0.2)}
            disabled={position.zoom >= 2.5}
            aria-label="Zoom In"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>

          <span className="cover-zoom-badge">
            {position.zoom.toFixed(1)}x
          </span>
        </div>

        {/* Reset Action */}
        <button
          type="button"
          onClick={handleReset}
          className="cover-reset-btn"
          title="Reset position and zoom"
          aria-label="Reset position and zoom"
        >
          <RotateCcw size={12} />
          <span>Reset Position</span>
        </button>
      </div>

      {/* Helper note */}
      <div className="cover-editor-hint">
        <span>💡 Tip:</span> Drag horizontally or vertically to position the focal point. The composition shown here will appear exactly on your profile.
      </div>
    </div>
  );
};

export default CoverCropEditor;
