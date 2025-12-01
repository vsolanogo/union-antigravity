
import React, { useState, useEffect } from 'react';
import { WebGLEffect, TechItem } from './types';
import WebGLButton from './components/WebGLButton';
import { fetchTechDescription, fetchTechAudio } from './services/geminiService';
import { audioEngine } from './services/audioEngine';
import { ArrowRight, Terminal as TerminalIcon, Grid, Activity, Volume2, VolumeX } from 'lucide-react';

// --- DATA ---
const TECH_ITEMS: TechItem[] = [
  { id: '1', name: 'Neural', effect: WebGLEffect.NEON_PULSE, shortDesc: 'Deep Learning' },
  { id: '2', name: 'Matrix', effect: WebGLEffect.MATRIX_DATA, shortDesc: 'Data Stream' },
  { id: '3', name: 'Liquid', effect: WebGLEffect.LIQUID_METAL, shortDesc: 'Fluid Dynamics' },
  { id: '4', name: 'Cyber', effect: WebGLEffect.CYBER_GRID, shortDesc: 'Virtual Space' },
  { id: '5', name: 'Plasma', effect: WebGLEffect.PLASMA_VOID, shortDesc: 'Energy Core' },
  { id: '6', name: 'Holo', effect: WebGLEffect.HOLO_INTERFERENCE, shortDesc: 'Optic Illusion' },
];

