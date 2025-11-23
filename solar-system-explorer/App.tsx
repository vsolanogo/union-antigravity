import React, { useState } from 'react';
import SolarSystem from './components/SolarSystem';
import InfoPanel from './components/InfoPanel';
import { PlanetData } from './types';
import { Info, MousePointer2 } from 'lucide-react';

const App: React.FC = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <SolarSystem 
        selectedPlanet={selectedPlanet}
        onPlanetSelect={setSelectedPlanet}
      />

      {/* Header / HUD */}
      <div className="absolute top-0 left-0 p-6 z-10 pointer-events-none">
        <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
          Solar System Explorer
        </h1>
        <p className="text-gray-400 text-sm mt-1 max-w-md">
          Interactive 3D Simulation powered by React Three Fiber & Gemini
        </p>
      </div>

      {/* Instructional Tooltip if nothing selected */}
      {!selectedPlanet && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50 text-sm flex items-center gap-2 animate-pulse pointer-events-none z-10">
          <MousePointer2 className="w-4 h-4" />
          <span>Click on a planet to explore details</span>
        </div>
      )}

      {/* Info Panel */}
      {selectedPlanet && (
        <InfoPanel 
          selectedPlanet={selectedPlanet}
          onClose={() => setSelectedPlanet(null)}
        />
      )}

      {/* Simple Credits */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
        <button 
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
            title="About"
            onClick={() => alert("Solar System Explorer\n\nBuilt with React, Three.js, and Google Gemini API.\n\nNote: Scale and speeds are artistic representations, not 1:1 scientific accuracy.")}
        >
            <Info className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default App;