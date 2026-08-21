import { UserSession } from '../types';

/**
 * Automatically retrieves the user's profile avatar based on their email
 * Uses unavatar.io service which automatically queries Google, Gravatar, GitHub, etc.
 * with a beautiful initials fallback in NexService brand blue.
 */
export function getEmailAvatarUrl(email: string, name?: string): string {
  if (!email || !email.includes('@')) {
    const displayName = name || 'Usuario';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0052ff&color=fff&size=256&bold=true`;
  }
  const cleanEmail = email.trim().toLowerCase();
  const displayName = name || cleanEmail.split('@')[0];
  const fallback = encodeURIComponent(`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0052ff&color=fff&size=256&bold=true`);
  return `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=${fallback}`;
}

export function getInitials(name: string): string {
  if (!name) return 'NX';
  const parts = name.trim().split(' ');
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
