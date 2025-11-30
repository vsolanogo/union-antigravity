
import React, { useState, useEffect } from 'react';
import WebGLButton from './components/WebGLButton';
import { EffectType } from './types';
import { audio } from './utils/audioEngine';

const App: React.FC = () => {
  const [globalSpeed, setGlobalSpeed] = useState(1.0);
  const [globalIntensity, setGlobalIntensity] = useState(1.5);
  // Default audio to ON. The engine handles browser autoplay policy by waiting for first click to unlock if needed.
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    // Attempt to initialize audio engine on mount.
    // If the browser blocks it, the engine will suspend and wait for the first user interaction.
    audio.init();
  }, []);

  const toggleAudio = () => {
    audio.toggleMute();
    setAudioEnabled(!audio.isMuted);
  };

  const handleSystemHover = () => {
    if (!audio.isMuted) audio.playHoverSystem();
  };

  const handleScanHover = () => {
    if (!audio.isMuted) audio.playHoverScan();
  };

  const handleClickSound = () => {
    if (!audio.isMuted) audio.playClick();
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-hidden font-sans selection:bg-cyan-500/30 flex flex-col">
      
      {/* Cinematic Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,_rgba(20,20,30,0)_0%,_#000000_100%)]" />
      
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
      </div>

      {/* Header & Controls Overlay */}
      <header className="relative z-50 flex flex-col md:flex-row items-center justify-between px-8 py-6 bg-black/40 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
             <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#0ff]"></div>
             <h1 className="text-2xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                LUMINA<span className="text-cyan-400">GL</span>
             </h1>
        </div>

        {/* Minimal Controls */}
        <div className="flex gap-8">
            <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-mono text-cyan-500">Speed</span>
                <input 
                    type="range" min="0.1" max="3.0" step="0.1"
                    value={globalSpeed}
                    onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-mono text-emerald-500">Intensity</span>
                <input 
                    type="range" min="0.5" max="2.5" step="0.1"
                    value={globalIntensity}
                    onChange={(e) => setGlobalIntensity(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
            </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="relative z-10 flex-grow flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 gap-6 w-full max-w-[1920px] mx-auto">
        
        {/* Left Module: Initialize System */}
        <div className="w-full lg:w-1/2 h-[45vh] lg:h-[70vh] flex flex-col">
            <div className="mb-4 flex justify-between items-end px-2">
                <h2 className="text-sm font-mono text-cyan-300/70 tracking-widest">MODULE_01 // SYSTEM CORE</h2>
                <div className="h-[1px] flex-grow mx-4 bg-cyan-900/50"></div>
                <span className="text-xs font-mono text-gray-500">STATUS: READY</span>
            </div>
            
            <div className="flex-grow relative">
                <WebGLButton 
                    effectType={EffectType.NEON_PULSE}
                    label="Initialize System"
                    primaryColor={[0.0, 0.9, 1.0]} 
                    secondaryColor={[0.1, 0.1, 1.0]} 
                    speed={globalSpeed}
                    intensity={globalIntensity}
                    className="w-full h-full rounded-2xl text-2xl lg:text-4xl shadow-[0_0_50px_-10px_rgba(0,150,255,0.3)] border border-cyan-500/20"
                    onMouseEnter={handleSystemHover}
                    onClick={() => {
                        handleClickSound();
                        console.log("System Initialized");
                    }}
                />
                
                {/* Decorative corners */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg pointer-events-none"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg pointer-events-none"></div>
            </div>
        </div>

        {/* Right Module: Identify */}
        <div className="w-full lg:w-1/2 h-[45vh] lg:h-[70vh] flex flex-col">
             <div className="mb-4 flex justify-between items-end px-2">
                <h2 className="text-sm font-mono text-emerald-300/70 tracking-widest">MODULE_02 // SCANNER</h2>
                <div className="h-[1px] flex-grow mx-4 bg-emerald-900/50"></div>
                <span className="text-xs font-mono text-gray-500">STATUS: IDLE</span>
            </div>

            <div className="flex-grow relative">
                <WebGLButton 
                    effectType={EffectType.HOLOGRAPHIC}
                    label="Identify"
                    primaryColor={[0.0, 1.0, 0.6]} 
                    secondaryColor={[0.0, 0.2, 0.1]} 
                    speed={globalSpeed * 0.8}
                    intensity={globalIntensity}
                    className="w-full h-full rounded-2xl text-2xl lg:text-4xl shadow-[0_0_50px_-10px_rgba(0,255,100,0.2)] border border-emerald-500/20"
                    onMouseEnter={handleScanHover}
                    onClick={() => {
                        handleClickSound();
                        console.log("Identity Scanned");
                    }}
                />

                {/* Decorative corners */}
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-lg pointer-events-none"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-lg pointer-events-none"></div>
            </div>
        </div>

      </main>

      {/* Footer Status Bar */}
      <footer className="relative z-50 py-4 px-8 border-t border-white/5 bg-black/80 backdrop-blur text-center lg:text-left flex flex-col lg:flex-row justify-between items-center text-xs text-gray-500 font-mono">
        <div>
            SYSTEM_UPTIME: <span className="text-white">{(Math.random() * 9999).toFixed(2)}s</span>
        </div>
        <div className="mt-2 lg:mt-0 flex gap-6">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> GPU: ONLINE</span>
            <button 
                onClick={toggleAudio}
                className={`flex items-center gap-2 uppercase hover:text-white transition-colors cursor-pointer ${audioEnabled ? 'text-green-500' : 'text-gray-500'}`}
            >
                <div className={`w-1.5 h-1.5 rounded-full ${audioEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div> 
                AUDIO: {audioEnabled ? 'ONLINE' : 'OFFLINE'}
            </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
