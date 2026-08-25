// src/components/TopBar.jsx
import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { YOUTUBE_PLAYLIST_URL } from '../config/music';

export default function TopBar({ onOpenPlaylist }) {
  const [timeString, setTimeString] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const toggleFullscreen = () => {
    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.mozFullScreenElement &&
      !document.msFullscreenElement
    ) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Track Fullscreen state and keyboard shortcut
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
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

      {/* Top Right: Minimal Links & Fullscreen */}
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
        <button
          type="button"
          onClick={toggleFullscreen}
          className="topbar-link"
          title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? 'Exit' : 'Fullscreen'}{' '}
          {isFullscreen ? (
            <Minimize2 size={13} style={{ display: 'inline', marginLeft: '2px', verticalAlign: 'middle' }} />
          ) : (
            <Maximize2 size={13} style={{ display: 'inline', marginLeft: '2px', verticalAlign: 'middle' }} />
          )}
        </button>
      </div>
    </header>
  );
}

