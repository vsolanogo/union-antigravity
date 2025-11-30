
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
  let textContainerClass = "text-amber-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]";
  let borderClass = "border border-amber-500/20 bg-amber-900/10"; // Fallback visual

  if (effect === EffectStyle.NEON_PULSE) {
    // ROYAL ACADEMY (Blue/Silver)
    textContainerClass = "text-blue-50 drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]";
    borderClass = "border border-blue-400/20 bg-blue-950/10";
  } else if (effect === EffectStyle.BATTLE_MIST) {
    // CHAOS (Red/Orange)
    textContainerClass = "text-orange-50 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]";
    borderClass = "border border-red-900/20 bg-red-950/10";
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
        min-w-[280px] px-8 py-6
        flex flex-col items-center justify-center 
        cursor-pointer select-none
        transition-all duration-150 active:scale-[0.98]
        outline-none focus:outline-none
        /* Slight background for layout before WebGL loads or if it fails */
        rounded-sm
        ${borderClass}
        ${className}
      `}
      {...props}
    >
      {/* Content Layer - Z-Index 10 to sit above WebGL canvas */}
      <div className={`relative z-10 flex flex-col items-center pointer-events-none transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1 ${textContainerClass}`}>
        {icon && (
          <div className="mb-3 text-3xl filter drop-shadow-md">
            {icon}
          </div>
        )}
        <span className="text-xl font-black tracking-[0.2em] uppercase font-cinzel leading-none">
          {label}
        </span>
        {subtext && (
          <span className="text-xs opacity-80 mt-2 font-serif italic tracking-widest text-current">
            {subtext}
          </span>
        )}
      </div>
    </button>
  );
};
