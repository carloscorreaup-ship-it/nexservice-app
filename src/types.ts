export interface City {
  id: string;
  name: string;
  department: string;
  isPopular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Material symbol or lucide
  count: number;
  description?: string;
  color?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  priceEstimate?: string;
  duration?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedBooking?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  businessName: string;
  category: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  phone: string;
  whatsapp: string;
  address?: string;
  website?: string;
  social?: string;
  verified: boolean;
  avatarUrl: string;
  coverUrl?: string;
  description: string;
  city: string;
  services: ServiceItem[];
  reviews: Review[];
  isDelivery: boolean;
  isFeatured?: boolean;
  yearsOfExperience?: number;
  responseTime?: string;
  priceRange?: string;
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  serviceName: string;
  category: string;
  date: string;
  time: string;
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  priceEstimate?: string;
  notes?: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  address?: string;
  createdAt: string;
}

export interface UserSession {
  email: string;
  name: string;
  avatarUrl?: string;
  phone: string;
  city: string;
  mode: 'client' | 'provider';
  isOnboarded: boolean;
  hasChosenCity: boolean;
  favorites: string[];
  providerProfile?: Partial<Provider>;
}
