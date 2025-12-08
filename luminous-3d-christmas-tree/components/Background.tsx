
import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
varying vec2 vUv;

// Simple noise function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 st = vUv * 3.0;
    
    // Create moving aurora waves
    float t = uTime * 0.2;
    float wave1 = noise(st + vec2(t, t * 0.5));
    float wave2 = noise(st * 2.0 - vec2(t * 1.5, t));
    
    float combined = (wave1 + wave2) * 0.5;
    
    // Aurora colors (Green/Blue/Purple)
    vec3 color1 = vec3(0.1, 0.9, 0.5); // Greenish
    vec3 color2 = vec3(0.1, 0.1, 0.8); // Blueish
    vec3 color3 = vec3(0.5, 0.0, 0.5); // Purple
    
    vec3 finalColor = mix(color1, color2, combined);
    finalColor = mix(finalColor, color3, sin(uTime * 0.1 + st.y));
    
    // Dark sky gradient at top
    float sky = 1.0 - vUv.y;
    finalColor *= sky * 0.6; 
    
    // Output slightly brighter than before
    gl_FragColor = vec4(finalColor * 0.4, 1.0); 
}
`;

const ShaderBackground: React.FC = () => {
    const mesh = useRef<THREE.Mesh>(null);
    const material = useRef<THREE.ShaderMaterial>(null);
  
    useFrame((state) => {
      if (material.current) {
        material.current.uniforms.uTime.value = state.clock.getElapsedTime();
      }
    });
  
    return (
      <mesh ref={mesh} position={[0, 0, -20]} scale={[120, 60, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uTime: { value: 0 }
          }}
          side={THREE.DoubleSide}
          // ShaderMaterial doesn't respond to fog unless configured, so it cuts through fog by default
        />
      </mesh>
    );
};

const TextureBackground: React.FC<{ url: string }> = ({ url }) => {
    const texture = useLoader(THREE.TextureLoader, url);
    return (
        <mesh position={[0, 0, -19.5]} scale={[120, 60, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial 
                map={texture} 
                side={THREE.DoubleSide} 
                toneMapped={false} 
                fog={false} // Critical: ignore scene fog so image is clear
            />
        </mesh>
    );
};

const Background: React.FC<{ imageUrl?: string | null }> = ({ imageUrl }) => {
  if (imageUrl) {
    return <TextureBackground url={imageUrl} />;
  }
  return <ShaderBackground />;
};

export default Background;
