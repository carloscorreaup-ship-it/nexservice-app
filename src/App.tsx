import React, { useState, useEffect } from 'react';
import { UserSession, Provider, Booking, ServiceItem } from './types';
import { INITIAL_PROVIDERS, INITIAL_BOOKINGS } from './data/mockData';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { OnboardingScreen } from './components/OnboardingScreen';
import { CitySelectScreen } from './components/CitySelectScreen';
import { ExploreView } from './components/ExploreView';
import { ProviderModeView } from './components/ProviderModeView';
import { BookingsView } from './components/BookingsView';
import { ProfileView } from './components/ProfileView';
import { ProviderDetailModal } from './components/ProviderDetailModal';
import { WhatsAppModal } from './components/WhatsAppModal';

const STORAGE_KEYS = {
  SESSION: 'nexservice_session_v1',
  PROVIDERS: 'nexservice_providers_v1',
  BOOKINGS: 'nexservice_bookings_v1',
};

export default function App() {
  // Load session from storage or start clean
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      email: '',
      name: 'Carlos Correa',
      phone: '+57 300 123 4567',
      city: 'Pereira',
      mode: 'client',
      isOnboarded: false,
      hasChosenCity: false,
      favorites: ['p1', 'p3'],
    };
  });

  // Providers state
  const [providers, setProviders] = useState<Provider[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROVIDERS;
  });

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BOOKINGS;
  });

  // UI Navigation states
  const [activeTab, setActiveTab] = useState<'explore' | 'provider' | 'bookings' | 'profile'>('explore');
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedProviderDetail, setSelectedProviderDetail] = useState<Provider | null>(null);
  const [whatsAppModalData, setWhatsAppModalData] = useState<{ provider: Provider; message?: string } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  // Handle Onboarding / Auth Completion (Step 1)
  const handleCompleteOnboarding = (data: { email: string; name?: string; avatarUrl?: string; mode?: 'client' | 'provider' } | string) => {
    const email = typeof data === 'string' ? data : data.email;
    const customName = typeof data === 'object' ? data.name : undefined;
    const customAvatar = typeof data === 'object' ? data.avatarUrl : undefined;
    const customMode = typeof data === 'object' ? data.mode : undefined;

    const isSpecialProvider = email.toLowerCase().includes('plomero') || email.toLowerCase().includes('proveedor');
    
    setSession((prev) => ({
      ...prev,
      email,
      name: customName?.trim() || prev.name || 'Usuario NexService',
      avatarUrl: customAvatar || prev.avatarUrl,
      isOnboarded: true,
      mode: customMode || (isSpecialProvider ? 'provider' : 'client')
    }));
  };

  // Handle City Selection (Step 2 or Modal)
  const handleSelectCity = (cityName: string) => {
    setSession((prev) => ({
      ...prev,
      city: cityName,
      hasChosenCity: true
    }));
    setShowCityModal(false);
  };

  // Mode Toggle (Client <-> Provider)
  const handleToggleProviderMode = () => {
    setSession((prev) => {
      const newMode = prev.mode === 'client' ? 'provider' : 'client';
      if (newMode === 'provider') {
        setActiveTab('provider');
      } else {
        setActiveTab('explore');
      }
      return {
        ...prev,
        mode: newMode
      };
    });
  };

  // Add / Toggle Favorite Provider
  const handleToggleFavorite = (providerId: string) => {
    setSession((prev) => {
      const exists = prev.favorites.includes(providerId);
      const favorites = exists
        ? prev.favorites.filter((id) => id !== providerId)
        : [...prev.favorites, providerId];
      return { ...prev, favorites };
    });
  };

  // Handle Saving / Publishing New Provider Profile
  const handleSaveProviderProfile = (profileData: Partial<Provider>) => {
    const existingIndex = providers.findIndex((p) => p.id === 'my-provider-id' || p.businessName === profileData.businessName);
    
    if (existingIndex >= 0) {
      const updated = [...providers];
      updated[existingIndex] = { ...updated[existingIndex], ...profileData } as Provider;
      setProviders(updated);
    } else {
      const newProvider: Provider = {
        id: `p-custom-${Date.now()}`,
        name: profileData.name || 'Mi Negocio',
        businessName: profileData.businessName || 'Servicio Profesional',
        category: profileData.category || 'Reparaciones',
        rating: 5.0,
        reviewCount: 1,
        tags: profileData.tags || ['Profesional', 'Pereira'],
        phone: profileData.phone || '+57 300 000 0000',
        whatsapp: profileData.whatsapp || '573000000000',
        address: profileData.address || `${session.city}, Colombia`,
        website: profileData.website,
        social: profileData.social,
        verified: true,
        avatarUrl: profileData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces&q=80',
        description: profileData.description || 'Servicios profesionales de alta calidad.',
        city: session.city,
        services: profileData.services || [],
        reviews: [
          {
            id: `r-init-${Date.now()}`,
            author: 'NexService Auditoría',
            rating: 5,
            date: 'Hoy',
            comment: 'Perfil verificado y aprobado para operar en la red NexService.',
            verifiedBooking: true
          }
        ],
        isDelivery: profileData.isDelivery ?? true,
        isFeatured: true,
        yearsOfExperience: 5,
        responseTime: '< 15 mins'
      };
      setProviders([newProvider, ...providers]);
    }

    setSession((prev) => ({
      ...prev,
      providerProfile: profileData
    }));
  };

  // Direct WhatsApp contact handler
  const handleContactWhatsApp = (provider: Provider, customMessage?: string) => {
    setWhatsAppModalData({ provider, message: customMessage });
  };

  // Book a service from provider details
  const handleBookService = (service: ServiceItem, date: string, time: string, notes: string) => {
    if (!selectedProviderDetail) return;

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      providerId: selectedProviderDetail.id,
      providerName: `${selectedProviderDetail.name} (${selectedProviderDetail.businessName})`,
      providerAvatar: selectedProviderDetail.avatarUrl,
      serviceName: service.name,
      category: selectedProviderDetail.category,
      date,
      time,
      status: 'pendiente',
      priceEstimate: service.priceEstimate,
      notes,
      clientName: session.name,
      clientPhone: session.phone,
      clientEmail: session.email,
      address: `Pereira, Risaralda`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setBookings([newBooking, ...bookings]);
    setSelectedProviderDetail(null);
    setActiveTab('bookings');
  };

  // Update status of a booking
  const handleUpdateBookingStatus = (id: string, newStatus: Booking['status']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  // Reset demo dataset
  const handleResetData = () => {
    setProviders(INITIAL_PROVIDERS);
    setBookings(INITIAL_BOOKINGS);
    setSession({
      email: 'carloscorreaup@gmail.com',
      name: 'Carlos Correa',
      phone: '+57 300 123 4567',
      city: 'Pereira',
      mode: 'client',
      isOnboarded: true,
      hasChosenCity: true,
      favorites: ['p1', 'p3'],
    });
    alert('Datos restablecidos correctamente a la configuración inicial.');
  };

  // Logout
  const handleLogout = () => {
    setSession((prev) => ({
      ...prev,
      isOnboarded: false,
      hasChosenCity: false
    }));
  };

  // 1. First Screen: Onboarding if not completed
  if (!session.isOnboarded) {
    return (
      <OnboardingScreen
        defaultEmail={session.email || 'carloscorreaup@gmail.com'}
        onComplete={handleCompleteOnboarding}
      />
    );
  }

  // 2. Second Screen: City Selection if not yet chosen
  if (!session.hasChosenCity) {
    return (
      <CitySelectScreen
        selectedCity={session.city}
        onSelectCity={handleSelectCity}
      />
    );
  }

  // 3. Main App Canvas
  return (
    <div className="bg-[#f9f9ff] min-h-screen text-[#141b2b] flex flex-col font-inter selection:bg-[#0052ff] selection:text-white">
      {/* Top App Bar */}
      <Header
        currentCity={session.city}
        onOpenCitySelector={() => setShowCityModal(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'provider' && session.mode !== 'provider') {
            setSession((p) => ({ ...p, mode: 'provider' }));
          }
        }}
        isProviderMode={session.mode === 'provider'}
        onToggleProviderMode={handleToggleProviderMode}
        bookingsCount={bookings.filter((b) => b.status === 'pendiente').length}
        userAvatarUrl={session.avatarUrl}
      />

      {/* Main Views Container */}
      <div className="flex-grow">
        {activeTab === 'explore' && (
          <ExploreView
            currentCity={session.city}
            providers={providers}
            onSwitchToProviderMode={() => {
              setSession((p) => ({ ...p, mode: 'provider' }));
              setActiveTab('provider');
            }}
            onContactWhatsApp={handleContactWhatsApp}
            onViewDetails={(p) => setSelectedProviderDetail(p)}
            favorites={session.favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'provider' && (
          <ProviderModeView
            currentCity={session.city}
            existingProfile={session.providerProfile}
            onSaveProviderProfile={handleSaveProviderProfile}
            onSwitchToClientMode={() => {
              setSession((p) => ({ ...p, mode: 'client' }));
              setActiveTab('explore');
            }}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsView
            bookings={bookings}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onExploreServices={() => setActiveTab('explore')}
            onOpenWhatsApp={(phone, text) => {
              window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
            }}
            currentCity={session.city}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            userSession={session}
            providers={providers}
            onOpenCitySelector={() => setShowCityModal(true)}
            onToggleProviderMode={handleToggleProviderMode}
            onViewProvider={(p) => setSelectedProviderDetail(p)}
            onLogout={handleLogout}
            onResetData={handleResetData}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'provider' && session.mode !== 'provider') {
            setSession((p) => ({ ...p, mode: 'provider' }));
          }
        }}
        isProviderMode={session.mode === 'provider'}
        onToggleProviderMode={handleToggleProviderMode}
        bookingsCount={bookings.filter((b) => b.status === 'pendiente').length}
      />

      {/* City Switcher Modal */}
      {showCityModal && (
        <CitySelectScreen
          isModal={true}
          selectedCity={session.city}
          onSelectCity={handleSelectCity}
          onClose={() => setShowCityModal(false)}
        />
      )}

      {/* Provider Details Modal */}
      {selectedProviderDetail && (
        <ProviderDetailModal
          provider={selectedProviderDetail}
          onClose={() => setSelectedProviderDetail(null)}
          onBookService={handleBookService}
          onContactWhatsApp={(p, msg) => {
            setSelectedProviderDetail(null);
            setWhatsAppModalData({ provider: p, message: msg });
          }}
          currentCity={session.city}
        />
      )}

      {/* WhatsApp Action Modal */}
      {whatsAppModalData && (
        <WhatsAppModal
          provider={whatsAppModalData.provider}
          initialMessage={whatsAppModalData.message}
          onClose={() => setWhatsAppModalData(null)}
          onSendBookingConfirmation={(p, msg) => {
            // Register an inquiry in bookings
            const newBooking: Booking = {
              id: `b-wa-${Date.now()}`,
              providerId: p.id,
              providerName: `${p.name} (${p.businessName})`,
              providerAvatar: p.avatarUrl,
              serviceName: 'Consulta / Cotización vía WhatsApp',
              category: p.category,
              date: new Date().toISOString().split('T')[0],
              time: 'Inmediata',
              status: 'pendiente',
              notes: msg,
              clientName: session.name,
              clientPhone: session.phone,
              clientEmail: session.email,
              createdAt: new Date().toISOString().split('T')[0]
            };
            setBookings([newBooking, ...bookings]);
            setWhatsAppModalData(null);
          }}
        />
      )}
    </div>
  );
}
