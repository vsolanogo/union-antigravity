import { useRef, useEffect, useCallback } from 'react';
import { ButtonVariant } from '../types';

// --- Global Audio Context Singleton (Lazy Init) ---
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let reverbNode: ConvolverNode | null = null;
let droneNodes: AudioNode[] = [];
let isAudioInitialized = false;

const createImpulseResponse = (ctx: AudioContext, duration: number, decay: number, reverse: boolean) => {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = reverse ? length - i : i;
    let e = Math.pow(1 - n / length, decay);
    left[i] = (Math.random() * 2 - 1) * e;
    right[i] = (Math.random() * 2 - 1) * e;
  }
  return impulse;
};

export const initAudio = () => {
  if (isAudioInitialized) return;
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
    
    // Master Chain
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.4;
    
    // Cathedral Reverb
    reverbNode = audioCtx.createConvolver();
    reverbNode.buffer = createImpulseResponse(audioCtx, 3.0, 2.0, false); // 3s tail
    
    // Routing: Master -> Reverb -> Destination
    // Also Master -> Dry -> Destination (for clarity)
    const dryGain = audioCtx.createGain();
    dryGain.gain.value = 0.7;
    const wetGain = audioCtx.createGain();
    wetGain.gain.value = 0.5;

    masterGain.connect(dryGain);
    masterGain.connect(reverbNode);
    reverbNode.connect(wetGain);
    
    dryGain.connect(audioCtx.destination);
    wetGain.connect(audioCtx.destination);

    startDrone(audioCtx, masterGain);
    
    isAudioInitialized = true;
  } catch (e) {
    console.error("Audio init failed", e);
  }
};

const startDrone = (ctx: AudioContext, dest: AudioNode) => {
  // Ethereal Drone (Root + Fifth + Octave)
  const freqs = [110, 165, 220]; // A2, E3, A3
  
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    
    osc.frequency.value = f;
    osc.type = i === 1 ? 'sine' : 'triangle';
    
    // LFO for breathing effect
    lfo.frequency.value = 0.1 + (Math.random() * 0.1);
    lfoGain.gain.value = 0.05; // Modulation depth
    
    gain.gain.value = 0.05; // Base volume per oscillator
    
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    
    osc.connect(gain);
    gain.connect(dest);
    
    osc.start();
    lfo.start();
    
    droneNodes.push(osc, gain, lfo, lfoGain);
  });
};

export const useDivineAudio = () => {
  
  const playHover = useCallback((variant: ButtonVariant) => {
    if (!audioCtx || !masterGain) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    if (variant === ButtonVariant.HALO) {
      // Shimmering high cluster
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1); // A6
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    } else {
      // Deep swell
      osc.type = 'sawtooth';
      // Low pass filter simulation via simple gain envelope for "bite"
      osc.frequency.setValueAtTime(110, now); // A2
      osc.frequency.linearRampToValueAtTime(108, now + 0.5); // Detune down
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    }
    
    osc.start(now);
    osc.stop(now + 2.0);
  }, []);

  const playClick = useCallback((variant: ButtonVariant) => {
    if (!audioCtx || !masterGain) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    if (variant === ButtonVariant.HALO) {
      // Bell-like pure tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(554.37, now); // C#5
      osc.frequency.exponentialRampToValueAtTime(554.37, now + 1);
      
      // Bell envelope
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02); // Sharp attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0); // Long tail
    } else {
      // Deep Impact / Heartbeat
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.5); // Drop
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    }
    
    osc.start(now);
    osc.stop(now + 3.0);
  }, []);

  return { playHover, playClick, initAudio };
};
