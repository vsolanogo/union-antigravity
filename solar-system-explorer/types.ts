export type PlanetType = 'terrestrial' | 'gas_giant' | 'ice_giant' | 'star';

export interface PlanetData {
  id: string;
  name: string;
  type: PlanetType;
  description: string;
  color: string;
  radius: number;     // Relative size
  distance: number;   // Distance from Sun
  speed: number;      // Orbit speed relative factor
  rotationSpeed: number; // Self rotation speed
  hasRings?: boolean;
  textureUrl?: string; // Optional
  ringColor?: string;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}