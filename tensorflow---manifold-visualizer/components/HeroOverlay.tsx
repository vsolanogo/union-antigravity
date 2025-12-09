import React from 'react';

const HeroOverlay: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 pointer-events-none">
      {/* Enable pointer events only on interactive elements */}
      <main className="max-w-4xl w-full flex flex-col items-center text-center space-y-8 mt-10">
        
        {/* Title Section */}
        <div className="space-y-4 animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-400 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
            TENSOR
            <span className="block text-4xl md:text-6xl text-cyan-500/80 font-mono tracking-widest mt-2">
              FIELD
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100/70 max-w-2xl mx-auto font-light tracking-wide">
            Multidimensional manifold visualization using Signed Distance Functions and Raymarching.
          </p>
        </div>

        {/* Glass Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 px-4">
          
          <GlassCard title="Vector Space" value="∞">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 mb-2"></div>
            <p className="text-sm text-gray-300">
              Continuous differentiable manifold transformations in real-time.
            </p>
          </GlassCard>

          <GlassCard title="Compute Load" value="128 TFLOPS">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 mb-2"></div>
            <p className="text-sm text-gray-300">
              Simulated tensor processing units visualizing high-dimensional data.
            </p>
          </GlassCard>

          <GlassCard title="Latency" value="0.4ms">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 mb-2"></div>
            <p className="text-sm text-gray-300">
              Low-latency GLSL rendering pipeline with optimized SDF steps.
            </p>
          </GlassCard>

        </div>

        {/* Interactive Button */}
        <div className="pt-12 pointer-events-auto">
          <button className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-md border border-white/10 group-hover:border-white/30 transition-all"></div>
            <span className="relative z-10 font-bold tracking-widest text-white group-hover:text-cyan-200 transition-colors uppercase text-sm">
              Initialize Core
            </span>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </button>
        </div>

      </main>

      <footer className="fixed bottom-6 text-xs text-white/20 font-mono tracking-widest">
        SYSTEM READY // WEBGL 2.0 // RENDER_PASS_01
      </footer>
    </div>
  );
};

const GlassCard: React.FC<{ title: string; value: string; children: React.ReactNode }> = ({ title, value, children }) => (
  <div className="pointer-events-auto group relative p-6 rounded-2xl overflow-hidden transition-all duration-500 hover:bg-white/5 border border-white/5 hover:border-white/20 backdrop-blur-sm">
    {/* Hover Glow Effect */}
    <div className="absolute -inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
    
    <div className="relative z-10 flex flex-col items-start text-left">
      <h3 className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">{title}</h3>
      <div className="text-3xl font-mono font-light text-white mb-4">{value}</div>
      {children}
    </div>
  </div>
);

export default HeroOverlay;