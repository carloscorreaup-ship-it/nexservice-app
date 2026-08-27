// ==========================================
// NEXSERVICE.APP-1 - DEFINICIONES DE TIPOS
// ==========================================

export type UserRole = 'client' | 'provider' | 'seller' | 'both' | 'admin';

export type ServiceModality = 'physical_store' | 'home_delivery' | 'mobile_street';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FixedLocation {
  address: string;
  neighborhood?: string;
  city: string;
  department: string;
  coordinates: Coordinates;
  isPublicOnMap: boolean;
  serviceModality?: ServiceModality;
  notes?: string;
}

export interface City {
  id: string;
  name: string;
  department: string;
  isPopular?: boolean;
  coordinates: Coordinates;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  type: 'all' | 'producto' | 'servicio' | 'both';
  description?: string;
  color?: string;
}

export interface ProductItem {
  id: string;
  providerId: string;
  providerName: string;
  providerBusinessName?: string;
  providerAvatar?: string;
  providerPhone?: string;
  providerWhatsapp?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  tags: string[];
  images: string[];
  inStock: boolean;
  stockQuantity?: number;
  condition: 'nuevo' | 'usado' | 'reacondicionado';
  brand?: string;
  deliveryAvailable: boolean;
  deliveryFee?: number;
  warranty?: string;
  city: string;
  location?: FixedLocation;
  verifiedSeller?: boolean;
  rating?: number;
  reviewsCount?: number;
  reviews?: Review[];
  createdAt?: string;
}

export interface ServiceItem {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  priceEstimate: string;
  duration?: string;
  category: string;
  tags?: string[];
  images?: string[];
  isHomeService: boolean;
  warranty?: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  author: string;
  authorEmail?: string;
  authorAvatar?: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  imageUrl?: string; // Optional image attached by user
  images?: string[];
  verifiedBooking?: boolean;
  targetType?: 'producto' | 'servicio' | 'proveedor' | 'cliente';
  targetId?: string;
  helpfulCount?: number;
}

export interface Provider {
  id: string;
  name: string;
  businessName: string;
  category: string;
  offerType: 'products' | 'services' | 'both';
  rating: number;
  reviewCount: number;
  tags: string[];
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  coordinates: Coordinates;
  city: string;
  department: string;
  isFixedLocationVisibleOnMap: boolean;
  website?: string;
  social?: string;
  verified: boolean;
  verifiedBadgeType?: 'oficial' | 'destacado' | 'verificado';
  avatarUrl: string;
  bannerUrl?: string;
  description: string;
  services: ServiceItem[];
  products: ProductItem[];
  reviews: Review[];
  views?: {
    clientId: string;
    clientName: string;
    clientAvatar?: string;
    timestamp: number;
  }[];
  isDelivery: boolean;
  serviceModality?: ServiceModality;
  isFeatured?: boolean;
  yearsOfExperience?: number;
  responseTime?: string;
  priceRange?: string;
  openHours?: string;
  documentVerified?: boolean;
  rutVerified?: boolean;
  isActive?: boolean;
}

export interface MapMarkerItem {
  id: string;
  type: 'provider' | 'seller' | 'client' | 'product';
  name: string;
  businessName?: string;
  avatarUrl: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  coordinates: Coordinates;
  address: string;
  city: string;
  verified: boolean;
  phone?: string;
  whatsapp?: string;
  priceSnippet?: string;
  itemCountSnippet?: string;
  offerType?: 'products' | 'services' | 'both';
  rawObject?: Provider | ProductItem | UserSession;
}

export interface BookingOrOrder {
  id: string;
  type: 'servicio' | 'producto' | 'consulta';
  providerId: string;
  providerName: string;
  providerAvatar: string;
  itemId?: string;
  itemName: string;
  category: string;
  date: string;
  time: string;
  status: 'pendiente' | 'confirmada' | 'en_camino' | 'completada' | 'cancelada';
  totalAmount?: number | string;
  notes?: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  clientCoordinates?: Coordinates;
  createdAt: string;
  isDeliveryRequested?: boolean;
  quantity?: number;
}

export interface UserSession {
  id?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone: string;
  city: string;
  department: string;
  mode: 'client' | 'provider';
  role: UserRole;
  isOnboarded: boolean;
  hasChosenCity: boolean;
  favorites: string[];
  fixedLocation: FixedLocation;
  isVerified: boolean;
  isActive: boolean;
  isAdmin?: boolean;
  providerProfile?: Partial<Provider>;
  warningsCount?: number;
  sanctionUntil?: string;
  sanctionReason?: string;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  createdAt?: string;
}

export type ReportReason =
  | 'fraude_estafa'
  | 'mal_servicio'
  | 'incumplimiento'
  | 'acoso_maltrato'
  | 'producto_defectuoso'
  | 'suplantacion'
  | 'otro';

export type ReportResolutionType =
  | 'ban_definitivo'
  | 'sancion_temporal'
  | 'advertencia_denunciante'
  | 'desestimada_sin_sancion';

export interface UserReport {
  id: string;
  reporterEmail: string;
  reporterName: string;
  reporterAvatar?: string;
  targetId: string;
  targetEmail: string;
  targetName: string;
  targetAvatar?: string;
  targetType: 'provider' | 'client';
  reason: ReportReason;
  reasonLabel: string;
  explanation: string;
  evidenceNotes?: string;
  status: 'pendiente' | 'en_evaluacion' | 'resuelto';
  resolution?: ReportResolutionType;
  resolutionNotes?: string;
  sanctionDays?: number;
  sanctionUntil?: string;
  createdAt: string;
  deadlineDate: string; // 5 días hábiles a partir de la fecha
  resolvedAt?: string;
  adminEmail?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}
