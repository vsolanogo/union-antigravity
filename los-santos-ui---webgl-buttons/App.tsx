import React, { useState } from 'react';
import WebGLButton from './components/WebGLButton';
import Background from './components/Background';
import IntroOverlay from './components/IntroOverlay';
import { Map, DollarSign, Siren, Zap, Sunset, Volume2, VolumeX, ShieldAlert, Crosshair, Crown } from 'lucide-react';
import { setMuted } from './utils/audio';

const App: React.FC = () => {
  const [muted, setMutedState] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleMute = () => {
    const newState = !muted;
    setMutedState(newState);
    setMuted(newState);
  };

  return (
    <div className="min-h-screen text-white relative">
      
      {/* 3D Background Scene */}
      <Background />
      
      {/* Loading Overlay */}
      {loading && <IntroOverlay onComplete={() => setLoading(false)} />}

      <div className={`relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Header - GTA Style */}
        <header className="mb-12 flex items-center justify-between border-b border-white/20 pb-6 bg-gradient-to-r from-black/50 to-transparent backdrop-blur-md p-4 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-600 to-green-800 p-2 rounded-lg rotate-3 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
              <span className="text-4xl font-gta font-bold text-white tracking-tighter">V</span>
            </div>
            <div>
              <h1 className="text-3xl font-gta uppercase tracking-wide drop-shadow-lg">Los Santos <span className="text-gray-400">UI System</span></h1>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Online • Public Session</p>
            </div>
          </div>
          
          <div className="flex gap-6 text-sm font-bold text-gray-300 items-center">
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10">
              <span className="text-green-500 text-lg">$</span> 
              <span className="font-gta text-xl tracking-wider text-white">24,050,120</span>
            </div>
            <div className="uppercase text-red-500 animate-pulse hidden md:flex items-center gap-1 font-black tracking-widest text-shadow-red">
               <Siren size={18} /> Wanted
            </div>
            
            <button 
              onClick={toggleMute}
              className="p-3 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm border border-white/5"
              title={muted ? "Unmute UI Sounds" : "Mute UI Sounds"}
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="flex-1 flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Column: Menu Style */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 backdrop-blur-sm bg-black/20 p-6 rounded-2xl border border-white/5">
            <div className="mb-2">
              <h2 className="text-2xl font-gta uppercase text-white mb-2 border-l-4 border-purple-500 pl-4">Interaction Menu</h2>
              <p className="text-gray-400 text-sm">
                Select an option to initiate protocol. Physics enabled.
              </p>
            </div>

            <div className="space-y-6">
              <WebGLButton 
                effect="neon" 
                label="Nightclub" 
                subLabel="Manage Business" 
                baseColor="#d946ef" // Fuchsia
                width="w-full"
                height="h-24"
                onClick={() => console.log("Access Granted")}
              />
              
              <WebGLButton 
                effect="sunset" 
                label="Los Santos Customs" 
                subLabel="Mod Shop" 
                baseColor="#f97316" // Orange
                width="w-full"
                height="h-24"
              />

              <WebGLButton 
                effect="money" 
                label="Heist Setup" 
                subLabel="The Big Score" 
                baseColor="#22c55e" // Green
                width="w-full"
                height="h-28"
              />
            </div>
          </div>

          {/* Right Column: Special Effects Showcase */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
             <div>
              <h2 className="text-2xl font-gta uppercase text-white mb-6 border-l-4 border-red-500 pl-4 flex items-center gap-2">
                  <ShieldAlert className="text-red-500" /> Active Threats
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Wanted Level Card */}
                <div className="group relative bg-black/60 p-8 rounded-2xl border border-white/10 overflow-hidden transition-all hover:border-red-500/50">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <Siren size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 text-red-500">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                        <h3 className="uppercase font-bold tracking-wider text-lg">5 Star Wanted Level</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                        FIB agents and tactical teams are inbound. Evasion protocols recommended immediately.
                    </p>
                    <div className="flex justify-center">
                        <WebGLButton 
                        effect="wanted" 
                        label="Surrender" 
                        width="w-full"
                        height="h-32"
                        className="rounded-xl shadow-lg shadow-red-900/20"
                        />
                    </div>
                  </div>
                </div>

                {/* Glitch System Card */}
                <div className="group relative bg-black/60 p-8 rounded-2xl border border-white/10 overflow-hidden transition-all hover:border-blue-500/50">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <Zap size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 text-blue-400">
                         <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
                        <h3 className="uppercase font-bold tracking-wider text-lg">System Override</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                        SecuroServ servers are experiencing anomalous data spikes. Manual override required.
                    </p>
                    <div className="flex justify-center">
                        <WebGLButton 
                        effect="glitch" 
                        label="HACK SYSTEM" 
                        width="w-full"
                        height="h-32"
                        className="rounded-xl shadow-lg shadow-blue-900/20"
                        />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Row - Icon Buttons */}
            <div className="bg-gradient-to-r from-black/40 to-transparent p-6 rounded-2xl border border-white/5">
              <h2 className="text-xl font-gta uppercase text-white mb-6 border-l-4 border-yellow-500 pl-4 flex items-center gap-2">
                  <Crown className="text-yellow-500" /> Quick Navigation
              </h2>
              <div className="flex flex-wrap gap-6 justify-start">
                <WebGLButton effect="neon" baseColor="#3b82f6" width="w-24" height="h-24" className="rounded-2xl">
                  <Map size={32} />
                </WebGLButton>
                <WebGLButton effect="money" baseColor="#eab308" width="w-24" height="h-24" className="rounded-2xl">
                  <DollarSign size={32} />
                </WebGLButton>
                <WebGLButton effect="sunset" baseColor="#f43f5e" width="w-24" height="h-24" className="rounded-2xl">
                  <Sunset size={32} />
                </WebGLButton>
                <WebGLButton effect="glitch" width="w-24" height="h-24" className="rounded-2xl">
                  <Crosshair size={32} />
                </WebGLButton>
              </div>
            </div>

          </div>
        </main>

        <footer className="mt-12 py-6 border-t border-white/5 flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest font-gta bg-black/40 px-6 rounded-xl backdrop-blur-md">
          <span>Rockstar Games Inspired UI Prototype</span>
          <div className="flex gap-4">
              <span>Server: <span className="text-green-500">Online</span></span>
              <span>Ping: <span className="text-green-500">24ms</span></span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;