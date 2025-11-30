
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

  // Improved typography and colors
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
      className={`relative group inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      style={{ width: '260px', height: '90px' }}
    >
      {/* Decorative Border Frame (CSS) */}
      <div className={`absolute -inset-1 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 blur-sm bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none`} />

      {/* WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0 rounded-lg overflow-hidden bg-black/40 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1.5], fov: 60 }} resize={{ scroll: false }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            {renderEffect()}
          </Suspense>
        </Canvas>
      </div>

      {/* HTML Content Layer */}
      <button
        onClick={handleClick}
        className={`
          relative z-10 w-full h-full flex items-center justify-center
          font-pirate text-3xl tracking-wider uppercase
          bg-transparent border border-white/10
          transition-all duration-300
          ${getTextColor()}
          group-hover:border-transparent
          rounded-lg
          shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]
        `}
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
      >
        <span className="relative z-10 transform group-hover:scale-110 transition-transform duration-300 ease-out pointer-events-none">
          {label}
        </span>
      </button>
    </div>
  );
};

export default PirateButton;
