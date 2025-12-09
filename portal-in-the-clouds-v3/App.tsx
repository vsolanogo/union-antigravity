
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import PortalScene from './components/PortalScene';
import AudioReactive from './components/AudioReactive';

const App: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleStart = () => {
    setClicked(true);
    // Small delay to allow fade out animation before state change if desired,
    // but immediate is snappier.
    setReady(true);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      
      {/* Start Screen Overlay */}
      <div 
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ${clicked ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
          AETHER
        </h1>
        <button 
          onClick={handleStart}
          className="group relative px-8 py-4 bg-transparent border border-white/20 text-white uppercase tracking-[0.2em] text-sm hover:bg-white/5 transition-all duration-300 backdrop-blur-md"
        >
          <span className="opacity-70 group-hover:opacity-100 transition-opacity">Initialize Portal</span>
          <div className="absolute inset-0 border border-white/0 group-hover:border-white/40 transition-all duration-500 scale-105 opacity-0 group-hover:opacity-100" />
        </button>
        <p className="mt-6 text-white/30 text-xs font-mono">Headphones Recommended</p>
      </div>

      {/* Main UI Overlay (Visible after start) */}
      <div className={`absolute top-0 left-0 w-full p-8 z-10 pointer-events-none flex justify-between items-start mix-blend-difference transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-white">
          <h1 className="text-5xl font-extrabold tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            AETHER <span className="text-blue-400">RIFT</span>
          </h1>
          <p className="text-blue-100 opacity-90 mt-2 max-w-md text-lg font-light tracking-wide leading-relaxed">
            The fabric of reality is thinning. <br/>
            Move your cursor to peer into the void.
          </p>
        </div>
        
        <div className="text-right text-white/60 text-xs tracking-widest uppercase">
          <p>WebGL Experiment // v2.0</p>
          <p className="mt-1">Audio Reactive</p>
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <PortalScene />
          {ready && <AudioReactive enabled={ready} />}
        </Suspense>
      </Canvas>

      {/* Loading Indicator */}
      <Loader 
        containerStyles={{ background: '#050a14' }} 
        innerStyles={{ width: '300px', height: '4px', background: '#333' }}
        barStyles={{ background: '#60a5fa', height: '100%' }}
        dataStyles={{ fontSize: '12px', color: '#60a5fa', fontFamily: 'monospace', marginTop: '10px' }}
      />
    </div>
  );
};

export default App;
