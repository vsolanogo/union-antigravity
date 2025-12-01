import React, { useState, useEffect } from 'react';
import { ButtonVariant, DivineResponse } from './types';
import { fetchDivineWisdom } from './services/geminiService';
import DivineButton from './components/DivineButton';
import { Sparkles, Heart, Volume2 } from 'lucide-react';
import { initAudio } from './hooks/useDivineAudio';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<DivineResponse | null>(null);
  const [activeVariant, setActiveVariant] = useState<ButtonVariant | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);

  // Initialize audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      setAudioStarted(true);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const handleDivineRequest = async (variant: ButtonVariant) => {
    setLoading(true);
    setActiveVariant(variant);
    setResponse(null);
    try {
      const data = await fetchDivineWisdom(variant);
      setResponse(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 selection:bg-amber-500/30 overflow-hidden relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-950/30 blur-[150px] rounded-full pointer-events-none" />
      
      <main className="relative z-10 w-full max-w-7xl flex flex-col items-center gap-8 md:gap-16 my-8">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl md:text-8xl font-bold bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,215,0,0.4)] animate-pulse-slow">
            Lumina Fidei
          </h1>
          <p className="text-slate-400 font-light tracking-[0.3em] text-sm uppercase opacity-70">
            Interactive Divine Intelligence
          </p>
        </header>

        {/* The Duality of Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full min-h-[50vh] place-items-stretch">
          
          <div className="flex flex-col items-center gap-6 group w-full h-full">
            <DivineButton 
              label="The Light" 
              variant={ButtonVariant.HALO} 
              onClick={() => handleDivineRequest(ButtonVariant.HALO)}
              isLoading={loading && activeVariant === ButtonVariant.HALO}
            />
             <div className="flex items-center gap-2 text-amber-400/60 uppercase tracking-widest text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                <Sparkles size={14} />
                <span>Seek Illumination</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 group w-full h-full">
            <DivineButton 
              label="The Passion" 
              variant={ButtonVariant.PASSION} 
              onClick={() => handleDivineRequest(ButtonVariant.PASSION)}
              isLoading={loading && activeVariant === ButtonVariant.PASSION}
            />
            <div className="flex items-center gap-2 text-red-400/60 uppercase tracking-widest text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                <Heart size={14} />
                <span>Reflect on Sacrifice</span>
            </div>
          </div>

        </div>

        {/* Dynamic Content Display Area */}
        <div className="w-full max-w-4xl min-h-[200px] mt-4">
            {response && (
                <div className="relative p-10 md:p-16 border border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl animate-fade-in-up">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <blockquote className="divine-font text-3xl md:text-5xl text-center leading-tight text-amber-50 mb-10 relative">
                        <span className="text-8xl absolute -top-8 -left-4 text-white/5 font-sans">“</span>
                        {response.verse}
                        <span className="text-8xl absolute -bottom-12 -right-4 text-white/5 font-sans">”</span>
                    </blockquote>
                    <div className="w-24 h-px bg-white/20 mx-auto mb-10"></div>
                    <p className="text-slate-300 text-center font-light leading-8 text-lg md:text-xl max-w-2xl mx-auto">
                        {response.interpretation}
                    </p>
                </div>
            )}
            
            {!response && !loading && (
                <div className="text-center text-slate-700 font-light italic opacity-30 text-sm tracking-widest uppercase">
                    Choose your path
                </div>
            )}
        </div>

      </main>

      <footer className="fixed bottom-4 text-slate-800 text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 pointer-events-none">
        <span>Gemini 2.5 • WebGL</span>
        {audioStarted && (
            <span className="flex items-center gap-1 opacity-50">
                <Volume2 size={10} /> Audio Active
            </span>
        )}
      </footer>
    </div>
  );
};

export default App;