import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  ShoppingBag,
  Wrench,
  Map,
  Grid,
  List,
  ShieldCheck,
  X,
  ArrowRight,
  Sparkles,
  Tag,
  Star,
  MessageSquare,
  Truck,
  Trophy,
  Navigation,
  Clock,
  Zap,
  Award,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { formatCurrencyCOP, getCategoryName, getCategoryEmoji } from '../utils/userUtils';
import { Provider, ProductItem, Category, UserSession } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';
import { ProviderCard } from './ProviderCard';
import { ProductCard } from './ProductCard';
import { SnapMapView } from './SnapMapView';
import { calculateDistanceKm, formatDistance, DEFAULT_COLOMBIA_COORDS } from '../utils/geoUtils';
import {
  extractKeywords,
  detectSearchIntents,
  scoreProviderMatch,
  scoreProductMatch,
  normalizeText
} from '../utils/searchEngine';

interface ExploreViewProps {
  currentCity: string;
  providers: Provider[];
  products: ProductItem[];
  userSession: UserSession;
  onSelectProvider: (provider: Provider) => void;
  onSelectProduct: (product: ProductItem) => void;
  onContactWhatsApp: (provider: Provider, product?: ProductItem) => void;
  onToggleFavorite: (id: string) => void;
  onOpenCitySelector: () => void;
  favorites: string[];
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  currentCity,
  providers,
  products,
  userSession,
  onSelectProvider,
  onSelectProduct,
  onContactWhatsApp,
  onToggleFavorite,
  onOpenCitySelector,
  favorites,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'services' | 'products'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [executedSearchQuery, setExecutedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [listMode, setListMode] = useState<'grid' | 'list'>('grid');
  const [onlyVerified, setOnlyVerified] = useState(false);

  const cityCenter = DEFAULT_COLOMBIA_COORDS[currentCity] || DEFAULT_COLOMBIA_COORDS['Pereira'] || { lat: 4.81333, lng: -75.69611 };
  const userCoords = userSession.fixedLocation?.coordinates || cityCenter;

  // Análisis inteligente de palabras clave e intenciones semánticas
  const searchIntent = useMemo(() => {
    const query = executedSearchQuery || searchQuery;
    if (!query.trim()) return null;
    return detectSearchIntents(query);
  }, [executedSearchQuery, searchQuery]);

  // TOP 10 PROVEEDORES MÁS POPULARES Y BUSCADOS EN EL ÁREA DEL USUARIO
  const topPopularProvidersInArea = useMemo(() => {
    // Filtrar proveedores de la ciudad actual o en radio de proximidad
    const areaProviders = providers.filter((p) => {
      if (p.city.toLowerCase() === currentCity.toLowerCase()) return true;
      if (p.coordinates) {
        const dist = calculateDistanceKm(userCoords, p.coordinates);
        return dist <= 35; // dentro de 35 km del usuario
      }
      return false;
    });

    // Calcular score de popularidad y búsquedas
    return areaProviders
      .map((p) => {
        const distKm = p.coordinates ? calculateDistanceKm(userCoords, p.coordinates) : 8.5;
        const popScore =
          (p.rating || 4.5) * 30 +
          (p.reviewCount || 10) * 1.5 +
          (p.isFeatured ? 60 : 0) +
          (p.verified ? 35 : 0) -
          distKm * 1.2;

        return {
          ...p,
          distanceKm: distKm,
          popularityScore: popScore,
        };
      })
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 10);
  }, [providers, currentCity, userCoords]);

