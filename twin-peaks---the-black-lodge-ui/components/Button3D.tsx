import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Button3DProps, WebGLEffect } from '../types';
import './effects/Shaders'; 

// Interactive Lighting Rig
const InteractiveLight = ({ active }: { active: boolean }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const { mouse, viewport } = useThree();

  useFrame(() => {
    if (lightRef.current && active) {
      // Move light with mouse cursor in 3D space
      const x = (mouse.x * viewport.width) / 2;
      const y = (mouse.y * viewport.height) / 2;
      lightRef.current.position.set(x, y, 2);
    }
  });

  return (
    <pointLight 
      ref={lightRef} 
      color="#ffffff" 
      intensity={active ? 2.5 : 0.0} 
      distance={3}
      decay={2}
    />
  );
};

const ButtonScene: React.FC<{ effect: WebGLEffect; hovered: boolean }> = ({ effect, hovered }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      materialRef.current.uHover = THREE.MathUtils.lerp(
        materialRef.current.uHover,
        hovered ? 1.0 : 0.0,
        0.1
      );
    }
    
    // Subtle breathing scale when idle, snap when hovered
    if (meshRef.current) {
        const idleScale = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.005;
        const targetScale = hovered ? 1.02 : idleScale;
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
    }
  });

  const getMaterial = () => {
    switch (effect) {
      case WebGLEffect.RED_ROOM:
        return <redRoomMaterial ref={materialRef} />;
      case WebGLEffect.ZIG_ZAG:
        return <zigZagMaterial ref={materialRef} uScale={2.0} />; // Tighter pattern for button
      case WebGLEffect.FIRE_WALK:
        return <fireMaterial ref={materialRef} transparent={true} blending={THREE.AdditiveBlending} />;
      case WebGLEffect.ELECTRICITY:
        return <electricityMaterial ref={materialRef} transparent={true} blending={THREE.AdditiveBlending} />;
      default:
        return <redRoomMaterial ref={materialRef} />;
    }
  };

  return (
    <>
      <InteractiveLight active={hovered} />
      <mesh ref={meshRef}>
        <planeGeometry args={[6, 2.5, 64, 32]} /> 
        {getMaterial()}
      </mesh>
    </>
  );
};

export const Button3D: React.FC<Button3DProps> = ({ 
  label, 
  onClick, 
  effect = WebGLEffect.RED_ROOM,
  className = "",
  disabled = false
}) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      className={`relative group h-16 min-w-[240px] ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-none'}`}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* WebGL Container */}
      <div className="absolute -inset-1 rounded-sm overflow-hidden pointer-events-none opacity-90 transition-opacity duration-500 group-hover:opacity-100 box-content border border-transparent group-hover:border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
         <Canvas 
            camera={{ position: [0, 0, 2], fov: 45 }} 
            dpr={[1, 2]} // Handle high DPI
         >
            <ambientLight intensity={0.2} />
            <ButtonScene effect={effect} hovered={hovered} />
         </Canvas>
      </div>

      {/* Text Overlay */}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`relative z-10 w-full h-full bg-transparent text-white font-bold tracking-[0.25em] uppercase 
                   border border-white/10 group-hover:border-white/40 transition-all duration-300
                   flex items-center justify-center text-sm md:text-base shadow-inner
                   ${hovered ? 'text-shadow-neon' : ''}`}
        style={{
             textShadow: hovered ? '0 0 10px rgba(255,255,255,0.8)' : '0 2px 4px rgba(0,0,0,0.9)'
        }}
      >
        <span className="bg-black/20 px-4 py-1 backdrop-blur-[1px] rounded">
          {label}
        </span>
      </button>
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 group-hover:border-white/80 transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 group-hover:border-white/80 transition-colors"></div>
    </div>
  );
};
