
import React from 'react';
import { RetroButton } from './components/RetroButton';
import { ButtonStyle } from './types';

export default function App() {
  const handlePress = (name: string) => {
    console.log(`Command Executed: ${name}`);
    // Optional: Add global sound effect or visual trigger here
  };

  return (
    <div className="h-screen w-screen bg-[#0f0c08] overflow-hidden flex flex-col md:flex-row">
      
      {/* Column 1 */}
      <div className="flex-1 flex flex-col h-full border-r-0 md:border-r-4 border-[#1a1612]">
        
        {/* Quadrant 1: IGNITE (Edison) */}
        <div className="flex-1 relative border-b-4 border-[#1a1612] overflow-hidden">
          <RetroButton 
            label="Ignite" 
            styleVariant={ButtonStyle.EDISON} 
            onClick={() => handlePress("IGNITE")}
          />
          {/* Corner Decor */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-[#3e3223] rounded-full shadow-[inset_0_0_4px_black] opacity-50 pointer-events-none"></div>
          <div className="absolute top-4 right-4 text-[10px] font-mono text-[#5c4a30] opacity-50 pointer-events-none">A-01</div>
        </div>
        
        {/* Quadrant 2: DISCHARGE (Tesla) */}
        <div className="flex-1 relative overflow-hidden">
          <RetroButton 
            label="Discharge" 
            styleVariant={ButtonStyle.TESLA} 
            onClick={() => handlePress("DISCHARGE")}
          />
          <div className="absolute bottom-4 left-4 text-[10px] font-mono text-[#4a5c60] opacity-50 pointer-events-none">B-02</div>
        </div>

      </div>

      {/* Column 2 */}
      <div className="flex-1 flex flex-col h-full">
        
        {/* Quadrant 3: ACTIVATE (Radium) */}
        <div className="flex-1 relative border-b-4 border-[#1a1612] overflow-hidden">
          <RetroButton 
            label="Activate" 
            styleVariant={ButtonStyle.RADIUM} 
            onClick={() => handlePress("ACTIVATE")}
          />
           <div className="absolute top-4 right-4 w-3 h-3 bg-[#233e23] rounded-full shadow-[inset_0_0_4px_black] opacity-50 pointer-events-none"></div>
        </div>
        
        {/* Quadrant 4: ENGAGE (Brass) */}
        <div className="flex-1 relative overflow-hidden">
          <RetroButton 
            label="Engage" 
            styleVariant={ButtonStyle.BRASS} 
            onClick={() => handlePress("ENGAGE")}
          />
           <div className="absolute bottom-4 right-4 text-[10px] font-mono text-[#5c4a30] opacity-50 pointer-events-none">D-04</div>
        </div>

      </div>

      {/* Center Cross overlay for extra skeuomorphism (optional) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#1a1612] rotate-45 z-50 shadow-xl border border-[#3e3223] pointer-events-none hidden md:block"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#0f0c08] rounded-full z-50 pointer-events-none hidden md:block"></div>

    </div>
  );
}
