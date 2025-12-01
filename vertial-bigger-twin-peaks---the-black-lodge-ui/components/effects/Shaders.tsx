import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import React from 'react';

// =====================================================================
// SHARED NOISE FUNCTIONS (Inlined to avoid dependency complexity)
// =====================================================================
const NOISE_GLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
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

  // fractal brownian motion
  float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
          value += amplitude * snoise(st);
          st *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }
`;

// =====================================================================
// 1. RED ROOM VELVET SHADER
// Techniques: Anisotropic Sheen, Micro-facet noise, Rim lighting
// =====================================================================
const RedRoomMaterial = shaderMaterial(
  { uTime: 0, uHover: 0, uColor: new THREE.Color('#500000'), uRimColor: new THREE.Color('#ff3333') },
  // Vertex
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    
    uniform float uTime;
    uniform float uHover;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Heavy drape simulation using low freq sine waves
      float fold = sin(pos.x * 1.5 + uTime * 0.2) * 0.15;
      float microFold = sin(pos.y * 10.0 + pos.x * 5.0) * 0.02;
      
      // Expand slightly on hover
      pos += normal * (fold + microFold + uHover * 0.1);
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalMatrix * normal;
      vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    uniform vec3 uColor;
    uniform vec3 uRimColor;
    uniform float uHover;
    uniform float uTime;
    
    ${NOISE_GLSL}
    
    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewPosition);
      
      // Velvet Sheen Calculation (High scatter at glancing angles)
      float dotNV = dot(N, V);
      float rim = 1.0 - max(dotNV, 0.0);
      rim = pow(rim, 2.5); // Sharpen the rim
      
      // Micro-texture noise for fabric grain
      float grain = snoise(vUv * 150.0) * 0.05;
      
      // Dynamic lighting folds
      float folds = snoise(vec2(vUv.x * 3.0 + uTime * 0.1, vUv.y * 0.5));
      
      // Base color with shadows in folds
      vec3 base = uColor * (0.6 + 0.4 * folds);
      
      // Sheen color (Rim light)
      vec3 sheen = uRimColor * rim * 1.5;
      
      // Anisotropic highlight (fake) - Light catching vertical fibers
      float aniso = sin(vUv.x * 100.0) * 0.1;
      
      // Combine
      vec3 finalColor = base + sheen + grain + aniso;
      
      // Hover effect - Pulsing Rim
      finalColor += uRimColor * uHover * 0.4 * (0.5 + 0.5 * sin(uTime * 10.0));
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// =====================================================================
// 2. ZIG ZAG FLOOR SHADER
// Techniques: Analytical Anti-Aliasing, Fresnel Reflections, Gloss Map
// =====================================================================
const ZigZagMaterial = shaderMaterial(
  { uTime: 0, uHover: 0, uScale: 6.0 },
  // Vertex
  `
    varying vec2 vUv;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalMatrix * normal;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment
  `
    varying vec2 vUv;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    
    uniform float uTime;
    uniform float uHover;
    uniform float uScale;
    
    void main() {
      // Perspective correct mapping
      vec2 uv = vUv * uScale;
      
      // Movement
      uv.y += uTime * 0.2;
      
      // Chevron Pattern Logic
      // zigzag = |fract(x) - 0.5| * 2
      vec2 grid = fract(uv);
      float zigzag = abs(grid.x - 0.5) * 2.0;
      float dist = abs(grid.y - zigzag); // Distance to the line
      
      // Analytical Anti-Aliasing using screen-space derivatives
      // This keeps lines sharp even at distance
      float w = fwidth(dist); 
      // Create pattern: 0 for black, 1 for white
      // We want the split at 0.5. using smoothstep for AA
      float pattern = smoothstep(0.5 - w, 0.5 + w, dist);
      
      // Invert pattern based on checkerboard logic to get the chevron stripes
      // Actually simpler logic for pure chevron:
      float chevron = abs(fract(uv.x) - 0.5) * 2.0;
      // Combine with Y
      float mask = step(0.5, abs(fract(uv.y + (fract(uv.x) > 0.5 ? 0.0 : 0.5)) - 0.5) * 2.0); // Simple Blocky
      
      // Better Chevron:
      float p = fract(uv.y + (uv.x));
      float stripe = abs(p - 0.5) * 2.0;
      // Add opposing diagonal
      float p2 = fract(uv.y - (uv.x));
      float stripe2 = abs(p2 - 0.5) * 2.0;
      
      // Let's stick to the visual classic:
      float wave = fract(uv.y + (abs(fract(uv.x)-0.5)*2.0));
      float aa = fwidth(wave);
      float finalPattern = smoothstep(0.5-aa, 0.5+aa, wave);
      
      vec3 colBlack = vec3(0.05, 0.02, 0.02);
      vec3 colWhite = vec3(0.95, 0.90, 0.85);
      
      vec3 color = mix(colBlack, colWhite, finalPattern);
      
      // Reflection / Glossiness
      // Fresnel effect for floor polish
      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 5.0);
      
      // Fake environment reflection (blueish tint from "moonlight" or stage light)
      vec3 reflection = vec3(0.2, 0.3, 0.5) * fresnel;
      
      color += reflection * 0.5;
      
      // Dirt/Grunge overlay
      // float grunge = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
      // color *= (0.9 + 0.1 * grunge);
      
      // Hover Glitch
      if (uHover > 0.0) {
        float glitch = sin(uv.y * 50.0 + uTime * 20.0);
        if (glitch > 0.9) color = 1.0 - color;
      }
      
      // Vignette
      float vig = 1.0 - length(vUv - 0.5) * 1.5;
      color *= clamp(vig + 0.5, 0.0, 1.0);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// =====================================================================
// 3. REALISTIC FIRE SHADER
// Techniques: Domain Warping, Blackbody Radiation Ramp, Turbulence
// =====================================================================
const FireMaterial = shaderMaterial(
  { uTime: 0, uHover: 0 },
  // Vertex
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment
  `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uHover;
    
    ${NOISE_GLSL}
    
    // Domain Warping for fluid-like motion
    float warpPattern(vec2 p, out vec2 q, out vec2 r, float time) {
        q.x = fbm(p + vec2(0.0, 0.0));
        q.y = fbm(p + vec2(5.2, 1.3));
        
        r.x = fbm(p + 4.0 * q + vec2(1.7, 9.2) + 0.15 * time);
        r.y = fbm(p + 4.0 * q + vec2(8.3, 2.8) + 0.126 * time);
        
        return fbm(p + 4.0 * r);
    }
    
    void main() {
      vec2 uv = vUv;
      // Center and scale UVs
      uv.y *= 0.8; // Squish slightly
      
      float time = uTime * 1.5;
      
      vec2 q, r;
      float noiseVal = warpPattern(uv * 3.0, q, r, time);
      
      // Shape the fire (Masking)
      // Fade out at top
      float yFade = smoothstep(0.0, 1.0, 1.0 - vUv.y); 
      // Fade out at sides
      float xFade = smoothstep(0.6, 0.2, abs(vUv.x - 0.5));
      
      // Intensity map
      float fire = (noiseVal * noiseVal) * yFade * xFade * 2.5;
      
      // Add hover intensity
      fire += uHover * 0.5 * xFade;
      
      // Blackbody Color Ramp (Heat)
      // Low = Dark Red, Mid = Orange, High = Yellow/White
      vec3 col = vec3(0.0);
      col = mix(vec3(0.0), vec3(0.5, 0.0, 0.0), smoothstep(0.0, 0.2, fire));
      col = mix(col, vec3(1.0, 0.3, 0.0), smoothstep(0.2, 0.5, fire));
      col = mix(col, vec3(1.0, 0.9, 0.1), smoothstep(0.5, 0.8, fire));
      col = mix(col, vec3(1.0, 1.0, 1.0), smoothstep(0.8, 1.0, fire));
      
      // Alpha calc
      float alpha = smoothstep(0.1, 0.2, fire);
      
      gl_FragColor = vec4(col, alpha);
    }
  `
);

// =====================================================================
// 4. ELECTRICITY SHADER
// Techniques: Voronoi Distance Fields, Branching, HDR Bloom
// =====================================================================
const ElectricityMaterial = shaderMaterial(
  { uTime: 0, uHover: 0 },
  // Vertex
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment
  `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uHover;
    
    // Hash function for random
    float hash(float n) { return fract(sin(n) * 43758.5453123); }
    
    float noise1(float x) {
        float i = floor(x);
        float f = fract(x);
        float u = f * f * (3.0 - 2.0 * f);
        return mix(hash(i), hash(i + 1.0), u);
    }

    // Lightning bolt function
    float bolt(vec2 uv, float time, float seed) {
        // Main path jitter
        float x = uv.x;
        // Scroll texture
        float t = time * 2.0;
        
        // FBM for the path shape
        float path = 0.0;
        float amp = 0.2;
        float freq = 2.0;
        for(int i=0; i<4; i++){
            path += (noise1(x * freq + t + seed * 10.0) - 0.5) * amp;
            amp *= 0.5;
            freq *= 2.0;
        }
        
        // Distance to the path
        float d = abs(uv.y - 0.5 - path);
        
        // Thickness falloff (Glow)
        // Sharp core, wide glow
        float intensity = 0.002 / (d + 0.0001); // Core
        intensity += 0.01 / (d + 0.01);         // Glow
        
        // Mask ends
        intensity *= smoothstep(0.0, 0.1, x) * smoothstep(1.0, 0.9, x);
        
        // Flicker
        float flicker = noise1(time * 20.0 + seed * 100.0);
        if(flicker < 0.5) intensity = 0.0;
        
        return intensity;
    }

    void main() {
        vec2 uv = vUv;
        float time = uTime;
        
        vec3 color = vec3(0.0);
        
        // Multiple bolts
        float b1 = bolt(uv, time, 0.0);
        float b2 = bolt(uv, time + 0.5, 1.0);
        float b3 = bolt(uv, time + 0.2, 2.0) * 0.5; // Fainter bolt
        
        float total = b1 + b2 + b3;
        
        // Color mapping - Electric Blue/White
        vec3 blue = vec3(0.2, 0.6, 1.0);
        vec3 white = vec3(1.0, 1.0, 1.0);
        
        color = mix(blue, white, clamp(total * 0.1, 0.0, 1.0)) * total;
        
        // Hover adds intensity and more chaotic arcs
        if (uHover > 0.0) {
             float b4 = bolt(uv, time * 2.0, 5.0);
             color += vec3(0.8, 0.2, 1.0) * b4; // Purple arc on hover
        }

        // Clamp alpha
        float alpha = smoothstep(0.01, 1.0, total);
        
        gl_FragColor = vec4(color, alpha);
    }
  `
);

// =====================================================================
// 5. SYCAMORE / FLESH SHADER
// Techniques: Subsurface Scattering Approximation (Wrap Light), Organic Cell Noise
// =====================================================================
const SycamoreMaterial = shaderMaterial(
    { uTime: 0 },
    // Vertex
    `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      uniform float uTime;
      
      ${NOISE_GLSL}

      void main() {
        vUv = uv;
        
        vec3 pos = position;
        
        // Breathing animation
        float breath = sin(uTime * 1.5) * 0.02;
        pos += normal * breath;
        
        // Low frequency wobble (The Evolution moves strangely)
        float wobble = snoise(vec2(pos.y * 0.5, uTime * 0.2)) * 0.1;
        pos.x += wobble;
        
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    // Fragment
    `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      uniform float uTime;
      
      ${NOISE_GLSL}
      
      // Cellular noise for skin pores/texture
      float cellular(vec2 P) {
          vec2 Pi = floor(P);
          vec2 Pf = P - Pi;
          float min_dist = 1.0;
          for(int y=-1; y<=1; y++) {
              for(int x=-1; x<=1; x++) {
                  vec2 neighbor = vec2(float(x), float(y));
                  vec2 point = vec2(snoise(Pi + neighbor)); // Simple hash offset
                  point = 0.5 + 0.5*sin(uTime * 0.1 + 6.2831*point);
                  vec2 diff = neighbor + point - Pf;
                  float dist = length(diff);
                  min_dist = min(min_dist, dist);
              }
          }
          return min_dist;
      }

      void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(vec3(0.5, 1.0, 1.0)); // Fixed light source
        
        // Organic Skin Texture
        float cells = cellular(vUv * 20.0);
        float noise = snoise(vUv * 5.0 + uTime * 0.1);
        
        vec3 fleshColor = vec3(0.85, 0.6, 0.5); // Pale flesh
        vec3 bruiseColor = vec3(0.4, 0.2, 0.3); // Darker areas
        
        // Mix colors based on noise
        vec3 albedo = mix(fleshColor, bruiseColor, smoothstep(0.3, 0.8, cells));
        albedo = mix(albedo, vec3(0.9, 0.8, 0.7), noise * 0.3);
        
        // Lighting: Half-Lambert / Wrap lighting for SSS look
        float NdotL = dot(normal, lightDir);
        float wrap = 0.5;
        float diffuse = max(0.0, (NdotL + wrap) / (1.0 + wrap));
        
        // Rim light (Fresnel) for slime/wetness
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
        
        // Specular highlight (wet skin)
        vec3 halfDir = normalize(lightDir + viewDir);
        float NdotH = dot(normal, halfDir);
        float specular = pow(max(0.0, NdotH), 32.0);
        
        vec3 finalColor = albedo * diffuse + (vec3(1.0) * specular * 0.4) + (vec3(0.5, 0.6, 0.7) * fresnel * 0.2);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
)

extend({ RedRoomMaterial, ZigZagMaterial, FireMaterial, ElectricityMaterial, SycamoreMaterial });
