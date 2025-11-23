
import React from 'react';

export const HeroOverlay: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 pointer-events-none select-none">
      {/* Main Container with Glassmorphism */}
      <div className="relative z-10 p-12 max-w-4xl w-full flex flex-col items-center">
        
        {/* Animated Title */}
        <div className="relative mb-6 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <h1 className="relative text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
            NEURAL<br/>NET
            </h1>
        </div>

        {/* Subtitle / Status Line */}
        <div className="flex items-center gap-4 text-cyan-500/80 font-mono text-sm tracking-[0.3em] mb-12">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>SYSTEM_ONLINE</span>
            <span className="hidden md:inline text-cyan-900/50">|</span>
            <span className="hidden md:inline">V 2.0.4</span>
        </div>

        {/* Buttons (Pointer events re-enabled) */}
        <div className="flex flex-wrap gap-6 justify-center pointer-events-auto">
             <button className="group relative px-8 py-3 bg-cyan-950/30 backdrop-blur-md border border-cyan-500/30 rounded hover:bg-cyan-900/40 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="text-cyan-100 font-bold tracking-widest text-sm uppercase">Initialize</span>
             </button>
             
             <button className="px-8 py-3 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors duration-300 font-mono text-sm uppercase tracking-widest">
                Documentation
             </button>
        </div>
      </div>
      
      {/* Footer / HUD elements */}
      <div className="absolute bottom-8 left-8 text-[10px] text-cyan-900 font-mono flex flex-col gap-1">
          <div>COORD: X_092 Y_104</div>
          <div>MEMORY: OPTIMIZED</div>
          <div>RENDER: PIXI.JS V7</div>
      </div>
    </div>
  );
};
