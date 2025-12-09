import React, { useRef, useMemo } from 'react';
import { useFrame, useThree, extend, Object3DNode } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PortalMaterial } from './PortalMaterial';
import FloatingOrbs from './FloatingOrbs';
import { ASSETS } from '../constants';
import { PortalMaterialType } from '../types';

// Register the custom material with R3F
extend({ PortalMaterial });

// Extend Three elements for Typescript JSX via module augmentation to avoid namespace collisions
declare module '@react-three/fiber' {
  interface ThreeElements {
    portalMaterial: Object3DNode<PortalMaterialType, typeof PortalMaterial>;
  }
}

const PortalScene: React.FC = () => {
  const materialRef = useRef<PortalMaterialType>(null);
  const { viewport, size, camera } = useThree();

  // Load textures using Suspense-ready hook
  const [cloudTex, galaxyTex, noiseTex] = useTexture([
    ASSETS.CLOUDS_URL,
    ASSETS.GALAXY_URL,
    ASSETS.NOISE_URL,
  ]);

  // Optimize texture settings for WebGL
  useMemo(() => {
    [cloudTex, galaxyTex, noiseTex].forEach((tex) => {
      tex.wrapS = THREE.MirroredRepeatWrapping;
      tex.wrapT = THREE.MirroredRepeatWrapping;
      // Modern Three.js color management
      if ('colorSpace' in tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
      } else {
        (tex as any).encoding = 3001; // sRGBEncoding fallback
      }
    });
    
    // Noise should be linear (not color managed)
    if ('colorSpace' in noiseTex) {
      noiseTex.colorSpace = THREE.NoColorSpace;
    } else {
      (noiseTex as any).encoding = 3000; // LinearEncoding fallback
    }
  }, [cloudTex, galaxyTex, noiseTex]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (materialRef.current) {
      // 1. Update Time
      materialRef.current.uTime = time;

      // 2. Smooth Mouse Movement
      const targetX = (state.pointer.x + 1) / 2;
      const targetY = (state.pointer.y + 1) / 2;
      
      // Lerp factor 0.08 for slightly heavier, more cinematic feel
      materialRef.current.uMouse.lerp(new THREE.Vector2(targetX, targetY), 0.08);

      // 3. Update Resolution
      materialRef.current.uResolution.set(size.width, size.height);
    }

    // 4. Camera Breathing (Cinematic zoom drift)
    // Very subtle zoom in/out
    camera.position.z = 1 + Math.sin(time * 0.2) * 0.02;
    // Tiny rotation roll
    camera.rotation.z = Math.sin(time * 0.1) * 0.005;
  });

  return (
    <>
      <mesh>
        {/* Plane fills the viewport */}
        <planeGeometry args={[viewport.width, viewport.height]} />
        <portalMaterial
          ref={materialRef}
          uTexClouds={cloudTex}
          uTexGalaxy={galaxyTex}
          uTexNoise={noiseTex}
          transparent={false}
        />
      </mesh>
      
      {/* Add Floating Orbs in front */}
      <group position={[0, 0, 0.1]}>
        <FloatingOrbs />
      </group>
    </>
  );
};

export default PortalScene;