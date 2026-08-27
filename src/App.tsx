import React, { useState, useEffect } from 'react';
import { UserSession, Provider, ProductItem, BookingOrOrder, ServiceItem, UserRole, Coordinates, ServiceModality, UserReport, ReportResolutionType } from './types';
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
import { ReportModal } from './components/ReportModal';
import { RatingReviewModal } from './components/RatingReviewModal';
import { AuthScreen } from './components/AuthScreen';
import { SplashScreen } from './components/SplashScreen';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { auth, isFirebaseConnected } from './services/firebase';
import { AlertTriangle, ShieldAlert, Scale, Clock, CheckCircle2 } from 'lucide-react';
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
  deleteUserInDB,
  saveUserToDB,
  getUserByEmail,
  getReportsFromDB,
  saveReportToDB,
  resolveReportInDB,
  addReviewToTargetInDB
} from './services/firestoreService';
import { getEmailAvatarUrl, getReliableAvatarUrl } from './utils/userUtils';
import { requestUserCoordinates, reverseGeocodeAddress, geocodeAddress, findNearestCity, DEFAULT_COLOMBIA_COORDS, calculateDistanceKm } from './utils/geoUtils';

const STORAGE_KEYS = {
  SESSION: 'nexservice_session_v4',
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
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
    };
  });

  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [bookings, setBookings] = useState<BookingOrOrder[]>(INITIAL_BOOKINGS);
  const [users, setUsers] = useState<UserSession[]>(INITIAL_USERS);
  const [reports, setReports] = useState<UserReport[]>([]);

  // Navigation state & history stack for Back Button
  const [activeTab, setActiveTab] = useState<'explore' | 'map' | 'provider' | 'bookings' | 'profile' | 'admin'>('explore');
  const [tabHistory, setTabHistory] = useState<Array<'explore' | 'map' | 'provider' | 'bookings' | 'profile' | 'admin'>>(['explore']);

  const [showCityModal, setShowCityModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [selectedProviderDetail, setSelectedProviderDetail] = useState<Provider | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductItem | null>(null);
  const [whatsAppModalData, setWhatsAppModalData] = useState<{ provider: Provider; product?: ProductItem; message?: string } | null>(null);
  const [reportModalData, setReportModalData] = useState<{ id: string; name: string; email: string; avatarUrl?: string; type: 'provider' | 'client' } | null>(null);
  const [ratingModalTarget, setRatingModalTarget] = useState<{
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    type: 'provider' | 'client' | 'product';
    currentRating?: number;
    reviewCount?: number;
    itemName?: string;
  } | null>(null);
  const [adminEditingProviderId, setAdminEditingProviderId] = useState<string | null>(null);

  const isSuperAdmin = session.email.toLowerCase() === 'carloscorreaup@gmail.com';

  const navigateToTab = (newTab: 'explore' | 'map' | 'provider' | 'bookings' | 'profile' | 'admin') => {
    if (newTab !== activeTab) {
      if (newTab !== 'provider') {
        setAdminEditingProviderId(null);
      }
      setTabHistory(prev => [...prev, newTab]);
      setActiveTab(newTab);
    }
  };

  const handleEditProvider = (providerId: string) => {
    setAdminEditingProviderId(providerId);
    setSelectedProviderDetail(null);
    navigateToTab('provider');
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
    if (isFirebaseConnected && auth) {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser && firebaseUser.email) {
          const googlePhoto = firebaseUser.photoURL ? firebaseUser.photoURL.replace(/=s\d+(-c)?$/, '=s400-c') : '';
          const reliableAvatar = getReliableAvatarUrl(googlePhoto, firebaseUser.email, firebaseUser.displayName || '');

          if (!session.email || session.email.toLowerCase() !== firebaseUser.email.toLowerCase()) {
            const dbUser = await getUserByEmail(firebaseUser.email);
            if (dbUser && dbUser.isOnboarded) {
              const finalAvatar = (googlePhoto && (!dbUser.avatarUrl || dbUser.avatarUrl.includes('ui-avatars.com')))
                ? googlePhoto
                : (dbUser.avatarUrl || reliableAvatar);
              
              const updated = {
                ...dbUser,
                avatarUrl: finalAvatar,
                name: dbUser.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Usuario'),
              };
              setSession(updated);
              if (finalAvatar !== dbUser.avatarUrl) {
                saveUserToDB(updated);
              }
            } else {
              setSession(prev => ({
                ...prev,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || prev.name || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Usuario'),
                avatarUrl: reliableAvatar,
                isOnboarded: false
              }));
            }
          }
        }
      });
      return () => unsubscribe();
    }
  }, [isFirebaseConnected]);

  useEffect(() => {
    async function loadData() {
      const dbProviders = await getProvidersFromDB(session.city);
      const dbProducts = await getProductsFromDB(session.city);
      const dbBookings = await getBookingsFromDB(session.email);
      const dbUsers = await getUsersFromDB();
      const dbReports = await getReportsFromDB();
      setProviders(dbProviders);
      setProducts(dbProducts);
      setBookings(dbBookings);
      setUsers(dbUsers);
      setReports(dbReports);
    }
    loadData();
  }, [session.city, session.email]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }, [session]);

  // Request GPS coordinate sync on mount or auth if permitted
  useEffect(() => {
    if (session.email && session.isOnboarded) {
      requestUserCoordinates({ timeout: 6000 }).then(async (coords) => {
        if (coords) {
          setSession((prev) => {
            const currentCoords = prev.fixedLocation?.coordinates;
            // If previous coords were missing or moved by more than 100m, update with precise GPS
            if (!currentCoords || calculateDistanceKm(currentCoords, coords) > 0.1) {
              const updated: UserSession = {
                ...prev,
                fixedLocation: {
                  ...prev.fixedLocation,
                  coordinates: coords,
                },
              };
              saveUserToDB(updated);
              return updated;
            }
            return prev;
          });
        }
      });
    }
  }, [session.email, session.isOnboarded]);

  const handleToggleUserStatus = async (email: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    await toggleUserStatusInDB(email, nextStatus);
    setUsers(prev =>
      prev.map(u => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, isActive: nextStatus } : u))
    );
  };

  const handleDeleteUser = async (email: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario ${email}?`)) {
      await deleteUserInDB(email);
      setUsers(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
    }
  };

  const handleUpdateUserAvatar = async (newAvatarUrl: string) => {
    setSession(prev => {
      const updated: UserSession = {
        ...prev,
        avatarUrl: newAvatarUrl,
      };
      saveUserToDB(updated);
      return updated;
    });

    // Update in providers list & database if this user is a provider
    setProviders(prev => prev.map(p => {
      if (p.email?.toLowerCase() === session.email.toLowerCase() || p.id === session.id) {
        const updatedP = { ...p, avatarUrl: newAvatarUrl };
        saveProviderToDB(updatedP);
        return updatedP;
      }
      return p;
    }));

    setUsers(prev => prev.map(u => u.email.toLowerCase() === session.email.toLowerCase() ? { ...u, avatarUrl: newAvatarUrl } : u));
  };

  const handleToggleProviderVerification = (providerId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setProviders(prev =>
      prev.map(p => (p.id === providerId ? { ...p, verified: nextStatus } : p))
    );
  };

  const handleSubmitReport = async (newReport: UserReport) => {
    await saveReportToDB(newReport);
    setReports(prev => [newReport, ...prev]);
  };

  const handleResolveReport = async (
    reportId: string,
    resolution: ReportResolutionType,
    notes: string,
    sanctionDays?: number
  ) => {
    const updated = await resolveReportInDB(reportId, resolution, notes, session.email, sanctionDays);
    if (updated) {
      setReports(prev => prev.map(r => r.id === reportId ? updated : r));
      const freshUsers = await getUsersFromDB();
      setUsers(freshUsers);
      const myUser = freshUsers.find(u => u.email.toLowerCase() === session.email.toLowerCase());
      if (myUser) {
        setSession(myUser);
      }
    }
  };

  const handleSubmitReview = async (
    review: import('./types').Review,
    targetType: 'provider' | 'cliente' | 'producto',
    targetId: string
  ) => {
    const { updatedProvider, updatedUser, updatedProduct } = await addReviewToTargetInDB(review, targetType, targetId);
    if (updatedProvider) {
      setProviders(prev => prev.map(p => (p.id === updatedProvider.id ? updatedProvider : p)));
      if (selectedProviderDetail && selectedProviderDetail.id === updatedProvider.id) {
        setSelectedProviderDetail(updatedProvider);
      }
    }
    if (updatedUser) {
      setUsers(prev => prev.map(u => (u.email.toLowerCase() === updatedUser.email.toLowerCase() ? updatedUser : u)));
      if (session.email.toLowerCase() === updatedUser.email.toLowerCase()) {
        setSession(updatedUser);
      }
    }
    if (updatedProduct) {
      setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
      if (selectedProductDetail && selectedProductDetail.id === updatedProduct.id) {
        setSelectedProductDetail(updatedProduct);
      }
    }
  };

  const handleCompleteOnboarding = async (data: {
    email: string;
    name: string;
    phone: string;
    role: UserRole;
    address: string;
    city: string;
    department?: string;
    coordinates?: Coordinates;
    avatarUrl: string;
    serviceModality?: ServiceModality;
    category?: string;
  }) => {
    let coords = data.coordinates || session.fixedLocation?.coordinates || DEFAULT_COLOMBIA_COORDS[data.city] || DEFAULT_COLOMBIA_COORDS['Pereira'] || { lat: 4.81333, lng: -75.69611 };
    const dept = data.department || session.fixedLocation?.department || 'Risaralda';
    const modality = data.serviceModality || 'physical_store';
    const selectedCategory = data.category || 'nutricion';

    // Si es local físico fijo con dirección, asegurar que las coordenadas correspondan a la dirección
    if (modality === 'physical_store' && data.address && data.address.trim().length >= 4) {
      try {
        const geocoded = await geocodeAddress(data.address, data.city, dept);
        if (geocoded) {
          coords = geocoded;
        }
      } catch (e) {
        console.warn('Geocoding notice:', e);
      }
    }

    const newSession: UserSession = {
      ...session,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      city: data.city,
      department: dept,
      avatarUrl: data.avatarUrl,
      isOnboarded: true,
      hasChosenCity: true,
      isActive: true,
      isAdmin: data.email.toLowerCase() === 'carloscorreaup@gmail.com',
      mode: data.role === 'provider' ? 'provider' : 'client',
      fixedLocation: {
        address: data.address,
        city: data.city,
        department: dept,
        coordinates: coords,
        isPublicOnMap: true,
        serviceModality: modality,
      },
      providerProfile: (data.role === 'provider' || data.role === 'both') ? {
        businessName: data.name,
        category: selectedCategory,
        offerType: 'both',
        phone: data.phone,
        whatsapp: data.phone,
        address: data.address,
        city: data.city,
        department: dept,
        description: 'Proveedor verificado con atención directa.',
        verified: true,
        verifiedBadgeType: 'oficial',
        rating: 5.0,
        reviewCount: 1,
        serviceModality: modality,
        services: [],
        products: []
      } : session.providerProfile
    };
    setSession(newSession);
    await saveUserToDB(newSession);
    setUsers(prev => [newSession, ...prev.filter(u => u.email !== newSession.email)]);

    if (data.role === 'provider' || data.role === 'both') {
      const newProvider: Provider = {
        id: data.email,
        name: data.name,
        businessName: data.name,
        category: selectedCategory,
        offerType: 'both',
        rating: 5.0,
        reviewCount: 1,
        tags: ['Verificado', data.city],
        phone: data.phone,
        whatsapp: data.phone,
        address: data.address,
        coordinates: coords,
        city: data.city,
        department: dept,
        isFixedLocationVisibleOnMap: true,
        verified: true,
        verifiedBadgeType: 'oficial',
        avatarUrl: data.avatarUrl,
        description: 'Proveedor verificado con atención directa.',
        services: [],
        products: [],
        reviews: [],
        isDelivery: true,
        serviceModality: modality,
      };
      await saveProviderToDB(newProvider);
      setProviders(prev => [newProvider, ...prev.filter(p => p.id !== newProvider.id)]);
    }
  };

  const handleSelectCity = (cityName: string, detectedCoords?: Coordinates) => {
    const coords = detectedCoords || DEFAULT_COLOMBIA_COORDS[cityName] || session.fixedLocation?.coordinates || DEFAULT_COLOMBIA_COORDS['Pereira'];
    setSession(prev => {
      const updated: UserSession = {
        ...prev,
        city: cityName,
        hasChosenCity: true,
        fixedLocation: {
          ...prev.fixedLocation,
          city: cityName,
          coordinates: coords,
        },
      };
      saveUserToDB(updated);
      return updated;
    });
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
  const handleSelectProvider = (provider: Provider) => {
    if (provider.email !== session.email) {
      const newVisit = {
        timestamp: Date.now(),
        clientId: session.id,
        clientName: session.name,
        clientAvatar: session.avatarUrl
      };
      const updatedProvider = {
        ...provider,
        views: [...(provider.views || []), newVisit]
      };
      setProviders(prev => prev.map(p => p.id === provider.id ? updatedProvider : p));
      setSelectedProviderDetail(updatedProvider);
    } else {
      setSelectedProviderDetail(provider);
    }
  };
  const handleSaveProviderProfile = async (profileData: Partial<Provider>) => {
    try {
      const modality = profileData.serviceModality || session.fixedLocation?.serviceModality || 'physical_store';
      const category = profileData.category || session.providerProfile?.category || 'nutricion';
      let coords = session.fixedLocation?.coordinates || DEFAULT_COLOMBIA_COORDS[session.city] || { lat: 4.81333, lng: -75.69611 };

      const targetProviderId = adminEditingProviderId || profileData.id || session.email || 'my-provider-id';
      const isEditingSelf = targetProviderId === session.id || targetProviderId === session.email || targetProviderId === 'my-provider-id';

      // Si es local físico y la dirección fue ingresada/actualizada, geocodificarla para fijar el pin en esa dirección exacta
      if (modality === 'physical_store' && profileData.address && profileData.address.trim().length >= 4) {
        try {
          const geocoded = await geocodeAddress(profileData.address, session.city, session.department);
          if (geocoded) {
            coords = geocoded;
          }
        } catch (e) {
          console.warn('Geocoding notice on save provider:', e);
        }
      }

      const updatedProvider: Provider = {
        id: targetProviderId,
        name: profileData.name || (isEditingSelf ? session.name : ''),
        businessName: profileData.businessName || 'Mi Negocio Local',
        category: category,
        offerType: profileData.offerType || 'both',
        rating: profileData.rating || 5.0,
        reviewCount: profileData.reviewCount || 1,
        tags: profileData.tags || ['Verificado', session.city],
        phone: profileData.phone || (isEditingSelf ? session.phone : ''),
        whatsapp: profileData.whatsapp || (isEditingSelf ? session.phone : ''),
        address: profileData.address || (isEditingSelf ? session.fixedLocation?.address || '' : ''),
        coordinates: profileData.coordinates || coords,
        city: profileData.city || session.city,
        department: profileData.department || session.department,
        isFixedLocationVisibleOnMap: true,
        verified: true,
        verifiedBadgeType: 'oficial',
        avatarUrl: profileData.avatarUrl || (isEditingSelf ? session.avatarUrl : '') || getEmailAvatarUrl(session.email, session.name),
        description: profileData.description || 'Ofrecemos los mejores productos y servicios.',
        services: profileData.services || [],
        products: profileData.products || [],
        reviews: profileData.reviews || [],
        views: profileData.views || [],
        isDelivery: true,
        serviceModality: modality,
      };

      // Merge with existing if any
      const existingProviderIndex = providers.findIndex(p => p.id === updatedProvider.id);
      let finalProvider = updatedProvider;
      if (existingProviderIndex >= 0) {
         finalProvider = { ...providers[existingProviderIndex], ...updatedProvider };
      }

      await saveProviderToDB(finalProvider);

      if (isEditingSelf) {
        // Sincronizar session.fixedLocation y session.providerProfile
        setSession(prev => {
          const updatedSession: UserSession = {
            ...prev,
            fixedLocation: {
              ...prev.fixedLocation,
              address: finalProvider.address,
              coordinates: finalProvider.coordinates,
              serviceModality: modality,
            },
            providerProfile: {
              ...prev.providerProfile,
              businessName: finalProvider.businessName,
              category: finalProvider.category,
              address: finalProvider.address,
              whatsapp: finalProvider.whatsapp,
              serviceModality: modality,
            }
          };
          saveUserToDB(updatedSession);
          return updatedSession;
        });
      }

      setProviders(prev => {
        const idx = prev.findIndex(p => p.id === finalProvider.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = finalProvider;
          return copy;
        }
        return [finalProvider, ...prev];
      });

      if (isEditingSelf) {
        // Store a LIGHTWEIGHT copy in session.providerProfile (no Base64 images)
        // to avoid bloating localStorage with duplicate heavy data.
        // The full data (with images) is persisted separately in the providers store.
        const lightweightProfile: Partial<Provider> = {
          ...profileData,
          products: (profileData.products || []).map(p => ({
            ...p,
            images: p.images.map(img => img.startsWith('data:') ? `[compressed:${img.length}]` : img),
          })),
          services: (profileData.services || []).map(s => ({
            ...s,
            images: s.images?.map(img => img.startsWith('data:') ? `[compressed:${img.length}]` : img),
          })),
        };
        setSession(prev => ({
          ...prev,
          providerProfile: lightweightProfile
        }));
      }
    } catch (err) {
      console.error('[App] handleSaveProviderProfile error:', err);
    }
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
    if (isFirebaseConnected && auth) {
      auth.signOut().catch(e => console.error('Error signing out:', e));
    }
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

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} durationMs={3000} />;
  }

  if (!session.email) {
    return (
      <>
        <AuthScreen
          onAuthSuccess={async (authData) => {
            const dbUser = await getUserByEmail(authData.email);
            const reliableAvatar = getReliableAvatarUrl(authData.avatarUrl, authData.email, authData.name);
            if (dbUser && dbUser.isOnboarded) {
              const finalAvatar = authData.avatarUrl || dbUser.avatarUrl || reliableAvatar;
              const mergedUser = {
                ...dbUser,
                avatarUrl: finalAvatar,
                name: dbUser.name || authData.name,
              };
              setSession(mergedUser);
              if (finalAvatar !== dbUser.avatarUrl) {
                saveUserToDB(mergedUser);
              }
            } else {
              setSession(prev => ({
                ...prev,
                email: authData.email,
                name: authData.name || prev.name,
                avatarUrl: reliableAvatar,
                isOnboarded: false
              }));
            }
          }}
          onOpenFirebaseConfig={() => setShowFirebaseModal(true)}
        />
        {showFirebaseModal && (
          <FirebaseConfigModal
            onClose={() => setShowFirebaseModal(false)}
            onConfigSaved={() => setShowFirebaseModal(false)}
          />
        )}
      </>
    );
  }

  if (!session.isOnboarded) {
    return (
      <OnboardingScreen
        defaultEmail={session.email}
        defaultName={session.name}
        defaultAvatarUrl={session.avatarUrl}
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

  const activeReportAgainstMe = reports.find(
    r => r.targetEmail.toLowerCase() === session.email.toLowerCase() && r.status === 'pendiente'
  );

  return (
    <div className="bg-[#f9f9ff] min-h-screen text-[#141b2b] flex flex-col font-inter selection:bg-[#0052ff] selection:text-white">
      {/* Header */}
      <Header
        currentCity={session.city}
        onSelectCity={handleSelectCity}
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

      {/* Official Notice Banner for Reported User */}
      {activeReportAgainstMe && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 text-white px-4 py-3 shadow-md border-b border-red-700">
          <div className="max-w-6xl mx-auto flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-white animate-pulse mt-0.5" />
              <div>
                <div className="font-black uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span>Notificación Oficial: Denuncia en Evaluación Administrativa</span>
                </div>
                <p className="mt-0.5 leading-relaxed text-white/95 text-xs">
                  El usuario <strong>"{activeReportAgainstMe.reporterName}"</strong> te denunció ante el Administrador ({activeReportAgainstMe.reasonLabel}), quien evaluará la situación en un plazo de <strong>5 días hábiles</strong> (fecha límite: {activeReportAgainstMe.deadlineDate}). Recibirás una resolución oficial una vez concluya el proceso de revisión.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning banner if warned */}
      {session.warningsCount !== undefined && session.warningsCount > 0 && !activeReportAgainstMe && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4" />
          <span>Tienes {session.warningsCount} advertencia{session.warningsCount > 1 ? 's' : ''} administrativa{session.warningsCount > 1 ? 's' : ''} registrada{session.warningsCount > 1 ? 's' : ''} por el Administrador.</span>
        </div>
      )}

      <main className="flex-1">
        {activeTab === 'explore' && (
          <ExploreView
            currentCity={session.city}
            providers={providers}
            products={products}
            userSession={session}
            onSelectProvider={p => handleSelectProvider(p)}
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
            onSelectProvider={p => handleSelectProvider(p)}
            onContactWhatsApp={p => setWhatsAppModalData({ provider: p })}
            onBack={handleGoBack}
          />
        )}

        {activeTab === 'provider' && (
          <ProviderModeView
            currentCity={session.city}
            userSession={session}
            bookings={bookings}
            existingProviderData={
              adminEditingProviderId 
                ? providers.find(p => p.id === adminEditingProviderId) 
                : providers.find(p => p.id === session.id || p.id === session.email || p.id === 'my-provider-id')
            }
            onSaveProviderProfile={handleSaveProviderProfile}
            onSwitchToClientMode={() => {
              setSession(p => ({ ...p, mode: 'client' }));
              navigateToTab('explore');
            }}
            onOpenRatingModal={target => setRatingModalTarget(target)}
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
            onOpenReportModal={target => setReportModalData(target)}
            onOpenRatingModal={target => setRatingModalTarget(target)}
          />
        )}

        {activeTab === 'admin' && isSuperAdmin && (
          <AdminDashboardView
            users={users}
            providers={providers}
            products={products}
            bookings={bookings}
            reports={reports}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
            onToggleProviderVerification={handleToggleProviderVerification}
            onResolveReport={handleResolveReport}
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
            onViewProvider={p => handleSelectProvider(p)}
            onUpdateLocation={updatedSession => {
              setSession(updatedSession);
              saveUserToDB(updatedSession);
            }}
            onUpdateAvatar={handleUpdateUserAvatar}
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
        userAvatarUrl={session.avatarUrl || getEmailAvatarUrl(session.email, session.name)}
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
          onOpenReportModal={target => {
            setSelectedProviderDetail(null);
            setReportModalData(target);
          }}
          onOpenRatingModal={target => {
            setSelectedProviderDetail(null);
            setRatingModalTarget(target);
          }}
          onEditProvider={(isSuperAdmin || session.id === selectedProviderDetail.id || session.email === selectedProviderDetail.id || selectedProviderDetail.id === 'my-provider-id') ? () => handleEditProvider(selectedProviderDetail.id) : undefined}
        />
      )}

      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          onClose={() => setSelectedProductDetail(null)}
          onContactWhatsApp={prod => {
            const prov = providers.find(p => p.id === prod.providerId) || {
              id: prod.providerId,
              name: prod.providerName,
              businessName: prod.providerBusinessName || prod.providerName,
              phone: prod.providerPhone || '',
              whatsapp: prod.providerWhatsapp || '',
              avatarUrl: prod.providerAvatar,
              category: prod.category,
              offerType: 'products' as const,
              rating: prod.rating || 5.0,
              reviewCount: prod.reviewsCount || 0,
              tags: prod.tags || [],
              address: `${prod.city}, Colombia`,
              city: prod.city,
              department: 'Colombia',
              description: 'Vendedor y comercio verificado en NexService App.',
              coordinates: prod.location?.coordinates || { lat: 4.8145, lng: -75.6948 },
              isFixedLocationVisibleOnMap: true,
              verified: !!prod.verifiedSeller,
              verifiedBadgeType: 'oficial' as const,
              documentVerified: true,
              rutVerified: true,
              services: [],
              products: [prod],
              reviews: [],
              isDelivery: prod.deliveryAvailable
            };
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
          onOpenRatingModal={target => {
            setSelectedProductDetail(null);
            setRatingModalTarget(target);
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

      {reportModalData && (
        <ReportModal
          currentUser={session}
          targetUser={reportModalData}
          onClose={() => setReportModalData(null)}
          onSubmitReport={handleSubmitReport}
        />
      )}

      {ratingModalTarget && (
        <RatingReviewModal
          currentUser={session}
          target={ratingModalTarget}
          onClose={() => setRatingModalTarget(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* PWA SMART INSTALL BANNER */}
      <PWAInstallBanner />
    </div>
  );
}
