import React, { useState, useEffect } from 'react';
import { UserSession, Provider, ProductItem, BookingOrOrder, ServiceItem, UserRole } from './types';
import { INITIAL_PROVIDERS, INITIAL_PRODUCTS, INITIAL_BOOKINGS, INITIAL_USERS } from './data/initialData';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { OnboardingScreen } from './components/OnboardingScreen';
import { CitySelectScreen } from './components/CitySelectScreen';
import { ExploreView } from './components/ExploreView';
import { SnapMapView } from './components/SnapMapView';
import { ProviderModeView } from './components/ProviderModeView';
import { BookingsView } from './components/BookingsView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ProviderDetailModal } from './components/ProviderDetailModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import {
  getProvidersFromDB,
  getProductsFromDB,
  getBookingsFromDB,
  getUsersFromDB,
  saveProviderToDB,
  saveProductToDB,
  saveBookingToDB,
  updateBookingStatusInDB,
  toggleUserStatusInDB,
  saveUserToDB
} from './services/firestoreService';
import { getEmailAvatarUrl } from './utils/userUtils';

const STORAGE_KEYS = {
  SESSION: 'nexservice_session_v4',
};

export default function App() {
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const adminEmail = 'carloscorreaup@gmail.com';
    return {
      id: 'usr-admin',
      email: adminEmail,
      name: 'Carlos Correa',
      avatarUrl: getEmailAvatarUrl(adminEmail, 'Carlos Correa'),
      phone: '+57 300 123 4567',
      city: 'Pereira',
      department: 'Risaralda',
      mode: 'client',
      role: 'both',
      isOnboarded: true,
      hasChosenCity: true,
      favorites: ['p1', 'p3'],
      isVerified: true,
      isActive: true,
      isAdmin: true,
      fixedLocation: {
        address: 'Carrera 15 # 12-45, Barrio Álamos',
        neighborhood: 'Álamos',
        city: 'Pereira',
        department: 'Risaralda',
        coordinates: { lat: 4.8122, lng: -75.6934 },
        isPublicOnMap: true
      }
    };
  });

  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [bookings, setBookings] = useState<BookingOrOrder[]>(INITIAL_BOOKINGS);
  const [users, setUsers] = useState<UserSession[]>(INITIAL_USERS);

  // Navigation state & history stack for Back Button
  const [activeTab, setActiveTab] = useState<'explore' | 'map' | 'provider' | 'bookings' | 'profile' | 'admin'>('explore');
  const [tabHistory, setTabHistory] = useState<Array<'explore' | 'map' | 'provider' | 'bookings' | 'profile' | 'admin'>>(['explore']);

  const [showCityModal, setShowCityModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [selectedProviderDetail, setSelectedProviderDetail] = useState<Provider | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductItem | null>(null);
  const [whatsAppModalData, setWhatsAppModalData] = useState<{ provider: Provider; product?: ProductItem; message?: string } | null>(null);

  const isSuperAdmin = session.email.toLowerCase() === 'carloscorreaup@gmail.com';

  const navigateToTab = (newTab: 'explore' | 'map' | 'provider' | 'bookings' | 'profile' | 'admin') => {
    if (newTab !== activeTab) {
      setTabHistory(prev => [...prev, newTab]);
      setActiveTab(newTab);
    }
  };

  const handleGoBack = () => {
    if (selectedProviderDetail) {
      setSelectedProviderDetail(null);
      return;
    }
    if (selectedProductDetail) {
      setSelectedProductDetail(null);
      return;
    }
    if (whatsAppModalData) {
      setWhatsAppModalData(null);
      return;
    }
    if (showCityModal) {
      setShowCityModal(false);
      return;
    }
    if (showFirebaseModal) {
      setShowFirebaseModal(false);
      return;
    }

    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory];
      newHistory.pop(); // remove current
      const prevTab = newHistory[newHistory.length - 1];
      setTabHistory(newHistory);
      setActiveTab(prevTab);
    } else {
      setActiveTab('explore');
    }
  };

  useEffect(() => {
    async function loadData() {
      const dbProviders = await getProvidersFromDB(session.city);
      const dbProducts = await getProductsFromDB(session.city);
      const dbBookings = await getBookingsFromDB(session.email);
      const dbUsers = await getUsersFromDB();
      setProviders(dbProviders);
      setProducts(dbProducts);
      setBookings(dbBookings);
      setUsers(dbUsers);
    }
    loadData();
  }, [session.city, session.email]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }, [session]);

  const handleToggleUserStatus = async (email: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    await toggleUserStatusInDB(email, nextStatus);
    setUsers(prev =>
      prev.map(u => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, isActive: nextStatus } : u))
    );
  };

  const handleToggleProviderVerification = (providerId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setProviders(prev =>
      prev.map(p => (p.id === providerId ? { ...p, verified: nextStatus } : p))
    );
  };

  const handleCompleteOnboarding = async (data: {
    email: string;
    name: string;
    phone: string;
    role: UserRole;
    address: string;
    city: string;
    avatarUrl: string;
  }) => {
    const newSession: UserSession = {
      ...session,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      city: data.city,
      avatarUrl: data.avatarUrl,
      isOnboarded: true,
      hasChosenCity: true,
      isActive: true,
      isAdmin: data.email.toLowerCase() === 'carloscorreaup@gmail.com',
      mode: data.role === 'provider' ? 'provider' : 'client',
      fixedLocation: {
        ...session.fixedLocation,
        address: data.address,
        city: data.city
      }
    };
    setSession(newSession);
    await saveUserToDB(newSession);
    setUsers(prev => [newSession, ...prev.filter(u => u.email !== newSession.email)]);
  };

  const handleSelectCity = (cityName: string) => {
    setSession(prev => ({
      ...prev,
      city: cityName,
      hasChosenCity: true
    }));
    setShowCityModal(false);
  };

  const handleToggleProviderMode = () => {
    setSession(prev => {
      const nextMode = prev.mode === 'client' ? 'provider' : 'client';
      if (nextMode === 'provider') {
        navigateToTab('provider');
      } else {
        navigateToTab('explore');
      }
      return { ...prev, mode: nextMode };
    });
  };

  const handleToggleFavorite = (id: string) => {
    setSession(prev => {
      const exists = prev.favorites.includes(id);
      const favorites = exists ? prev.favorites.filter(item => item !== id) : [...prev.favorites, id];
      return { ...prev, favorites };
    });
  };

  const handleSaveProviderProfile = async (profileData: Partial<Provider>) => {
    const updatedProvider: Provider = {
      id: profileData.id || 'my-provider-id',
      name: profileData.name || session.name,
      businessName: profileData.businessName || 'Mi Negocio Local',
      category: profileData.category || 'reparaciones',
      offerType: profileData.offerType || 'both',
      rating: 5.0,
      reviewCount: 1,
      tags: profileData.tags || ['Verificado', session.city],
      phone: profileData.phone || session.phone,
      whatsapp: profileData.whatsapp || session.phone,
      address: profileData.address || session.fixedLocation.address,
      coordinates: session.fixedLocation.coordinates,
      city: session.city,
      department: session.department,
      isFixedLocationVisibleOnMap: true,
      verified: true,
      verifiedBadgeType: 'oficial',
      avatarUrl: profileData.avatarUrl || session.avatarUrl || getEmailAvatarUrl(session.email, session.name),
      description: profileData.description || 'Ofrecemos los mejores productos y servicios.',
      services: profileData.services || [],
      products: profileData.products || [],
      reviews: [],
      isDelivery: true
    };

    await saveProviderToDB(updatedProvider);
    setProviders(prev => {
      const idx = prev.findIndex(p => p.id === updatedProvider.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedProvider;
        return copy;
      }
      return [updatedProvider, ...prev];
    });

    setSession(prev => ({
      ...prev,
      providerProfile: profileData
    }));
  };

  const handleBookService = async (service: ServiceItem, date: string, time: string, notes: string) => {
    if (!selectedProviderDetail) return;
    const newBooking: BookingOrOrder = {
      id: `b-${Date.now()}`,
      type: 'servicio',
      providerId: selectedProviderDetail.id,
      providerName: `${selectedProviderDetail.name} (${selectedProviderDetail.businessName})`,
      providerAvatar: selectedProviderDetail.avatarUrl,
      itemName: service.name,
      category: service.category,
      date,
      time,
      status: 'pendiente',
      totalAmount: service.priceEstimate,
      notes,
      clientName: session.name,
      clientPhone: session.phone,
      clientEmail: session.email,
      clientAddress: session.fixedLocation.address,
      clientCoordinates: session.fixedLocation.coordinates,
      createdAt: new Date().toISOString().split('T')[0]
    };

    await saveBookingToDB(newBooking);
    setBookings(prev => [newBooking, ...prev]);
    setSelectedProviderDetail(null);
    navigateToTab('bookings');
  };

  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    setSession({
      email: '',
      name: '',
      phone: '',
      city: 'Pereira',
      department: 'Risaralda',
      mode: 'client',
      role: 'client',
      isOnboarded: false,
      hasChosenCity: false,
      favorites: [],
      isVerified: false,
      isActive: true,
      fixedLocation: {
        address: '',
        city: 'Pereira',
        department: 'Risaralda',
        coordinates: { lat: 4.81333, lng: -75.69611 },
        isPublicOnMap: true
      }
    });
  };

  if (!session.isOnboarded) {
    return (
      <OnboardingScreen
        defaultEmail={session.email}
        onComplete={handleCompleteOnboarding}
      />
    );
  }

  if (!session.hasChosenCity) {
    return (
      <CitySelectScreen
        selectedCity={session.city}
        onSelectCity={handleSelectCity}
      />
    );
  }

  return (
    <div className="bg-[#f9f9ff] min-h-screen text-[#141b2b] flex flex-col font-inter selection:bg-[#0052ff] selection:text-white">
      {/* Header */}
      <Header
        currentCity={session.city}
        onOpenCitySelector={() => setShowCityModal(true)}
        onOpenFirebaseConfig={() => setShowFirebaseModal(true)}
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        isProviderMode={session.mode === 'provider'}
        onToggleProviderMode={handleToggleProviderMode}
        ordersCount={bookings.filter(b => b.status === 'pendiente' || b.status === 'en_camino').length}
        userAvatarUrl={session.avatarUrl}
        isAdmin={isSuperAdmin}
        onBack={tabHistory.length > 1 ? handleGoBack : undefined}
      />

      <main className="flex-1">
        {activeTab === 'explore' && (
          <ExploreView
            currentCity={session.city}
            providers={providers}
            products={products}
            userSession={session}
            onSelectProvider={p => setSelectedProviderDetail(p)}
            onSelectProduct={prod => setSelectedProductDetail(prod)}
            onContactWhatsApp={(p, prod) => setWhatsAppModalData({ provider: p, product: prod })}
            onToggleFavorite={handleToggleFavorite}
            onOpenCitySelector={() => setShowCityModal(true)}
            favorites={session.favorites}
          />
        )}

        {activeTab === 'map' && (
          <SnapMapView
            currentCity={session.city}
            providers={providers}
            products={products}
            userSession={session}
            onSelectProvider={p => setSelectedProviderDetail(p)}
            onContactWhatsApp={p => setWhatsAppModalData({ provider: p })}
            onBack={handleGoBack}
          />
        )}

        {activeTab === 'provider' && (
          <ProviderModeView
            currentCity={session.city}
            userSession={session}
            onSaveProviderProfile={handleSaveProviderProfile}
            onSwitchToClientMode={() => {
              setSession(p => ({ ...p, mode: 'client' }));
              navigateToTab('explore');
            }}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsView
            bookings={bookings}
            onUpdateBookingStatus={(id, st) => updateBookingStatusInDB(id, st)}
            onExploreServices={() => navigateToTab('explore')}
            onOpenWhatsApp={(phone, msg) => {
              window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
            }}
            currentCity={session.city}
          />
        )}

        {activeTab === 'admin' && isSuperAdmin && (
          <AdminDashboardView
            users={users}
            providers={providers}
            products={products}
            bookings={bookings}
            onToggleUserStatus={handleToggleUserStatus}
            onToggleProviderVerification={handleToggleProviderVerification}
            onBack={handleGoBack}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            userSession={session}
            providers={providers}
            onOpenCitySelector={() => setShowCityModal(true)}
            onOpenFirebaseConfig={() => setShowFirebaseModal(true)}
            onToggleProviderMode={handleToggleProviderMode}
            onViewProvider={p => setSelectedProviderDetail(p)}
            onOpenAdminPanel={() => navigateToTab('admin')}
            onLogout={handleLogout}
            onResetData={handleResetData}
            onBack={handleGoBack}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        isProviderMode={session.mode === 'provider'}
        ordersCount={bookings.filter(b => b.status === 'pendiente' || b.status === 'en_camino').length}
        isAdmin={isSuperAdmin}
      />

      {/* MODALS */}
      {showCityModal && (
        <CitySelectScreen
          isModal={true}
          selectedCity={session.city}
          onSelectCity={handleSelectCity}
          onClose={() => setShowCityModal(false)}
        />
      )}

      {showFirebaseModal && (
        <FirebaseConfigModal
          onClose={() => setShowFirebaseModal(false)}
          onConfigSaved={() => setShowFirebaseModal(false)}
        />
      )}

      {selectedProviderDetail && (
        <ProviderDetailModal
          provider={selectedProviderDetail}
          currentCity={session.city}
          onClose={() => setSelectedProviderDetail(null)}
          onContactWhatsApp={(p, msg) => {
            setSelectedProviderDetail(null);
            setWhatsAppModalData({ provider: p, message: msg });
          }}
          onBookService={handleBookService}
          onSelectProduct={prod => setSelectedProductDetail(prod)}
        />
      )}

      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          onClose={() => setSelectedProductDetail(null)}
          onContactWhatsApp={prod => {
            const prov = providers.find(p => p.id === prod.providerId) || INITIAL_PROVIDERS[0];
            setSelectedProductDetail(null);
            setWhatsAppModalData({ provider: prov, product: prod });
          }}
          onViewProvider={providerId => {
            const prov = providers.find(p => p.id === providerId);
            if (prov) {
              setSelectedProductDetail(null);
              setSelectedProviderDetail(prov);
            }
          }}
        />
      )}

      {whatsAppModalData && (
        <WhatsAppModal
          provider={whatsAppModalData.provider}
          product={whatsAppModalData.product}
          initialMessage={whatsAppModalData.message}
          onClose={() => setWhatsAppModalData(null)}
          onSendBookingConfirmation={async (prov, msg) => {
            const order: BookingOrOrder = {
              id: `ord-wa-${Date.now()}`,
              type: whatsAppModalData.product ? 'producto' : 'consulta',
              providerId: prov.id,
              providerName: prov.name,
              providerAvatar: prov.avatarUrl,
              itemName: whatsAppModalData.product ? whatsAppModalData.product.name : 'Consulta WhatsApp',
              category: prov.category,
              date: new Date().toISOString().split('T')[0],
              time: 'Inmediata',
              status: 'pendiente',
              totalAmount: whatsAppModalData.product ? `$${whatsAppModalData.product.price.toLocaleString('es-CO')} COP` : 'Por cotizar',
              notes: msg,
              clientName: session.name,
              clientPhone: session.phone,
              clientEmail: session.email,
              clientAddress: session.fixedLocation.address,
              createdAt: new Date().toISOString().split('T')[0]
            };
            await saveBookingToDB(order);
            setBookings(prev => [order, ...prev]);
          }}
        />
      )}
    </div>
  );
}
