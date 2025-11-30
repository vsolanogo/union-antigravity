export enum EffectStyle {
  KHERSON_WAVE = 'KHERSON_WAVE',
  TOXIC_SLUDGE = 'TOXIC_SLUDGE',
  CYBER_PULSE = 'CYBER_PULSE',
  WATERMELON_GLITCH = 'WATERMELON_GLITCH'
}

export interface WebGLButtonProps {
  label: string;
  onClick?: () => void;
  styleVariant?: EffectStyle;
  className?: string;
  disabled?: boolean;
}