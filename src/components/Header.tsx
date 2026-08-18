import React, { useState } from 'react';
import { LOGO_URL } from '../data/mockData';
import { City } from '../types';

interface HeaderProps {
  currentCity: string;
  onOpenCitySelector: () => void;
  activeTab: 'explore' | 'provider' | 'bookings' | 'profile';
  setActiveTab: (tab: 'explore' | 'provider' | 'bookings' | 'profile') => void;
  isProviderMode: boolean;
  onToggleProviderMode: () => void;
  bookingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onOpenCitySelector,
  activeTab,
  setActiveTab,
  isProviderMode,
  onToggleProviderMode,
  bookingsCount
}) => {
  return (
    <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-[#e1e8fd] shadow-xs">
      <div className="flex justify-between items-center px-4 md:px-6 w-full max-w-7xl mx-auto h-16">
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <img 
            alt="NexService Logo" 
            className="w-9 h-9 object-contain rounded-md transition-transform group-hover:scale-105" 
            src={LOGO_URL} 
          />
          <span className="text-xl md:text-2xl font-bold font-geist text-[#003ec7] tracking-tight">
            NexService<span className="text-[#0052ff]">.app</span>
          </span>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* City Selector Pill */}
          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-1.5 bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] px-3.5 py-1.5 rounded-full border border-[#c3c5d9]/60 text-sm font-medium transition-all cursor-pointer shadow-xs active:scale-95"
            title="Cambiar ciudad"
          >
            <span className="material-symbols-outlined text-[#0052ff] text-[18px]">location_on</span>
            <span className="font-medium text-xs md:text-sm">{currentCity}</span>
            <span className="material-symbols-outlined text-[#737688] text-[16px]">expand_more</span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-[#e9edff] text-[#003ec7] font-semibold'
                  : 'text-[#434656] hover:bg-[#f1f3ff]'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === 'explore' ? 'filled' : ''}`}>
                search
              </span>
              Explore
            </button>

            <button
              onClick={() => setActiveTab('provider')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'provider'
                  ? 'bg-[#e9edff] text-[#003ec7] font-semibold'
                  : 'text-[#434656] hover:bg-[#f1f3ff]'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === 'provider' ? 'filled' : ''}`}>
                storefront
              </span>
              Provider
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer relative ${
                activeTab === 'bookings'
                  ? 'bg-[#e9edff] text-[#003ec7] font-semibold'
                  : 'text-[#434656] hover:bg-[#f1f3ff]'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === 'bookings' ? 'filled' : ''}`}>
                event_note
              </span>
              Bookings
              {bookingsCount > 0 && (
                <span className="bg-[#0052ff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {bookingsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#e9edff] text-[#003ec7] font-semibold'
                  : 'text-[#434656] hover:bg-[#f1f3ff]'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === 'profile' ? 'filled' : ''}`}>
                person
              </span>
              Profile
            </button>
          </nav>

          {/* Provider Mode Switch (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#c3c5d9]/40">
            <span className={`text-xs font-medium ${!isProviderMode ? 'text-[#003ec7] font-bold' : 'text-[#737688]'}`}>
              Cliente
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isProviderMode}
                onChange={onToggleProviderMode}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#dce2f7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c3c5d9] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052ff]"></div>
            </label>
            <span className={`text-xs font-medium ${isProviderMode ? 'text-[#003ec7] font-bold' : 'text-[#737688]'}`}>
              Proveedor
            </span>
          </div>

          {/* User profile avatar / button */}
          <button
            onClick={() => setActiveTab('profile')}
            className="w-9 h-9 rounded-full bg-[#e9edff] border border-[#c3c5d9] flex items-center justify-center text-[#003ec7] hover:ring-2 hover:ring-[#0052ff]/30 transition-all overflow-hidden shrink-0 cursor-pointer"
            title="Mi Perfil"
          >
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZvoz3EuYmNT3k6LuMqnW98-amCznFhnjHu2W5iezyKOp0vW4svO3COFcpNOLyspuY4k_GomBJ90ebg7jXdOejGuCplIV1OACf5DrnV1GAj38Mj-SansNHR1Q4duLoCns3SujwmakQdB_yZG7PIFy3iw2USnRAZb_NvVmtLBoZnJtcUfu1Kgq8rNeZJUE72ZgADOf7b-c_sn9yXxjVp5tjJIwcts1-TxoW6lKs3P9YFeHcgEm-U2t6" 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
