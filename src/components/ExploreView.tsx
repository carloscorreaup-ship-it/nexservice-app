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
  Truck
} from 'lucide-react';
import { formatCurrencyCOP } from '../utils/userUtils';
import { Provider, ProductItem, Category, UserSession } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';
import { ProviderCard } from './ProviderCard';
import { ProductCard } from './ProductCard';
import { SnapMapView } from './SnapMapView';
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
  favorites,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [executedSearchQuery, setExecutedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [listMode, setListMode] = useState<'grid' | 'list'>('grid');
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Análisis inteligente de palabras clave e intenciones semánticas
  const searchIntent = useMemo(() => {
    const query = executedSearchQuery || searchQuery;
    if (!query.trim()) return null;
    return detectSearchIntents(query);
  }, [executedSearchQuery, searchQuery]);

  // Filtrado y ordenamiento por relevancia semántica de Proveedores
  const filteredProviders = useMemo(() => {
    const query = executedSearchQuery || searchQuery;
    const keywords = extractKeywords(query);
    const expandedKeywords = searchIntent?.expandedKeywords || keywords;

    return providers
      .filter((p) => {
        if (p.city.toLowerCase() !== currentCity.toLowerCase()) return false;
        if (selectedCategory !== 'todos' && p.category !== selectedCategory) return false;
        if (onlyVerified && !p.verified) return false;

        if (query.trim()) {
          const score = scoreProviderMatch(p, query, keywords, expandedKeywords);
          return score > 0;
        }
        return true;
      })
      .sort((a, b) => {
        if (!query.trim()) return 0;
        const scoreA = scoreProviderMatch(a, query, keywords, expandedKeywords);
        const scoreB = scoreProviderMatch(b, query, keywords, expandedKeywords);
        return scoreB - scoreA;
      });
  }, [providers, currentCity, selectedCategory, onlyVerified, searchQuery, executedSearchQuery, searchIntent]);

  // Filtrado y ordenamiento por relevancia semántica de Productos
  const filteredProducts = useMemo(() => {
    const query = executedSearchQuery || searchQuery;
    const keywords = extractKeywords(query);
    const expandedKeywords = searchIntent?.expandedKeywords || keywords;

    return products
      .filter((prod) => {
        if (prod.city.toLowerCase() !== currentCity.toLowerCase()) return false;
        if (selectedCategory !== 'todos' && prod.category !== selectedCategory) return false;
        if (onlyVerified && !prod.verifiedSeller) return false;

        if (query.trim()) {
          const score = scoreProductMatch(prod, query, keywords, expandedKeywords);
          return score > 0;
        }
        return true;
      })
      .sort((a, b) => {
        if (!query.trim()) return 0;
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
    { label: '💅 Manicure', query: 'manicure uñas' },
    { label: '💻 Soporte PC', query: 'computador mantenimiento' },
  ];

  const totalResults = filteredProviders.length + filteredProducts.length;
  const activeSearchTerm = executedSearchQuery || searchQuery;

  return (
    <div className="pb-24 max-w-7xl mx-auto px-4 pt-4 bg-pattern">
      {/* Banner Principal */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 mb-6 shadow-elevation-1 relative overflow-hidden text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141b2b] tracking-tight mb-2 font-geist text-center">
            Productos y Servicios Verificados
          </h1>

          <div className="mb-3 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0052ff] bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 inline-flex items-center gap-1">
              Conexión Directa en {currentCity}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-5 text-center max-w-lg">
            Contacta directamente por WhatsApp con proveedores verificados, compra productos locales y ubícalos en el mapa interactivo.
          </p>

          {/* Formulario de Búsqueda Inteligente con Botón de Ejecución */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="¿Qué necesitas? ej: bañar gatos, arreglar celular, plomero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-24 sm:pr-28 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141b2b] placeholder-slate-400 focus:outline-none focus:border-[#0052ff] focus:bg-white shadow-inner transition-all"
            />

            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setExecutedSearchQuery('');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-all cursor-pointer mr-0.5"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* BOTÓN AL FINAL CON FLECHA PARA EJECUTAR LA BÚSQUEDA */}
              <button
                type="submit"
                className="bg-[#0052ff] hover:bg-blue-700 active:scale-95 text-white px-3 sm:px-4 py-2 rounded-xl flex items-center gap-1 sm:gap-1.5 font-bold text-xs shadow-sm transition-all cursor-pointer select-none"
                title="Ejecutar búsqueda"
              >
                <span>Buscar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Sugerencias de Palabras Clave Rápidas */}
          {!activeSearchTerm && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Ideas:
              </span>
              {quickKeywords.map((item) => (
                <button
                  key={item.query}
                  type="button"
                  onClick={() => handleQuickKeywordClick(item.query)}
                  className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-[#0052ff] hover:border-blue-200 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition-all cursor-pointer active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Banner de Intención y Coincidencias Detectadas */}
          {activeSearchTerm && (
            <div className="mt-3 w-full max-w-xl bg-blue-50/90 border border-blue-200/80 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-500 text-white shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#141b2b] truncate">
                    Búsqueda: <span className="text-[#0052ff]">"{activeSearchTerm}"</span>
                  </div>
                  {searchIntent?.intentLabel && (
                    <div className="text-[11px] text-blue-700 font-semibold truncate flex items-center gap-1 mt-0.5">
                      <span>{searchIntent.intentLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold bg-white text-[#0052ff] px-2.5 py-1 rounded-xl border border-blue-200 shadow-2xs">
                  {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setExecutedSearchQuery('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Restablecer
                </button>
              </div>
            </div>
          )}

          {/* Selector de Vista (Cuadrícula / Lista / Mapa) */}
          <div className="mt-4 flex items-center justify-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => { setViewMode('grid'); setListMode('grid'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid' && listMode === 'grid'
                  ? 'bg-[#0052ff] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Cuadrícula</span>
            </button>
            <button
              onClick={() => { setViewMode('grid'); setListMode('list'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid' && listMode === 'list'
                  ? 'bg-[#0052ff] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#0052ff] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Mapa</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAP VIEW */}
      {viewMode === 'map' ? (
        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-elevation-1">
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-[#0052ff] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({filteredProducts.length + filteredProviders.length})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'products'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Productos ({filteredProducts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'services'
                    ? 'bg-[#0052ff] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Servicios ({filteredProviders.length})</span>
              </button>
            </div>

            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${
                onlyVerified
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Solo Verificados</span>
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {INITIAL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap border transition-all ${
                    isSelected
                      ? 'bg-[#0052ff] border-[#0052ff] text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Products List */}
          {(activeTab === 'all' || activeTab === 'products') && filteredProducts.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#141b2b] font-geist">Productos Disponibles</h2>
                  <p className="text-xs text-slate-500">Venta y entrega directa en {currentCity}</p>
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
                    <div key={product.id} className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group">
                      <div
                        onClick={() => onSelectProduct(product)}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer"
                      >
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-bold bg-[#0052ff] text-white px-1.5 py-0.5 rounded-full uppercase">{product.condition}</span>
                          {product.deliveryAvailable && (
                            <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Truck className="w-2.5 h-2.5" /> {product.deliveryFee === 0 ? 'Gratis' : 'Domicilio'}
                            </span>
                          )}
                          {product.verifiedSeller && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <h4 onClick={() => onSelectProduct(product)} className="text-sm font-bold text-[#141b2b] hover:text-[#0052ff] cursor-pointer line-clamp-1 transition-colors">{product.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{product.description}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-sm font-extrabold text-[#0052ff]">{formatCurrencyCOP(product.price)}</span>
                          <div className="flex gap-1.5">
                            <button onClick={() => onSelectProduct(product)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold py-1.5 px-2.5 rounded-xl transition-all">Ver</button>
                            <button
                              onClick={() => {
                                const prov = providers.find((p) => p.id === product.providerId);
                                if (prov) {
                                  onContactWhatsApp(prov, product);
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-xl flex items-center gap-1 shadow-sm transition-all"
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

          {/* Services List */}
          {(activeTab === 'all' || activeTab === 'services') && filteredProviders.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0052ff]">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#141b2b] font-geist">Proveedores de Servicios</h2>
                  <p className="text-xs text-slate-500">Profesionales verificados con atención directa</p>
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
                    <div key={provider.id} className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group">
                      <div
                        onClick={() => onSelectProvider(provider)}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden ring-2 ring-blue-100 shrink-0 cursor-pointer bg-slate-100"
                      >
                        <img src={provider.avatarUrl} alt={provider.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 onClick={() => onSelectProvider(provider)} className="text-sm font-bold text-[#141b2b] hover:text-[#0052ff] cursor-pointer truncate transition-colors">{provider.name}</h4>
                          {provider.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{provider.businessName}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{provider.rating.toFixed(1)}</span>
                          <span className="text-slate-400">({provider.reviewCount})</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-0.5"><MapPin className="w-3 h-3 text-[#0052ff]" />{provider.address.length > 25 ? provider.address.slice(0, 25) + '…' : provider.address}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex gap-1">
                            {provider.services.length > 0 && (
                              <span className="text-[9px] bg-blue-50 text-[#0052ff] border border-blue-200 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5"><Wrench className="w-2.5 h-2.5" />{provider.services.length}</span>
                            )}
                            {provider.products.length > 0 && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5"><ShoppingBag className="w-2.5 h-2.5" />{provider.products.length}</span>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => onSelectProvider(provider)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold py-1.5 px-2.5 rounded-xl transition-all">Perfil</button>
                            <button onClick={() => onContactWhatsApp(provider)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-xl flex items-center gap-1 shadow-sm transition-all">
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
              <p className="text-slate-500 text-sm mb-4">
                No encontramos productos o servicios con ese filtro en {currentCity}.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('todos');
                  setOnlyVerified(false);
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#0052ff] text-white text-xs font-bold"
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
