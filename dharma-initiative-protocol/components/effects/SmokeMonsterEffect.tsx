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

  float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
  }

  // Value Noise by Inigo Quilez
  float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  #define OCTAVES 6
  float fbm (in vec2 st) {
    float value = 0.0;
    float amplitude = .5;
    float gain = 0.5;
    float lacunarity = 2.0;
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= lacunarity;
        amplitude *= gain;
    }
    return value;
  }

  void main() {
    vec2 st = vUv;
    st.x *= 2.0; // Aspect ratio fix roughly

    vec2 q = vec2(0.);
    q.x = fbm( st + 0.01*uTime);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*uTime );
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*uTime);

    float f = fbm(st + r);

    // Color grading: Deep black to slight industrial grey/blue
    vec3 color = mix(vec3(0.05, 0.05, 0.08), vec3(0.0), clamp((f*f)*4.0,0.0,1.0));

    // Electric sparks inside the smoke
    float spark = smoothstep(0.8, 0.9, f) * step(0.98, random(vec2(uTime * 10.0, st.y)));
    color += vec3(0.6, 0.7, 0.9) * spark * uHover;

    // Hover agitation
    float agitation = uHover * 0.5;
    
    // Masking the button area
    float alpha = smoothstep(0.0, 0.4, f + agitation);
    
    // Edge fade
    alpha *= smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
    alpha *= smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);

    gl_FragColor = vec4(color, alpha * 0.9);
  }
`;

export const SmokeMonsterEffect: React.FC<EffectProps> = ({ hovered }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      // Interpolate hover intensity
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        hovered ? 1.0 : 0.0,
        0.05
      );
      // Time moves faster when agitated
      const speed = hovered ? 1.5 : 0.4;
      material.uniforms.uTime.value += state.clock.getDelta() * speed;
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
      />
    </mesh>
  );
};