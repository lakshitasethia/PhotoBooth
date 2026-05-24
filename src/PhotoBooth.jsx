import { useState, useEffect, useRef } from 'react';
import './PhotoBooth.css';
import { playCountdownBeep } from './audio';

const playShutterSound = () => {
  const audio = new Audio('/shutter.mp3');
  audio.volume = 0.7;
  audio.play();
};

const FILTER_MAP = {
  'none': 'none',
  'disposable': 'brightness(1.1) contrast(0.9) saturate(0.85) sepia(0.2)',
  'noir': 'grayscale(1) contrast(1.5) brightness(0.85)',
  'lomo': 'saturate(1.8) contrast(1.3) brightness(0.9) hue-rotate(355deg)',
  'soft glow': 'brightness(1.2) contrast(0.85) saturate(1.2) blur(0.4px)',
  'velvia': 'saturate(2) contrast(1.15) brightness(1.0) hue-rotate(5deg)',
  'golden hour': 'sepia(0.35) saturate(1.9) brightness(1.1) contrast(1.05)'
};

const PROMPTS_LIST = [
  "make your most dramatic face",
  "pretend you just won an oscar",
  "you did NOT just see that",
  "look away. now regret it.",
  "main character moment 🎬",
  "act natural. too natural.",
  "your villain origin story",
  "smile like your wifi just came back",
  "caught in 4k 📸",
  "the audacity. the nerve.",
  "pretend you're in a music video",
  "you're so famous right now"
];

const THEMES = [
  'plain white',
  'pink gingham',
  'luxury',
  'cherry',
  'kisses',
  'vintage'
];

export default function PhotoBooth({
  selectedFilter,
  setSelectedFilter,
  selectedTheme,
  setSelectedTheme,
  onSessionComplete,
  onBack
}) {
  const videoRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState(null);
  const [capturedPhotosCount, setCapturedPhotosCount] = useState(0);

  // Setup webcam stream
  useEffect(() => {
    let activeStream = null;

    async function initCamera() {
      try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 960 },
            facingMode: 'user'
          },
          audio: false
        });
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera setup failed:", err);
        setError("webcam access denied or unavailable. please grant camera permissions.");
      }
    }

    initCamera();

    // Stop all tracks when component unmounts
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Captures a single frame from the live video feed with filters applied
  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Apply the active CSS filter on the canvas context
    const currentFilter = FILTER_MAP[selectedFilter] || 'none';
    ctx.filter = currentFilter;

    // Mirror the capture to match the mirrored camera preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Automated 3-shot sequential capture loop
  const triggerCaptureSequence = async () => {
    if (isCapturing || error || !videoRef.current) return;

    setIsCapturing(true);
    setCapturedPhotosCount(0);
    const capturedList = [];

    // Shuffle and pick first 3 prompts for this session
    const shuffledPrompts = [...PROMPTS_LIST].sort(() => Math.random() - 0.5);
    const sessionPrompts = shuffledPrompts.slice(0, 3);

    try {
      for (let shot = 0; shot < 3; shot++) {
        // Step 0: Show prompt for 2000ms, then fade out over 300ms (handled by CSS keyframes)
        setCurrentPrompt(sessionPrompts[shot]);
        await new Promise(resolve => setTimeout(resolve, 2300));
        setCurrentPrompt(null);

        // Step 1: Countdown 3 -> 2 -> 1
        for (let num = 3; num >= 1; num--) {
          setCountdown(num);
          playCountdownBeep();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        setCountdown(null);

        // Step 2: Simulate flash
        setFlash(true);
        playShutterSound();
        const dataUrl = captureFrame();
        if (dataUrl) {
          capturedList.push(dataUrl);
          setCapturedPhotosCount(capturedList.length);
        }

        // Turn off flash after 200ms
        await new Promise(resolve => setTimeout(resolve, 200));
        setFlash(false);

        // Step 3: Wait 500ms gap before next countdown
        if (shot < 2) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Finalize session
      setIsCapturing(false);
      onSessionComplete(capturedList, selectedFilter);
    } catch (err) {
      console.error("Capture sequence interrupted:", err);
      setIsCapturing(false);
      setCountdown(null);
      setCurrentPrompt(null);
      setFlash(false);
    }
  };

  return (
    <div className="booth-container">
      {/* Fullscreen Flash Overlay */}
      {flash && <div className="flash-overlay" aria-hidden="true" />}

      <header className="booth-header">
        <button 
          className="back-btn" 
          onClick={onBack}
          disabled={isCapturing}
          aria-label="Back to landing screen"
        >
          ← Back
        </button>
        <h2 className="booth-title">strike a pose.</h2>
        <div className="indicator-capsule">
          {isCapturing ? `Capturing: ${capturedPhotosCount} / 3` : 'Ready'}
        </div>
      </header>

      <main className="booth-content">
        {/* Camera Container */}
        <div className="camera-frame">
          <div className="camera-viewport">
            {error ? (
              <div className="booth-error">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
                <button className="retry-btn" onClick={() => window.location.reload()}>
                  Reload Page
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-feed"
                  style={{ filter: FILTER_MAP[selectedFilter] }}
                />
                
                {/* Countdown Overlay */}
                {countdown && (
                  <div className="countdown-container">
                    <span className="countdown-number">{countdown}</span>
                  </div>
                )}

                {/* Pose Prompt Overlay */}
                {currentPrompt && (
                  <div className="prompt-overlay-container">
                    <div className="prompt-card">
                      <div className="prompt-top">POSE PROMPT ✦</div>
                      <div className="prompt-text">{currentPrompt}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filters and Controls Panel */}
        <div className="controls-panel">
          <div className="filter-section">
            <span className="filter-label">Choose Filter:</span>
            <div className="filter-grid">
              {Object.keys(FILTER_MAP).map((filterName) => (
                <button
                  key={filterName}
                  className={`filter-option-btn ${selectedFilter === filterName ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(filterName)}
                  disabled={isCapturing}
                  aria-label={`Select ${filterName} filter`}
                >
                  <span className={`filter-preview ${filterName}`} style={{ filter: FILTER_MAP[filterName] }} />
                  <span className="filter-name">{filterName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <span className="filter-label">PICK YOUR STRIP ✦</span>
            <div className="filter-grid">
              {THEMES.map((themeName) => (
                <button
                  key={themeName}
                  className={`filter-option-btn ${selectedTheme === themeName ? 'active' : ''}`}
                  onClick={() => setSelectedTheme(themeName)}
                  disabled={isCapturing}
                  aria-label={`Select ${themeName} theme`}
                  style={{ justifyContent: 'center' }}
                >
                  <span className="filter-name">{themeName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="action-section">
            <button
              id="capture-trigger-btn"
              className="action-capture-btn"
              onClick={triggerCaptureSequence}
              disabled={isCapturing || !!error}
              aria-label="Start photo sequence capture"
            >
              {isCapturing ? `Pose! ${capturedPhotosCount + 1}` : 'Click! 📸'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
