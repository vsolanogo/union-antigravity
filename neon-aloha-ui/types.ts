import * as THREE from 'three';

export enum ButtonEffectType {
  WAIKIKI_WAVE = 'WAIKIKI_WAVE',
  VOLCANO_MAGMA = 'VOLCANO_MAGMA',
  TIKI_TORCH = 'TIKI_TORCH',
  JUNGLE_MIST = 'JUNGLE_MIST'
}

export interface WebGLButtonProps {
  label: string;
  effect: ButtonEffectType;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export interface ShaderUniforms {
  uTime: { value: number };
  uColor1: { value: THREE.Color };
  uColor2: { value: THREE.Color };
  uColor3: { value: THREE.Color }; // Added tertiary color for complexity
  uMouse: { value: THREE.Vector2 };
  uResolution: { value: THREE.Vector2 };
  uHover: { value: number }; // 0.0 to 1.0
}