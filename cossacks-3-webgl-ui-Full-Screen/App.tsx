
import React from 'react';
import { ButtonProvider } from './context/ButtonContext';
import { SoundProvider, useSoundContext } from './context/SoundContext';
import { WebGLOverlay } from './components/WebGLEffects';
import { CossackButton } from './components/CossackButton';
import { EffectStyle } from './types';
import { Sword, Flame, Telescope, Volume2, VolumeX, Crown } from 'lucide-react';

const MuteToggle = () => {
  const { isMuted, toggleMute } = useSoundContext();
  return (
    <button 
      onClick={toggleMute}
      className="fixed bottom-6 right-6 z-50 p-4 text-amber-500/80 hover:text-amber-300 border border-amber-500/30 rounded-full hover:bg-amber-900/40 transition-all backdrop-blur-sm bg-black/40"
      title={isMuted ? "Unmute Audio" : "Mute Audio"}
    >
      {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
    </button>
  );
};

const AppContent = () => {
  return (
    <div className="relative w-full h-screen bg-[#020202] text-amber-50 overflow-hidden font-playfair selection:bg-amber-500/30 flex flex-col">
      
      <MuteToggle />

      {/* Cinematic Background - Darkened for high contrast */}
      <div 
        className="absolute inset-0 z-[-1] opacity-20 bg-cover bg-center mix-blend-screen saturate-0 contrast-125"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1533109721025-d1ae7ee7c1e1?q=80&w=2600&auto=format&fit=crop)' }}
      />
      <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-black/80 via-[#0a0500]/90 to-black/80 pointer-events-none" />
      
      {/* WebGL Layer - Renders the effects */}
      <WebGLOverlay />

      {/* Header Overlay - Absolute to not consume layout space */}
      <header className="absolute top-0 left-0 w-full z-20 pt-8 pb-4 flex flex-col items-center pointer-events-none">
          <div className="flex items-center justify-center gap-4 opacity-50 mb-2">
             <div className="h-[1px] w-12 bg-amber-500/80"></div>
             <Crown className="w-5 h-5 text-amber-500" />
             <div className="h-[1px] w-12 bg-amber-500/80"></div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-[0.1em] font-cinzel">
            COSSACKS III
          </h1>
      </header>

      {/* Main Container - 3 Massive Columns */}
      <div className="ui-layer relative z-10 w-full h-full flex flex-col lg:flex-row items-stretch justify-center p-4 md:p-8 lg:p-12 gap-4 md:gap-8 pt-24 lg:pt-12">
        
        {/* Column 1: HUSSARS (Imperial Gold) */}
        <div className="flex-1 flex flex-col h-full min-h-[30vh]">
          <CossackButton 
            label="Hussars" 
            subtext="Legendary Polish Winged Cavalry • 17th Century"
            effect={EffectStyle.GOLDEN_FLAME}
            icon={<Sword className="w-full h-full" strokeWidth={1.5} />}
            className="w-full h-full"
          />
        </div>

        {/* Column 2: SCORCHED EARTH (Battle Mist) */}
        <div className="flex-1 flex flex-col h-full min-h-[30vh]">
          <CossackButton 
            label="Scorched Earth" 
            subtext="Deny resources to the enemy • Total Destruction"
            effect={EffectStyle.BATTLE_MIST}
            icon={<Flame className="w-full h-full animate-pulse" strokeWidth={1.5} />}
            className="w-full h-full"
          />
        </div>

        {/* Column 3: BALLISTICS (Royal Academy) */}
        <div className="flex-1 flex flex-col h-full min-h-[30vh]">
          <CossackButton 
            label="Ballistics" 
            subtext="Advanced Mathematics for Artillery Precision"
            effect={EffectStyle.NEON_PULSE}
            icon={<Telescope className="w-full h-full" strokeWidth={1.5} />}
            className="w-full h-full"
          />
        </div>

      </div>

      {/* Subtle Footer */}
      <footer className="absolute bottom-4 left-0 w-full text-center text-white/10 text-[10px] uppercase tracking-[0.3em] pointer-events-none">
        Tactical Interface v3.0
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <SoundProvider>
      <ButtonProvider>
        <AppContent />
      </ButtonProvider>
    </SoundProvider>
  );
}