  // Filtrado y ordenamiento por relevancia semántica de Proveedores
  const filteredProviders = useMemo(() => {
    const query = executedSearchQuery || searchQuery;
    
    if (!query.trim()) {
      return providers
        .filter((p) => {
          if (p.city.toLowerCase() !== currentCity.toLowerCase()) return false;
          if (selectedCategory !== 'todos' && p.category !== selectedCategory) return false;
          if (onlyVerified && !p.verified) return false;
          return true;
        })
        .sort((a, b) => (b.views?.length || 0) - (a.views?.length || 0) || b.reviewCount - a.reviewCount)
        .slice(0, 10);
    }

    const keywords = extractKeywords(query);
    const expandedKeywords = searchIntent?.expandedKeywords || keywords;

    return providers
      .filter((p) => {
        if (p.city.toLowerCase() !== currentCity.toLowerCase()) return false;
        if (selectedCategory !== 'todos' && p.category !== selectedCategory) return false;
        if (onlyVerified && !p.verified) return false;

        const score = scoreProviderMatch(p, query, keywords, expandedKeywords);
        return score > 0;
      })
      .sort((a, b) => {
        const scoreA = scoreProviderMatch(a, query, keywords, expandedKeywords);
        const scoreB = scoreProviderMatch(b, query, keywords, expandedKeywords);
        return scoreB - scoreA;
      });
  }, [providers, currentCity, selectedCategory, onlyVerified, searchQuery, executedSearchQuery, searchIntent]);

  // Filtrado y ordenamiento por relevancia semántica de Productos
  const filteredProducts = useMemo(() => {
    const query = executedSearchQuery || searchQuery;

    if (!query.trim()) {
      return products
        .filter((prod) => {
          if (prod.city.toLowerCase() !== currentCity.toLowerCase()) return false;
          if (selectedCategory !== 'todos' && prod.category !== selectedCategory) return false;
          if (onlyVerified && !prod.verifiedSeller) return false;
          return true;
        })
        .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0) || b.rating - a.rating)
        .slice(0, 10);
    }

    const keywords = extractKeywords(query);
    const expandedKeywords = searchIntent?.expandedKeywords || keywords;

