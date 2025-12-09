import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { PortalScene } from './components/PortalScene';
import { audioManager } from './components/AudioManager';

const App: React.FC = () => {
  const [ready, setReady] = useState(false);

  const handleStart = () => {
    audioManager.init();
    audioManager.resume();
    setReady(true);
  };

  return (
    <div className="relative w-full h-full bg-black">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <PortalScene audioEnabled={ready} />
        </Suspense>
      </Canvas>
      
      <Loader />
      
      {/* HUD / Title */}
      <div className={`absolute top-0 left-0 w-full p-6 pointer-events-none text-white mix-blend-difference z-10 transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-4xl font-bold tracking-tighter mb-2">Aether Portal</h1>
        <p className="text-sm opacity-80 max-w-md">
          Explore the void. Sound is reactive.
        </p>
      </div>

      {/* Start Overlay */}
      {!ready && (
        <div 
          onClick={handleStart}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer hover:bg-black/70 transition-colors"
        >
          <div className="text-center text-white space-y-4 animate-pulse">
            <h2 className="text-2xl font-light tracking-[0.5em] uppercase">Initialize</h2>
            <p className="text-xs opacity-50">Click anywhere to engage audio systems</p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="absolute bottom-6 left-6 text-xs text-white/50 pointer-events-none">
        <p>Unsplash Textures • WebGL + WebAudio</p>
      </div>
    </div>
  );
};

export default App;
