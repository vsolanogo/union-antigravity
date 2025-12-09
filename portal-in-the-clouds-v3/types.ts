import { ShaderMaterial, Vector2, Texture } from "three";

export interface PortalUniforms {
  uTime: number;
  uResolution: Vector2;
  uMouse: Vector2;
  uTexClouds: Texture | null;
  uTexGalaxy: Texture | null;
  uTexNoise: Texture | null;
}

export type PortalMaterialType = ShaderMaterial & PortalUniforms;