import React, { useState } from 'react';
import { Button3D } from './components/Button3D';
import { WebGLEffect } from './types';
import { askTheLog } from './services/geminiService';
import { SceneBackground } from './components/SceneBackground';
import { TvOverlay } from './components/TvOverlay';

const App = () => {
  const [logResponse, setLogResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'LODGE' | 'PALMER'>('LODGE');

  const handleAskLog = async () => {
    setIsLoading(true);
    setLogResponse("Thinking...");
    try {
        const answer = await askTheLog("Guide me.");
        setLogResponse(answer);
    } catch (e) {
        setLogResponse("The owls are silent.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden font-serif">
      
      {/* 1. Global Effects Layer */}
      <TvOverlay />
      <SceneBackground />

      {/* 2. UI Layer - floating above the 3D room */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        
        {/* Header */}
        <header className="pt-16 pb-8 text-center pointer-events-auto">
          <h1 className="text-6xl md:text-8xl font-serif italic text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            The Black Lodge
          </h1>
          <div className="mt-4 flex justify-center items-center gap-4">
             <div className="h-[1px] w-12 bg-red-800"></div>
             <p className="text-red-400/60 text-xs tracking-[0.4em] uppercase">
               Waiting Room Interface v3.0
             </p>
             <div className="h-[1px] w-12 bg-red-800"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Left: Navigation Menu */}
          <div className="md:col-span-5 flex flex-col items-end gap-8 pointer-events-auto order-2 md:order-1">
              
              <div className="space-y-8 w-full flex flex-col items-center md:items-end">
                  <Button3D 
                      label="Enter Red Room" 
                      effect={WebGLEffect.RED_ROOM} 
                      onClick={() => setCurrentView('LODGE')}
                      className="w-72 scale-100 hover:scale-105 transition-transform"
                  />
                  
                  <Button3D 
                      label="Investigation" 
                      effect={WebGLEffect.ZIG_ZAG} 
                      onClick={() => setCurrentView('PALMER')}
                      className="w-72 scale-100 hover:scale-105 transition-transform"
                  />

                  <Button3D 
                      label="Electricity" 
                      effect={WebGLEffect.ELECTRICITY} 
                      onClick={() => console.log("Garmonbozia consumed")}
                      className="w-72 scale-100 hover:scale-105 transition-transform"
                  />

                   <Button3D 
                      label="Fire Walk With Me" 
                      effect={WebGLEffect.FIRE_WALK} 
                      onClick={() => alert("Do not take the ring.")}
                      className="w-72 scale-100 hover:scale-105 transition-transform"
                  />
              </div>
          </div>

          {/* Right: Interactive Zone */}
          <div className="md:col-span-7 flex justify-center md:justify-start pointer-events-auto order-1 md:order-2">
              <div className="w-full max-w-lg min-h-[500px] backdrop-blur-md bg-black/40 border border-white/10 p-10 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                  
                  {/* Container Effects */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/5 to-transparent opacity-50"></div>
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>

                  {currentView === 'LODGE' && (
                      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center animate-fade-in">
                          <div className="mb-8 relative">
                              <div className={`absolute inset-0 bg-red-500 blur-2xl transition-opacity duration-1000 rounded-full ${isLoading ? 'opacity-40' : 'opacity-0'}`}></div>
                              <div className="w-40 h-40 rounded-full bg-[#1a1a1a] border-2 border-[#3a3a3a] shadow-2xl flex items-center justify-center relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                  {/* Abstract Log Representation */}
                                  <div className="w-24 h-64 bg-[#3d2b1f] rotate-12 absolute" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px)' }}></div>
                                  <span className="text-6xl relative z-10 drop-shadow-lg">🪵</span>
                              </div>
                          </div>
                          
                          <h2 className="text-3xl text-red-100 mb-2 font-light italic">The Oracle Log</h2>
                          
                          <div className="min-h-[100px] flex items-center justify-center px-8 mb-8">
                             <p className={`text-lg font-mono leading-relaxed transition-colors duration-500 ${isLoading ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
                                 "{logResponse || "I hold many secrets. Ask."}"
                             </p>
                          </div>

                          <Button3D 
                              label={isLoading ? "Listening..." : "Ask The Log"}
                              effect={WebGLEffect.RED_ROOM}
                              onClick={handleAskLog}
                              disabled={isLoading}
                              className="w-60"
                          />
                      </div>
                  )}

                  {currentView === 'PALMER' && (
                      <div className="relative z-10 h-full flex flex-col animate-fade-in">
                          <div className="border-b border-blue-500/30 pb-4 mb-6 flex justify-between items-center">
                              <h2 className="text-2xl font-serif text-blue-100">Case File #88-209</h2>
                              <span className="text-xs font-mono text-blue-400 border border-blue-500/50 px-2 py-1 rounded">TOP SECRET</span>
                          </div>
                          
                          <div className="space-y-6 font-mono text-sm text-blue-200/80 flex-1">
                              <div className="flex gap-4 p-4 bg-blue-900/10 rounded border border-blue-500/10">
                                  <div className="w-24 h-24 bg-black border border-blue-500/20 flex items-center justify-center shrink-0">
                                      <span className="text-4xl opacity-50">?</span>
                                  </div>
                                  <div className="space-y-2">
                                      <p><span className="text-blue-500">NAME:</span> COOPER, DALE</p>
                                      <p><span className="text-blue-500">AFFILIATION:</span> FBI</p>
                                      <p><span className="text-blue-500">STATUS:</span> MISSING IN ACTION</p>
                                  </div>
                              </div>

                              <div className="p-4 bg-red-900/10 rounded border border-red-500/10 text-red-200/80">
                                  <p className="mb-2 font-bold text-red-500">LATEST TRANSMISSION:</p>
                                  <p className="italic">"How's Annie? How's Annie? How's Annie?"</p>
                              </div>

                              <div className="h-32 border border-dashed border-white/10 flex items-center justify-center text-center p-4 text-xs text-gray-500">
                                  [EVIDENCE IMAGE REDACTED DUE TO PARANORMAL INTERFERENCE]
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>

        </main>

        <footer className="py-6 text-center text-red-900/40 text-[10px] uppercase tracking-widest pointer-events-auto">
           <p>Manufactured for a purpose • Directed by The Engineer</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
