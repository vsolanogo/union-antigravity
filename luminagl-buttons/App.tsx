import React, { useState } from 'react';
import WebGLButton from './components/WebGLButton';
import { EffectType } from './types';

const App: React.FC = () => {
  const [globalSpeed, setGlobalSpeed] = useState(1.0);
  const [globalIntensity, setGlobalIntensity] = useState(1.0);

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden selection:bg-purple-500/30 font-sans">
      
      {/* Subtle Background Mesh (CSS Radial) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(20,20,40,0.4),_rgba(0,0,0,1))]" />

      {/* Header */}
      <header className="relative z-10 pt-20 pb-12 px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
          LUMINA <span className="text-blue-500">GL</span>
        </h1>
        <div className="h-1 w-24 mx-auto bg-blue-500 rounded-full mb-6 shadow-[0_0_15px_#3b82f6]"></div>
        <p className="text-gray-400 max-w-xl mx-auto text-lg font-light leading-relaxed">
          Next-generation UI components powered by raw <span className="text-white font-mono">GLSL</span>. 
          <br/>Featuring signed distance fields, noise algorithms, and physics-based interpolation.
        </p>
      </header>

      {/* Controls */}
      <div className="relative z-20 max-w-2xl mx-auto mb-24 px-8 py-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8 justify-around">
            <div className="flex-1">
                <div className="flex justify-between mb-2">
                    <label className="text-xs uppercase tracking-widest text-blue-400 font-bold">Time Scale</label>
                    <span className="text-xs font-mono text-gray-400">{globalSpeed.toFixed(1)}x</span>
                </div>
                <input 
                    type="range" 
                    min="0.1" 
                    max="4.0" 
                    step="0.1"
                    value={globalSpeed}
                    onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>
            <div className="flex-1">
                <div className="flex justify-between mb-2">
                    <label className="text-xs uppercase tracking-widest text-pink-400 font-bold">Luminance</label>
                    <span className="text-xs font-mono text-gray-400">{globalIntensity.toFixed(1)}</span>
                </div>
                <input 
                    type="range" 
                    min="0.5" 
                    max="2.5" 
                    step="0.1"
                    value={globalIntensity}
                    onChange={(e) => setGlobalIntensity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
            </div>
        </div>
      </div>

      {/* Main Gallery */}
      <main className="relative z-10 container mx-auto px-4 pb-32">
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
            {/* Card: Hyper Neon */}
            <div className="group relative p-8 rounded-3xl bg-neutral-900/40 border border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:bg-neutral-900/60 flex flex-col items-center justify-center gap-8 min-h-[300px]">
                <div className="absolute top-6 left-6">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Hyper Neon</h3>
                    <p className="text-xs text-blue-400 font-mono mt-1">SDF ROUNDED BOX</p>
                </div>
                <WebGLButton 
                    effectType={EffectType.NEON_PULSE}
                    label="Initialize"
                    primaryColor={[0.0, 0.8, 1.0]} 
                    secondaryColor={[0.0, 0.2, 1.0]} 
                    speed={globalSpeed}
                    intensity={globalIntensity}
                    className="w-72 h-20 text-lg shadow-[0_0_50px_-10px_rgba(0,100,255,0.3)]"
                    onClick={() => console.log("Neon Clicked")}
                />
            </div>

            {/* Card: Molten Alloy */}
            <div className="group relative p-8 rounded-3xl bg-neutral-900/40 border border-white/5 hover:border-orange-500/30 transition-all duration-500 hover:bg-neutral-900/60 flex flex-col items-center justify-center gap-8 min-h-[300px]">
                <div className="absolute top-6 left-6">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Molten Alloy</h3>
                    <p className="text-xs text-orange-400 font-mono mt-1">FLUID DYNAMICS</p>
                </div>
                <WebGLButton 
                    effectType={EffectType.LIQUID_PLASMA}
                    label="Ignite Core"
                    primaryColor={[1.0, 0.3, 0.0]} 
                    secondaryColor={[1.0, 0.8, 0.0]} 
                    speed={globalSpeed * 0.7}
                    intensity={globalIntensity}
                    className="w-72 h-20 text-lg shadow-[0_0_50px_-10px_rgba(255,100,0,0.3)]"
                />
            </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
             {/* Card: Synthwave */}
             <div className="group relative p-8 rounded-3xl bg-neutral-900/40 border border-white/5 hover:border-purple-500/30 transition-all duration-500 hover:bg-neutral-900/60 flex flex-col items-center justify-center gap-8 min-h-[250px]">
                <div className="absolute top-6 left-6">
                    <h3 className="text-xl font-bold text-white tracking-tight">Synthwave</h3>
                    <p className="text-xs text-purple-400 font-mono mt-1">3D PROJECTION</p>
                </div>
                <WebGLButton 
                    effectType={EffectType.CYBER_GRID}
                    label="Enter Grid"
                    primaryColor={[0.1, 0.0, 0.2]} 
                    secondaryColor={[1.0, 0.0, 0.8]} 
                    speed={globalSpeed * 0.5}
                    intensity={globalIntensity}
                    className="w-full h-16 shadow-[0_0_30px_-5px_rgba(200,0,200,0.2)]"
                />
            </div>

            {/* Card: Holographic */}
             <div className="group relative p-8 rounded-3xl bg-neutral-900/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:bg-neutral-900/60 flex flex-col items-center justify-center gap-8 min-h-[250px]">
                <div className="absolute top-6 left-6">
                    <h3 className="text-xl font-bold text-white tracking-tight">Holographic</h3>
                    <p className="text-xs text-emerald-400 font-mono mt-1">IRIDESCENCE</p>
                </div>
                <WebGLButton 
                    effectType={EffectType.HOLOGRAPHIC}
                    label="Identify"
                    primaryColor={[0.0, 1.0, 0.5]} 
                    secondaryColor={[0.0, 0.2, 0.1]} 
                    speed={globalSpeed * 0.5}
                    intensity={globalIntensity}
                    className="w-full h-16 shadow-[0_0_30px_-5px_rgba(0,255,100,0.2)]"
                />
            </div>

             {/* Card: Warp Drive */}
             <div className="group relative p-8 rounded-3xl bg-neutral-900/40 border border-white/5 hover:border-white/30 transition-all duration-500 hover:bg-neutral-900/60 flex flex-col items-center justify-center gap-8 min-h-[250px]">
                <div className="absolute top-6 left-6">
                    <h3 className="text-xl font-bold text-white tracking-tight">Warp Drive</h3>
                    <p className="text-xs text-gray-400 font-mono mt-1">PARTICLE SYSTEM</p>
                </div>
                <WebGLButton 
                    effectType={EffectType.STAR_FIELD}
                    label="Engage"
                    primaryColor={[0.5, 0.7, 1.0]} 
                    secondaryColor={[1.0, 1.0, 1.0]} 
                    speed={globalSpeed * 0.8}
                    intensity={globalIntensity}
                    className="w-full h-16 shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)]"
                />
            </div>
        </div>

      </main>
      
      <footer className="text-center pb-8 text-white/20 text-sm">
        <p>Rendered in real-time. No static assets.</p>
      </footer>
    </div>
  );
};

export default App;