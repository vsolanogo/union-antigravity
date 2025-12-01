
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WebGLEffect } from '../types';
import { audioEngine } from '../services/audioEngine';
import { 
  vertexShader, 
  neonFragment, 
  matrixFragment, 
  liquidFragment, 
  gridFragment, 
  plasmaFragment, 
  holoFragment 
} from './shaders/fragmentShaders';

interface MeshProps {
  effect: WebGLEffect;
  isHovered: boolean;
  mousePos: { x: number, y: number };
}

const EffectMesh: React.FC<MeshProps> = ({ effect, isHovered, mousePos }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const fragmentShader = useMemo(() => {
    switch (effect) {
      case WebGLEffect.NEON_PULSE: return neonFragment;
      case WebGLEffect.MATRIX_DATA: return matrixFragment;
      case WebGLEffect.LIQUID_METAL: return liquidFragment;
      case WebGLEffect.CYBER_GRID: return gridFragment;
      case WebGLEffect.PLASMA_VOID: return plasmaFragment;
      case WebGLEffect.HOLO_INTERFERENCE: return holoFragment;
      default: return neonFragment;
    }
  }, [effect]);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      hover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      resolution: { value: new THREE.Vector2(0, 0) }
    }),
    []
  );

  useFrame((state) => {
    const { clock } = state;
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = clock.getElapsedTime();
      
      // Snappier hover for Metro feel
      material.uniforms.hover.value = THREE.MathUtils.lerp(
        material.uniforms.hover.value,
        isHovered ? 1.0 : 0.0,
        0.1
      );

      // Interpolate mouse
      material.uniforms.uMouse.value.lerp(
        new THREE.Vector2(mousePos.x, mousePos.y),
        0.15
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} /> 
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={false}
      />
    </mesh>
  );
};

interface WebGLButtonProps {
  effect: WebGLEffect;
  label: string;
  onClick: () => void;
  className?: string;
  isSelected?: boolean;
  colorHex?: string; // Optional Metro accent color
}

const WebGLButton: React.FC<WebGLButtonProps> = ({ effect, label, onClick, className, isSelected, colorHex = "#00f3ff" }) => {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1; // 1 to -1 (inverted Y)
    
    setMousePos({ x, y });
    setTilt({ x: y * 5, y: x * -5 }); // Max 5 deg tilt
  };

  const handleMouseEnter = () => {
    setHovered(true);
    audioEngine.playHover();
  };

  const handleClick = () => {
    audioEngine.playClick();
    onClick();
  }

  return (
    <div 
      className={`relative group w-full aspect-square overflow-hidden cursor-pointer transition-all duration-200 ease-out select-none
        ${isSelected ? 'z-10 ring-4 ring-white' : ''}
        ${className}`}
      style={{
         transform: hovered ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)` : 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
         boxShadow: hovered ? '0 15px 30px rgba(0,0,0,0.5)' : '0 5px 15px rgba(0,0,0,0.2)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        setHovered(false);
        setMousePos({ x: 0, y: 0 });
        setTilt({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Background Layer - WebGL */}
      <div className="absolute inset-0 z-0 bg-gray-900">
        <Canvas 
            camera={{ position: [0, 0, 1] }} 
            dpr={[1, 2]} 
            gl={{ antialias: false, alpha: false }}
        >
          <EffectMesh effect={effect} isHovered={hovered || !!isSelected} mousePos={mousePos} />
        </Canvas>
      </div>

      {/* Metro UI Label Overlay - Bottom Left */}
      <div className="absolute inset-0 z-10 pointer-events-none p-4 flex flex-col justify-end">
         <div className={`transform transition-transform duration-300 origin-bottom-left ${hovered ? 'scale-110 mb-2' : ''}`}>
             <h3 className="font-sans text-2xl font-light tracking-wide text-white drop-shadow-md">
                {label}
             </h3>
             {isSelected && (
                <div className="h-1 w-8 bg-white mt-1"></div>
             )}
         </div>
         {/* Top Right Icon hint */}
         <div className={`absolute top-3 right-3 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
             <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
         </div>
      </div>
      
      {/* Sharp Border (Metro Style) - Optional highlight on hover */}
      <div className={`absolute inset-0 border-4 transition-colors duration-300 pointer-events-none
          ${isSelected ? 'border-white' : (hovered ? 'border-white/20' : 'border-transparent')}`}>
      </div>
    </div>
  );
};

export default WebGLButton;
