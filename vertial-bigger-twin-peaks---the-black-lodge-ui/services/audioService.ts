
let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playHoverSound = () => {
  try {
    const ctx = getCtx();
    // Hover sounds often fail if the user hasn't interacted with the page yet due to browser autoplay policies.
    // We attempt to resume, but don't block if it fails.
    if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {}); 
    }

    // Sound: A subtle 60Hz mains hum (Electricity theme)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, ctx.currentTime); // 60Hz electric hum
    
    // Envelope: Quick fade in and out
    const now = ctx.currentTime;
    const duration = 0.15;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.05); // Low volume
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    // Fail silently
  }
};

export const playClickSound = () => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Sound 1: The "Spark" / Static Burst
    // Create a buffer for white noise
    const bufferSize = ctx.sampleRate * 0.1; // 0.1 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.start(now);

    // Sound 2: The "Wood/Thud" (Low percussion)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

    oscGain.gain.setValueAtTime(0.15, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);

  } catch (e) {
    console.error("Audio playback failed", e);
  }
};
