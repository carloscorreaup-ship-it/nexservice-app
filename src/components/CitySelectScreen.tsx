import React, { useState } from 'react';
import { Search, MapPin, Check, X, Sparkles } from 'lucide-react';
import { COLOMBIA_CITIES } from '../data/initialData';

interface CitySelectScreenProps {
  selectedCity: string;
  onSelectCity: (cityName: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const CitySelectScreen: React.FC<CitySelectScreenProps> = ({
  selectedCity,
  onSelectCity,
  onClose,
  isModal = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const normalizedSearch = normalize(searchTerm);

  const filteredCities = COLOMBIA_CITIES.filter((city) => {
    if (!normalizedSearch) return true;
    const nameMatch = normalize(city.name).includes(normalizedSearch);
    const deptMatch = normalize(city.department).includes(normalizedSearch);
    return nameMatch || deptMatch;
  });

  const popularCities = ['Pereira', 'Dosquebradas', 'Manizales', 'Armenia', 'Bogotá', 'Medellín', 'Cali'];

  return (
    <div className={isModal ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs' : 'min-h-screen bg-[#f9f9ff] bg-pattern text-[#141b2b] p-4 sm:p-6 flex flex-col justify-center max-w-xl mx-auto'}>
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 w-full max-w-md shadow-elevation-hover relative">
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 text-[#0052ff] mb-2">
          <MapPin className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Ubicación de Búsqueda</span>
        </div>

        <h2 className="text-xl font-bold text-[#141b2b] mb-1 font-geist">Selecciona tu Ciudad</h2>
        <p className="text-xs text-slate-500 mb-4">
          Conéctate con proveedores verificados y productos cerca de tu ubicación.
        </p>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Escribe para buscar ciudad (ej: Pereira, Bogotá)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-[#141b2b] placeholder-slate-400 focus:outline-none focus:border-[#0052ff] focus:bg-white shadow-inner transition-all"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Popular Quick Pills */}
        {!searchTerm && (
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Ciudades Principales
            </div>
            <div className="flex flex-wrap gap-1.5">
              {popularCities.map((popCity) => (
                <button
                  key={popCity}
                  onClick={() => onSelectCity(popCity)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    popCity.toLowerCase() === selectedCity.toLowerCase()
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

        {/* Cities List */}
        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
          {filteredCities.map((city) => {
            const isSelected = city.name.toLowerCase() === selectedCity.toLowerCase();
            return (
              <button
                key={city.id}
                onClick={() => onSelectCity(city.name)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-300 text-[#0052ff] font-bold shadow-xs'
                    : 'bg-white border-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#0052ff] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      {city.name}
                      {city.isPopular && (
                        <span className="text-[10px] bg-blue-100 text-[#0052ff] px-1.5 py-0.2 rounded-full font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{city.department}, Colombia</div>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-[#0052ff]" />}
              </button>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="text-center py-6">
              <p className="text-slate-500 text-xs mb-2">No se encontró "{searchTerm}".</p>
              <button
                onClick={() => onSelectCity(searchTerm)}
                className="text-xs font-bold text-[#0052ff] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Usar "{searchTerm}" como mi ciudad
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

