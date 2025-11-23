import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './effects/Shaders';

const Room = () => {
  const floorRef = useRef<any>(null);
  
  // Animated curtains
  const Curtain = ({ position, rotation, color }: any) => {
      const ref = useRef<any>(null);
      useFrame((state) => {
          if (ref.current) {
              ref.current.uTime = state.clock.elapsedTime;
              // Gentle sway
              ref.current.uHover = 0.2; 
          }
      });
      return (
          <mesh position={position} rotation={rotation}>
              <planeGeometry args={[20, 14, 32, 32]} />
              <redRoomMaterial ref={ref} uColor={new THREE.Color(color)} />
          </mesh>
      );
  };

  useFrame((state) => {
      if (floorRef.current) {
          floorRef.current.uTime = state.clock.elapsedTime;
          // Slowly move floor forward
          floorRef.current.uTime *= 0.5;
      }
  });

  return (
    <group>
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
            <planeGeometry args={[40, 40]} />
            <zigZagMaterial ref={floorRef} uScale={10.0} />
        </mesh>

        {/* Back Wall Curtains */}
        <Curtain position={[0, 2, -5]} rotation={[0, 0, 0]} color="#600505" />
        <Curtain position={[-10, 2, -4]} rotation={[0, 0.5, 0]} color="#500000" />
        <Curtain position={[10, 2, -4]} rotation={[0, -0.5, 0]} color="#500000" />

        {/* Atmospheric Lighting */}
        <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={1.5} castShadow />
        <pointLight position={[-5, 0, -2]} intensity={0.5} color="#ff0000" />
        <pointLight position={[5, 0, -2]} intensity={0.5} color="#ff0000" />
    </group>
  );
};

export const SceneBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas 
            camera={{ position: [0, 0, 8], fov: 45 }}
            gl={{ antialias: false }} // Retro feel
        >
            <fog attach="fog" args={['#000000', 5, 20]} />
            <Room />
        </Canvas>
    </div>
  );
};
