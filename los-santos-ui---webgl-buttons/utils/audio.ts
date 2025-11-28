
let audioCtx: AudioContext | null = null;
let isMuted = false;

// Initialize Audio Context (must be called after user interaction)
const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const setMuted = (muted: boolean) => {
  isMuted = muted;
};

export const getMuted = () => isMuted;

// GTA V Style Hover "Tick"
export const playHoverSound = () => {
  if (isMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  // Short, high-pitch digital blip
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);

  // Lowpass to soften the square wave slightly
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3000, t);

  // Short envelope
  gain.gain.setValueAtTime(0.05, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

  osc.start(t);
  osc.stop(t + 0.05);
};

// GTA V Style Select "Thud"
export const playClickSound = () => {
  if (isMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Deep sine/triangle punch
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);

  // Heavier envelope
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  osc.start(t);
  osc.stop(t + 0.15);
};

// Glitchy Noise Burst
export const playGlitchSound = () => {
  if (isMuted) return;
  const ctx = initAudio();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 0.1; // 0.1 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const gain = ctx.createGain();
  
  noise.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  noise.start();
};
