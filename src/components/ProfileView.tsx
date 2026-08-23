import React, { useState } from 'react';
import { User, MapPin, ShieldCheck, Flame, RefreshCw, LogOut, Store, ShieldAlert, ArrowLeft, FileText, Crosshair, Navigation, CheckCircle2, Chrome, Star, Download, Smartphone } from 'lucide-react';
import { UserSession, Provider } from '../types';
import { DataPolicyModal } from './DataPolicyModal';
import { requestUserCoordinates, reverseGeocodeAddress, findNearestCity } from '../utils/geoUtils';
import { getEmailAvatarUrl } from '../utils/userUtils';

interface ProfileViewProps {
  userSession: UserSession;
  providers: Provider[];
  onOpenCitySelector: () => void;
  onOpenFirebaseConfig: () => void;
  onToggleProviderMode: () => void;
  onViewProvider: (provider: Provider) => void;
  onUpdateLocation?: (updatedSession: UserSession) => void;
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
  onUpdateLocation,
  onOpenAdminPanel,
  onLogout,
  onResetData,
  onBack,
}) => {
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isSyncingGps, setIsSyncingGps] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const isAdmin = userSession.email.toLowerCase() === 'carloscorreaup@gmail.com';
  const effectiveAvatar = userSession.avatarUrl || getEmailAvatarUrl(userSession.email, userSession.name);
  const clientRating = userSession.rating || 5.0;
  const clientReviewsCount = userSession.reviewCount || 0;

  const handleSyncGpsLocation = async () => {
    setIsSyncingGps(true);
    setSyncStatus('Detectando satélites...');

    const coords = await requestUserCoordinates();
    if (coords) {
      const geoResult = await reverseGeocodeAddress(coords);
      const nearest = findNearestCity(coords);
      const cityName = geoResult?.city || nearest.name;
      const deptName = geoResult?.department || nearest.department;
      const addrName = geoResult?.address || `${cityName}, ${deptName}`;

      const updatedSession: UserSession = {
        ...userSession,
        city: cityName,
        department: deptName,
        fixedLocation: {
          ...userSession.fixedLocation,
          address: addrName,
          city: cityName,
          department: deptName,
          coordinates: coords,
        },
      };

      if (onUpdateLocation) {
        onUpdateLocation(updatedSession);
      }
      setSyncStatus('¡Ubicación GPS sincronizada!');
      setTimeout(() => setSyncStatus(null), 3000);
    } else {
      setSyncStatus('Error: Permiso de ubicación denegado.');
      setTimeout(() => setSyncStatus(null), 3500);
    }
    setIsSyncingGps(false);
  };

  return (
    <div className="pb-24 max-w-3xl mx-auto px-4 pt-4">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all border border-slate-200 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
          <span>Volver al Inicio</span>
        </button>
      )}

      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-6 shadow-elevation-1 flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-3xl overflow-hidden bg-slate-100 ring-4 ring-blue-100 flex items-center justify-center shrink-0 shadow-sm">
          <img
            src={effectiveAvatar}
            alt={userSession.name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userSession.name || 'Usuario')}&background=0052ff&color=fff&size=256&bold=true`;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-[#141b2b] font-geist">{userSession.name || 'Carlos Correa'}</h2>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            {isAdmin && (
              <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-full border border-red-200">
                SUPER ADMIN
              </span>
            )}
          </div>

          {/* Star Rating of User */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{clientRating.toFixed(1)} / 5.0</span>
            </div>
            <span className="text-[11px] text-slate-400">
              ({clientReviewsCount > 0 ? `${clientReviewsCount} calificaciones de proveedores` : 'Cliente Verificado'})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
            <Chrome className="w-3 h-3 text-[#0052ff] shrink-0" />
            <span className="truncate">{userSession.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#0052ff] mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{userSession.fixedLocation?.address || `${userSession.city}, Colombia`}</span>
          </div>
          {userSession.fixedLocation?.coordinates && (
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              GPS: {userSession.fixedLocation.coordinates.lat.toFixed(4)}, {userSession.fixedLocation.coordinates.lng.toFixed(4)}
            </div>
          )}
        </div>
      </div>

      {/* Admin shortcut */}
      {isAdmin && onOpenAdminPanel && (
        <div className="bg-red-50/70 border border-red-200 rounded-3xl p-4 mb-4 shadow-sm">
          <button
            onClick={onOpenAdminPanel}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-red-50 border border-red-200 text-left transition-all shadow-sm cursor-pointer"
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
        {/* GPS Sync */}
        <button
          onClick={handleSyncGpsLocation}
          disabled={isSyncingGps}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0052ff] group-hover:bg-[#0052ff] group-hover:text-white transition-colors">
              <Crosshair className={`w-5 h-5 ${isSyncingGps ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span>Sincronizar Ubicación GPS</span>
                {syncStatus && (
                  <span className="text-[11px] font-semibold text-emerald-600 animate-fade-in">
                    {syncStatus}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">Actualizar las coordenadas de tu celular para el mapa</div>
            </div>
          </div>
          <span className="text-xs font-bold bg-slate-100 group-hover:bg-[#0052ff] group-hover:text-white text-slate-700 px-3 py-1.5 rounded-xl transition-colors">
            {isSyncingGps ? 'GPS...' : 'Sincronizar'}
          </span>
        </button>

        <button
          onClick={onToggleProviderMode}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-left transition-all cursor-pointer"
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
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-left transition-all cursor-pointer"
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
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-left transition-all cursor-pointer"
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

        <button
          onClick={() => {
            const installEvent = (window as any).__pwaInstallPrompt;
            if (installEvent) {
              installEvent.prompt();
            } else {
              alert('Para instalar en tu celular:\n\n📱 En Android / Chrome: Toca los 3 puntos (⋮) arriba a la derecha y selecciona "Instalar aplicación" o "Agregar a la pantalla principal".\n\n🍏 En iPhone / Safari: Toca el botón Compartir (cuadrado con flecha hacia arriba) y selecciona "Agregar al inicio".');
            }
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 hover:from-blue-100 hover:to-indigo-100 text-left transition-all border border-blue-200/80 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0052ff] text-white shadow-sm shadow-blue-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span>Instalar App en el Celular</span>
                <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  PWA
                </span>
              </div>
              <div className="text-xs text-slate-500">Acceso rápido directo con el logo oficial en tu pantalla</div>
            </div>
          </div>
          <Download className="w-4 h-4 text-[#0052ff]" />
        </button>

        <button
          onClick={() => setShowPolicyModal(true)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 text-left transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Tratamiento de Datos y Privacidad</div>
              <div className="text-xs text-slate-500">Ley 1581 de 2012 • Habeas Data</div>
            </div>
          </div>
        </button>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={onResetData}
          className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restablecer Datos</span>
        </button>
        <button
          onClick={onLogout}
          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Footer Branding */}
      <div className="text-center pb-6">
        <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-slate-800">
          <span>NexService<span className="text-[#0052ff]">.app</span></span>
        </div>
        <div className="text-xs font-serif italic text-slate-500 mt-0.5">
          By <span className="text-[#0052ff] font-semibold">Pasiflora Biohacking Pro.</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Todos los derechos reservados • Conexión Directa de Proveedores
        </p>
      </div>

      {/* Data Policy Modal */}
      {showPolicyModal && (
        <DataPolicyModal
          onClose={() => setShowPolicyModal(false)}
        />
      )}
    </div>
  );
};
