export interface TreeConfig {
  layers: number;
  height: number;
  width: number;
  decorationCount: number;
  lightsColor: string;
}

export enum Holiday {
  COZY = 'Cozy & Warm',
  FROSTY = 'Frosty & Blue',
  CLASSIC = 'Classic Red & Green',
  NEON = 'Cyberpunk Neon'
}

export interface GeneratedGreeting {
  title: string;
  message: string;
}