export enum EffectType {
  SPECTRAL_MIST = 'SPECTRAL_MIST',
  CURSED_GOLD = 'CURSED_GOLD',
  BIOLUMINESCENCE = 'BIOLUMINESCENCE',
  KRAKEN_STORM = 'KRAKEN_STORM'
}

export interface PirateButtonProps {
  label: string;
  effect: EffectType;
  onClick?: () => void;
  className?: string;
}

export interface EffectProps {
  hovered: boolean;
  mouse: [number, number]; // [x, y] normalized from -1 to 1
  color?: string;
}