import { useEffect, useRef, useState } from 'react';
import './PhotoStrip.css';

const playStripSound = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  
  const playNote = (frequency, startTime, duration, gain = 0.2) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const now = ctx.currentTime;
  playNote(523, now, 0.15);        // C5
  playNote(659, now + 0.12, 0.15); // E5
  playNote(784, now + 0.24, 0.3);  // G5 — held longer, feels like resolution
};

export default function PhotoStrip({ photos, selectedFilter, selectedTheme = 'plain white', onBack, onRetake }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const drawStrip = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setLoading(true);

      // Clear canvas / draw theme background
      if (selectedTheme === 'luxury') {
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedTheme === 'kisses') {
        ctx.fillStyle = '#FFF0F5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedTheme === 'vintage') {
        ctx.fillStyle = '#F5ECD7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw Gingham Pattern (pink gingham theme background)
      if (selectedTheme === 'pink gingham') {
        ctx.fillStyle = 'rgba(255, 107, 157, 0.15)';
        const spacing = 20;
        const thickness = 20;

        // Horizontal lines
        for (let y = 0; y < canvas.height; y += spacing * 2) {
          ctx.fillRect(0, y, canvas.width, thickness);
        }

        // Vertical lines
        for (let x = 0; x < canvas.width; x += spacing * 2) {
          ctx.fillRect(x, 0, thickness, canvas.height);
        }

        // Diagonal cross lines to complete gingham grid
        ctx.strokeStyle = 'rgba(255, 107, 157, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = -canvas.height; x < canvas.width; x += spacing * 2) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x + canvas.height, canvas.height);
        }
        for (let x = 0; x < canvas.width + canvas.height; x += spacing * 2) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x - canvas.height, canvas.height);
        }
        ctx.stroke();
      }

      // Helper to load image asynchronously
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = src;
        });
      };

      try {
        // 1. Wait for images to load
        const loadedImages = await Promise.all(photos.map(loadImage));
        
        // 2. Wait for Dancing Script font to be loaded
        try {
          await document.fonts.load('bold 24px "Dancing Script"');
        } catch (fErr) {
          console.warn("Dancing Script font preloading failed:", fErr);
        }

        if (!isMounted) return;

        // 3. Draw photos stacked vertically
        // Specs: 20px padding, 15px gap, photos are 440x360
        let currentY = 20;
        const photoWidth = 440;
        const photoHeight = 360;
        const gap = 15;

        loadedImages.forEach((img) => {
          ctx.drawImage(img, 20, currentY, photoWidth, photoHeight);

          // Draw frames for Luxury and Vintage
          if (selectedTheme === 'luxury') {
            ctx.strokeStyle = '#C9A84C';
            ctx.lineWidth = 2;
            ctx.strokeRect(20, currentY, photoWidth, photoHeight);
          } else if (selectedTheme === 'vintage') {
            ctx.strokeStyle = '#C8A97E';
            ctx.lineWidth = 2;
            ctx.strokeRect(20, currentY, photoWidth, photoHeight);
          }

          currentY += photoHeight + gap;
        });

        // After 3rd photo, currentY is 20 + 360 + 15 + 360 + 15 + 360 = 1130
        const line1Y = 1170;
        const line2Y = 1200;

        // 4. Draw centered stamp text
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const dateString = new Date().toLocaleDateString('en-US', options);

        let stampColor = '#1A1A1A';
        let dateColor = '#888888';

        if (selectedTheme === 'pink gingham') {
          stampColor = '#FF6B9D';
          dateColor = 'rgba(255, 107, 157, 0.7)';
        } else if (selectedTheme === 'luxury') {
          stampColor = '#C9A84C';
          dateColor = 'rgba(201, 168, 76, 0.7)';
        } else if (selectedTheme === 'cherry') {
          stampColor = '#C0392B';
          dateColor = 'rgba(192, 57, 43, 0.7)';
        } else if (selectedTheme === 'kisses') {
          stampColor = '#FF6B9D';
          dateColor = 'rgba(255, 107, 157, 0.7)';
        } else if (selectedTheme === 'vintage') {
          stampColor = '#7B5B3A';
          dateColor = 'rgba(123, 91, 58, 0.7)';
        }

        // Line 1: text stamp
        ctx.font = 'italic bold 24px "Dancing Script", cursive';
        ctx.fillStyle = stampColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('have a great day :)', 240, line1Y);

        // Line 2: formatted date
        ctx.font = 'italic 17px "Dancing Script", cursive';
        ctx.fillStyle = dateColor;
        ctx.fillText(dateString, 240, line2Y);

        // 5. Draw Borders & Theme-Specific elements LAST
        if (selectedTheme === 'pink gingham') {
          ctx.strokeStyle = '#FF6B9D';
          ctx.lineWidth = 6;
          ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
        } else if (selectedTheme === 'luxury') {
          ctx.strokeStyle = '#C9A84C';
          ctx.lineWidth = 4;
          ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

          // Gold corner ornament diamonds
          const drawDiamond = (cx, cy, size) => {
            ctx.fillStyle = '#C9A84C';
            ctx.beginPath();
            ctx.moveTo(cx, cy - size);
            ctx.lineTo(cx + size, cy);
            ctx.lineTo(cx, cy + size);
            ctx.lineTo(cx - size, cy);
            ctx.closePath();
            ctx.fill();
          };

          const dist = 16;
          const size = 6;
          drawDiamond(dist, dist, size);
          drawDiamond(canvas.width - dist, dist, size);
          drawDiamond(dist, canvas.height - dist, size);
          drawDiamond(canvas.width - dist, canvas.height - dist, size);
        } else if (selectedTheme === 'cherry') {
          // Draw light green border
          ctx.strokeStyle = '#E8F5E9';
          ctx.lineWidth = 8;
          ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

          // Draw cherries along side borders
          let isLeft = true;
          for (let y = 40; y < canvas.height - 40; y += 80) {
            const cx = isLeft ? 12 : canvas.width - 12;
            
            // Two red circles (radius 6px) side by side
            ctx.fillStyle = '#C0392B';
            ctx.beginPath();
            ctx.arc(cx - 4, y + 4, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(cx + 4, y + 4, 6, 0, Math.PI * 2);
            ctx.fill();

            // Green curved stem connecting them
            ctx.strokeStyle = '#27AE60';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 4, y);
            ctx.quadraticCurveTo(cx, y - 10, cx + 4, y);
            ctx.stroke();

            isLeft = !isLeft;
          }
        } else if (selectedTheme === 'kisses') {
          // Draw pink border
          ctx.strokeStyle = '#FF6B9D';
          ctx.lineWidth = 6;
          ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

          // Seeded random for consistent layout of scattered kisses
          let seed = 12345;
          const seededRandom = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
          };

          const drawKiss = (cx, cy, rotation) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation);
            ctx.fillStyle = 'rgba(255, 107, 157, 0.5)';

            // Upper lip: two small overlapping ellipses
            ctx.beginPath();
            ctx.ellipse(-4, -2, 6, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(4, -2, 6, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Lower lip: one larger ellipse
            ctx.beginPath();
            ctx.ellipse(0, 2, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          };

          const kissCount = 14;
          for (let i = 0; i < kissCount; i++) {
            const zone = Math.floor(seededRandom() * 4);
            let cx, cy;

            if (zone === 0) {
              cx = 5 + seededRandom() * 10;
              cy = 30 + seededRandom() * 1080;
            } else if (zone === 1) {
              cx = canvas.width - 15 + seededRandom() * 10;
              cy = 30 + seededRandom() * 1080;
            } else if (zone === 2) {
              cx = 20 + seededRandom() * (canvas.width - 40);
              cy = 5 + seededRandom() * 10;
            } else {
              cx = 20 + seededRandom() * (canvas.width - 40);
              cy = 1140 + seededRandom() * 80;
            }

            const rotation = (seededRandom() - 0.5) * 0.5;
            drawKiss(cx, cy, rotation);
          }
        } else if (selectedTheme === 'vintage') {
          // Draw vintage border
          ctx.strokeStyle = '#C8A97E';
          ctx.lineWidth = 8;
          ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

          // Draw slightly uneven inner border line: 2px dashed #A07850
          ctx.strokeStyle = '#A07850';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 6]);

          const inset = 16;
          let seedJitter = 100;
          const jitter = () => (Math.sin(seedJitter++) * 0.8);

          ctx.beginPath();
          ctx.moveTo(inset + jitter(), inset + jitter());
          ctx.lineTo(canvas.width - inset + jitter(), inset + jitter());
          ctx.lineTo(canvas.width - inset + jitter(), canvas.height - inset + jitter());
          ctx.lineTo(inset + jitter(), canvas.height - inset + jitter());
          ctx.closePath();
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 6. Apply film grain texture / aged texture via canvas pixel manipulation
        if (selectedTheme === 'vintage') {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < 0.15) {
              const noise = Math.floor(Math.random() * 17) - 8; // -8 to +8
              data[i] = Math.min(255, Math.max(0, data[i] + noise));
              data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
              data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }
          }
          ctx.putImageData(imageData, 0, 0);
        } else {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const noiseFactor = 20;
          for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * noiseFactor;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
          }
          ctx.putImageData(imageData, 0, 0);
        }
        
        setLoading(false);
        playStripSound();

      } catch (err) {
        console.error("Error drawing photo strip onto canvas:", err);
        setLoading(false);
      }
    };

    if (photos && photos.length > 0) {
      drawStrip();
    }

    return () => {
      isMounted = false;
    };
  }, [photos, selectedTheme]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'photobooth-strip.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="strip-container">
      <header className="strip-header">
        <button className="home-btn" onClick={onBack} aria-label="Back to landing screen">
          ← Home
        </button>
        <h2 className="strip-title">your memory strip.</h2>
      </header>

      <main className="strip-content">
        <div className="canvas-wrapper">
          {loading && <div className="canvas-loader">processing your shots...</div>}
          <canvas
            ref={canvasRef}
            width={480}
            height={1242}
            className="strip-canvas-preview"
            style={{ display: loading ? 'none' : 'block' }}
          />
        </div>

        <div className="strip-actions">
          <button 
            className="download-btn" 
            onClick={handleDownload}
            disabled={loading}
            aria-label="Download strip as image"
          >
            Download Strip 🎞️
          </button>
          
          <button 
            className="retake-text-btn" 
            onClick={onRetake}
            disabled={loading}
            aria-label="Retake photos"
          >
            Retake →
          </button>
        </div>
      </main>
    </div>
  );
}
