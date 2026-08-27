import { City, Category, Provider, ProductItem, BookingOrOrder, UserSession } from '../types';
import { ALL_COLOMBIA_CITIES } from './colombiaCities';

export const COLOMBIA_CITIES: City[] = ALL_COLOMBIA_CITIES;

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'todos',
    name: 'Todos',
    icon: 'apps',
    count: 0,
    type: 'all',
    color: '#3b82f6',
    description: 'Todos los productos y servicios verificados'
  },
  {
    id: 'nutricion',
    name: 'Productos Nutricionales',
    icon: 'eco',
    count: 0,
    type: 'producto',
    color: '#10b981',
    description: 'Suplementos, adaptógenos, melena de león, vitaminas, proteínas y nutrición natural'
  },
  {
    id: 'tecnologia',
    name: 'Tecnología & Dispositivos',
    icon: 'devices',
    count: 0,
    type: 'both',
    color: '#6366f1',
    description: 'Venta de accesorios, laptops, armado de PC, mantenimiento y repuestos'
  },
  {
    id: 'alimentos',
    name: 'Alimentos & Gastronomía',
    icon: 'restaurant',
    count: 0,
    type: 'both',
    color: '#f97316',
    description: 'Comida rápida, panadería, café especial, frutas, verduras y postres'
  },
  {
    id: 'reparaciones',
    name: 'Plomería & Electricidad',
    icon: 'plumbing',
    count: 0,
    type: 'servicio',
    color: '#0ea5e9',
    description: 'Reparaciones del hogar, detección de fugas, instalaciones RETIE y gas'
  },
  {
    id: 'ferreteria',
    name: 'Ferretería & Repuestos',
    icon: 'handyman',
    count: 0,
    type: 'producto',
    color: '#f59e0b',
    description: 'Venta de herramientas, grifería, iluminación LED, tubos y materiales'
  },
  {
    id: 'belleza',
    name: 'Belleza & Cuidado Personal',
    icon: 'spa',
    count: 0,
    type: 'both',
    color: '#ec4899',
    description: 'Productos cosméticos, cuidado facial, peluquería, masajes y spa'
  },
  {
    id: 'salud',
    name: 'Salud & Odontología',
    icon: 'medical_services',
    count: 0,
    type: 'both',
    color: '#ef4444',
    description: 'Insumos médicos, blanqueamiento, ortodoncia, fisioterapia y medicina general'
  },
  {
    id: 'legal',
    name: 'Legal & Asesorías',
    icon: 'gavel',
    count: 0,
    type: 'servicio',
    color: '#8b5cf6',
    description: 'Abogados especialistas, redacción de contratos, asesoría laboral y comercial'
  },
  {
    id: 'mascotas',
    name: 'Mascotas & Veterinaria',
    icon: 'pets',
    count: 0,
    type: 'both',
    color: '#10b981',
    description: 'Alimento para mascotas, accesorios, consulta veterinaria y baño a domicilio'
  },
  {
    id: 'moda',
    name: 'Moda & Ropa Local',
    icon: 'checkroom',
    count: 0,
    type: 'producto',
    color: '#14b8a6',
    description: 'Prendas de vestir, calzado artesanal, confección y arreglos a medida'
  },
];

// Initial production products (Empty for fresh production start)
export const INITIAL_PRODUCTS: ProductItem[] = [];

// Initial production providers (Empty for fresh production start)
export const INITIAL_PROVIDERS: Provider[] = [];

// Initial production bookings / orders (Empty for fresh production start)
export const INITIAL_BOOKINGS: BookingOrOrder[] = [];

// Initial production users (Only Super Admin Master)
export const INITIAL_USERS: UserSession[] = [
  {
    id: 'admin-master',
    email: 'carloscorreaup@gmail.com',
    name: 'Carlos Correa',
    phone: '+57 300 000 0000',
    city: 'Pereira',
    department: 'Risaralda',
    mode: 'provider',
    role: 'both',
    isOnboarded: true,
    hasChosenCity: true,
    favorites: [],
    isVerified: true,
    isActive: true,
    rating: 5.0,
    reviewCount: 0,
    fixedLocation: {
      address: 'Cra 7 # 19-28, Centro, Pereira',
      city: 'Pereira',
      department: 'Risaralda',
      coordinates: { lat: 4.81333, lng: -75.69611 },
      serviceModality: 'physical_store',
      isPublicOnMap: true
    },
    providerProfile: {
      businessName: 'NexService Master Hub',
      category: 'tecnologia',
      offerType: 'both',
      phone: '+57 300 000 0000',
      whatsapp: '573000000000',
      address: 'Cra 7 # 19-28, Centro, Pereira',
      city: 'Pereira',
      department: 'Risaralda',
      description: 'Sede Principal y Centro de Operaciones Oficial de NexService App.',
      verified: true,
      verifiedBadgeType: 'oficial',
      rating: 5.0,
      reviewCount: 0,
      serviceModality: 'physical_store',
      services: [],
      products: []
    },
    createdAt: '2026-08-23'
  }
];
