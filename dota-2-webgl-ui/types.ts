export enum ButtonEffect {
  INFERNAL = 'INFERNAL',
  FROST = 'FROST',
  ARCANE = 'ARCANE',
  STORM = 'STORM',
  NATURE = 'NATURE'
}

export interface Hero {
  id: number;
  name: string;
  attribute: 'STR' | 'AGI' | 'INT';
  effect: ButtonEffect;
  description: string;
}
