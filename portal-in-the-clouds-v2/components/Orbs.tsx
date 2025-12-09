import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbsProps {
  count: number;
  mouse: React.MutableRefObject<THREE.Vector2>;
}

export const Orbs: React.FC<OrbsProps> = ({ count, mouse }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();

  // Create a more complex particle dataset
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 0.2 + Math.random() * 0.8;
      const speed = 0.005 + Math.random() * 0.015;
      
      // Spherical distribution approximation or just random volume
      const x = (Math.random() - 0.5) * viewport.width * 1.5;
      const y = (Math.random() - 0.5) * viewport.height * 1.5;
      const z = Math.random() * 3; 
      
      // Random scale for bokeh effect
      const scale = 0.5 + Math.random() * 1.5;

      temp.push({ t, factor, speed, x, y, z, scale, originalX: x, originalY: y });
    }
    return temp;
  }, [count, viewport]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    particles.forEach((particle, i) => {
      // Update time factor
      particle.t += particle.speed;
      
      // Mouse interaction (Target)
      // Map mouse from normalized to world units approx
      const mx = (mouse.current.x * viewport.width) / 2;
      const my = (mouse.current.y * viewport.height) / 2;

      // 1. Base Floating Motion (Lissajous-like figures)
      const floatX = Math.sin(particle.t * 0.5 + i) * 0.5;
      const floatY = Math.cos(particle.t * 0.3 + i * 2) * 0.5;

      // 2. Attraction/Spiral to Mouse
      // Calculate vector to mouse
      let dx = mx - (particle.x + floatX);
      let dy = my - (particle.y + floatY);
      
      // Gentle attraction force
      const dist = Math.sqrt(dx * dx + dy * dy);
      const attraction = Math.max(0, 3.0 - dist) * 0.02; // Only attract if somewhat close
      
      // Apply a subtle spiral
      // We mix the original position with a position closer to the mouse based on sin waves
      
      // Current calculated position
      let posX = particle.originalX + floatX;
      let posY = particle.originalY + floatY;

      // Add parallax based on Z depth
      posX += (mouse.current.x * 2.0) * particle.z * 0.1;
      posY += (mouse.current.y * 2.0) * particle.z * 0.1;

      dummy.position.set(posX, posY, particle.z);
      
      // Pulsating scale
      const pulse = 1.0 + Math.sin(time * 2.0 + i) * 0.2;
      dummy.scale.setScalar(particle.scale * 0.03 * pulse);
      
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Use a simple circle/plane geometry for billboard look, or low poly sphere */}
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial 
        color="#ccf0ff" 
        transparent 
        opacity={0.4} 
        blending={THREE.AdditiveBlending}
        depthWrite={false} 
      />
    </instancedMesh>
  );
};
