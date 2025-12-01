import React, { useState, useEffect } from 'react';
import { Button3D } from './components/Button3D';
import { WebGLEffect } from './types';
import { askTheLog } from './services/geminiService';
import { SceneBackground } from './components/SceneBackground';
import { TvOverlay } from './components/TvOverlay';

// Typewriter Hook
const useTypewriter = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return displayText;
};

type ViewState = 'MENU' | 'RED_ROOM' | 'INVESTIGATION' | 'ELECTRICITY' | 'FIRE_WALK';

const App = () => {
  const [currentView, setCurrentView] = useState<ViewState>('MENU');
  
  // Log Logic
  const [logResponse, setLogResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const typedLogResponse = useTypewriter(logResponse || "The wood holds many spirits...", 30);

  const handleAskLog = async () => {
    setIsLoading(true);
    setLogResponse("..."); 
    try {
        const answer = await askTheLog("Guide me.");
        setLogResponse(answer);
    } catch (e) {
        setLogResponse("The owls are silent.");
    } finally {
        setIsLoading(false);
    }
  };

  const goBack = () => {
      setCurrentView('MENU');
      setLogResponse("");
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden font-serif">
      
      {/* 1. Global Effects Layer */}
      <TvOverlay />
      <SceneBackground />

      {/* 2. UI Layer */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        
        {/* Top Area - Reserved for "The Arm" visualization */}
        <div className="h-[25vh] w-full flex items-start justify-center pt-8 pointer-events-auto">
            <h1 className="text-4xl md:text-5xl font-serif italic text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-black drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] opacity-80"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              {currentView === 'MENU' ? "The Black Lodge" : 
               currentView === 'RED_ROOM' ? "The Waiting Room" : 
               currentView === 'INVESTIGATION' ? "Blue Rose Case" : ""}
            </h1>
        </div>

        {/* Main Interaction Area */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 pb-8 flex flex-col justify-end pointer-events-auto">
          
          {/* VIEW: MENU (4 Large Buttons) */}
          {currentView === 'MENU' && (
              <div className="w-full flex flex-col gap-6 animate-fade-in-up">
                  <Button3D 
                      label="Enter Red Room" 
                      effect={WebGLEffect.RED_ROOM} 
                      onClick={() => setCurrentView('RED_ROOM')}
                      className="w-full h-[14vh]"
                  />
                  <Button3D 
                      label="Investigation" 
                      effect={WebGLEffect.ZIG_ZAG} 
                      onClick={() => setCurrentView('INVESTIGATION')}
                      className="w-full h-[14vh]"
                  />
                  <Button3D 
                      label="Electricity" 
                      effect={WebGLEffect.ELECTRICITY} 
                      onClick={() => setCurrentView('ELECTRICITY')}
                      className="w-full h-[14vh]"
                  />
                   <Button3D 
                      label="Fire Walk With Me" 
                      effect={WebGLEffect.FIRE_WALK} 
                      onClick={() => setCurrentView('FIRE_WALK')}
                      className="w-full h-[14vh]"
                  />
              </div>
          )}

          {/* VIEW: RED ROOM (Log Lady) */}
          {currentView === 'RED_ROOM' && (
              <div className="flex flex-col items-center justify-center animate-fade-in bg-black/60 backdrop-blur-md p-10 border border-red-900/30 rounded-lg shadow-2xl h-[60vh]">
                  <div className="mb-6 relative">
                       <div className={`absolute inset-0 bg-red-600 blur-3xl rounded-full transition-opacity duration-1000 ${isLoading ? 'opacity-30' : 'opacity-0'}`}></div>
                       <div className="text-6xl grayscale opacity-80">🪵</div>
                  </div>
                  
                  <div className="w-full max-w-2xl min-h-[100px] text-center mb-8">
                       <p className="text-2xl md:text-3xl font-mono text-red-100 leading-relaxed drop-shadow-md">
                           "{typedLogResponse}"
                       </p>
                  </div>

                  <div className="flex gap-6 w-full max-w-md">
                      <Button3D 
                          label="Consult Log"
                          effect={WebGLEffect.RED_ROOM}
                          onClick={handleAskLog}
                          disabled={isLoading}
                          className="flex-1 h-20"
                      />
                      <Button3D 
                          label="Leave"
                          effect={WebGLEffect.ZIG_ZAG}
                          onClick={goBack}
                          className="flex-1 h-20 opacity-80"
                      />
                  </div>
              </div>
          )}

          {/* VIEW: INVESTIGATION */}
          {currentView === 'INVESTIGATION' && (
              <div className="flex flex-col items-center justify-center animate-fade-in bg-blue-950/40 backdrop-blur-md p-10 border border-blue-500/30 rounded-lg h-[60vh]">
                   <h2 className="text-3xl text-blue-200 mb-8 font-bold tracking-widest border-b border-blue-500/50 pb-2">EVIDENCE #892</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl text-blue-100/80 font-mono">
                       <div className="p-4 border border-blue-500/20 bg-black/40">
                          <p className="text-xs text-blue-400 mb-2">SUBJECT</p>
                          <p className="text-xl">LAURA PALMER</p>
                          <p className="mt-4 text-sm opacity-60">Found wrapped in plastic. The diary is missing pages.</p>
                       </div>
                       <div className="p-4 border border-blue-500/20 bg-black/40">
                          <p className="text-xs text-blue-400 mb-2">AGENT</p>
                          <p className="text-xl">DALE COOPER</p>
                          <p className="mt-4 text-sm opacity-60">Last seen entering the Glastonbury Grove.</p>
                       </div>
                   </div>
                   <div className="mt-12 w-full max-w-md">
                        <Button3D 
                          label="Close File"
                          effect={WebGLEffect.ZIG_ZAG}
                          onClick={goBack}
                          className="w-full h-20"
                      />
                   </div>
              </div>
          )}

          {/* VIEW: ELECTRICITY */}
          {currentView === 'ELECTRICITY' && (
               <div className="flex flex-col items-center justify-center animate-fade-in h-[60vh] text-center">
                   <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 tracking-tighter animate-pulse drop-shadow-[0_0_20px_rgba(100,200,255,0.8)]">
                       ELECTRICITY
                   </h2>
                   <p className="mt-4 text-blue-200 font-mono tracking-widest">INTERCOURSE BETWEEN THE TWO WORLDS</p>
                   <div className="mt-16 w-64">
                       <Button3D label="Return" effect={WebGLEffect.ELECTRICITY} onClick={goBack} className="h-20" />
                   </div>
               </div>
          )}

          {/* VIEW: FIRE WALK */}
          {currentView === 'FIRE_WALK' && (
               <div className="flex flex-col items-center justify-center animate-fade-in h-[60vh] text-center bg-orange-950/20 backdrop-blur-sm rounded-lg border border-orange-500/20">
                   <p className="text-4xl italic text-orange-500 font-serif mb-4">"Through the darkness of future past..."</p>
                   <p className="text-2xl italic text-orange-400 font-serif mb-12">"...the magician longs to see."</p>
                   <div className="w-64">
                       <Button3D label="Wake Up" effect={WebGLEffect.FIRE_WALK} onClick={goBack} className="h-20" />
                   </div>
               </div>
          )}

        </main>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default App;