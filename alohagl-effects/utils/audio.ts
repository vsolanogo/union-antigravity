
import { ButtonVariant } from '../types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

// Initialize Audio Context lazily
const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.4; // Master Volume
    masterGain.connect(audioCtx.destination);
  }
  return { ctx: audioCtx, master: masterGain! };
};

// Resume context helper (needed for browsers blocking autoplay)
export const resumeAudio = () => {
  const { ctx } = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume().catch((e) => console.warn('Audio resume failed', e));
  }
};

// --- SYNTHESIS HELPERS ---

// Create a noise buffer (Pink/White noise approximation)
const createNoiseBuffer = (ctx: AudioContext) => {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // Simple white noise
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

let sharedNoiseBuffer: AudioBuffer | null = null;

// --- SOUND EFFECTS ---

export const playClickSound = (variant: ButtonVariant) => {
  const { ctx, master } = getAudioContext();
  // Try to resume if suspended (though click usually counts as gesture)
  if (ctx.state === 'suspended') ctx.resume();

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // Noise source for textures
  if (!sharedNoiseBuffer) sharedNoiseBuffer = createNoiseBuffer(ctx);
  const noise = ctx.createBufferSource();
  noise.buffer = sharedNoiseBuffer;
  const noiseGain = ctx.createGain();

  osc.connect(gain);
  noise.connect(noiseGain);
  noiseGain.connect(gain);
  gain.connect(master);

  switch (variant) {
    case 'ocean':
      // SPLASH: Noise burst with filter opening
      // Oscillator is unused here, so we do not start or stop it.
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      noiseGain.disconnect();
      noise.disconnect();
      noise.connect(filter);
      filter.connect(gain);

      filter.frequency.setValueAtTime(100, t);
      filter.frequency.exponentialRampToValueAtTime(8000, t + 0.1);
      filter.frequency.exponentialRampToValueAtTime(500, t + 0.3);

      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      
      noise.start(t);
      noise.stop(t + 0.5);
      break;

    case 'lava':
      // EXPLOSION: Low sine drop + Rumble noise
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(10, t + 0.5);

      // Distorted Noise
      noiseGain.gain.setValueAtTime(0.5, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

      gain.gain.setValueAtTime(1.0, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

      osc.start(t);
      osc.stop(t + 0.6);
      noise.start(t);
      noise.stop(t + 0.6);
      break;

    case 'neon-palm':
      // LASER ZAP: Fast sine sweep
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.2);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      // Add a bit of reverb-like delay
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.05;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.4;
      
      gain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(master);

      osc.start(t);
      osc.stop(t + 0.3);
      break;
  }
};

export const startHoverSound = (variant: ButtonVariant): (() => void) => {
  const { ctx, master } = getAudioContext();
  
  // Note: Hover sounds might not play if user hasn't interacted with document yet
  if (ctx.state === 'suspended') {
     // We can try to resume, but it might fail without a gesture. 
     // We simply return a no-op if context is locked, waiting for first click.
     return () => {};
  }

  const t = ctx.currentTime;
  const masterHoverGain = ctx.createGain();
  masterHoverGain.connect(master);
  masterHoverGain.gain.setValueAtTime(0, t);
  masterHoverGain.gain.linearRampToValueAtTime(1, t + 0.5); // Fade in

  let nodes: AudioNode[] = [];

  switch (variant) {
    case 'ocean': {
      // WAVES: Pink noise + LFO Filter
      if (!sharedNoiseBuffer) sharedNoiseBuffer = createNoiseBuffer(ctx);
      const noise = ctx.createBufferSource();
      noise.buffer = sharedNoiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 1;

      // LFO for wave motion
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.2; // Slow waves

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 600; // Filter modulation depth

      filter.frequency.value = 800;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(masterHoverGain);

      noise.start();
      lfo.start();
      
      nodes.push(noise, lfo, masterHoverGain, filter, lfoGain);
      break;
    }
    case 'lava': {
      // RUMBLE: Low frequency sine + noise
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 50;
      
      // FM Synthesis for texture
      const mod = ctx.createOscillator();
      mod.frequency.value = 20;
      const modGain = ctx.createGain();
      modGain.gain.value = 30;

      mod.connect(modGain);
      modGain.connect(osc.frequency);

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.5;

      osc.connect(oscGain);
      oscGain.connect(masterHoverGain);

      osc.start();
      mod.start();

      nodes.push(osc, mod, modGain, oscGain, masterHoverGain);
      break;
    }
    case 'neon-palm': {
      // VAPORWAVE DRONE: Detuned Sawtooths
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 110; // A2

      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.value = 110.5; // Detuned

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.15; // Lower volume for synth

      osc1.connect(oscGain);
      osc2.connect(oscGain);
      oscGain.connect(filter);
      filter.connect(masterHoverGain);

      osc1.start();
      osc2.start();

      nodes.push(osc1, osc2, oscGain, filter, masterHoverGain);
      break;
    }
  }

  return () => {
    const now = ctx.currentTime;
    // Fade out
    masterHoverGain.gain.cancelScheduledValues(now);
    masterHoverGain.gain.setValueAtTime(masterHoverGain.gain.value, now);
    masterHoverGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    // Stop nodes after fade
    setTimeout(() => {
      nodes.forEach(node => {
        try {
          if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
            node.stop();
          }
          node.disconnect();
        } catch(e) {}
      });
    }, 350);
  };
};
