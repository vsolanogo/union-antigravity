import React, { useState, useEffect, useRef } from 'react';
import { R3FButton } from './components/R3FButton';
import { SwanEffect } from './components/effects/SwanEffect';
import { SmokeMonsterEffect } from './components/effects/SmokeMonsterEffect';
import { ElectromagnetEffect } from './components/effects/ElectromagnetEffect';
import { SourceEffect } from './components/effects/SourceEffect';

const App: React.FC = () => {
  const [countdown, setCountdown] = useState(108);
  const [systemFailure, setSystemFailure] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "> SYSTEM BOOT SEQUENCE INITIATED...",
    "> DHARMA INT. PROTOCOL V4.8.15",
    "> CONNECTING TO SWAN STATION...",
    "> CONNECTION ESTABLISHED."
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
            setSystemFailure(true);
            return 0;
        }
        return prev - 1;
      });
    }, 1000); // 1s real time for demo
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (systemFailure) {
          addLog("> SYSTEM FAILURE DETECTED.");
          addLog("> ELECTROMAGNETIC DISCHARGE IMMINENT.");
      }
  }, [systemFailure]);

  // Auto-scroll logs
  useEffect(() => {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg: string) => {
      setLogs(prev => [...prev.slice(-6), msg]);
  };

  const handleExecute = () => {
    if (systemFailure) {
        addLog("> SYSTEM REBOOTING...");
        setTimeout(() => {
             setCountdown(108);
             setSystemFailure(false);
             addLog("> TIMER RESET. THANK YOU.");
        }, 1000);
    } else {
        setCountdown(108);
        addLog("> EXECUTE COMMAND RECEIVED.");
        addLog("> TIMER RESET TO 108 MIN.");
    }
  };

  const handleSmoke = () => addLog("> CERBERUS VENT S-12 OPENED.");
  const handleMagnet = () => addLog("> WARN: MAGNETIC FLUCTUATION DETECTED.");
  const handleSource = () => addLog("> CRITICAL: SOURCE CHAMBER BREACH.");

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden select-none font-mono">
      
      {/* CRT Overlay Effects */}
      <div className="scanlines"></div>
      <div className="crt-flicker"></div>
      
      {/* Screen Curvature Vignette (Simulated via radial gradient) */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]"></div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 md:p-12">
        
        {/* The Frame */}
        <div className="w-full max-w-5xl border-[3px] border-gray-800 bg-[#0a0a0a] rounded-xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            
            {/* Glossy Screen Reflection */}
            <div className="absolute top-0 right-0 w-full h-1/3 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-xl"></div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Header Section */}
                <div className="col-span-1 md:col-span-12 flex items-end justify-between border-b-2 border-green-900/50 pb-4 mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 border-2 border-green-500 rounded-full flex items-center justify-center relative overflow-hidden bg-black">
                            <div className="absolute w-full h-[1px] bg-green-500 rotate-45"></div>
                            <div className="absolute w-full h-[1px] bg-green-500 -rotate-45"></div>
                            <div className="absolute w-full h-[1px] bg-green-500 rotate-90"></div>
                            <div className="absolute w-full h-[1px] bg-green-500"></div>
                            <div className="w-10 h-10 bg-black z-10 rounded-full border border-green-500 flex items-center justify-center">
                                <span className="text-green-500 text-2xl font-serif">ॐ</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-[Oswald] text-green-500 tracking-[0.2em] text-glow">DHARMA</h1>
                            <div className="text-green-800 text-xs tracking-widest font-bold">INITIATIVE // STATION 3</div>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-green-700 text-xs">SYS_UPTIME: 1489230</div>
                        <div className="text-green-700 text-xs">SECTOR: SWAN</div>
                    </div>
                </div>

                {/* Left Column: Input */}
                <div className="col-span-1 md:col-span-4 flex flex-col space-y-6">
                    <div className="bg-black/50 border border-green-900 p-4 rounded min-h-[150px]">
                        <h3 className="text-green-600 text-xs mb-2 tracking-widest border-b border-green-900 pb-1">SYSTEM_LOG</h3>
                        <div className="text-green-400 text-xs font-['Share_Tech_Mono'] h-32 overflow-y-auto scrollbar-hide flex flex-col space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="opacity-80">{log}</div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <h3 className="text-green-600 text-xs tracking-widest text-center">MANUAL_OVERRIDE</h3>
                        <R3FButton effect={SwanEffect} onClick={handleExecute} className="w-full h-20">
                            <div className="flex flex-col items-center">
                                <span className="text-green-100 font-bold text-xl tracking-[0.2em] drop-shadow-[0_0_8px_rgba(100,255,100,0.8)]">EXECUTE</span>
                                <span className="text-[10px] text-green-400 opacity-70 tracking-widest">PRESS TO RESET</span>
                            </div>
                        </R3FButton>
                    </div>
                </div>

                {/* Center Column: The Timer */}
                <div className="col-span-1 md:col-span-4 flex flex-col items-center justify-center p-6 bg-black border-[4px] border-[#1a1a1a] rounded shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative">
                    <div className="absolute top-2 left-2 text-[10px] text-gray-600">COUNTDOWN_TIMER</div>
                    {/* Flip clock aesthetic container */}
                    <div className="flex items-center justify-center w-full h-32 bg-[#050505] relative overflow-hidden">
                        {systemFailure ? (
                            <div className="flex space-x-2 text-red-600 text-5xl md:text-6xl font-bold animate-pulse">
                                {/* Hieroglyphs simulation */}
                                <span>𓀀</span><span>𓀁</span><span>𓀂</span><span>𓀃</span><span>𓆣</span>
                            </div>
                        ) : (
                            <div className="text-7xl md:text-8xl font-['Share_Tech_Mono'] text-white tracking-widest relative z-10">
                                {countdown.toString().padStart(3, '0')}
                            </div>
                        )}
                         {/* Red background flash on failure */}
                         {systemFailure && <div className="absolute inset-0 bg-red-900/20 animate-pulse z-0"></div>}
                    </div>

                    <div className="flex justify-between w-full mt-6 px-2">
                        <div className="w-8 h-8 bg-black border border-gray-700 rounded-full"></div>
                        <div className="w-8 h-8 bg-black border border-gray-700 rounded-full"></div>
                        <div className="w-8 h-8 bg-black border border-gray-700 rounded-full"></div>
                        <div className="w-8 h-8 bg-black border border-gray-700 rounded-full"></div>
                        <div className="w-8 h-8 bg-black border border-gray-700 rounded-full"></div>
                        <div className="w-8 h-8 bg-black border border-gray-700 rounded-full"></div>
                    </div>
                     <div className="flex justify-between w-full mt-2 px-2 text-xs font-mono text-gray-500">
                        <span>4</span><span>8</span><span>15</span><span>16</span><span>23</span><span>42</span>
                    </div>
                </div>

                {/* Right Column: Special Containment */}
                <div className="col-span-1 md:col-span-4 flex flex-col space-y-4">
                     <h3 className="text-red-900 text-xs mb-2 tracking-widest border-b border-red-900/30 pb-1 text-right">CONTAINMENT_PROTOCOLS</h3>
                    
                     <R3FButton effect={SmokeMonsterEffect} onClick={handleSmoke} className="w-full h-16">
                         <span className="text-gray-400 font-bold tracking-widest text-sm uppercase group-hover:text-white transition-colors">Subject #001</span>
                     </R3FButton>

                     <R3FButton effect={ElectromagnetEffect} onClick={handleMagnet} className="w-full h-16">
                         <span className="text-cyan-300 font-bold tracking-widest text-sm uppercase mix-blend-screen group-hover:text-white transition-colors shadow-blue-500">Electromagnet</span>
                     </R3FButton>

                     <R3FButton effect={SourceEffect} onClick={handleSource} className="w-full h-16">
                         <span className="text-amber-200 font-bold tracking-widest text-sm uppercase group-hover:text-amber-100 transition-colors">The Source</span>
                     </R3FButton>

                     <div className="mt-4 p-2 border border-red-900/30 bg-red-900/5 rounded">
                         <p className="text-[10px] text-red-800 leading-tight">
                             WARNING: UNAUTHORIZED ACCESS TO CONTAINMENT PROTOCOLS MAY RESULT IN CATASTROPHIC ISLAND EVENT.
                         </p>
                     </div>
                </div>

            </div>
            
            <div className="mt-8 flex justify-between items-center text-[10px] text-green-900 font-mono">
                <div>TERM_ID: 4-8-15-16-23-42</div>
                <div>© 1980 HANSARD FOUNDATION</div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default App;