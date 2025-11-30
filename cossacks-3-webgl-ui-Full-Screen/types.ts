export enum EffectStyle {
  GOLDEN_FLAME = 'GOLDEN_FLAME',
  NEON_PULSE = 'NEON_PULSE',
  BATTLE_MIST = 'BATTLE_MIST',
  VOID_ENERGY = 'VOID_ENERGY'
}

export interface ButtonState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hovered: boolean;
  clicked: boolean;
  lastClickTime: number; // Timestamp of the last click for shockwave animations
  effect: EffectStyle;
  label: string;
}

export interface ButtonContextType {
  buttons: Map<string, ButtonState>;
  registerButton: (id: string, state: ButtonState) => void;
  updateButton: (id: string, partial: Partial<ButtonState>) => void;
  unregisterButton: (id: string) => void;
}