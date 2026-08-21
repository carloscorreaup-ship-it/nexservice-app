import React, { useState } from 'react';
import { Search, MapPin, Check, X, Sparkles } from 'lucide-react';
import { COLOMBIA_CITIES } from '../data/initialData';
import { City } from '../types';

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

  const filteredCities = COLOMBIA_CITIES.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={isModal ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm' : 'min-h-screen bg-[#0f172a] text-white p-6 flex flex-col justify-center max-w-xl mx-auto'}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2.5 text-blue-400 mb-2">
          <MapPin className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Ubicación de Búsqueda</span>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Selecciona tu Ciudad</h2>
        <p className="text-xs text-slate-400 mb-4">
          Conéctate con proveedores verificados y productos cerca de tu ubicación.
        </p>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ciudad o departamento (ej: Pereira, Risaralda)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            autoFocus
          />
        </div>

        {/* Cities List */}
        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
          {filteredCities.map((city) => {
            const isSelected = city.name.toLowerCase() === selectedCity.toLowerCase();
            return (
              <button
                key={city.id}
                onClick={() => onSelectCity(city.name)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700/60 text-slate-300'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      {city.name}
                      {city.isPopular && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded-full border border-blue-500/30">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{city.department}, Colombia</div>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-blue-400" />}
              </button>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No se encontraron ciudades con ese nombre.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
