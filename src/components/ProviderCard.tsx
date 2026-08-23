import React from 'react';
import { Star, ShieldCheck, MapPin, MessageSquare, ShoppingBag, Wrench } from 'lucide-react';
import { Provider } from '../types';

interface ProviderCardProps {
  provider: Provider;
  onViewDetails: (provider: Provider) => void;
  onContactWhatsApp: (provider: Provider) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (providerId: string) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onViewDetails,
  onContactWhatsApp,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-5 shadow-elevation-1 hover:shadow-elevation-hover transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => onViewDetails(provider)}
              className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-blue-100 cursor-pointer group-hover:scale-105 transition-transform bg-slate-100"
            >
              <img
                src={provider.avatarUrl}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 
                  onClick={() => onViewDetails(provider)}
                  className="font-bold text-[#141b2b] text-base hover:text-[#0052ff] cursor-pointer transition-colors"
                >
                  {provider.name}
                </h3>
                {provider.verified && (
                  <span title="Verificado Oficial">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">{provider.businessName}</p>
              
              <div className="flex items-center gap-2 mt-1 text-xs">
                <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{provider.rating.toFixed(1)}</span>
                </div>
                <span className="text-slate-400">({provider.reviewCount} reseñas)</span>
              </div>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200 uppercase">
            {provider.offerType === 'both' ? 'Productos & Servicios' : provider.offerType === 'products' ? 'Tienda / Productos' : 'Servicios'}
          </span>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {provider.description}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#0052ff] shrink-0" />
          <span className="truncate flex-1">{provider.address}</span>
          {provider.serviceModality === 'home_delivery' ? (
            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md shrink-0">
              🛵 Domicilio
            </span>
          ) : provider.serviceModality === 'mobile_street' ? (
            <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-md shrink-0">
              🚐 Ambulante
            </span>
          ) : (
            <span className="text-[9px] font-bold bg-blue-50 text-[#0052ff] border border-blue-200 px-1.5 py-0.5 rounded-md shrink-0">
              🏢 Local Físico
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {provider.services.length > 0 && (
            <span className="text-[11px] bg-blue-50 text-[#0052ff] border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Wrench className="w-3 h-3" /> {provider.services.length} Servicios
            </span>
          )}
          {provider.products.length > 0 && (
            <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" /> {provider.products.length} Productos
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onViewDetails(provider)}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-2xl transition-all"
        >
          Ver Perfil Completo
        </button>
        <button
          onClick={() => onContactWhatsApp(provider)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-2xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
