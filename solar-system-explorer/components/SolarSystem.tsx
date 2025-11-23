import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { PLANETS } from '../constants';
import { PlanetData } from '../types';
import Planet from './Planet';
import Sun from './Sun';

interface SolarSystemProps {
  selectedPlanet: PlanetData | null;
  onPlanetSelect: (planet: PlanetData | null) => void;
}

const SolarSystem: React.FC<SolarSystemProps> = ({ selectedPlanet, onPlanetSelect }) => {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas 
        shadows
        camera={{ position: [0, 80, 120], fov: 40 }}
        gl={{ antialias: false }} // Post-processing handles AA usually, or off for performance
      >
        <color attach="background" args={['#020205']} />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={30}
          maxDistance={400}
          zoomSpeed={0.6}
          rotateSpeed={0.5}
        />

        {/* Cinematic Post Processing */}
        <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={1.2} // Only very bright things glow (Sun)
                mipmapBlur 
                intensity={1.5} 
                radius={0.6}
            />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        {/* Dense Starfield for depth */}
        <Stars 
          radius={300} 
          depth={60} 
          count={10000} 
          factor={4} 
          saturation={0.5} 
          fade 
          speed={0.5} 
        />
        
        <ambientLight intensity={0.05} /> {/* Very dark ambient for high contrast */}
        <Sun />

        {PLANETS.map((planet) => (
          <Planet 
            key={planet.id} 
            data={planet} 
            isSelected={selectedPlanet?.id === planet.id}
            onSelect={onPlanetSelect}
          />
        ))}
        
        {/* Click away to deselect */}
        <mesh 
          position={[0, -50, 0]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          onClick={() => onPlanetSelect(null)}
          visible={false}
        >
            <planeGeometry args={[2000, 2000]} />
        </mesh>

      </Canvas>
    </div>
  );
};

export default SolarSystem;