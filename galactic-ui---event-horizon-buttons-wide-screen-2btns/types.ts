export interface CosmicFact {
  fact: string;
  topic: string;
}

export enum GalaxyTheme {
  BLACK_HOLE = 'BLACK_HOLE',
  NEBULA = 'NEBULA'
}

export interface ButtonProps {
  label: string;
  theme: GalaxyTheme;
  onClick?: () => void;
  className?: string;
}