
import React, { useRef, useState, useMemo } from 'react';
import { View, Float, Sparkles, MeshDistortMaterial, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GalaxyTheme } from '../../types';
import { audioManager } from '../../services/audioService';
import { 
  commonVertexShader, 
  accretionDiskFragmentShader, 
  energyShieldFragmentShader, 
  nebulaCloudFragmentShader 
} from '../Effects/Shaders';

interface CosmicButtonProps {
  theme: GalaxyTheme;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// --- 3D Scene Components ---

const BlackHoleScene = ({ hover }: { hover: boolean }) => {
  const diskRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColorInner: { value: new THREE.Color('#ff9900') },
    uColorOuter: { value: new THREE.Color('#330000') },
  }), []);

  useFrame((state) => {
    if (diskRef.current) {
      const mat = diskRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      mat.uniforms.uHover.value = THREE.MathUtils.lerp(mat.uniforms.uHover.value, hover ? 1 : 0, 0.1);
      
      // Wobble effect
      diskRef.current.rotation.x = Math.PI / 3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group scale={1.4}>
      {/* Event Horizon */}
      <mesh>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Fake Gravitational Lensing (Glass Sphere) */}
      <mesh>
         <sphereGeometry args={[0.34, 32, 32]} />
         <meshPhysicalMaterial 
            transmission={0.5} 
            roughness={0} 
            thickness={1} 
            ior={2} 
            transparent 
            opacity={0.2} 
            color="#ffffff" 
         />
      </mesh>

      {/* Accretion Disk */}
      <mesh ref={diskRef} rotation={[Math.PI / 3, 0, 0]}>
        <planeGeometry args={[3, 3]} />
        <shaderMaterial
          vertexShader={commonVertexShader}
          fragmentShader={accretionDiskFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      <Sparkles count={80} scale={2.5} size={2} speed={hover ? 3 : 0.5} opacity={0.6} color="#ffaa00" />
    </group>
  );
};

const SupernovaScene = ({ hover }: { hover: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if(meshRef.current) {
        // Frantic rotation when hovering
        const speed = hover ? 3 : 0.5;
        meshRef.current.rotation.x += 0.01 * speed;
        meshRef.current.rotation.y += 0.01 * speed;
    }
  });

  return (
    <Float speed={5} rotationIntensity={0.5} floatIntensity={1}>
        {/* Core Star */}
        <mesh ref={meshRef} scale={hover ? 1.1 : 1}>
            <icosahedronGeometry args={[0.7, 4]} />
            <MeshDistortMaterial
                color={hover ? "#ff2200" : "#ff5500"}
                emissive={hover ? "#ff0000" : "#aa2200"}
                emissiveIntensity={hover ? 4 : 1}
                toneMapped={false}
                distort={hover ? 0.8 : 0.3} 
                speed={hover ? 8 : 2}
            />
        </mesh>
        
        {/* Outer Halo */}
        <Billboard>
            <mesh scale={2.5}>
                <planeGeometry />
                <meshBasicMaterial 
                    map={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/glow.png')} 
                    transparent 
                    opacity={hover ? 0.6 : 0.2} 
                    color="#ff0000" 
                    blending={THREE.AdditiveBlending} 
                    depthWrite={false}
                />
            </mesh>
        </Billboard>
    </Float>
  );
};

const NebulaScene = ({ hover }: { hover: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
       groupRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  const CloudLayer = ({ color, z, scale, speed, rotSpeed }: any) => {
      const mesh = useRef<THREE.Mesh>(null);
      const uniforms = useMemo(() => ({
          uTime: { value: 0 },
          uColorCore: { value: new THREE.Color(color) },
          uColorMist: { value: new THREE.Color('#000000') },
      }), [color]);
      
      useFrame((state) => {
          if(mesh.current) {
            (mesh.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime * speed;
            mesh.current.rotation.z = state.clock.elapsedTime * rotSpeed;
          }
      });
      
      return (
          <mesh ref={mesh} position={[0,0,z]} scale={scale}>
              <planeGeometry args={[4,4]} />
              <shaderMaterial 
                 vertexShader={commonVertexShader} 
                 fragmentShader={nebulaCloudFragmentShader}
                 uniforms={uniforms}
                 transparent
                 depthWrite={false}
                 blending={THREE.AdditiveBlending}
              />
          </mesh>
      );
  }

  return (
    <group ref={groupRef}>
       <CloudLayer color="#00ffff" z={-0.5} scale={1.8} speed={0.4} rotSpeed={0.1} />
       <CloudLayer color="#ff00ff" z={0.1} scale={1.5} speed={0.7} rotSpeed={-0.1} />
       <CloudLayer color="#ffffff" z={0.4} scale={1.2} speed={1.0} rotSpeed={0.05} />
       <Sparkles count={40} scale={2} size={3} speed={0.2} opacity={0.8} color="#ffffff" />
    </group>
  );
};

// --- Main Button Component ---

export const CosmicButton: React.FC<CosmicButtonProps> = ({ theme, label, onClick, disabled }) => {
  const viewRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const getScene = () => {
    switch (theme) {
      case GalaxyTheme.BLACK_HOLE: return <BlackHoleScene hover={hovered} />;
      case GalaxyTheme.SUPERNOVA: return <SupernovaScene hover={hovered} />;
      case GalaxyTheme.NEBULA: return <NebulaScene hover={hovered} />;
      default: return null;
    }
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (!disabled) audioManager.playHover();
  };

  const handleClick = () => {
    if(!disabled) {
        audioManager.playClick();
        onClick();
    }
  };

  return (
    <div 
      className="relative group w-80 h-40 my-4 cursor-pointer perspective-1000"
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* 3D View Portal Target */}
      <div 
        ref={viewRef} 
        className="absolute inset-0 pointer-events-none z-0 transform transition-transform duration-700 ease-out group-hover:scale-125" 
      />
      
      {/* Render the 3D Scene into the portal */}
      <View track={viewRef} className="absolute inset-0 z-0">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        {getScene()}
      </View>

      {/* HTML HUD Overlay */}
      <div className={`
          absolute inset-0 z-10 flex flex-col items-center justify-center
          transition-all duration-300 pointer-events-none
          ${disabled ? 'opacity-30 grayscale' : 'opacity-100'}
      `}>
        {/* Top Bracket */}
        <div className={`
            absolute top-4 w-32 h-px bg-white/30 transition-all duration-500
            ${hovered ? 'w-48 bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : ''}
        `} />

        <span className={`
            font-mono text-[10px] tracking-[0.4em] uppercase mb-2 text-blue-200/60
            transition-all duration-300
            ${hovered ? 'text-blue-100 scale-110' : ''}
        `}>
            Initiate Protocol
        </span>
        
        <div className={`
            text-3xl font-black uppercase tracking-widest
            bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500
            drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]
            transition-all duration-300 transform
            ${hovered ? 'scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]' : 'scale-100'}
        `}>
            {label}
        </div>
        
        {/* Bottom Bracket */}
        <div className={`
            absolute bottom-4 w-32 h-px bg-white/30 transition-all duration-500
            ${hovered ? 'w-48 bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : ''}
        `} />
        
        {/* Corner Accents */}
        <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 transition-all duration-300 ${hovered ? 'w-4 h-4 border-blue-400' : ''}`} />
        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 transition-all duration-300 ${hovered ? 'w-4 h-4 border-blue-400' : ''}`} />
      </div>
    </div>
  );
};
