/**
 * Utility functions for user profile recognition from email
 */

export function deriveNameFromEmail(email: string): string {
  if (!email || !email.includes('@')) return '';

  const localPart = email.split('@')[0].trim().toLowerCase();
  if (!localPart) return '';

  // Specific overrides for demo accounts
  if (localPart.includes('carloscorrea') || localPart.includes('carlos.correa')) {
    return 'Carlos Correa';
  }
  if (localPart.includes('juan.plomero') || localPart.includes('juan.perez')) {
    return 'Juan Pérez';
  }
  if (localPart.includes('maria') || localPart.includes('gomez')) {
    return 'María Gómez';
  }

  // Heuristic cleanup: remove numbers and special characters
  let cleaned = localPart
    .replace(/[._\-+]/g, ' ')
    .replace(/[0-9]/g, '')
    .trim();

  // If camelCase or connected words without spaces
  if (!cleaned.includes(' ') && cleaned.length > 5) {
    // Basic attempt to split common first names if merged
    cleaned = cleaned.replace(/(carlos|juan|maria|pedro|luis|ana|jose|diego|sofia|andres|laura|camilo|mateo|valeria)/i, '$1 ');
  }

  const words = cleaned.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }

  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function deriveAvatarFromEmail(email: string, name?: string): string {
  const cleanEmail = (email || '').trim().toLowerCase();

  // Special demo overrides
  if (cleanEmail.includes('carloscorreaup') || cleanEmail.includes('carloscorrea')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZvoz3EuYmNT3k6LuMqnW98-amCznFhnjHu2W5iezyKOp0vW4svO3COFcpNOLyspuY4k_GomBJ90ebg7jXdOejGuCplIV1OACf5DrnV1GAj38Mj-SansNHR1Q4duLoCns3SujwmakQdB_yZG7PIFy3iw2USnRAZb_NvVmtLBoZnJtcUfu1Kgq8rNeZJUE72ZgADOf7b-c_sn9yXxjVp5tjJIwcts1-TxoW6lKs3P9YFeHcgEm-U2t6';
  }
  if (cleanEmail.includes('juan.plomero') || cleanEmail.includes('juan.perez')) {
    return 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80';
  }

  const displayName = name || deriveNameFromEmail(cleanEmail) || 'Usuario';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0052ff&color=ffffff&bold=true&font-size=0.42&size=256`;
}
