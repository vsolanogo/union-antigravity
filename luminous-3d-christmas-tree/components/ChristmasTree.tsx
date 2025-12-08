
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Sparkles, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { TreeConfig } from '../types';

interface ChristmasTreeProps {
  config: TreeConfig;
}

// Custom Star Shader with enhanced glow
const starVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const starFragment = `
uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;

void main() {
    vec2 center = vec2(0.5);
    float dist = distance(vUv, center);
    
    // Core glow
    float core = 0.05 / dist;
    
    // Rays
    vec2 dir = vUv - center;
    float angle = atan(dir.y, dir.x);
    float rays = sin(angle * 8.0 + uTime) * 0.1 + 0.9;
    
    float glow = core * rays;
    float pulse = 0.8 + 0.2 * sin(uTime * 3.0);
    
    // Boost intensity for bloom
    vec3 finalColor = uColor * glow * pulse * 2.0; 
    
    // Falloff
    float alpha = smoothstep(0.5, 0.0, dist);
    
    gl_FragColor = vec4(finalColor, alpha);
}
`;

const ChristmasTree: React.FC<ChristmasTreeProps> = ({ config }) => {
  const group = useRef<THREE.Group>(null);
  const starMat = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    // Gentle tree sway
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
    if (starMat.current) {
      starMat.current.uniforms.uTime.value = state.clock.getElapsedTime();
      // Boost color intensity for bloom
      const c = new THREE.Color(config.lightsColor);
      c.multiplyScalar(3.0); 
      starMat.current.uniforms.uColor.value = c;
    }
  });

  // Procedural Tree Layers
  const treeLayers = useMemo(() => {
    const layers = [];
    const layerHeight = config.height / config.layers;
    
    for (let i = 0; i < config.layers; i++) {
      const radius = config.width * (1 - i / (config.layers + 1));
      const yPos = i * layerHeight * 0.85; 
      
      layers.push(
        <mesh key={`layer-${i}`} position={[0, yPos + 1.2, 0]} castShadow receiveShadow>
          <coneGeometry args={[radius, layerHeight * 1.5, 32]} />
          {/* Distort material gives the "wind in branches" feel */}
          <MeshDistortMaterial 
            color="#0d4a2b" 
            roughness={0.6}
            metalness={0.1}
            distort={0.15} 
            speed={1.5} 
          />
        </mesh>
      );
    }
    return layers;
  }, [config]);

  // Procedural Spiral Lights
  const fairyLights = useMemo(() => {
    const points = [];
    const spiralLoops = 8;
    const pointsPerLoop = 20;
    const totalPoints = spiralLoops * pointsPerLoop;
    
    for (let i = 0; i < totalPoints; i++) {
        const progress = i / totalPoints;
        const currentLayer = Math.floor(progress * config.layers);
        const yBase = progress * config.height; 
        
        // Taper radius as we go up
        const radius = (config.width * 0.9) * (1 - progress) + 0.2; 
        
        const angle = progress * Math.PI * 2 * spiralLoops;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = yBase + 0.5; // Offset from ground

        // Simple random color variation based on config color
        const baseColor = new THREE.Color(config.lightsColor);
        const hsl = { h: 0, s: 0, l: 0 };
        baseColor.getHSL(hsl);
        const color = new THREE.Color().setHSL(
            hsl.h + (Math.random() * 0.1 - 0.05),
            1.0, 
            0.6
        );
        // Boost brightness for bloom
        color.multiplyScalar(10); 

        points.push({ position: [x, y, z] as [number, number, number], color });
    }
    return points;
  }, [config]);

  // Procedural Ornaments
  const ornaments = useMemo(() => {
    const items = [];
    const colors = ["#ef4444", "#eab308", "#C0C0C0", "#3b82f6", "#a855f7"];
    
    for (let i = 0; i < config.layers; i++) {
      const layerRadiusBase = config.width * (1 - i / config.layers);
      const yBase = i * (config.height / config.layers) * 0.8 + 1.2;
      const count = Math.floor(config.decorationCount / config.layers) + 3;

      for (let j = 0; j < count; j++) {
        const angle = (j / count) * Math.PI * 2 + (i * 1.5);
        const r = layerRadiusBase * 0.85; 
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const y = yBase - (config.height / config.layers) * 0.3; 

        items.push(
            <Instance 
                key={`ornament-${i}-${j}`} 
                position={[x, y, z]} 
                scale={0.15 + Math.random() * 0.1}
                color={colors[Math.floor(Math.random() * colors.length)]}
            />
        );
      }
    }
    return items;
  }, [config]);

  return (
    <group ref={group} position={[0, -2, 0]}>
      {/* Trunk */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.6, 2.5, 16]} />
        <meshStandardMaterial color="#3E2723" roughness={1} />
      </mesh>

      {/* Foliage */}
      {treeLayers}

      {/* Ornaments - Instanced for performance */}
      <Instances range={1000} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial roughness={0.1} metalness={0.9} envMapIntensity={2} />
        {ornaments}
      </Instances>

      {/* Fairy Lights - Simple geometry with high emissive for bloom */}
      <group>
        {fairyLights.map((light, i) => (
             <mesh key={`light-${i}`} position={light.position}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color={light.color} toneMapped={false} />
             </mesh>
        ))}
      </group>

      {/* Magical Sparkles around tree */}
      <Sparkles 
        count={200} 
        scale={[config.width * 2.5, config.height, config.width * 2.5]} 
        position={[0, config.height / 2, 0]}
        size={3}
        speed={0.4}
        opacity={1}
        color={config.lightsColor}
      />

      {/* Star Topper */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
          <group position={[0, config.height + 0.4, 0]}>
             {/* Glow Halo */}
             <mesh>
                 <planeGeometry args={[3, 3]} />
                 <shaderMaterial
                    ref={starMat}
                    vertexShader={starVertex}
                    fragmentShader={starFragment}
                    uniforms={{
                        uTime: { value: 0 },
                        uColor: { value: new THREE.Color(config.lightsColor) }
                    }}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                 />
             </mesh>
             {/* Physical Star */}
             <mesh castShadow>
                <icosahedronGeometry args={[0.25, 0]} />
                <meshStandardMaterial 
                    color="#fff" 
                    emissive={config.lightsColor}
                    emissiveIntensity={4}
                    toneMapped={false}
                />
             </mesh>
          </group>
      </Float>
    </group>
  );
};

export default ChristmasTree;
