import React, { useState } from 'react';
import { MagicButton } from './components/MagicButton';
import { ButtonEffect, Hero } from './types';
import { 
  Sword, 
  Snowflake, 
  Zap, 
  Flame, 
  Leaf, 
  Play, 
  Settings, 
  Users,
  Search,
  Trophy
} from 'lucide-react';

// Mock Data for Dota-like Heroes
const HEROES: Hero[] = [
  { id: 1, name: 'Doom Bringer', attribute: 'STR', effect: ButtonEffect.INFERNAL, description: 'Melee, Durable, Nuker' },
  { id: 2, name: 'Crystal Maiden', attribute: 'INT', effect: ButtonEffect.FROST, description: 'Ranged, Support, Disabler' },
  { id: 3, name: 'Enigma', attribute: 'INT', effect: ButtonEffect.ARCANE, description: 'Ranged, Jungler, Initiator' },
  { id: 4, name: 'Zeus', attribute: 'INT', effect: ButtonEffect.STORM, description: 'Ranged, Nuker' },
  { id: 5, name: 'Treant Protector', attribute: 'STR', effect: ButtonEffect.NATURE, description: 'Melee, Support, Durable' },
  { id: 6, name: 'Lina', attribute: 'INT', effect: ButtonEffect.INFERNAL, description: 'Ranged, Nuker, Carry' },
  { id: 7, name: 'Lich', attribute: 'INT', effect: ButtonEffect.FROST, description: 'Ranged, Support, Nuker' },
  { id: 8, name: 'Faceless Void', attribute: 'AGI', effect: ButtonEffect.ARCANE, description: 'Melee, Carry, Initiator' },
];

