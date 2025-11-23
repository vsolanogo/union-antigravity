import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { WebGlButtonProps } from '../types';
import EffectCanvas from './EffectCanvas';

// We disable events on the canvas so clicks go through to the HTML button
// We use 'dpr' to ensure sharp rendering on high DPI screens
const WebGlButton: React.FC<WebGlButtonProps> = ({ 
  label, 
  effect, 
  primaryColor = '#00ffcc', 
  secondaryColor = '#ff00ff', 
  className,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative inline-block w-48 h-16 mx-4 my-4 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 
        WebGL Layer 
        Positioned absolutely to fill the container.
        pointer-events-none ensures it doesn't block interaction with the button.
      */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas 
          camera={{ position: [0, 0, 2], fov: 50 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <EffectCanvas 
              effect={effect} 
              isHovered={isHovered} 
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* 
        HTML Layer
        The actual interactive element.
        Background is transparent to let WebGL show through.
      */}
      <button
        className={`
          relative z-10 w-full h-full 
          bg-transparent 
          text-white font-bold tracking-wider uppercase
          focus:outline-none
          transition-colors duration-300
          flex items-center justify-center
          ${isHovered ? 'text-white' : 'text-gray-200'}
        `}
        style={{
          textShadow: isHovered ? `0 0 10px ${primaryColor}` : 'none'
        }}
        {...props}
      >
        <span className="relative z-20 mix-blend-overlay opacity-90">{label}</span>
      </button>
    </div>
  );
};

export default WebGlButton;
