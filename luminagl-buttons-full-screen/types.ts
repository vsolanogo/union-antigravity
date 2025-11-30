export enum EffectType {
  NEON_PULSE = 'NEON_PULSE',
  LIQUID_PLASMA = 'LIQUID_PLASMA',
  CYBER_GRID = 'CYBER_GRID',
  STAR_FIELD = 'STAR_FIELD',
  HOLOGRAPHIC = 'HOLOGRAPHIC'
}

export interface WebGLProps {
  effectType: EffectType;
  primaryColor: [number, number, number]; // RGB 0-1
  secondaryColor: [number, number, number]; // RGB 0-1
  speed: number;
  intensity: number;
  interactive?: boolean;
}