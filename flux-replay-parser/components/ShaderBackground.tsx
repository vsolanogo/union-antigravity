import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// --- SHADER CODE ---
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uIntensity;
  
  varying vec2 vUv;

  // Simplex 3D Noise 
  // by Ian McEwan, Ashima Arts
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //  x0 = x0 - 0.0 + 0.0 * C 
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    // Permutations
    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients
    float n_ = 1.0/7.0; // N=7
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vec2 uv = vUv;
    
    // Aspect ratio correction
    float aspect = uResolution.x / uResolution.y;
    
    // Warping coordinate
    vec2 q = vec2(0.);
    q.x = snoise(vec3(uv.x * 0.8, uv.y * 0.8, uTime * 0.1));
    q.y = snoise(vec3(uv.x * 0.8, uv.y * 0.8, uTime * 0.1 + 10.0));
    
    // Second layer of warp
    vec2 r = vec2(0.);
    r.x = snoise(vec3(uv.x * 1.5 + 3.0 * q.x, uv.y * 1.5 + 3.0 * q.y, uTime * 0.15));
    r.y = snoise(vec3(uv.x * 1.5 + 3.0 * q.x, uv.y * 1.5 + 3.0 * q.y, uTime * 0.15 + 2.0));
    
    float f = snoise(vec3(uv.x * 1.0 + 2.0 * r.x, uv.y * 1.0 + 2.0 * r.y, uTime * 0.1));
    
    // Color Palette Mixing (Deep Cyberpunk)
    // Deep Blue/Black base
    vec3 colorA = vec3(0.05, 0.05, 0.1); 
    // Neon Cyan
    vec3 colorB = vec3(0.0, 0.8, 0.9);
    // Neon Purple
    vec3 colorC = vec3(0.6, 0.0, 0.8);
    
    vec3 finalColor = mix(colorA, colorB, clamp(f*f * 4.0, 0.0, 1.0));
    finalColor = mix(finalColor, colorC, clamp(length(q), 0.0, 1.0));
    
    // Mouse interaction ripple
    float dist = distance(uv * vec2(aspect, 1.0), uMouse * vec2(aspect, 1.0));
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    finalColor += vec3(0.2, 0.4, 1.0) * glow * 0.3;
    
    // Scanlines for tech feel
    float scanline = sin(uv.y * 200.0 + uTime * 5.0) * 0.02;
    finalColor += scanline;
    
    // Intensity modifier (for when parsing is active)
    finalColor *= (0.8 + 0.2 * sin(uTime));
    if (uIntensity > 1.5) {
        finalColor = mix(finalColor, vec3(1.0), 0.1); // flash slightly white/bright
    }

    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 1.5;
    finalColor *= clamp(vignette + 0.2, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface ShaderPlaneProps {
  intensity: number;
}

const ShaderPlane: React.FC<ShaderPlaneProps> = ({ intensity }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uIntensity: { value: intensity },
    }),
    [size]
  );

  // Update uniforms on frame
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uIntensity.value,
        intensity,
        0.05
      );
      
      // Gentle mouse lag for fluid feel
      const mouseLerp = 0.1;
      materialRef.current.uniforms.uMouse.value.x = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uMouse.value.x,
        state.pointer.x * 0.5 + 0.5, // Convert -1..1 to 0..1
        mouseLerp
      );
      materialRef.current.uniforms.uMouse.value.y = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uMouse.value.y,
        state.pointer.y * 0.5 + 0.5,
        mouseLerp
      );
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export const ShaderBackground: React.FC<{ intensity: number }> = ({ intensity }) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 2]} // Handle high DPI screens
        gl={{ antialias: true }}
      >
        <ShaderPlane intensity={intensity} />
      </Canvas>
    </div>
  );
};