import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComponent } from '../types';

interface R3FButtonProps {
  children: React.ReactNode;
  effect: EffectComponent;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const R3FButton: React.FC<R3FButtonProps> = ({ 
  children, 
  effect: Effect, 
  onClick, 
  className = "",
  disabled = false
}) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleMouseDown = () => !disabled && setClicked(true);
  const handleMouseUp = () => {
    setClicked(false);
    if (!disabled && onClick) onClick();
  };

  return (
    <div className={`relative inline-block group ${className}`}>
      {/* WebGL Layer - Acts as background/border/effects */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-md pointer-events-none">
        <Canvas 
          resize={{ scroll: false }} 
          dpr={[1, 2]} // Optimize for pixel density
          camera={{ position: [0, 0, 5], fov: 50 }}
        >
          {/* We pass the state down to the 3D scene */}
          <Effect hovered={hovered && !disabled} clicked={clicked} />
        </Canvas>
      </div>

      {/* HTML Layer - Handles interaction and accessibility */}
      <button
        className={`relative z-10 w-full h-full px-8 py-4 text-lg font-bold transition-colors duration-300 btn-ghost ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setClicked(false); }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        disabled={disabled}
      >
        {children}
      </button>
    </div>
  );
};
