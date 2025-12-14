import React, { useState, useRef, useEffect } from 'react';
import LynchBackground from './components/LynchBackground';

const App: React.FC = () => {
  const [showQuote, setShowQuote] = useState(false);
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const isAudioInitializedRef = useRef(false);

  // Initialize and start the audio graph (Oscillators -> Master Gain -> Destination)
  const initAudio = () => {
    if (isAudioInitializedRef.current) return;
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Master Gain (Volume Control)
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0; // Start silent
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // --- Layer 1: The "Room Tone" (Throbbing Low Hum) ---
    // Osc 1: Deep Sine
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55; // Low A
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.4;
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start();

    // Osc 2: Detuned Sine (Creates binaural beat/throb)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 57; // 2Hz beat frequency
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.3;
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start();

    // --- Layer 2: The "Wind" (Filtered Noise) ---
    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // White noise
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 300; // Muffeled wind
    noiseFilter.Q.value = 1;

    // LFO for Wind Swell
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Very slow swell
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200; // Modulate filter cutoff
    lfo.connect(lfoGain);
    lfoGain.connect(noiseFilter.frequency);
    lfo.start();

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08; // Subtle

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();

    // --- Layer 3: High Tension (Eerie, barely audible) ---
    const osc3 = ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.value = 440; // High A
    const gain3 = ctx.createGain();
    gain3.gain.value = 0.005; // Very quiet
    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start();

    isAudioInitializedRef.current = true;
  };

  const handleToggleDream = () => {
    const nextState = !showQuote;
    setShowQuote(nextState);

    // Init audio on first interaction
    if (!isAudioInitializedRef.current && nextState) {
      initAudio();
    }

    // Handle Audio Context State
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    // Fade In/Out logic
    if (masterGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const gain = masterGainRef.current.gain;
      
      // Cancel any scheduled ramps to avoid conflicts
      gain.cancelScheduledValues(now);
      
      // We need to set the current value explicitly before ramping
      gain.setValueAtTime(gain.value, now);

      if (nextState) {
        // Fade In
        gain.linearRampToValueAtTime(1.0, now + 3.0);
      } else {
        // Fade Out
        gain.linearRampToValueAtTime(0.0, now + 1.5);
      }
    }
  };

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen text-white overflow-hidden bg-black">
      {/* Background Shader */}
      <div className="absolute inset-0 z-0">
        <LynchBackground />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none">
        <div className="text-center space-y-8 p-6">
          <h1 className="text-5xl md:text-8xl font-serif italic font-bold tracking-tighter text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] opacity-90">
            The Black Lodge
          </h1>
          
          <div className="h-32 flex items-center justify-center">
            {showQuote ? (
              <p className="font-['Special_Elite'] text-xl md:text-2xl text-red-100 animate-pulse tracking-widest uppercase max-w-lg mx-auto leading-relaxed drop-shadow-lg">
                "Through the darkness of future past,<br/>
                the magician longs to see,<br/>
                one chance out between two worlds,<br/>
                fire walk with me."
              </p>
            ) : (
              <p className="font-['Special_Elite'] text-lg md:text-xl text-gray-200 opacity-80 tracking-[0.3em] drop-shadow-md">
                WAITING ROOM
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="absolute bottom-12 w-full flex justify-center z-20 pointer-events-auto">
        <button
          onClick={handleToggleDream}
          className="group relative px-10 py-4 bg-black/30 border border-red-800/60 hover:border-red-500 text-red-50 font-['Special_Elite'] tracking-[0.2em] text-sm transition-all duration-700 hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] backdrop-blur-md overflow-hidden rounded-sm cursor-pointer"
        >
          <span className="relative z-10 group-hover:text-white transition-colors duration-300">
            {showQuote ? "LEAVE THE DREAM" : "ENTER THE DREAM"}
          </span>
          <div className="absolute inset-0 bg-red-900/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-out"></div>
        </button>
      </div>

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,1)_100%)]"></div>
    </div>
  );
};

export default App;