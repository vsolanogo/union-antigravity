import React, { useState } from 'react';
import { WebGLButton } from './components/WebGLButton';
import { ButtonEffectType } from './types';
import { fetchHawaiiQuote } from './services/geminiService';
import { AudioManager } from './components/AudioManager';

const App: React.FC = () => {
  const [quote, setQuote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generic handler to fetch distinct quotes
  const handleAction = async (effect: ButtonEffectType) => {
    if (loading) return;
    setLoading(true);
    
    // Fetch thematic quote
    const newQuote = await fetchHawaiiQuote(effect);
    setQuote(newQuote);
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white relative font-sans">
      
      {/* Cinematic Vignette Overlay (Grain Removed) */}
      <div className="absolute inset-0 pointer-events-none z-[60] bg-radial-gradient-vignette opacity-60" />

      {/* Audio Engine (Headless) */}
      <AudioManager />

      {/* Overlay: Header / Branding (Floating on top) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none mix-blend-difference">
        <h1 className="text-3xl md:text-4xl font-hawaii text-white tracking-wider opacity-80 text-center drop-shadow-lg">
          Neon Aloha
        </h1>
      </div>

      {/* Main Grid Layout: 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-4 md:grid-rows-2 h-full w-full">
        
        {/* Quadrant 1: Surf's Up (Waikiki) - Top Left */}
        <div className="relative border-r border-b border-white/10 overflow-hidden">
          <WebGLButton 
            label="Surf's Up" 
            effect={ButtonEffectType.WAIKIKI_WAVE}
            onClick={() => handleAction(ButtonEffectType.WAIKIKI_WAVE)}
            disabled={loading}
          />
        </div>

        {/* Quadrant 2: Erupt (Volcano) - Top Right */}
        <div className="relative border-b border-white/10 overflow-hidden">
          <WebGLButton 
            label="Erupt" 
            effect={ButtonEffectType.VOLCANO_MAGMA}
            onClick={() => handleAction(ButtonEffectType.VOLCANO_MAGMA)}
            disabled={loading}
          />
        </div>

        {/* Quadrant 3: Ignite (Tiki) - Bottom Left */}
        <div className="relative border-r border-white/10 overflow-hidden">
          <WebGLButton 
            label="Ignite" 
            effect={ButtonEffectType.TIKI_TORCH}
            onClick={() => handleAction(ButtonEffectType.TIKI_TORCH)}
            disabled={loading}
          />
        </div>

        {/* Quadrant 4: Explore (Jungle) - Bottom Right */}
        <div className="relative overflow-hidden">
          <WebGLButton 
            label="Explore" 
            effect={ButtonEffectType.JUNGLE_MIST}
            onClick={() => handleAction(ButtonEffectType.JUNGLE_MIST)}
            disabled={loading}
          />
        </div>

      </div>

      {/* Overlay: Quote Modal */}
      {quote && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setQuote(null)}>
          <div className="max-w-2xl bg-slate-900/90 border border-white/20 p-12 rounded-3xl shadow-2xl transform transition-all scale-100 text-center relative overflow-hidden group cursor-pointer hover:scale-[1.02]">
            {/* Modal Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />
            
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300 mb-6 font-bold opacity-80">Island Wisdom</p>
            <h3 className="text-3xl md:text-5xl font-hawaii leading-tight text-white drop-shadow-md">
              "{quote}"
            </h3>
            <p className="text-slate-400 text-sm mt-8 animate-pulse tracking-widest uppercase text-[10px]">Tap to return</p>
          </div>
        </div>
      )}
      
      {/* Tailwind Custom Utility for Vignette */}
      <style>{`
        .bg-radial-gradient-vignette {
          background: radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%);
        }
      `}</style>
    </div>
  );
};

export default App;