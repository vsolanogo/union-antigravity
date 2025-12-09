import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const FloatingOrbs: React.FC = () => {
  const count = 150; // Increased count for better atmosphere
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random positions and extra attributes for animation
  const [positions, randomness] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Spread them wide across the screen, some closer (z > 0), some further (z < 0)
      pos[i * 3] = (Math.random() - 0.5) * 15;     // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5 + 0.5;  // z
      
      rnd[i] = Math.random(); // Used for phase offset in animation
    }
    return [pos, rnd];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionsAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;

    // Animate particles
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const xBase = positions[i3];
      const yBase = positions[i3 + 1];
      const rnd = randomness[i];

      // Complex floating motion (Lissajous-ish figures)
      const x = xBase + Math.sin(time * 0.3 + rnd * 10) * 0.2;
      const y = yBase + Math.cos(time * 0.2 + rnd * 8) * 0.2;
      
      positionsAttr.setXYZ(i, x, y, positions[i3 + 2]);
    }
    positionsAttr.needsUpdate = true;
    
    // Slowly rotate the whole system to feel like a galaxy arm
    pointsRef.current.rotation.z = time * 0.02;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#b0e0ff"
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

export default FloatingOrbs;
