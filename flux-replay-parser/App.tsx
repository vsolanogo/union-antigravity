import React, { useState } from 'react';
import { ShaderBackground } from './components/ShaderBackground';
import { ReplayInterface } from './components/ReplayInterface';
import { ParseStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<ParseStatus>(ParseStatus.IDLE);

  return (
    <div className="relative w-full h-full text-white font-sans selection:bg-neon-cyan selection:text-black">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <ShaderBackground intensity={status === ParseStatus.ANALYZING ? 2.0 : 1.0} />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-8 py-6 border-b border-glassBorder bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded flex items-center justify-center font-bold text-black">
              F
            </div>
            <h1 className="text-xl font-bold tracking-widest uppercase text-white/90">
              Flux <span className="text-neon-cyan">Parser</span>
            </h1>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono text-white/50">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === ParseStatus.ANALYZING ? 'bg-neon-purple animate-pulse' : 'bg-green-500'}`}></span>
              SYSTEM ONLINE
            </span>
            <span>V.2.4.0-BETA</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto w-full h-full">
             <ReplayInterface status={status} setStatus={setStatus} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;