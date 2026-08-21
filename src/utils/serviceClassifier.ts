/**
 * Classifies search queries into relevant categories, product intent or service intent
 */
export function classifySearchIntent(query: string): {
  type: 'all' | 'producto' | 'servicio';
  suggestedCategory?: string;
  tags: string[];
} {
  const q = query.toLowerCase().trim();

  const productKeywords = [
    'comprar', 'vendo', 'precio', 'tienda', 'producto', 'repuesto', 'accesorio',
    'pantalla', 'bateria', 'cable', 'zapato', 'ropa', 'vestido', 'herramienta',
    'taladro', 'grifo', 'valvula', 'filtro', 'celular', 'laptop', 'teclado'
  ];

  const serviceKeywords = [
    'reparar', 'arreglo', 'instalacion', 'mantenimiento', 'servicio', 'plomero',
    'electricista', 'abogado', 'doctor', 'medico', 'limpieza', 'profesor',
    'asesoria', 'masaje', 'peluqueria', 'veterinaria', 'soporte'
  ];

  let hasProduct = productKeywords.some(kw => q.includes(kw));
  let hasService = serviceKeywords.some(kw => q.includes(kw));

  let type: 'all' | 'producto' | 'servicio' = 'all';
  if (hasProduct && !hasService) type = 'producto';
  if (hasService && !hasProduct) type = 'servicio';

  let suggestedCategory = undefined;
  if (q.includes('agua') || q.includes('tubo') || q.includes('plomer') || q.includes('fuga') || q.includes('luz') || q.includes('cable')) {
    suggestedCategory = 'reparaciones';
  } else if (q.includes('pc') || q.includes('computador') || q.includes('laptop') || q.includes('red') || q.includes('wifi')) {
    suggestedCategory = 'tecnologia';
  } else if (q.includes('abogad') || q.includes('contrato') || q.includes('juridic') || q.includes('demanda')) {
    suggestedCategory = 'legal';
  } else if (q.includes('belleza') || q.includes('masaje') || q.includes('peluq') || q.includes('pestaña') || q.includes('unas')) {
    suggestedCategory = 'belleza';
  } else if (q.includes('diente') || q.includes('odontolog') || q.includes('salud') || q.includes('medico')) {
    suggestedCategory = 'salud';
  } else if (q.includes('perro') || q.includes('gato') || q.includes('veterinar') || q.includes('mascota')) {
    suggestedCategory = 'mascotas';
  }

  return {
    type,
    suggestedCategory,
    tags: q.split(' ').filter(word => word.length > 3)
  };
}
