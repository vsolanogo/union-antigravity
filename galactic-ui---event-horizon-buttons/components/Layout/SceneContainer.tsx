
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { View, Stars, Preload, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import * as random from 'maath/random/dist/maath-random.esm';

// Interactive Star Field that responds to mouse
const InteractiveStars = () => {
    const ref = useRef<THREE.Points>(null);
    const sphere = useMemo(() => random.inSphere(new Float32Array(8000 * 3), { radius: 150 }), []);
    
    useFrame((state, delta) => {
        if (ref.current) {
            // Constant rotation
            ref.current.rotation.x -= delta / 30;
            ref.current.rotation.y -= delta / 40;
            
            // Mouse interaction
            const mouseX = state.mouse.x * 0.5;
            const mouseY = state.mouse.y * 0.5;
            
            // Smoothly interpolate towards mouse position
            ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, mouseY * 0.2, delta * 0.5);
            ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, mouseX * 0.2, delta * 0.5);
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#aaaaff"
                    size={0.12}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
};

const BackgroundFog = () => {
    // Very dark blue/black background
    return <color attach="background" args={['#020408']} />;
};

interface SceneContainerProps {
  children: React.ReactNode;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-black overflow-hidden selection:bg-blue-500/30 font-sans">
      
      {/* 
         GLOBAL CANVAS
         This canvas sits in the background but renders all <View> components from buttons 
      */}
      <Canvas
        className="canvas-container"
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
        eventSource={containerRef}
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ 
            alpha: true, 
            antialias: true, 
            toneMapping: THREE.ReinhardToneMapping, 
            toneMappingExposure: 1.5,
            powerPreference: "high-performance"
        }}
      >
        <BackgroundFog />
        <InteractiveStars />
        <Stars radius={300} depth={50} count={3000} factor={6} saturation={0.5} fade speed={1} />
        <ambientLight intensity={0.2} />
        
        {/* Renders all the Views from individual buttons here */}
        <View.Port />
        <Preload all />
      </Canvas>
      
      {/* DOM Content Layer */}
      <div className="relative z-10 w-full min-h-screen flex flex-col pointer-events-auto">
        {children}
      </div>
    </div>
  );
};
