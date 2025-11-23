import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ButtonEffect } from '../types';
import { basicVertexShader, neonFragmentShader, liquidFragmentShader, holographicFragmentShader } from '../utils/shaders';

interface EffectCanvasProps {
  effect: ButtonEffect;
  isHovered: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const EffectCanvas: React.FC<EffectCanvasProps> = ({ effect, isHovered, primaryColor, secondaryColor }) => {
  const meshRef = useRef<THREE.Mesh | THREE.Group>(null);
  
  // Convert hex strings to Three.js colors
  const color1 = useMemo(() => new THREE.Color(primaryColor), [primaryColor]);
  const color2 = useMemo(() => new THREE.Color(secondaryColor), [secondaryColor]);

  // Shared uniforms structure
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uColor1: { value: color1 },
      uColor2: { value: color2 },
    }),
    [color1, color2]
  );

  useFrame((state) => {
    if (meshRef.current) {
      // Safely check if the current object is a Mesh with a ShaderMaterial
      // We check for 'material' property and if that material has 'uniforms'
      const mesh = meshRef.current as THREE.Mesh;
      
      if (mesh.material && (mesh.material as THREE.ShaderMaterial).uniforms) {
         const material = mesh.material as THREE.ShaderMaterial;
         material.uniforms.uTime.value = state.clock.elapsedTime;
         
         // Lerp hover value for smooth transition
         material.uniforms.uHover.value = THREE.MathUtils.lerp(
           material.uniforms.uHover.value,
           isHovered ? 1 : 0,
           0.1
         );
      }
      
      // Add some rotation or movement based on effect
      if (effect === ButtonEffect.VOXEL_STORM) {
         meshRef.current.rotation.x += 0.01;
         meshRef.current.rotation.y += 0.02;
      }
    }
  });

  // Render different meshes/materials based on effect type
  if (effect === ButtonEffect.NEON_PULSE) {
    return (
      <mesh ref={meshRef as React.RefObject<THREE.Mesh>}>
        <planeGeometry args={[4, 2]} />
        <shaderMaterial
          vertexShader={basicVertexShader}
          fragmentShader={neonFragmentShader}
          uniforms={uniforms}
          transparent={true}
        />
      </mesh>
    );
  }

  if (effect === ButtonEffect.LIQUID_METAL) {
    return (
      <mesh ref={meshRef as React.RefObject<THREE.Mesh>}>
        <planeGeometry args={[4, 2, 32, 32]} />
        <shaderMaterial
          vertexShader={basicVertexShader}
          fragmentShader={liquidFragmentShader}
          uniforms={uniforms}
          transparent={true}
        />
      </mesh>
    );
  }
  
  if (effect === ButtonEffect.HOLOGRAPHIC) {
      return (
      <mesh ref={meshRef as React.RefObject<THREE.Mesh>} scale={[1.8, 0.9, 1]}>
        <planeGeometry args={[2, 1]} />
        <shaderMaterial
          vertexShader={basicVertexShader}
          fragmentShader={holographicFragmentShader}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  }

  if (effect === ButtonEffect.VOXEL_STORM) {
    // A simplified particle system using instancing would be ideal here, 
    // but for this demo, we'll use a group of rotating cubes to keep code within limits
    const count = 20;
    return (
      <group ref={meshRef as React.RefObject<THREE.Group>}>
         {Array.from({ length: count }).map((_, i) => (
             <VoxelParticle key={i} index={i} count={count} isHovered={isHovered} color={color1} />
         ))}
      </group>
    );
  }

  return null;
};

// Sub-component for VOXEL_STORM particles
const VoxelParticle: React.FC<{ index: number; count: number; isHovered: boolean; color: THREE.Color }> = ({ index, count, isHovered, color }) => {
    const ref = useRef<THREE.Mesh>(null);
    const initialPos = useMemo(() => {
        const angle = (index / count) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * 1.5, Math.sin(angle) * 0.5, 0);
    }, [index, count]);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime;
        
        // Orbit logic
        const speed = isHovered ? 3.0 : 0.5;
        const radius = isHovered ? 1.8 : 1.2;
        const angle = (index / count) * Math.PI * 2 + t * speed * 0.2;
        
        ref.current.position.x = Math.cos(angle) * radius;
        ref.current.position.y = Math.sin(angle) * radius * 0.4; // Flattened orbit
        ref.current.rotation.z = t * 2;
        ref.current.rotation.y = t;
        
        const scale = isHovered ? 1.5 : 1.0;
        ref.current.scale.setScalar(0.1 * scale);
    });

    return (
        <mesh ref={ref} position={initialPos}>
            <boxGeometry />
            <meshBasicMaterial color={color} wireframe={!isHovered} />
        </mesh>
    );
};

export default EffectCanvas;