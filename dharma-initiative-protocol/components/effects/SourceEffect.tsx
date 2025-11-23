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
    vec2 uv = vUv - 0.5;
    // Fix aspect ratio for circle
    uv.x *= 2.3; 
    
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Rotating God Rays
    float rays = 0.0;
    for(int i=0; i<3; i++) {
        float t = uTime * (0.2 + float(i)*0.1);
        rays += sin(angle * (10.0 + float(i)*5.0) + t);
    }
    rays = abs(rays) * 0.1;
    
    // Core light
    float core = 0.1 / (dist + 0.1);
    
    // Gold Palette
    vec3 gold = vec3(1.0, 0.85, 0.4);
    vec3 white = vec3(1.0, 1.0, 0.9);
    
    vec3 color = mix(gold, white, core * 0.5);
    color += rays * vec3(1.0, 0.6, 0.2);

    // Hover Intensity
    if (uHover > 0.0) {
        color *= 1.0 + uHover * 2.0;
        core *= 1.5;
    }

    // Alpha mask
    float alpha = smoothstep(0.6, 0.2, dist);
    
    // Add pulsing glow
    float pulse = sin(uTime * 3.0) * 0.1 + 0.9;

    gl_FragColor = vec4(color * pulse, alpha);
  }
`;

export const SourceEffect: React.FC<EffectProps> = ({ hovered }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uHover: { value: 0 } }), []);

  useFrame((state) => {
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        hovered ? 1.0 : 0.0,
        0.05
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