// src/components/TopBar.jsx
import React, { useState, useEffect } from 'react';
import { YOUTUBE_PLAYLIST_URL } from '../config/music';

export default function TopBar({ onOpenPlaylist }) {
  const [timeString, setTimeString] = useState('');

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as "4:20 pm"
      const formatted = now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).toLowerCase();
      setTimeString(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenYouTube = (e) => {
    e.preventDefault();
    window.open(YOUTUBE_PLAYLIST_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="topbar-container">
      {/* Top Left: Dynamic Time & Location */}
      <div className="topbar-left">
        <span className="time-display">{timeString || '4:20 pm'}</span>
        <span className="location-display">UDAIPUR, RAJASTHAN</span>
      </div>

      {/* Top Right: Minimal Links */}
      <div className="topbar-right">
        <button
          type="button"
          onClick={handleOpenYouTube}
          className="topbar-link"
          title="Open in YouTube"
        >
          YouTube <span className="arrow-icon">↗</span>
        </button>
        <button
          type="button"
          onClick={onOpenPlaylist || handleOpenYouTube}
          className="topbar-link"
          title="View Playlist"
        >
          Playlist <span className="arrow-icon">↗</span>
        </button>
      </div>
    </header>
  );
}
