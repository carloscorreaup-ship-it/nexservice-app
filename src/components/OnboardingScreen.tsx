import React, { useState } from 'react';
import { LOGO_URL } from '../data/mockData';

interface OnboardingScreenProps {
  onComplete: (email: string) => void;
  defaultEmail?: string;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  defaultEmail = 'carloscorreaup@gmail.com'
}) => {
  const [email, setEmail] = useState(defaultEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onComplete(email.trim());
    }
  };

  return (
    <div className="bg-[#f9f9ff] min-h-screen flex flex-col font-inter text-[#141b2b] relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-pattern z-0 opacity-60 pointer-events-none"></div>

      {/* Header with Logo */}
      <header className="w-full flex justify-center py-6 px-4 relative z-10">
        <div className="max-w-7xl w-full flex justify-center items-center">
          <img 
            alt="NexService Logo" 
            className="h-12 w-auto object-contain rounded-md" 
            src={LOGO_URL} 
          />
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center px-4 md:px-6 relative z-10 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-elevation-1 p-6 md:p-8 relative z-10 border border-[#c3c5d9]/30 flex flex-col gap-6 transition-all duration-300 hover:shadow-elevation-hover">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#003ec7] via-[#0052ff] to-[#4b41e1] rounded-t-2xl"></div>

          {/* Hero Section / Context */}
          <div className="text-center flex flex-col gap-3 pt-2">
            <div className="flex justify-center mb-1">
              <div className="w-16 h-16 rounded-2xl bg-[#0052ff]/10 flex items-center justify-center text-[#0052ff]">
                <span className="material-symbols-outlined text-[36px] filled">
                  hub
                </span>
              </div>
            </div>
            <h1 className="font-geist text-2xl md:text-3xl font-bold text-[#141b2b] leading-tight">
              Encuentra y ofrece servicios profesionales en tu ciudad a un clic
            </h1>
            <p className="text-[#434656] text-sm md:text-base leading-relaxed">
              Únete a la red más confiable de profesionales locales. Rápido, seguro y sin complicaciones.
            </p>
          </div>

          {/* Onboarding Form */}
          <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434656] uppercase tracking-wider pl-1" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative flex items-center group">
                <span className="material-symbols-outlined absolute left-3.5 text-[#737688] group-focus-within:text-[#0052ff] transition-colors text-[20px]">
                  mail
                </span>
                <input 
                  className="w-full bg-[#F3F4F6] text-[#141b2b] border-2 border-transparent rounded-xl py-3.5 pl-11 pr-4 text-sm md:text-base focus:bg-white focus:border-[#0052ff] focus:ring-3 focus:ring-[#0052ff]/15 transition-all outline-none" 
                  id="email" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com" 
                  required 
                  type="email"
                />
              </div>
            </div>

            <button 
              className="w-full bg-[#0052ff] hover:bg-[#003ec7] active:scale-[0.99] text-white font-geist font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm cursor-pointer mt-1" 
              type="submit"
            >
              <span>Ingresar a NexService.app</span>
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Demo quick selector */}
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-[#f1f3ff]">
            <span className="text-xs text-[#737688]">Acceso rápido demo:</span>
            <button 
              onClick={() => onComplete('carloscorreaup@gmail.com')}
              className="text-xs text-[#0052ff] hover:underline font-medium cursor-pointer"
            >
              Cliente
            </button>
            <span className="text-xs text-[#c3c5d9]">•</span>
            <button 
              onClick={() => onComplete('juan.plomero@nexservice.co')}
              className="text-xs text-[#0052ff] hover:underline font-medium cursor-pointer"
            >
              Proveedor Pro
            </button>
          </div>

          {/* Trust / Footer */}
          <div className="text-center">
            <p className="text-xs text-[#737688] leading-relaxed">
              Al continuar, aceptas nuestros{' '}
              <a className="text-[#0052ff] hover:underline font-medium" href="#terms" onClick={(e) => e.preventDefault()}>
                Términos de Servicio
              </a>{' '}
              y{' '}
              <a className="text-[#0052ff] hover:underline font-medium" href="#privacy" onClick={(e) => e.preventDefault()}>
                Política de Privacidad
              </a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
