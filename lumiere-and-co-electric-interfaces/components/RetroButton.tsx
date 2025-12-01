
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ButtonStyle, WebGLButtonProps } from '../types';
import { 
  vertexShader, 
  edisonFragmentShader, 
  teslaFragmentShader, 
  radiumFragmentShader,
  brassFragmentShader 
} from './shaders';
import { soundManager } from './SoundManager';

interface ShaderPlaneProps {
  styleVariant: ButtonStyle;
  hovered: boolean;
  mousePos: { x: number, y: number };
}

const ShaderPlane: React.FC<ShaderPlaneProps> = ({ styleVariant, hovered, mousePos }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();
  
  // Calculate aspect ratio (width / height)
  const aspect = size.width / size.height;

  const fragmentShader = useMemo(() => {
    switch (styleVariant) {
      case ButtonStyle.EDISON: return edisonFragmentShader;
      case ButtonStyle.TESLA: return teslaFragmentShader;
      case ButtonStyle.RADIUM: return radiumFragmentShader;
      case ButtonStyle.BRASS: return brassFragmentShader;
      default: return edisonFragmentShader;
    }
  }, [styleVariant]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uAspect: { value: 1.0 },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uAspect.value = aspect;
      
      // Smoothly interpolate hover state
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        hovered ? 1.0 : 0.0,
        0.1
      );

      // Smoothly interpolate mouse position for fluid light movement
      material.uniforms.uMouse.value.x = THREE.MathUtils.lerp(
        material.uniforms.uMouse.value.x,
        mousePos.x,
        0.1
      );
      material.uniforms.uMouse.value.y = THREE.MathUtils.lerp(
        material.uniforms.uMouse.value.y,
        mousePos.y,
        0.1
      );
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

export const RetroButton: React.FC<WebGLButtonProps> = ({ 
  label, 
  onClick, 
  styleVariant,
  className = ""
}) => {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // Invert Y for GL coords
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => {
    setHovered(true);
    soundManager.playHover(styleVariant);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleClick = () => {
    // Ensure context is running (browser policy)
    soundManager.ensureContext();

    // Play specific sound based on variant
    switch (styleVariant) {
      case ButtonStyle.EDISON:
        soundManager.playEdisonIgnite();
        break;
      case ButtonStyle.TESLA:
        soundManager.playTeslaDischarge();
        break;
      case ButtonStyle.RADIUM:
        soundManager.playRadiumActivate();
        break;
      case ButtonStyle.BRASS:
        soundManager.playBrassEngage();
        break;
    }

    if (onClick) onClick();
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full cursor-pointer group select-none overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* WebGL Layer - Fills the container */}
      <div className="absolute inset-0 z-0">
        <Canvas 
          camera={{ position: [0, 0, 1], fov: 60 }}
          gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
          dpr={[1, 2]} 
          resize={{ scroll: false }}
        >
          <ShaderPlane styleVariant={styleVariant} hovered={hovered} mousePos={mousePos} />
        </Canvas>
      </div>

      {/* HTML Content Layer - Centered over the shader */}
      <button 
        className="relative z-10 w-full h-full flex items-center justify-center bg-transparent border-0 outline-none text-center pointer-events-none"
        aria-label={label}
      >
        <div className="flex flex-col items-center space-y-4 pointer-events-none">
          <span className={`
            font-cinzel font-black tracking-[0.2em] uppercase transition-all duration-500
            text-4xl md:text-5xl lg:text-6xl
            ${styleVariant === ButtonStyle.TESLA ? 'text-blue-50 drop-shadow-[0_0_15px_rgba(100,200,255,0.6)]' : 
              styleVariant === ButtonStyle.RADIUM ? 'text-green-50 drop-shadow-[0_0_15px_rgba(100,255,100,0.6)]' :
              styleVariant === ButtonStyle.BRASS ? 'text-[#2a1d0f] drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]' :
              'text-amber-50 drop-shadow-[0_0_20px_rgba(255,160,50,0.6)]'}
            ${hovered ? 'scale-110 tracking-[0.3em]' : 'scale-100'}
          `}>
            {label}
          </span>
          
          {/* Decorative subtitle */}
          <span className={`
            text-sm md:text-base font-mono tracking-widest uppercase opacity-70
            ${styleVariant === ButtonStyle.BRASS ? 'text-[#3e2b16]' : 'text-white/60'}
          `}>
             {styleVariant === ButtonStyle.TESLA ? '/// HIGH VOLTAGE ///' : 
             styleVariant === ButtonStyle.RADIUM ? '/// RADIOACTIVE ///' : 
             styleVariant === ButtonStyle.BRASS ? '/// HYDRAULIC ///' : '/// SYSTEM READY ///'}
          </span>
        </div>
      </button>
    </div>
  );
};
