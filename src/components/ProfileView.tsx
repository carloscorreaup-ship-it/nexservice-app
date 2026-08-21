import React from 'react';
import { User, MapPin, ShieldCheck, Flame, RefreshCw, LogOut, Store, ShieldAlert, ArrowLeft } from 'lucide-react';
import { UserSession, Provider } from '../types';

interface ProfileViewProps {
  userSession: UserSession;
  providers: Provider[];
  onOpenCitySelector: () => void;
  onOpenFirebaseConfig: () => void;
  onToggleProviderMode: () => void;
  onViewProvider: (provider: Provider) => void;
  onOpenAdminPanel?: () => void;
  onLogout: () => void;
  onResetData: () => void;
  onBack?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userSession,
  onOpenCitySelector,
  onOpenFirebaseConfig,
  onToggleProviderMode,
  onOpenAdminPanel,
  onLogout,
  onResetData,
  onBack,
}) => {
  const isAdmin = userSession.email.toLowerCase() === 'carloscorreaup@gmail.com';

  return (
    <div className="pb-24 max-w-3xl mx-auto px-4 pt-4">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
          <span>Volver al Inicio</span>
        </button>
      )}

      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-6 shadow-elevation-1 flex items-center gap-4">
        <div className="w-16 h-16 rounded-3xl overflow-hidden bg-slate-100 ring-4 ring-blue-100 flex items-center justify-center text-xl font-bold text-[#0052ff]">
          {userSession.avatarUrl ? (
            <img src={userSession.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            'CC'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#141b2b] font-geist">{userSession.name || 'Carlos Correa'}</h2>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {isAdmin && (
              <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-full border border-red-200">
                SUPER ADMIN
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate">{userSession.email}</p>
          <div className="flex items-center gap-1.5 text-xs text-[#0052ff] mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{userSession.fixedLocation?.address || 'Pereira, Colombia'}</span>
          </div>
        </div>
      </div>

      {/* Admin shortcut */}
      {isAdmin && onOpenAdminPanel && (
        <div className="bg-red-50/70 border border-red-200 rounded-3xl p-4 mb-4 shadow-sm">
          <button
            onClick={onOpenAdminPanel}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-red-50 border border-red-200 text-left transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-600 text-white">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900">Panel Super Administrador</div>
                <div className="text-xs text-red-700">Ver base de datos de usuarios y activar/desactivar cuentas</div>
              </div>
            </div>
            <span className="text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded-xl shadow-sm">Abrir</span>
          </button>
        </div>
      )}

      {/* Settings */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-2 mb-6 shadow-sm">
        <button
          onClick={onToggleProviderMode}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Cambiar Modo</div>
              <div className="text-xs text-slate-500">Actualmente en: {userSession.mode === 'provider' ? 'Modo Proveedor' : 'Modo Cliente'}</div>
            </div>
          </div>
        </button>

        <button
          onClick={onOpenFirebaseConfig}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Configuración Firebase</div>
              <div className="text-xs text-slate-500">Gestionar claves y conexión en tiempo real</div>
            </div>
          </div>
        </button>

        <button
          onClick={onOpenCitySelector}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0052ff]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Cambiar Ciudad</div>
              <div className="text-xs text-slate-500">Actual: {userSession.city}</div>
            </div>
          </div>
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onResetData}
          className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restablecer Datos</span>
        </button>
        <button
          onClick={onLogout}
          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
