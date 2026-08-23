import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConnected } from './firebase';
import { Provider, ProductItem, ServiceItem, BookingOrOrder, UserSession, Review, MapMarkerItem, UserReport, ReportResolutionType } from '../types';
import { INITIAL_PROVIDERS, INITIAL_PRODUCTS, INITIAL_BOOKINGS, INITIAL_USERS } from '../data/initialData';

const LOCAL_STORAGE_KEYS = {
  PROVIDERS: 'nexservice_store_providers_v2',
  PRODUCTS: 'nexservice_store_products_v2',
  BOOKINGS: 'nexservice_store_bookings_v2',
  USERS: 'nexservice_store_users_v2',
  REPORTS: 'nexservice_store_reports_v1',
};

function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const s = localStorage.getItem(key);
    if (s) {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed) && Array.isArray(defaultVal)) {
        // Fusionar elementos nuevos de defaultVal que no estén en parsed por id
        const existingIds = new Set(parsed.map((item: any) => item.id));
        const missing = defaultVal.filter((item: any) => !existingIds.has(item.id));
        return [...parsed, ...missing] as unknown as T;
      }
      return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return defaultVal;
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(e);
  }
}

/**
 * PROVIDERS CRUD
 */
export async function getProvidersFromDB(city?: string): Promise<Provider[]> {
  if (db && isFirebaseConnected) {
    try {
      const colRef = collection(db, 'providers');
      const q = city ? query(colRef, where('city', '==', city)) : colRef;
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Provider));
      }
    } catch (e) {
      console.warn('Firestore getProviders error, using local fallback:', e);
    }
  }

  const list = getLocal<Provider[]>(LOCAL_STORAGE_KEYS.PROVIDERS, INITIAL_PROVIDERS);
  if (city) {
    return list.filter(p => p.city.toLowerCase() === city.toLowerCase());
  }
  return list;
}

export async function saveProviderToDB(provider: Provider): Promise<void> {
  if (db && isFirebaseConnected) {
    try {
      const docRef = doc(db, 'providers', provider.id);
      await setDoc(docRef, provider, { merge: true });
    } catch (e) {
      console.warn('Firestore saveProvider error, saving locally:', e);
    }
  }

  const list = getLocal<Provider[]>(LOCAL_STORAGE_KEYS.PROVIDERS, INITIAL_PROVIDERS);
  const idx = list.findIndex(p => p.id === provider.id);
  if (idx >= 0) {
    list[idx] = provider;
  } else {
    list.unshift(provider);
  }
  setLocal(LOCAL_STORAGE_KEYS.PROVIDERS, list);
}

/**
 * PRODUCTS CRUD
 */
export async function getProductsFromDB(city?: string): Promise<ProductItem[]> {
  if (db && isFirebaseConnected) {
    try {
      const colRef = collection(db, 'products');
      const q = city ? query(colRef, where('city', '==', city)) : colRef;
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductItem));
      }
    } catch (e) {
      console.warn('Firestore getProducts error, using local fallback:', e);
    }
  }

  const list = getLocal<ProductItem[]>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  if (city) {
    return list.filter(p => p.city.toLowerCase() === city.toLowerCase());
  }
  return list;
}

export async function saveProductToDB(product: ProductItem): Promise<void> {
  if (db && isFirebaseConnected) {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, product, { merge: true });
    } catch (e) {
      console.warn('Firestore saveProduct error, saving locally:', e);
    }
  }

  const list = getLocal<ProductItem[]>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const idx = list.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    list[idx] = product;
  } else {
    list.unshift(product);
  }
  setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, list);
}

export async function deleteProductFromDB(productId: string): Promise<void> {
  if (db && isFirebaseConnected) {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (e) {
      console.warn('Firestore deleteProduct error:', e);
    }
  }

  const list = getLocal<ProductItem[]>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, list.filter(p => p.id !== productId));
}

/**
 * BOOKINGS & ORDERS CRUD
 */
export async function getBookingsFromDB(clientEmail?: string): Promise<BookingOrOrder[]> {
  if (db && isFirebaseConnected) {
    try {
      const colRef = collection(db, 'bookings_orders');
      const q = clientEmail
        ? query(colRef, where('clientEmail', '==', clientEmail), orderBy('createdAt', 'desc'))
        : query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingOrOrder));
      }
    } catch (e) {
      console.warn('Firestore getBookings error, using local fallback:', e);
    }
  }

  const list = getLocal<BookingOrOrder[]>(LOCAL_STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  if (clientEmail) {
    return list.filter(b => b.clientEmail.toLowerCase() === clientEmail.toLowerCase());
  }
  return list;
}

