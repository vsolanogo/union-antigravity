import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { useFrame, extend, Object3DNode } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uIntensity;
uniform float uNoiseScale;
uniform float uThickness;
uniform float uRadius;
uniform float uEdgeDetect; // 0.0 = Border only, 1.0 = Edge Detect only

varying vec2 vUv;

// --- Noise Functions ---
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Rounded Box SDF
float sdRoundedBox( in vec2 p, in vec2 b, in vec4 r ) {
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

// Sobel Edge Detection
float getSobelEdge(vec2 uv) {
    vec2 texel = 1.0 / uResolution;
    // Simple 3x3 kernel (simplified)
    float dx = length(texture2D(uTexture, uv + vec2(texel.x, 0.0)).rgb - texture2D(uTexture, uv - vec2(texel.x, 0.0)).rgb);
    float dy = length(texture2D(uTexture, uv + vec2(0.0, texel.y)).rgb - texture2D(uTexture, uv - vec2(0.0, texel.y)).rgb);
    return length(vec2(dx, dy));
}

void main() {
    vec2 uv = vUv;
    vec4 texColor = texture2D(uTexture, uv);
    
    // --- 1. Dynamic Gradient Generation ---
    // Rotates with time, mixed with noise
    float angle = atan(uv.y - 0.5, uv.x - 0.5);
    float noiseMix = snoise(uv * 2.0 - uTime * 0.5);
    float gradient = 0.5 + 0.5 * sin(angle * 3.0 + uTime + noiseMix * 2.0);
    vec3 neonColor = mix(uColor1, uColor2, gradient);

    // --- 2. Border Effect (Electric Frame) ---
    vec2 p = uv * 2.0 - 1.0;
    
    // Distort domain for "wobbly" electric feel
    float distortion = snoise(p * uNoiseScale + uTime * 0.5) * 0.02 * uIntensity;
    vec2 distortedP = p + distortion;
    
    // Box SDF
    float boxSize = 0.90 - (uThickness * 0.1); 
    float dist = sdRoundedBox(distortedP, vec2(boxSize * (uResolution.x/max(uResolution.x, uResolution.y)), boxSize * (uResolution.y/max(uResolution.x, uResolution.y))), vec4(uRadius));
    
    // Create the "Saber" glow profile
    // Core is white/hot, outer is colored
    float glowWidth = 0.005 + (uThickness * 0.02);
    float glowAlpha = glowWidth / (abs(dist) + 0.001);
    glowAlpha = pow(glowAlpha, 1.4); // Sharpen the curve
    
    // Thermal Core effect (inside of the line is white)
    vec3 borderGlow = neonColor * glowAlpha * uIntensity;
    float coreIntensity = smoothstep(0.01, 0.0, abs(dist));
    vec3 borderFinal = borderGlow + vec3(1.0) * coreIntensity * 0.8;
    
    // Mask for image inside the border
    // We use a cleaner SDF for the mask so the image isn't distorted
    float rawDist = sdRoundedBox(p, vec2(boxSize * (uResolution.x/max(uResolution.x, uResolution.y)), boxSize * (uResolution.y/max(uResolution.x, uResolution.y))), vec4(uRadius));
    float mask = 1.0 - smoothstep(0.0, 0.02, rawDist);


    // --- 3. Edge Detection Effect (Contour) ---
    float edgeStrength = getSobelEdge(uv);
    // Thresholding to remove noise
    edgeStrength = smoothstep(0.05, 0.3, edgeStrength);
    
    // Apply electric noise to the edge glow too
    float edgeNoise = snoise(uv * 10.0 + uTime * 2.0) * 0.5 + 0.5;
    vec3 contourGlow = neonColor * edgeStrength * uIntensity * (0.8 + 0.4 * edgeNoise);


    // --- 4. Composition ---
    // Mix between Border Mode and Contour Mode
    
    // For Border Mode: Image + Border
    vec3 borderModeColor = (texColor.rgb * mask) + borderFinal;
    
    // For Contour Mode: Darkened Image + Glowing Edges
    vec3 contourModeColor = (texColor.rgb * 0.3) + contourGlow;
    
    // Blend based on uEdgeDetect slider
    vec3 finalColor = mix(borderModeColor, contourModeColor, uEdgeDetect);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const NeonMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color(1, 0, 1),
    uColor2: new THREE.Color(0, 1, 1),
    uTexture: new THREE.Texture(),
    uResolution: new THREE.Vector2(1, 1),
    uIntensity: 2.0,
    uNoiseScale: 3.0,
    uThickness: 0.1,
    uRadius: 0.1,
    uEdgeDetect: 0.0,
  },
  vertexShader,
  fragmentShader
);

extend({ NeonMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      neonMaterial: Object3DNode<THREE.ShaderMaterial, typeof NeonMaterial>;
    }
  }
}

interface NeonPlaneProps {
  texture: THREE.Texture;
  config: {
    intensity: number;
    speed: number;
    color1: string;
    color2: string;
    noiseScale: number;
    borderThickness: number;
    radius: number;
    edgeDetect: number;
  };
}

export const NeonPlane: React.FC<NeonPlaneProps> = ({ texture, config }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * config.speed;
      materialRef.current.uniforms.uColor1.value.set(config.color1);
      materialRef.current.uniforms.uColor2.value.set(config.color2);
      materialRef.current.uniforms.uResolution.value.set(
        texture.image?.width || 1024,
        texture.image?.height || 1024
      );
    }
  });

  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  
  // Calculate view scale
  const scale = useMemo(() => {
      const maxDim = 6.5; 
      if (aspect > 1) {
          return [maxDim, maxDim / aspect, 1] as [number, number, number];
      } else {
          return [maxDim * aspect, maxDim, 1] as [number, number, number];
      }
  }, [aspect]);

  return (
    <mesh scale={scale}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <neonMaterial
        ref={materialRef}
        uTexture={texture}
        uIntensity={config.intensity}
        uNoiseScale={config.noiseScale}
        uThickness={config.borderThickness}
        uRadius={config.radius}
        uEdgeDetect={config.edgeDetect}
        transparent={true}
      />
    </mesh>
  );
};