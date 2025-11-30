
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectProps } from '../types';

// --- Shader Library ---

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const commonChunks = `
  #define PI 3.14159265359

  // --- Hashing & Noise ---
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
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

  // Fractal Brownian Motion
  float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      for (int i = 0; i < 5; i++) {
          value += amplitude * snoise(st * frequency);
          st *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }

  // Domain Warping
  float warp(vec2 p, float time) {
      vec2 q = vec2(
          fbm(p + vec2(0.0, 0.0)),
          fbm(p + vec2(5.2, 1.3))
      );
      vec2 r = vec2(
          fbm(p + 4.0*q + vec2(1.7, 9.2) + 0.15*time),
          fbm(p + 4.0*q + vec2(8.3, 2.8) + 0.126*time)
      );
      return fbm(p + 4.0*r);
  }

  // Voronoi / Cellular Noise
  vec2 voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    vec2 res = vec2(8.0);
    for(int j=-1; j<=1; j++)
    for(int i=-1; i<=1; i++) {
        vec2 b = vec2(i, j);
        vec2 r = vec2(b) - f + (0.5 + 0.5*sin(x.x*20.0)); // animated offset could go here
        float d = dot(r, r);
        if(d < res.x) {
            res.y = res.x;
            res.x = d;
        } else if(d < res.y) {
            res.y = d;
        }
    }
    return sqrt(res);
  }
  
  // Rotation Matrix
  mat2 rotate2d(float angle){
      return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }
`;

// --- 1. Spectral Mist (Soul Vortex) ---
// Uses Domain Warping for fluid smoke + Vortex rotation
const mistFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${commonChunks}

  void main() {
    // Aspect ratio correction (approx 3:1)
    vec2 uv = vUv;
    uv.x *= 2.8;
    
    // Mouse Interaction: Vortex center
    vec2 mouse = uMouse;
    mouse.x *= 2.8;
    mouse.y = mouse.y; 

    // Distortion field from mouse
    float dist = length(uv - mouse);
    float pull = smoothstep(1.5, 0.0, dist) * uHover;
    
    // Rotate space around mouse
    vec2 centered = uv - mouse;
    float angle = length(centered) * 2.0 - uTime * 2.0;
    centered *= rotate2d(angle * pull * 0.5);
    vec2 p = centered + mouse;

    // Fluid Domain Warping
    float t = uTime * 0.2;
    float pattern = warp(p * 2.0, t);
    
    // Secondary noise for detail
    float detail = fbm(uv * 6.0 - vec2(0.0, t * 2.0));

    // Color Composition
    vec3 col = mix(vec3(0.0), uColor, pattern);
    
    // Add "Souls" (bright spots in the noise)
    float souls = smoothstep(0.6, 1.0, detail * pattern);
    col += vec3(0.8, 1.0, 0.9) * souls;
    
    // Hover intensify
    col += uColor * pull * 0.5;
    
    // Vignette & Edge fade
    float alpha = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x) * 
                  smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
                  
    // Chromatic Aberration on edges
    float shift = pattern * 0.02;
    float r = warp(p * 2.0 + shift, t);
    float b = warp(p * 2.0 - shift, t);
    col.r += r * 0.2;
    col.b += b * 0.2;

    gl_FragColor = vec4(col, alpha);
  }
