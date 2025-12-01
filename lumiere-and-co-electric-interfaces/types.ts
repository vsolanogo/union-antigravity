export enum ButtonStyle {
  EDISON = 'EDISON',
  TESLA = 'TESLA',
  RADIUM = 'RADIUM',
  BRASS = 'BRASS'
}

export interface WebGLButtonProps {
  label: string;
  onClick?: () => void;
  styleVariant: ButtonStyle;
  className?: string;
}
