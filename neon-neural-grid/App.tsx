import React from 'react';
import { NeonGridBackground } from './components/NeonGridBackground';
import { HeroOverlay } from './components/HeroOverlay';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <NeonGridBackground />
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <HeroOverlay />
      </div>
    </div>
  );
};

export default App;