export enum WebGLEffect {
  RED_ROOM = 'RED_ROOM',
  ZIG_ZAG = 'ZIG_ZAG',
  FIRE_WALK = 'FIRE_WALK',
  ELECTRICITY = 'ELECTRICITY'
}

export interface Button3DProps {
  label: string;
  onClick?: () => void;
  effect?: WebGLEffect;
  className?: string;
  disabled?: boolean;
}
