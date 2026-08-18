import React, { useState, useEffect } from 'react';

interface OnboardingScreenProps {
  onComplete: (data: { email: string; name?: string; mode?: 'client' | 'provider' } | string) => void;
  defaultEmail?: string;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  defaultEmail = 'carloscorreaup@gmail.com'
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState('');
  const [userRole, setUserRole] = useState<'client' | 'provider'>('client');
  const [showAuthModule, setShowAuthModule] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);

  useEffect(() => {
    // Phase 1: Fade/Zoom in logo immediately
    const logoTimer = setTimeout(() => {
      setLogoVisible(true);
    }, 100);

    // Phase 2: After 2 seconds, slide up the Auth Module from bottom
    const authTimer = setTimeout(() => {
      setShowAuthModule(true);
    }, 2000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(authTimer);
    };
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onComplete({ email: email.trim() });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && name.trim()) {
      onComplete({
        email: email.trim(),
        name: name.trim(),
        mode: userRole
      });
    }
  };

  return (
    <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden font-inter text-[#141b2b] select-none">
      {/* Subtle Background Radial Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0052ff]/5 via-white to-white pointer-events-none z-0"></div>

      {/* Centered Logo & Brand Name Animation */}
      <div 
        className={`flex flex-col items-center justify-center text-center relative z-10 transition-all duration-700 ease-out ${
          logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        } ${showAuthModule ? '-translate-y-28 md:-translate-y-36' : 'translate-y-0'}`}
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#003ec7] to-[#0052ff] rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <img 
            alt="NexService Logo" 
            className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-2xl relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-105" 
            src="/logo.png" 
          />
        </div>

        <h1 className="font-geist text-3xl md:text-5xl font-bold text-[#003ec7] tracking-tight mt-5">
          NexService<span className="text-[#0052ff]">.app</span>
        </h1>
        <p className="text-[#737688] text-sm md:text-base font-medium mt-1.5 max-w-xs md:max-w-sm">
          Tu red de servicios y profesionales en Colombia
        </p>
      </div>

      {/* Slide-Up Login / Register Auth Card */}
      <div 
        className={`fixed bottom-0 left-0 w-full flex justify-center z-30 transition-all duration-700 ease-out transform ${
          showAuthModule 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-t-3xl md:rounded-2xl shadow-[0_-8px_35px_rgba(0,0,0,0.12)] border border-[#c3c5d9]/40 p-6 md:p-8 max-w-md w-full relative overflow-hidden mb-0 md:mb-8">
          {/* Top Decorative Gradient Accent Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003ec7] via-[#0052ff] to-[#4b41e1]"></div>

          {/* Auth Tab Switcher */}
          <div className="flex bg-[#f1f3ff] p-1 rounded-xl mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-[#003ec7] shadow-2xs font-bold'
                  : 'text-[#737688] hover:text-[#141b2b]'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-[#003ec7] shadow-2xs font-bold'
                  : 'text-[#737688] hover:text-[#141b2b]'
              }`}
            >
              Registrarme
            </button>
          </div>

          {/* Login Form */}
          {authMode === 'login' ? (
            <form className="flex flex-col gap-4 w-full animate-in fade-in duration-200" onSubmit={handleLoginSubmit}>
              <div className="text-left">
                <h2 className="font-geist text-xl font-bold text-[#141b2b] mb-1">
                  ¡Hola de nuevo!
                </h2>
                <p className="text-xs text-[#737688]">
                  Ingresa tu correo para acceder a tu cuenta
                </p>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-[#434656] uppercase tracking-wider pl-1" htmlFor="email_login">
                  Correo Electrónico
                </label>
                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#737688] group-focus-within:text-[#0052ff] transition-colors text-[20px]">
                    mail
                  </span>
                  <input 
                    className="w-full bg-[#F3F4F6] text-[#141b2b] border-2 border-transparent rounded-xl py-3 pl-11 pr-4 text-sm focus:bg-white focus:border-[#0052ff] focus:ring-3 focus:ring-[#0052ff]/15 transition-all outline-none" 
                    id="email_login" 
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
          ) : (
            /* Registration Form */
            <form className="flex flex-col gap-4 w-full animate-in fade-in duration-200" onSubmit={handleRegisterSubmit}>
              <div className="text-left">
                <h2 className="font-geist text-xl font-bold text-[#141b2b] mb-1">
                  Crea tu cuenta gratis
                </h2>
                <p className="text-xs text-[#737688]">
                  Únete para solicitar o prestar servicios en tu ciudad
                </p>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-[#434656] uppercase tracking-wider pl-1" htmlFor="reg_name">
                  Nombre Completo
                </label>
                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#737688] group-focus-within:text-[#0052ff] transition-colors text-[20px]">
                    person
                  </span>
                  <input 
                    className="w-full bg-[#F3F4F6] text-[#141b2b] border-2 border-transparent rounded-xl py-3 pl-11 pr-4 text-sm focus:bg-white focus:border-[#0052ff] focus:ring-3 focus:ring-[#0052ff]/15 transition-all outline-none" 
                    id="reg_name" 
                    name="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Carlos Correa" 
                    required 
                    type="text"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-[#434656] uppercase tracking-wider pl-1" htmlFor="reg_email">
                  Correo Electrónico
                </label>
                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#737688] group-focus-within:text-[#0052ff] transition-colors text-[20px]">
                    mail
                  </span>
                  <input 
                    className="w-full bg-[#F3F4F6] text-[#141b2b] border-2 border-transparent rounded-xl py-3 pl-11 pr-4 text-sm focus:bg-white focus:border-[#0052ff] focus:ring-3 focus:ring-[#0052ff]/15 transition-all outline-none" 
                    id="reg_email" 
                    name="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com" 
                    required 
                    type="email"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-[#434656] uppercase tracking-wider pl-1">
                  ¿Cómo usarás la app?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserRole('client')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      userRole === 'client'
                        ? 'bg-[#e9edff] border-[#0052ff] text-[#003ec7]'
                        : 'bg-white border-[#c3c5d9]/60 text-[#737688]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">search</span>
                    Soy Cliente
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserRole('provider')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      userRole === 'provider'
                        ? 'bg-[#e9edff] border-[#0052ff] text-[#003ec7]'
                        : 'bg-white border-[#c3c5d9]/60 text-[#737688]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">storefront</span>
                    Soy Proveedor
                  </button>
                </div>
              </div>

              <button 
                className="w-full bg-[#0052ff] hover:bg-[#003ec7] active:scale-[0.99] text-white font-geist font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm cursor-pointer mt-1" 
                type="submit"
              >
                <span>Crear cuenta y Empezar</span>
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </button>
            </form>
          )}

          {/* Quick Demo Shortcuts */}
          <div className="flex items-center justify-center gap-2 pt-3 border-t border-[#f1f3ff] mt-4">
            <span className="text-[11px] text-[#737688]">Acceso rápido demo:</span>
            <button 
              onClick={() => onComplete({ email: 'carloscorreaup@gmail.com', name: 'Carlos Correa', mode: 'client' })}
              className="text-[11px] text-[#0052ff] hover:underline font-semibold cursor-pointer"
            >
              Cliente
            </button>
            <span className="text-[11px] text-[#c3c5d9]">•</span>
            <button 
              onClick={() => onComplete({ email: 'juan.plomero@nexservice.co', name: 'Juan Pérez', mode: 'provider' })}
              className="text-[11px] text-[#0052ff] hover:underline font-semibold cursor-pointer"
            >
              Proveedor Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
