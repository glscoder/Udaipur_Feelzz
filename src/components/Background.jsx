// src/components/Background.jsx
import React, { useEffect, useState } from 'react';
import desktopArtwork from '../assets/asset_udaipur.png';
import mobileArtwork from '../assets/asset_udaipur_mobile.png';

export default function Background() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    // Detect screen width changes / orientation changes
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaChange = (e) => setIsMobile(e.matches);

    // Modern and fallback listeners
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    // Parallax mouse effect for desktop
    const handleMouseMove = (e) => {
      if (window.innerWidth <= 768) return;
      const { innerWidth, innerHeight } = window;
      const x = ((e.clientX / innerWidth) - 0.5) * 12;
      const y = ((e.clientY / innerHeight) - 0.5) * 12;
      setOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const activeArtwork = isMobile ? mobileArtwork : desktopArtwork;

  return (
    <div className="background-container" aria-hidden="true">
      <div
        className={`background-image ${isMobile ? 'is-mobile-bg' : ''}`}
        style={{
          backgroundImage: `url(${activeArtwork})`,
          transform: isMobile 
            ? 'none' 
            : `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1.03)`,
        }}
      />
      {/* Subtle vignette and vintage gouache paper texture layer */}
      <div className="background-grain" />
      <div className="background-vignette" />
    </div>
  );
}
