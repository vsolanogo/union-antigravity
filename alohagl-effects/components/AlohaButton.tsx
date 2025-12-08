
import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AlohaButtonProps } from '../types';
import { OceanShader } from './shaders/OceanShader';
import { LavaShader } from './shaders/LavaShader';
import { NeonPalmShader } from './shaders/NeonPalmShader';
import { playClickSound, startHoverSound, resumeAudio } from '../utils/audio';

const EffectScene: React.FC<{ variant: string; hovered: boolean; clicked: boolean }> = ({ variant, hovered, clicked }) => {
  switch (variant) {
    case 'ocean':
      return <OceanShader hovered={hovered} clicked={clicked} />;
    case 'lava':
      return <LavaShader hovered={hovered} clicked={clicked} />;
    case 'neon-palm':
      return <NeonPalmShader hovered={hovered} clicked={clicked} />;
    default:
      return <OceanShader hovered={hovered} clicked={clicked} />;
  }
};

export const AlohaButton: React.FC<AlohaButtonProps> = ({ 
  children, 
  variant, 
  onClick, 
  className = '' 
}) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Audio Hook for Hover
  useEffect(() => {
    let stopSound: (() => void) | undefined;
    
    if (hovered) {
      // Attempt to resume audio context if it was suspended (e.g., first hover)
      resumeAudio();
      stopSound = startHoverSound(variant);
    }

    return () => {
      if (stopSound) stopSound();
    };
  }, [hovered, variant]);

  const handleMouseDown = () => {
    setClicked(true);
    
    // Trigger Sound
    playClickSound(variant);

    // Reset click animation state after a short delay
    setTimeout(() => setClicked(false), 200);
    onClick?.();
  };

  return (
    <div 
      className={`relative overflow-hidden cursor-pointer group select-none w-full h-full ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={handleMouseDown}
    >
      {/* WebGL Layer - Absolute background */}
      <div className="absolute inset-0 z-0">
        <Canvas 
            resize={{ debounce: 0 }}
            camera={{ position: [0, 0, 1], fov: 75 }}
            gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
            dpr={[1, 1.5]} // Optimized DPR for large areas
        >
          <Suspense fallback={null}>
            <EffectScene variant={variant} hovered={hovered} clicked={clicked} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Layer - Sits on top */}
      <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none p-4">
        <span className={`
          font-display text-5xl md:text-7xl tracking-wide drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] uppercase text-center
          ${variant === 'neon-palm' ? 'text-fuchsia-100 drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]' : 'text-white'}
          ${hovered ? 'scale-110 tracking-widest' : ''}
          transition-all duration-500 ease-out
        `}>
          {children}
        </span>
      </div>
    </div>
  );
};