const Typewriter = ({ text, speed = 10, onComplete }: { text: string; speed?: number; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        onComplete && onComplete();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return <span>{displayedText}</span>;
};

const App: React.FC = () => {
  const [selectedTech, setSelectedTech] = useState<TechItem | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [streamActive, setStreamActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    audioEngine.setMute(newState);
    if (!newState) audioEngine.playHover(); // Feedback
  };

  const handleTechClick = async (tech: TechItem) => {
    if (loading) return;
    setSelectedTech(tech);
    setLoading(true);
    setAiResponse('');
    setStreamActive(false);
    
    // Simulate system latency
    setTimeout(async () => {
        try {
          const description = await fetchTechDescription(tech.name);
          setAiResponse(description);
          
          // Audio Success Chime on data load
          audioEngine.playSuccessChime();

          // Fetch TTS in background
          if (!isMuted) {
             fetchTechAudio(description).then((base64Audio) => {
                if (base64Audio) {
                    setIsPlayingAudio(true);
                    audioEngine.playPCM(base64Audio).then(() => {
                        setIsPlayingAudio(false);
                    });
                }
             });
          }

        } catch (e) {
          setAiResponse('Error retrieving data block.');
        } finally {
          setLoading(false);
        }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans overflow-x-hidden selection:bg-white selection:text-black">
      
      {/* Metro Header */}
      <header className="px-8 py-10 md:py-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-top-4 duration-700 flex justify-between items-end">
        <div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-2">
            Start<span className="font-bold">Menu</span>
            </h1>
            <div className="flex items-center gap-2 text-gray-400 text-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p>Interactive WebGL Modules</p>
            </div>
        </div>
        
        {/* Audio Toggle */}
        <button 
            onClick={toggleMute}
            className="group flex items-center gap-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-all rounded-sm border-l-4 border-gray-600 hover:border-blue-500"
        >
            <span className="text-sm font-semibold uppercase tracking-wider text-gray-300 group-hover:text-white">
                Audio System {isMuted ? 'OFF' : 'ON'}
            </span>
            {isMuted ? <VolumeX size={20} className="text-gray-400" /> : <Volume2 size={20} className="text-blue-400" />}
        </button>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 pb-20">
        
        {/* Metro Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* TILES CONTAINER */}
            <section className="lg:col-span-7 xl:col-span-8">
                <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase tracking-widest text-sm font-semibold">
                    <Grid size={16} />
                    <span>Applications</span>
                </div>
                
                {/* Masonry-like Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                    {TECH_ITEMS.map((tech) => (
                        <WebGLButton 
                            key={tech.id}
                            effect={tech.effect} 
                            label={tech.name} 
                            onClick={() => handleTechClick(tech)}
                            isSelected={selectedTech?.id === tech.id}
                        />
                    ))}
                    
                    {/* Filler Static Tiles for Metro Aesthetic */}
                    <div 
                        className="bg-blue-600 p-4 flex flex-col justify-between aspect-square group hover:bg-blue-500 transition-colors cursor-pointer"
                        onMouseEnter={() => audioEngine.playHover()}
                    >
                        <Activity className="text-white/50 w-12 h-12" />
                        <span className="font-light text-xl">System</span>
                    </div>
                    <div 
                        className="bg-purple-700 p-4 flex flex-col justify-between aspect-square group hover:bg-purple-600 transition-colors cursor-pointer md:col-span-2 aspect-[2/1]"
                        onMouseEnter={() => audioEngine.playHover()}
                    >
                         <div className="text-white/80 text-sm">Update Available</div>
                         <div className="text-3xl font-light">Version 2.0 Installed</div>
                    </div>
                </div>
            </section>

            {/* INFO PANEL (Right Sidebar style) */}
            <section className="lg:col-span-5 xl:col-span-4 flex flex-col">
                 <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase tracking-widest text-sm font-semibold">
                    <TerminalIcon size={16} />
                    <span>Information</span>
                </div>

                <div className="bg-[#1a1a1a] h-full min-h-[400px] p-8 flex flex-col relative overflow-hidden transition-colors duration-500 border-l border-gray-800">
                    {/* Decorative accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${isPlayingAudio ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-yellow-500'}`}></div>

                    {!selectedTech ? (
                        <div className="flex-grow flex flex-col items-start justify-center text-gray-500">
                             <h2 className="text-4xl font-light text-white mb-4">Select a Tile</h2>
                             <p className="text-lg font-light leading-relaxed">
                                Click on any interactive module on the left to initialize the WebGL rendering pipeline and retrieve data from the neural uplink.
                             </p>
                             <div className="mt-8 flex gap-2">
                                 <div className="w-3 h-3 bg-gray-600"></div>
                                 <div className="w-3 h-3 bg-gray-700"></div>
                                 <div className="w-3 h-3 bg-gray-800"></div>
                             </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-5xl font-light text-white mb-2">{selectedTech.name}</h2>
                            <p className="text-yellow-500 text-sm font-mono mb-8 uppercase tracking-widest flex items-center gap-3">
                                {selectedTech.shortDesc} // ID_{selectedTech.id}
                                {isPlayingAudio && (
                                    <span className="flex gap-1">
                                        <span className="w-1 h-3 bg-blue-500 animate-pulse"></span>
                                        <span className="w-1 h-5 bg-blue-500 animate-pulse delay-75"></span>
                                        <span className="w-1 h-2 bg-blue-500 animate-pulse delay-150"></span>
                                    </span>
                                )}
                            </p>

                            <div className="border-t border-gray-700 py-6">
                                {loading ? (
                                    <div className="flex items-center gap-4 text-2xl font-light text-gray-400">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    <div className="text-xl md:text-2xl font-light leading-relaxed text-gray-200">
                                        <Typewriter 
                                            text={aiResponse} 
                                            speed={20} 
                                            onComplete={() => setStreamActive(true)}
                                        />
                                        <span className="inline-block w-3 h-6 bg-yellow-500 ml-1 animate-pulse align-middle"></span>
                                    </div>
                                )}
                            </div>

                            {streamActive && (
                                <div className="mt-auto pt-6 flex items-center gap-3 text-yellow-500 cursor-pointer hover:text-white transition-colors group" onMouseEnter={() => audioEngine.playHover()}>
                                    <span className="font-semibold uppercase tracking-wide text-sm">View Documentation</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
      </main>
    </div>
  );
};

export default App;