export default function App() {
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-200 overflow-x-hidden selection:bg-red-900 selection:text-white pb-20">
      
      {/* Top Navigation Bar */}
      <nav className="border-b border-white/10 bg-[#15171e] sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="text-3xl font-bold tracking-widest text-white dota-font flex items-center gap-2">
               <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-sm flex items-center justify-center border border-red-400">
                  <Sword size={24} className="text-white" />
               </div>
               DOTA UI
            </div>
            <div className="hidden md:flex space-x-1">
              <button className="px-4 py-2 hover:text-white hover:bg-white/5 rounded transition-colors uppercase text-sm tracking-wider font-semibold text-gray-400">Heroes</button>
              <button className="px-4 py-2 hover:text-white hover:bg-white/5 rounded transition-colors uppercase text-sm tracking-wider font-semibold text-gray-400">Store</button>
              <button className="px-4 py-2 hover:text-white hover:bg-white/5 rounded transition-colors uppercase text-sm tracking-wider font-semibold text-gray-400">Watch</button>
              <button className="px-4 py-2 hover:text-white hover:bg-white/5 rounded transition-colors uppercase text-sm tracking-wider font-semibold text-gray-400">Learn</button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/5">
                <Search size={16} className="text-gray-500" />
                <span className="text-gray-500 text-sm uppercase tracking-wider">Search</span>
             </div>
             <div className="w-10 h-10 bg-gray-800 rounded-full border border-gray-600 overflow-hidden">
                <img src="https://picsum.photos/100/100" alt="Avatar" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Main Hero Banner / Call to Action */}
        <section className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent pointer-events-none rounded-lg" />
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
                <h1 className="text-6xl font-bold text-white leading-tight dota-font drop-shadow-xl">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">BATTLE</span> <br />
                  FOR THE ANCIENT
                </h1>
                <p className="text-lg text-gray-400 max-w-xl border-l-4 border-red-700 pl-4">
                   Experience the next generation of UI components powered by WebGL shaders. 
                   High performance, immersive, and fully responsive.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                    <div className="w-64 h-16">
                        <MagicButton 
                            label="FIND MATCH" 
                            subLabel="Ranked All Pick"
                            effect={ButtonEffect.INFERNAL} 
                            icon={<Play fill="currentColor" />}
                            className="w-full h-full rounded-sm"
                        />
                    </div>
                    <div className="w-48 h-16">
                        <MagicButton 
                            label="LOBBY" 
                            effect={ButtonEffect.FROST} 
                            icon={<Users />}
                            className="w-full h-full rounded-sm"
                        />
                    </div>
                </div>
            </div>
            
            {/* Visual Feature */}
            <div className="flex-1 flex justify-center items-center relative">
               <div className="w-[400px] h-[300px] bg-black/50 border border-white/10 rounded backdrop-blur-sm flex flex-col items-center justify-center p-8 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                  <Trophy size={64} className="text-yellow-600 mb-4 drop-shadow-[0_0_15px_rgba(202,138,4,0.5)]" />
                  <h3 className="text-2xl dota-font text-white mb-2">Battle Cup</h3>
                  <p className="text-center text-gray-400 text-sm mb-6">Champions League begins in 5:00</p>
                  <div className="w-full h-14">
                    <MagicButton 
                        label="Join Queue" 
                        effect={ButtonEffect.ARCANE}
                        className="w-full h-full rounded-sm"
                    />
                  </div>
               </div>
            </div>
          </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

        {/* Hero Grid Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white dota-font flex items-center gap-3">
               <span className="w-2 h-8 bg-red-600 block"></span>
               SELECT HERO
            </h2>
            <div className="flex gap-2 text-sm text-gray-400 font-bold tracking-wider">
               <span className="px-3 py-1 bg-white/5 rounded cursor-pointer hover:text-white">STR</span>
               <span className="px-3 py-1 bg-white/5 rounded cursor-pointer hover:text-white">AGI</span>
               <span className="px-3 py-1 bg-white/5 rounded cursor-pointer hover:text-white">INT</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HEROES.map((hero) => {
               const Icon = hero.effect === ButtonEffect.INFERNAL ? Flame : 
                            hero.effect === ButtonEffect.FROST ? Snowflake :
                            hero.effect === ButtonEffect.STORM ? Zap :
                            hero.effect === ButtonEffect.NATURE ? Leaf : Sword;

               return (
                <div 
                    key={hero.id}
                    onClick={() => setSelectedHero(hero)}
                    className={`
                        bg-[#181a20] border border-white/5 p-1 rounded transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:border-white/20 group
                        ${selectedHero?.id === hero.id ? 'ring-2 ring-yellow-500' : ''}
                    `}
                >
                  <div className="relative aspect-[4/3] bg-black/50 mb-3 overflow-hidden">
                     {/* We use the MagicButton AS the hero card image background for the cool effect */}
                     <div className="absolute inset-0">
                        <MagicButton 
                            label="" 
                            effect={hero.effect} 
                            className="w-full h-full border-0"
                            // Use empty onClick to prevent double trigger but allow hover
                        />
                     </div>
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                        <Icon size={48} className="text-white/80 drop-shadow-lg" />
                     </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-xl font-bold text-gray-100 dota-font mb-1 group-hover:text-white transition-colors">
                        {hero.name}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold flex gap-2">
                        <span className={
                            hero.attribute === 'STR' ? 'text-red-500' : 
                            hero.attribute === 'AGI' ? 'text-green-500' : 'text-blue-500'
                        }>{hero.attribute}</span>
                        <span>•</span>
                        <span>{hero.description.split(',')[0]}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Selected Hero Action Bar (Sticky Bottom) */}
        {selectedHero && (
           <div className="fixed bottom-0 left-0 w-full bg-[#15171e]/95 backdrop-blur-md border-t border-white/10 p-4 z-50 transform transition-transform duration-500 slide-up animate-fade-in-up">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-800 rounded border border-gray-600 flex items-center justify-center">
                        {/* Simplified Avatar placeholder */}
                        <Sword size={32} className="text-gray-400" />
                    </div>
                    <div>
                        <h4 className="text-2xl text-white dota-font">{selectedHero.name}</h4>
                        <p className="text-gray-400 text-sm">{selectedHero.description}</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-4">
                     <div className="w-48 h-14">
                        <MagicButton 
                            label="LOCK IN" 
                            effect={selectedHero.effect} 
                            className="w-full h-full text-xl"
                        />
                     </div>
                     <button 
                        onClick={() => setSelectedHero(null)}
                        className="w-14 h-14 border border-white/10 hover:bg-white/5 flex items-center justify-center rounded transition-colors"
                     >
                        <span className="text-2xl text-gray-400">&times;</span>
                     </button>
                 </div>
              </div>
           </div>
        )}

      </main>
      
      {/* Global CSS animation for shine */}
      <style>{`
        @keyframes shine {
            0% { left: -100%; opacity: 0; }
            50% { opacity: 0.5; }
            100% { left: 200%; opacity: 0; }
        }
        .animate-shine {
            animation: shine 1.5s ease-in-out infinite;
        }
        @keyframes fade-in-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
