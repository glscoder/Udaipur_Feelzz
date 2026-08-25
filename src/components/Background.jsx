// src/components/Background.jsx
import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 4 Desktop Artworks
import desktop1 from '../assets/asset_udaipur_1.png';
import desktop2 from '../assets/asset_udaipur_2.png';
import desktop3 from '../assets/asset_udaipur_3.png';
import desktop4 from '../assets/asset_udaipur_4.png';

// 4 Mobile Artworks
import mobile1 from '../assets/asset_udaipur_mobile_1.png';
import mobile2 from '../assets/asset_udaipur_mobile_2.png';
import mobile3 from '../assets/asset_udaipur_mobile_3.png';
import mobile4 from '../assets/asset_udaipur_mobile_4.png';

const SCENES = [
  { id: 1, desktop: desktop1, mobile: mobile1, title: 'Lake Pichola Sunset' },
  { id: 2, desktop: desktop2, mobile: mobile2, title: 'City Palace Ghats' },
  { id: 3, desktop: desktop3, mobile: mobile3, title: 'Fateh Sagar Dusk' },
  { id: 4, desktop: desktop4, mobile: mobile4, title: 'Jag Mandir Reflections' },
];

export default function Background() {
  const [currentScene, setCurrentScene] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    // Detect screen width / orientation
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaChange = (e) => setIsMobile(e.matches);

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

    // Keyboard navigation (Alt + Left/Right or [ and ])
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === '[' || (e.altKey && e.key === 'ArrowLeft')) {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ']' || (e.altKey && e.key === 'ArrowRight')) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePrev = () => {
    setCurrentScene((prev) => (prev === 0 ? SCENES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentScene((prev) => (prev === SCENES.length - 1 ? 0 : prev + 1));
  };

  // Touch swipe support for mobile & tablet
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (Math.abs(swipeDistance) > 45) {
      if (swipeDistance > 0) {
        handleNext(); // Swiped Left -> Next Image
      } else {
        handlePrev(); // Swiped Right -> Previous Image
      }
    }
  };

  return (
    <div 
      className="background-container" 
      aria-hidden="true"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 4 Cross-Fading Scene Layers */}
      {SCENES.map((scene, idx) => {
        const bgUrl = isMobile ? scene.mobile : scene.desktop;
        const isActive = idx === currentScene;
        return (
          <div
            key={scene.id}
            className={`background-image ${isMobile ? 'is-mobile-bg' : ''} ${isActive ? 'active-scene' : 'inactive-scene'}`}
            style={{
              backgroundImage: `url(${bgUrl})`,
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 2 : 1,
              transform: isMobile 
                ? 'none' 
                : `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1.03)`,
            }}
          />
        );
      })}

      {/* Subtle vignette and vintage gouache paper texture layer */}
      <div className="background-grain" />
      <div className="background-vignette" />

      {/* Edge Scene Navigation Arrows */}
      <div className="scene-nav-controls" aria-hidden="false">
        <button
          type="button"
          className="scene-arrow-btn prev-scene"
          onClick={handlePrev}
          title="Previous Image ( [ or Alt+← )"
          aria-label="Previous artwork"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          className="scene-arrow-btn next-scene"
          onClick={handleNext}
          title="Next Image ( ] or Alt+→ )"
          aria-label="Next artwork"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Subtle scene dot indicators */}
      <div className="scene-dots-container">
        {SCENES.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`scene-dot ${i === currentScene ? 'active' : ''}`}
            onClick={() => setCurrentScene(i)}
            title={`Artwork ${i + 1}`}
            aria-label={`View artwork ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
