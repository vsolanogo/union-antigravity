import React from 'react';
import { CanvasContainer } from './components/CanvasContainer';

export default function App() {
  return (
    <div className="relative w-full h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        <CanvasContainer />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none">
        <div className="text-center p-8 bg-slate-950/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 shadow-2xl max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-4 tracking-tight">
            Kinetic Field
          </h1>
          <p className="text-slate-300 text-lg md:text-xl mb-6 font-light">
            Interactive particle physics simulation. Move your cursor to disrupt the equilibrium.
          </p>
          <div className="flex gap-4 justify-center pointer-events-auto">
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-300 text-sm font-medium backdrop-blur-md">
              View Source
            </button>
            <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.5)] text-sm">
              Get Started
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          System Status: Operational
        </div>
      </div>
    </div>
  );
}