import React, { useState, useEffect } from 'react';
import { ParseStatus, MatchDetails } from '../types';

interface ReplayInterfaceProps {
  status: ParseStatus;
  setStatus: (status: ParseStatus) => void;
}

export const ReplayInterface: React.FC<ReplayInterfaceProps> = ({ status, setStatus }) => {
  const [progress, setProgress] = useState(0);
  const [matchData, setMatchData] = useState<MatchDetails | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setStatus(ParseStatus.UPLOADING);
      setProgress(0);
      
      // Simulate Upload
      let p = 0;
      const interval = setInterval(() => {
        p += 5;
        setProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setStatus(ParseStatus.ANALYZING);
          startAnalysis();
        }
      }, 50);
    }
  };

  const startAnalysis = () => {
    // Simulate complex parsing
    setTimeout(() => {
      setMatchData({
        id: "MATCH-29384-EUW",
        duration: "32:14",
        winner: "Blue",
        timestamp: Date.now(),
        players: [
          { id: '1', name: "Faker", champion: "Azir", kda: "8/2/12", damage: 42100, gold: 16500, role: 'MID' },
          { id: '2', name: "Zeus", champion: "Jayce", kda: "5/4/8", damage: 31200, gold: 14200, role: 'TOP' },
          { id: '3', name: "Oner", champion: "Lee Sin", kda: "3/1/15", damage: 18500, gold: 11800, role: 'JUNGLE' },
          { id: '4', name: "Gumayusi", champion: "Jinx", kda: "12/1/5", damage: 54300, gold: 18900, role: 'ADC' },
          { id: '5', name: "Keria", champion: "Thresh", kda: "1/3/22", damage: 8400, gold: 9500, role: 'SUPPORT' },
        ]
      });
      setStatus(ParseStatus.COMPLETE);
    }, 3000);
  };

  const reset = () => {
    setStatus(ParseStatus.IDLE);
    setMatchData(null);
    setProgress(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      
      {/* Main Parsing Card */}
      <div className={`
        relative w-full max-w-3xl transition-all duration-700 ease-out
        ${status === ParseStatus.COMPLETE ? 'translate-y-0 opacity-100' : 'translate-y-12'}
      `}>
        
        {/* Glass Container */}
        <div className="relative bg-glass backdrop-blur-xl border border-glassBorder rounded-2xl p-8 shadow-2xl overflow-hidden group">
          
          {/* Decorative Shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          {status === ParseStatus.IDLE && (
             <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
               <div className="mb-6 w-20 h-20 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center group-hover:border-neon-cyan transition-colors duration-300">
                 <svg className="w-8 h-8 text-white/70 group-hover:text-neon-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                 </svg>
               </div>
               <h2 className="text-2xl font-bold mb-2">Drop Replay File</h2>
               <p className="text-white/50 mb-8 max-w-md">Supports .rofl, .lrf, and .demo files. Drag and drop or select manually.</p>
               
               <label className="relative px-8 py-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all duration-300 cursor-pointer font-bold tracking-wide uppercase text-sm">
                 <span>Select File</span>
                 <input type="file" className="hidden" onChange={handleUpload} />
               </label>
             </div>
          )}

          {(status === ParseStatus.UPLOADING || status === ParseStatus.ANALYZING) && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                {/* Spinner Ring */}
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-neon-cyan rounded-full animate-spin" />
                
                {/* Inner Pulsing Circle */}
                <div className="absolute w-48 h-48 bg-neon-purple/20 rounded-full animate-pulse blur-xl" />
                
                <div className="z-10 font-mono text-4xl font-bold tabular-nums">
                  {status === ParseStatus.UPLOADING ? `${progress}%` : 'PARSING'}
                </div>
              </div>
              
              <div className="font-mono text-neon-cyan tracking-widest text-sm animate-pulse">
                {status === ParseStatus.UPLOADING ? 'UPLOADING DATA STREAM...' : 'DECODING REPLAY PACKETS...'}
              </div>
            </div>
          )}

          {status === ParseStatus.COMPLETE && matchData && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                <div>
                  <div className="text-neon-cyan font-mono text-xs mb-1">MATCH ID: {matchData.id}</div>
                  <h2 className="text-3xl font-bold">{matchData.winner === 'Blue' ? 'VICTORY' : 'DEFEAT'}</h2>
                </div>
                <div className="text-right">
                  <div className="text-white/50 text-sm">DURATION</div>
                  <div className="font-mono text-xl">{matchData.duration}</div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="grid grid-cols-12 text-xs font-mono text-white/30 uppercase tracking-wider mb-2 px-4">
                  <div className="col-span-4">Player</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">KDA</div>
                  <div className="col-span-2 text-right">Damage</div>
                  <div className="col-span-2 text-right">Gold</div>
                </div>
                
                {matchData.players.map((player, idx) => (
                  <div key={player.id} className="grid grid-cols-12 items-center bg-white/5 hover:bg-white/10 transition-colors rounded-lg p-3 border border-white/5">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold">
                        {player.champion[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{player.name}</div>
                        <div className="text-xs text-white/40">{player.champion}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs font-mono text-white/60">{player.role}</div>
                    <div className="col-span-2 font-mono text-neon-purple">{player.kda}</div>
                    <div className="col-span-2 text-right font-mono text-sm">{player.damage.toLocaleString()}</div>
                    <div className="col-span-2 text-right font-mono text-neon-cyan text-sm">{player.gold.toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={reset}
                  className="px-6 py-2 rounded border border-white/20 hover:border-white/50 text-sm font-mono text-white/70 hover:text-white transition-all"
                >
                  PARSE NEW REPLAY
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};