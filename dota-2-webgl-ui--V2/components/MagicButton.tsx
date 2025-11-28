
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ButtonEffect } from '../types';
import { audio } from '../services/audio';
import { 
  vertexShader, 
  infernalFragment, 
  frostFragment, 
  arcaneFragment, 
  stormFragment, 
  natureFragment 
} from '../services/shaders';

const SHADER_MAP: Record<ButtonEffect, string> = {
  [ButtonEffect.INFERNAL]: infernalFragment,
  [ButtonEffect.FROST]: frostFragment,
  [ButtonEffect.ARCANE]: arcaneFragment,
  [ButtonEffect.STORM]: stormFragment,
  [ButtonEffect.NATURE]: natureFragment,
};

const COLOR_MAP: Record<ButtonEffect, string> = {
  [ButtonEffect.INFERNAL]: '#ff3300',
  [ButtonEffect.FROST]: '#00f7ff',
  [ButtonEffect.ARCANE]: '#bf00ff',
  [ButtonEffect.STORM]: '#40a6ff',
  [ButtonEffect.NATURE]: '#5eff00',
};

interface ShaderPlaneProps {
  effect: ButtonEffect;
  isHovered: boolean;
  mousePos: { x: number, y: number };
  isPressed: boolean;
}

const ShaderPlane: React.FC<ShaderPlaneProps> = ({ effect, isHovered, mousePos, isPressed }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uPress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Lerp hover intensity
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        isHovered ? 1.0 : 0.0,
        0.1
      );

      // Lerp press intensity (quick burst)
      material.uniforms.uPress.value = THREE.MathUtils.lerp(
        material.uniforms.uPress.value,
        isPressed ? 1.0 : 0.0,
        0.2
      );

      // Lerp mouse position for smooth trailing
      material.uniforms.uMouse.value.lerp(new THREE.Vector2(mousePos.x, 1.0 - mousePos.y), 0.1);
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
  const [pressed, setPressed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
    }
  };
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      setHovered(true);
      audio.playHover();
      if (props.onMouseEnter) props.onMouseEnter(e);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      setPressed(true);
      audio.playClick();
      if (props.onMouseDown) props.onMouseDown(e);
      // Reset press state after animation frame duration roughly
      setTimeout(() => setPressed(false), 200);
  };

  return (
    <button
      ref={buttonRef}
      className={`relative group overflow-hidden transition-all duration-300 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      disabled={disabled}
      style={{
        boxShadow: hovered 
          ? `0 0 20px ${COLOR_MAP[effect]}40, inset 0 0 10px ${COLOR_MAP[effect]}20` 
          : 'none',
      }}
      {...props}
    >
        {/* Metal Border Container */}
        <div className="absolute inset-0 pointer-events-none z-20 border-[1px] border-white/10 group-hover:border-white/30 transition-colors">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/30 group-hover:border-white/80 transition-colors" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/30 group-hover:border-white/80 transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/30 group-hover:border-white/80 transition-colors" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/30 group-hover:border-white/80 transition-colors" />
        </div>

      {/* WebGL Layer */}
      <div className="absolute inset-0 z-0 bg-black/80">
        <Canvas 
            camera={{ position: [0, 0, 1] }} 
            dpr={[1, 2]} 
            resize={{ scroll: false }}
            gl={{ alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
        >
          <ShaderPlane effect={effect} isHovered={hovered} mousePos={mousePos} isPressed={pressed} />
        </Canvas>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 w-full h-full bg-gradient-to-r from-black/60 via-transparent to-black/60 backdrop-blur-[1px]">
        <div className="flex flex-col items-start text-left pointer-events-none select-none">
          <span 
            className="text-lg font-bold tracking-[0.2em] uppercase dota-font relative"
            style={{ 
              color: hovered ? '#fff' : '#ccc',
              textShadow: hovered ? `0 0 15px ${COLOR_MAP[effect]}` : '0 2px 4px rgba(0,0,0,0.8)',
              transition: 'all 0.3s ease'
            }}
          >
            {label}
          </span>
          {subLabel && (
            <span className="text-[10px] text-white/50 tracking-wider font-sans mt-0.5 uppercase">
              {subLabel}
            </span>
          )}
        </div>
        
        {icon && (
            <div 
                className="transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ml-4"
                style={{ 
                    color: hovered ? '#fff' : 'rgba(255,255,255,0.3)',
                    filter: hovered ? `drop-shadow(0 0 8px ${COLOR_MAP[effect]})` : 'none'
                }}
            >
                {icon}
            </div>
        )}
      </div>
      
      {/* Scanline / Glare Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-50 z-20" />
      <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:animate-shine pointer-events-none z-30" />
    </button>
  );
};
