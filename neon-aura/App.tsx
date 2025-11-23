import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { NeonPlane } from './components/NeonShader';
import { Sidebar } from './components/UI';
import { NeonConfig, VibeAnalysis } from './types';
import { analyzeImageVibe } from './services/gemini';

// Modern, Electric defaults
const DEFAULT_CONFIG: NeonConfig = {
  intensity: 2.0,
  speed: 0.5,
  color1: '#FF00FF', // Hot Pink
  color2: '#00FFFF', // Cyan
  noiseScale: 3.0,
  borderThickness: 0.05,
  radius: 0.1,
  edgeDetect: 0.0, // Start in Frame mode
};

// Helper component to load texture
const TextureLoader: React.FC<{ url: string, config: NeonConfig }> = ({ url, config }) => {
  const texture = useTexture(url);
  
  useEffect(() => {
    if (texture) {
      // High quality texture settings
      texture.anisotropy = 16;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false; 
      texture.needsUpdate = true;
    }
  }, [texture]);

  return <NeonPlane texture={texture} config={config} />;
};

export default function App() {
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop');
  const [config, setConfig] = useState<NeonConfig>(DEFAULT_CONFIG);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VibeAnalysis | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          const result = await analyzeImageVibe(base64data);
          setAnalysis(result);
          setConfig(prev => ({
            ...prev,
            color1: result.color1,
            color2: result.color2,
            intensity: 3.0 // Boost intensity for impact
          }));
        } catch (err) {
            console.error("AI Error", err);
        } finally {
            setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Fetch error", error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}>
          <color attach="background" args={['#020202']} />
          
          <Suspense fallback={null}>
             <TextureLoader url={imageUrl} config={config} />
          </Suspense>
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            minDistance={3} 
            maxDistance={8} 
            enableDamping={true}
            dampingFactor={0.05}
          />
          
          {/* Cinematic Post Processing */}
          <EffectComposer disableNormalPass>
             {/* Strong Bloom for Neon Effect */}
             <Bloom 
                luminanceThreshold={0.15} 
                mipmapBlur 
                intensity={1.2} 
                radius={0.7} 
                levels={9}
             />
             {/* Chromatic Aberration for that glitchy/cyberpunk lens feel */}
             <ChromaticAberration
                offset={new THREE.Vector2(0.002, 0.002)}
                radialModulation={false}
                modulationOffset={0}
             />
             <Noise opacity={0.08} />
             <Vignette eskil={false} offset={0.1} darkness={1.2} />
          </EffectComposer>
        </Canvas>
      </div>

      <Sidebar 
        config={config} 
        setConfig={setConfig} 
        onUpload={handleFileUpload}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        analysis={analysis}
      />
      
      {/* Footer Info */}
      <div className="absolute bottom-6 left-6 text-white/30 text-[10px] pointer-events-none font-mono tracking-widest uppercase flex flex-col gap-1">
        <span>Render Engine: Three.js r160</span>
        <span>Shader Mode: {config.edgeDetect > 0.5 ? 'EDGE_DETECT' : 'SDF_FRAME'}</span>
      </div>
    </div>
  );
}