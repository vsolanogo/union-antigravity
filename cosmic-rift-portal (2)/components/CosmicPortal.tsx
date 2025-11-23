import React, { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, extend, Object3DNode } from '@react-three/fiber';
import { shaderMaterial, Points, PointMaterial } from '@react-three/drei';

// --- ADVANCED GLSL SHADERS ---

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  
  varying vec2 vUv;

  // --- Noise Functions ---
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

  // Fractional Brownian Motion
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  // Domain Warping for fluid-like nebula
  float warp(vec2 p, float t) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0)),
      fbm(p + vec2(5.2, 1.3))
    );
    vec2 r = vec2(
      fbm(p + 4.0*q + vec2(1.7, 9.2) + 0.5 * t),
      fbm(p + 4.0*q + vec2(8.3, 2.8) - 0.5 * t)
    );
    return fbm(p + 4.0*r);
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uv = vUv;
    vec2 centeredUv = (vUv - 0.5) * aspect;
    vec2 mouse = (uMouse - 0.5) * aspect;
    
    // Physics: Distance to Singularity
    float dist = length(centeredUv - mouse);
    vec2 dir = normalize(centeredUv - mouse);
    
    // 1. Dynamic Portal Shape (The "Event Horizon")
    float angle = atan(centeredUv.y - mouse.y, centeredUv.x - mouse.x);
    // Spikey, energetic noise moving around the edge
    float edgeNoise = snoise(vec2(angle * 4.0, uTime * 2.0 + dist * 5.0)) * 0.05;
    float edgeNoiseHigh = snoise(vec2(angle * 10.0, uTime * 4.0)) * 0.02;
    float radius = 0.22 + sin(uTime) * 0.01 + edgeNoise + edgeNoiseHigh;
    
    // 2. Gravitational Lensing (Chromatic Aberration Distortion)
    // Stronger distortion closer to the event horizon
    float gravStrength = 0.3 / (dist + 0.01); 
    gravStrength = clamp(gravStrength, 0.0, 3.0);
    // Mask distortion so it only affects outside the hole
    float lensMask = smoothstep(radius, radius + 0.4, dist);
    float lensFactor = gravStrength * lensMask * 0.05;

    // RGB Split for lensing
    vec2 rUV = uv - dir * lensFactor * 1.5; // Red bends most
    vec2 gUV = uv - dir * lensFactor * 1.0;
    vec2 bUV = uv - dir * lensFactor * 0.5; // Blue bends least

    // 3. Background: Volumetric Clouds
    float t = uTime * 0.1;
    // Sample FBM for clouds at displaced coordinates
    float cR = fbm(rUV * 2.0 + t);
    float cG = fbm(gUV * 2.0 + t);
    float cB = fbm(bUV * 2.0 + t);
    
    // Composite cloud color
    vec3 cloudCol = vec3(cR, cG, cB);
    // Darken clouds to make them look like storm/night
    cloudCol = pow(cloudCol, vec3(2.0)) * vec3(0.5, 0.6, 0.8) * 0.5;

    // 4. The Portal Interior (The "Singularity")
    // Use Domain Warping for a deep, complex nebula look
    vec2 portalUV = (centeredUv - mouse) * 2.0; // Zoom in
    // Parallax swirl inside
    float swirlAngle = dist * -5.0 + uTime;
    mat2 rot = mat2(cos(swirlAngle), -sin(swirlAngle), sin(swirlAngle), cos(swirlAngle));
    vec2 swirledPortalUV = rot * portalUV;
    
    float nebula = warp(swirledPortalUV * 2.0, uTime * 0.2);
    
    // Nebula Palette (Cosmic Fire)
    vec3 pCol1 = vec3(0.1, 0.0, 0.3); // Deep Purple
    vec3 pCol2 = vec3(1.0, 0.1, 0.5); // Hot Pink
    vec3 pCol3 = vec3(0.0, 0.8, 1.0); // Cyan Core
    
    vec3 interiorCol = mix(pCol1, pCol2, nebula);
    interiorCol = mix(interiorCol, pCol3, smoothstep(0.2, 0.9, nebula));
    
    // Make center incredibly bright (white hole)
    float core = 1.0 / (length(portalUV) + 0.1);
    interiorCol += vec3(1.0) * smoothstep(2.0, 5.0, core);

    // 5. Blending
    // Hard cutoff for the hole, but with an energetic rim
    float holeAlpha = smoothstep(radius, radius - 0.01, dist);
    
    // Accretion Disk / Rim Glow
    // A thin band of intense light right at the radius
    float rim = smoothstep(radius + 0.05, radius, dist) - smoothstep(radius, radius - 0.02, dist);
    // Make the rim "spark" with noise
    float spark = snoise(vec2(angle * 20.0, uTime * 10.0));
    rim *= (1.0 + spark);
    vec3 rimCol = vec3(0.5, 0.8, 1.0) * 4.0; // HDR brightness for bloom

    // Final Mix
    vec3 finalColor = mix(cloudCol, interiorCol, holeAlpha);
    finalColor += rim * rimCol;
    
    // Add stars to background?
    float starNoise = snoise(vUv * 100.0);
    if (starNoise > 0.95 && holeAlpha < 0.1) {
       finalColor += vec3(1.0) * (starNoise - 0.95) * 20.0;
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// --- MATERIAL DEFINITION ---

const CosmicPortalMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0.5, 0.5),
    uResolution: new THREE.Vector2(1, 1),
  },
  vertexShader,
  fragmentShader
);

