// src/components/PlaylistDrawer.jsx
import React from 'react';
import { X, ExternalLink, Music, Sparkles } from 'lucide-react';
import { YOUTUBE_PLAYLIST_URL } from '../config/music';

export default function PlaylistDrawer({ isOpen, onClose, currentTrack, isPlaying }) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-subtitle">COLLECTION</span>
            <h3 className="drawer-title">Lake Pichola Sunset</h3>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Current Playing Highlight */}
          <div className="drawer-current-card">
            <div className="card-tag">
              <span className="live-pulse-dot" />
              <span>NOW STREAMING</span>
            </div>
            <div className="card-content">
              {currentTrack?.thumbnail && (
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="card-thumb"
                />
              )}
              <div className="card-meta">
                <h4 className="card-title">{currentTrack?.title || 'Ambient Udaipur Experience'}</h4>
                <p className="card-author">{currentTrack?.author || 'Selected Indian Soundscapes'}</p>
                <div className="card-status">
                  <Music size={13} />
                  <span>{isPlaying ? 'Playing via YouTube API' : 'Paused'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aesthetic Notes */}
          <div className="drawer-section">
            <h5 className="section-label">ATMOSPHERE</h5>
            <p className="atmosphere-quote">
              “The sun slips quietly behind the Aravalli hills. Golden ripples wash against the marble ghats of Lake Pichola as timeless music drifts across the water.”
            </p>
          </div>

          {/* Controls & Direct Link */}
          <div className="drawer-footer-actions">
            <a
              href={YOUTUBE_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="drawer-yt-btn"
            >
              <span>Open in YouTube</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
