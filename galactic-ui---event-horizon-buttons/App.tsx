
import React, { useState, useEffect } from 'react';
import { SceneContainer } from './components/Layout/SceneContainer';
import { CosmicButton } from './components/UI/CosmicButton';
import { GalaxyTheme, CosmicFact } from './types';
import { getCosmicFact } from './services/geminiService';
import { audioManager } from './services/audioService';

const App: React.FC = () => {
  const [factData, setFactData] = useState<CosmicFact | null>(null);
  const [loading, setLoading] = useState(false);
  const [systemReady, setSystemReady] = useState(false);

  // Initialize audio on first user click to satisfy browser autoplay policies
  const handleSystemInit = () => {
    audioManager.init();
    audioManager.playClick();
    setSystemReady(true);
  };

  const handleButtonClick = async (theme: GalaxyTheme, topic: string) => {
    setLoading(true);
    setFactData(null); 
    
    // Simulate network delay for effect if API is too fast
    await new Promise(r => setTimeout(r, 800));
    
    const data = await getCosmicFact(topic);
    
    setFactData(data);
    setLoading(false);
    audioManager.playSuccess();
  };

  if (!systemReady) {
      return (
          <div className="w-full h-screen bg-black flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
             <button 
                onClick={handleSystemInit}
                className="z-10 group relative px-8 py-4 bg-transparent border border-blue-500/50 text-blue-400 font-mono tracking-[0.3em] hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 transition-all duration-300"
             >
                <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-blue-500"></span>
                <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-blue-500"></span>
                INITIALIZE SYSTEM
             </button>
          </div>
      );
  }

  return (
    <SceneContainer>
      {/* Top HUD Line */}
      <div className="fixed top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent z-20" />
      <div className="fixed top-4 left-4 text-[10px] text-blue-500/40 font-mono tracking-widest z-20">
         SYS.STATUS: ONLINE <br/>
         AUDIO: ENABLED
      </div>

      <header className="w-full pt-16 pb-8 text-center z-10 relative pointer-events-none">
        <div className="inline-block relative">
            <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800 tracking-tighter mix-blend-overlay opacity-90">
            EVENT HORIZON
            </h1>
            <p className="absolute -bottom-4 right-2 text-blue-400 font-mono text-xs tracking-[0.8em] uppercase bg-black/80 px-4 py-1 border-l border-r border-blue-500/30">
                Interactive Terminal
            </p>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row items-center justify-center gap-20 p-4 md:p-12 relative z-10">
        
        {/* Navigation / Control Panel */}
        <div className="flex flex-col gap-4 items-center perspective-1000">
          <div className="text-blue-500/50 text-[10px] font-mono mb-4 tracking-[0.3em] border-b border-blue-900/30 pb-2 w-full text-center">
             // SELECT TARGET
          </div>
          
          <CosmicButton 
            theme={GalaxyTheme.BLACK_HOLE} 
            label="Singularity" 
            onClick={() => handleButtonClick(GalaxyTheme.BLACK_HOLE, "Supermassive Black Holes")} 
            disabled={loading}
          />
          
          <CosmicButton 
            theme={GalaxyTheme.SUPERNOVA} 
            label="Hypernova" 
            onClick={() => handleButtonClick(GalaxyTheme.SUPERNOVA, "Supernova Explosions")} 
            disabled={loading}
          />

          <CosmicButton 
            theme={GalaxyTheme.NEBULA} 
            label="Nebula Cloud" 
            onClick={() => handleButtonClick(GalaxyTheme.NEBULA, "Planetary Nebulae")} 
            disabled={loading}
          />
        </div>

        {/* Data Display Panel */}
        <div className="w-full max-w-2xl min-h-[450px] relative group perspective-1000">
           
           {/* Glass Panel */}
           <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-md border border-white/5 rounded-xl shadow-[0_0_100px_rgba(0,100,255,0.1)] transition-all duration-500" />
           
           {/* Scan-line animation overlay */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />

           <div className="relative z-10 h-full p-12 flex flex-col items-center justify-center text-center">
             
             {/* Decorative HUD Markers */}
             <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-blue-500/30" />
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-blue-500/30" />
             <div className="absolute top-1/2 left-4 w-1 h-12 bg-blue-500/20" />
             <div className="absolute top-1/2 right-4 w-1 h-12 bg-blue-500/20" />

             {!factData && !loading && (
               <div className="text-gray-500 flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full border border-dashed border-gray-800 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                     <div className="w-24 h-24 border border-gray-800 rotate-45" />
                  </div>
                  <div className="space-y-2">
                     <p className="text-xl font-light tracking-widest uppercase text-gray-400">System Idle</p>
                     <p className="text-[10px] font-mono text-gray-600">Waiting for downlink...</p>
                  </div>
               </div>
             )}

             {loading && (
               <div className="flex flex-col items-center gap-8">
                  {/* Futuristic Loader */}
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                    <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-spin direction-reverse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-mono text-blue-300 animate-pulse">LOAD</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-blue-400 font-mono text-xs tracking-[0.2em] animate-pulse">ESTABLISHING UPLINK</p>
                    <p className="text-[10px] text-blue-500/40 font-mono">Decrypting Gemini Stream...</p>
                  </div>
               </div>
             )}

             {factData && !loading && (
               <div className="animate-in fade-in zoom-in-95 duration-500 w-full relative">
                  {/* Glow behind text */}
                  <div className="absolute -inset-10 bg-blue-500/5 blur-3xl -z-10 rounded-full" />
                  
                  <div className="mb-8 flex justify-center">
                     <span className="px-4 py-1 bg-blue-900/30 border border-blue-500/30 rounded text-blue-300 text-[10px] font-bold uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        {factData.topic}
                     </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-4xl font-light text-white leading-relaxed tracking-wide drop-shadow-2xl">
                    "{factData.fact}"
                  </h2>
                  
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-10 mb-6" />
                  
                  <div className="flex justify-between w-full text-[9px] text-gray-500 font-mono uppercase tracking-widest px-8">
                    <span>Signal Strength: 100%</span>
                    <span className="text-blue-400">Origin: Gemini-2.5-Flash</span>
                  </div>
               </div>
             )}
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-4 w-full text-center z-10 pointer-events-none opacity-50">
        <p className="text-[9px] text-blue-500/50 font-mono tracking-[0.5em]">GALACTIC UI // V2.0 // AUDIO ENABLED</p>
      </footer>
    </SceneContainer>
  );
};

export default App;
