import React, { useState, useEffect, useCallback } from 'react';
import LostHighwayShader from './components/LostHighwayShader';

const App: React.FC = () => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [boost, setBoost] = useState(0.0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Smooth boost transition
  useEffect(() => {
    let animationFrame: number;
    const targetBoost = isMouseDown ? 1.0 : 0.0;
    
    const animateBoost = () => {
      setBoost(prev => {
        const diff = targetBoost - prev;
        if (Math.abs(diff) < 0.01) return targetBoost;
        return prev + diff * 0.08; // Slower, heavier car feel
      });
      animationFrame = requestAnimationFrame(animateBoost);
    };
    
    animateBoost();
    return () => cancelAnimationFrame(animationFrame);
  }, [isMouseDown]);

  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    // Map mouse X to steering (-1 to 1 range approx)
    const x = e.clientX / window.innerWidth;
    const y = 1.0 - (e.clientY / window.innerHeight);
    setMousePos({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const handleMysteryClick = () => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 200);
  };

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden text-neutral-300 selection:bg-red-600 selection:text-black cursor-none"
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onTouchStart={() => setIsMouseDown(true)}
      onTouchEnd={() => setIsMouseDown(false)}
    >
      {/* Custom Cursor */}
      <div 
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-50 mix-blend-difference transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          left: `${mousePos.x * 100}%`, 
          top: `${(1.0 - mousePos.y) * 100}%`,
        }}
      >
        <div className="absolute inset-0 border border-white/50 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 border border-red-500/30 rounded-full scale-150"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
      </div>

      {/* Background Layer - WebGL Shader */}
      <div className="absolute inset-0 z-0">
        <LostHighwayShader 
          speed={40.0} 
          boost={boost}
          mouseX={mousePos.x}
          mouseY={mousePos.y}
        />
      </div>

      {/* Atmospheric Overlays */}
      {/* Grain */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.1]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
           }}>
      </div>

      {/* Dirty Lens / Vignette */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-1000 ${isMouseDown ? 'opacity-100' : 'opacity-80'}`}
           style={{
             background: 'radial-gradient(circle at center, transparent 10%, rgba(10,5,0,0.4) 60%, rgba(0,0,0,0.95) 100%)',
           }}
      ></div>

      {/* Content Layer */}
      <main className="relative z-30 w-full h-full flex flex-col items-center justify-center pointer-events-none">
        
        {/* Title */}
        <div className={`transition-all duration-150 ${glitchActive ? 'translate-x-1 blur-sm text-red-500' : ''}`}>
          <h1 
            className="text-8xl md:text-[12rem] font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-neutral-400 to-black opacity-90 mix-blend-overlay"
          >
            Lost<br/>Highway
          </h1>
        </div>

        {/* Action Prompt */}
        <div className="mt-32 pointer-events-auto">
          <button 
            onClick={handleMysteryClick}
            className={`
              group relative px-16 py-6 overflow-hidden
              transition-all duration-500
              ${isMouseDown ? 'scale-95 blur-[1px]' : 'hover:scale-105'}
            `}
          >
            <div className="absolute inset-0 border border-neutral-800 group-hover:border-neutral-500 transition-colors duration-500"></div>
            <div className="absolute inset-0 bg-neutral-900/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            
            <span className="relative z-10 font-mono text-xs md:text-sm uppercase tracking-[0.4em] text-neutral-500 group-hover:text-white transition-colors">
              {isMouseDown ? 'DISSOCIATING' : 'INITIATE'}
            </span>
          </button>
        </div>

        {/* HUD Elements */}
        
        {/* Top Right: Signal Status */}
        <div className="absolute top-10 right-10 flex flex-col items-end gap-1 font-mono text-[10px] text-neutral-600">
           <div className="flex items-center gap-2">
             <span className={`${boost > 0.5 ? 'text-red-500 animate-pulse' : ''}`}>SIGNAL_LOSS</span>
             <div className="w-16 h-1 bg-neutral-900">
               <div className="h-full bg-neutral-500" style={{ width: `${Math.max(0, 100 - boost * 120)}%` }}></div>
             </div>
           </div>
           <span>FREQ 92.4 MHz</span>
        </div>

        {/* Bottom Left: Recording Info */}
        <div className="absolute bottom-10 left-10 flex flex-col gap-1 font-mono text-[10px] text-neutral-600">
           <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
             <span className="text-red-600 tracking-widest">REC</span>
           </div>
           <p>CAM_02 [EXTERIOR]</p>
           <p className="opacity-50">LAT: {34.052 + mousePos.y * 0.01}</p>
           <p className="opacity-50">LON: {-118.243 + mousePos.x * 0.01}</p>
        </div>

        {/* Bottom Right: Speedometer */}
        <div className="absolute bottom-10 right-10 text-right">
           <div className="text-4xl font-black text-neutral-800 font-mono tracking-tighter">
             {Math.floor(60 + boost * 120)} <span className="text-xs text-neutral-600 align-top">MPH</span>
           </div>
           <div className="w-32 h-[2px] bg-neutral-900 mt-2">
             <div 
               className="h-full bg-red-700 shadow-[0_0_10px_rgba(200,0,0,0.8)]"
               style={{ width: `${boost * 100}%` }}
             ></div>
           </div>
           <div className="mt-1 text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
             Turbo Injection
           </div>
        </div>

      </main>

      {/* Screen Flash on Click */}
      <div className={`absolute inset-0 bg-white z-50 pointer-events-none mix-blend-overlay transition-opacity duration-75 ${glitchActive ? 'opacity-20' : 'opacity-0'}`}></div>

      {/* Cinematic Bars */}
      <div className="absolute top-0 w-full h-[12vh] bg-black z-40"></div>
      <div className="absolute bottom-0 w-full h-[12vh] bg-black z-40"></div>
    </div>
  );
};

export default App;