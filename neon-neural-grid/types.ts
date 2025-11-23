
export interface GridOptions {
  spacing: number;
  returnSpeed: number;
  mouseRepulsion: number;
  friction: number;
  particleSize: number;
}

export interface ParticleData {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  scale: number;
  mass: number;
  color: number;
}

export interface StarData {
  sprite: any;
  x: number;
  y: number;
  z: number; // depth
  speed: number;
}