extend({ CosmicPortalMaterial });

// Fix for TypeScript errors: Use module augmentation instead of global JSX pollution
// This ensures we add our custom element without removing existing standard elements like div, mesh, points etc.
declare module '@react-three/fiber' {
  interface ThreeElements {
    cosmicPortalMaterial: Object3DNode<THREE.ShaderMaterial, typeof CosmicPortalMaterial>;
  }
}

// --- PARTICLE SYSTEM SUB-COMPONENT ---

const PortalParticles = () => {
  const count = 1500;
  const { viewport, mouse } = useThree();
  
  // Store initial positions and random attributes
  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    const randoms = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Spread across viewport
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5; // Depth
      
      speed[i] = 0.2 + Math.random() * 0.5;
      
      randoms[i*3] = Math.random();
      randoms[i*3+1] = Math.random();
      randoms[i*3+2] = Math.random();
    }
    return { pos, speed, randoms };
  }, [viewport]);

  const pointsRef = useRef<THREE.Points>(null);
  
  // Temporary vectors for calculation to avoid GC
  const tempPos = new THREE.Vector3();
  const target = new THREE.Vector3();

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    // Map mouse to world space roughly
    target.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 0);

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;
      
      tempPos.set(positions[ix], positions[iy], positions[iz]);
      
      // Calculate distance to mouse
      const dist = tempPos.distanceTo(target);
      
      // Gravity logic: The closer you are, the faster you get pulled
      // Add a minimum distance to stop them from disappearing instantly
      const gravityStrength = Math.min(10.0, 5.0 / (dist + 0.1)) * delta * particles.speed[i];
      
      // Direction to mouse
      const dirX = (target.x - positions[ix]) * gravityStrength;
      const dirY = (target.y - positions[iy]) * gravityStrength;
      const dirZ = (target.z - positions[iz]) * gravityStrength;
      
      // Orbit / Swirl logic
      // Add a tangential force
      const swirlX = - (target.y - positions[iy]) * gravityStrength * 2.0;
      const swirlY = (target.x - positions[ix]) * gravityStrength * 2.0;

      // Update position
      positions[ix] += dirX + swirlX;
      positions[iy] += dirY + swirlY;
      positions[iz] += dirZ;

      // Reset if too close (sucked in) or too far (glitch safety)
      if (dist < 0.2 || dist > 20) {
        // Respawn at edge
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(viewport.width, viewport.height);
        positions[ix] = target.x + Math.cos(angle) * radius;
        positions[iy] = target.y + Math.sin(angle) * radius;
        positions[iz] = (Math.random() - 0.5) * 5;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.pos.length / 3}
          array={particles.pos}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        vertexColors={false}
        color="#aaddff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// --- MAIN COMPONENT ---

export const CosmicPortal: React.FC = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      
      const targetMouse = new THREE.Vector2(
        (state.mouse.x + 1) * 0.5,
        (state.mouse.y + 1) * 0.5
      );
      
      // Slightly looser lerp for a heavier feel
      materialRef.current.uniforms.uMouse.value.lerp(targetMouse, 0.08);
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <>
      <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} /> 
        <cosmicPortalMaterial
          ref={materialRef}
          key={CosmicPortalMaterial.key}
          transparent={true}
        />
      </mesh>
      
      {/* Particle System Layer */}
      <PortalParticles />
    </>
  );
};