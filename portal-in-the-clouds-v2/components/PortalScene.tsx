import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PortalMaterial } from './PortalMaterial';
import { Orbs } from './Orbs';
import { audioManager } from './AudioManager';

// Arrays of Unsplash URLs for random selection
const CLOUD_URLS = [
  "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1594156596782-656c93e4d504?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1566228200720-87079fdb66fa?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1536514072410-5019a3c69182?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1570032257807-a66e63964079?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?q=80&w=2560&auto=format&fit=crop", 
];

const GALAXY_URLS = [
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1445233566136-81686dea056a?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1506318137071-a8bcbf675b27?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1454789548728-85d2696ddbcd?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2560&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1614730341194-75c60740a923?q=80&w=2560&auto=format&fit=crop", 
];

const NOISE_URL = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/water/Water_1_M_Normal.jpg"; 

interface PortalSceneProps {
  audioEnabled?: boolean;
}

export const PortalScene: React.FC<PortalSceneProps> = ({ audioEnabled }) => {
  const { viewport, size } = useThree();
  
  const [selectedCloudUrl, selectedGalaxyUrl] = useMemo(() => {
    const cloud = CLOUD_URLS[Math.floor(Math.random() * CLOUD_URLS.length)];
    const galaxy = GALAXY_URLS[Math.floor(Math.random() * GALAXY_URLS.length)];
    return [cloud, galaxy];
  }, []);

  const [cloudTex, galaxyTex, noiseTex] = useTexture([
    selectedCloudUrl,
    selectedGalaxyUrl,
    NOISE_URL
  ]);

  useMemo(() => {
    cloudTex.colorSpace = THREE.SRGBColorSpace;
    galaxyTex.colorSpace = THREE.SRGBColorSpace;
    // Mirrored repeat helps with continuous noise movement without seams
    noiseTex.wrapS = noiseTex.wrapT = THREE.MirroredRepeatWrapping;
  }, [cloudTex, galaxyTex, noiseTex]);

  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const smoothMouse = useRef(new THREE.Vector2(0, 0));
  const prevMouse = useRef(new THREE.Vector2(0, 0));

  useFrame((state) => {
    if (!materialRef.current) return;

    // Save previous frame mouse for velocity calculation
    prevMouse.current.copy(smoothMouse.current);

    // Smoother lerp for weightiness
    smoothMouse.current.lerp(state.pointer, 0.08);

    // Calculate Velocity
    const velocity = smoothMouse.current.distanceTo(prevMouse.current);

    // Update Audio Engine
    if (audioEnabled) {
      audioManager.update(smoothMouse.current, velocity);
    }

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uMouse.value.copy(smoothMouse.current);
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <>
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <portalMaterial
          ref={materialRef}
          key={PortalMaterial.key}
          uTexClouds={cloudTex}
          uTexGalaxy={galaxyTex}
          uTexNoise={noiseTex}
        />
      </mesh>

      {/* Increased particle count for deeper atmosphere */}
      <Orbs count={100} mouse={smoothMouse} />
    </>
  );
};
