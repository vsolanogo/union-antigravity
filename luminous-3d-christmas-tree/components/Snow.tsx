
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Snow: React.FC<{ count?: number }> = ({ count = 2000 }) => {
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;
      temp[i * 3] = x;
      temp[i * 3 + 1] = y;
      temp[i * 3 + 2] = z;
    }
    return temp;
  }, [count]);

  const userData = useMemo(() => {
    // Store speed and random offset for sway
    const temp = new Float32Array(count * 2);
    for(let i=0; i<count; i++) {
        temp[i*2] = 0.03 + Math.random() * 0.05; // Speed
        temp[i*2+1] = Math.random() * Math.PI * 2; // Offset
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      // Get stored data
      const speed = userData[i * 2];
      const offset = userData[i * 2 + 1];

      // Move down
      positions[i * 3 + 1] -= speed;

      // Wind sway (using sine wave based on time and vertical position)
      positions[i * 3] += Math.sin(time + offset) * 0.01;
      positions[i * 3 + 2] += Math.cos(time * 0.8 + offset) * 0.01;

      // Reset if too low
      if (positions[i * 3 + 1] < -10) {
        positions[i * 3 + 1] = 25;
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      }
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  // Simple soft circle shader for snow
  const snowMaterial = useMemo(() => {
      return new THREE.ShaderMaterial({
          uniforms: {
              color: { value: new THREE.Color(0xffffff) },
          },
          vertexShader: `
            attribute float size;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = (150.0 / -mvPosition.z); // Size attenuation
                gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            void main() {
                float r = distance(gl_PointCoord, vec2(0.5));
                if (r > 0.5) discard;
                float alpha = 1.0 - smoothstep(0.3, 0.5, r);
                gl_FragColor = vec4(color, alpha * 0.8);
            }
          `,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending
      })
  }, []);

  return (
    <points ref={mesh} material={snowMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
    </points>
  );
};

export default Snow;
