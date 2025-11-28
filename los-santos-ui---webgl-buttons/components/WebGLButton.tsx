
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import ButtonEffects from './ButtonEffects';
import { playHoverSound, playClickSound, playGlitchSound } from '../utils/audio';

type EffectType = 'neon' | 'wanted' | 'money' | 'glitch' | 'sunset';

interface WebGLButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  effect?: EffectType;
  baseColor?: string;
  label?: string;
  subLabel?: string;
  width?: string;
  height?: string;
}

const WebGLButton: React.FC<WebGLButtonProps> = ({ 
  effect = 'neon', 
  baseColor = '#ff00ff',
  label,
  subLabel,
  width = 'w-64',
  height = 'h-16',
  className = '',
  children,
  onClick,
  onMouseEnter,
  ...props 
}) => {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setHovered(true);
    if (effect === 'glitch') {
      if (Math.random() > 0.7) playGlitchSound(); // Occasional glitch sound
      else playHoverSound();
    } else {
      playHoverSound();
    }
    onMouseEnter?.(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg tilt
    const rotateY = ((x - centerX) / centerX) * 15;

    containerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (containerRef.current) {
        containerRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playClickSound();
    onClick?.(e);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${width} ${height} group cursor-pointer transition-transform duration-100 ease-out will-change-transform ${className}`}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* WebGL Layer - Absolute positioned behind content */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-md pointer-events-none" style={{ transform: 'translateZ(0px)' }}>
        <Canvas 
          camera={{ position: [0, 0, 1] }}
          gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
          dpr={[1, 2]} // Handle high DPI screens
          resize={{ debounce: 0 }} // Responsive resize
        >
          <ButtonEffects effect={effect} hovered={hovered} color={baseColor} />
        </Canvas>
      </div>

      {/* HTML Content Layer - Interactive */}
      <button 
        className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white bg-transparent border-0 focus:outline-none"
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        style={{ transform: 'translateZ(20px)' }} // Parallax text forward
        {...props}
      >
        <span className={`text-xl uppercase font-bold tracking-wider font-gta drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all duration-300 ${hovered ? 'scale-110 text-white' : 'scale-100 text-gray-100'}`}>
          {label || children}
        </span>
        {subLabel && (
          <span className="text-xs uppercase tracking-widest opacity-80 mt-1 font-sans font-semibold drop-shadow-md">
            {subLabel}
          </span>
        )}
      </button>

      {/* Decorative Border for "Tech" feel */}
      <div className={`absolute inset-0 border border-white/20 rounded-md pointer-events-none transition-all duration-300 ${hovered ? 'border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''}`} style={{ transform: 'translateZ(0px)' }} />
    </div>
  );
};

export default WebGLButton;