export async function saveBookingToDB(booking: BookingOrOrder): Promise<void> {
  if (db && isFirebaseConnected) {
    try {
      const docRef = doc(db, 'bookings_orders', booking.id);
      await setDoc(docRef, booking, { merge: true });
    } catch (e) {
      console.warn('Firestore saveBooking error, saving locally:', e);
    }
  }

  const list = getLocal<BookingOrOrder[]>(LOCAL_STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  const idx = list.findIndex(b => b.id === booking.id);
  if (idx >= 0) {
    list[idx] = booking;
  } else {
    list.unshift(booking);
  }
  setLocal(LOCAL_STORAGE_KEYS.BOOKINGS, list);
}

export async function updateBookingStatusInDB(id: string, status: BookingOrOrder['status']): Promise<void> {
  if (db && isFirebaseConnected) {
    try {
      const docRef = doc(db, 'bookings_orders', id);
      await updateDoc(docRef, { status });
    } catch (e) {
      console.warn('Firestore updateBookingStatus error:', e);
    }
  }

  const list = getLocal<BookingOrOrder[]>(LOCAL_STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  const updated = list.map(b => b.id === id ? { ...b, status } : b);
  setLocal(LOCAL_STORAGE_KEYS.BOOKINGS, updated);
}

/**
 * MAP MARKERS AGGREGATOR
 */
export async function getMapMarkers(city: string): Promise<MapMarkerItem[]> {
  const providers = await getProvidersFromDB(city);
  const markers: MapMarkerItem[] = [];

  providers.forEach(p => {
    if (p.isFixedLocationVisibleOnMap && p.coordinates) {
      markers.push({
        id: p.id,
        type: p.offerType === 'products' ? 'seller' : 'provider',
        name: p.name,
        businessName: p.businessName,
        avatarUrl: p.avatarUrl,
        category: p.category,
        rating: p.rating,
        reviewCount: p.reviewCount,
        coordinates: p.coordinates,
        address: p.address,
        city: p.city,
        verified: p.verified,
        phone: p.phone,
        whatsapp: p.whatsapp,
        priceSnippet: p.priceRange || 'Precio accesible',
        itemCountSnippet: `${p.products.length} productos | ${p.services.length} servicios`,
        offerType: p.offerType,
        rawObject: p
      });
    }
  });

  return markers;
}

/**
 * USERS & SUPER ADMIN CRUD
 */
export async function getUsersFromDB(): Promise<UserSession[]> {
  if (db && isFirebaseConnected) {
    try {
      const colRef = collection(db, 'users');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserSession));
      }
    } catch (e) {
      console.warn('Firestore getUsers error, using local fallback:', e);
    }
  }

  return getLocal<UserSession[]>(LOCAL_STORAGE_KEYS.USERS, INITIAL_USERS);
}

export async function saveUserToDB(user: UserSession): Promise<void> {
  if (db && isFirebaseConnected) {
    try {
      const docRef = doc(db, 'users', user.email.replace(/\./g, '_'));
      await setDoc(docRef, user, { merge: true });
    } catch (e) {
      console.warn('Firestore saveUser error:', e);
    }
  }

  const list = getLocal<UserSession[]>(LOCAL_STORAGE_KEYS.USERS, INITIAL_USERS);
  const idx = list.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (idx >= 0) {
    list[idx] = user;
  } else {
    list.unshift(user);
  }
  setLocal(LOCAL_STORAGE_KEYS.USERS, list);
}

export async function toggleUserStatusInDB(email: string, nextStatus: boolean): Promise<void> {
  if (db && isFirebaseConnected) {
    try {
      const docRef = doc(db, 'users', email.replace(/\./g, '_'));
      await updateDoc(docRef, { isActive: nextStatus });
    } catch (e) {
      console.warn('Firestore toggleUserStatus error:', e);
    }
  }

  const list = getLocal<UserSession[]>(LOCAL_STORAGE_KEYS.USERS, INITIAL_USERS);
  const updated = list.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, isActive: nextStatus } : u);
  setLocal(LOCAL_STORAGE_KEYS.USERS, updated);
}

