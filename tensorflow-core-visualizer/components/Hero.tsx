import React from 'react';
import { Network, Activity, Box, Database, ArrowRight } from 'lucide-react';

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl hover:bg-black/80 hover:border-cyan-500/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg shadow-black/40">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:text-cyan-300 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all">
        {icon}
      </div>
      <span className="text-sm text-gray-400 font-mono uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white font-sans">{value}</div>
  </div>
);

const Hero: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-10 pointer-events-none">
      <div className="max-w-5xl w-full z-10 pointer-events-auto">
        
        {/* Main Title Area */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-8 backdrop-blur-xl shadow-[0_0_20px_rgba(8,145,178,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            NEURAL LATTICE ONLINE
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-6 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-300">
              TENSOR
            </span>
            <br />
            DYNAMICS
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed backdrop-blur-xl p-6 rounded-2xl border border-white/10 bg-black/50 shadow-2xl">
            Visualize the hidden dimensions of data. Our neural lattice technology renders high-dimensional tensor fields in real-time, bridging the gap between raw computation and human intuition.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Initialize Core
            </button>
            <button className="px-8 py-4 bg-black/60 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md hover:border-cyan-500/30 shadow-lg">
              Documentation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Active Nodes" 
            value="8,492,103" 
            icon={<Network className="w-5 h-5" />} 
          />
          <StatCard 
            label="Tensor Flow" 
            value="452.2 TB/s" 
            icon={<Activity className="w-5 h-5" />} 
          />
          <StatCard 
            label="Dimensions" 
            value="1,024" 
            icon={<Box className="w-5 h-5" />} 
          />
          <StatCard 
            label="Latency" 
            value="0.004 ms" 
            icon={<Database className="w-5 h-5" />} 
          />
        </div>

      </div>
    </div>
  );
};

export default Hero;