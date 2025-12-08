
import React, { useState, useRef, useEffect } from 'react';
import { TreeConfig, Holiday, GeneratedGreeting } from '../types';
import { generateHolidayGreeting } from '../services/geminiService';
import { Loader2, Sparkles, Wand2, Palette, Settings2, Volume2, VolumeX, Image as ImageIcon } from 'lucide-react';

interface OverlayProps {
  config: TreeConfig;
  setConfig: React.Dispatch<React.SetStateAction<TreeConfig>>;
  setBgImage: (url: string | null) => void;
}

const Overlay: React.FC<OverlayProps> = ({ config, setConfig, setBgImage }) => {
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState<GeneratedGreeting | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, []);

  const handleGenerateWish = async () => {
    setLoading(true);
    // Pick a random theme or use current settings
    const theme = `A ${config.lightsColor === '#fbbf24' ? 'warm and cozy' : 'magical and bright'} winter holiday`;
    const result = await generateHolidayGreeting(theme);
    setGreeting(result);
    setLoading(false);
    setIsOpen(true);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
          playPromise
            .then(() => {
                setIsPlaying(true);
            })
            .catch(e => {
                console.error("Audio playback failed:", e);
                setIsPlaying(false);
                alert("Could not play audio. Please interact with the page first or check browser settings.");
            });
      }
    }
  };

  const changeMood = (mood: Holiday) => {
    let color = '#fbbf24'; // Default Warm Gold
    switch (mood) {
      case Holiday.COZY: color = '#fbbf24'; break;
      case Holiday.FROSTY: color = '#38bdf8'; break; // Light Blue
      case Holiday.CLASSIC: color = '#ef4444'; break; // Red
      case Holiday.NEON: color = '#d946ef'; break; // Fuchsia
    }
    setConfig(prev => ({ ...prev, lightsColor: color }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setBgImage(event.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-20">
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
      >
        {/* Kevin MacLeod - Jingle Bells (Kevin MacLeod) licensed under Creative Commons: By Attribution 3.0 License */}
        <source src="https://upload.wikimedia.org/wikipedia/commons/transcoded/8/89/Jingle_Bells_Kevin_MacLeod.ogg/Jingle_Bells_Kevin_MacLeod.ogg.mp3" type="audio/mpeg" />
        <source src="https://upload.wikimedia.org/wikipedia/commons/8/89/Jingle_Bells_Kevin_MacLeod.ogg" type="audio/ogg" />
      </audio>

      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col">
           <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-lg font-serif tracking-tight">
            Winter Glow
          </h1>
          <p className="text-white/60 text-sm font-light tracking-widest uppercase mt-2 ml-1">Immersive Holiday Experience</p>
        </div>
        
        <div className="flex gap-4">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="backdrop-blur-md border border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              title="Upload Background Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <button 
              onClick={toggleAudio}
              className={`backdrop-blur-md border w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]
                ${isPlaying ? 'bg-white/20 border-white text-white' : 'bg-white/5 border-white/20 text-white/50 hover:bg-white/10 hover:text-white'}
              `}
              title={isPlaying ? "Pause Music" : "Play Music"}
            >
              {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button 
              onClick={handleGenerateWish}
              disabled={loading}
              className="relative overflow-hidden bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {loading ? <Loader2 className="animate-spin w-5 h-5 text-yellow-200" /> : <Wand2 className="w-5 h-5 text-yellow-300 group-hover:rotate-45 transition-transform duration-500" />}
              <span className="font-medium tracking-wide">Generate Magic</span>
            </button>
        </div>
      </div>

      {/* Greeting Modal */}
      {isOpen && greeting && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/80 backdrop-blur-md z-50 transition-all duration-500">
           <div className="bg-[#fffdf5] text-slate-900 p-10 rounded-xl max-w-lg text-center shadow-[0_0_50px_rgba(255,215,0,0.3)] border border-yellow-900/10 relative mx-4 animate-in fade-in zoom-in duration-300">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
              
              <div className="mb-6 text-yellow-600 flex justify-center">
                 <Sparkles className="w-10 h-10 animate-pulse" />
              </div>
              
              <h2 className="text-3xl font-serif font-bold mb-6 text-slate-900 leading-tight">{greeting.title}</h2>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mb-6"></div>
              <p className="font-serif italic text-xl text-slate-600 leading-relaxed">
                "{greeting.message}"
              </p>
              
              <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3" /> Powered by Gemini
              </div>
           </div>
        </div>
      )}

      {/* Controls Footer */}
      <div className="pointer-events-auto self-center w-full max-w-3xl">
        <div className="bg-black/30 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row gap-8 items-center justify-between">
          
          {/* Mood Selector */}
          <div className="flex gap-6">
             {(Object.values(Holiday) as Holiday[]).map((m) => {
               const isActive = 
                 (m === Holiday.COZY && config.lightsColor === '#fbbf24') ||
                 (m === Holiday.FROSTY && config.lightsColor === '#38bdf8') ||
                 (m === Holiday.CLASSIC && config.lightsColor === '#ef4444') ||
                 (m === Holiday.NEON && config.lightsColor === '#d946ef');

               return (
                 <button
                   key={m}
                   onClick={() => changeMood(m)}
                   className="flex flex-col items-center gap-2 group relative"
                 >
                   <div className={`w-10 h-10 rounded-full transition-all duration-300 relative z-10 flex items-center justify-center
                      ${isActive ? 'scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'opacity-70 hover:opacity-100 hover:scale-105'}
                      ${m === Holiday.COZY ? 'bg-amber-400' :
                        m === Holiday.FROSTY ? 'bg-sky-400' :
                        m === Holiday.CLASSIC ? 'bg-red-500' :
                        'bg-fuchsia-500'}
                   `}>
                     {isActive && <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-20"></div>}
                   </div>
                   <span className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}>
                      {(m as string).split(' ')[0]}
                   </span>
                 </button>
               )
             })}
          </div>

          <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block"></div>

          {/* Sliders */}
          <div className="flex gap-8 w-full md:w-auto">
             <div className="flex flex-col gap-3 w-full min-w-[140px]">
                <div className="flex justify-between items-center text-xs text-white/80 uppercase tracking-wider">
                  <span className="flex items-center gap-2"><Palette className="w-3 h-3" /> Ornaments</span>
                  <span className="font-mono">{config.decorationCount}</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="150" 
                  value={config.decorationCount} 
                  onChange={(e) => setConfig(prev => ({...prev, decorationCount: parseInt(e.target.value)}))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-yellow-200 transition-all"
                />
             </div>
             
             <div className="flex flex-col gap-3 w-full min-w-[140px]">
                <div className="flex justify-between items-center text-xs text-white/80 uppercase tracking-wider">
                  <span className="flex items-center gap-2"><Settings2 className="w-3 h-3" /> Layers</span>
                  <span className="font-mono">{config.layers}</span>
                </div>
                <input 
                  type="range" 
                  min="3" 
                  max="8" 
                  value={config.layers} 
                  onChange={(e) => setConfig(prev => ({...prev, layers: parseInt(e.target.value)}))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-yellow-200 transition-all"
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Overlay;
