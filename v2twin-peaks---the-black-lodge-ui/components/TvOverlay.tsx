import React from 'react';

export const TvOverlay = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 w-full h-full overflow-hidden">
      {/* Scanlines */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.4))',
          backgroundSize: '100% 4px'
        }}
      />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.8) 100%)'
        }}
      />
      
      {/* Static Noise simulated with pattern */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-screen"
           style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }}
      />

      {/* VHS Tracking Artifact */}
      <div className="absolute w-full h-1 bg-white/10 blur-sm animate-[scan_8s_linear_infinite] top-0 left-0" 
           style={{
               animationName: 'trackingScan',
               animationDuration: '10s',
               animationIterationCount: 'infinite',
               animationTimingFunction: 'linear'
           }}
      ></div>

      <style>{`
          @keyframes trackingScan {
              0% { top: -10%; opacity: 0; }
              10% { opacity: 0.3; }
              90% { opacity: 0.3; }
              100% { top: 110%; opacity: 0; }
          }
      `}</style>
    </div>
  );
};