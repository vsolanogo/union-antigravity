
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  basicVertexShader, 
  neonFragmentShader, 
  wantedFragmentShader, 
  moneyFragmentShader,
  glitchFragmentShader,
  sunsetFragmentShader
} from '../utils/shaders';

type EffectType = 'neon' | 'wanted' | 'money' | 'glitch' | 'sunset';

interface ButtonEffectsProps {
  effect: EffectType;
  hovered: boolean;
  color?: string;
}

const ButtonEffects: React.FC<ButtonEffectsProps> = ({ effect, hovered, color = '#00ff00' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, viewport } = useThree(); // Get viewport for scaling
  
  // 1. Stable Uniforms Reference
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uHover: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) }, 
  }), []); 

  // 2. Update Uniform Values
  useEffect(() => {
    uniforms.uColor.value.set(color);
    uniforms.uResolution.value.set(size.width, size.height);
  }, [color, size, uniforms]);

  // Select shader based on type
  const fragmentShader = useMemo(() => {
    switch (effect) {
      case 'neon': return neonFragmentShader;
      case 'wanted': return wantedFragmentShader;
      case 'money': return moneyFragmentShader;
      case 'glitch': return glitchFragmentShader;
      case 'sunset': return sunsetFragmentShader;
      default: return neonFragmentShader;
    }
  }, [effect]);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      
      // Update Time Uniform
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Update Resolution
      material.uniforms.uResolution.value.set(state.size.width, state.size.height);
      
      // Smoothly interpolate hover state
      const targetHover = hovered ? 1.0 : 0.0;
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        targetHover,
        0.1
      );
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      {/* Use unit plane and scale it to viewport dimensions */}
      <planeGeometry args={[1, 1]} /> 
      <shaderMaterial
        vertexShader={basicVertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};

export default ButtonEffects;
