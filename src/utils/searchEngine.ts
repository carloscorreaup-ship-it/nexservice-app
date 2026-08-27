import { Provider, ProductItem } from '../types';

// Normaliza texto: remueve tildes, caracteres especiales y convierte a minúsculas
export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Palabras vacías en español que se ignoran en el análisis de palabras clave
const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'a', 'al', 'en', 'para', 'por', 'con', 'sin', 'sobre',
  'y', 'e', 'o', 'u', 'que', 'se', 'me', 'te', 'le', 'nos', 'les',
  'mi', 'tu', 'su', 'mis', 'tus', 'sus', 'como', 'donde', 'cual', 'necesito', 'busco', 'quiero', 'servicio', 'persona', 'empresa'
]);

// Diccionario semántico de intenciones, sinónimos y conceptos relacionados
const SEMANTIC_INTENT_MAP: Record<string, { category: string; synonyms: string[]; intentLabel: string }> = {
  // Mascotas & Veterinaria
  'gato': { category: 'mascotas', synonyms: ['gatos', 'felino', 'felinos', 'mascota', 'mascotas', 'michi', 'baño', 'peluqueria', 'veterinaria', 'grooming'], intentLabel: '🐾 Cuidado y Spa Felino / Mascotas' },
  'gatos': { category: 'mascotas', synonyms: ['gato', 'felino', 'felinos', 'mascota', 'mascotas', 'baño', 'peluqueria', 'veterinaria', 'grooming'], intentLabel: '🐾 Cuidado y Spa Felino / Mascotas' },
  'perro': { category: 'mascotas', synonyms: ['perros', 'canino', 'caninos', 'mascota', 'mascotas', 'baño', 'peluqueria', 'veterinaria', 'paseo', 'guarderia'], intentLabel: '🐕 Cuidado y Spa Canino' },
  'perros': { category: 'mascotas', synonyms: ['perro', 'canino', 'caninos', 'mascota', 'mascotas', 'baño', 'peluqueria', 'veterinaria', 'paseo'], intentLabel: '🐕 Cuidado y Spa Canino' },
  'banar': { category: 'mascotas', synonyms: ['baño', 'aseo', 'peluqueria', 'grooming', 'spa', 'limpieza', 'corte'], intentLabel: '🛁 Servicio de Baño y Estética' },
  'bano': { category: 'mascotas', synonyms: ['bañar', 'aseo', 'peluqueria', 'grooming', 'spa', 'ducha'], intentLabel: '🛁 Servicio de Baño y Estética' },
  'veterinaria': { category: 'mascotas', synonyms: ['veterinario', 'vacunas', 'consulta', 'mascotas', 'medico de animales', 'desparasitacion'], intentLabel: '🩺 Veterinaria & Salud Animal' },
  'peluqueria': { category: 'belleza', synonyms: ['corte', 'barberia', 'estilista', 'cabello', 'peinado', 'grooming'], intentLabel: '✂️ Peluquería & Estilismo' },

  // Tecnología y Dispositivos
  'celular': { category: 'tecnologia', synonyms: ['telefono', 'smartphone', 'movil', 'pantalla', 'display', 'iphone', 'samsung', 'xiaomi', 'bateria', 'reparacion', 'tecnico'], intentLabel: '📱 Servicio Técnico y Celulares' },
  'celulares': { category: 'tecnologia', synonyms: ['celular', 'telefono', 'smartphones', 'pantalla', 'reparacion', 'tecnico'], intentLabel: '📱 Servicio Técnico y Celulares' },
  'pantalla': { category: 'tecnologia', synonyms: ['display', 'vidrio', 'tactil', 'celular', 'reparacion', 'cambio de pantalla'], intentLabel: '🖥️ Cambio y Reparación de Pantallas' },
  'computador': { category: 'tecnologia', synonyms: ['pc', 'laptop', 'portatil', 'ordenador', 'mantenimiento', 'gamer', 'formateo', 'ssd', 'ram'], intentLabel: '💻 Computadores y Soporte IT' },
  'reparar': { category: 'reparaciones', synonyms: ['reparacion', 'arreglo', 'tecnico', 'mantenimiento', 'solucion'], intentLabel: '🔧 Reparación y Servicio Técnico' },
  'arreglo': { category: 'reparaciones', synonyms: ['reparar', 'mantenimiento', 'tecnico', 'solucionar'], intentLabel: '🔧 Reparación y Mantenimiento' },

  // Hogar y Plomería / Electricidad
  'plomero': { category: 'reparaciones', synonyms: ['plomeria', 'tuberia', 'fuga', 'agua', 'gotera', 'destape', 'caneria', 'griferia', 'inodoro'], intentLabel: '🚰 Plomería y Fugas de Agua' },
  'fuga': { category: 'reparaciones', synonyms: ['gotera', 'tuberia', 'plomero', 'agua', 'humedad', 'filtracion'], intentLabel: '💧 Detección y Reparación de Fugas' },
  'electricista': { category: 'reparaciones', synonyms: ['electricidad', 'luz', 'corto', 'cableado', 'iluminacion', 'led', 'tablero', 'enchufe'], intentLabel: '⚡ Electricidad y Redes' },
  'limpieza': { category: 'hogar', synonyms: ['aseo', 'desinfeccion', 'lavado', 'empleada', 'limpiar', 'oficina', 'casa'], intentLabel: '🧹 Servicios de Limpieza y Aseo' },

  // Belleza y Spa
  'unas': { category: 'belleza', synonyms: ['manicure', 'pedicure', 'semipermanente', 'acrilicas', 'spa', 'esmaltado'], intentLabel: '💅 Manicure & Uñas' },
  'facial': { category: 'belleza', synonyms: ['limpieza facial', 'skincare', 'piel', 'rejuvenecimiento', 'masaje', 'spa'], intentLabel: '✨ Cuidado Facial y Estética' },

  // Legal y Salud
  'abogado': { category: 'legal', synonyms: ['abogada', 'juridico', 'derecho', 'leyes', 'contrato', 'demanda', 'laboral', 'civil'], intentLabel: '⚖️ Asesoría Jurídica y Legal' },
  'odontologia': { category: 'salud', synonyms: ['dentista', 'dientes', 'muela', 'ortodoncia', 'blanqueamiento', 'diseno de sonrisa', 'caries'], intentLabel: '🦷 Odontología y Salud Oral' },
  'medico': { category: 'salud', synonyms: ['doctor', 'medicina', 'consulta', 'salud', 'clinica'], intentLabel: '🩺 Atención Médica y Salud' },
  
  // Nutrición y Suplementos Naturales
  'melena de leon': { category: 'nutricion', synonyms: ['hongo', 'suplemento', 'nutricional', 'natural', 'vitaminas', 'memoria', 'salud', 'medicinal', 'organico'], intentLabel: '🌿 Suplementos Naturales y Nutrición' },
  'suplemento': { category: 'nutricion', synonyms: ['suplementos', 'vitaminas', 'proteina', 'natural', 'melena de leon', 'salud', 'nutricional', 'organico', 'bienestar'], intentLabel: '🌿 Suplementos Naturales y Nutrición' },
  'suplementos': { category: 'nutricion', synonyms: ['suplemento', 'vitaminas', 'proteina', 'natural', 'melena de leon', 'salud', 'nutricional', 'organico', 'bienestar'], intentLabel: '🌿 Suplementos Naturales y Nutrición' },
  'natural': { category: 'nutricion', synonyms: ['naturales', 'organico', 'salud', 'suplemento', 'bienestar', 'medicina alternativa'], intentLabel: '🌿 Salud y Productos Naturales' },
  'nutricion': { category: 'nutricion', synonyms: ['nutricional', 'suplemento', 'vitaminas', 'dieta', 'salud', 'bienestar'], intentLabel: '🌿 Suplementos Naturales y Nutrición' },
};

