import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useButtonContext } from '../context/ButtonContext';
import { EffectStyle, ButtonState } from '../types';
import { vertexShader, royalGoldFragment, cyberNeonFragment, mistFragment } from '../shaders';

interface MeshProps {
  button: ButtonState;
}

const ButtonMesh: React.FC<MeshProps> = ({ button }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  // Convert screen coordinates to Three.js world coordinates
  const widthWorld = (button.width / window.innerWidth) * viewport.width;
  const heightWorld = (button.height / window.innerHeight) * viewport.height;
  
  const xWorld = ((button.x + button.width / 2) / window.innerWidth) * viewport.width - viewport.width / 2;
  const yWorld = -(((button.y + button.height / 2) / window.innerHeight) * viewport.height - viewport.height / 2);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(button.width, button.height) },
    hover: { value: 0 },
    clickTime: { value: 0 }
  }), []);

  // Choose shader based on effect type
  const fragmentShader = useMemo(() => {
    switch (button.effect) {
      case EffectStyle.GOLDEN_FLAME: return royalGoldFragment;
      case EffectStyle.NEON_PULSE: return cyberNeonFragment;
      case EffectStyle.BATTLE_MIST: return mistFragment;
      default: return royalGoldFragment;
    }
  }, [button.effect]);

  // Set blending mode
  const blending = button.effect === EffectStyle.GOLDEN_FLAME ? THREE.NormalBlending : THREE.AdditiveBlending;

  useFrame((state) => {
    if (materialRef.current) {
      // Update global time
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      
      // Update resolution in case of resize
      materialRef.current.uniforms.resolution.value.set(button.width, button.height);
      
      // Update click timestamp
      materialRef.current.uniforms.clickTime.value = button.lastClickTime;

      // Smoothly interpolate hover value (Spring-like lerp)
      const targetHover = button.hovered ? 1.0 : 0.0;
      materialRef.current.uniforms.hover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.hover.value,
        targetHover,
        0.1 // speed of transition
      );
    }
  });

  return (
    <mesh ref={meshRef} position={[xWorld, yWorld, 0]}>
      <planeGeometry args={[widthWorld, heightWorld]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        uniforms={uniforms}
        blending={blending}
        depthTest={false}
      />
    </mesh>
  );
};

const EffectsScene = () => {
  const { buttons } = useButtonContext();
  
  return (
    <>
      {Array.from(buttons.values()).map((btn: ButtonState) => (
        <ButtonMesh key={btn.id} button={btn} />
      ))}
    </>
  );
};

export const WebGLOverlay: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 10] }}
        dpr={[1, 2]} // High DPI support
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <EffectsScene />
      </Canvas>
    </div>
  );
};