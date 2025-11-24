import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import WebGlButton from './components/WebGlButton';
import { ButtonEffect } from './types';
import * as THREE from 'three';

// --- Global Background Effect ---
const GridFloor = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!meshRef.current) return;
        // Move grid towards camera to simulate infinite forward motion
        const t = state.clock.elapsedTime;
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = t;
    });

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vec3 pos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;
    const fragmentShader = `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
            vec2 uv = vUv * 20.0;
            // Scroll
            uv.y += uTime * 0.5;
            
            float grid = step(0.98, fract(uv.x)) + step(0.98, fract(uv.y));
            
            // Fade into distance
            float dist = distance(vUv, vec2(0.5, 0.5));
            float alpha = (grid * 0.1) * (1.0 - smoothstep(0.0, 0.5, dist)); // Center glow
            
            gl_FragColor = vec4(0.2, 0.4, 0.8, alpha);
        }
    `;

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, -10]} scale={[50, 50, 1]}>
            <planeGeometry />
            <shaderMaterial 
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{ uTime: { value: 0 } }}
                transparent
                depthWrite={false}
            />
        </mesh>
    )
}

const BackgroundScene = () => (
    <div className="fixed inset-0 z-0 bg-black">
         <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
             <color attach="background" args={['#020205']} />
             <fog attach="fog" args={['#020205', 2, 15]} />
             <GridFloor />
             <ambientLight intensity={0.5} />
         </Canvas>
         <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,_#000_100%)] pointer-events-none"></div>
    </div>
);

const App: React.FC = () => {
  return (
    <div className="min-h-screen text-white overflow-x-hidden selection:bg-cyan-500 selection:text-black font-sans">
      
      <BackgroundScene />

      {/* Header */}
      <header className="relative z-10 p-8 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-500 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
              WGL//NEXUS
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <div className="h-1 w-1 bg-green-500 rounded-full animate-ping"></div>
                <p className="text-cyan-600 text-[10px] font-mono tracking-[0.3em] uppercase">
                Quantum Interface Ready
                </p>
            </div>
          </div>
          <div className="hidden md:flex gap-8 font-mono text-xs text-gray-500">
             <div className="flex flex-col items-end">
                <span>CPU <span className="text-cyan-400">12%</span></span>
                <span>MEM <span className="text-cyan-400">404MB</span></span>
             </div>
             <div className="w-px h-8 bg-white/10"></div>
             <div className="flex flex-col items-end">
                <span>LATENCY <span className="text-green-400">2ms</span></span>
                <span>FPS <span className="text-green-400">60</span></span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto p-8 lg:p-12 pb-32">
        
        {/* Section 1: Warp Drive */}
        <section className="mb-40 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 lg:text-right order-1 lg:order-1">
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
              Hyper-Drive
            </h2>
            <p className="text-cyan-200/60 text-sm leading-relaxed font-mono">
              [CLASS_WARP]<br/>
              Particle system utilizing vertex shader manipulation to simulate relativistic stretching. 
              Audio feedback synthesizes engine spool-up on interaction.
            </p>
          </div>
          <div className="lg:col-span-8 flex flex-wrap gap-8 justify-center lg:justify-start order-2 lg:order-2 p-8 border border-white/5 bg-white/5 rounded-xl backdrop-blur-sm">
            <WebGlButton 
              label="ENGAGE" 
              effect={ButtonEffect.WARP_DRIVE} 
              primaryColor="#ff0055" 
              secondaryColor="#5500ff"
              onClick={() => console.log('Warp Engaged')}
            />
            <WebGlButton 
              label="LIGHTSPEED" 
              effect={ButtonEffect.WARP_DRIVE} 
              primaryColor="#00ccff" 
              secondaryColor="#ffffff" 
            />
          </div>
        </section>

        {/* Section 2: Cyber Glyph */}
        <section className="mb-40 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
           <div className="lg:col-span-8 flex flex-wrap gap-8 justify-center lg:justify-end order-2 lg:order-1 p-8 border border-white/5 bg-white/5 rounded-xl backdrop-blur-sm">
             <WebGlButton 
              label="ENCRYPT" 
              effect={ButtonEffect.CYBER_GLYPH} 
              primaryColor="#10b981" 
              secondaryColor="#064e3b" 
            />
             <WebGlButton 
              label="PROTOCOL 7" 
              effect={ButtonEffect.CYBER_GLYPH} 
              primaryColor="#8b5cf6" 
              secondaryColor="#4c1d95" 
            />
          </div>
          <div className="lg:col-span-4 text-left order-1 lg:order-2">
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
              Artifact
            </h2>
             <p className="text-cyan-200/60 text-sm leading-relaxed font-mono">
              [CLASS_GLYPH]<br/>
              Procedural Torus Knot geometry with decrypting shader noise logic. 
              Simulates alien technology responding to biometric proximity.
            </p>
          </div>
        </section>

        {/* Section 3: Liquid Metal */}
        <section className="mb-40">
           <div className="flex flex-col items-center justify-center text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-500 uppercase tracking-widest mb-4">Legacy Modules (Refined)</h2>
             <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-4 p-8 border border-white/5 bg-black/40 rounded-lg hover:border-white/20 transition-colors">
                <WebGlButton 
                  label="MERCURY" 
                  effect={ButtonEffect.LIQUID_METAL} 
                  primaryColor="#e2e8f0" 
                  secondaryColor="#94a3b8" 
                />
                <span className="text-xs text-gray-500 font-mono">PBR LIQUID SIM</span>
              </div>
              <div className="flex flex-col items-center gap-4 p-8 border border-white/5 bg-black/40 rounded-lg hover:border-white/20 transition-colors">
                 <WebGlButton 
                  label="PLASMA" 
                  effect={ButtonEffect.NEON_PULSE} 
                  primaryColor="#f43f5e" 
                  secondaryColor="#881337" 
                />
                 <span className="text-xs text-gray-500 font-mono">SDF ELECTRIC FIELD</span>
              </div>
              <div className="flex flex-col items-center gap-4 p-8 border border-white/5 bg-black/40 rounded-lg hover:border-white/20 transition-colors">
                 <WebGlButton 
                  label="HIVE MIND" 
                  effect={ButtonEffect.VOXEL_STORM} 
                  primaryColor="#fbbf24" 
                  secondaryColor="#d97706" 
                />
                 <span className="text-xs text-gray-500 font-mono">INSTANCED SWARM</span>
              </div>
           </div>
        </section>

      </main>
      
      <footer className="relative z-10 p-12 text-center text-gray-700 text-[10px] font-mono border-t border-white/5 bg-black">
        <div className="animate-pulse mb-4 text-cyan-900">SYSTEM STABLE</div>
        RENDERED IN REALTIME // WEBGL 2.0 // REACT THREE FIBER
      </footer>
    </div>
  );
};

export default App;