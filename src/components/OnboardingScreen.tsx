import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, MapPin, ArrowRight, ArrowLeft, Check, Camera } from 'lucide-react';
import { UserRole } from '../types';
import { getEmailAvatarUrl } from '../utils/userUtils';

interface OnboardingScreenProps {
  defaultEmail?: string;
  onComplete: (data: {
    email: string;
    name: string;
    phone: string;
    role: UserRole;
    address: string;
    city: string;
    avatarUrl: string;
  }) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ defaultEmail, onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Carlos Correa');
  const [email, setEmail] = useState(defaultEmail || 'carloscorreaup@gmail.com');
  const [phone, setPhone] = useState('+57 300 123 4567');
  const [role, setRole] = useState<UserRole>('both');
  const [city, setCity] = useState('Pereira');
  const [address, setAddress] = useState('Carrera 15 # 12-45, Barrio Álamos');

  // Automatic Avatar Preview derived from Email
  const autoAvatarUrl = getEmailAvatarUrl(email, name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      onComplete({
        email,
        name,
        phone,
        role,
        address,
        city,
        avatarUrl: autoAvatarUrl
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] bg-pattern text-[#141b2b] flex flex-col justify-center items-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-elevation-1">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0052ff] flex items-center justify-center font-bold text-lg text-white shadow-md">
              N
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#141b2b] font-geist">NexService.app</h2>
              <p className="text-xs text-slate-500">Paso {step} de 3</p>
            </div>
          </div>

          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Atrás</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: ACCOUNT & AUTOMATIC EMAIL AVATAR */}
          {step === 1 && (
            <>
              <div>
                <h3 className="text-lg font-bold text-[#141b2b] mb-1 font-geist">Crea tu Perfil</h3>
                <p className="text-xs text-slate-500 mb-3">La foto de perfil se sincroniza automáticamente con tu correo.</p>
              </div>

              {/* Live Avatar Preview */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-[#0052ff] bg-white shadow-sm shrink-0">
                  <img src={autoAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Foto de Perfil Automática</span>
                  <span className="text-[11px] text-emerald-600">Sincronizada con tu correo / Google</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp de Contacto Directo</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-[#141b2b] focus:outline-none focus:border-[#0052ff] font-mono"
                />
              </div>
            </>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 2 && (
            <>
              <div>
                <h3 className="text-lg font-bold text-[#141b2b] mb-1 font-geist">¿Cómo usarás la app?</h3>
                <p className="text-xs text-slate-500 mb-3">Puedes alternar tu modo en cualquier momento.</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div
                  onClick={() => setRole('both')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    role === 'both'
                      ? 'bg-blue-50 border-[#0052ff] text-[#141b2b]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm mb-1 text-[#0052ff]">
                    <span>⭐ Cliente y Proveedor (Recomendado)</span>
                    {role === 'both' && <Check className="w-4 h-4 text-[#0052ff]" />}
                  </div>
                  <p className="text-slate-500">Podrás comprar productos, agendar servicios y también publicar los tuyos.</p>
                </div>

                <div
                  onClick={() => setRole('client')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    role === 'client'
                      ? 'bg-blue-50 border-[#0052ff] text-[#141b2b]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm mb-1 text-slate-900">
                    <span>🛒 Solo Cliente / Comprador</span>
                    {role === 'client' && <Check className="w-4 h-4 text-[#0052ff]" />}
                  </div>
                  <p className="text-slate-500">Buscar y comprar productos o cotizar servicios verificados.</p>
                </div>

                <div
                  onClick={() => setRole('provider')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    role === 'provider'
                      ? 'bg-blue-50 border-[#0052ff] text-[#141b2b]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm mb-1 text-slate-900">
                    <span>💼 Proveedor / Vendedor</span>
                    {role === 'provider' && <Check className="w-4 h-4 text-[#0052ff]" />}
                  </div>
                  <p className="text-slate-500">Publicar productos y ofrecer servicios en tu ciudad.</p>
                </div>
              </div>
            </>
          )}

          {/* STEP 3: FIXED LOCATION FOR SNAP MAP */}
          {step === 3 && (
            <>
              <div>
                <h3 className="text-lg font-bold text-[#141b2b] mb-1 font-geist">Dirección Fija en el Mapa</h3>
                <p className="text-xs text-slate-500 mb-3">Tu dirección física se mostrará en el Snap Map.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-[#141b2b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección Exacta (Calle, Carrera, Barrio)</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-[#141b2b]"
                />
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#0052ff] hover:bg-blue-600 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>{step === 3 ? 'Comenzar en NexService' : 'Continuar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