// Extrae palabras clave significativas de una consulta de usuario
export const extractKeywords = (query: string): string[] => {
  const normalized = normalizeText(query);
  if (!normalized) return [];

  const rawTokens = normalized.split(/[\s,.-_]+/).filter(Boolean);
  const keywords: string[] = [];

  for (const token of rawTokens) {
    if (!STOP_WORDS.has(token) && token.length > 1) {
      keywords.push(token);
    }
  }

  return keywords;
};

// Detecta si la consulta tiene un concepto semántico o categoría inferida
export const detectSearchIntents = (query: string): { category?: string; intentLabel?: string; expandedKeywords: string[] } => {
  const normalizedQuery = normalizeText(query);
  const keywords = extractKeywords(query);
  const expanded = new Set<string>(keywords);
  let detectedCategory: string | undefined;
  let detectedLabel: string | undefined;

  // First, check for full query match in semantic map (e.g. "melena de leon")
  for (const [key, config] of Object.entries(SEMANTIC_INTENT_MAP)) {
    if (normalizedQuery.includes(key)) {
      if (!detectedCategory) detectedCategory = config.category;
      if (!detectedLabel) detectedLabel = config.intentLabel;
      config.synonyms.forEach(syn => expanded.add(normalizeText(syn)));
    }
  }

  // Then check individual keywords
  for (const kw of keywords) {
    for (const [key, config] of Object.entries(SEMANTIC_INTENT_MAP)) {
      if (kw === key || kw.includes(key) || key.includes(kw)) {
        if (!detectedCategory) detectedCategory = config.category;
        if (!detectedLabel) detectedLabel = config.intentLabel;
        config.synonyms.forEach(syn => expanded.add(normalizeText(syn)));
      }
    }
  }

  return {
    category: detectedCategory,
    intentLabel: detectedLabel,
    expandedKeywords: Array.from(expanded)
  };
};

