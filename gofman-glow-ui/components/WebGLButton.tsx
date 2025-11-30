
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectStyle, WebGLButtonProps } from '../types';
import { 
  vertexShader, 
  khersonWaveFragment, 
  toxicSludgeFragment, 
  cyberPulseFragment,
  watermelonGlitchFragment
} from './shaders';
import { audioSystem } from '../services/audio';

// -- The Scene Component --
interface SceneProps {
  hovered: boolean;
  clickedTime: number;
  styleVariant: EffectStyle;
  mousePos: THREE.Vector2;
}

const EffectMesh: React.FC<SceneProps> = ({ hovered, styleVariant, mousePos, clickedTime }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree(); 
  
  const fragmentShader = useMemo(() => {
    switch (styleVariant) {
      case EffectStyle.KHERSON_WAVE: return khersonWaveFragment;
      case EffectStyle.TOXIC_SLUDGE: return toxicSludgeFragment;
      case EffectStyle.CYBER_PULSE: return cyberPulseFragment;
      case EffectStyle.WATERMELON_GLITCH: return watermelonGlitchFragment;
      default: return khersonWaveFragment;
    }
  }, [styleVariant]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uClick: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uResolution.value.set(viewport.width, viewport.height);

      // Snappy hover transition
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        hovered ? 1.0 : 0.0,
        0.08
      );

      // Smooth mouse follow
      material.uniforms.uMouse.value.lerp(mousePos, 0.15);

      // Click Ripple
      const timeSinceClick = state.clock.elapsedTime - clickedTime;
      const clickIntensity = timeSinceClick >= 0 && timeSinceClick < 2.0 ? timeSinceClick : 0.0;
      material.uniforms.uClick.value = clickIntensity;
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

export const WebGLButton: React.FC<WebGLButtonProps> = ({ 
  label, 
  onClick, 
  styleVariant = EffectStyle.KHERSON_WAVE,
  className = "",
  disabled = false
}) => {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState(new THREE.Vector2(0.5, 0.5));
  const [lastClickTime, setLastClickTime] = useState(-999);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; 
    setMousePos(new THREE.Vector2(x, y));
  }, []);

  const handleMouseEnter = () => {
    setHovered(true);
    audioSystem.playHover();
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    setLastClickTime(performance.now() / 1000);
    
    // Trigger specific sound based on variant
    if (styleVariant === EffectStyle.WATERMELON_GLITCH) {
      audioSystem.playMelonClick();
    } else {
      audioSystem.playShieldClick();
    }

    if (onClick) onClick();
  };

  return (
    <div 
      className={`relative group overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* 1. WebGL Layer - Fills Container */}
      <div className="absolute inset-0 z-0 bg-black">
        <Canvas 
            camera={{ position: [0, 0, 1] }}
            dpr={[1, 2]} 
            resize={{ scroll: false, debounce: 0 }} 
            gl={{ alpha: false, antialias: true }}
        >
            <EffectMesh 
              hovered={hovered} 
              styleVariant={styleVariant} 
              mousePos={mousePos}
              clickedTime={lastClickTime}
            />
        </Canvas>
      </div>

      {/* 2. Content Layer - Centered */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative z-10 
          w-full h-full
          flex flex-col items-center justify-center
          text-white font-black uppercase
          bg-transparent 
          transition-all duration-500
          group-hover:tracking-[0.1em]
          group-active:scale-[0.98]
          outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          font-tech
        `}
        style={{
          textShadow: '0 10px 30px rgba(0,0,0,0.8)'
        }}
      >
        <span className="relative z-20 mix-blend-overlay opacity-90 group-hover:opacity-100 transition-opacity">
            {label}
        </span>
        <div className="h-1 w-0 bg-white group-hover:w-20 transition-all duration-300 mt-4 opacity-50" />
      </button>
    </div>
  );
};
