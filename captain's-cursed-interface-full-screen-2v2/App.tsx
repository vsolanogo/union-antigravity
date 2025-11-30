
import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PirateButton from './components/PirateButton';
import { EffectType } from './types';
import { soundSystem } from './utils/SoundSystem';

// --- Background Scene Components ---
// Kept for subtle background atmosphere if gaps exist or transparency is used.
const StarsAndDust = () => {
    const count = 100;
    const mesh = useRef<THREE.InstancedMesh>(null);

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
            const s = Math.cos(t);
            
            dummy.position.set(
                xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
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
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-200">
      
      {/* 1. Global WebGL Background (Subtle layer behind buttons) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundScene />
      </div>

      {/* Floating Header Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
        <div className="relative p-12 bg-black/40 backdrop-blur-md rounded-full border border-amber-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center transform hover:scale-105 transition-transform duration-500 pointer-events-auto group">
            <h1 className="text-4xl md:text-6xl font-pirate text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-500 to-amber-900 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
                Captain's UI
            </h1>
             <p className="mt-2 text-amber-100/60 font-serif text-sm tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                Select Your Doom
            </p>
        </div>
      </div>

      {/* Audio Control */}
      <button 
        onClick={toggleAudio}
        className="fixed top-6 right-6 z-50 px-4 py-2 border border-amber-500/30 bg-slate-900/80 text-amber-200 font-pirate rounded-full hover:bg-amber-900/40 transition-colors uppercase tracking-widest text-sm backdrop-blur-md"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* 2. Main Content - Full Screen 2x2 Grid */}
      <div className="relative z-10 w-full h-full grid grid-cols-1 md:grid-cols-2 grid-rows-4 md:grid-rows-2">
          
          {/* Tile 1: Spectral Mist */}
          <div className="relative border-b md:border-b-0 md:border-r border-white/5">
            <PirateButton 
                label="Spectral Mist" 
                effect={EffectType.SPECTRAL_MIST} 
                onClick={() => console.log('Spectral Mist Triggered')}
            />
          </div>

          {/* Tile 2: Cursed Gold */}
          <div className="relative border-b border-white/5">
            <PirateButton 
                label="Cursed Gold" 
                effect={EffectType.CURSED_GOLD} 
                onClick={() => console.log('Cursed Gold Triggered')}
            />
          </div>

          {/* Tile 3: Bioluminescence */}
          <div className="relative border-b md:border-b-0 md:border-r border-white/5">
            <PirateButton 
                label="Abyssal Glow" 
                effect={EffectType.BIOLUMINESCENCE} 
                onClick={() => console.log('Bioluminescence Triggered')}
            />
          </div>

          {/* Tile 4: Kraken Storm */}
          <div className="relative">
            <PirateButton 
                label="Kraken Storm" 
                effect={EffectType.KRAKEN_STORM} 
                onClick={() => console.log('Kraken Storm Triggered')}
            />
          </div>

      </div>
    </div>
  );
};

export default App;