// Calcula el puntaje de coincidencia de un Proveedor
export const scoreProviderMatch = (
  provider: Provider,
  query: string,
  keywords: string[],
  searchIntent?: { category?: string; intentLabel?: string; expandedKeywords: string[] }
): number => {
  if (!query.trim()) return 1;

  const normQuery = normalizeText(query);
  const providerText = normalizeText(
    `${provider.name} ${provider.businessName} ${provider.description} ${provider.category} ${provider.tags.join(' ')} ${provider.services.map(s => s.name + ' ' + (s.description || '')).join(' ')}`
  );

  let score = 0;

  // Boost if the provider belongs to the detected semantic category
  if (searchIntent?.category && normalizeText(provider.category).includes(searchIntent.category)) {
    score += 50; // High boost for category match
  }

  // Coincidencia exacta de la frase
  if (providerText.includes(normQuery)) {
    score += 100;
  }

  // Coincidencias de palabras clave principales
  for (const kw of keywords) {
    if (providerText.includes(kw)) {
      score += 35;
      // Bonus si está en el nombre o servicios
      if (normalizeText(provider.businessName).includes(kw)) score += 20;
      if (provider.services.some(s => normalizeText(s.name).includes(kw))) score += 25;
      if (provider.tags.some(t => normalizeText(t).includes(kw))) score += 15;
    }
  }

  // Coincidencias de sinónimos semánticos
  const expandedKeywords = searchIntent?.expandedKeywords || keywords;
  for (const expKw of expandedKeywords) {
    if (providerText.includes(expKw)) {
      score += 15;
      if (provider.services.some(s => normalizeText(s.name).includes(expKw))) score += 10;
    }
  }

  return score;
};

// Calcula el puntaje de coincidencia de un Producto
export const scoreProductMatch = (
  product: ProductItem,
  query: string,
  keywords: string[],
  searchIntent?: { category?: string; intentLabel?: string; expandedKeywords: string[] }
): number => {
  if (!query.trim()) return 1;

  const normQuery = normalizeText(query);
  const productText = normalizeText(
    `${product.name} ${product.description} ${product.category} ${product.tags.join(' ')} ${product.brand || ''} ${product.providerName} ${product.providerBusinessName}`
  );

  let score = 0;

  // Boost if the product belongs to the detected semantic category
  if (searchIntent?.category && normalizeText(product.category).includes(searchIntent.category)) {
    score += 50; // High boost for category match
  }

  // Coincidencia exacta
  if (productText.includes(normQuery)) {
    score += 100;
  }

  // Palabras clave directas
  for (const kw of keywords) {
    if (productText.includes(kw)) {
      score += 35;
      if (normalizeText(product.name).includes(kw)) score += 25;
      if (product.tags.some(t => normalizeText(t).includes(kw))) score += 15;
    }
  }

  // Sinónimos
  const expandedKeywords = searchIntent?.expandedKeywords || keywords;
  for (const expKw of expandedKeywords) {
    if (productText.includes(expKw)) {
      score += 15;
    }
  }

  return score;
};
