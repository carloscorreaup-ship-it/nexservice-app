import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ShieldCheck,
  Star,
  MessageSquare,
  ShoppingBag,
  Wrench,
  User,
  Crosshair,
  ArrowLeft,
  X
} from 'lucide-react';
import { Provider, ProductItem, UserSession } from '../types';
import { calculateDistanceKm, formatDistance, DEFAULT_COLOMBIA_COORDS } from '../utils/geoUtils';

interface SnapMapViewProps {
  currentCity: string;
  providers: Provider[];
  products: ProductItem[];
  userSession: UserSession;
  onSelectProvider: (provider: Provider) => void;
  onContactWhatsApp: (provider: Provider) => void;
  onBack?: () => void;
}

export const SnapMapView: React.FC<SnapMapViewProps> = ({
  currentCity,
  providers,
  userSession,
  onSelectProvider,
  onContactWhatsApp,
  onBack,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'services' | 'products'>('all');
  const [selectedEntity, setSelectedEntity] = useState<Provider | null>(null);

  const cityCenter = DEFAULT_COLOMBIA_COORDS[currentCity] || DEFAULT_COLOMBIA_COORDS['Pereira'];
  const userCoords = userSession.fixedLocation?.coordinates || cityCenter;

  const visibleProviders = useMemo(() => {
    return providers.filter((p) => {
      if (filterType === 'services') return p.offerType === 'services' || p.offerType === 'both';
      if (filterType === 'products') return p.offerType === 'products' || p.offerType === 'both';
      return true;
    });
  }, [providers, filterType]);

  return (
    <div className="relative w-full h-[calc(100vh-125px)] md:h-[calc(100vh-70px)] bg-[#eef2f6] overflow-hidden flex flex-col">
      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 max-w-xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md text-slate-700 hover:bg-white flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
              <span className="hidden sm:inline">Volver</span>
            </button>
          )}

          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-md flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-[#0052ff] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({providers.length})
            </button>
            <button
              onClick={() => setFilterType('services')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                filterType === 'services'
                  ? 'bg-[#0052ff] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3 h-3" /> Servicios
            </button>
            <button
              onClick={() => setFilterType('products')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                filterType === 'products'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3 h-3" /> Productos
            </button>
          </div>
        </div>

        <button
          onClick={() => alert(`Centrando en: ${userSession.fixedLocation?.address || currentCity}`)}
          className="p-2.5 bg-white/95 backdrop-blur-md text-[#0052ff] rounded-2xl border border-slate-200 shadow-md"
          title="Mi Ubicación"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>

      {/* Map Surface */}
      <div className="relative flex-1 w-full bg-[#f4f7fb] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-70" />

        {/* User Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-[#0052ff] pulse-radar" />
            <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-[#0052ff] border-2 border-white flex items-center justify-center shadow-lg">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="bg-white/95 border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md mt-1">
            Tú ({userSession.name || 'Cliente'})
          </div>
        </div>

        {/* Provider Pins */}
        {visibleProviders.map((prov, index) => {
          const angle = (index * (360 / Math.max(visibleProviders.length, 1)) * Math.PI) / 180;
          const radius = 120 + (index % 3) * 45;
          const topOffset = `calc(50% + ${Math.sin(angle) * radius}px)`;
          const leftOffset = `calc(50% + ${Math.cos(angle) * radius * 1.3}px)`;

          const distanceKm = calculateDistanceKm(userCoords, prov.coordinates);
          const isSelected = selectedEntity?.id === prov.id;

          return (
            <div
              key={prov.id}
              style={{ top: topOffset, left: leftOffset }}
              onClick={() => setSelectedEntity(prov)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group flex flex-col items-center transition-all hover:scale-110"
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl overflow-hidden ring-3 shadow-md transition-all ${
                  isSelected ? 'ring-emerald-500 scale-110' : 'ring-[#0052ff] group-hover:ring-slate-800'
                }`}>
                  <img src={prov.avatarUrl} alt={prov.name} className="w-full h-full object-cover" />
                </div>

                <div className="absolute -top-1.5 -right-1.5 bg-white p-0.5 rounded-full shadow border border-slate-200">
                  {prov.offerType === 'products' ? (
                    <ShoppingBag className="w-3 h-3 text-emerald-600" />
                  ) : prov.offerType === 'services' ? (
                    <Wrench className="w-3 h-3 text-[#0052ff]" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 text-amber-500" />
                  )}
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md mt-1 flex items-center gap-1 group-hover:bg-[#0052ff] group-hover:text-white transition-colors">
                <span>{prov.name.split(' ')[0]}</span>
                <span className="text-emerald-600 group-hover:text-emerald-200">({formatDistance(distanceKm)})</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Drawer Preview */}
      {selectedEntity && (
        <div className="absolute bottom-4 left-4 right-4 z-30 max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <img
                src={selectedEntity.avatarUrl}
                alt={selectedEntity.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 text-sm">{selectedEntity.name}</h3>
                  {selectedEntity.verified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-xs text-slate-500">{selectedEntity.businessName}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-bold text-amber-500">★ {selectedEntity.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{selectedEntity.address}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedEntity(null)}
              className="p-1 text-slate-400 hover:text-slate-800 rounded-full bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => onSelectProvider(selectedEntity)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl transition-all"
            >
              Ver Perfil
            </button>
            <button
              onClick={() => onContactWhatsApp(selectedEntity)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Directo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
