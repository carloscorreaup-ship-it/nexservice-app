import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, durationMs = 3000 }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, Math.max(durationMs - 400, 1000));

    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      onClick={() => {
        setFading(true);
        setTimeout(onFinish, 200);
      }}
      className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-500 select-none ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-sm">
        
        {/* App Logo emerging with scale and shadow */}
        <div className="relative mb-6 transform transition-all duration-700 ease-out animate-in fade-in zoom-in">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-white shadow-2xl shadow-blue-500/20 border border-slate-100 flex items-center justify-center p-3.5">
            <img
              src="/logo.png"
              alt="NexService.app"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.splash-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="splash-fallback hidden w-full h-full rounded-2xl bg-gradient-to-tr from-[#0052ff] to-blue-500 flex items-center justify-center text-white font-black text-5xl shadow-md">
              N
            </div>
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#141b2b] tracking-tight font-geist mb-1.5">
          NexService<span className="text-[#0052ff]">.app</span>
        </h1>

        {/* Underneath: "By Pasiflora Biohacking Pro." in italic / cursive script */}
        <div className="flex items-center gap-1.5 text-base sm:text-lg font-serif italic text-slate-700 font-medium tracking-wide">
          <span>By</span>
          <span className="text-[#0052ff] font-semibold">Pasiflora Biohacking Pro.</span>
        </div>

        {/* 3-Second Loading Bar Indicator */}
        <div className="w-36 h-1 bg-slate-100 rounded-full mt-8 overflow-hidden">
          <div className="h-full bg-[#0052ff] rounded-full animate-[pulse_1.2s_ease-in-out_infinite]"></div>
        </div>

        <span className="text-[11px] text-slate-400 mt-2 font-medium tracking-wider uppercase">
          Iniciando plataforma...
        </span>

      </div>
    </div>
  );
};
