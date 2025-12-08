import React from 'react';

export type ButtonVariant = 'ocean' | 'lava' | 'neon-palm';

export interface AlohaButtonProps {
  children: React.ReactNode;
  variant: ButtonVariant;
  onClick?: () => void;
  className?: string;
}

export interface ShaderProps {
  hovered: boolean;
  clicked: boolean;
  colorPrimary?: string;
  colorSecondary?: string;
}