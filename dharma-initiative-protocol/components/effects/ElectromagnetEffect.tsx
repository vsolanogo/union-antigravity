import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectProps } from '../../types';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv;
    
    // Glitch / Mag distortion strength
    float strength = 0.01 + (uHover * 0.05);
    
    // Chromatic Aberration offsets
    float rOffset = strength * sin(uTime * 10.0);
    float gOffset = strength * cos(uTime * 15.0);
    float bOffset = strength * sin(uTime * 20.0);

    // Wave distortion function
    auto wave = [&](float offset, float speed) {
        return sin(p.y * 20.0 + uTime * speed + offset);
    };

    // Calculate channels separately
    float r = abs(sin(p.y * 10.0 + uTime * 5.0 + rOffset * 5.0) / 20.0) / abs(p.x - 0.5 - rOffset + sin(p.y * 5.0)*0.1);
    float g = abs(sin(p.y * 10.0 + uTime * 5.0 + gOffset * 5.0) / 20.0) / abs(p.x - 0.5 - gOffset + sin(p.y * 5.0)*0.1);
    float b = abs(sin(p.y * 10.0 + uTime * 5.0 + bOffset * 5.0) / 20.0) / abs(p.x - 0.5 - bOffset + sin(p.y * 5.0)*0.1);

    // Violent discharge on hover
    if (uHover > 0.1) {
       float noise = fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453);
       if (noise > 0.9) {
           r += 0.5; g += 0.5; b += 1.0;
       }
    }

    vec3 color = vec3(r * 0.2, g * 0.5, b * 0.9);
    
    // Background plasma
    vec3 plasma = vec3(0.1, 0.0, 0.3) * (sin(p.x * 10.0 + uTime) + 1.0);
    color += plasma;

    // Border
    float borderAlpha = 0.0;
    if (p.x < 0.02 || p.x > 0.98 || p.y < 0.05 || p.y > 0.95) borderAlpha = 1.0;

    gl_FragColor = vec4(color + vec3(borderAlpha), smoothstep(0.0, 1.0, length(color)) * 0.8 + borderAlpha);
  }
`;

export const ElectromagnetEffect: React.FC<EffectProps> = ({ hovered }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uHover: { value: 0 } }), []);

  useFrame((state) => {
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        hovered ? 1.0 : 0.0,
        0.1
      );
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={mesh} scale={[7, 3, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};