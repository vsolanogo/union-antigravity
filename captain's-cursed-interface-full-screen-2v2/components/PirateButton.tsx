
import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectType, PirateButtonProps } from '../types';
import { 
  SpectralMistEffect, 
  CursedGoldEffect, 
  BioluminescenceEffect,
  KrakenStormEffect 
} from './SceneEffects';
import { soundSystem } from '../utils/SoundSystem';

const PirateButton: React.FC<PirateButtonProps> = ({ label, effect, onClick, className = '' }) => {
  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState<[number, number]>([0, 0]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1; // -1 to 1 (inverted Y)
    setMouse([x, y]);
  };

  const handleMouseEnter = () => {
      setHovered(true);
      soundSystem.playHover(effect);
  };

  const handleClick = () => {
      soundSystem.playClick(effect);
      if (onClick) onClick();
  };

  const renderEffect = () => {
    const props = { hovered, mouse };
    switch (effect) {
      case EffectType.SPECTRAL_MIST:
        return <SpectralMistEffect {...props} />;
      case EffectType.CURSED_GOLD:
        return <CursedGoldEffect {...props} />;
      case EffectType.BIOLUMINESCENCE:
        return <BioluminescenceEffect {...props} />;
      case EffectType.KRAKEN_STORM:
        return <KrakenStormEffect {...props} />;
      default:
        return null;
    }
  };

  // Improved typography and colors for large format
  const getTextColor = () => {
      switch(effect) {
          case EffectType.CURSED_GOLD: return 'text-amber-100 group-hover:text-amber-900 border-amber-500/30';
          case EffectType.SPECTRAL_MIST: return 'text-emerald-100 group-hover:text-emerald-900 border-emerald-500/30';
          case EffectType.BIOLUMINESCENCE: return 'text-cyan-100 group-hover:text-cyan-900 border-cyan-500/30';
          case EffectType.KRAKEN_STORM: return 'text-blue-100 group-hover:text-blue-900 border-blue-500/30';
          default: return 'text-gray-200';
      }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative group w-full h-full overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Decorative Border Frame (CSS) */}
      <div className={`absolute inset-0 z-20 border-2 opacity-50 group-hover:opacity-100 transition-opacity duration-500 border-white/10 pointer-events-none`} />

      {/* WebGL Canvas Layer - Full Size */}
      <div className="absolute inset-0 z-0 bg-slate-900 pointer-events-none">
        <Canvas 
            camera={{ position: [0, 0, 1.5], fov: 60 }} 
            resize={{ scroll: false }} 
            dpr={[1, 2]}
            className="w-full h-full"
        >
          <Suspense fallback={null}>
            {renderEffect()}
          </Suspense>
        </Canvas>
      </div>

      {/* HTML Content Layer - Centered Big Label */}
      <button
        onClick={handleClick}
        className={`
          relative z-10 w-full h-full flex flex-col items-center justify-center
          bg-transparent
          transition-all duration-300
          ${getTextColor()}
          hover:backdrop-brightness-110
        `}
      >
        <span className="
            font-pirate text-5xl md:text-7xl tracking-widest uppercase 
            transform group-hover:scale-110 transition-transform duration-500 ease-out 
            pointer-events-none drop-shadow-xl"
            style={{ textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}
        >
          {label}
        </span>
        <span className="
            mt-4 font-serif text-lg md:text-xl text-white/50 italic opacity-0 
            group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0
            pointer-events-none"
        >
            Click to Invoke
        </span>
      </button>
    </div>
  );
};

export default PirateButton;
