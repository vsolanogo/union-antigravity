import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import './effects/Shaders';
import { COLORS } from '../constants';

const Room = () => {
  const floorRef = useRef<any>(null);
  
  // Animated curtains
  const Curtain = ({ position, rotation, color }: any) => {
      const ref = useRef<any>(null);
      useFrame((state) => {
          if (ref.current) {
              ref.current.uTime = state.clock.elapsedTime;
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

  // "The Arm" - The Sycamore Tree form
  const TheEvolutionOfTheArm = () => {
     const ref = useRef<any>(null);
     useFrame((state) => {
         if (ref.current) {
             ref.current.uTime = state.clock.elapsedTime;
         }
     });

     return (
         <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <group position={[0, 0, -5]}>
                <mesh>
                   <sphereGeometry args={[1, 64, 64]} />
                   <sycamoreMaterial ref={ref} />
                </mesh>
                {/* Branches */}
                <mesh position={[0.5, 0.8, 0]} rotation={[0, 0, -0.5]} scale={0.4}>
                     <cylinderGeometry args={[0.2, 0.5, 3]} />
                     <sycamoreMaterial uTime={0} />
                </mesh>
                 <mesh position={[-0.5, 0.8, 0]} rotation={[0, 0, 0.5]} scale={0.4}>
                     <cylinderGeometry args={[0.2, 0.5, 3]} />
                     <sycamoreMaterial uTime={0} />
                </mesh>
            </group>
         </Float>
     )
  }

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
        <Curtain position={[0, 2, -10]} rotation={[0, 0, 0]} color="#600505" />
        <Curtain position={[-12, 2, -6]} rotation={[0, 0.7, 0]} color="#500000" />
        <Curtain position={[12, 2, -6]} rotation={[0, -0.7, 0]} color="#500000" />

        {/* The Evolution of The Arm */}
        <TheEvolutionOfTheArm />
        
        {/* Garmonbozia (Pain and Sorrow) - Floating Gold Particles */}
        <Sparkles 
            count={100} 
            scale={12} 
            size={4} 
            speed={0.4} 
            opacity={0.6}
            color={COLORS.GARMONBOZIA_GOLD}
            position={[0, 0, -4]}
        />

        {/* Atmospheric Lighting */}
        <spotLight position={[0, 10, 5]} angle={0.4} penumbra={1} intensity={2} castShadow color="#ffdcb4" />
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
            gl={{ antialias: true }} 
        >
            <fog attach="fog" args={['#000000', 5, 25]} />
            <Room />
        </Canvas>
    </div>
  );
};