import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ButtonEffect } from '../types';
import { 
  basicVertexShader, 
  neonFragmentShader, 
  liquidFragmentShader, 
  liquidVertexShader,
  holographicFragmentShader,
  warpVertexShader,
  warpFragmentShader,
  glyphVertexShader,
  glyphFragmentShader
} from '../utils/shaders';

interface EffectCanvasProps {
  effect: ButtonEffect;
  isHovered: boolean;
  isPressed: boolean;
  primaryColor: string;
  secondaryColor: string;
}

// --- Neon Effect Component ---
const NeonEffect: React.FC<Omit<EffectCanvasProps, 'effect'>> = ({ isHovered, isPressed, primaryColor, secondaryColor }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uPress: { value: 0 },
    uColor1: { value: new THREE.Color(primaryColor) },
    uColor2: { value: new THREE.Color(secondaryColor) },
  }), [primaryColor, secondaryColor]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    if (material.uniforms) {
        material.uniforms.uTime.value = state.clock.elapsedTime;
        material.uniforms.uHover.value = THREE.MathUtils.lerp(material.uniforms.uHover.value, isHovered ? 1 : 0, 0.1);
        material.uniforms.uPress.value = THREE.MathUtils.lerp(material.uniforms.uPress.value, isPressed ? 1 : 0, 0.2);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4.5, 2.5]} />
      <shaderMaterial
        vertexShader={basicVertexShader}
        fragmentShader={neonFragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// --- Liquid Effect Component ---
const LiquidEffect: React.FC<Omit<EffectCanvasProps, 'effect'>> = ({ isHovered, isPressed, primaryColor, secondaryColor }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uPress: { value: 0 },
    uColor1: { value: new THREE.Color(primaryColor) },
    uColor2: { value: new THREE.Color(secondaryColor) },
  }), [primaryColor, secondaryColor]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    if (material.uniforms) {
        material.uniforms.uTime.value = state.clock.elapsedTime;
        material.uniforms.uHover.value = THREE.MathUtils.lerp(material.uniforms.uHover.value, isHovered ? 1 : 0, 0.05);
        material.uniforms.uPress.value = THREE.MathUtils.lerp(material.uniforms.uPress.value, isPressed ? 1 : 0, 0.2);
    }
    // Slight tilt based on hover
    if (isHovered) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.05;
        meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.5) * 0.05;
    } else {
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4, 2, 128, 128]} />
      <shaderMaterial
        vertexShader={liquidVertexShader}
        fragmentShader={liquidFragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

// --- Holographic Effect Component ---
const HolographicEffect: React.FC<Omit<EffectCanvasProps, 'effect'>> = ({ isHovered, isPressed, primaryColor }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uPress: { value: 0 },
    uColor1: { value: new THREE.Color(primaryColor) },
  }), [primaryColor]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    if (material.uniforms) {
        material.uniforms.uTime.value = state.clock.elapsedTime;
        material.uniforms.uHover.value = THREE.MathUtils.lerp(material.uniforms.uHover.value, isHovered ? 1 : 0, 0.1);
        material.uniforms.uPress.value = THREE.MathUtils.lerp(material.uniforms.uPress.value, isPressed ? 1 : 0, 0.5); 
    }
  });

  return (
    <mesh ref={meshRef} scale={[2.1, 1.1, 1]}>
      <planeGeometry args={[2, 1]} />
      <shaderMaterial
        vertexShader={basicVertexShader}
        fragmentShader={holographicFragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// --- Voxel Storm Effect Component (Updated to Tetrahedrons) ---
const VoxelStormEffect: React.FC<Omit<EffectCanvasProps, 'effect'>> = ({ isHovered, isPressed, primaryColor, secondaryColor }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 200; // More particles
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const particles = useMemo(() => {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push({
                angle: Math.random() * Math.PI * 2,
                radius: 1.5 + Math.random() * 1.5,
                y: (Math.random() - 0.5) * 1.0,
                speed: 0.2 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2,
            });
        }
        return data;
    }, [count]);

    const color1 = useMemo(() => new THREE.Color(primaryColor), [primaryColor]);
    const color2 = useMemo(() => new THREE.Color(secondaryColor), [secondaryColor]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.elapsedTime;

        particles.forEach((p, i) => {
            let x, y, z, s, rotX, rotY;

            if (isPressed) {
                // EXPLOSION MODE
                const blast = 6.0;
                x = Math.cos(p.angle) * p.radius * blast * (Math.sin(t * 10.0) * 0.5 + 0.5);
                y = Math.sin(p.angle) * p.radius * blast;
                z = p.y * blast;
                s = 0.05; 
                rotX = t * 10.0;
                rotY = t * 10.0;
            } else if (isHovered) {
                // MAGNETIC FIELD MODE
                // Particles organize into a tight spinning ring
                const r = 1.2 + Math.sin(t * 5.0 + p.phase) * 0.1;
                x = Math.cos(p.angle + t * 2.0) * r;
                y = Math.sin(p.angle + t * 2.0) * r * 0.4; // flatten ring
                z = Math.sin(t * 3.0 + p.phase) * 0.5;
                
                s = 0.15;
                rotX = t * 2.0;
                rotY = p.angle;
            } else {
                // CHAOS CLOUD
                const r = p.radius;
                const a = p.angle + t * p.speed * 0.1;
                x = Math.cos(a) * r;
                y = Math.sin(a * 1.3) * 0.8;
                z = Math.sin(a * 0.5) * 0.5;
                s = 0.08;
                rotX = t + p.phase;
                rotY = t + p.phase;
            }

            dummy.position.set(x, y, z);
            dummy.rotation.set(rotX, rotY, 0);
            dummy.scale.setScalar(s);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <tetrahedronGeometry args={[1, 0]} /> 
            <meshStandardMaterial 
                color={color1} 
                emissive={color2}
                emissiveIntensity={isPressed ? 3.0 : (isHovered ? 1.0 : 0.2)}
                toneMapped={false}
                flatShading={true}
            />
        </instancedMesh>
    );
};

// --- Warp Drive Effect Component ---
const WarpDriveEffect: React.FC<Omit<EffectCanvasProps, 'effect'>> = ({ isHovered, isPressed, primaryColor, secondaryColor }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 400;

  // Attributes
  const { positions, sizes, speeds, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const sp = new Float32Array(count);
    const rn = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20; // Deep Z depth
      
      sz[i] = Math.random() * 2.0 + 0.5;
      sp[i] = Math.random() * 1.0 + 0.1;
      
      rn[i * 3] = Math.random();
      rn[i * 3 + 1] = Math.random();
      rn[i * 3 + 2] = Math.random();
    }
    return { positions: pos, sizes: sz, speeds: sp, randoms: rn };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: 0 },
    uColor1: { value: new THREE.Color(primaryColor) },
    uColor2: { value: new THREE.Color(secondaryColor) },
  }), [primaryColor, secondaryColor]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const material = pointsRef.current.material as THREE.ShaderMaterial;
    
    const targetSpeed = isPressed ? 2.0 : (isHovered ? 0.5 : 0.05);
    material.uniforms.uSpeed.value = THREE.MathUtils.lerp(material.uniforms.uSpeed.value, targetSpeed, 0.05);
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={count} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial 
        vertexShader={warpVertexShader}
        fragmentShader={warpFragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// --- Cyber Glyph Effect ---
const CyberGlyphEffect: React.FC<Omit<EffectCanvasProps, 'effect'>> = ({ isHovered, isPressed, primaryColor, secondaryColor }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uPress: { value: 0 },
    uColor1: { value: new THREE.Color(primaryColor) },
    uColor2: { value: new THREE.Color(secondaryColor) },
  }), [primaryColor, secondaryColor]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uHover.value = THREE.MathUtils.lerp(material.uniforms.uHover.value, isHovered ? 1 : 0, 0.1);
    material.uniforms.uPress.value = THREE.MathUtils.lerp(material.uniforms.uPress.value, isPressed ? 1 : 0, 0.2);
    
    // Rotate
    meshRef.current.rotation.y += 0.01 + (isHovered ? 0.05 : 0);
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.2;
  });

  return (
    <mesh ref={meshRef} scale={[0.8, 0.8, 0.8]}>
      <torusKnotGeometry args={[1, 0.3, 100, 16]} />
      <shaderMaterial 
        vertexShader={glyphVertexShader}
        fragmentShader={glyphFragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const EffectCanvas: React.FC<EffectCanvasProps> = (props) => {
  const { effect } = props;

  switch (effect) {
    case ButtonEffect.NEON_PULSE:
      return <NeonEffect {...props} />;
    case ButtonEffect.LIQUID_METAL:
      return <LiquidEffect {...props} />;
    case ButtonEffect.VOXEL_STORM:
      return <VoxelStormEffect {...props} />;
    case ButtonEffect.HOLOGRAPHIC:
      return <HolographicEffect {...props} />;
    case ButtonEffect.WARP_DRIVE:
      return <WarpDriveEffect {...props} />;
    case ButtonEffect.CYBER_GLYPH:
      return <CyberGlyphEffect {...props} />;
    default:
      return null;
  }
};

export default EffectCanvas;