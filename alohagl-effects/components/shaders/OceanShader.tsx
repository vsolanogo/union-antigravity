import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ShaderProps } from '../../types';

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
  uniform float uAspect;
  varying vec2 vUv;

  #define NUM_ITER 5
  #define PI 3.14159265

  // Rotation matrix
  mat2 rotate(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  // Pseudo-random function
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // 2D Noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  // Water height map function using iterative sine waves
  float map(vec2 p) {
    float h = 0.0;
    float amp = 0.5;
    // Rotation for wave direction variance
    mat2 rot = rotate(0.5); 
    
    // Iterative wave summation
    vec2 shift = vec2(100.0);
    for (int i = 0; i < NUM_ITER; i++) {
        // Use sine approximations for wave shapes
        float n = sin(dot(p, vec2(sin(uTime * 0.1), cos(uTime * 0.1))) + uTime * 0.5);
        // Mix with noise for irregularity
        n += noise(p * 1.5 + uTime * 0.2);
        
        h += n * amp;
        
        // Prepare next octave
        p = rot * p * 2.0 + shift;
        amp *= 0.5;
    }
    return h;
  }

  // Calculate normal based on height map finite difference
  vec3 getNormal(vec2 p) {
    float d = 0.01;
    float h = map(p);
    float hx = map(p + vec2(d, 0.0));
    float hy = map(p + vec2(0.0, d));
    return normalize(vec3(h - hx, h - hy, d)); // Normal pointing up-ish
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uAspect;
    
    // Zoom and pan
    vec2 p = uv * 3.0;
    
    // Add some parallax movement based on hover
    p += vec2(uHover * 0.1, uTime * 0.05);

    // Get Surface Normal
    vec3 normal = getNormal(p);
    
    // Lighting Setup
    vec3 lightDir = normalize(vec3(0.5, 0.8, 0.5)); // Sunlight from top-right
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));  // View from top down
    
    // Specular (Sun reflection)
    vec3 halfVector = normalize(lightDir + viewDir);
    float NdotH = max(0.0, dot(normal, halfVector));
    float specular = pow(NdotH, 128.0); // Sharp highlights
    
    // Diffuse / Ambient
    float diff = max(0.0, dot(normal, lightDir));
    
    // Color Palette
    vec3 deepWater = vec3(0.0, 0.15, 0.35); // Dark Blue
    vec3 shallowWater = vec3(0.0, 0.6, 0.7); // Turquoise
    vec3 foamColor = vec3(0.9, 0.95, 1.0);   // White
    
    // Height-based mixing
    float h = map(p);
    
    // Base color mix
    vec3 color = mix(deepWater, shallowWater, smoothstep(-0.5, 0.8, h));
    
    // Add "Caustics" fake
    // We use a high frequency noise pattern warped by the height map
    float caustic = noise(p * 5.0 + normal.xy * 2.0 + uTime);
    color += vec3(0.1, 0.3, 0.4) * caustic * smoothstep(0.0, 0.5, h);

    // Foam at peaks
    float foamMask = smoothstep(0.6, 1.0, h + noise(p * 10.0 + uTime)*0.2);
    color = mix(color, foamColor, foamMask);
    
    // Apply lighting
    color += specular * vec3(1.0, 0.9, 0.8); // Warm sun specular
    
    // Hover Interaction: Energetic brightening
    if (uHover > 0.001) {
        // Ripple effect
        float d = length(vUv - 0.5);
        // Adjusted ripple speed (50.0) to compensate for slowed uTime
        float ripple = sin(d * 40.0 - uTime * 50.0) * exp(-d * 3.0);
        color += ripple * uHover * 0.1;
        color *= 1.0 + uHover * 0.2;
    }

    // Vignette
    float vig = 1.0 - smoothstep(0.5, 1.5, length(vUv - 0.5) * 1.5);
    color *= vig;
    
    // Gamma correction
    color = pow(color, vec3(0.4545));

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const OceanShader: React.FC<ShaderProps> = ({ hovered }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uAspect: { value: 1 },
    }),
    []
  );

  useFrame((state) => {
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      // Slow down time by a factor of 0.2 for realistic water movement
      material.uniforms.uTime.value = state.clock.getElapsedTime() * 0.2;
      material.uniforms.uAspect.value = viewport.width / viewport.height;
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        hovered ? 1.0 : 0.0,
        0.05
      );
    }
  });

  return (
    <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};