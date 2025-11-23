import React from 'react';
import { Upload, Wand2, Zap, Palette, Sliders, Loader2, Sparkles, MonitorPlay } from 'lucide-react';
import { NeonConfig, VibeAnalysis } from '../types';

interface SidebarProps {
  config: NeonConfig;
  setConfig: React.Dispatch<React.SetStateAction<NeonConfig>>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  analysis: VibeAnalysis | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  config, 
  setConfig, 
  onUpload, 
  onAnalyze, 
  isAnalyzing,
  analysis
}) => {
  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-[400px] bg-black/60 backdrop-blur-2xl border-l border-white/10 overflow-y-auto text-white transition-all z-20 shadow-2xl scrollbar-hide">
      
      <div className="p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 tracking-tighter drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
            NEON AURA
          </h1>
          <p className="text-gray-400 text-xs font-mono tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </p>
        </div>

        {/* AI Analysis Card */}
        <div className="bg-gray-900/60 rounded-xl p-1 border border-white/10 shadow-xl overflow-hidden group">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 border-b border-white/5 flex justify-between items-center">
             <div className="flex items-center gap-2 text-sm font-semibold text-purple-300">
               <Wand2 className="w-4 h-4" />
               <span>AI NEURAL SYNC</span>
             </div>
             {analysis && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">ACTIVE</span>}
          </div>
          
          <div className="p-4 space-y-4">
            <button 
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold tracking-wider text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAnalyzing ? 'ANALYZING AURA...' : 'GENERATE AURA'}
            </button>

            {analysis && (
              <div className="bg-black/30 rounded-lg p-3 space-y-2 border-l-2 border-purple-500 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center">
                   <span className="text-xs text-gray-400 uppercase font-mono">Detected Mood</span>
                   <span className="text-xs font-bold text-cyan-300 drop-shadow-[0_0_5px_rgba(103,232,249,0.5)]">{analysis.mood}</span>
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">"{analysis.description}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          
          {/* Section: Mode */}
          <div className="space-y-4">
             <SectionTitle icon={<MonitorPlay className="w-4 h-4" />} title="VISUAL MODE" />
             <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900/80 rounded-lg border border-white/5">
                <button 
                  onClick={() => setConfig({...config, edgeDetect: 0})}
                  className={`py-2 text-xs font-bold rounded transition-all ${config.edgeDetect < 0.5 ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  FRAME
                </button>
                <button 
                  onClick={() => setConfig({...config, edgeDetect: 1})}
                  className={`py-2 text-xs font-bold rounded transition-all ${config.edgeDetect > 0.5 ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  CONTOUR
                </button>
             </div>
          </div>

          {/* Section: Palette */}
          <div className="space-y-4">
            <SectionTitle icon={<Palette className="w-4 h-4" />} title="CHROMATIC FLUX" />
            <div className="flex gap-4">
              <ColorPicker 
                value={config.color1} 
                onChange={(c) => setConfig({...config, color1: c})} 
                label="CORE" 
              />
              <ColorPicker 
                value={config.color2} 
                onChange={(c) => setConfig({...config, color2: c})} 
                label="GLOW" 
              />
            </div>
          </div>

          {/* Section: Tuning */}
          <div className="space-y-5">
             <SectionTitle icon={<Sliders className="w-4 h-4" />} title="FINE TUNING" />
             
             <ControlSlider 
               label="Intensity" value={config.intensity} 
               min={0.5} max={5.0} step={0.1}
               onChange={(v) => setConfig({...config, intensity: v})} 
             />
             <ControlSlider 
               label="Flux Speed" value={config.speed} 
               min={0} max={4.0} step={0.1}
               onChange={(v) => setConfig({...config, speed: v})} 
             />
             <ControlSlider 
               label="Noise / Distortion" value={config.noiseScale} 
               min={0.1} max={10.0} step={0.1}
               onChange={(v) => setConfig({...config, noiseScale: v})} 
             />

             {config.edgeDetect < 0.5 && (
               <>
                 <ControlSlider 
                    label="Frame Thickness" value={config.borderThickness} 
                    min={0.01} max={0.5} step={0.01}
                    onChange={(v) => setConfig({...config, borderThickness: v})} 
                 />
                 <ControlSlider 
                    label="Corner Radius" value={config.radius} 
                    min={0.0} max={0.5} step={0.01}
                    onChange={(v) => setConfig({...config, radius: v})} 
                 />
               </>
             )}
          </div>
        </div>

        {/* Upload Button */}
        <div className="pt-4 border-t border-white/10">
          <div className="relative group cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <div className="w-full bg-gray-800 border border-gray-600 border-dashed rounded-lg py-4 flex items-center justify-center gap-3 group-hover:bg-gray-700 group-hover:border-cyan-500 transition-all">
              <Upload className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />
              <span className="text-sm font-medium text-gray-300 group-hover:text-white">Upload New Image</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const SectionTitle = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <h3 className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase">
    {icon}
    {title}
  </h3>
);

const ColorPicker = ({ value, onChange, label }: { value: string, onChange: (v: string) => void, label: string }) => (
  <div className="flex-1">
    <label className="block text-[10px] text-gray-500 mb-2 font-mono uppercase text-center">{label}</label>
    <div className="relative h-12 w-full rounded-lg overflow-hidden ring-1 ring-white/20">
      <input 
        type="color" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] cursor-pointer p-0 border-0"
      />
    </div>
  </div>
);

const ControlSlider = ({ label, value, min, max, step, onChange }: { 
    label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void 
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <span className="text-[10px] font-mono text-cyan-500 bg-cyan-950 px-1 rounded">{value.toFixed(2)}</span>
    </div>
    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-cyan-500" 
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        ></div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
    </div>
  </div>
);