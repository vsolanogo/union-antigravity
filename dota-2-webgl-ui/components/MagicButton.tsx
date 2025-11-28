import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ButtonEffect } from '../types';
import { 
  vertexShader, 
  infernalFragment, 
  frostFragment, 
  arcaneFragment, 
  stormFragment, 
  natureFragment 
} from '../services/shaders';

// Map effect types to shader code
const SHADER_MAP: Record<ButtonEffect, string> = {
  [ButtonEffect.INFERNAL]: infernalFragment,
  [ButtonEffect.FROST]: frostFragment,
  [ButtonEffect.ARCANE]: arcaneFragment,
  [ButtonEffect.STORM]: stormFragment,
  [ButtonEffect.NATURE]: natureFragment,
};

// Map effect types to fallback/accent colors for CSS border/text interaction
const COLOR_MAP: Record<ButtonEffect, string> = {
  [ButtonEffect.INFERNAL]: '#ff4400',
  [ButtonEffect.FROST]: '#00ccff',
  [ButtonEffect.ARCANE]: '#d500f9',
  [ButtonEffect.STORM]: '#2979ff',
  [ButtonEffect.NATURE]: '#76ff03',
};

interface ShaderPlaneProps {
  effect: ButtonEffect;
  isHovered: boolean;
}

const ShaderPlane: React.FC<ShaderPlaneProps> = ({ effect, isHovered }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) }, // normalized
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly interpolate hover state
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        isHovered ? 1.0 : 0.0,
        0.1
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={SHADER_MAP[effect]}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

interface MagicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  effect?: ButtonEffect;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MagicButton: React.FC<MagicButtonProps> = ({ 
  effect = ButtonEffect.INFERNAL, 
  label, 
  subLabel,
  icon,
  className = '',
  onClick,
  disabled,
  ...props 
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className={`relative group overflow-hidden border border-white/10 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      disabled={disabled}
      style={{
        // Dynamic border color based on effect
        borderColor: hovered ? COLOR_MAP[effect] : 'rgba(255,255,255,0.1)',
        transition: 'border-color 0.3s ease'
      }}
      {...props}
    >
      {/* WebGL Layer - Absolute background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas 
            camera={{ position: [0, 0, 1] }} 
            dpr={[1, 2]} // Optimize pixel ratio
            resize={{ scroll: false }} // Prevent resize loops in some containers
            gl={{ alpha: true, preserveDrawingBuffer: true }}
        >
          <ShaderPlane effect={effect} isHovered={hovered} />
        </Canvas>
      </div>

      {/* HTML Content Layer - Z-index above canvas */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 w-full h-full bg-black/20 backdrop-blur-[1px]">
        <div className="flex flex-col items-start text-left">
          <span 
            className="text-lg font-bold tracking-widest uppercase dota-font drop-shadow-md"
            style={{ 
              color: hovered ? '#fff' : '#ddd',
              textShadow: hovered ? `0 0 10px ${COLOR_MAP[effect]}` : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {label}
          </span>
          {subLabel && (
            <span className="text-xs text-white/60 tracking-wide font-sans mt-1">
              {subLabel}
            </span>
          )}
        </div>
        
        {icon && (
            <div 
                className="transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ml-4"
                style={{ color: hovered ? COLOR_MAP[effect] : 'rgba(255,255,255,0.5)' }}
            >
                {icon}
            </div>
        )}
      </div>
      
      {/* Interactive Shine Line (CSS overlay for extra polish) */}
      <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-shine pointer-events-none" />
    </button>
  );
};
