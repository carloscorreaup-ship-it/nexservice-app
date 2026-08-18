import React from 'react';
import { Provider } from '../types';

interface ProviderCardProps {
  provider: Provider;
  onContactWhatsApp: (provider: Provider) => void;
  onViewDetails: (provider: Provider) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (providerId: string) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onContactWhatsApp,
  onViewDetails,
  isFavorite = false,
  onToggleFavorite
}) => {
  return (
    <article className="bg-white rounded-2xl p-5 border border-[#e1e8fd] shadow-elevation-1 hover:shadow-elevation-hover hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group relative">
      {/* Top Section */}
      <div>
        <div className="flex items-start gap-4 mb-3.5">
          {/* Avatar with fallback */}
          <div 
            onClick={() => onViewDetails(provider)}
            className="w-16 h-16 rounded-full bg-[#f1f3ff] overflow-hidden shrink-0 border border-[#c3c5d9]/60 cursor-pointer group-hover:border-[#0052ff] transition-colors relative"
          >
            <img 
              src={provider.avatarUrl} 
              alt={provider.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback avatar
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Info Header */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 
                onClick={() => onViewDetails(provider)}
                className="font-geist text-lg md:text-xl font-bold text-[#141b2b] truncate cursor-pointer hover:text-[#0052ff] transition-colors"
                title={provider.name}
              >
                {provider.name}
              </h4>
              
              {/* Verified badge */}
              {provider.verified && (
                <div 
                  className="bg-[#0052ff]/10 text-[#0052ff] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ml-1.5"
                  title="Proveedor Verificado por NexService"
                >
                  <span className="material-symbols-outlined text-[14px] filled">verified</span>
                  <span className="text-[11px] font-semibold hidden sm:inline">Verificado</span>
                </div>
              )}
            </div>

            <p className="text-sm font-medium text-[#434656] truncate mt-0.5">
              {provider.businessName}
            </p>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-1.5 mt-1 text-[#434656]">
              <span className="material-symbols-outlined text-[16px] text-[#bf3003] filled">star</span>
              <span className="text-sm font-bold text-[#141b2b]">{provider.rating.toFixed(1)}</span>
              <span className="text-xs text-[#737688]">({provider.reviewCount} reseñas)</span>
            </div>
          </div>

          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(provider.id)}
              className="text-[#737688] hover:text-[#ba1a1a] transition-colors p-1 cursor-pointer shrink-0"
              title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            >
              <span className={`material-symbols-outlined text-[20px] ${isFavorite ? 'filled text-[#ba1a1a]' : ''}`}>
                favorite
              </span>
            </button>
          )}
        </div>

        {/* Description preview */}
        <p className="text-xs md:text-sm text-[#434656] line-clamp-2 mb-3.5 leading-relaxed">
          {provider.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <span className="bg-[#f1f3ff] text-[#141b2b] px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border border-[#c3c5d9]/40">
            <span className="material-symbols-outlined text-[13px] text-[#0052ff]">
              {provider.category === 'Reparaciones' ? 'plumbing' :
               provider.category === 'Legal' ? 'gavel' :
               provider.category === 'Tecnología' ? 'devices' :
               provider.category === 'Salud' ? 'medical_services' :
               provider.category === 'Belleza' ? 'spa' : 'home_repair_service'}
            </span>
            {provider.category}
          </span>

          {provider.isDelivery && (
            <span className="bg-[#ffdbd2]/40 text-[#952200] px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border border-[#ffdbd2]">
              <span className="material-symbols-outlined text-[13px]">local_shipping</span>
              A Domicilio
            </span>
          )}

          {provider.yearsOfExperience && (
            <span className="bg-[#e9edff] text-[#003ec7] px-2.5 py-1 rounded-lg text-xs font-medium hidden sm:inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified_user</span>
              {provider.yearsOfExperience} años exp.
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto pt-2 border-t border-[#f1f3ff] flex items-center gap-2.5">
        <button
          onClick={() => onContactWhatsApp(provider)}
          className="flex-1 bg-[#25D366] hover:bg-[#20B056] active:scale-[0.98] text-white py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>Contactar</span>
        </button>

        <button
          onClick={() => onViewDetails(provider)}
          className="w-10 h-10 border border-[#c3c5d9] hover:border-[#0052ff] hover:bg-[#e9edff]/50 rounded-xl flex items-center justify-center text-[#434656] hover:text-[#003ec7] transition-all cursor-pointer shrink-0"
          title="Ver perfil completo y servicios"
        >
          <span className="material-symbols-outlined text-[20px]">language</span>
        </button>
      </div>
    </article>
  );
};