    return products
      .filter((prod) => {
        if (prod.city.toLowerCase() !== currentCity.toLowerCase()) return false;
        if (selectedCategory !== 'todos' && prod.category !== selectedCategory) return false;
        if (onlyVerified && !prod.verifiedSeller) return false;

        const score = scoreProductMatch(prod, query, keywords, expandedKeywords);
        return score > 0;
      })
      .sort((a, b) => {
        const scoreA = scoreProductMatch(a, query, keywords, expandedKeywords);
        const scoreB = scoreProductMatch(b, query, keywords, expandedKeywords);
        return scoreB - scoreA;
      });
  }, [products, currentCity, selectedCategory, onlyVerified, searchQuery, executedSearchQuery, searchIntent]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExecutedSearchQuery(searchQuery.trim());
  };

  const handleQuickKeywordClick = (kw: string) => {
    setSearchQuery(kw);
    setExecutedSearchQuery(kw);
  };

  const quickKeywords = [
    { label: '🐾 Bañar gatos', query: 'bañar gatos' },
    { label: '📱 Reparar celular', query: 'reparar celular' },
    { label: '🚰 Plomero', query: 'plomero fugas' },
    { label: '⚡ Electricista', query: 'electricista' },
    { label: '🔑 Cerrajería 24h', query: 'cerrajeria' },
    { label: '🦷 Odontología', query: 'odontologia' },
    { label: '💅 Spa & Belleza', query: 'spa' },
    { label: '💻 Soporte PC Gamer', query: 'computador mantenimiento' },
  ];

  return (
    <div className="pb-24 max-w-7xl mx-auto px-3 sm:px-6 pt-4">
      {/* Search Header Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-[#0052ff] rounded-3xl p-5 sm:p-7 text-white shadow-elevation-2 relative overflow-hidden text-center">
        {/* Abstract Background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-sm font-bold tracking-wide uppercase flex items-center gap-1 text-white border border-white/30">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {currentCity} • En Vivo
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-geist mb-2 text-center">
            Encuentra los Proveedores y Servicios más Populares
          </h1>
          <p className="text-base sm:text-base text-blue-100 mb-5 font-normal text-center max-w-xl">
            Contacta directamente por WhatsApp con los proveedores más buscados en tu área, cotiza servicios y ubícalos en el mapa satelital.
          </p>

          {/* Search Bar with Semantic Support */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="¿Qué servicio o producto buscas? (ej: plomero, bañar gatos, PC gamer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-[#141b2b] placeholder-slate-400 pl-12 pr-28 py-3.5 rounded-2xl text-base font-medium focus:outline-none focus:ring-4 focus:ring-blue-400/50 shadow-lg transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setExecutedSearchQuery('');
                }}
                className="absolute right-24 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 bg-[#0052ff] hover:bg-blue-600 text-white text-base font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Buscar
            </button>
          </form>

          {/* Quick Keywords Chips */}
          <div className="flex items-center justify-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar text-base w-full flex-wrap sm:flex-nowrap">
            <span className="text-sm text-blue-200 font-semibold shrink-0">Popular:</span>
            {quickKeywords.map((item) => (
              <button
                key={item.label}
                onClick={() => handleQuickKeywordClick(item.query)}
                className="bg-white/15 hover:bg-white/30 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer border border-white/20"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Semantic Search Intent Notification */}
      {searchIntent && searchIntent.intentLabel && (
        <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#0052ff] text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#0052ff] flex items-center gap-1">
                <span>Búsqueda Inteligente en {currentCity}:</span>
                <span className="text-slate-800 font-bold">{searchIntent.intentLabel}</span>
              </div>
              <p className="text-[11px] text-slate-600 truncate">
                Mostrando proveedores y productos relacionados con "{executedSearchQuery || searchQuery}"
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setExecutedSearchQuery('');
            }}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 shrink-0 p-1 rounded-lg hover:bg-white/60 transition-all cursor-pointer"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Categories Horizontal Carousel */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-[#141b2b] uppercase tracking-wider font-geist flex items-center gap-1.5">
            <span>Categorías de Proveedores</span>
          </h3>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#0052ff] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vista en Cuadrícula"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#0052ff] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vista en Mapa Satelital"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mapa</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {INITIAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl border text-sm font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0052ff] text-white border-[#0052ff] shadow-md shadow-blue-500/20 scale-102'
                    : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAP VIEW */}
      {viewMode === 'map' ? (
        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-elevation-1 mb-8">
          <SnapMapView
            currentCity={currentCity}
            providers={filteredProviders}
            products={filteredProducts}
            userSession={userSession}
            onSelectProvider={onSelectProvider}
            onContactWhatsApp={onContactWhatsApp}
            onBack={() => setViewMode('grid')}
          />
        </div>
      ) : (
        <>
          {/* Main Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#0052ff] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({filteredProviders.length})
              </button>
              <button
                onClick={() => setActiveTab('popular')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'popular'
                    ? 'bg-[#0052ff] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Más Populares ({topPopularProvidersInArea.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-[#0052ff] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Servicios</span>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Productos ({filteredProducts.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOnlyVerified(!onlyVerified)}
                className={`text-sm font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
                  onlyVerified
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Solo Verificados</span>
              </button>

              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setListMode('grid')}
                  className={`p-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                    listMode === 'grid' ? 'bg-slate-100 text-[#0052ff]' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Ver en Cuadrícula"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setListMode('list')}
                  className={`p-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                    listMode === 'list' ? 'bg-slate-100 text-[#0052ff]' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Ver en Lista"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECCIÓN: TOP 10 PROVEEDORES MÁS POPULARES EN TU ÁREA */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'popular') && topPopularProvidersInArea.length > 0 && !searchQuery && (
            <div className="mb-10 bg-gradient-to-b from-blue-50/40 via-white to-white border border-blue-100 rounded-3xl p-4 sm:p-6 shadow-elevation-1">
              <div className="flex flex-col items-center justify-center text-center mb-6 gap-2">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#141b2b] font-geist tracking-tight text-center">
                    Proveedores Más Populares
                  </h2>
                  <span className="text-[10px] font-black bg-[#0052ff] text-white px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                    Top 10 en tu área
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto text-center">
                  Los 10 proveedores y comercios más buscados y mejor calificados cerca de ti en <strong className="text-slate-800">{currentCity}</strong>
                </p>

                <div className="inline-flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-2xl shadow-xs mt-1">
                  <Navigation className="w-3.5 h-3.5 text-[#0052ff]" />
                  <span>Calculado según tu ubicación GPS</span>
                </div>
              </div>

              {/* Grid / List of Top 10 Popular Providers */}
              <div className={listMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'flex flex-col gap-3.5'}>
                {topPopularProvidersInArea.map((prov, index) => {
                  const rankNumber = index + 1;
                  const isTop1 = rankNumber === 1;
                  const isTop2 = rankNumber === 2;
                  const isTop3 = rankNumber === 3;

                  return (
                    <div
                      key={prov.id}
                      className={`bg-white border rounded-3xl p-4 shadow-sm hover:shadow-elevation-hover transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${
                        isTop1
                          ? 'border-amber-300 ring-2 ring-amber-400/20'
                          : isTop2
                          ? 'border-slate-300'
                          : isTop3
                          ? 'border-amber-700/30'
                          : 'border-slate-200/90'
                      }`}
                    >
                      {/* Top Rank Badge & Distance */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                              isTop1
                                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black'
                                : isTop2
                                ? 'bg-slate-200 text-slate-800 font-bold'
                                : isTop3
                                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                                : 'bg-slate-100 text-slate-700 font-bold'
                            }`}
                          >
                            {isTop1 ? '👑 #1 Más Buscado' : isTop2 ? '🥈 #2 Popular' : isTop3 ? '🥉 #3 Destacado' : `#${rankNumber} Popular`}
                          </span>

                          {prov.isFeatured && (
                            <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-[#0052ff] text-[9px] font-extrabold rounded-md flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> PRO
                            </span>
                          )}
                        </div>

                        {/* Distance from user */}
                        <span className="text-[11px] font-bold text-[#0052ff] bg-blue-50 px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-[#0052ff]" />
                          <span>{formatDistance(prov.distanceKm)}</span>
                        </span>
                      </div>

                      {/* Provider Details */}
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          onClick={() => onSelectProvider(prov)}
                          className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-[#0052ff]/20 bg-slate-100 shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                        >
                          <img src={prov.avatarUrl} alt={prov.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {prov.verified && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                              <ShieldCheck className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => onSelectProvider(prov)}
                            className="text-base font-bold text-[#141b2b] hover:text-[#0052ff] cursor-pointer truncate transition-colors leading-snug"
                          >
                            {prov.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate">{prov.businessName}</p>

                          <div className="flex items-center gap-2 mt-1 text-sm">
                            <span className="font-extrabold text-amber-500 flex items-center gap-0.5">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {prov.rating.toFixed(1)}
                            </span>
                            <span className="text-slate-400 text-[11px]">({prov.reviewCount} reseñas)</span>
                            {prov.serviceModality === 'physical_store' ? (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-[10px] font-bold text-[#0052ff] bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md">
                                  🏢 Local Físico
                                </span>
                              </>
                            ) : prov.serviceModality === 'mobile_street' ? (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md">
                                  🚐 Ambulante
                                </span>
                              </>
                            ) : prov.serviceModality === 'home_delivery' ? (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                                  🛵 Domicilio
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Tipo de Producto / Categoría General */}
                      <div className="mb-2.5 flex items-center">
                        <span className="text-sm font-bold text-[#0052ff] bg-blue-50/90 border border-blue-200/90 px-2.5 py-0.5 rounded-xl flex items-center gap-1">
                          <span>{getCategoryEmoji(prov.category)}</span>
                          <span>{getCategoryName(prov.category)}</span>
                        </span>
                      </div>

                      {/* Description or Services Preview */}
                      <p className="text-base text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                        {prov.description || 'Proveedor verificado con atención directa e inmediata por WhatsApp.'}
                      </p>

                      {/* Quick Service / Product Tags */}
                      {prov.services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3.5">
                          {prov.services.slice(0, 2).map((srv) => (
                            <span
                              key={srv.id}
                              className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg truncate max-w-[200px]"
                            >
                              ✓ {srv.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => onSelectProvider(prov)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold py-2.5 px-3 rounded-2xl transition-all cursor-pointer text-center"
                        >
                          Ver Perfil
                        </button>
                        <button
                          onClick={() => onContactWhatsApp(prov)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-98 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* LISTA COMPLETA DE PROVEEDORES Y SERVICIOS */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'services') && filteredProviders.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0052ff]">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#141b2b] font-geist">
                    Todos los Proveedores Verificados en {currentCity}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Profesionales locales disponibles para cotización y contratación directa
                  </p>
                </div>
              </div>

              {listMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProviders.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      onViewDetails={onSelectProvider}
                      onContactWhatsApp={onContactWhatsApp}
                      isFavorite={favorites.includes(provider.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
                    >
                      <div
                        onClick={() => onSelectProvider(provider)}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden ring-2 ring-blue-100 shrink-0 cursor-pointer bg-slate-100"
                      >
                        <img src={provider.avatarUrl} alt={provider.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4
                            onClick={() => onSelectProvider(provider)}
                            className="text-base font-bold text-[#141b2b] hover:text-[#0052ff] cursor-pointer truncate transition-colors"
                          >
                            {provider.name}
                          </h4>
                          {provider.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                        <p className="text-sm text-slate-500 truncate">{provider.businessName}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-base">
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {provider.rating.toFixed(1)}
                          </span>
                          <span className="text-slate-400">({provider.reviewCount})</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-sm text-slate-500 flex items-center gap-0.5 truncate">
                            <MapPin className="w-3 h-3 text-[#0052ff]" />
                            {provider.address}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex gap-1">
                            {provider.services.length > 0 && (
                              <span className="text-[11px] bg-blue-50 text-[#0052ff] border border-blue-200 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                                <Wrench className="w-2.5 h-2.5" />
                                {provider.services.length}
                              </span>
                            )}
                            {provider.products.length > 0 && (
                              <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                                <ShoppingBag className="w-2.5 h-2.5" />
                                {provider.products.length}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onSelectProvider(provider)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-1.5 px-2.5 rounded-xl transition-all cursor-pointer"
                            >
                              Perfil
                            </button>
                            <button
                              onClick={() => onContactWhatsApp(provider)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-1.5 px-2.5 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECCIÓN DE PRODUCTOS DISPONIBLES (SI SE SELECCIONA LA PESTAÑA) */}
          {/* ======================================================== */}
          {activeTab === 'products' && filteredProducts.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#141b2b] font-geist">Productos Disponibles</h2>
                  <p className="text-sm text-slate-500">Venta y entrega directa en {currentCity}</p>
                </div>
              </div>

              {listMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={onSelectProduct}
                      onContactWhatsApp={(prod) => {
                        const prov = providers.find((p) => p.id === prod.providerId);
                        if (prov) {
                          onContactWhatsApp(prov, prod);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
                    >
                      <div
                        onClick={() => onSelectProduct(product)}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-bold bg-[#0052ff] text-white px-1.5 py-0.5 rounded-full uppercase">
                            {product.condition}
                          </span>
                          {product.deliveryAvailable && (
                            <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Truck className="w-2.5 h-2.5" /> {product.deliveryFee === 0 ? 'Gratis' : 'Domicilio'}
                            </span>
                          )}
                          {product.verifiedSeller && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <h4
                          onClick={() => onSelectProduct(product)}
                          className="text-base font-bold text-[#141b2b] hover:text-[#0052ff] cursor-pointer line-clamp-1 transition-colors"
                        >
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{product.description}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-base font-extrabold text-[#0052ff]">{formatCurrencyCOP(product.price)}</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onSelectProduct(product)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold py-1.5 px-2.5 rounded-xl transition-all cursor-pointer"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => {
                                const prov = providers.find((p) => p.id === product.providerId);
                                if (prov) {
                                  onContactWhatsApp(prov, product);
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {filteredProducts.length === 0 && filteredProviders.length === 0 && (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
              <p className="text-slate-500 text-base mb-4">
                No encontramos proveedores o servicios con ese filtro en {currentCity}.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setExecutedSearchQuery('');
                  setSelectedCategory('todos');
                  setOnlyVerified(false);
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#0052ff] text-white text-sm font-bold cursor-pointer"
              >
                Restablecer Filtros
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

