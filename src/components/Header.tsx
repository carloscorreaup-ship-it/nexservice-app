import React from 'react';
import { MapPin, ShieldCheck, Flame, Bell, ShieldAlert, ArrowLeft } from 'lucide-react';
import { isFirebaseConnected } from '../services/firebase';

interface HeaderProps {
  currentCity: string;
  onOpenCitySelector: () => void;
  onOpenFirebaseConfig: () => void;
  activeTab: string;
  setActiveTab: (tab: 'explore' | 'map' | 'provider' | 'bookings' | 'profile' | 'admin') => void;
  isProviderMode: boolean;
  onToggleProviderMode: () => void;
  ordersCount: number;
  userAvatarUrl?: string;
  isAdmin?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onOpenCitySelector,
  onOpenFirebaseConfig,
  activeTab,
  setActiveTab,
  isProviderMode,
  onToggleProviderMode,
  ordersCount,
  userAvatarUrl,
  isAdmin = false,
  onBack,
}) => {
  const showBackButton = activeTab !== 'explore' && onBack;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 text-[#141b2b] px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left Side: Back Button OR Logo & City */}
        <div className="flex items-center gap-2.5">
          {showBackButton ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
              <span>Atrás</span>
            </button>
          ) : (
            <div 
              onClick={() => setActiveTab('explore')}
              className="cursor-pointer flex items-center gap-2"
            >
              <img src="/logo.png" alt="NexService.app" className="h-8 w-auto object-contain" onError={(e) => {
                e.currentTarget.style.display = 'none';
              }} />
              <div className="flex items-center gap-1 font-bold text-sm tracking-tight text-[#141b2b]">
                <span className="font-geist">NexService</span>
                <span className="text-[10px] bg-blue-50 text-[#0052ff] font-semibold px-1.5 py-0.2 rounded-full border border-blue-200 flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verificado
                </span>
              </div>
            </div>
          )}

          {/* City Selector Pill */}
          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium px-2.5 py-1.5 rounded-full transition-all border border-slate-200"
          >
            <MapPin className="w-3.5 h-3.5 text-[#0052ff]" />
            <span className="max-w-[90px] truncate">{currentCity}</span>
          </button>
        </div>

        {/* Right Side: Admin, Mode Switch, Alerts & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* SUPER ADMIN BADGE */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeTab === 'admin'
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              }`}
              title="Panel Super Admin de Usuarios"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Firebase Database Status Indicator */}
          <button
            onClick={onOpenFirebaseConfig}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isFirebaseConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Estado de Firebase"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">
              {isFirebaseConnected ? 'Firestore Conectado' : 'Configurar BD'}
            </span>
          </button>

          {/* Mode Switcher */}
          <button
            onClick={onToggleProviderMode}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 border ${
              isProviderMode
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isProviderMode ? 'storefront' : 'person'}
            </span>
            <span className="hidden sm:inline">
              {isProviderMode ? 'Modo Proveedor' : 'Modo Cliente'}
            </span>
          </button>

          {/* Bookings / Orders Alert */}
          <button
            onClick={() => setActiveTab('bookings')}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
            title="Mis Pedidos y Citas"
          >
            <Bell className="w-4 h-4" />
            {ordersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#0052ff] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {ordersCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => setActiveTab('profile')}
            className="cursor-pointer w-8 h-8 rounded-full ring-2 ring-[#0052ff]/30 overflow-hidden bg-slate-100 flex items-center justify-center text-xs font-bold text-[#0052ff] hover:ring-[#0052ff]"
          >
            {userAvatarUrl ? (
              <img src={userAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              'CC'
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
