
import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PirateButton from './components/PirateButton';
import { EffectType } from './types';
import { soundSystem } from './utils/SoundSystem';

// --- Background Scene Components ---

const StarsAndDust = () => {
    const count = 200;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const light = useRef<THREE.Group>(null);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!mesh.current) return;
        
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);
            
            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshPhongMaterial color="#60a5fa" emissive="#1e3a8a" emissiveIntensity={0.5} transparent opacity={0.6} />
        </instancedMesh>
    );
};

const BackgroundScene = () => {
    return (
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }} className="fixed inset-0 z-0">
            <fog attach="fog" args={['#020617', 5, 30]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={0.5} color="#4ade80" />
            <StarsAndDust />
            {/* Deep dark ocean floor feel */}
            <mesh position={[0, 0, -10]}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial color="#020617" />
            </mesh>
        </Canvas>
    );
};


const App: React.FC = () => {
  const [isMuted, setIsMuted] = useState(soundSystem.getMutedState());

  const toggleAudio = () => {
      const muted = soundSystem.toggleMute();
      setIsMuted(muted);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-200 selection:bg-amber-500/30">
      
      {/* 1. Global WebGL Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundScene />
      </div>

      {/* Audio Control */}
      <button 
        onClick={toggleAudio}
        className="fixed top-6 right-6 z-50 px-4 py-2 border border-amber-500/30 bg-slate-900/80 text-amber-200 font-pirate rounded-full hover:bg-amber-900/40 transition-colors uppercase tracking-widest text-sm backdrop-blur-md"
      >
        {isMuted ? '🔇 Enable Audio' : '🔊 Sound On'}
      </button>

      {/* 2. Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        
        {/* Header */}
        <header className="mb-24 text-center space-y-6 relative group">
           <div className="absolute -inset-10 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen animate-pulse"></div>
          <h1 className="text-7xl md:text-9xl font-pirate text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-500 to-amber-900 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            Captain's Cursed UI
          </h1>
          <p className="text-2xl text-amber-100/60 font-serif italic tracking-widest border-b border-amber-500/30 inline-block pb-4">
            Interactive WebGL Shaders & Procedural Audio
          </p>
        </header>

        {/* Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16 w-full max-w-5xl perspective-1000">
          
          {/* Card 1 */}
          <div className="group flex flex-col items-center space-y-4 p-8 rounded-3xl bg-slate-900/40 border border-emerald-900/50 backdrop-blur-sm transition-all duration-500 hover:bg-slate-900/60 hover:border-emerald-500/30 hover:shadow-[0_0_50px_rgba(16,185,129,0.1)] hover:-translate-y-2">
            <h2 className="text-3xl text-emerald-400 font-pirate tracking-wide">The Flying Dutchman</h2>
            <p className="text-center text-slate-400 font-serif text-sm h-10 w-3/4">
              Summons the spectral mist. Move your mouse to disturb the spirits.
            </p>
            <div className="pt-4">
                <PirateButton 
                label="Release Soul" 
                effect={EffectType.SPECTRAL_MIST} 
                onClick={() => console.log('Spectral Mist Triggered')}
                />
            </div>
          </div>

          {/* Card 2 */}
          <div className="group flex flex-col items-center space-y-4 p-8 rounded-3xl bg-slate-900/40 border border-amber-900/50 backdrop-blur-sm transition-all duration-500 hover:bg-slate-900/60 hover:border-amber-500/30 hover:shadow-[0_0_50px_rgba(245,158,11,0.1)] hover:-translate-y-2">
            <h2 className="text-3xl text-amber-500 font-pirate tracking-wide">Aztec Curse</h2>
            <p className="text-center text-slate-400 font-serif text-sm h-10 w-3/4">
              Molten gold that reacts to your greed. Interactive heat map.
            </p>
            <div className="pt-4">
                <PirateButton 
                label="Steal Gold" 
                effect={EffectType.CURSED_GOLD} 
                onClick={() => console.log('Cursed Gold Triggered')}
                />
            </div>
          </div>

          {/* Card 3 */}
          <div className="group flex flex-col items-center space-y-4 p-8 rounded-3xl bg-slate-900/40 border border-cyan-900/50 backdrop-blur-sm transition-all duration-500 hover:bg-slate-900/60 hover:border-cyan-500/30 hover:shadow-[0_0_50px_rgba(6,182,212,0.1)] hover:-translate-y-2">
            <h2 className="text-3xl text-cyan-400 font-pirate tracking-wide">Abyssal Lights</h2>
            <p className="text-center text-slate-400 font-serif text-sm h-10 w-3/4">
              Bioluminescent neural network. Touching it stimulates the colony.
            </p>
            <div className="pt-4">
                <PirateButton 
                label="Dive Deep" 
                effect={EffectType.BIOLUMINESCENCE} 
                onClick={() => console.log('Bioluminescence Triggered')}
                />
            </div>
          </div>

          {/* Card 4 */}
          <div className="group flex flex-col items-center space-y-4 p-8 rounded-3xl bg-slate-900/40 border border-blue-900/50 backdrop-blur-sm transition-all duration-500 hover:bg-slate-900/60 hover:border-blue-500/30 hover:shadow-[0_0_50px_rgba(37,99,235,0.1)] hover:-translate-y-2">
            <h2 className="text-3xl text-blue-500 font-pirate tracking-wide">Kraken's Fury</h2>
            <p className="text-center text-slate-400 font-serif text-sm h-10 w-3/4">
              Storm turbulence and lightning. The waves follow your command.
            </p>
            <div className="pt-4">
                <PirateButton 
                label="Summon Beast" 
                effect={EffectType.KRAKEN_STORM} 
                onClick={() => console.log('Kraken Storm Triggered')}
                />
            </div>
          </div>

        </div>

        <footer className="mt-32 text-slate-600 text-sm font-serif">
           Interactive WebGL Modules • React Three Fiber • Procedural Web Audio
        </footer>

      </div>
    </div>
  );
};

export default App;