`;

// --- 2. Cursed Gold (Molten Treasury) ---
// Uses Height Map derivatives for Fake PBR (Physically Based Rendering) lighting
const goldFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${commonChunks}

  // Height map generation
  float getHeight(vec2 uv) {
      float t = uTime * 0.2;
      // Layered noise for "melted" look
      float n1 = snoise(uv * 3.0 + vec2(t, t*0.5));
      float n2 = snoise(uv * 10.0 - t);
      // Ridge noise for sharp metallic features
      return 0.5 * abs(n1) + 0.2 * n2;
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= 2.8;

    // Mouse Interaction: Heat distortion
    vec2 mouse = uMouse;
    mouse.x *= 2.8;
    float d = length(uv - mouse);
    float heat = exp(-d * 3.0) * uHover;
    
    // Displace UVs based on heat
    uv -= (uv - mouse) * heat * 0.1;

    // Calculate Normal from Height Map (Bump Mapping)
    float eps = 0.01;
    float h = getHeight(uv);
    float h_dx = getHeight(uv + vec2(eps, 0.0));
    float h_dy = getHeight(uv + vec2(0.0, eps));
    
    vec3 normal = normalize(vec3(h - h_dx, h - h_dy, eps * 2.0));
    
    // Lighting
    vec3 lightDir = normalize(vec3(-1.0, 1.0, 2.0));
    // Move light with mouse slightly
    lightDir.xy += (uMouse - 0.5); 
    
    // Ambient
    vec3 col = vec3(0.2, 0.1, 0.0);
    
    // Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    col += diff * vec3(1.0, 0.84, 0.0); // Gold color
    
    // Specular (Phong)
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
    col += spec * vec3(1.0, 1.0, 0.8);
    
    // Molten Heat Glow (Emissive)
    // Deep crevices glow red/orange when hot
    float deep = smoothstep(0.4, 0.0, h);
    col += vec3(1.0, 0.3, 0.0) * deep * (0.5 + heat * 2.0);
    
    // Reflections (Fake Matcap style environment)
    float env = sin(normal.x * 10.0 + normal.y * 5.0);
    col += vec3(0.1) * smoothstep(0.8, 1.0, env);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// --- 3. Bioluminescence (Abyssal Neural Network) ---
// Uses Voronoi Cells for organic scale/cell patterns + Pulse waves
const bioFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec3 uColor;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${commonChunks}

  void main() {
    vec2 uv = vUv;
    uv.x *= 2.8; // Aspect fix
    
    vec2 mouse = uMouse;
    mouse.x *= 2.8;

    // Moving coordinate system
    vec2 st = uv * 6.0;
    st += vec2(uTime * 0.5, cos(uTime * 0.2));

    // Voronoi
    // Explicitly implemented simple cellular noise for control
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);
    
    float m_dist = 1.0;  // minimum distance
    
    for (int y= -1; y <= 1; y++) {
        for (int x= -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x),float(y));
            vec2 point = vec2(0.5) + 0.5*sin(uTime + 6.2831*mod289(vec3(i_st + neighbor, 0.0)).xy);
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);
            m_dist = min(m_dist, dist);
        }
    }
    
    // Cell borders
    float borders = 1.0 - smoothstep(0.0, 0.1, m_dist);
    float core = smoothstep(0.0, 0.5, m_dist);
    
    vec3 col = vec3(0.0);
    
    // Base glow (deep blue)
    col += vec3(0.0, 0.1, 0.3) * core;
    
    // Bright edges (cyan)
    col += uColor * (1.0 - m_dist) * (1.0 - m_dist);
    
    // Interactive Pulse
    float dToMouse = length(uv - mouse);
    float pulse = sin(uTime * 5.0 - dToMouse * 10.0);
    float mask = smoothstep(0.5, 0.0, dToMouse); // radius around mouse
    
    // Highlight cells near mouse
    if (mask > 0.0) {
        col += vec3(0.5, 1.0, 0.8) * (1.0 - m_dist) * mask * uHover * 2.0;
        // Ripple wave
        col += uColor * smoothstep(0.95, 1.0, pulse) * mask * uHover;
    }
    
    // Occasional random blink
    float blink = step(0.98, sin(dot(i_st, vec2(12.9898,78.233)) + uTime * 2.0));
    col += vec3(1.0) * blink * (1.0 - m_dist) * 0.5;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// --- 4. Kraken Storm (Tempest Eye) ---
// Uses Rotational Flow Fields + Procedural Lightning
const stormFragmentShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;

  ${commonChunks}

  float thunderBolt(vec2 uv, float seed, float time) {
      // Create a jagged line
      float x = uv.x;
      // Noise offset for jaggedness
      float offset = (snoise(vec2(uv.y * 10.0, time*10.0 + seed)) * 0.5 + 
                      snoise(vec2(uv.y * 30.0, time*20.0)) * 0.2) * (1.0 - abs(uv.y - 0.5)*2.0); 
      
      float line = abs(uv.x - 0.5 + offset * 0.2);
      return 0.005 / line; // Glowy line
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= 2.8; // Aspect fix
    
    vec2 center = vec2(1.4, 0.5); // approximate center adjusted for aspect
    vec2 mouse = uMouse;
    mouse.x *= 2.8;
    
    // Mouse drags the storm eye
    center = mix(center, mouse, uHover * 0.5);
    
    vec2 d = uv - center;
    float r = length(d);
    float a = atan(d.y, d.x);
    
    // Spiral flow
    float twist = 5.0; // tight spiral
    float angle = a + r * twist - uTime * 2.0;
    
    // Map back to UV space for noise lookup
    vec2 twistedUV = vec2(cos(angle), sin(angle)) * r;
    
    // Cloud layers
    float clouds = fbm(twistedUV * 3.0 + vec2(uTime*0.5));
    float storm = fbm(twistedUV * 10.0 - uTime);
    
    // Eye of the storm (clear center)
    float eye = smoothstep(0.0, 0.5, r);
    
    // Composition
    vec3 deepSea = vec3(0.02, 0.05, 0.1);
    vec3 mid = vec3(0.1, 0.3, 0.4);
    vec3 foam = vec3(0.7, 0.8, 0.9);
    
    vec3 col = mix(deepSea, mid, clouds * eye);
    col = mix(col, foam, smoothstep(0.6, 1.0, clouds * storm) * eye);
    
    // Lightning
    // Flash based on time
    float flash = step(0.98, fract(sin(uTime * 0.8) * 43758.5453));
    // Procedural bolts
    if (flash > 0.0) {
        // Random position
        float seed = floor(uTime * 0.8);
        vec2 boltUV = vUv;
        boltUV.x *= 2.8;
        // Rotate bolt randomly
        boltUV -= center;
        boltUV *= rotate2d(sin(seed)*6.0);
        boltUV += vec2(0.5);
        
        float bolt = thunderBolt(boltUV, seed, uTime);
        col += vec3(0.8, 0.9, 1.0) * bolt * clamp(1.0 - r, 0.0, 1.0);
        col += vec3(0.2, 0.3, 0.4) * bolt * 0.5; // ambient glow
    }
    
    // Rain
    float rain = snoise(vec2(uv.x * 20.0 - uTime * 10.0, uv.y * 50.0 + uTime * 20.0));
    col += vec3(0.1) * smoothstep(0.6, 1.0, rain) * 0.5;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// --- Components ---

// Static Uniform Configurations
const mistUniforms = { uColor: { value: new THREE.Color('#4ade80') } };
const bioUniforms = { uColor: { value: new THREE.Color('#06b6d4') } };
const emptyUniforms = {};

const BaseEffect: React.FC<EffectProps & { fragmentShader: string, uniformData: any }> = ({ 
    hovered, mouse, fragmentShader, uniformData 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const hoverRef = useRef(hovered);
  const mouseRef = useRef(mouse);

  hoverRef.current = hovered;
  mouseRef.current = mouse;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      ...uniformData
    }),
    [uniformData]
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      
      const targetHover = hoverRef.current ? 1.0 : 0.0;
      material.uniforms.uHover.value = THREE.MathUtils.lerp(
        material.uniforms.uHover.value,
        targetHover,
        0.05 // Slower, smoother transition
      );
      
      // Smooth mouse interpolation
      // Convert [-1, 1] range to [0, 1] for easier UV math in shader
      const targetMouseX = (mouseRef.current[0] + 1) / 2;
      const targetMouseY = (mouseRef.current[1] + 1) / 2;
      
      material.uniforms.uMouse.value.lerp(
          new THREE.Vector2(targetMouseX, targetMouseY), 
          0.1
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Plane covers the button area */}
      <planeGeometry args={[4, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

export const SpectralMistEffect: React.FC<EffectProps> = (props) => (
  <BaseEffect 
    {...props} 
    fragmentShader={mistFragmentShader} 
    uniformData={mistUniforms} 
  />
);

export const CursedGoldEffect: React.FC<EffectProps> = (props) => (
  <BaseEffect 
    {...props} 
    fragmentShader={goldFragmentShader} 
    uniformData={emptyUniforms} 
  />
);

export const BioluminescenceEffect: React.FC<EffectProps> = (props) => (
  <BaseEffect 
    {...props} 
    fragmentShader={bioFragmentShader} 
    uniformData={bioUniforms} 
  />
);

export const KrakenStormEffect: React.FC<EffectProps> = (props) => (
  <BaseEffect 
    {...props} 
    fragmentShader={stormFragmentShader} 
    uniformData={emptyUniforms} 
  />
);
