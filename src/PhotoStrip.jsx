import React, { useEffect, useRef, useState } from 'react';
import './PhotoStrip.css';

export default function PhotoStrip({ photos, selectedFilter, onBack, onRetake }) {
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

      // Clear canvas to white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
          currentY += photoHeight + gap;
        });

        // After 3rd photo, currentY is 20 + 360 + 15 + 360 + 15 + 360 = 1130
        // Adjust spacing for larger stamp fonts: Line 1 Y = 1170, Line 2 Y = 1200 (gap of 30px)
        const line1Y = 1170;
        const line2Y = 1200;

        // 4. Draw centered stamp text
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const dateString = new Date().toLocaleDateString('en-US', options);

        // Line 1: text stamp
        ctx.font = 'italic bold 24px "Dancing Script", cursive';
        ctx.fillStyle = '#1A1A1A';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('have a great day :)', 240, line1Y);

        // Line 2: formatted date
        ctx.font = 'italic 17px "Dancing Script", cursive';
        ctx.fillStyle = '#888888';
        ctx.fillText(dateString, 240, line2Y);

        // 5. Draw thin 1px #E0E0E0 border around the full strip (offset by 0.5px for crispness)
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

        // 6. Apply film grain texture via canvas pixel manipulation
        // Random noise at ~8% opacity (noise range: -10 to 10)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const noiseFactor = 20; // 8% of 255 is ~20

        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * noiseFactor;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));     // Red
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // Green
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // Blue
          // Alpha channel remains unchanged (255)
        }
        
        ctx.putImageData(imageData, 0, 0);
        setLoading(false);

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
  }, [photos]);

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
