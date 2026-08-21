import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  ShoppingBag,
  Wrench,
  Map,
  Grid,
  ShieldCheck,
  X
} from 'lucide-react';
import { Provider, ProductItem, Category, UserSession } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';
import { ProviderCard } from './ProviderCard';
import { ProductCard } from './ProductCard';
import { SnapMapView } from './SnapMapView';

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
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [onlyVerified, setOnlyVerified] = useState(false);

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      if (p.city.toLowerCase() !== currentCity.toLowerCase()) return false;
      if (selectedCategory !== 'todos' && p.category !== selectedCategory) return false;
      if (onlyVerified && !p.verified) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.businessName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [providers, currentCity, selectedCategory, onlyVerified, searchQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (prod.city.toLowerCase() !== currentCity.toLowerCase()) return false;
      if (selectedCategory !== 'todos' && prod.category !== selectedCategory) return false;
      if (onlyVerified && !prod.verifiedSeller) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          prod.name.toLowerCase().includes(q) ||
          prod.description.toLowerCase().includes(q) ||
          prod.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [products, currentCity, selectedCategory, onlyVerified, searchQuery]);

  return (
    <div className="pb-24 max-w-7xl mx-auto px-4 pt-4 bg-pattern">
      {/* Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 mb-6 shadow-elevation-1 relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0052ff] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-2 inline-block">
            Conexión Directa en {currentCity}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141b2b] tracking-tight mb-2 font-geist">
            Productos y Servicios Verificados
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">
            Contacta directamente por WhatsApp con proveedores verificados, compra productos locales y ubícalos en el mapa interactivo.
          </p>

          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="¿Qué producto o servicio buscas? (ej: plomería, repuestos, soporte técnico)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-3 text-sm text-[#141b2b] placeholder-slate-400 focus:outline-none focus:border-[#0052ff] shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* View Switcher (Grid vs Snap Map) */}
        <div className="mt-4 sm:mt-0 sm:absolute sm:bottom-6 sm:right-6 flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-[#0052ff] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Cuadrícula</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'map'
                ? 'bg-[#0052ff] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Snap Map</span>
          </button>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={onSelectProduct}
                    onContactWhatsApp={onContactWhatsApp}
                  />
                ))}
              </div>
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
