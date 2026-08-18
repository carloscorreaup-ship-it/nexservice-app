import React from 'react';
import { UserSession, Provider } from '../types';

interface ProfileViewProps {
  userSession: UserSession;
  providers: Provider[];
  onOpenCitySelector: () => void;
  onToggleProviderMode: () => void;
  onViewProvider: (provider: Provider) => void;
  onLogout: () => void;
  onResetData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userSession,
  providers,
  onOpenCitySelector,
  onToggleProviderMode,
  onViewProvider,
  onLogout,
  onResetData
}) => {
  const favoriteProviders = providers.filter((p) => userSession.favorites.includes(p.id));

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 pt-22 pb-24 md:pb-16 font-inter">
      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#e1e8fd] shadow-elevation-1 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-full bg-[#e9edff] border-2 border-[#0052ff] overflow-hidden shrink-0 shadow-xs">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZvoz3EuYmNT3k6LuMqnW98-amCznFhnjHu2W5iezyKOp0vW4svO3COFcpNOLyspuY4k_GomBJ90ebg7jXdOejGuCplIV1OACf5DrnV1GAj38Mj-SansNHR1Q4duLoCns3SujwmakQdB_yZG7PIFy3iw2USnRAZb_NvVmtLBoZnJtcUfu1Kgq8rNeZJUE72ZgADOf7b-c_sn9yXxjVp5tjJIwcts1-TxoW6lKs3P9YFeHcgEm-U2t6" 
            alt="Foto de perfil"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="font-geist text-xl md:text-2xl font-bold text-[#141b2b]">
              {userSession.name || 'Carlos Correa'}
            </h2>
            <span className="bg-[#0052ff]/10 text-[#0052ff] text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
              Modo {userSession.mode === 'provider' ? 'Proveedor' : 'Cliente'}
            </span>
          </div>

          <p className="text-sm text-[#434656] mt-0.5">{userSession.email}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
            <button
              onClick={onOpenCitySelector}
              className="bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#003ec7] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#c3c5d9]/60 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0052ff]">location_on</span>
              <span>Ciudad actual: <strong>{userSession.city}</strong></span>
              <span className="material-symbols-outlined text-[14px]">edit</span>
            </button>

            <button
              onClick={onToggleProviderMode}
              className="bg-[#e9edff] hover:bg-[#0052ff] text-[#003ec7] hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>Cambiar a Modo {userSession.mode === 'provider' ? 'Cliente' : 'Proveedor'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Favorite Providers */}
      <div className="mb-8">
        <h3 className="font-geist text-lg md:text-xl font-bold text-[#141b2b] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ba1a1a] filled text-[22px]">favorite</span>
          <span>Profesionales Favoritos ({favoriteProviders.length})</span>
        </h3>

        {favoriteProviders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favoriteProviders.map((p) => (
              <div
                key={p.id}
                onClick={() => onViewProvider(p)}
                className="bg-white p-4 rounded-xl border border-[#e1e8fd] hover:border-[#0052ff] transition-all flex items-center gap-3 cursor-pointer shadow-2xs"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#c3c5d9]/60">
                  <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-[#141b2b] truncate">{p.name}</h4>
                  <p className="text-xs text-[#434656] truncate">{p.businessName}</p>
                  <span className="text-xs text-[#0052ff] font-medium flex items-center gap-0.5 mt-0.5">
                    ★ {p.rating.toFixed(1)} • {p.category}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[#737688] text-[20px]">chevron_right</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center border border-[#e1e8fd] text-[#737688] text-sm">
            <span className="material-symbols-outlined text-[28px] text-[#c3c5d9] mb-1">favorite_border</span>
            <p>Aún no has guardado profesionales en tus favoritos.</p>
          </div>
        )}
      </div>

      {/* Account Settings List */}
      <div className="bg-white rounded-2xl border border-[#e1e8fd] overflow-hidden shadow-elevation-1 mb-8">
        <div className="p-4 bg-[#f9f9ff] border-b border-[#e1e8fd]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#737688]">Configuración y Seguridad</h4>
        </div>

        <div className="divide-y divide-[#f1f3ff] text-sm">
          <div className="p-4 flex items-center justify-between hover:bg-[#f9f9ff] transition-colors cursor-pointer" onClick={onOpenCitySelector}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#0052ff] text-[20px]">map</span>
              <div>
                <span className="font-medium text-[#141b2b] block">Cambiar Ciudad Predeterminada</span>
                <span className="text-xs text-[#737688]">Actualmente: {userSession.city}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#737688]">chevron_right</span>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-[#f9f9ff] transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#0052ff] text-[20px]">notifications</span>
              <div>
                <span className="font-medium text-[#141b2b] block">Notificaciones por WhatsApp y Correo</span>
                <span className="text-xs text-[#737688]">Recibir confirmaciones de cotizaciones</span>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0052ff] rounded focus:ring-[#0052ff]" />
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-[#f9f9ff] transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#0052ff] text-[20px]">verified_user</span>
              <div>
                <span className="font-medium text-[#141b2b] block">Verificación de Identidad NexService</span>
                <span className="text-xs text-[#25D366] font-semibold">Estado: Aprobado</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#25D366] filled">check_circle</span>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-[#f9f9ff] transition-colors cursor-pointer" onClick={onResetData}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#bf3003] text-[20px]">restart_alt</span>
              <div>
                <span className="font-medium text-[#141b2b] block">Restablecer datos de demostración</span>
                <span className="text-xs text-[#737688]">Reinicia proveedores y solicitudes a los valores originales</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#737688]">refresh</span>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-[#fff0ed] transition-colors cursor-pointer" onClick={onLogout}>
            <div className="flex items-center gap-3 text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="font-semibold">Cerrar Sesión / Cambiar Usuario</span>
            </div>
            <span className="material-symbols-outlined text-[#ba1a1a]">arrow_forward</span>
          </div>
        </div>
      </div>

      {/* App Info Footer */}
      <div className="text-center text-xs text-[#737688] space-y-1">
        <p className="font-semibold font-geist text-[#003ec7]">NexService.app v2.4 • Red de Profesionales Locales</p>
        <p>Desarrollado para Pereira, Risaralda y las principales ciudades de Colombia.</p>
      </div>
    </main>
  );
};
