import React from 'react';

interface BottomNavBarProps {
  activeTab: 'explore' | 'provider' | 'bookings' | 'profile';
  setActiveTab: (tab: 'explore' | 'provider' | 'bookings' | 'profile') => void;
  isProviderMode: boolean;
  onToggleProviderMode: () => void;
  bookingsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  isProviderMode,
  onToggleProviderMode,
  bookingsCount
}) => {
  return (
    <>
      {/* Floating Provider Switch on Mobile */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <div className="bg-white shadow-lg rounded-full p-2 border border-[#c3c5d9]/40 flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isProviderMode}
              onChange={onToggleProviderMode}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#dce2f7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0052ff]"></div>
          </label>
          <span 
            onClick={() => setActiveTab('provider')}
            className={`material-symbols-outlined text-sm cursor-pointer ${isProviderMode ? 'text-[#0052ff] filled' : 'text-[#737688]'}`}
            title="Modo Proveedor"
          >
            storefront
          </span>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center py-2 bg-white border-t border-[#c3c5d9]/40 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pb-[max(env(safe-area-inset-bottom),8px)]">
        {/* Explore Tab */}
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all cursor-pointer ${
            activeTab === 'explore'
              ? 'bg-[#645efb] text-white scale-90 duration-150 shadow-xs'
              : 'text-[#434656] hover:text-[#003ec7]'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === 'explore' ? 'filled' : ''}`}>
            search
          </span>
          <span className="text-[12px] font-medium mt-0.5">Explore</span>
        </button>

        {/* Provider Tab */}
        <button
          onClick={() => setActiveTab('provider')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all cursor-pointer ${
            activeTab === 'provider'
              ? 'bg-[#645efb] text-white scale-90 duration-150 shadow-xs'
              : 'text-[#434656] hover:text-[#003ec7]'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === 'provider' ? 'filled' : ''}`}>
            storefront
          </span>
          <span className="text-[12px] font-medium mt-0.5">Provider</span>
        </button>

        {/* Bookings Tab */}
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all cursor-pointer relative ${
            activeTab === 'bookings'
              ? 'bg-[#645efb] text-white scale-90 duration-150 shadow-xs'
              : 'text-[#434656] hover:text-[#003ec7]'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === 'bookings' ? 'filled' : ''}`}>
            event_note
          </span>
          <span className="text-[12px] font-medium mt-0.5">Bookings</span>
          {bookingsCount > 0 && (
            <span className="absolute top-0 right-3 bg-[#bf3003] text-white text-[9px] font-bold px-1 rounded-full">
              {bookingsCount}
            </span>
          )}
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#645efb] text-white scale-90 duration-150 shadow-xs'
              : 'text-[#434656] hover:text-[#003ec7]'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === 'profile' ? 'filled' : ''}`}>
            person
          </span>
          <span className="text-[12px] font-medium mt-0.5">Profile</span>
        </button>
      </nav>
    </>
  );
};
