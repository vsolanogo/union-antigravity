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
  uniform float uClicked;
  uniform float uAspect;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // Basic noise
  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f*f*(3.0-2.0*f);
      return mix( mix( random( i + vec2(0.0,0.0) ), random( i + vec2(1.0,0.0) ), u.x),
                  mix( random( i + vec2(0.0,1.0) ), random( i + vec2(1.0,1.0) ), u.x), u.y);
  }

  // Mountain generation
  float mountain(vec2 x, float scale, float speed) {
      float h = 0.0;
      float a = 0.5;
      // Shift mountains based on time for parallax
      vec2 pos = x * scale + vec2(uTime * speed, 0.0);
      for(int i=0; i<3; i++) {
          h += noise(pos) * a;
          pos *= 2.0;
          a *= 0.5;
      }
      return h;
  }

  void main() {
    vec2 uv = vUv;
    // 0 to 1 -> -1 to 1
    vec2 p = uv * 2.0 - 1.0;
    p.x *= uAspect;

    // ----- SKY BACKGROUND -----
    vec3 topColor = vec3(0.05, 0.0, 0.1); // Deep purple space
    vec3 bottomColor = vec3(0.2, 0.0, 0.3); // Lighter purple horizon
    vec3 color = mix(bottomColor, topColor, p.y * 0.5 + 0.5);

    // Stars
    float stars = random(floor(p * 200.0));
    if (stars > 0.98) color += vec3(stars) * 0.5 * (sin(uTime * 3.0 + p.x * 10.0) * 0.5 + 0.5);

    // ----- SUN -----
    // Sun position
    vec2 sunPos = vec2(0.0, 0.2);
    float sunSize = 0.45;
    float dist = length(p - sunPos);
    
    if (dist < sunSize) {
        // Sun Gradient (Yellow to Pink)
        float height = (p.y - sunPos.y) / sunSize; // -1 to 1 inside sun
        vec3 sunColor = mix(vec3(1.0, 0.0, 0.5), vec3(1.0, 0.9, 0.0), height * 0.5 + 0.5);
        
        // Scanlines (cuts)
        float stripes = sin((p.y - sunPos.y) * 40.0 - uTime * 0.5);
        float cut = step(0.2, stripes); 
        
        // Apply sun color if not cut
        color = mix(color, sunColor, cut);
        
        // Sun Glow
        color += vec3(1.0, 0.2, 0.5) * (1.0 - dist/sunSize) * 0.5;
    }
    // Sun outer glow
    color += vec3(1.0, 0.0, 0.5) * 0.2 * exp(-dist * 3.0);

    // ----- MOUNTAINS (Parallax) -----
    // Back layer
    float m1 = mountain(vec2(p.x, 0.0), 3.0, 0.1) * 0.3;
    float m1Mask = step(p.y, m1 - 0.1);
    color = mix(color, vec3(0.15, 0.0, 0.25), m1Mask);
    // Rim light on mountains
    if(m1Mask > 0.5 && p.y > m1 - 0.11) color += vec3(0.8, 0.0, 1.0) * 0.5;

    // Front layer
    float m2 = mountain(vec2(p.x + 10.0, 0.0), 2.0, 0.2) * 0.25;
    float m2Mask = step(p.y, m2 - 0.25);
    // Darker silhouette
    color = mix(color, vec3(0.05, 0.0, 0.1), m2Mask);
    
    // ----- 3D GRID FLOOR -----
    if (p.y < -0.25) {
        // Horizon line at -0.25
        float horizon = -0.25;
        
        // 3D Projection
        // We want a plane z = 1 / (horizon - y)
        float z = 1.0 / (horizon - p.y);
        float x = p.x * z;
        
        // Move grid towards camera
        float speed = 2.0;
        float moveZ = uTime * speed;
        
        // Grid Lines
        float gridWidth = 0.05 * z; // Lines get thicker closer to camera
        float lineX = step(1.0 - gridWidth, fract(x));
        float lineZ = step(1.0 - gridWidth, fract(z + moveZ));
        
        vec3 gridColor = vec3(0.0, 1.0, 1.0); // Cyan
        if (uHover > 0.5) gridColor = vec3(1.0, 0.0, 1.0); // Pink on hover
        
        float alpha = max(lineX, lineZ);
        
        // Fade out grid near horizon
        float fade = smoothstep(0.0, 10.0, z); // Fade based on distance
        
        // Floor glow
        vec3 floorColor = vec3(0.1, 0.0, 0.2);
        
        // Combine grid and floor
        vec3 finalGrid = mix(floorColor, gridColor, alpha);
        
        // Apply fading (mist)
        color = mix(finalGrid, color, 1.0 - exp(-0.1 * z));
    }

    // ----- POST PROCESSING -----
    // Scanlines over everything
    color *= 1.0 - 0.1 * sin(uv.y * 200.0 + uTime * 10.0);
    
    // Click Flash
    if(uClicked > 0.01) {
        color += vec3(1.0) * uClicked * 0.5;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const NeonPalmShader: React.FC<ShaderProps> = ({ hovered, clicked }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uClicked: { value: 0 },
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
       material.uniforms.uClicked.value = THREE.MathUtils.lerp(
        material.uniforms.uClicked.value,
        clicked ? 1.0 : 0.0,
        0.2
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