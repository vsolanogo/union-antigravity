
import React, { useState } from 'react';
import { SceneContainer } from './components/Layout/SceneContainer';
import { CosmicButton } from './components/UI/CosmicButton';
import { GalaxyTheme, CosmicFact } from './types';
import { getCosmicFact } from './services/geminiService';
import { audioManager } from './services/audioService';

const App: React.FC = () => {
  const [factData, setFactData] = useState<CosmicFact | null>(null);
  const [loading, setLoading] = useState(false);

  const handleButtonClick = async (theme: GalaxyTheme, topic: string) => {
    // Ensure audio context is running on first click
    audioManager.init();
    
    setLoading(true);
    setFactData(null); 
    
    // Simulate network delay for effect if API is too fast
    await new Promise(r => setTimeout(r, 800));
    
    const data = await getCosmicFact(topic);
    
    setFactData(data);
    setLoading(false);
    audioManager.playSuccess();
  };

  return (
    <SceneContainer>
      {/* Top HUD Line */}
      <div className="fixed top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent z-20" />
      <div className="fixed top-4 left-4 text-[10px] text-blue-500/40 font-mono tracking-widest z-20 pointer-events-none">
         SYS.STATUS: ONLINE <br/>
         MODE: DUAL_CORE
      </div>

      <header className="fixed top-8 w-full text-center z-10 pointer-events-none mix-blend-overlay">
        <h1 className="text-4xl font-black text-white/20 tracking-[1em] uppercase">
            Event Horizon
        </h1>
      </header>

      {/* Main Layout: Split Screen */}
      <main className="flex-grow w-full h-screen p-4 md:p-8 pt-24 pb-32 flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
        
        {/* Left/Top Panel: Black Hole */}
        <div className="flex-1 w-full h-full min-h-[300px]">
          <CosmicButton 
            theme={GalaxyTheme.BLACK_HOLE} 
            label="Singularity" 
            onClick={() => handleButtonClick(GalaxyTheme.BLACK_HOLE, "Supermassive Black Holes")} 
            disabled={loading}
          />
        </div>

        {/* Right/Bottom Panel: Nebula */}
        <div className="flex-1 w-full h-full min-h-[300px]">
          <CosmicButton 
            theme={GalaxyTheme.NEBULA} 
            label="Nebula Cloud" 
            onClick={() => handleButtonClick(GalaxyTheme.NEBULA, "Planetary Nebulae")} 
            disabled={loading}
          />
        </div>
      </main>

      {/* Bottom Fact Display Area */}
      <div className="fixed bottom-0 w-full h-28 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex items-center justify-center pointer-events-none">
         <div className="relative w-full max-w-4xl px-8 text-center">
             
             {/* Loading State */}
             {loading && (
               <div className="flex flex-col items-center animate-pulse">
                  <div className="text-blue-400 font-mono text-xs tracking-[0.5em] mb-1">DECRYPTING SIGNAL...</div>
                  <div className="h-0.5 w-32 bg-blue-500/50"></div>
               </div>
             )}

             {/* Fact Display */}
             {factData && !loading && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-[10px] text-blue-400 font-mono uppercase tracking-[0.2em] mb-1">
                    Incoming Transmission: {factData.topic}
                  </div>
                  <p className="text-lg md:text-xl font-light text-white leading-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    "{factData.fact}"
                  </p>
               </div>
             )}
             
             {/* Idle State */}
             {!factData && !loading && (
                <div className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">
                    Awaiting Target Selection
                </div>
             )}
         </div>
      </div>

    </SceneContainer>
  );
};

export default App;
