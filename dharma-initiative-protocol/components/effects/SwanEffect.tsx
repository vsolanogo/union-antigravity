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
  uniform float uClick;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // Box function for drawing the border
  float box(vec2 _st, vec2 _size, float _smoothEdges){
      _size = vec2(0.5)-_size*0.5;
      vec2 aa = vec2(_smoothEdges*0.5);
      vec2 uv = smoothstep(_size,_size+aa,_st);
      uv *= smoothstep(_size,_size+aa,vec2(1.0)-_st);
      return uv.x*uv.y;
  }

  void main() {
    vec2 st = vUv;
    
    // Base Terminal Color (Swan Station Green)
    vec3 terminalGreen = vec3(0.1, 0.9, 0.2);
    vec3 color = vec3(0.0);

    // Grid Background
    float grid = step(0.98, fract(st.x * 20.0)) + step(0.95, fract(st.y * 10.0));
    color += terminalGreen * grid * 0.15;

    // "Digital Rain" / Hex Data falling
    float column = floor(st.x * 20.0);
    float speed = sin(column * 54.0) * 0.5 + 1.0;
    float rain = step(0.8, fract(st.y * 10.0 + uTime * speed));
    if (random(vec2(floor(st.y * 10.0), column)) > 0.5) {
        color += terminalGreen * rain * 0.1;
    }

    // Interactive Hover Glow
    float dist = distance(st, vec2(0.5));
    float glow = smoothstep(0.5, 0.0, dist);
    
    // Scanline scan
    float scan = smoothstep(0.4, 0.5, abs(sin(uTime * 2.0 - st.y * 3.0)));
    
    if (uHover > 0.0) {
        color += terminalGreen * glow * uHover * 0.5;
        color += terminalGreen * scan * 0.2;
    }

    // Border
    float b = box(st, vec2(0.96, 0.9), 0.01);
    float border = 1.0 - b;
    color += terminalGreen * border;

    // Click Feedback (Invert)
    if (uClick > 0.5) {
        color = vec3(0.8, 1.0, 0.8) - color;
    }

    // Vignette
    color *= smoothstep(0.8, 0.2, distance(st, vec2(0.5)));

    gl_FragColor = vec4(color, 1.0); // Always solid opacity for this retro feel
  }
`;

export const SwanEffect: React.FC<EffectProps> = ({ hovered, clicked }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uClick: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        hovered ? 1.0 : 0.0,
        0.15
      );
      material.uniforms.uClick.value = clicked ? 1.0 : 0.0;
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
      />
    </mesh>
  );
};