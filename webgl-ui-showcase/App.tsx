import React from 'react';
import WebGlButton from './components/WebGlButton';
import { ButtonEffect } from './types';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-y-auto">
      {/* Header */}
      <header className="p-8 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              WebGL Interface
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Hybrid DOM + Three.js components. No CSS effects used for buttons.
            </p>
          </div>
          <div className="flex gap-4">
             <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Documentation</a>
             <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-12">
        
        {/* Section 1: Neon Pulse */}
        <section className="mb-20">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-8 bg-cyan-500 rounded-full inline-block"></span>
              Neon Pulse Shader
            </h2>
            <p className="text-gray-400 max-w-2xl">
              Uses a custom fragment shader to generate a Signed Distance Field (SDF) glow and scanlines. 
              The glowing ring expands and intensifies on hover state passed via React props to the WebGL uniform.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 items-center bg-gray-800/30 p-12 rounded-xl border border-gray-800">
            <WebGlButton 
              label="Initiate" 
              effect={ButtonEffect.NEON_PULSE} 
              primaryColor="#00ffff" 
              secondaryColor="#0000ff"
              onClick={() => alert('Initiated!')}
            />
            <WebGlButton 
              label="System Check" 
              effect={ButtonEffect.NEON_PULSE} 
              primaryColor="#ff0055" 
              secondaryColor="#ff9900" 
            />
            <WebGlButton 
              label="Override" 
              effect={ButtonEffect.NEON_PULSE} 
              primaryColor="#00ff00" 
              secondaryColor="#ccff00" 
            />
          </div>
        </section>

        {/* Section 2: Liquid Metal */}
        <section className="mb-20">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-8 bg-purple-500 rounded-full inline-block"></span>
              Liquid Metal Distortion
            </h2>
            <p className="text-gray-400 max-w-2xl">
              Implements Simplex Noise to distort the UV coordinates of a mesh in real-time. 
              The 'liquid' accelerates when interacting with the HTML DOM element.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 items-center bg-gray-800/30 p-12 rounded-xl border border-gray-800">
             <WebGlButton 
              label="Fluid State" 
              effect={ButtonEffect.LIQUID_METAL} 
              primaryColor="#bfdbfe" 
              secondaryColor="#3b82f6" 
            />
             <WebGlButton 
              label="Molten Core" 
              effect={ButtonEffect.LIQUID_METAL} 
              primaryColor="#fca5a5" 
              secondaryColor="#dc2626" 
            />
          </div>
        </section>

        {/* Section 3: Voxel Storm */}
        <section className="mb-20">
           <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-8 bg-yellow-500 rounded-full inline-block"></span>
              Voxel Particle Storm
            </h2>
            <p className="text-gray-400 max-w-2xl">
              3D primitives orbiting in 3D space around the DOM element. 
              Demonstrates syncing 3D scene depth with 2D UI layout.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 items-center bg-gray-800/30 p-12 rounded-xl border border-gray-800">
            <WebGlButton 
              label="Assemble" 
              effect={ButtonEffect.VOXEL_STORM} 
              primaryColor="#fbbf24" 
              secondaryColor="#d97706" 
            />
            <WebGlButton 
              label="Deploy" 
              effect={ButtonEffect.VOXEL_STORM} 
              primaryColor="#10b981" 
              secondaryColor="#059669" 
            />
          </div>
        </section>

         {/* Section 4: Holographic */}
         <section className="mb-20">
           <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-8 bg-indigo-500 rounded-full inline-block"></span>
              Holographic Glitch
            </h2>
            <p className="text-gray-400 max-w-2xl">
              Simulates a retro-futuristic hologram with interference patterns and RGB offset.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 items-center bg-gray-800/30 p-12 rounded-xl border border-gray-800">
            <WebGlButton 
              label="Access Data" 
              effect={ButtonEffect.HOLOGRAPHIC} 
              primaryColor="#818cf8" 
              secondaryColor="#4f46e5" 
            />
            <WebGlButton 
              label="Encrypted" 
              effect={ButtonEffect.HOLOGRAPHIC} 
              primaryColor="#f472b6" 
              secondaryColor="#db2777" 
            />
          </div>
        </section>

      </main>
    </div>
  );
};

export default App;
