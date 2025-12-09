import React from 'react';
import TensorBackground from './components/TensorBackground';
import TerminalChat from './components/TerminalChat';
import Hero from './components/Hero';

function App() {
  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden bg-black selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* 1. The Visual Core - z-0 to sit above body background but below content */}
      <TensorBackground />
      
      {/* 2. Navigation / Header - relative z-20 to sit above everything */}
      <nav className="fixed top-0 left-0 w-full z-20 px-6 py-6 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 backdrop-blur-md bg-black/10 px-4 py-2 rounded-full border border-white/10">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="font-bold text-black font-mono">T</span>
          </div>
          <span className="font-bold tracking-wider text-sm font-mono">TENSOR.OS</span>
        </div>
        
        <div className="pointer-events-auto hidden md:flex items-center gap-8 text-sm font-medium text-gray-400 backdrop-blur-md bg-black/10 px-6 py-2 rounded-full border border-white/10">
          <a href="#" className="hover:text-cyan-400 transition-colors">Platform</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Solutions</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Research</a>
          <div className="w-px h-4 bg-white/20"></div>
          <a href="#" className="text-white hover:text-cyan-300 transition-colors">Login</a>
        </div>
      </nav>

      {/* 3. Main Content - z-10 to sit above canvas */}
      <main className="relative z-10">
        <Hero />
      </main>

      {/* 4. Interactive Elements - z-50 for modal priority */}
      <TerminalChat />
      
      {/* 5. Footer Overlay - z-10 */}
      <footer className="fixed bottom-0 left-0 w-full p-6 z-10 flex justify-between items-end pointer-events-none">
         <div className="text-[10px] text-gray-500 font-mono backdrop-blur-sm p-1 rounded">
            RENDER_ENGINE: WEBGL2<br/>
            STATUS: NOMINAL
         </div>
      </footer>
    </div>
  );
}

export default App;