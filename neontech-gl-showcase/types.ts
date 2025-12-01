export enum WebGLEffect {
  NEON_PULSE = 'NEON_PULSE',
  MATRIX_DATA = 'MATRIX_DATA',
  LIQUID_METAL = 'LIQUID_METAL',
  CYBER_GRID = 'CYBER_GRID',
  PLASMA_VOID = 'PLASMA_VOID',
  HOLO_INTERFERENCE = 'HOLO_INTERFERENCE'
}

export interface TechItem {
  id: string;
  name: string;
  effect: WebGLEffect;
  shortDesc: string;
}

export interface ShaderProps {
  hovered: boolean;
  color?: string;
  time: number;
}