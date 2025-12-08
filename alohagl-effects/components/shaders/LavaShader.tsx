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

  float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
  }

  // Value Noise by Inigo Quilez
  float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    // Cubic Hermite Spline
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x),
               mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  const mat2 m = mat2(0.80,  0.60, -0.60,  0.80);

  // Fractional Brownian Motion
  float fbm (vec2 p) {
    float f = 0.0;
    f += 0.5000 * noise(p); p = m * p * 2.02;
    f += 0.2500 * noise(p); p = m * p * 2.03;
    f += 0.1250 * noise(p); p = m * p * 2.01;
    f += 0.0625 * noise(p);
    return f;
  }

  // Domain Warping Pattern
  float pattern( in vec2 p, out vec2 q, out vec2 r ) {
    // 1st Layer of warping
    q.x = fbm( p + vec2(0.0,0.0) );
    q.y = fbm( p + vec2(5.2,1.3) );

    // 2nd Layer of warping (uses 1st layer 'q')
    // This creates the folding/swirling effect
    float timeScale = uTime * 0.1 + uHover * 0.2; // Speed up on hover
    
    // Fix: Explicitly construct vec2 from float for addition
    r.x = fbm( p + 4.0*q + vec2(1.7,9.2) + vec2(0.15*timeScale) );
    r.y = fbm( p + 4.0*q + vec2(8.3,2.8) + vec2(0.126*timeScale) );

    // Final noise value (uses 2nd layer 'r')
    return fbm( p + 4.0*r );
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uAspect;
    
    // Zoom out to see more detail
    vec2 p = uv * 3.5;
    
    // Add slow drift
    p += uTime * 0.05;

    vec2 q, r;
    float val = pattern(p, q, r);

    // COLOR GRADING (Blackbody radiation palette)
    // Map the noise value 'val' to colors
    
    // Base Rock (Cool)
    vec3 col = vec3(0.08, 0.02, 0.02);
    
    // The "heat" variable is determined by the warped noise
    // We emphasize the 'r' vector length to show stress/movement areas as hotter
    float heat = val * val * 2.0 + length(r) * 0.5;
    
    // Gradient Ramp
    // 1. Red Magma
    col = mix(col, vec3(0.7, 0.1, 0.0), smoothstep(0.0, 0.6, heat));
    // 2. Bright Orange
    col = mix(col, vec3(0.95, 0.4, 0.0), smoothstep(0.5, 0.8, heat));
    // 3. Yellow/White Hot
    col = mix(col, vec3(1.0, 0.9, 0.4), smoothstep(0.75, 1.1, heat));
    
    // ASH / SMOKE
    // Use the 'q' vector (less warped) for a subtle smoke overlay
    float smoke = smoothstep(0.3, 0.7, q.x);
    col = mix(col, vec3(0.2, 0.2, 0.2), smoke * 0.2);

    // HOVER INTERACTION
    // Intensify the heat calculation
    if (uHover > 0.001) {
        float pulse = sin(uTime * 10.0) * 0.5 + 0.5;
        col += vec3(0.2, 0.05, 0.0) * uHover * pulse;
        
        // Edge glow
        float d = length(vUv - 0.5);
        col += vec3(0.5, 0.2, 0.0) * uHover * smoothstep(0.2, 0.5, d);
    }

    // Contrast boost
    col = pow(col, vec3(1.1));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const LavaShader: React.FC<ShaderProps> = ({ hovered }) => {
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
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uAspect.value = viewport.width / viewport.height;
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        hovered ? 1.0 : 0.0,
        0.1
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