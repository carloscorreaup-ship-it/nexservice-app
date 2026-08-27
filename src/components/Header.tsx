import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Flame, Bell, ShieldAlert, ArrowLeft, Search, Check, ChevronDown, X, Sparkles, User } from 'lucide-react';
import { isFirebaseConnected } from '../services/firebase';
import { COLOMBIA_CITIES } from '../data/initialData';

interface HeaderProps {
  currentCity: string;
  onSelectCity?: (cityName: string) => void;
  onOpenCitySelector?: () => void;
  onOpenFirebaseConfig: () => void;
  activeTab: string;
  setActiveTab: (tab: 'explore' | 'map' | 'provider' | 'bookings' | 'profile' | 'admin') => void;
  isProviderMode: boolean;
  onToggleProviderMode: () => void;
  ordersCount: number;
  userAvatarUrl?: string;
  isAdmin?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onSelectCity,
  onOpenCitySelector,
  onOpenFirebaseConfig,
  activeTab,
  setActiveTab,
  isProviderMode,
  onToggleProviderMode,
  ordersCount,
  userAvatarUrl,
  isAdmin = false,
  onBack,
}) => {
  const showBackButton = activeTab !== 'explore' && onBack;
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalizar acentos y mayúsculas para búsqueda precisa
  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const normalizedSearch = normalize(citySearchTerm);

  // Filtrar ciudades por nombre o departamento
  const filteredCities = COLOMBIA_CITIES.filter((city) => {
    if (!normalizedSearch) return true;
    const nameMatch = normalize(city.name).includes(normalizedSearch);
    const deptMatch = normalize(city.department).includes(normalizedSearch);
    return nameMatch || deptMatch;
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    if (isCityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCityDropdownOpen]);

  const handleCityPick = (cityName: string) => {
    if (onSelectCity) {
      onSelectCity(cityName);
    } else if (onOpenCitySelector) {
      onOpenCitySelector();
    }
    setIsCityDropdownOpen(false);
    setCitySearchTerm('');
  };

  const popularCities = ['Pereira', 'Dosquebradas', 'Manizales', 'Armenia', 'Bogotá', 'Medellín', 'Cali'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-[#141b2b] shadow-xs w-full">
      {/* Nivel 1: Marca, Logo, Ciudad Desplegable, Firebase y Perfil */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 relative">
        {/* Left Side: Back Button OR Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {showBackButton ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all border border-slate-200 shrink-0 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
              <span>Atrás</span>
            </button>
          ) : (
            <div 
              onClick={() => setActiveTab('explore')}
              className="cursor-pointer flex items-center gap-2 sm:gap-2.5 select-none shrink-0"
            >
              <img 
                src="/logo.png" 
                alt="NexService.app" 
                className="h-8 sm:h-10 w-auto object-contain shrink-0" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }} 
              />
              <div className="flex flex-col justify-center min-w-0">
                <div className="font-bold text-sm sm:text-base tracking-tight text-[#141b2b] leading-tight font-geist flex items-center gap-1">
                  <span>NexService<span className="text-[#0052ff]">.app</span></span>
                </div>
                <div className="text-[8.5px] sm:text-[10px] font-serif italic text-slate-500 font-medium leading-none mt-0.5 truncate">
                  By <span className="text-[#0052ff] font-semibold">Pasiflora Biohacking Pro.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: City Dropdown Button, Firebase Status, Admin & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className={`flex items-center gap-1 text-[11px] sm:text-sm font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all border shrink-0 cursor-pointer active:scale-95 ${
                isCityDropdownOpen
                  ? 'bg-blue-50 text-[#0052ff] border-blue-300 ring-2 ring-blue-100 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Seleccionar ciudad"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0052ff] shrink-0" />
              <span className="max-w-[75px] sm:max-w-[110px] truncate font-medium">{currentCity}</span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform shrink-0 ${isCityDropdownOpen ? 'rotate-180 text-[#0052ff]' : ''}`} />
            </button>

            {/* LISTA DESPLEGABLE CON BUSCADOR INTEGRADO */}
            {isCityDropdownOpen && (
              <>
                {/* Mobile Backdrop Overlay */}
                <div 
                  className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden"
                  onClick={() => setIsCityDropdownOpen(false)}
                />

                {/* Dropdown Panel */}
                <div className="fixed inset-x-3 top-16 md:absolute md:top-full md:right-0 md:left-auto md:w-84 mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-elevation-hover z-50 p-3 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
                      <MapPin className="w-3.5 h-3.5 text-[#0052ff]" />
                      <span>Seleccionar Ciudad</span>
                    </div>
                    <button
                      onClick={() => setIsCityDropdownOpen(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search Input Box */}
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Escribe para buscar ciudad..."
                      value={citySearchTerm}
                      onChange={(e) => setCitySearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-sm text-[#141b2b] placeholder-slate-400 focus:outline-none focus:border-[#0052ff] focus:bg-white shadow-inner transition-all"
                    />
                    {citySearchTerm && (
                      <button
                        onClick={() => setCitySearchTerm('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Popular Cities Pills (when search is empty) */}
                  {!citySearchTerm && (
                    <div className="mb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Principales
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {popularCities.map((popCity) => (
                          <button
                            key={popCity}
                            onClick={() => handleCityPick(popCity)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                              popCity.toLowerCase() === currentCity.toLowerCase()
                                ? 'bg-blue-50 text-[#0052ff] border-blue-300 font-bold'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {popCity}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scrollable Cities List */}
                  <div className="overflow-y-auto max-h-56 pr-0.5 space-y-1 divide-y divide-slate-50">
                    {filteredCities.map((city) => {
                      const isSelected = city.name.toLowerCase() === currentCity.toLowerCase();
                      return (
                        <button
                          key={city.id}
                          onClick={() => handleCityPick(city.name)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/80 text-[#0052ff] font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#0052ff]' : 'text-slate-400'}`} />
                            <div className="min-w-0">
                              <div className="text-sm truncate flex items-center gap-1.5">
                                <span>{city.name}</span>
                                {city.isPopular && (
                                  <span className="text-[9px] bg-blue-100/70 text-[#0052ff] px-1.5 py-0.2 rounded-full font-medium">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">{city.department}</div>
                            </div>
                          </div>

                          {isSelected && <Check className="w-4 h-4 text-[#0052ff] shrink-0" />}
                        </button>
                      );
                    })}

                    {filteredCities.length === 0 && (
                      <div className="p-4 text-center">
                        <p className="text-sm text-slate-500 mb-2">No se encontró "{citySearchTerm}"</p>
                        <button
                          onClick={() => handleCityPick(citySearchTerm)}
                          className="text-sm font-bold text-[#0052ff] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          Usar "{citySearchTerm}" como mi ciudad
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* SUPER ADMIN BADGE */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-sm font-bold transition-all border shrink-0 cursor-pointer active:scale-95 ${
                activeTab === 'admin'
                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              }`}
              title="Panel Super Admin de Usuarios"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}

          {/* Firebase Database Status Indicator */}
          <button
            onClick={onOpenFirebaseConfig}
            className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-sm font-medium border transition-all shrink-0 cursor-pointer active:scale-95 ${
              isFirebaseConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title={isFirebaseConnected ? "Firestore Conectado" : "Configurar Firebase"}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="hidden md:inline">
              {isFirebaseConnected ? 'Conectado' : 'Config'}
            </span>
          </button>

          {/* Bookings / Orders Alert - Desktop only */}
          <button
            onClick={() => setActiveTab('bookings')}
            className="hidden md:flex relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200 shrink-0 cursor-pointer"
            title="Mis Pedidos y Citas"
          >
            <Bell className="w-4 h-4" />
            {ordersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#0052ff] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {ordersCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => setActiveTab('profile')}
            className="cursor-pointer w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-[#0052ff]/20 overflow-hidden bg-slate-100 flex items-center justify-center text-[10px] sm:text-sm font-bold text-[#0052ff] hover:ring-[#0052ff] shrink-0 active:scale-95"
            title="Mi Perfil"
          >
            {userAvatarUrl ? (
              <img
                src={userAvatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://ui-avatars.com/api/?name=Usuario&background=0052ff&color=fff&size=128&bold=true';
                }}
              />
            ) : (
              <User className="w-4 h-4 text-[#0052ff]" />
            )}
          </div>
        </div>
      </div>

      {/* Nivel 2: Selector Segmentado Cliente / Proveedor */}
      <div className="bg-slate-50/90 border-t border-slate-200/70 px-3 sm:px-4 py-1.5">
        <div className="max-w-md mx-auto">
          <div className="bg-slate-200/80 p-0.5 sm:p-1 rounded-2xl flex items-center gap-1 shadow-inner">
            {/* Opción 1: Modo Cliente */}
            <button
              onClick={() => {
                if (isProviderMode) onToggleProviderMode();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-sm font-bold transition-all cursor-pointer select-none active:scale-[0.98] ${
                !isProviderMode
                  ? 'bg-white text-[#0052ff] shadow-sm border border-slate-200/60 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <span className="material-symbols-outlined text-base sm:text-base">person</span>
              <span>Modo Cliente</span>
              {!isProviderMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052ff] animate-pulse ml-0.5" />
              )}
            </button>

            {/* Opción 2: Modo Proveedor */}
            <button
              onClick={() => {
                if (!isProviderMode) onToggleProviderMode();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-sm font-bold transition-all cursor-pointer select-none active:scale-[0.98] ${
                isProviderMode
                  ? 'bg-emerald-600 text-white shadow-sm scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <span className="material-symbols-outlined text-base sm:text-base">storefront</span>
              <span>Modo Proveedor</span>
              {isProviderMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};





