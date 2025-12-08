import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ButtonEffectType, ShaderUniforms } from '../types';
import { HAWAII_PALETTES } from '../constants';
import { vertexShader, waveFragmentShader, magmaFragmentShader, mistFragmentShader, tikiFragmentShader } from './effects/Shaders';

interface EffectSceneProps {
  effect: ButtonEffectType;
}

// Fixed speed configuration
const SPEED_CONFIG = {
  [ButtonEffectType.WAIKIKI_WAVE]: 0.3,
  [ButtonEffectType.VOLCANO_MAGMA]: 0.15, 
  [ButtonEffectType.TIKI_TORCH]: 1.0,    
  [ButtonEffectType.JUNGLE_MIST]: 0.2
};

const EffectScene: React.FC<EffectSceneProps> = ({ effect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree(); 
  
  // Choose palette
  const palette = HAWAII_PALETTES[effect];

  // Choose fragment shader
  const fragShader = useMemo(() => {
    switch (effect) {
      case ButtonEffectType.VOLCANO_MAGMA: return magmaFragmentShader;
      case ButtonEffectType.JUNGLE_MIST: return mistFragmentShader;
      case ButtonEffectType.TIKI_TORCH: return tikiFragmentShader;
      case ButtonEffectType.WAIKIKI_WAVE: 
      default: return waveFragmentShader;
    }
  }, [effect]);

  // CRITICAL FIX: Uniforms must be stable. Do NOT include 'size' in dependencies.
  const uniforms = useMemo<ShaderUniforms>(() => ({
    uTime: { value: 0 },
    uColor1: { value: palette.primary },
    uColor2: { value: palette.secondary },
    uColor3: { value: palette.tertiary || new THREE.Color('#000000') },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uHover: { value: 0 },
  }), [palette]); 

  // Update resolution uniform when canvas resizes
  useEffect(() => {
    if (uniforms.uResolution) {
      uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size, uniforms]);

  const timeRef = useRef(Math.random() * 100); 
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      const speed = SPEED_CONFIG[effect];
      const safeDelta = Math.min(delta, 0.1);

      timeRef.current += safeDelta * speed;
      material.uniforms.uTime.value = timeRef.current;

      const px = state.pointer.x * 0.5 + 0.5;
      const py = state.pointer.y * 0.5 + 0.5;
      material.uniforms.uMouse.value.set(px, py);
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

interface WebGLButtonProps {
  label: string;
  effect: ButtonEffectType;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const WebGLButton: React.FC<WebGLButtonProps> = ({ 
  label, 
  effect, 
  onClick, 
  className = "",
  disabled = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Handle Text Parallax in HTML space
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Parallax intensity
    setOffset({ x: x * -30, y: y * -30 });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden w-full h-full cursor-pointer group ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* WebGL Layer - Fills Container */}
      <div className="absolute inset-0 z-0 bg-slate-900 transition-transform duration-700 scale-100 group-hover:scale-105"> 
        <Canvas 
          resize={{ scroll: false }} 
          dpr={[1, 2]} 
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <EffectScene effect={effect} />
        </Canvas>
      </div>

      {/* HTML Content Layer with Parallax */}
      <div 
        className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none transition-transform duration-100 ease-out"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-widest text-white drop-shadow-xl ${disabled ? 'opacity-50' : 'opacity-90'} group-hover:text-cyan-100 transition-colors duration-300`}
             style={{ fontFamily: '"Inter", sans-serif' }}>
          {label}
        </h2>
        
        {/* Decorative Underline */}
        <div className="h-1 bg-white mt-4 transition-all duration-300 w-0 group-hover:w-24 opacity-80" />
      </div>

      {/* Borders/Grid Lines */}
      <div className="absolute inset-0 z-20 pointer-events-none border border-white/5 group-hover:border-white/20 transition-colors duration-500" />
    </div>
  );
};