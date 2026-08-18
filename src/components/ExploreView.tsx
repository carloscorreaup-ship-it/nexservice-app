import React, { useState, useMemo } from 'react';
import { Category, Provider } from '../types';
import { CATEGORIES } from '../data/mockData';
import { ProviderCard } from './ProviderCard';
import { classifyTextToCategory, getSuggestedServicesForQuery } from '../utils/serviceClassifier';

interface ExploreViewProps {
  currentCity: string;
  providers: Provider[];
  onSwitchToProviderMode?: () => void;
  onContactWhatsApp: (provider: Provider, message?: string) => void;
  onViewDetails: (provider: Provider) => void;
  favorites: string[];
  onToggleFavorite: (providerId: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  currentCity,
  providers,
  onSwitchToProviderMode,
  onContactWhatsApp,
  onViewDetails,
  favorites,
  onToggleFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [filterDomicilioOnly, setFilterDomicilioOnly] = useState(false);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Intelligent category detection
  const detectedCategory = useMemo(() => classifyTextToCategory(searchQuery), [searchQuery]);
  const suggestedServices = useMemo(() => getSuggestedServicesForQuery(searchQuery), [searchQuery]);

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providers
      .filter((p) => {
        // City match or generic
        const matchCity = !p.city || p.city.toLowerCase() === currentCity.toLowerCase();
        if (!matchCity) return false;

        // Search query match with smart classification fallback
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBiz = p.businessName.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
          const matchServices = p.services.some((s) => s.name.toLowerCase().includes(q));
          
          // Smart classification match: if text matches a category knowledge base
          const matchDetectedCategory = detectedCategory && p.category.toLowerCase() === detectedCategory.name.toLowerCase();

          if (!matchName && !matchBiz && !matchCat && !matchTags && !matchServices && !matchDetectedCategory) {
            return false;
          }
        }

        // Category match
        if (selectedCategory && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Domicilio filter
        if (filterDomicilioOnly && !p.isDelivery) {
          return false;
        }

        // Verified filter
        if (filterVerifiedOnly && !p.verified) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
        return a.name.localeCompare(b.name);
      });
  }, [providers, currentCity, searchQuery, selectedCategory, filterDomicilioOnly, filterVerifiedOnly, sortBy, detectedCategory]);

  const visibleCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 6);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 pt-22 pb-24 md:pb-16 font-inter">
      {/* Search Section */}
      <section className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="font-geist text-2xl md:text-4xl font-bold text-[#141b2b] mb-5 tracking-tight">
          ¿Qué producto o servicio necesitas hoy?
        </h1>
        <div className="relative max-w-2xl mx-auto text-left">
          <span className="material-symbols-outlined absolute left-4 top-4 text-[#737688] text-[22px]">
            search
          </span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white border border-[#c3c5d9]/60 focus:border-[#0052ff] focus:ring-4 focus:ring-[#0052ff]/15 transition-all text-base text-[#141b2b] shadow-elevation-1 outline-none placeholder:text-[#737688]" 
            placeholder="Ej. baño de gatos, organizo neveras, plomero, clases de inglés..." 
            type="text"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="absolute right-3.5 top-4 text-[#737688] hover:text-[#141b2b] p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}

          {/* Smart Auto-Classification & Dropdown Menu */}
          {searchQuery.trim().length > 1 && (isSearchFocused || true) && (
            <div className="absolute z-40 mt-2 w-full bg-white rounded-2xl shadow-elevation-hover border border-[#0052ff]/30 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-3 space-y-3">
              {/* Category Auto-Detection Banner */}
              {detectedCategory && (
                <div className="bg-[#e9edff] p-2.5 rounded-xl flex items-center justify-between border border-[#0052ff]/20">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0052ff] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      Categoría detectada
                    </span>
                    <span className="text-xs font-bold text-[#003ec7]">
                      {detectedCategory.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(detectedCategory.name);
                    }}
                    className="text-xs text-[#0052ff] hover:underline font-semibold cursor-pointer"
                  >
                    Filtrar por {detectedCategory.name}
                  </button>
                </div>
              )}

              {/* Suggested Services Dropdown Items */}
              {suggestedServices.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#737688] px-1 block mb-1.5">
                    Servicios Sugeridos
                  </span>
                  <div className="space-y-1">
                    {suggestedServices.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSearchQuery(item.name);
                          setSelectedCategory(item.category);
                        }}
                        className="p-2.5 rounded-xl hover:bg-[#f1f3ff] transition-colors cursor-pointer flex items-center justify-between text-xs md:text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#0052ff] text-[18px]">
                            auto_awesome
                          </span>
                          <span className="font-medium text-[#141b2b]">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-[#003ec7] bg-[#e9edff] px-2 py-0.5 rounded">
                          {item.priceEstimate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Provider Matches Summary */}
              <div className="pt-2 border-t border-[#f1f3ff] flex items-center justify-between text-xs text-[#737688]">
                <span>Se encontraron <strong>{filteredProviders.length}</strong> profesionales relacionados</span>
                <span className="text-[#0052ff] font-semibold">NexService.app</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick search tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-[#737688]">
          <span className="font-medium">Populares:</span>
          {['Baño de gatos', 'Organizar neveras', 'Plomería', 'Electricista', 'IT / Computadores'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="bg-white hover:bg-[#e9edff] text-[#003ec7] border border-[#c3c5d9]/40 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Quick Categories Bento Grid */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h3 className="font-geist text-xl md:text-2xl font-bold text-[#141b2b]">
              Categorías Populares
            </h3>
            <p className="text-xs md:text-sm text-[#737688]">
              Explora profesionales especializados en cada área
            </p>
          </div>
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-[#0052ff] font-semibold text-sm hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>{showAllCategories ? 'Ver menos' : 'Ver todas'}</span>
            <span className="material-symbols-outlined text-[16px]">
              {showAllCategories ? 'expand_less' : 'chevron_right'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {visibleCategories.map((cat) => {
            const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(isSelected ? null : cat.name);
                }}
                className={`bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 border transition-all shadow-elevation-1 hover:shadow-elevation-hover group h-32 text-center cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#0052ff] bg-[#f1f3ff] scale-[1.02]'
                    : 'border-[#dce2f7] hover:border-[#0052ff]/40 hover:-translate-y-0.5'
                }`}
              >
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#0052ff] text-white shadow-xs'
                      : 'bg-[#0052ff]/10 text-[#0052ff] group-hover:bg-[#0052ff] group-hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {cat.icon}
                  </span>
                </div>
                <span className={`text-sm font-semibold tracking-tight ${isSelected ? 'text-[#003ec7]' : 'text-[#141b2b]'}`}>
                  {cat.name}
                </span>
                <span className="text-[11px] text-[#737688] -mt-1 font-normal">
                  {cat.count} pros
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Results Header & Filters */}
      <section className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e1e8fd]">
          <div className="flex items-center gap-2">
            <h3 className="font-geist text-xl md:text-2xl font-bold text-[#141b2b]">
              Proveedores Destacados
            </h3>
            <span className="bg-[#e9edff] text-[#003ec7] text-xs font-bold px-2 py-0.5 rounded-full">
              {filteredProviders.length} en {currentCity}
            </span>
          </div>

          {/* Filter Pills & Toggle */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setFilterDomicilioOnly(!filterDomicilioOnly)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                filterDomicilioOnly
                  ? 'bg-[#bf3003] text-white border-[#bf3003]'
                  : 'bg-white text-[#434656] border-[#c3c5d9] hover:bg-[#f1f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">local_shipping</span>
              A Domicilio
            </button>

            <button
              onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                filterVerifiedOnly
                  ? 'bg-[#0052ff] text-white border-[#0052ff]'
                  : 'bg-white text-[#434656] border-[#c3c5d9] hover:bg-[#f1f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] filled">verified</span>
              Verificados
            </button>

            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`p-2 border rounded-xl hover:bg-[#f1f3ff] transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer ${
                showFilterDrawer ? 'bg-[#e9edff] border-[#0052ff] text-[#003ec7]' : 'border-[#c3c5d9] text-[#434656]'
              }`}
              title="Más filtros de ordenamiento"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              <span className="hidden sm:inline">Ordenar</span>
            </button>
          </div>
        </div>

        {/* Filter Drawer if open */}
        {showFilterDrawer && (
          <div className="bg-[#f1f3ff] p-4 rounded-xl mt-3 flex flex-wrap items-center justify-between gap-4 border border-[#c3c5d9]/40 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#434656]">Ordenar por:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('rating')}
                  className={`text-xs px-3 py-1 rounded-lg font-medium cursor-pointer ${
                    sortBy === 'rating' ? 'bg-[#0052ff] text-white' : 'bg-white text-[#434656]'
                  }`}
                >
                  Mayor Calificación ★
                </button>
                <button
                  onClick={() => setSortBy('reviews')}
                  className={`text-xs px-3 py-1 rounded-lg font-medium cursor-pointer ${
                    sortBy === 'reviews' ? 'bg-[#0052ff] text-white' : 'bg-white text-[#434656]'
                  }`}
                >
                  Más Reseñas
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`text-xs px-3 py-1 rounded-lg font-medium cursor-pointer ${
                    sortBy === 'name' ? 'bg-[#0052ff] text-white' : 'bg-white text-[#434656]'
                  }`}
                >
                  Nombre (A-Z)
                </button>
              </div>
            </div>

            {(selectedCategory || searchQuery || filterDomicilioOnly || filterVerifiedOnly) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                  setFilterDomicilioOnly(false);
                  setFilterVerifiedOnly(false);
                }}
                className="text-xs text-[#ba1a1a] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">clear_all</span>
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Active Filter Chips */}
        {(selectedCategory || searchQuery) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-[#737688]">Filtros activos:</span>
            {selectedCategory && (
              <span className="bg-[#0052ff]/10 text-[#0052ff] text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                Categoría: {selectedCategory}
                <button onClick={() => setSelectedCategory(null)} className="cursor-pointer hover:text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="bg-[#0052ff]/10 text-[#0052ff] text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                Búsqueda: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="cursor-pointer hover:text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      {/* Providers Grid */}
      {filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onContactWhatsApp={onContactWhatsApp}
              onViewDetails={onViewDetails}
              isFavorite={favorites.includes(provider.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#e1e8fd] max-w-lg mx-auto shadow-elevation-1">
          <div className="w-16 h-16 rounded-full bg-[#f1f3ff] text-[#0052ff] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">search_off</span>
          </div>
          <h4 className="font-geist text-lg font-bold text-[#141b2b] mb-1">
            No se encontraron proveedores
          </h4>
          <p className="text-sm text-[#434656] mb-5">
            No encontramos profesionales que coincidan con tus criterios de búsqueda en {currentCity}.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setFilterDomicilioOnly(false);
              setFilterVerifiedOnly(false);
            }}
            className="bg-[#0052ff] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#003ec7] transition-colors cursor-pointer"
          >
            Ver todos los profesionales
          </button>
        </div>
      )}
    </main>
  );
};
