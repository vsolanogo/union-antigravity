export interface ShaderProps {
  speed?: number;
  boost?: number; // 0.0 to 1.0
  mouseX?: number; // 0.0 to 1.0
  mouseY?: number; // 0.0 to 1.0
  className?: string;
}

export interface Vec2 {
  x: number;
  y: number;
}