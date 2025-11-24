import React, { useState, Suspense, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { WebGlButtonProps } from '../types';
import EffectCanvas from './EffectCanvas';

// --- Procedural Audio Hook ---
// Generates sci-fi UI sounds without external assets
const useAudioFeedback = (primaryFreq: number = 440) => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext only on user interaction usually, but we'll try to lazy load
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
       audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
  };

  const playHover = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(primaryFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(primaryFreq * 1.5, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [primaryFreq]);

  const playClick = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    // Bass Thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    
    // High tech chirp
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(primaryFreq * 2, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(primaryFreq * 4, ctx.currentTime + 0.05);
    
    gain2.gain.setValueAtTime(0.05, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();
    osc2.stop(ctx.currentTime + 0.1);

  }, [primaryFreq]);

  return { playHover, playClick };
};


const WebGlButton: React.FC<WebGlButtonProps> = ({ 
  label, 
  effect, 
  primaryColor = '#00ffcc', 
  secondaryColor = '#ff00ff', 
  className,
  disabled,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate a rough frequency from the color string for unique sounds per button
  const colorFreq = parseInt(primaryColor.replace('#', '').substring(0, 2), 16) * 2 + 200;
  const { playHover, playClick } = useAudioFeedback(colorFreq);

  // Mouse tilt tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || disabled) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;
    
    const xNorm = (x / rect.width) * 2 - 1;
    const yNorm = (y / rect.height) * 2 - 1;
    
    containerRef.current.style.transform = `perspective(800px) rotateX(${-yNorm * 8}deg) rotateY(${xNorm * 8}deg) scale(${isPressed ? 0.95 : 1.05})`;
  };

  const handleMouseEnter = () => {
    if(disabled) return;
    setIsHovered(true);
    playHover();
  };

  const handleMouseLeave = () => {
    if(disabled) return;
    setIsHovered(false);
    setIsPressed(false);
    if (containerRef.current) {
        containerRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
  };

  const handleMouseDown = () => {
    if(disabled) return;
    setIsPressed(true);
    playClick();
  };

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block w-56 h-20 mx-6 my-6 transition-transform duration-100 ease-out select-none ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={() => setIsPressed(false)}
    >
      {/* WebGL Layer */}
      <div className="absolute inset-[-50%] w-[200%] h-[200%] z-0 pointer-events-none flex items-center justify-center">
        <Canvas 
          camera={{ position: [0, 0, 4], fov: 40 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={2.0} />
            <pointLight position={[-5, -5, -2]} intensity={1.0} color={secondaryColor} />
            <EffectCanvas 
              effect={effect} 
              isHovered={isHovered} 
              isPressed={isPressed}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* HTML Layer */}
      <button
        className={`
          relative z-10 w-full h-full 
          bg-transparent 
          text-white font-black tracking-[0.25em] uppercase text-sm
          focus:outline-none
          transition-all duration-300
          flex items-center justify-center
          border border-white/10
          rounded-sm
        `}
        style={{
          textShadow: isHovered 
            ? `0 0 30px ${primaryColor}, 0 0 10px white` 
            : '0 0 10px rgba(0,0,0,0.8)',
          boxShadow: isHovered
            ? `inset 0 0 30px ${primaryColor}11`
            : 'none'
        }}
        disabled={disabled}
        {...props}
      >
        <span className="relative z-20 mix-blend-screen drop-shadow-md">
          {label}
        </span>
        
        {/* Tech UI Decor */}
        <div className={`absolute top-0 left-0 w-full h-full border border-${isHovered ? 'white/40' : 'white/5'} scale-[1.02] transition-all duration-300`}></div>
        
        <div className={`absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-${isHovered ? 'cyan-400' : 'white/20'} transition-colors duration-200`}></div>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-${isHovered ? 'cyan-400' : 'white/20'} transition-colors duration-200`}></div>
        
        {/* Animated Scanline Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[5px] w-full animate-scanline opacity-20 pointer-events-none"></div>
      </button>
    </div>
  );
};

export default WebGlButton;