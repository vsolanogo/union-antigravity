import React, { useState } from 'react';
import { AlohaButton } from './components/AlohaButton';

const App: React.FC = () => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Helper to determine flex class based on hover state
  const getFlexClass = (section: string) => {
    if (hoveredSection === section) return 'flex-[2]';
    return 'flex-1';
  };

  const baseClass = "w-full relative transition-all duration-700 ease-in-out overflow-hidden";

  return (
    <div className="h-screen w-full flex flex-col bg-slate-900 overflow-hidden">
      
      {/* Button 1: Ocean */}
      <div 
        className={`${baseClass} border-b border-white/10 ${getFlexClass('ocean')}`}
        onMouseEnter={() => setHoveredSection('ocean')}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AlohaButton variant="ocean" onClick={() => console.log("Surf's Up Clicked")}>
          Surf's Up
        </AlohaButton>
      </div>

      {/* Button 2: Lava */}
      <div 
        className={`${baseClass} border-b border-white/10 ${getFlexClass('lava')}`}
        onMouseEnter={() => setHoveredSection('lava')}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AlohaButton variant="lava" onClick={() => console.log("Volcano Clicked")}>
          Volcano
        </AlohaButton>
      </div>

      {/* Button 3: Neon Palm */}
      <div 
        className={`${baseClass} ${getFlexClass('neon-palm')}`}
        onMouseEnter={() => setHoveredSection('neon-palm')}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <AlohaButton variant="neon-palm" onClick={() => console.log("Sunset Strip Clicked")}>
          Sunset Strip
        </AlohaButton>
      </div>

    </div>
  );
};

export default App;