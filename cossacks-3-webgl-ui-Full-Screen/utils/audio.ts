
import { EffectStyle } from '../types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isSystemMuted = false;

const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);
      masterGain.gain.value = isSystemMuted ? 0 : 0.4;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(e => console.error("Audio resume failed", e));
  }
  return audioCtx;
};

export const setMuted = (muted: boolean) => {
  isSystemMuted = muted;
  if (!masterGain) initAudio();
  
  if (masterGain && audioCtx) {
    const now = audioCtx.currentTime;
    // Smooth fade to prevent popping
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.4, now + 0.1);
  }
};

export const resumeAudioContext = () => {
    initAudio();
};

export const playHoverSound = (effect: EffectStyle) => {
    if (isSystemMuted) return;
    const ctx = initAudio();
    if (!ctx || !masterGain) return;
    
    const t = ctx.currentTime;

    if (effect === EffectStyle.GOLDEN_FLAME) {
        // Metallic Shimmer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        
        // Add a second harmonic for "shine"
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1600, t);
        gain2.gain.setValueAtTime(0, t);
        gain2.gain.linearRampToValueAtTime(0.02, t + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        osc2.connect(gain2);
        gain.connect(masterGain);
        gain2.connect(masterGain);
        
        osc.start(t); osc.stop(t + 0.3);
        osc2.start(t); osc2.stop(t + 0.2);

    } else if (effect === EffectStyle.BATTLE_MIST) {
        // Wind Whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        // Using low freq triangle as a simple wind simulation
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.linearRampToValueAtTime(40, t + 0.3);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.1);
        gain.gain.linearRampToValueAtTime(0, t + 0.4);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.4);
    } else { 
        // CLOCKWORK TICK (Academy)
        // Short burst of white noise + high click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2000, t);
        
        // Very short envelope
        gain.gain.setValueAtTime(0.0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        
        // Highpass filter to make it "clicky"
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 3000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.06);
    }
};

export const playClickSound = (effect: EffectStyle) => {
    if (isSystemMuted) return;
    const ctx = initAudio();
    if (!ctx || !masterGain) return;
    
    const t = ctx.currentTime;

    if (effect === EffectStyle.GOLDEN_FLAME) {
        // Heavy Coin Drop / Sword Ring
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        
        // Ring
        const ring = ctx.createOscillator();
        const ringGain = ctx.createGain();
        ring.type = 'sine';
        ring.frequency.setValueAtTime(1400, t);
        ringGain.gain.setValueAtTime(0.15, t);
        ringGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

        osc.connect(gain);
        ring.connect(ringGain);
        gain.connect(masterGain);
        ringGain.connect(masterGain);
        
        osc.start(t); osc.stop(t + 0.4);
        ring.start(t); ring.stop(t + 1.2);

    } else if (effect === EffectStyle.BATTLE_MIST) {
        // Explosion Thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(20, t + 0.4);
        
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        // Distortion for "crunch"
        const dist = ctx.createWaveShaper();
        dist.curve = makeDistortionCurve(200);

        // Lowpass to muffle it like a distant cannon
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, t);
        filter.frequency.linearRampToValueAtTime(100, t + 0.5);

        osc.connect(gain);
        gain.connect(dist);
        dist.connect(filter);
        filter.connect(masterGain);
        
        osc.start(t);
        osc.stop(t + 0.6);
    } else {
        // MECHANICAL LATCH (Academy)
        // Two sounds: metal clank + deep gear lock
        
        // 1. Metal Clank
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        
        // 2. Thud
        const thud = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thud.type = 'square';
        thud.frequency.setValueAtTime(100, t);
        thud.frequency.exponentialRampToValueAtTime(10, t + 0.2);
        thudGain.gain.setValueAtTime(0.3, t);
        thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        
        // Lowpass the square wave
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 300;

        thud.connect(filter);
        filter.connect(thudGain);
        
        osc.connect(gain);
        gain.connect(masterGain);
        thudGain.connect(masterGain);
        
        osc.start(t); osc.stop(t + 0.2);
        thud.start(t); thud.stop(t + 0.2);
    }
}

// Helper for distortion
function makeDistortionCurve(amount: number) {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
  }
  return curve;
}
