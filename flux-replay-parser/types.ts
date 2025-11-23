export interface PlayerStats {
  id: string;
  name: string;
  champion: string;
  kda: string;
  damage: number;
  gold: number;
  role: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
}

export interface MatchDetails {
  id: string;
  duration: string;
  winner: 'Blue' | 'Red';
  timestamp: number;
  players: PlayerStats[];
}

export enum ParseStatus {
  IDLE,
  UPLOADING,
  ANALYZING,
  COMPLETE,
  ERROR
}
