
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import ChristmasTree from './components/ChristmasTree';
import Snow from './components/Snow';
import Background from './components/Background';
import Overlay from './components/Overlay';
import Ground from './components/Ground';
import Gifts from './components/Gifts';
import { TreeConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<TreeConfig>({
    layers: 6,
    height: 7,
    width: 3.5,
    decorationCount: 60,
    lightsColor: '#fbbf24', // Warm Amber Gold
  });

  const [bgImage, setBgImage] = useState<string | null>(null);

  return (
    <div className="w-full h-screen bg-[#050505] relative overflow-hidden">
      <Overlay config={config} setConfig={setConfig} setBgImage={setBgImage} />
      
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, stencil: false, alpha: false }}>
        <PerspectiveCamera makeDefault position={[0, 4, 14]} fov={45} />
        
        {/* Atmosphere */}
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 8, 35]} />
        
        {/* Lighting Setup */}
        <ambientLight intensity={0.2} color="#b0c4de" /> 
        
        <spotLight 
          position={[10, 15, 10]} 
          angle={0.4} 
          penumbra={0.5} 
          intensity={1.0} 
          castShadow 
          shadow-bias={-0.0001}
          color="#e0e7ff"
        />
        
        <spotLight 
          position={[-10, 5, -10]} 
          intensity={0.8} 
          color={config.lightsColor} 
        />
        
        {/* Point light near the tree base for warmth */}
        <pointLight position={[0, 0, 2]} intensity={0.5} color="#ffaa00" distance={10} />

        {/* Scene Contents */}
        <Suspense fallback={null}>
            <group position={[0, -1, 0]}>
                <ChristmasTree config={config} />
                <Gifts />
                <Ground />
            </group>
            
            <Snow count={2000} />
            <Background imageUrl={bgImage} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <Environment preset="night" blur={0.6} />
        </Suspense>

        {/* Post Processing for the "100x" Look */}
        <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={1} // Only very bright things (like our lights) will glow
                mipmapBlur 
                intensity={1.5} 
                radius={0.6}
            />
            <Vignette eskil={false} offset={0.1} darkness={0.5} />
            <Noise opacity={0.02} /> 
        </EffectComposer>

        {/* Controls */}
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 2.5} 
          maxPolarAngle={Math.PI / 1.9} 
          minDistance={6}
          maxDistance={25}
          autoRotate={true}
          autoRotateSpeed={0.5}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
};

export default App;
