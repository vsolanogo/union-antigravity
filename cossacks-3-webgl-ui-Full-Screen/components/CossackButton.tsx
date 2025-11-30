
import React, { useRef, useEffect, useId } from 'react';
import { useButtonContext } from '../context/ButtonContext';
import { EffectStyle } from '../types';
import { playHoverSound, playClickSound } from '../utils/audio';

interface CossackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  effect?: EffectStyle;
  subtext?: string;
  icon?: React.ReactNode;
}

export const CossackButton: React.FC<CossackButtonProps> = ({ 
  label, 
  effect = EffectStyle.GOLDEN_FLAME, 
  subtext,
  icon,
  className = '',
  ...props 
}) => {
  const id = useId();
  const ref = useRef<HTMLButtonElement>(null);
  const { registerButton, updateButton, unregisterButton } = useButtonContext();

  // Measure and register button
  useEffect(() => {
    if (!ref.current) return;

    const measure = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        registerButton(id, {
          id,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          hovered: false,
          clicked: false,
          lastClickTime: 0,
          effect,
          label
        });
      }
    };

    measure();
    // Observe resize of the element itself
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(ref.current);
    
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
      unregisterButton(id);
    };
  }, [id, registerButton, unregisterButton, effect, label]);

  const handleMouseEnter = () => {
    updateButton(id, { hovered: true });
    playHoverSound(effect);
  };

  const handleMouseLeave = () => {
    updateButton(id, { hovered: false });
  };

  const handleMouseDown = () => {
    // IMPORTANT: Use performance.now() / 1000 for synchronization with Three.js clock
    updateButton(id, { clicked: true, lastClickTime: performance.now() / 1000 });
    playClickSound(effect);
  };

  const handleMouseUp = () => {
    updateButton(id, { clicked: false });
  };

  // Customized text styling based on effect to ensure readability over shaders
  let textContainerClass = "text-amber-100 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]";
  let borderClass = "border-2 border-amber-500/20 bg-amber-900/10"; // Fallback visual

  if (effect === EffectStyle.NEON_PULSE) {
    // ROYAL ACADEMY (Blue/Silver)
    textContainerClass = "text-blue-50 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]";
    borderClass = "border-2 border-blue-400/20 bg-blue-950/10";
  } else if (effect === EffectStyle.BATTLE_MIST) {
    // CHAOS (Red/Orange)
    textContainerClass = "text-orange-50 drop-shadow-[0_4px_8px_rgba(0,0,0,1)]";
    borderClass = "border-2 border-red-900/20 bg-red-950/10";
  }

  return (
    <button
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`
        relative group isolate
        flex flex-col items-center justify-center 
        cursor-pointer select-none
        transition-all duration-200 active:scale-[0.99]
        outline-none focus:outline-none
        rounded-sm
        ${borderClass}
        ${className}
      `}
      {...props}
    >
      {/* Content Layer - Z-Index 10 to sit above WebGL canvas */}
      <div className={`relative z-10 flex flex-col items-center pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2 ${textContainerClass}`}>
        {icon && (
          <div className="mb-6 text-5xl md:text-7xl lg:text-8xl filter drop-shadow-2xl opacity-90 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        )}
        <span className="text-3xl md:text-5xl lg:text-6xl font-black tracking-[0.2em] uppercase font-cinzel leading-none text-center">
          {label}
        </span>
        {subtext && (
          <span className="text-sm md:text-lg lg:text-xl opacity-70 mt-4 font-serif italic tracking-widest text-current text-center max-w-[80%]">
            {subtext}
          </span>
        )}
      </div>
    </button>
  );
};
