import { CATEGORIES } from '../data/mockData';

export interface CategoryMatch {
  categoryId: string;
  categoryName: string;
  confidence: number;
  matchedKeywords: string[];
}

export interface SuggestedService {
  name: string;
  category: string;
  priceEstimate?: string;
  duration?: string;
}

export interface CategoryKnowledge {
  id: string;
  name: string;
  keywords: string[];
  suggestedServices: SuggestedService[];
}

export const CATEGORY_KNOWLEDGE: CategoryKnowledge[] = [
  {
    id: 'mascotas',
    name: 'Mascotas',
    keywords: [
      'gato', 'gatos', 'perro', 'perros', 'baño', 'baños', 'mascota', 'mascotas', 'felino', 
      'canino', 'veterinario', 'veterinaria', 'vacuna', 'vacunas', 'paseo', 'paseador', 
      'grooming', 'guarderia', 'peluqueria canina', 'corte de pelo perro'
    ],
    suggestedServices: [
      { name: 'Baño y desparasitación para gatos', category: 'Mascotas', priceEstimate: '$35.000 COP', duration: '1 hr' },
      { name: 'Peluquería e higiene canina a domicilio', category: 'Mascotas', priceEstimate: '$45.000 COP', duration: '1.5 hrs' },
      { name: 'Consulta veterinaria & esquema de vacunación', category: 'Mascotas', priceEstimate: '$60.000 COP', duration: '45 mins' },
      { name: 'Paseo canino personalizado (1 hora)', category: 'Mascotas', priceEstimate: '$20.000 COP', duration: '1 hr' }
    ]
  },
  {
    id: 'hogar',
    name: 'Hogar',
    keywords: [
      'nevera', 'neveras', 'organizar', 'organizo', 'organizacion', 'limpieza', 'aseo', 'casa', 
      'cocina', 'closet', 'closets', 'armario', 'armarios', 'jardineria', 'fumigacion', 
      'desinfectar', 'lavado', 'mantenimiento residencial', 'electrodomestico', 'despensa'
    ],
    suggestedServices: [
      { name: 'Organización profunda de neveras y despensas', category: 'Hogar', priceEstimate: '$50.000 COP', duration: '2 hrs' },
      { name: 'Limpieza e higienización general de hogar', category: 'Hogar', priceEstimate: '$70.000 COP', duration: '4 hrs' },
      { name: 'Mantenimiento preventivo de neveras y lavadoras', category: 'Hogar', priceEstimate: '$65.000 COP', duration: '1.5 hrs' },
      { name: 'Organización de closets y espacios residenciales', category: 'Hogar', priceEstimate: '$60.000 COP', duration: '3 hrs' }
    ]
  },
  {
    id: 'reparaciones',
    name: 'Reparaciones',
    keywords: [
      'plomero', 'plomeria', 'fuga', 'fugas', 'tubo', 'tuberia', 'electricista', 'electricidad', 
      'cableado', 'toma', 'breaker', 'corta', 'corto', 'cerrajero', 'cerrajeria', 'chapa', 
      'llave', 'calentador', 'gas', 'destape', 'grifo', 'llave de agua'
    ],
    suggestedServices: [
      { name: 'Detección y reparación de fugas sin romper', category: 'Reparaciones', priceEstimate: '$45.000 COP', duration: '1 hr' },
      { name: 'Instalación y revisión de puntos eléctricos y breakers', category: 'Reparaciones', priceEstimate: '$40.000 COP', duration: '45 mins' },
      { name: 'Apertura y cambio de chapas de seguridad', category: 'Reparaciones', priceEstimate: '$50.000 COP', duration: '1 hr' },
      { name: 'Mantenimiento de calentadores a gas y duchas', category: 'Reparaciones', priceEstimate: '$60.000 COP', duration: '1.5 hrs' }
    ]
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    keywords: [
      'computador', 'computadores', 'pc', 'laptop', 'laptops', 'impresora', 'impresoras', 
      'red', 'redes', 'wifi', 'celular', 'celulares', 'pantalla', 'formatear', 'formateo', 
      'tecnico', 'software', 'virus', 'antivirus', 'mantenimiento pc'
    ],
    suggestedServices: [
      { name: 'Formateo, optimización e instalación de software', category: 'Tecnología', priceEstimate: '$50.000 COP', duration: '2 hrs' },
      { name: 'Reparación física y cambio de pantallas de laptop', category: 'Tecnología', priceEstimate: '$90.000 COP', duration: '2 hrs' },
      { name: 'Configuración de redes WiFi e impresoras de oficina', category: 'Tecnología', priceEstimate: '$40.000 COP', duration: '1 hr' }
    ]
  },
  {
    id: 'salud',
    name: 'Salud',
    keywords: [
      'medico', 'medicina', 'odontologia', 'diente', 'dientes', 'doctor', 'fisioterapia', 
      'fisioterapeuta', 'masaje terapeutico', 'enfermeria', 'inyeccion', 'curacion', 'salud', 
      'valoracion medica'
    ],
    suggestedServices: [
      { name: 'Consulta médica domiciliaria y valoración', category: 'Salud', priceEstimate: '$80.000 COP', duration: '45 mins' },
      { name: 'Limpieza y profilaxis odontológica', category: 'Salud', priceEstimate: '$70.000 COP', duration: '1 hr' },
      { name: 'Terapia física y rehabilitación postural', category: 'Salud', priceEstimate: '$60.000 COP', duration: '1 hr' }
    ]
  },
  {
    id: 'belleza',
    name: 'Belleza',
    keywords: [
      'maquillaje', 'peluqueria', 'corte', 'cabello', 'pelo', 'uñas', 'manicure', 'pedicure', 
      'barberia', 'barba', 'estetica', 'facial', 'cejas', 'pestañas'
    ],
    suggestedServices: [
      { name: 'Corte de cabello y cepillado profesional a domicilio', category: 'Belleza', priceEstimate: '$35.000 COP', duration: '1 hr' },
      { name: 'Manicure y pedicure semipermanente', category: 'Belleza', priceEstimate: '$40.000 COP', duration: '1.5 hrs' },
      { name: 'Barbería completa, perfilado de barba y mascarilla', category: 'Belleza', priceEstimate: '$30.000 COP', duration: '45 mins' }
    ]
  },
  {
    id: 'legal',
    name: 'Legal',
    keywords: [
      'abogado', 'abogados', 'demanda', 'contrato', 'contratos', 'asesoria', 'juridico', 
      'juridica', 'notaria', 'derecho', 'tutela', 'derecho de peticion', 'herencia'
    ],
    suggestedServices: [
      { name: 'Asesoría jurídica y revisión de contratos comerciales', category: 'Legal', priceEstimate: '$100.000 COP', duration: '1 hr' },
      { name: 'Redacción de tutelas y derechos de petición', category: 'Legal', priceEstimate: '$60.000 COP', duration: '2 hrs' }
    ]
  },
  {
    id: 'educacion',
    name: 'Educación',
    keywords: [
      'clase', 'clases', 'tutor', 'tutoria', 'matematicas', 'ingles', 'musica', 'guitarra', 
      'piano', 'refuerzo', 'profesor', 'profesora', 'tarea', 'tareas'
    ],
    suggestedServices: [
      { name: 'Clases particulares de matemáticas y física por hora', category: 'Educación', priceEstimate: '$35.000 COP', duration: '1 hr' },
      { name: 'Clases de inglés conversacional y personalizado', category: 'Educación', priceEstimate: '$40.000 COP', duration: '1 hr' }
    ]
  }
];

/**
 * Intelligent Function to detect Category from freeform text
 */
export function classifyTextToCategory(text: string): CategoryKnowledge | null {
  if (!text || text.trim().length < 2) return null;
  const clean = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let bestMatch: CategoryKnowledge | null = null;
  let highestScore = 0;

  for (const item of CATEGORY_KNOWLEDGE) {
    let score = 0;
    for (const kw of item.keywords) {
      const cleanKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (clean.includes(cleanKw)) {
        score += cleanKw.length > 4 ? 3 : 2;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return highestScore >= 2 ? bestMatch : null;
}

/**
 * Get suggested services matching user query
 */
export function getSuggestedServicesForQuery(query: string): SuggestedService[] {
  if (!query || query.trim().length < 2) return [];
  const matchedCat = classifyTextToCategory(query);

  if (matchedCat) {
    return matchedCat.suggestedServices;
  }

  // Fallback search across all suggested services
  const clean = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const results: SuggestedService[] = [];

  for (const cat of CATEGORY_KNOWLEDGE) {
    for (const s of cat.suggestedServices) {
      const cleanS = s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (cleanS.includes(clean)) {
        results.push(s);
      }
    }
  }

  return results;
}
