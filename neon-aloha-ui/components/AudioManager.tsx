
import React, { useEffect, useRef } from 'react';

// --- Audio Utils ---

// Create a buffer of noise
const createNoiseBuffer = (ctx: AudioContext, type: 'white' | 'pink' | 'brown', duration: number = 2.0) => {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; 
      b6 = white * 0.115926;
    }
  } else if (type === 'brown') {
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; 
    }
  }
  return buffer;
};

export const AudioManager: React.FC = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodesRef = useRef<{ [key: string]: GainNode }>({});
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const isSetupRef = useRef(false);
  const isInsideWindowRef = useRef(true); // Track if mouse is inside window

  useEffect(() => {
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    // 1. Initialize Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Master Gain (Limiter)
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.4; // Overall volume
    masterGain.connect(ctx.destination);

    // --- SYNTHESIZERS ---

    // Channel 1: Surf (Pink Noise + Lowpass LFO)
    const surfGain = ctx.createGain();
    surfGain.gain.value = 0;
    surfGain.connect(masterGain);
    gainNodesRef.current['surf'] = surfGain;

    const surfSource = ctx.createBufferSource();
    surfSource.buffer = createNoiseBuffer(ctx, 'pink', 5);
    surfSource.loop = true;
    
    const surfFilter = ctx.createBiquadFilter();
    surfFilter.type = 'lowpass';
    surfFilter.frequency.value = 400;

    // LFO for Waves
    const surfLFO = ctx.createOscillator();
    surfLFO.type = 'sine';
    surfLFO.frequency.value = 0.15; // Wave frequency
    const surfLFOGain = ctx.createGain();
    surfLFOGain.gain.value = 300; // Filter modulation depth
    
    surfLFO.connect(surfLFOGain);
    surfLFOGain.connect(surfFilter.frequency);
    surfSource.connect(surfFilter);
    surfFilter.connect(surfGain);
    
    surfSource.start();
    surfLFO.start();


    // Channel 2: Magma (Brown Noise + Rumble)
    const magmaGain = ctx.createGain();
    magmaGain.gain.value = 0;
    magmaGain.connect(masterGain);
    gainNodesRef.current['magma'] = magmaGain;

    const magmaSource = ctx.createBufferSource();
    magmaSource.buffer = createNoiseBuffer(ctx, 'brown', 5);
    magmaSource.loop = true;
    
    const magmaFilter = ctx.createBiquadFilter();
    magmaFilter.type = 'lowpass';
    magmaFilter.frequency.value = 150; // Deep rumble

    magmaSource.connect(magmaFilter);
    magmaFilter.connect(magmaGain);
    magmaSource.start();


    // Channel 3: Fire (High-passed White Noise + Crackle)
    const fireGain = ctx.createGain();
    fireGain.gain.value = 0;
    fireGain.connect(masterGain);
    gainNodesRef.current['fire'] = fireGain;

    const fireSource = ctx.createBufferSource();
    fireSource.buffer = createNoiseBuffer(ctx, 'white', 2);
    fireSource.loop = true;

    const fireFilter = ctx.createBiquadFilter();
    fireFilter.type = 'highpass';
    fireFilter.frequency.value = 800;

    // Crackle modulation (Random)
    // We cheat by using a bandpass noise to modulate gain slightly
    const crackleLFO = ctx.createOscillator();
    crackleLFO.type = 'sawtooth';
    crackleLFO.frequency.value = 15;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.2;
    
    // Connect logic
    fireSource.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireSource.start();


    // Channel 4: Jungle (Ambient + Chirps)
    const jungleGain = ctx.createGain();
    jungleGain.gain.value = 0;
    jungleGain.connect(masterGain);
    gainNodesRef.current['jungle'] = jungleGain;

    // Insect Ambience (High pitched pink noise)
    const insectSource = ctx.createBufferSource();
    insectSource.buffer = createNoiseBuffer(ctx, 'pink', 3);
    insectSource.loop = true;
    const insectFilter = ctx.createBiquadFilter();
    insectFilter.type = 'highpass';
    insectFilter.frequency.value = 3000;
    insectSource.connect(insectFilter);
    insectFilter.connect(jungleGain);
    insectSource.start();

    // Procedural Birds (Random chirps)
    const birdOsc = ctx.createOscillator();
    birdOsc.type = 'sine';
    birdOsc.frequency.value = 0; // Starts silent
    const birdGain = ctx.createGain();
    birdGain.gain.value = 0;
    birdOsc.connect(birdGain);
    birdGain.connect(jungleGain);
    birdOsc.start();

    // Bird logic loop
    const scheduleBird = () => {
      if (Math.random() > 0.7) {
        const now = ctx.currentTime;
        const freq = 1500 + Math.random() * 1000;
        birdOsc.frequency.setValueAtTime(freq, now);
        birdOsc.frequency.exponentialRampToValueAtTime(freq / 2, now + 0.1);
        
        birdGain.gain.setValueAtTime(0, now);
        birdGain.gain.linearRampToValueAtTime(0.1, now + 0.01);
        birdGain.gain.linearRampToValueAtTime(0, now + 0.15);
      }
      setTimeout(scheduleBird, 500 + Math.random() * 2000);
    };
    scheduleBird();


    // 2. Spatial Mixer Loop
    const updateVolumes = () => {
      if (!audioCtxRef.current) return;
      const { x, y } = mouseRef.current;
      
      // Determine if we should play sound (mouse inside window)
      // If mouse is outside, multiply all volumes by 0
      const masterScale = isInsideWindowRef.current ? 1.0 : 0.0;

      // Note: x, y are 0..1 relative to screen
      // Top Left: Surf
      // Top Right: Magma (Erupt)
      // Bottom Left: Fire (Ignite)
      // Bottom Right: Jungle (Explore)
      
      // Calculate proximity volumes (bilinear interpolation logic)
      const surfVol = (1 - x) * (1 - y);
      const magmaVol = x * (1 - y);
      const fireVol = (1 - x) * y;
      const jungleVol = x * y;

      const time = audioCtxRef.current.currentTime;
      const ramp = 0.5; // smooth fade

      // Apply with smoothing and master scaling
      gainNodesRef.current['surf'].gain.setTargetAtTime(surfVol * 0.8 * masterScale, time, ramp);
      gainNodesRef.current['magma'].gain.setTargetAtTime(magmaVol * 1.5 * masterScale, time, ramp);
      gainNodesRef.current['fire'].gain.setTargetAtTime(fireVol * 0.6 * masterScale, time, ramp);
      gainNodesRef.current['jungle'].gain.setTargetAtTime(jungleVol * 0.7 * masterScale, time, ramp);

      requestAnimationFrame(updateVolumes);
    };
    updateVolumes();

    // 3. Resume Audio on Interaction (Autoplay Policy)
    const resumeAudio = () => {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    };
    
    // Window visibility listeners
    const handleMouseEnter = () => {
      isInsideWindowRef.current = true;
      resumeAudio();
    };
    
    const handleMouseLeave = () => {
      isInsideWindowRef.current = false;
    };

    window.addEventListener('click', resumeAudio);
    window.addEventListener('pointermove', resumeAudio);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      ctx.close();
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('pointermove', resumeAudio);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Track mouse for mixer
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      };
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return null; // Headless component
};
