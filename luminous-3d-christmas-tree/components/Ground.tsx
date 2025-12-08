
import React from 'react';
import { MeshReflectorMaterial } from '@react-three/drei';

const Ground: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      {/* 
         Removed the redundant meshStandardMaterial which was causing the crash.
         MeshReflectorMaterial handles the material rendering itself.
      */}
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#151515"
        metalness={0.5}
        mirror={0.75}
      />
    </mesh>
  );
};

export default Ground;
