import React, { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

const Gifts: React.FC = () => {
  const gifts = useMemo(() => {
    const items = [];
    const colors = ["#ef4444", "#3b82f6", "#eab308", "#10b981", "#8b5cf6", "#f43f5e"];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 2.0 + Math.random() * 1.5; // Distance from trunk
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const scale = 0.4 + Math.random() * 0.4;
      const height = scale * (0.8 + Math.random() * 0.5);
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      items.push({
        position: [x, height / 2, z] as [number, number, number],
        scale: [scale, height, scale] as [number, number, number],
        rotation: [0, Math.random() * Math.PI, 0] as [number, number, number],
        color
      });
    }
    return items;
  }, []);

  return (
    <group position={[0, -2, 0]}>
       {/* Main Box Bodies */}
      <Instances range={gifts.length} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.3} metalness={0.1} />
        {gifts.map((gift, i) => (
          <Instance 
            key={`box-${i}`}
            position={gift.position}
            scale={gift.scale}
            rotation={gift.rotation}
            color={gift.color}
          />
        ))}
      </Instances>

      {/* Ribbons (simplified as slightly larger thin boxes) */}
      {gifts.map((gift, i) => (
         <group key={`ribbon-${i}`} position={gift.position} rotation={gift.rotation}>
            {/* Vertical Ribbon */}
            <mesh position={[0, 0, 0]} scale={[gift.scale[0] * 1.02, gift.scale[1], gift.scale[2] * 0.2]}>
                <boxGeometry args={[1, 1.01, 1]} />
                <meshStandardMaterial color="#fff" roughness={0.4} metalness={0.5} />
            </mesh>
            {/* Horizontal Ribbon */}
            <mesh position={[0, 0, 0]} scale={[gift.scale[0] * 0.2, gift.scale[1], gift.scale[2] * 1.02]}>
                <boxGeometry args={[1, 1.01, 1]} />
                <meshStandardMaterial color="#fff" roughness={0.4} metalness={0.5} />
            </mesh>
            {/* Bow on top */}
            <mesh position={[0, gift.scale[1]/2 + 0.1, 0]} rotation={[0, Math.PI/4, 0]}>
                <torusKnotGeometry args={[0.08 * gift.scale[0], 0.02 * gift.scale[0], 16, 4]} />
                <meshStandardMaterial color="#fff" />
            </mesh>
         </group>
      ))}
    </group>
  );
};

export default Gifts;