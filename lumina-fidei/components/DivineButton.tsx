import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ButtonVariant, WebGLButtonProps } from '../types';
import { HaloEffect, PassionEffect } from './Effects';
import { useDivineAudio } from '../hooks/useDivineAudio';

const DivineButton: React.FC<WebGLButtonProps> = ({ label, variant, onClick, isLoading }) => {
  const [hover, setHover] = useState(false);
  const { playHover, playClick } = useDivineAudio();

  const handleMouseEnter = () => {
    setHover(true);
    playHover(variant);
  };

  const handleClick = () => {
    playClick(variant);
    onClick();
  };

  const getEffect = () => {
    switch (variant) {
      case ButtonVariant.HALO:
        return <HaloEffect hover={hover} />;
      case ButtonVariant.PASSION:
        return <PassionEffect hover={hover} />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
     switch (variant) {
      case ButtonVariant.HALO: return 'text-amber-50 drop-shadow-[0_0_12px_rgba(255,215,0,0.9)]';
      case ButtonVariant.PASSION: return 'text-red-50 drop-shadow-[0_0_12px_rgba(255,0,0,0.9)]';
      default: return 'text-white';
     }
  }

  return (
    <div 
      className="relative w-full h-full min-h-[300px] md:min-h-[400px] group cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-slate-900/20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
    >
      {/* WebGL Background Layer - Massive scale for full immersion */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] z-0 pointer-events-none mix-blend-screen transition-transform duration-1000 ease-out scale-100 group-hover:scale-110">
        <Canvas camera={{ position: [0, 0, 1] }} resize={{ scroll: false }}>
            <Suspense fallback={null}>
                {getEffect()}
            </Suspense>
        </Canvas>
      </div>

      {/* HTML Content Layer */}
      <button 
        className={`relative z-10 w-full h-full bg-transparent border-none outline-none flex items-center justify-center divine-font text-4xl md:text-5xl tracking-[0.2em] uppercase transition-all duration-500 ${getTextColor()} ${isLoading ? 'opacity-50 blur-[2px]' : 'opacity-100'}`}
        disabled={isLoading}
      >
        {isLoading ? (
            <span className="animate-pulse tracking-widest text-lg">Seeking...</span>
        ) : (
            <span className="relative flex flex-col items-center gap-4">
              <span className="transition-transform duration-500 group-hover:-translate-y-2">{label}</span>
              {/* Decorative line */}
              <span className={`h-[2px] bg-current transition-all duration-700 ease-out ${hover ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}></span>
            </span>
        )}
      </button>

      {/* Interactive Overlay Border */}
      <div className={`absolute inset-0 border-2 border-white/10 rounded-xl pointer-events-none transition-all duration-500 ${hover ? 'border-white/20 scale-[0.98]' : 'scale-100'}`} />
    </div>
  );
};

export default DivineButton;