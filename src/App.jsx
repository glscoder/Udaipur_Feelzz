// src/App.jsx
import React, { useEffect, useRef, useState } from 'react';
import Background from './components/Background';
import TopBar from './components/TopBar';
import MusicPlayer from './components/MusicPlayer';
import PlaylistDrawer from './components/PlaylistDrawer';
import IntroOverlay from './components/IntroOverlay';
import youtubePlayer from './services/youtubePlayer';
import './App.css';

export default function App() {
  const isInitialized = useRef(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Guard against React 18 StrictMode double-mounting
    if (!isInitialized.current) {
      isInitialized.current = true;
      youtubePlayer.init('youtube-hidden-player');
    }

    const unsubTrack = youtubePlayer.on('trackChange', (data) => {
      setCurrentTrack(data);
    });

    const unsubState = youtubePlayer.on('stateChange', (state) => {
      setIsPlaying(state === 1);
    });

    return () => {
      unsubTrack();
      unsubState();
    };
  }, []);

  return (
    <main className="app-container">
      {/* Intro sequence */}
      <IntroOverlay />

      {/* Breathing Fullscreen Udaipur Artwork Background */}
      <Background />

      {/* Top Edge Information (Time, Location, Online Count, Links) */}
      <TopBar onOpenPlaylist={() => setIsPlaylistOpen(true)} />

      {/* Floating Bottom Music Player Capsule */}
      <MusicPlayer
        isPlaylistOpen={isPlaylistOpen}
        onTogglePlaylist={() => setIsPlaylistOpen(!isPlaylistOpen)}
      />

      {/* Optional slide-out playlist and atmospheric drawer */}
      <PlaylistDrawer
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
      />

      {/* Hidden YouTube IFrame Container — Section 12c */}
      <div
        id="youtube-hidden-player"
        className="youtube-hidden-container"
        aria-hidden="true"
      />
    </main>
  );
}