export async function getUserByEmail(email: string): Promise<UserSession | null> {
  if (db && isFirebaseConnected) {
    try {
      const docRef = doc(db, 'users', email.replace(/\./g, '_'));
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as UserSession;
      }
    } catch (e) {
      console.warn('Firestore getUserByEmail error, using local fallback:', e);
    }
  }

  const list = getLocal<UserSession[]>(LOCAL_STORAGE_KEYS.USERS, INITIAL_USERS);
  const found = list.find(u => u.email.toLowerCase() === email.toLowerCase());
  return found || null;
}

/**
 * REPORT / DENUNCIA SYSTEM (SUPER ADMIN ONLY)
 */

export function calculateBusinessDaysDeadline(startDate: Date = new Date(), businessDays: number = 5): string {
  let count = 0;
  const cur = new Date(startDate);
  while (count < businessDays) {
    cur.setDate(cur.getDate() + 1);
    const dayOfWeek = cur.getDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
  }
  return cur.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function getReportsFromDB(): Promise<UserReport[]> {
  if (db && isFirebaseConnected) {
    try {
      const colRef = collection(db, 'reports');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserReport));
      }
    } catch (e) {
      console.warn('Firestore getReports error, using local fallback:', e);
    }
  }

  return getLocal<UserReport[]>(LOCAL_STORAGE_KEYS.REPORTS, []);
}

export async function saveReportToDB(report: UserReport): Promise<void> {
  if (db && isFirebaseConnected) {
    try {
      const docRef = doc(db, 'reports', report.id);
      await setDoc(docRef, report, { merge: true });
    } catch (e) {
      console.warn('Firestore saveReport error, saving locally:', e);
    }
  }

  const list = getLocal<UserReport[]>(LOCAL_STORAGE_KEYS.REPORTS, []);
  const idx = list.findIndex(r => r.id === report.id);
  if (idx >= 0) {
    list[idx] = report;
  } else {
    list.unshift(report);
  }
  setLocal(LOCAL_STORAGE_KEYS.REPORTS, list);
}

export async function resolveReportInDB(
  reportId: string,
  resolution: ReportResolutionType,
  resolutionNotes: string,
  adminEmail: string = 'carloscorreaup@gmail.com',
  sanctionDays?: number
): Promise<UserReport | null> {
  const reports = await getReportsFromDB();
  const report = reports.find(r => r.id === reportId);
  if (!report) return null;

  const now = new Date();
  let sanctionUntil: string | undefined = undefined;

  if (resolution === 'sancion_temporal' && sanctionDays) {
    const untilDate = new Date(now);
    untilDate.setDate(untilDate.getDate() + sanctionDays);
    sanctionUntil = untilDate.toISOString();
  }

  const updatedReport: UserReport = {
    ...report,
    status: 'resuelto',
    resolution,
    resolutionNotes,
    adminEmail,
    sanctionDays: resolution === 'sancion_temporal' ? sanctionDays : undefined,
    sanctionUntil,
    resolvedAt: now.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
  };

  // 1. Save updated report
  await saveReportToDB(updatedReport);

  // 2. Apply sanction / ban / warning to target user or reporter user
  const users = await getUsersFromDB();

  if (resolution === 'ban_definitivo') {
    // Disable target user permanently
    await toggleUserStatusInDB(report.targetEmail, false);
  } else if (resolution === 'sancion_temporal') {
    // Temporarily suspend target user
    const targetUser = users.find(u => u.email.toLowerCase() === report.targetEmail.toLowerCase());
    if (targetUser) {
      const suspendedUser: UserSession = {
        ...targetUser,
        isActive: false,
        sanctionUntil,
        sanctionReason: resolutionNotes,
      };
      await saveUserToDB(suspendedUser);
    }
  } else if (resolution === 'advertencia_denunciante') {
    // Add warning to reporter user
    const reporterUser = users.find(u => u.email.toLowerCase() === report.reporterEmail.toLowerCase());
    if (reporterUser) {
      const warnedUser: UserSession = {
        ...reporterUser,
        warningsCount: (reporterUser.warningsCount || 0) + 1,
        sanctionReason: `Advertencia administrativa: ${resolutionNotes}`,
      };
      await saveUserToDB(warnedUser);
    }
  }

  return updatedReport;
}


