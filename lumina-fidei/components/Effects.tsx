import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- Shared Shader Utils (Noise & FBM) ---
const shaderUtils = `
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

  // Fractal Brownian Motion
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

// --- HALO: The Celestial Light (Sacred Geometry & God Rays) ---
const haloFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uHover;
  varying vec2 vUv;
  
  ${shaderUtils}

  void main() {
    // Center UVs and correct aspect somewhat (assuming approx 3:1 button but drawn on square plane)
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Polar coordinates
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    
    // God rays effect
    float rays = 0.0;
    for(int i=0; i<3; i++) {
      float t = uTime * (0.2 + float(i)*0.1) * (1.0 + uHover);
      rays += sin(a * (10.0 + float(i)*5.0) + t) * 0.5 + 0.5;
    }
    rays = rays / 3.0;
    
    // Intensity gradient from center
    float core = 0.1 / (r + 0.05 * sin(uTime * 3.0));
    
    // Sacred geometry ring
    float ringNoise = snoise(vec2(a * 4.0, uTime * 0.5));
    float ring = smoothstep(0.05, 0.02, abs(r - 0.6 + ringNoise * 0.05));
    
    // Combine
    float brightness = core + rays * 0.5 * smoothstep(0.8, 0.0, r);
    brightness += ring * 0.5; // Add the ring
    
    // Color grading
    vec3 col = uColor * brightness;
    
    // Sparkles
    float sparkle = max(0.0, snoise(uv * 10.0 + uTime) - 0.8) * 20.0;
    col += vec3(1.0) * sparkle;
    
    // Enhance on hover
    if (uHover > 0.0) {
        col *= mix(1.0, 1.5, uHover);
        col += vec3(1.0, 0.8, 0.5) * core * uHover; // Hot core
    }

    // Vignette/Mask for button shape
    float alpha = smoothstep(1.0, 0.5, r);
    
    gl_FragColor = vec4(col, alpha);
  }
`;

// --- PASSION: The Divine Fire (Domain Warping Liquid Fire) ---
const passionFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uHover;
  varying vec2 vUv;

  ${shaderUtils}

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.y += 0.2; // Shift center down slightly
    
    // Domain warping for fluid fire look
    vec2 q = vec2(0.);
    q.x = fbm( uv + 0.00*uTime);
    q.y = fbm( uv + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( uv + 1.0*q + vec2(1.7,9.2)+ 0.15*uTime );
    r.y = fbm( uv + 1.0*q + vec2(8.3,2.8)+ 0.126*uTime);

    float f = fbm(uv+r);

    // Color mixing based on noise value
    vec3 c1 = vec3(0.5, 0.0, 0.0); // Dark red
    vec3 c2 = vec3(1.0, 0.2, 0.0); // Bright orange
    vec3 c3 = vec3(1.0, 0.9, 0.5); // Yellow core
    
    vec3 col = mix(c1, c2, f);
    col = mix(col, c3, pow(f, 3.0)); // Highlights
    
    // Heartbeat pulse
    float beat = 1.0 + 0.2 * sin(uTime * 4.0) * sin(uTime * 4.0);
    if(uHover > 0.0) beat = 1.0 + 0.5 * sin(uTime * 12.0); // Fast beat on hover
    
    // Vignette & shaping
    float d = length(uv);
    float mask = smoothstep(0.8, 0.2, d);
    
    // Add "Veins"
    float veins = smoothstep(0.4, 0.5, snoise(uv * 5.0 + r));
    col += uColor * veins * 0.5;

    gl_FragColor = vec4(col * beat, mask * 0.9);
  }
`;

// Simple Vertex Shader (Shared)
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

interface EffectProps {
  hover: boolean;
}

export const HaloEffect: React.FC<EffectProps> = ({ hover }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#FFD700') },
      uHover: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (mesh.current) {
      uniforms.uTime.value = state.clock.getElapsedTime();
      uniforms.uHover.value = THREE.MathUtils.lerp(uniforms.uHover.value, hover ? 1 : 0, 0.05);
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[3, 3]} /> {/* Increased size for spill-over */}
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={haloFragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending} /* Makes it glowy */
        depthWrite={false}
      />
    </mesh>
  );
};

export const PassionEffect: React.FC<EffectProps> = ({ hover }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#ff2a00') },
      uHover: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (mesh.current) {
      uniforms.uTime.value = state.clock.getElapsedTime();
      uniforms.uHover.value = THREE.MathUtils.lerp(uniforms.uHover.value, hover ? 1 : 0, 0.05);
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[3, 3]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={passionFragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};