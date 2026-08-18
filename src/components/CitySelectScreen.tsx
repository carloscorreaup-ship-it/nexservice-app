import React, { useState } from 'react';
import { CITIES } from '../data/mockData';
import { City } from '../types';

interface CitySelectProps {
  selectedCity: string;
  onSelectCity: (cityName: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const CitySelectScreen: React.FC<CitySelectProps> = ({
  selectedCity,
  onSelectCity,
  isModal = false,
  onClose
}) => {
  const [currentCity, setCurrentCity] = useState(selectedCity || 'Pereira');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectCity(currentCity);
    if (onClose) onClose();
  };

  const content = (
    <div className="bg-white rounded-2xl shadow-elevation-1 p-6 md:p-8 border border-[#c3c5d9]/30 flex flex-col items-center text-center relative overflow-hidden w-full max-w-md">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#003ec7] via-[#0052ff] to-[#4b41e1]"></div>

      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#737688] hover:text-[#141b2b] p-1 rounded-full hover:bg-[#f1f3ff] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      )}

      {/* Header */}
      <div className="mb-6 pt-2">
        <h1 className="font-geist text-2xl md:text-3xl font-bold text-[#003ec7] mb-2 tracking-tight">
          NexService<span className="text-[#0052ff]">.app</span>
        </h1>
        <p className="text-[#434656] text-base md:text-lg">
          ¿En qué ciudad te encuentras?
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleConfirm} className="w-full space-y-4">
        {/* Custom Select Dropdown */}
        <div className="relative w-full text-left">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-[#f1f3ff] hover:bg-[#e9edff] rounded-xl px-4 py-3.5 flex items-center justify-between border-2 border-transparent focus:border-[#0052ff] focus:bg-white transition-all duration-200 cursor-pointer shadow-2xs"
          >
            <span className="flex items-center gap-2 text-[#141b2b] font-medium text-base">
              <span className="material-symbols-outlined text-[#0052ff] text-[20px]">location_on</span>
              <span>{currentCity}</span>
            </span>
            <span 
              className={`material-symbols-outlined text-[#737688] transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#0052ff]' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {/* Dropdown Options with Search */}
          {isOpen && (
            <div className="absolute z-30 mt-1.5 w-full bg-white rounded-xl shadow-elevation-hover border border-[#c3c5d9]/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-[#f1f3ff] bg-[#f9f9ff]">
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#737688] text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar ciudad o departamento..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-white border border-[#c3c5d9]/60 rounded-lg outline-none focus:border-[#0052ff]"
                    autoFocus
                  />
                </div>
              </div>
              <ul className="max-h-60 overflow-y-auto py-1">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => {
                    const isSelected = city.name.toLowerCase() === currentCity.toLowerCase();
                    return (
                      <li
                        key={city.id}
                        onClick={() => {
                          setCurrentCity(city.name);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className={`relative cursor-pointer select-none py-2.5 px-4 hover:bg-[#f1f3ff] transition-colors text-sm flex items-center justify-between ${
                          isSelected ? 'text-[#003ec7] font-semibold bg-[#e9edff]/50' : 'text-[#434656] font-normal'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#737688]">
                            location_city
                          </span>
                          <span>{city.name}</span>
                          <span className="text-xs text-[#737688] font-normal">({city.department})</span>
                        </div>

                        {isSelected && (
                          <span className="text-[#0052ff] flex items-center">
                            <span className="material-symbols-outlined text-[20px] filled">check</span>
                          </span>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li className="py-4 text-center text-xs text-[#737688]">
                    No se encontró la ciudad
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Quick popular city chips */}
        <div className="flex flex-wrap gap-1.5 justify-center pt-1">
          {CITIES.slice(0, 4).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCurrentCity(c.name)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                c.name === currentCity 
                  ? 'bg-[#0052ff]/10 border-[#0052ff] text-[#0052ff] font-semibold' 
                  : 'bg-white border-[#c3c5d9]/60 text-[#434656] hover:bg-[#f1f3ff]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#0052ff] hover:bg-[#003ec7] active:scale-[0.99] text-white font-geist font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-sm cursor-pointer"
        >
          <span>Continuar</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9ff] min-h-screen flex items-center justify-center bg-pattern-subtle p-4 font-inter text-[#141b2b]">
      {content}
    </div>
  );
};
