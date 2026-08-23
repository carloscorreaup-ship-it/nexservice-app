import React from 'react';
import { Compass, Map, Store, Calendar, User, ShieldAlert } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'explore' | 'map' | 'provider' | 'bookings' | 'profile' | 'admin';
  setActiveTab: (tab: 'explore' | 'map' | 'provider' | 'bookings' | 'profile' | 'admin') => void;
  isProviderMode: boolean;
  ordersCount: number;
  isAdmin?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  isProviderMode,
  ordersCount,
  isAdmin = false,
}) => {
  const navItems = [
    { id: 'explore', label: 'Explorar', icon: Compass },
    { id: 'map', label: 'Mapa', icon: Map, highlight: true },
    { id: 'provider', label: isProviderMode ? 'Mi Negocio' : 'Ofrecer', icon: Store },
    { id: 'bookings', label: 'Pedidos', icon: Calendar, badge: ordersCount },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: ShieldAlert, adminBadge: true }] : []),
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 py-1.5 px-3 md:hidden shadow-lg">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? item.adminBadge
                    ? 'text-red-600 font-bold'
                    : 'text-[#0052ff] font-bold'
                  : item.adminBadge
                  ? 'text-red-500/80 hover:text-red-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-xl relative ${isActive ? (item.adminBadge ? 'bg-red-50' : 'bg-blue-50') : ''}`}>
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0052ff] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
