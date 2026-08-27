import { UserSession } from '../types';

/**
 * Automatically retrieves the user's profile avatar based on their email or photo URL.
 * Uses unavatar.io service with an initial-based brand fallback.
 */
export function getEmailAvatarUrl(email: string, name?: string): string {
  const displayName = (name && name.trim()) || (email && email.includes('@') ? email.split('@')[0] : 'Usuario');
  const fallback = encodeURIComponent(`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0052ff&color=fff&size=256&bold=true`);

  if (!email || !email.includes('@')) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0052ff&color=fff&size=256&bold=true`;
  }
  const cleanEmail = email.trim().toLowerCase();
  return `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=${fallback}`;
}

/**
 * Ensures high-resolution avatar URL (especially for Google avatars) and reliable fallback.
 */
export function getReliableAvatarUrl(avatarUrl?: string, email?: string, name?: string): string {
  if (avatarUrl && avatarUrl.trim()) {
    // If it's a Google photo URL with small size parameter, upgrade to high quality
    if (avatarUrl.includes('googleusercontent.com')) {
      return avatarUrl.replace(/=s\d+(-c)?$/, '=s400-c');
    }
    return avatarUrl;
  }
  return getEmailAvatarUrl(email || '', name || '');
}

export function getInitials(name: string): string {
  if (!name) return 'NX';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'NX';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatCurrencyCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const CATEGORY_LABELS: Record<string, string> = {
  nutricion: 'Productos Nutricionales',
  productos_nutricionales: 'Productos Nutricionales',
  suplementos: 'Productos Nutricionales',
  alimentos: 'Alimentos & Gastronomía',
  gastronomia: 'Alimentos & Gastronomía',
  tecnologia: 'Tecnología & Dispositivos',
  reparaciones: 'Plomería & Reparaciones',
  ferreteria: 'Ferretería & Repuestos',
  belleza: 'Belleza & Cuidado Personal',
  salud: 'Salud & Medicina',
  legal: 'Legal & Asesorías',
  mascotas: 'Mascotas & Veterinaria',
  moda: 'Moda & Calzado',
  servicios: 'Servicios Profesionales',
  general: 'Comercio General',
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  nutricion: '🌿',
  productos_nutricionales: '🌿',
  suplementos: '🌿',
  alimentos: '🥗',
  gastronomia: '🥗',
  tecnologia: '📱',
  reparaciones: '🚰',
  ferreteria: '🔨',
  belleza: '💅',
  salud: '🩺',
  legal: '⚖️',
  mascotas: '🐾',
  moda: '👗',
  servicios: '💼',
  general: '🛒',
};

export function getCategoryName(category?: string): string {
  if (!category) return 'Productos & Servicios';
  const key = category.toLowerCase().trim();
  return CATEGORY_LABELS[key] || category;
}

export function getCategoryEmoji(category?: string): string {
  if (!category) return '🛒';
  const key = category.toLowerCase().trim();
  return CATEGORY_EMOJIS[key] || '🏷️';
}

