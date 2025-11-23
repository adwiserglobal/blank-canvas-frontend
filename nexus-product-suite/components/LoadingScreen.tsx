
import React, { useEffect, useState } from 'react';
import { ZapIcon } from './Icons';

interface LoadingScreenProps {
  onComplete: () => void;
}

const bootLogs = [
    "SYSTEM_CHECK_INTEGRITY... OK",
    "LOADING_KERNEL_MODULES... OK",
    "MOUNTING_VIRTUAL_FS... OK",
    "CONNECTING_TO_NEXUS_CORE...",
    "AUTHENTICATING_USER_SESSION...",
    "DECRYPTING_WORKSPACE_DATA...",
    "SYNCING_REALTIME_NODES...",
    "RENDERING_INTERFACE_LAYER...",
    "ALLOCATING_MEMORY_HEAP...",
    "EXECUTING_STARTUP_SCRIPTS...",
    "NEXUS_ONLINE."
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  useEffect(() => {
    const duration = 2500; // Total load time matches App.tsx timeout
    const intervalTime = 30;
    const totalSteps = duration / intervalTime;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / totalSteps);
        return next > 100 ? 100 : next;
      });
    }, intervalTime);

    // Log sequence
    const logInterval = setInterval(() => {
        setCurrentLogIndex(prev => (prev < bootLogs.length - 1 ? prev + 1 : prev));
    }, duration / bootLogs.length);

    // Completion timer
    const completionTimer = setTimeout(() => {
        onComplete();
    }, duration + 500); // Add a small buffer for smoothness

    return () => {
        clearInterval(timer);
        clearInterval(logInterval);
        clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center font-mono text-xs overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        
        {/* Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

        <div className="relative z-10 flex flex-col items-center">
            {/* HUD Circle */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border border-blue-500/30 border-dashed animate-[spin_10s_linear_infinite]"></div>
                
                {/* Middle Progress Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    <circle 
                        cx="128" cy="128" r="120" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        fill="transparent" 
                        className="text-gray-800"
                    />
                    <circle 
                        cx="128" cy="128" r="120" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 120}
                        strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                        className="text-blue-500 transition-all duration-75 ease-out"
                    />
                </svg>

                {/* Inner Rotating Elements */}
                <div className="absolute inset-8 rounded-full border-t-2 border-b-2 border-cyan-400/50 animate-[spin_3s_linear_infinite_reverse]"></div>
                <div className="absolute inset-16 rounded-full border-l-2 border-r-2 border-purple-500/50 animate-[spin_2s_linear_infinite]"></div>

                {/* Center Content */}
                <div className="absolute flex flex-col items-center justify-center bg-black/50 backdrop-blur-md rounded-full w-24 h-24 border border-white/10 shadow-2xl">
                     <ZapIcon className="w-8 h-8 text-white mb-1 animate-pulse" />
                     <span className="text-xl font-bold text-white tracking-tighter">{Math.floor(progress)}%</span>
                </div>
            </div>

            {/* Boot Logs */}
            <div className="w-80 h-24 overflow-hidden relative border-l-2 border-blue-500/50 pl-4 bg-gradient-to-r from-blue-900/10 to-transparent">
                 <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-end pb-2 space-y-1">
                     {bootLogs.slice(0, currentLogIndex + 1).slice(-4).map((log, i) => (
                         <div key={i} className="text-blue-300/80 animate-in slide-in-from-left-2 fade-in duration-300">
                             <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                             {log}
                         </div>
                     ))}
                 </div>
            </div>
            
            <div className="mt-4 text-blue-500/40 tracking-[0.5em] text-[10px] animate-pulse">
                INITIALIZING SYSTEM RESOURCES
            </div>
        </div>
    </div>
  );
};
