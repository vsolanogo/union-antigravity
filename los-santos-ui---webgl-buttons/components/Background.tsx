
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { gridFragmentShader, gridVertexShader } from '../utils/shaders';

const MovingGrid = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    // Rotated to lay flat, position moved down. High segment count (128) for smooth terrain heightmap
    <mesh ref={meshRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -4, -10]}>
      <planeGeometry args={[100, 100, 128, 128]} />
      <shaderMaterial
        vertexShader={gridVertexShader}
        fragmentShader={gridFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const FloatingElement = ({ color, position, speed, type = 'octa' }: { color: string, position: [number, number, number], speed: number, type?: 'octa' | 'box' }) => {
    return (
        <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
            <mesh position={position}>
                {type === 'octa' ? <octahedronGeometry args={[0.2, 0]} /> : <boxGeometry args={[0.2, 0.2, 0.2]} />}
                <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
            </mesh>
        </Float>
    )
}

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
        <color attach="background" args={['#020005']} />
        
        {/* Environmental Effects */}
        <fog attach="fog" args={['#020005', 2, 40]} />
        <ambientLight intensity={0.5} />
        
        <Stars radius={200} depth={50} count={8000} factor={6} saturation={0} fade speed={0.5} />
        
        <MovingGrid />

        <Sparkles 
            count={200} 
            scale={20} 
            size={2} 
            speed={0.2} 
            opacity={0.4}
            color="#ffeeb3"
        />

        {/* Floating Abstract Shapes for depth */}
        <FloatingElement color="#d946ef" position={[-6, 4, -8]} speed={2} type="box" />
        <FloatingElement color="#06b6d4" position={[6, 0, -6]} speed={3} />
        <FloatingElement color="#f59e0b" position={[0, 5, -12]} speed={1.5} type="box" />
        
      </Canvas>
    </div>
  );
};

export default Background;
