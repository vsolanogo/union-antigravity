export enum ButtonVariant {
  HALO = 'HALO',
  PASSION = 'PASSION'
}

export interface DivineResponse {
  verse: string;
  interpretation: string;
}

export interface WebGLButtonProps {
  label: string;
  variant: ButtonVariant;
  onClick: () => void;
  isLoading?: boolean;
}