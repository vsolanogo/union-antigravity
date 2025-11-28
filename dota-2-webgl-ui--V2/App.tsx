
import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MagicButton } from './components/MagicButton';
import { ButtonEffect, Hero } from './types';
import { vertexShader, fogFragment } from './services/shaders';
import { audio } from './services/audio';
import { 
  Sword, 
  Snowflake, 
  Zap, 
  Flame, 
  Leaf, 
  Play, 
  Users,
  Search,
  Trophy,
  Hexagon,
  Volume2,
  VolumeX
} from 'lucide-react';

// --- Background Component ---
const FogBackground = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size } = useThree();
    const uniforms = useRef({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.width, size.height) }
    });

    useEffect(() => {
        if (uniforms.current) {
            uniforms.current.uResolution.value.set(size.width, size.height);
        }
    }, [size]);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fogFragment}
                uniforms={uniforms.current}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
};

// --- Mock Data ---
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
  const [isMuted, setIsMuted] = useState(true);

  // Toggle Audio
  const handleToggleMute = () => {
      const muted = audio.toggleMute();
      setIsMuted(muted);
  };

  const handleHeroSelect = (hero: Hero) => {
      setSelectedHero(hero);
      audio.playHeroSelect(hero.attribute);
  };

  // Tilt Effect Logic
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (limit to small angles)
    const rotateX = ((y - centerY) / centerY) * -10; // Invert Y
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  return (
    <div className="relative min-h-screen text-gray-200 overflow-x-hidden selection:bg-red-900 selection:text-white pb-20">
      
      {/* Immersive WebGL Background */}
      <div className="fixed inset-0 z-0">
          <Canvas 
            camera={{ position: [0, 0, 1] }} 
            dpr={[1, 1.5]} // Performance optimization
            gl={{ alpha: false, antialias: false }}
          >
              <FogBackground />
          </Canvas>
          {/* Subtle noise overlay texture for grit */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url(https://grainy-gradients.vercel.app/noise.svg)' }}></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-50 border-b border-white/5 bg-gradient-to-b from-[#15171e]/90 to-[#15171e]/60 backdrop-blur-md shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <div className="text-4xl font-bold tracking-widest text-white dota-font flex items-center gap-3 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
               <div className="w-12 h-12 relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-black rounded transform rotate-45 border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                   <Sword size={28} className="absolute inset-0 m-auto text-white relative z-10" />
               </div>
               DOTA UI
            </div>
            <div className="hidden lg:flex space-x-1">
              {['Heroes', 'Store', 'Watch', 'Learn', 'Arcade'].map((item) => (
                  <button key={item} className="px-6 py-2 relative group overflow-hidden" onMouseEnter={() => audio.playHover()} onClick={() => audio.playClick()}>
                      <span className="relative z-10 text-sm font-bold uppercase tracking-[0.15em] text-gray-400 group-hover:text-white transition-colors duration-300">{item}</span>
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 clip-path-slant"></div>
                  </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
             <button 
                onClick={handleToggleMute}
                className={`p-2 rounded-full border transition-all duration-300 ${isMuted ? 'border-red-500/30 text-gray-500 hover:text-red-400' : 'border-green-500/30 text-green-400 hover:text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.2)]'}`}
             >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
             </button>

             <div className="flex items-center gap-3 bg-[#0a0a0a]/50 px-4 py-2 rounded-sm border border-white/10 hover:border-white/30 transition-colors group cursor-text">
                <Search size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                <span className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Search Hero...</span>
             </div>
             <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                 <div className="flex flex-col items-end">
                     <span className="text-sm font-bold text-white tracking-wide">PLAYER_ONE</span>
                     <span className="text-[10px] text-green-400 uppercase font-bold tracking-wider">Online</span>
                 </div>
                 <div className="w-12 h-12 bg-gray-800 rounded-sm border-2 border-gray-700 overflow-hidden shadow-lg relative group cursor-pointer">
                    <img src="https://picsum.photos/100/100" alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </div>
             </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Main Hero Banner / Call to Action */}
        <section className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8 relative">
                {/* Decorative Elements */}
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <h1 className="text-7xl font-bold text-white leading-[0.9] dota-font drop-shadow-2xl tracking-wide">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">ANCIENT</span> <br />
                  DEFENSE
                </h1>
                <p className="text-xl text-gray-400 max-w-xl font-light leading-relaxed border-l-4 border-red-600/50 pl-6 bg-gradient-to-r from-red-900/10 to-transparent py-2">
                   Experience the next generation of competitive interfaces powered by WebGL. 
                   High performance shaders meet tactical gameplay.
                </p>
                
                <div className="flex flex-wrap gap-6 pt-6">
                    <div className="w-72 h-20 shadow-[0_0_30px_rgba(255,50,0,0.3)]">
                        <MagicButton 
                            label="FIND MATCH" 
                            subLabel="UNRANKED • ALL PICK"
                            effect={ButtonEffect.INFERNAL} 
                            icon={<Play fill="currentColor" size={24} />}
                            className="w-full h-full text-xl"
                        />
                    </div>
                    <div className="w-56 h-20">
                        <MagicButton 
                            label="CUSTOM LOBBY" 
                            effect={ButtonEffect.FROST} 
                            icon={<Users size={24} />}
                            className="w-full h-full text-lg"
                        />
                    </div>
                </div>
            </div>
            
            {/* Visual Feature: Battle Cup Card */}
            <div className="lg:col-span-5 flex justify-center perspective-1000">
               <div 
                 className="relative w-full max-w-md bg-[#1a1c24]/80 border border-white/10 backdrop-blur-xl p-8 overflow-hidden group hover:border-yellow-500/50 transition-colors duration-500"
                 style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
               >
                  {/* Decorative corner glows */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[40px] rounded-full"></div>
                  
                  <div className="flex items-start justify-between mb-8 relative z-10">
                      <div>
                        <h3 className="text-3xl dota-font text-white mb-1 drop-shadow-lg">Battle Cup</h3>
                        <p className="text-yellow-500 font-bold uppercase tracking-wider text-xs">Weekend Tournament</p>
                      </div>
                      <Trophy size={48} className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
                  </div>
                  
                  <div className="flex gap-4 mb-8 relative z-10">
                      <div className="bg-black/40 p-4 flex-1 border border-white/5 rounded-sm text-center">
                          <span className="block text-2xl font-bold text-white">Tier 6</span>
                          <span className="text-[10px] uppercase text-gray-500 tracking-wider">Skill Level</span>
                      </div>
                      <div className="bg-black/40 p-4 flex-1 border border-white/5 rounded-sm text-center">
                          <span className="block text-2xl font-bold text-green-400">Ready</span>
                          <span className="text-[10px] uppercase text-gray-500 tracking-wider">Status</span>
                      </div>
                  </div>

                  <div className="w-full h-16 relative z-10">
                    <MagicButton 
                        label="Join Queue" 
                        subLabel="Starts in 05:00"
                        effect={ButtonEffect.ARCANE}
                        className="w-full h-full"
                    />
                  </div>
               </div>
            </div>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-12 opacity-50">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
            <Hexagon size={16} className="text-gray-500" />
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
        </div>

        {/* Hero Grid Section */}
        <section>
          <div className="flex items-end justify-between mb-10">
            <div>
                <h2 className="text-4xl font-bold text-white dota-font flex items-center gap-4 mb-2">
                    <span className="w-1.5 h-10 bg-gradient-to-b from-red-500 to-red-800 block shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
                    HERO ROSTER
                </h2>
                <p className="text-gray-500 text-sm uppercase tracking-[0.2em] pl-6 font-semibold">Choose your champion</p>
            </div>
            
            <div className="flex gap-1 text-sm text-gray-400 font-bold tracking-wider bg-black/40 p-1 rounded-sm border border-white/5">
               <span className="px-6 py-2 bg-white/10 text-white rounded-sm shadow-inner cursor-pointer hover:bg-white/20 transition-all" onClick={() => audio.playClick()}>ALL</span>
               <span className="px-6 py-2 hover:bg-white/5 hover:text-white rounded-sm cursor-pointer transition-all" onClick={() => audio.playClick()}>STR</span>
               <span className="px-6 py-2 hover:bg-white/5 hover:text-white rounded-sm cursor-pointer transition-all" onClick={() => audio.playClick()}>AGI</span>
               <span className="px-6 py-2 hover:bg-white/5 hover:text-white rounded-sm cursor-pointer transition-all" onClick={() => audio.playClick()}>INT</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HEROES.map((hero) => {
               const Icon = hero.effect === ButtonEffect.INFERNAL ? Flame : 
                            hero.effect === ButtonEffect.FROST ? Snowflake :
                            hero.effect === ButtonEffect.STORM ? Zap :
                            hero.effect === ButtonEffect.NATURE ? Leaf : Sword;

               return (
                <div 
                    key={hero.id}
                    onClick={() => handleHeroSelect(hero)}
                    onMouseEnter={() => audio.playHover()}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    className={`
                        relative bg-[#1a1c24] p-1.5 transition-all duration-200 cursor-pointer group
                        ${selectedHero?.id === hero.id ? 'z-20 ring-1 ring-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'hover:z-10'}
                    `}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Card Background Container */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-black/60 shadow-inner">
                     
                     {/* WebGL Background for Card */}
                     <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                        <MagicButton 
                            label="" 
                            effect={hero.effect} 
                            className="w-full h-full border-0 pointer-events-none" // Disable button pointer events so card handles tilt
                            tabIndex={-1}
                        />
                     </div>
                     
                     {/* Overlay Information */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 translate-z-10">
                        <div className="transform transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-4">
                            <Icon size={64} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                        </div>
                     </div>

                     {/* Hero Name / Bottom Gradient */}
                     <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-12 z-30 translate-z-20">
                        <h3 className="text-2xl font-bold text-white dota-font mb-1 group-hover:text-yellow-400 transition-colors drop-shadow-md">
                            {hero.name}
                        </h3>
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${
                                hero.attribute === 'STR' ? 'bg-red-500 shadow-[0_0_5px_red]' : 
                                hero.attribute === 'AGI' ? 'bg-green-500 shadow-[0_0_5px_green]' : 'bg-blue-500 shadow-[0_0_5px_blue]'
                            }`}></div>
                             <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                                {hero.attribute}
                             </p>
                        </div>
                     </div>
                  </div>
                  
                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 border border-white/5 pointer-events-none group-hover:border-white/20 transition-colors"></div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-gray-600 text-sm font-light">DOTA 2 THEMED UI CONCEPT • WEBGL SHADERS • REACT THREE FIBER</p>
        </footer>

        {/* Selected Hero Sticky Action Bar */}
        {selectedHero && (
           <div className="fixed bottom-0 left-0 w-full z-50 animate-fade-in-up">
              {/* Top accent line */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-600 to-transparent shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
              
              <div className="bg-[#15171e]/95 backdrop-blur-xl border-t border-white/10 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                     <div className="flex items-center gap-8">
                        {/* Hero Portrait */}
                        <div className="w-20 h-20 bg-gray-900 border border-gray-600 shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"></div>
                            {/* We can reuse the shader here for the portrait background too! */}
                            <div className="absolute inset-0 opacity-50">
                                <Canvas camera={{ position: [0, 0, 1] }} resize={{ scroll: false }}>
                                    <mesh>
                                        <planeGeometry args={[2,2]} />
                                        <shaderMaterial 
                                            vertexShader={vertexShader} 
                                            fragmentShader={fogFragment} // Just use fog for simplicity or pass generic noise
                                            uniforms={{ uTime: { value: 0 }, uResolution: { value: new THREE.Vector2(100,100) }}} 
                                        />
                                    </mesh>
                                </Canvas>
                            </div>
                            <Sword size={32} className="text-gray-500 absolute inset-0 m-auto relative z-10" />
                        </div>
                        
                        <div>
                            <div className="flex items-baseline gap-3 mb-1">
                                <h4 className="text-3xl text-white dota-font tracking-wide drop-shadow-lg">{selectedHero.name}</h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 ${
                                    selectedHero.attribute === 'STR' ? 'text-red-400' : 
                                    selectedHero.attribute === 'AGI' ? 'text-green-400' : 'text-blue-400'
                                }`}>
                                    LEVEL 1
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm tracking-wide font-light">{selectedHero.description}</p>
                        </div>
                     </div>
                     
                     <div className="flex gap-6 items-center">
                         <div className="w-64 h-16 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            <MagicButton 
                                label="LOCK IN HERO" 
                                effect={selectedHero.effect} 
                                className="w-full h-full text-xl"
                            />
                         </div>
                         <button 
                            onClick={() => { setSelectedHero(null); audio.playClick(); }}
                            className="w-16 h-16 border border-white/10 hover:bg-white/5 hover:border-white/30 flex items-center justify-center transition-all group"
                         >
                            <span className="text-3xl text-gray-500 group-hover:text-white transition-colors">&times;</span>
                         </button>
                     </div>
                  </div>
              </div>
           </div>
        )}

      </main>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes shine {
            0% { left: -100%; opacity: 0; }
            40% { opacity: 0.5; }
            100% { left: 200%; opacity: 0; }
        }
        .animate-shine {
            animation: shine 2s ease-in-out infinite;
        }
        @keyframes fade-in-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .clip-path-slant {
            clip-path: polygon(15px 0, 100% 0, 100% 100%, 0 100%);
        }
        .perspective-1000 {
            perspective: 1000px;
        }
        .translate-z-10 {
            transform: translateZ(20px);
        }
        .translate-z-20 {
            transform: translateZ(40px);
        }
      `}</style>
    </div>
  );
}
