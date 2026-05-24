import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css';

export default function LandingPage({ onOpenBooth }) {
  const taglineFullText = "3 shots. 1 strip. infinite memories.";
  const [taglineTyped, setTaglineTyped] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < taglineFullText.length) {
          setTaglineTyped((prev) => prev + taglineFullText.charAt(currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 60);
      return () => clearInterval(interval);
    }, 500); // starts after the headline has faded in (0.5s delay)

    return () => clearTimeout(delayTimeout);
  }, []);

  // Custom Cursor movement tracking with LERP (smooth interpolation)
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX}px`;
        dotRef.current.style.top = `${mouseY}px`;
        dotRef.current.style.display = 'block';
      }
      if (ringRef.current) {
        ringRef.current.style.display = 'block';
      }
    };

    const handleMouseLeave = () => {
      if (dotRef.current) dotRef.current.style.display = 'none';
      if (ringRef.current) ringRef.current.style.display = 'none';
    };

    const handleMouseEnter = () => {
      if (dotRef.current) dotRef.current.style.display = 'block';
      if (ringRef.current) ringRef.current.style.display = 'block';
    };

    let animationFrameId;
    const updateRingPosition = () => {
      // Smoothly interpolate (lerp) ring position toward the mouse coordinates
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }

      animationFrameId = requestAnimationFrame(updateRingPosition);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animationFrameId = requestAnimationFrame(updateRingPosition);

    // Initial state: hidden until mouse moves
    if (dotRef.current) dotRef.current.style.display = 'none';
    if (ringRef.current) ringRef.current.style.display = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Trail particles creation
  useEffect(() => {
    const container = document.querySelector('.landing-container');
    if (!container) return;

    const shapes = ['✦', '★', '●'];
    const colors = ['#FFD166', '#FF6B9D'];
    let colorIndex = 0;
    let lastSpawnTime = 0;
    const throttleMs = 40; // Throttle rate for particle spawning

    const createParticle = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const particle = document.createElement('span');
      particle.className = 'trail-sparkle';

      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = Math.floor(Math.random() * 5) + 11; // 11px to 15px
      const color = colors[colorIndex];
      colorIndex = (colorIndex + 1) % colors.length;

      // Organic spread offsets
      const offsetX = (Math.random() - 0.5) * 12;
      const offsetY = (Math.random() - 0.5) * 12;

      particle.textContent = shape;
      particle.style.left = `${x + offsetX}px`;
      particle.style.top = `${y + offsetY}px`;
      particle.style.fontSize = `${size}px`;
      particle.style.color = color;

      container.appendChild(particle);

      // Clean up after CSS animation completes
      particle.addEventListener('animationend', () => {
        particle.remove();
      });

      // Safety fallback removal
      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, 800);
    };

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastSpawnTime < throttleMs) return;
      lastSpawnTime = now;

      // Max 3 particles: spawn 2 to 3 particles
      const count = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < count; i++) {
        createParticle(e.clientX, e.clientY);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="landing-container">
      {/* Decorative Star/Sparkle SVGs */}
      <div className="sparkle sparkle-1" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" fill="currentColor"/>
        </svg>
      </div>
      
      <div className="sparkle sparkle-2" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" fill="currentColor"/>
        </svg>
      </div>

      <div className="sparkle sparkle-3" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" fill="currentColor"/>
        </svg>
      </div>

      <div className="sparkle sparkle-4" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" fill="currentColor"/>
        </svg>
      </div>

      <div className="sparkle sparkle-5" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" fill="currentColor"/>
        </svg>
      </div>

      {/* Main Content Area */}
      <main className="landing-content">
        <div className="headline-wrapper">
          <h1 className="landing-headline">strike a pose.</h1>
        </div>
        <p className="landing-tagline">
          <span>{taglineTyped}</span>
          <span style={{ opacity: 0, userSelect: 'none' }} aria-hidden="true">
            {taglineFullText.slice(taglineTyped.length)}
          </span>
        </p>
        
        <div className="btn-wrapper">
          <button 
            id="open-booth-btn"
            className="landing-btn hoverable" 
            onClick={onOpenBooth}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Open photobooth to take photos"
          >
            Open Booth <span className="btn-arrow">→</span>
          </button>
        </div>
      </main>

      {/* Footer / Branding decoration */}
      <footer className="landing-footer">
        <p>handmade browser booth &copy; {new Date().getFullYear()}</p>
      </footer>

      {/* Film Strip Bar */}
      <div className="film-strip-container" aria-hidden="true">
        <div className="film-strip-track">
          <div className="film-strip-half"></div>
          <div className="film-strip-half"></div>
        </div>
      </div>

      {/* Custom Cursor */}
      <div className="custom-cursor-dot" ref={dotRef} aria-hidden="true"></div>
      <div className="custom-cursor-ring" ref={ringRef} aria-hidden="true"></div>
    </div>
  );
}
