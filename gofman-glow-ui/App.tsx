
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { WebGLButton } from './components/WebGLButton';
import { EffectStyle } from './types';
import { audioSystem } from './services/audio';

const App: React.FC = () => {
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);

  // One-time listener to unlock audio context on the first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      audioSystem.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#050505] overflow-hidden flex flex-col md:flex-row">
      
      {/* HEADER OVERLAY */}
      <div className="absolute top-0 left-0 w-full z-50 pointer-events-none p-6 flex justify-between items-start">
         <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter font-tech text-white drop-shadow-lg">
              GOFMAN<span className="text-green-500">.OS</span>
            </h1>
            <span className="text-[10px] font-mono text-gray-400 tracking-[0.3em]">SECURE_ACCESS_TERMINAL</span>
         </div>
         <div className="text-[10px] font-mono text-green-500 animate-pulse border border-green-900/50 bg-green-900/10 px-2 py-1 rounded">
           SYS_READY
         </div>
      </div>

      {/* LEFT SIDE: SHIELD */}
      <div 
        className={`
          relative flex-1 border-b md:border-b-0 md:border-r border-white/10 
          transition-all duration-500 ease-out
          ${hoveredSide === 'left' ? 'flex-[1.5] z-20 shadow-[0_0_100px_rgba(0,100,255,0.3)]' : 'flex-1 z-10'}
          ${hoveredSide === 'right' ? 'flex-[0.8] opacity-50' : 'opacity-100'}
        `}
        onMouseEnter={() => setHoveredSide('left')}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <WebGLButton 
          label="ACTIVATE SHIELD" 
          styleVariant={EffectStyle.KHERSON_WAVE}
          className="w-full h-full text-3xl md:text-5xl tracking-widest"
          onClick={() => console.log("Shield Active")}
        />
        {/* Overlay decorative UI for Left */}
        <div className="absolute bottom-10 left-10 pointer-events-none font-mono text-xs text-blue-400/60">
           <div>DEFENSE_MATRIX: ONLINE</div>
           <div>INTEGRITY: 100%</div>
        </div>
      </div>

      {/* RIGHT SIDE: MELON */}
      <div 
        className={`
          relative flex-1 
          transition-all duration-500 ease-out
          ${hoveredSide === 'right' ? 'flex-[1.5] z-20 shadow-[0_0_100px_rgba(0,255,100,0.3)]' : 'flex-1 z-10'}
          ${hoveredSide === 'left' ? 'flex-[0.8] opacity-50' : 'opacity-100'}
        `}
        onMouseEnter={() => setHoveredSide('right')}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <WebGLButton 
          label="DEPLOY MELON" 
          styleVariant={EffectStyle.WATERMELON_GLITCH}
          className="w-full h-full text-3xl md:text-5xl tracking-widest text-green-100"
          onClick={() => console.log("Melon Deployed")}
        />
        {/* Overlay decorative UI for Right */}
        <div className="absolute bottom-10 right-10 pointer-events-none font-mono text-xs text-green-400/60 text-right">
           <div>PAYLOAD: ORGANIC</div>
           <div>STATUS: RIPE</div>
        </div>
      </div>

    </div>
  );
};

export default App;
