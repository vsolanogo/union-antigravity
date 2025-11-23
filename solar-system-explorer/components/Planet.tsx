import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, Color, DoubleSide, AdditiveBlending } from 'three';
import { PlanetData } from '../types';
import { Html } from '@react-three/drei';

interface PlanetProps {
  data: PlanetData;
  isSelected: boolean;
  onSelect: (planet: PlanetData) => void;
}

// --- SHADERS ---

const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  uniform vec3 uColor;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
    gl_FragColor = vec4(uColor, 1.0) * intensity;
  }
`;

const gasGiantFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  
  void main() {
    // Generate bands based on Y coordinate
    float bands = sin(vUv.y * 20.0 + sin(uTime * 0.1));
    float variation = cos(vUv.y * 10.0 + uTime * 0.05);
    
    // Mix base color with darker/lighter variants
    vec3 bandColor = uColor * (0.8 + 0.2 * bands + 0.1 * variation);
    
    gl_FragColor = vec4(bandColor, 1.0);
  }
`;

const Planet: React.FC<PlanetProps> = ({ data, isSelected, onSelect }) => {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const startAngle = useRef(Math.random() * Math.PI * 2).current;

  // Uniforms for Gas Giants
  const bandUniforms = useMemo(() => ({
    uColor: { value: new Color(data.color) },
    uTime: { value: 0 }
  }), [data.color]);

  // Uniforms for Atmosphere
  const atmosphereUniforms = useMemo(() => {
    // Atmosphere color tweaks
    const atmColor = data.id === 'earth' ? '#4488ff' : 
                     data.id === 'venus' ? '#ffa500' :
                     data.id === 'mars' ? '#ffccaa' : data.color;
    return {
      uColor: { value: new Color(atmColor) }
    };
  }, [data.id, data.color]);


  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Orbit
    if (groupRef.current) {
      const angle = startAngle + (t * data.speed * 0.1); 
      groupRef.current.position.x = Math.cos(angle) * data.distance;
      groupRef.current.position.z = Math.sin(angle) * data.distance;
    }

    // Rotation & Shader Time
    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed;
      
      // Update shader time for gas giants
      if (data.type === 'gas_giant' && (meshRef.current.material as any).uniforms) {
        (meshRef.current.material as any).uniforms.uTime.value = t;
      }
    }
  });

  return (
    <>
      {/* Orbit Path - Smoother and thinner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.distance - 0.05, data.distance + 0.05, 128]} />
        <meshBasicMaterial color="#ffffff" opacity={0.08} transparent side={DoubleSide} />
      </mesh>

      <group ref={groupRef}>
        <group 
          onClick={(e) => {
            e.stopPropagation();
            onSelect(data);
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Main Planet Mesh */}
          <mesh ref={meshRef}>
            <sphereGeometry args={[data.radius, 64, 64]} />
            
            {data.type === 'gas_giant' ? (
              <shaderMaterial 
                vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
                fragmentShader={gasGiantFragmentShader}
                uniforms={bandUniforms}
              />
            ) : (
              <meshStandardMaterial 
                color={data.color} 
                roughness={data.id === 'earth' ? 0.6 : 0.8}
                metalness={0.1}
                emissive={data.id === 'earth' ? '#112244' : '#000000'} // Slight night side glow for Earth
                emissiveIntensity={0.1}
              />
            )}
          </mesh>

          {/* Atmosphere Glow (Fresnel) - For Terrestrial and Ice Giants */}
          {(data.type === 'terrestrial' || data.type === 'ice_giant') && data.id !== 'mercury' && (
             <mesh scale={[1.2, 1.2, 1.2]}>
               <sphereGeometry args={[data.radius, 32, 32]} />
               <shaderMaterial
                  vertexShader={atmosphereVertexShader}
                  fragmentShader={atmosphereFragmentShader}
                  uniforms={atmosphereUniforms}
                  transparent
                  blending={AdditiveBlending}
                  side={DoubleSide} // BackSide usually better for atmosphere but Double works for simple glow
                  depthWrite={false}
               />
             </mesh>
          )}

          {/* Selection Highlight */}
          {isSelected && (
             <mesh rotation={[-Math.PI / 2, 0, 0]}>
               <ringGeometry args={[data.radius * 1.6, data.radius * 1.7, 64]} />
               <meshBasicMaterial color="#44aaff" opacity={0.8} transparent side={DoubleSide} />
             </mesh>
          )}

          {/* Planetary Rings */}
          {data.hasRings && (
            <group rotation={[Math.PI / 8, 0, 0]}> {/* Tilt the rings slightly */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[data.radius * 1.4, data.radius * 2.5, 128]} />
                <meshStandardMaterial 
                    color={data.ringColor || '#C0B090'} 
                    opacity={0.7} 
                    transparent 
                    side={DoubleSide} 
                    roughness={0.8}
                />
                </mesh>
            </group>
          )}

          {/* Label */}
          {(hovered || isSelected) && (
              <Html position={[0, data.radius + (data.hasRings ? 2 : 1), 0]} center distanceFactor={20} zIndexRange={[100, 0]}>
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border pointer-events-none transition-all duration-200
                    ${isSelected ? 'bg-blue-600 border-blue-400 text-white scale-110' : 'bg-black/60 border-white/20 text-gray-200'}
                  `}>
                      {data.name}
                  </div>
              </Html>
          )}
        </group>
      </group>
    </>
  );
};

export default Planet;