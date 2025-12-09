import React from 'react';
import TensorBackground from './components/TensorBackground';
import HeroOverlay from './components/HeroOverlay';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-full overflow-hidden text-white font-sans">
      {/* Background Layer - Absolute, z-0 */}
      <div className="absolute inset-0 z-0">
        <TensorBackground />
      </div>

      {/* Content Layer - Relative, z-10, pointer-events-none for non-interactive areas so mouse passes to shader */}
      <div className="relative z-10 w-full h-full overflow-y-auto pointer-events-none">
        <HeroOverlay />
      </div>
    </div>
  );
};

export default App;