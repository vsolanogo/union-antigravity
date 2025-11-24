import React from 'react';

export enum ButtonEffect {
  NEON_PULSE = 'NEON_PULSE',
  LIQUID_METAL = 'LIQUID_METAL',
  VOXEL_STORM = 'VOXEL_STORM',
  HOLOGRAPHIC = 'HOLOGRAPHIC',
  WARP_DRIVE = 'WARP_DRIVE',
  CYBER_GLYPH = 'CYBER_GLYPH'
}

export interface WebGlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  effect: ButtonEffect;
  primaryColor?: string;
  secondaryColor?: string;
  disabled?: boolean;
}

// Shader uniform types
export type Uniforms = {
  [uniform: string]: { value: any };
};