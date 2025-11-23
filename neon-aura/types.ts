export interface VibeAnalysis {
  mood: string;
  color1: string;
  color2: string;
  description: string;
}

export interface NeonConfig {
  intensity: number;
  speed: number;
  color1: string;
  color2: string;
  noiseScale: number;
  borderThickness: number;
  radius: number;
  edgeDetect: number; // 0.0 to 1.0 (blending between border and contour)
}