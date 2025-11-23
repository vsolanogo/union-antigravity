import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial, Color } from 'three';
import { SUN_DATA } from '../constants';

// Simple noise shader for the sun's surface
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  varying vec3 vPosition;

  // Simple pseudo-random noise
  float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
  }

  // 3D Noise function (simplified for performance)
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(random(i, 0.0), random(i + vec3(1,0,0), 0.0), f.x),
          mix(random(i + vec3(0,1,0), 0.0), random(i + vec3(1,1,0), 0.0), f.x), f.y),
      mix(mix(random(i + vec3(0,0,1), 0.0), random(i + vec3(1,0,1), 0.0), f.x),
          mix(random(i + vec3(0,1,1), 0.0), random(i + vec3(1,1,1), 0.0), f.x), f.y), f.z
    );
  }

  void main() {
    float n = 0.0;
    // Layered noise for "boiling" effect
    n += noise(vPosition * 4.0 + uTime * 0.5) * 0.5;
    n += noise(vPosition * 8.0 - uTime * 0.2) * 0.25;
    n += noise(vPosition * 16.0 + uTime * 0.1) * 0.125;
    
    // Mix core color (orange/red) with bright surface (yellow)
    vec3 color = mix(uColorA, uColorB, n + 0.3);
    
    // Add brightness boost for bloom
    gl_FragColor = vec4(color * 2.5, 1.0);
  }
`;

const Sun: React.FC = () => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new Color('#ff8800') }, // Darker orange
      uColorB: { value: new Color('#ffffaa') }, // Bright yellow/white
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group>
      {/* Main Light Source */}
      <pointLight intensity={3} distance={500} decay={1.5} color="#fff5d6" castShadow />
      
      {/* Sun Mesh with Shader */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[SUN_DATA.radius, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* Outer Glow (Corona) - Optimized for Bloom */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[SUN_DATA.radius, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.3}
          side={1} // Backside rendering for internal glow effect
          blending={2} // Additive blending
        />
      </mesh>
    </group>
  );
};

export default Sun;