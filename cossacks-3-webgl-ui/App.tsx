
import React from 'react';
import { ButtonProvider } from './context/ButtonContext';
import { SoundProvider, useSoundContext } from './context/SoundContext';
import { WebGLOverlay } from './components/WebGLEffects';
import { CossackButton } from './components/CossackButton';
import { EffectStyle } from './types';
import { Sword, Scroll, Shield, FlaskConical, Telescope, Flame, Crown, Crosshair, Anchor, Volume2, VolumeX } from 'lucide-react';

const MuteToggle = () => {
  const { isMuted, toggleMute } = useSoundContext();
  return (
    <button 
      onClick={toggleMute}
      className="fixed top-6 right-6 z-50 p-3 text-amber-500/80 hover:text-amber-300 border border-amber-500/30 rounded-full hover:bg-amber-900/40 transition-all backdrop-blur-sm"
      title={isMuted ? "Unmute Audio" : "Mute Audio"}
    >
      {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
    </button>
  );
};

const AppContent = () => {
  return (
    <div className="relative w-full min-h-screen bg-[#020202] text-amber-50 overflow-hidden font-playfair selection:bg-amber-500/30">
      
      <MuteToggle />

      {/* Cinematic Background */}
      <div 
        className="absolute inset-0 z-[-1] opacity-30 bg-cover bg-center mix-blend-screen saturate-0 contrast-125"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1533109721025-d1ae7ee7c1e1?q=80&w=2600&auto=format&fit=crop)' }}
      />
      <div className="absolute inset-0 z-[-1] bg-gradient-to-t from-black via-[#0a0500]/90 to-black pointer-events-none" />
      
      {/* Vignette */}
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* WebGL Layer - Renders the effects */}
      <WebGLOverlay />

      {/* Main UI Container */}
      <div className="ui-layer relative z-10 flex flex-col items-center min-h-screen p-6 md:p-12 gap-16">
        
        {/* Header */}
        <header className="text-center relative mt-12 mb-8 group cursor-default">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-amber-600/20 blur-[60px] rounded-full pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
          
          <div className="flex items-center justify-center gap-6 mb-4 opacity-70">
             <div className="h-[1px] w-16 md:w-32 bg-gradient-to-r from-transparent to-amber-500/80"></div>
             <Crown className="w-8 h-8 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
             <div className="h-[1px] w-16 md:w-32 bg-gradient-to-l from-transparent to-amber-500/80"></div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-700 drop-shadow-[0_5px_15px_rgba(0,0,0,1)] tracking-tight font-cinzel">
            COSSACKS III
          </h1>
          <p className="text-xl text-amber-200/50 font-serif italic tracking-[0.3em] mt-4 uppercase">
            Imperial War Room
          </p>
        </header>

        {/* Buttons Grid */}
        <div className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-3 gap-12 xl:gap-8 items-start justify-items-center">
          
          {/* Faction: IMPERIAL (Gold) */}
          <div className="flex flex-col gap-6 w-full max-w-md">
            <div className="flex flex-col items-center mb-4">
               <h2 className="text-amber-500 font-bold tracking-[0.4em] text-sm uppercase font-cinzel mb-2">Imperial Decrees</h2>
               <div className="w-24 h-[2px] bg-amber-500/50"></div>
            </div>
            
            <CossackButton 
              label="Hussars" 
              subtext="Light Cavalry • 45 Gold"
              effect={EffectStyle.GOLDEN_FLAME}
              icon={<Sword className="w-6 h-6" />}
            />
             <CossackButton 
              label="War Tax" 
              subtext="Economy Boost • +20%"
              effect={EffectStyle.GOLDEN_FLAME}
              icon={<Scroll className="w-6 h-6" />}
            />
             <CossackButton 
              label="Royal Guard" 
              subtext="Elite Infantry • 120 Gold"
              effect={EffectStyle.GOLDEN_FLAME}
              icon={<Shield className="w-6 h-6" />}
            />
          </div>

          {/* Faction: CHAOS (Mist) - Center Column */}
          <div className="flex flex-col gap-10 w-full max-w-md xl:pt-12 order-first xl:order-none">
            <div className="flex flex-col items-center mb-2">
               <h2 className="text-red-500 font-bold tracking-[0.4em] text-sm uppercase font-cinzel mb-2">Battlefield Tactics</h2>
               <div className="w-32 h-[2px] bg-red-500/50 box-shadow-[0_0_10px_red]"></div>
            </div>

            <div className="transform scale-110 origin-center">
              <CossackButton 
                label="Scorched Earth" 
                subtext="Annihilate Region"
                effect={EffectStyle.BATTLE_MIST}
                style={{ height: '180px' }} 
                icon={<Flame className="w-12 h-12 text-red-200 animate-pulse" />}
              />
            </div>

             <CossackButton 
              label="Bombardment" 
              subtext="Siege Damage"
              effect={EffectStyle.BATTLE_MIST}
              icon={<Crosshair className="w-6 h-6 text-red-200" />}
            />
          </div>

          {/* Faction: ACADEMY (Blueprint/Star Chart) */}
          <div className="flex flex-col gap-6 w-full max-w-md">
             <div className="flex flex-col items-center mb-4">
               <h2 className="text-blue-400 font-bold tracking-[0.4em] text-sm uppercase font-cinzel mb-2">Royal Academy</h2>
               <div className="w-24 h-[2px] bg-blue-500/50"></div>
            </div>

            <CossackButton 
              label="Ballistics" 
              subtext="Accuracy +15%"
              effect={EffectStyle.NEON_PULSE}
              icon={<Telescope className="w-6 h-6" />}
            />
             <CossackButton 
              label="Chemistry" 
              subtext="Gunpowder Efficiency"
              effect={EffectStyle.NEON_PULSE}
              icon={<FlaskConical className="w-6 h-6" />}
            />
            <CossackButton 
              label="Naval Tech" 
              subtext="Ship Speed +10%"
              effect={EffectStyle.NEON_PULSE}
              icon={<Anchor className="w-6 h-6" />}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-12 pb-6 text-white/20 text-xs font-serif tracking-[0.2em] uppercase flex items-center gap-4">
          <div className="h-[1px] w-8 bg-white/10"></div>
          <span>Cossacks III WebGL Interface • v3.0 • React Three Fiber</span>
          <div className="h-[1px] w-8 bg-white/10"></div>
        </footer>
      </div>
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
