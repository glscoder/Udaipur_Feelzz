// src/components/MusicPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import youtubePlayer from '../services/youtubePlayer';
import { YOUTUBE_PLAYLIST_URL } from '../config/music';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function MusicPlayer({ onTogglePlaylist, isPlaylistOpen }) {
  const [playerState, setPlayerState] = useState(-1); // -1: unstarted, 1: playing, 2: paused, 3: buffering
  const [trackInfo, setTrackInfo] = useState({
    title: 'Loading Udaipur Playlist...',
    author: 'Lake Pichola Sunset Melodies',
    thumbnail: null,
    duration: 0,
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const progressBarRef = useRef(null);

  useEffect(() => {
    // Subscribe to YouTube Player Events
    const unsubState = youtubePlayer.on('stateChange', (state) => {
      setPlayerState(state);
      if (state === 1) { // Playing
        setHasStartedPlaying(true);
        setHasError(false);
      }
    });

    const unsubTrack = youtubePlayer.on('trackChange', (data) => {
      if (data) {
        setTrackInfo({
          title: data.title || 'Udaipur Ambient Music',
          author: data.author || 'Rajasthani Sunset Chords',
          thumbnail: data.thumbnail,
          duration: data.duration || 0,
        });
        if (data.duration > 0) {
          setDuration(data.duration);
        }
      }
    });

    const unsubTime = youtubePlayer.on('timeUpdate', ({ currentTime: curr, duration: dur }) => {
      if (!isSeeking) {
        setCurrentTime(curr);
        if (dur > 0 && dur !== duration) {
          setDuration(dur);
        }
      }
    });

    const unsubError = youtubePlayer.on('error', () => {
      setHasError(true);
    });

    // Keyboard Shortcuts
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const nextTime = Math.min(duration, currentTime + 5);
        youtubePlayer.seek(nextTime);
        setCurrentTime(nextTime);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const prevTime = Math.max(0, currentTime - 5);
        youtubePlayer.seek(prevTime);
        setCurrentTime(prevTime);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubState();
      unsubTrack();
      unsubTime();
      unsubError();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSeeking, duration, currentTime, playerState]);

  const isPlaying = playerState === 1;
  const isBuffering = playerState === 3;

  const handleTogglePlay = () => {
    if (isPlaying) {
      youtubePlayer.pause();
    } else {
      youtubePlayer.play();
    }
  };

  const handlePrev = () => {
    youtubePlayer.previous();
  };

  const handleNext = () => {
    youtubePlayer.next();
  };

  const handleSeekStart = (e) => {
    setIsSeeking(true);
    handleSeekUpdate(e);
  };

  const handleSeekUpdate = (e) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clickPos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetSeconds = clickPos * duration;
    setSeekValue(targetSeconds);
  };

  const handleSeekEnd = (e) => {
    if (isSeeking && duration > 0) {
      if (progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clickPos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const targetSeconds = clickPos * duration;
        youtubePlayer.seek(targetSeconds);
        setCurrentTime(targetSeconds);
      }
      setIsSeeking(false);
    }
  };

  const volumeTimeoutRef = useRef(null);

  const handleVolumeMouseEnter = () => {
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    setShowVolumeSlider(true);
  };

  const handleVolumeMouseLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 450);
  };

  const handleVolumeToggle = (e) => {
    e.stopPropagation();
    if (isMuted) {
      youtubePlayer.setVolume(volume || 80);
      setIsMuted(false);
    } else {
      youtubePlayer.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    if (newVol === 0) {
      setIsMuted(true);
      youtubePlayer.setVolume(0);
    } else {
      setIsMuted(false);
      youtubePlayer.setVolume(newVol);
    }
  };

  const activeProgress = isSeeking ? (seekValue / (duration || 1)) * 100 : (currentTime / (duration || 1)) * 100;

  return (
    <div className="player-wrapper">
      <div className={`music-player-capsule ${isPlaying ? 'is-playing' : ''} ${hasError ? 'has-error' : ''}`}>
        
        {/* Error Fallback Notice */}
        {hasError && (
          <div className="player-error-banner">
            <AlertCircle size={14} className="error-icon" />
            <span>Music stream unavailable.</span>
            <a href={YOUTUBE_PLAYLIST_URL} target="_blank" rel="noopener noreferrer" className="error-link">
              Open playlist on YouTube <ExternalLink size={12} />
            </a>
          </div>
        )}

        <div className="player-main-row">
          {/* Album / Video Artwork Thumbnail */}
          <div className="player-art-container" onClick={handleTogglePlay} title={isPlaying ? 'Pause' : 'Play'}>
            {trackInfo.thumbnail ? (
              <img
                src={trackInfo.thumbnail}
                alt={trackInfo.title}
                className={`player-art-img ${isPlaying ? 'rotating-art' : ''}`}
              />
            ) : (
              <div className="player-art-placeholder">
                <span className="art-dot" />
              </div>
            )}
            <div className="art-overlay-icon">
              {isBuffering ? (
                <Loader2 size={16} className="spin-loader" />
              ) : isPlaying ? (
                <Pause size={14} />
              ) : (
                <Play size={14} style={{ marginLeft: '2px' }} />
              )}
            </div>
          </div>

          {/* Song & Artist Info */}
          <div className="player-info-container">
            <div className="track-title-wrapper" title={trackInfo.title}>
              <h2 className="track-title">{trackInfo.title}</h2>
            </div>
            <div className="track-author" title={trackInfo.author}>
              <span>{trackInfo.author}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="player-controls">
            <button
              type="button"
              className="player-btn prev-btn"
              onClick={handlePrev}
              title="Previous Track"
              aria-label="Previous Track"
            >
              <SkipBack size={17} />
            </button>

            <button
              type="button"
              className="player-btn play-pause-btn"
              onClick={handleTogglePlay}
              title={isPlaying ? 'Pause' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering ? (
                <Loader2 size={20} className="spin-loader" />
              ) : isPlaying ? (
                <Pause size={19} />
              ) : (
                <Play size={19} style={{ marginLeft: '2px' }} />
              )}
            </button>

            <button
              type="button"
              className="player-btn next-btn"
              onClick={handleNext}
              title="Next Track"
              aria-label="Next Track"
            >
              <SkipForward size={17} />
            </button>
          </div>

          {/* Extra options: Volume & Playlist */}
          <div className="player-extra-controls">
            <div 
              className="volume-container"
              onMouseEnter={handleVolumeMouseEnter}
              onMouseLeave={handleVolumeMouseLeave}
            >
              <button
                type="button"
                className="player-btn icon-btn"
                onClick={handleVolumeToggle}
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label="Volume"
              >
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              
              {showVolumeSlider && (
                <div 
                  className="volume-slider-popup"
                  onMouseEnter={handleVolumeMouseEnter}
                  onMouseLeave={handleVolumeMouseLeave}
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    onInput={handleVolumeChange}
                    className="volume-range-input"
                    aria-label="Volume slider"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              className={`player-btn icon-btn playlist-toggle-btn ${isPlaylistOpen ? 'active' : ''}`}
              onClick={onTogglePlaylist}
              title="Toggle Playlist & Notes"
              aria-label="Toggle Playlist"
            >
              <ListMusic size={17} />
            </button>
          </div>
        </div>

        {/* Real Seekable Progress Bar */}
        <div className="player-progress-section">
          <span className="time-text current-time">{formatTime(isSeeking ? seekValue : currentTime)}</span>
          
          <div
            className="progress-bar-track"
            ref={progressBarRef}
            onMouseDown={handleSeekStart}
            onMouseMove={isSeeking ? handleSeekUpdate : undefined}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onTouchMove={isSeeking ? handleSeekUpdate : undefined}
            onTouchEnd={handleSeekEnd}
            title="Click or drag to seek"
          >
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, Math.max(0, activeProgress))}%` }}
            >
              <div className="progress-bar-handle" />
            </div>
          </div>

          <span className="time-text total-time">{formatTime(duration)}</span>
        </div>

      </div>

      {/* Subtle First-time hint */}
      {!hasStartedPlaying && (
        <div className="player-hint-text">
          <span>Click play to experience Udaipur in sound</span>
        </div>
      )}
    </div>
  );
}
