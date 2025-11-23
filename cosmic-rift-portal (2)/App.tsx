import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { CosmicPortal } from './components/CosmicPortal';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* UI Overlay - Only show if NOT in iframe (or if we want to keep it, maybe style it differently? User said "double headers", so let's hide it) */}
      {window.self === window.top && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-8">
          <header>
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-100 to-purple-500 tracking-tighter mix-blend-screen opacity-90 filter drop-shadow-[0_0_15px_rgba(100,200,255,0.5)]">
              SINGULARITY
            </h1>
            <p className="text-blue-200/70 mt-4 max-w-md text-sm md:text-base font-medium tracking-widest uppercase border-l-2 border-purple-500 pl-4">
              Gravitational Lensing &<br />
              Spacetime Distortion Field
            </p>
          </header>

          <footer className="flex justify-between items-end text-blue-300/40 text-[10px] md:text-xs uppercase tracking-[0.2em] font-mono">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System: Online
              </span>
              <span>Render: WebGL 2.0 // Post-Processing: Active</span>
            </div>
            <div className="text-right">
              <p>Class: Interstellar Rift</p>
              <p className="text-white/60">Interact to destabilize</p>
            </div>
          </footer>
        </div>
      )}

      {/* 3D Scene */}
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: false, alpha: false, stencil: false, depth: true }}
        className="touch-none"
      >
        <color attach="background" args={['#050508']} />

        <Suspense fallback={null}>
          <CosmicPortal />
        </Suspense>

        {/* Cinematic Post Processing */}
        <EffectComposer disableNormalPass>
          {/* Intense Glow */}
          <Bloom
            luminanceThreshold={0.2}
            mipmapBlur
            intensity={1.5}
            radius={0.6}
          />
          {/* Film Grain for realism */}
          <Noise opacity={0.05} />
          {/* Darken corners to focus center */}
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default App;