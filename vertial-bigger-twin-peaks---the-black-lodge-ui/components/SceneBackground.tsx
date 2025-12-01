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
              <planeGeometry args={[20, 20, 32, 32]} />
              {/* @ts-ignore */}
              <redRoomMaterial ref={ref} uColor={new THREE.Color(color)} />
          </mesh>
      );
  };

  // "The Arm" - The Sycamore Tree form - Moved to TOP
  const TheEvolutionOfTheArm = () => {
     const ref = useRef<any>(null);
     useFrame((state) => {
         if (ref.current) {
             ref.current.uTime = state.clock.elapsedTime;
         }
     });

     return (
         <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <group position={[0, 3.8, -4]}> 
                {/* Main fleshy bulb */}
                <mesh scale={[1.2, 1, 1]}>
                   <sphereGeometry args={[1, 64, 64]} />
                   {/* @ts-ignore */}
                   <sycamoreMaterial ref={ref} />
                </mesh>
                {/* Branches / Horns */}
                <mesh position={[0.6, 0.8, 0]} rotation={[0, 0, -0.6]} scale={0.5}>
                     <coneGeometry args={[0.3, 2.5, 32]} />
                     {/* @ts-ignore */}
                     <sycamoreMaterial uTime={0} />
                </mesh>
                 <mesh position={[-0.6, 0.8, 0]} rotation={[0, 0, 0.6]} scale={0.5}>
                     <coneGeometry args={[0.3, 2.5, 32]} />
                     {/* @ts-ignore */}
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
        {/* Floor - Positioned lower to open up space */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]}>
            <planeGeometry args={[50, 50]} />
            {/* @ts-ignore */}
            <zigZagMaterial ref={floorRef} uScale={12.0} />
        </mesh>

        {/* Back Wall Curtains - Taller to cover new camera angles */}
        <Curtain position={[0, 4, -12]} rotation={[0, 0, 0]} color="#600505" />
        <Curtain position={[-14, 4, -8]} rotation={[0, 0.5, 0]} color="#500000" />
        <Curtain position={[14, 4, -8]} rotation={[0, -0.5, 0]} color="#500000" />

        {/* The Evolution of The Arm - Now at the top */}
        <TheEvolutionOfTheArm />
        
        {/* Garmonbozia (Pain and Sorrow) - Floating Gold Particles */}
        <Sparkles 
            count={150} 
            scale={15} 
            size={4} 
            speed={0.4} 
            opacity={0.6}
            color={COLORS.GARMONBOZIA_GOLD}
            position={[0, 0, -5]}
        />

        {/* Atmospheric Lighting */}
        <spotLight position={[0, 8, 2]} angle={0.5} penumbra={1} intensity={3} castShadow color="#ffdcb4" target-position={[0, 3, -4]} />
        <pointLight position={[-6, 2, -2]} intensity={0.8} color="#ff0000" />
        <pointLight position={[6, 2, -2]} intensity={0.8} color="#ff0000" />
        <ambientLight intensity={0.1} />
    </group>
  );
};

export const SceneBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas 
            camera={{ position: [0, 0, 10], fov: 50 }}
            gl={{ antialias: true }} 
        >
            <fog attach="fog" args={['#000000', 8, 30]} />
            <Room />
        </Canvas>
    </div>
  );
};
