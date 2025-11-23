import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

// --- 1. Advanced Red Room Velvet Shader ---
// Uses rim lighting and normal perturbation to simulate heavy fabric
const RedRoomMaterial = shaderMaterial(
  { uTime: 0, uHover: 0, uColor: new THREE.Color('#600505'), uRimColor: new THREE.Color('#ff5555') },
  // Vertex
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    uniform float uTime;
    uniform float uHover;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Complex cloth wave
      float wave = sin(pos.x * 2.0 + uTime * 0.5) * 0.1;
      float wave2 = cos(pos.y * 3.0 + uTime * 0.3) * 0.05;
      
      // Hover bulge
      float hoverBulge = sin(uv.x * 3.14159) * sin(uv.y * 3.14159) * uHover * 0.2;
      
      vec3 newPos = pos + normal * (wave + wave2 + hoverBulge);
      
      vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalMatrix * normal;
      
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
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Base velvet color
      vec3 color = uColor;
      
      // Darker valleys for cloth folds
      float folds = sin(vUv.x * 20.0 + uTime) * 0.5 + 0.5;
      color *= 0.8 + 0.2 * folds;
      
      // Rim lighting (The Fresnel effect for velvet sheen)
      float rim = 1.0 - max(dot(viewDir, normal), 0.0);
      rim = pow(rim, 3.0);
      
      vec3 glow = uRimColor * rim * 0.8;
      
      // Extra glow on hover
      glow += uRimColor * uHover * 0.5;
      
      gl_FragColor = vec4(color + glow, 1.0);
    }
  `
);

// --- 2. High-Contrast Zig Zag Floor Shader ---
const ZigZagMaterial = shaderMaterial(
  { uTime: 0, uHover: 0, uScale: 4.0 },
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
    uniform float uScale;
    
    void main() {
      vec2 uv = vUv * uScale;
      
      // Animate slowly
      uv.y += uTime * 0.2;
      
      // Zig zag pattern math
      vec2 pos = fract(uv);
      float zigzag = abs(pos.x - 0.5) * 2.0;
      float wave = abs(pos.y - zigzag);
      
      // Hard step for sharp floor tiles
      float pattern = step(0.5, wave + 0.01); // 0.01 bias to fix artifacts
      
      // Colors
      vec3 black = vec3(0.08, 0.05, 0.05);
      vec3 white = vec3(0.9, 0.88, 0.85);
      
      // Hover distortion (Glitch)
      if (uHover > 0.01) {
         float noise = fract(sin(dot(vUv * uTime, vec2(12.9898, 78.233))) * 43758.5453);
         if (noise > 0.9) white = vec3(1.0, 0.0, 0.0); // Random red pixels
         uv.x += sin(uv.y * 10.0 + uTime * 20.0) * 0.02 * uHover;
      }
      
      vec3 color = mix(white, black, pattern);
      
      // Vignette
      float dist = distance(vUv, vec2(0.5));
      color *= smoothstep(0.8, 0.2, dist);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// --- 3. Volumetric Fire Shader ---
const FireMaterial = shaderMaterial(
  { uTime: 0, uHover: 0 },
  // Vertex
  `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      vUv = uv;
      vec3 pos = position;
      // Heat distortion
      pos.x += sin(uv.y * 10.0 + uTime * 2.0) * 0.1 * uv.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment
  `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uHover;
    
    // Simplex 2D noise
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

    void main() {
      vec2 uv = vUv;
      float time = uTime * 2.0;
      
      // Fire noise layers
      float n1 = snoise(uv * 3.0 - vec2(0.0, time));
      float n2 = snoise(uv * 6.0 - vec2(0.0, time * 1.5));
      
      float combined = n1 + n2 * 0.5;
      
      // Shape mask (flame shape)
      float mask = smoothstep(0.1, 0.8, 1.0 - uv.y); // Fade top
      mask *= smoothstep(0.6, 0.2, abs(uv.x - 0.5)); // Fade sides
      
      float intensity = (combined + 0.5) * mask * (1.5 + uHover);
      
      // Color ramp
      vec3 c1 = vec3(0.1, 0.0, 0.0); // Dark Red
      vec3 c2 = vec3(1.0, 0.4, 0.0); // Orange
      vec3 c3 = vec3(1.0, 1.0, 0.8); // White hot
      
      vec3 color = mix(c1, c2, intensity);
      color = mix(color, c3, smoothstep(0.6, 1.0, intensity));
      
      // Black background
      float alpha = smoothstep(0.2, 0.3, intensity);
      
      gl_FragColor = vec4(color, alpha);
    }
  `
);

// --- 4. Crackling Electricity Shader ---
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

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
        vec2 uv = vUv;
        float t = uTime * 10.0;
        
        // Main beam
        float noise = random(vec2(uv.x, floor(t)));
        float offset = (noise - 0.5) * 0.2; // Jitter
        
        float beamWidth = 0.005 * (1.0 + uHover * 2.0);
        float dist = abs(uv.y - 0.5 + offset);
        float glow = beamWidth / dist;
        
        // Secondary arcs
        float noise2 = random(vec2(uv.x * 0.5, floor(t * 0.8)));
        float offset2 = (noise2 - 0.5) * 0.5;
        float glow2 = (beamWidth * 0.5) / abs(uv.y - 0.5 + offset2);
        
        vec3 color = vec3(0.4, 0.8, 1.0) * (glow + glow2);
        
        // Pulse
        color *= 1.0 + sin(t) * 0.2;
        
        gl_FragColor = vec4(color, min(1.0, (glow + glow2) * 2.0));
    }
  `
);

extend({ RedRoomMaterial, ZigZagMaterial, FireMaterial, ElectricityMaterial });

// Add types for JSX
declare module '@react-three/fiber' {
  interface ThreeElements {
    redRoomMaterial: any;
    zigZagMaterial: any;
    fireMaterial: any;
    electricityMaterial: any;
  }
}
