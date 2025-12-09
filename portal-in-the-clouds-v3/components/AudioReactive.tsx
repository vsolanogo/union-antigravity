
import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface AudioReactiveProps {
  enabled: boolean;
}

const AudioReactive: React.FC<AudioReactiveProps> = ({ enabled }) => {
  const { camera } = useThree();
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Nodes for dynamic manipulation
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const windFilterRef = useRef<BiquadFilterNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);
  
  // State for smoothing
  const lastMouse = useRef(new THREE.Vector2(0, 0));
  const speed = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    // Initialize Audio Context
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    audioContextRef.current = ctx;

    // Master Output
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.4; // Overall volume
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // --- LAYER 1: DEEP DRONE (The void) ---
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 55; // Low A
    
    // Drone LFO for subtle pulsing
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Very slow pulse
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 2.0; // Depth of FM
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.5;
    osc.connect(droneGain);
    droneGain.connect(masterGain);
    
    osc.start();
    droneOscRef.current = osc;
    droneGainRef.current = droneGain;

    // --- LAYER 2: ETHEREAL NOISE (The rift tearing) ---
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    // Pink noise generation
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    // Filter to shape the noise (starts muffled)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200; // Start very muffled
    filter.Q.value = 1;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.2;

    noiseSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    
    noiseSrc.start();
    windFilterRef.current = filter;
    windGainRef.current = noiseGain;

    // Cleanup
    return () => {
      osc.stop();
      noiseSrc.stop();
      lfo.stop();
      ctx.close();
    };
  }, [enabled]);

  useFrame((state) => {
    if (!audioContextRef.current || !windFilterRef.current || !droneGainRef.current) return;

    const time = state.clock.getElapsedTime();

    // Calculate mouse velocity
    const currentMouse = state.pointer;
    const dist = currentMouse.distanceTo(lastMouse.current);
    
    // Smooth the speed value (lerp)
    // 60fps * dist gives roughly pixels/sec logic but in normalized coords
    const instantaneousSpeed = dist * 20; 
    speed.current += (instantaneousSpeed - speed.current) * 0.1;

    lastMouse.current.copy(currentMouse);

    // --- REACTIVITY ---

    // 1. Wind Filter: Faster mouse = higher cutoff frequency (whoosh effect)
    // Base 150Hz, add up to 3000Hz based on speed
    const targetFreq = 150 + Math.min(speed.current * 4000, 3000);
    windFilterRef.current.frequency.setTargetAtTime(targetFreq, audioContextRef.current.currentTime, 0.1);

    // 2. Drone Panning/Detuning based on position
    // Center of screen = pure sound, Edges = slightly dissonant/quieter
    const distanceFromCenter = currentMouse.length(); // 0 to ~1.4
    
    // Modulate Drone Volume based on speed (movement energizes the portal)
    const targetDroneGain = 0.5 + Math.min(speed.current * 0.5, 0.3);
    droneGainRef.current.gain.setTargetAtTime(targetDroneGain, audioContextRef.current.currentTime, 0.1);

    // Subtle detune based on distance from center
    if (droneOscRef.current) {
        droneOscRef.current.detune.value = Math.sin(time * 0.5) * 10 + distanceFromCenter * 20;
    }
  });

  return null;
};

export default AudioReactive;
