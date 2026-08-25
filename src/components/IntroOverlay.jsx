// src/components/IntroOverlay.jsx
import React, { useState, useEffect } from 'react';

export default function IntroOverlay() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start gentle fade out after 800ms
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 700);

    // Remove from DOM after transition finishes
    const timer2 = setTimeout(() => {
      setVisible(false);
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`intro-overlay ${fadeOut ? 'fade-out' : ''}`} aria-hidden="true">
      <div className="intro-content">
        <span className="intro-city">UDAIPUR</span>
        <span className="intro-tagline">listen slowly</span>
      </div>
    </div>
  );
}
