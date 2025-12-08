import * as THREE from 'three';
import { ButtonEffectType } from './types';

// We use 3 colors now for deeper gradients
export const HAWAII_PALETTES = {
  [ButtonEffectType.WAIKIKI_WAVE]: {
    primary: new THREE.Color('#00f2ff'), // Neon Cyan
    secondary: new THREE.Color('#0048ff'), // Electric Blue
    tertiary: new THREE.Color('#ffffff'), // White foam/highlight
  },
  [ButtonEffectType.VOLCANO_MAGMA]: {
    primary: new THREE.Color('#ff0f0f'), // Hot Red
    secondary: new THREE.Color('#ffaa00'), // Magma Orange
    tertiary: new THREE.Color('#2a0a0a'), // Dark Crust
  },
  [ButtonEffectType.TIKI_TORCH]: {
    primary: new THREE.Color('#d946ef'), // Neon Fuchsia
    secondary: new THREE.Color('#ffd700'), // Gold
    tertiary: new THREE.Color('#4c1d95'), // Deep Violet
  },
  [ButtonEffectType.JUNGLE_MIST]: {
    primary: new THREE.Color('#00ff41'), // Matrix Green
    secondary: new THREE.Color('#008f11'), // Darker Green
    tertiary: new THREE.Color('#0c2e14'), // Deep Forest
  }
};