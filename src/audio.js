let audioCtx = null;

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch((err) => console.warn("Failed to resume AudioContext:", err));
  }
  return audioCtx;
}

// Auto-initialize/resume AudioContext on first user interaction
if (typeof window !== 'undefined') {
  const initAudio = () => {
    getAudioContext();
    window.removeEventListener('click', initAudio);
    window.removeEventListener('touchstart', initAudio);
  };
  window.addEventListener('click', initAudio);
  window.addEventListener('touchstart', initAudio);
}

export function createSound(frequency, duration, gain, type = 'sine') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
    return { osc, gainNode };
  } catch (err) {
    console.warn("createSound failed:", err);
    return null;
  }
}

export function playCountdownBeep() {
  createSound(600, 0.1, 0.15, 'sine');
}
