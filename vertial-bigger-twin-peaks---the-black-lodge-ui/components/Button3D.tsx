import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Button3DProps, WebGLEffect } from '../types';
import './effects/Shaders'; 
import { playHoverSound, playClickSound } from '../services/audioService';

// Interactive Lighting Rig
const InteractiveLight = ({ active }: { active: boolean }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const { mouse, viewport } = useThree();

  useFrame(() => {
    if (lightRef.current && active) {
      // Move light with mouse cursor in 3D space
      // Adjusted multiplier for wider viewport coverage
      const x = (mouse.x * viewport.width) / 2;
      const y = (mouse.y * viewport.height) / 2;
      lightRef.current.position.set(x, y, 4);
    }
  });

  return (
    <pointLight 
      ref={lightRef} 
      color="#ffffff" 
      intensity={active ? 3.0 : 0.0} 
      distance={8}
      decay={2}
    />
  );
};

const ButtonScene: React.FC<{ effect: WebGLEffect; hovered: boolean }> = ({ effect, hovered }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      materialRef.current.uHover = THREE.MathUtils.lerp(
        materialRef.current.uHover,
        hovered ? 1.0 : 0.0,
        0.1
      );
    }
    
    if (meshRef.current) {
        const idleScale = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.002;
        const targetScale = hovered ? 1.01 : idleScale;
        
        // Parallax Tilt Effect - Reduced intensity for large buttons to prevent clipping
        const tiltX = mouse.y * 0.05;
        const tiltY = mouse.x * 0.05;

        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, tiltX, 0.1);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, tiltY, 0.1);
    }
  });

  const getMaterial = () => {
    switch (effect) {
      case WebGLEffect.RED_ROOM:
        // @ts-ignore
        return <redRoomMaterial ref={materialRef} />;
      case WebGLEffect.ZIG_ZAG:
        // @ts-ignore
        return <zigZagMaterial ref={materialRef} uScale={3.0} />; 
      case WebGLEffect.FIRE_WALK:
        // @ts-ignore
        return <fireMaterial ref={materialRef} transparent={true} blending={THREE.AdditiveBlending} />;
      case WebGLEffect.ELECTRICITY:
        // @ts-ignore
        return <electricityMaterial ref={materialRef} transparent={true} blending={THREE.AdditiveBlending} />;
      default:
        // @ts-ignore
        return <redRoomMaterial ref={materialRef} />;
    }
  };

  return (
    <>
      <InteractiveLight active={hovered} />
      <mesh ref={meshRef}>
        {/* Greatly increased geometry size to ensure coverage for wide/tall buttons */}
        <planeGeometry args={[25, 12, 128, 64]} /> 
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
  
  const handleMouseEnter = () => {
    if (!disabled) {
      setHovered(true);
      playHoverSound();
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
          playClickSound();
          onClick?.();
      }
  };
  
  return (
    <div 
      className={`relative group ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-none'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* WebGL Container */}
      <div className="absolute -inset-[2px] rounded-sm overflow-hidden pointer-events-none opacity-80 transition-opacity duration-500 group-hover:opacity-100 border border-transparent group-hover:border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
         <Canvas 
            camera={{ position: [0, 0, 5], fov: 40 }} // Adjusted camera for better framing of large plane
            dpr={[1, 2]} 
         >
            <ambientLight intensity={0.2} />
            <ButtonScene effect={effect} hovered={hovered} />
         </Canvas>
      </div>

      {/* Text Overlay */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`relative z-10 w-full h-full bg-transparent text-white font-bold tracking-[0.3em] uppercase 
                   border border-white/5 group-hover:border-white/30 transition-all duration-300
                   flex items-center justify-center text-xl md:text-3xl shadow-inner
                   ${hovered ? 'text-shadow-neon' : ''}`}
        style={{
             textShadow: hovered ? '0 0 15px rgba(255,255,255,0.9)' : '0 2px 4px rgba(0,0,0,0.9)'
        }}
      >
        <span className="bg-black/30 px-8 py-3 backdrop-blur-[2px] rounded border-t border-b border-white/10">
          {label}
        </span>
      </button>
      
      {/* Corner Accents - Styled for larger buttons */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/20 group-hover:border-white/60 transition-colors"></div>
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/20 group-hover:border-white/60 transition-colors"></div>
    </div>
  );
};
