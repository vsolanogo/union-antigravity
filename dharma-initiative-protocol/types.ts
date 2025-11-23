export interface EffectProps {
  hovered: boolean;
  clicked: boolean;
  intensity?: number;
}

export type EffectComponent = React.FC<EffectProps>;
