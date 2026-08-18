import { City, Category, Provider, Booking } from '../types';

export const LOGO_URL = "/logo.png";

export const CITIES: City[] = [
  { id: 'pereira', name: 'Pereira', department: 'Risaralda', isPopular: true },
  { id: 'bogota', name: 'Bogotá', department: 'Cundinamarca', isPopular: true },
  { id: 'medellin', name: 'Medellín', department: 'Antioquia', isPopular: true },
  { id: 'cali', name: 'Cali', department: 'Valle del Cauca', isPopular: true },
  { id: 'manizales', name: 'Manizales', department: 'Caldas', isPopular: true },
  { id: 'armenia', name: 'Armenia', department: 'Quindío', isPopular: true },
  { id: 'bucaramanga', name: 'Bucaramanga', department: 'Santander' },
  { id: 'barranquilla', name: 'Barranquilla', department: 'Atlántico' },
  { id: 'cartagena', name: 'Cartagena', department: 'Bolívar' },
  { id: 'santa-marta', name: 'Santa Marta', department: 'Magdalena' },
];

export const CATEGORIES: Category[] = [
  {
    id: 'hogar',
    name: 'Hogar',
    icon: 'home_repair_service',
    count: 42,
    description: 'Mantenimiento, carpintería, aseo y reparaciones residenciales',
    color: '#0052ff',
  },
  {
    id: 'salud',
    name: 'Salud',
    icon: 'medical_services',
    count: 28,
    description: 'Médicos generales, odontología, fisioterapia y enfermería',
    color: '#bf3003',
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    icon: 'devices',
    count: 35,
    description: 'Reparación de PC, redes, software, celulares y soporte IT',
    color: '#4b41e1',
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: 'gavel',
    count: 19,
    description: 'Abogados especialistas, asesoría contractual y laboral',
    color: '#003ec7',
  },
  {
    id: 'belleza',
    name: 'Belleza',
    icon: 'spa',
    count: 31,
    description: 'Peluquería, barbería, maquillaje, uñas y cuidado facial',
    color: '#952200',
  },
  {
    id: 'reparaciones',
    name: 'Reparaciones',
    icon: 'plumbing',
    count: 53,
    description: 'Plomería, electricidad, cerrajería y electrodomésticos',
    color: '#0052ff',
  },
  {
    id: 'educacion',
    name: 'Educación',
    icon: 'school',
    count: 16,
    description: 'Clases particulares de idiomas, música, matemáticas y refuerzo',
    color: '#4b41e1',
  },
  {
    id: 'mascotas',
    name: 'Mascotas',
    icon: 'pets',
    count: 22,
    description: 'Veterinaria a domicilio, paseo canino y guardería de mascotas',
    color: '#bf3003',
  },
];

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'p1',
    name: 'Juan Pérez',
    businessName: 'Plomería Pro',
    category: 'Reparaciones',
    rating: 4.9,
    reviewCount: 124,
    tags: ['Reparaciones', 'Domicilio'],
    phone: '+573124567890',
    whatsapp: '573124567890',
    address: 'Calle 14 # 15-20, Centro, Pereira',
    website: 'https://plomeriapro-pereira.co',
    social: '@plomeriapro_eje',
    verified: true,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoYMAECZ1lTk0XTMy8jHqo-t_7yf_bShO6UvxE7EAQ46H_t-sifB3VW5RJmM3VOdXUNBoz0U1Edmtq998L81jYc-Nsv-AgQzOCjE3UdyndOn6tLw1HYx4fSI-s9dXNKOHEqqdfxSEdsJOFert3ypxxgh8-NFeDhLT7DKI9oyuE39fIA_jbPeHySU0HX9fBEP-26XerPEXf-Eqo_WukCpgviqbvSZ3qF08Dd_lojGggJZW_l88Zbcwr',
    description: 'Especialista en plomería residencial y comercial con más de 12 años de experiencia en Pereira y Dosquebradas. Detección de fugas sin romper, instalación de grifería, desobstrucción de tuberías y cambio de calentadores.',
    city: 'Pereira',
    isDelivery: true,
    isFeatured: true,
    yearsOfExperience: 12,
    responseTime: '< 15 mins',
    priceRange: '$$ (Accesible)',
    services: [
      { id: 's1', name: 'Destape de cañerías y tuberías con sonda', priceEstimate: '$60.000 COP', duration: '1 - 2 hrs' },
      { id: 's2', name: 'Reparación e instalación de griferías', priceEstimate: '$45.000 COP', duration: '45 mins' },
      { id: 's3', name: 'Detección no destructiva de fugas de agua', priceEstimate: '$90.000 COP', duration: '2 hrs' },
      { id: 's4', name: 'Mantenimiento de calentadores a gas/eléctricos', priceEstimate: '$75.000 COP', duration: '1.5 hrs' }
    ],
    reviews: [
      { id: 'r1', author: 'Carlos Restrepo', rating: 5, date: 'Hace 3 días', comment: 'Excelente servicio. Llegó puntual en Pereira y solucionó la fuga del baño en menos de una hora. 100% recomendado.', verifiedBooking: true },
      { id: 'r2', author: 'Mariana Duque', rating: 5, date: 'Hace 1 semana', comment: 'Muy profesional y educado. Limpió todo al terminar su trabajo y cobró el precio acordado.', verifiedBooking: true },
      { id: 'r3', author: 'Andrés Gómez', rating: 4.8, date: 'Hace 3 semanas', comment: 'Buen trabajo en la instalación de lavaplatos y filtro de agua.', verifiedBooking: true }
    ]
  },
  {
    id: 'p2',
    name: 'Dra. Silva',
    businessName: 'Asesoría Legal Integral',
    category: 'Legal',
    rating: 5.0,
    reviewCount: 89,
    tags: ['Legal'],
    phone: '+573158901234',
    whatsapp: '573158901234',
    address: 'Edificio Diario del Otún, Of. 602, Pereira',
    website: 'https://drasilvaabogados.com',
    social: '@drasilva_legal',
    verified: true,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-RhMzMHPJMHY-MBJzULF3l0frjpB33jTzz8MvK8y98RdELjBm2WL3do05xRkQgWCYAVkSCQAZlTelNTdQqggjv6qUCYMsmd5nu-C46_8oC66vIodtd4cjLhcyF--6Erb9pROGHyvaulwVdSAqyoUrKrXFb1ktCPFY3LrnD5E-LjWmlA5NZ6G5DqB2gVL4j_j2dGtlelUam3k6RHlVXrb2GzXYXHn8XmnbCJdmbV1N7VZeN3KimKDf',
    description: 'Abogada litigante y consultora corporativa. Especialista en Derecho Civil, Laboral y Comercial. Brindo asesoría personalizada, redacción de contratos, cobro de cartera y representación legal con ética y transparencia.',
    city: 'Pereira',
    isDelivery: false,
    isFeatured: true,
    yearsOfExperience: 9,
    responseTime: '< 30 mins',
    priceRange: '$$$ (Profesional)',
    services: [
      { id: 's5', name: 'Consulta jurídica virtual o presencial (1h)', priceEstimate: '$80.000 COP', duration: '1 hr' },
      { id: 's6', name: 'Elaboración y revisión de contratos comerciales', priceEstimate: '$150.000 COP', duration: '24 hrs' },
      { id: 's7', name: 'Asesoría en derecho laboral y liquidaciones', priceEstimate: '$95.000 COP', duration: '1 hr' },
      { id: 's8', name: 'Trámites notariales y sucesiones', priceEstimate: '$250.000 COP+', duration: 'Variable' }
    ],
    reviews: [
      { id: 'r4', author: 'Valentina Osorio', rating: 5, date: 'Hace 5 días', comment: 'La doctora Silva me asesoró con una demanda laboral y el resultado fue impecable. Muy clara y atenta.', verifiedBooking: true },
      { id: 'r5', author: 'Esteban Morales', rating: 5, date: 'Hace 2 semanas', comment: 'Revisó nuestros contratos de arrendamiento comercial con máxima rapidez. Excelente servicio.', verifiedBooking: true }
    ]
  },
  {
    id: 'p3',
    name: 'TechFix Pereira',
    businessName: 'Soporte Técnico IT',
    category: 'Tecnología',
    rating: 4.8,
    reviewCount: 210,
    tags: ['Tecnología', 'Domicilio'],
    phone: '+573187654321',
    whatsapp: '573187654321',
    address: 'Carrera 7 # 21-40, Pinares, Pereira',
    website: 'https://techfixpereira.com.co',
    social: '@techfix.pereira',
    verified: true,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcT5zqj29U-f8XXH354rcRGSCn4athByE0C8Z4lSTnZRlLSoJ992f_gHH2uwBeCbBtDW8K9PwwBK0tVqIlcoI7tmC4jE2dOj7BbEsKO5RLRldYlt-9t_MlKACqqOO3s-rKQw-TUJnGjk8WRK5A-ZRBEV6iLAP5-2nam8BSsAOXLOEKIQ5Zfm3ROaLXmFTCpolnVU28jpLnw-uSnaaR6BYKju8dmUlar29XbJ0td6Mu5ovqBqt0oxIL',
    description: 'Centro especializado en soporte técnico computacional, armado de PCs gamer, mantenimiento preventivo y correctivo, recuperación de datos, formateo, instalación de redes WiFi y reparación de portátiles a domicilio.',
    city: 'Pereira',
    isDelivery: true,
    isFeatured: true,
    yearsOfExperience: 8,
    responseTime: '< 10 mins',
    priceRange: '$$ (Moderado)',
    services: [
      { id: 's9', name: 'Mantenimiento preventivo completo (Pasta térmica + limpieza)', priceEstimate: '$65.000 COP', duration: '2 hrs' },
      { id: 's10', name: 'Formateo e instalación de Windows/Mac con respaldo', priceEstimate: '$50.000 COP', duration: '1.5 hrs' },
      { id: 's11', name: 'Cambio de pantalla o teclado de portátil', priceEstimate: '$80.000 COP + repuesto', duration: '3 hrs' },
      { id: 's12', name: 'Optimización de red WiFi doméstica o empresarial', priceEstimate: '$70.000 COP', duration: '1 hr' }
    ],
    reviews: [
      { id: 'r6', author: 'Felipe Henao', rating: 5, date: 'Ayer', comment: 'Vinieron a mi oficina en Pinares y dejaron la red volando y mi laptop como nueva. Gran atención.', verifiedBooking: true },
      { id: 'r7', author: 'Camila Jaramillo', rating: 4.8, date: 'Hace 4 días', comment: 'Muy rápidos respondiendo por WhatsApp. Precios justos.', verifiedBooking: true }
    ]
  },
  {
    id: 'p4',
    name: 'Carlos Mendoza',
    businessName: 'Electricidad Segura Eje',
    category: 'Reparaciones',
    rating: 4.9,
    reviewCount: 96,
    tags: ['Reparaciones', 'Hogar', 'Domicilio'],
    phone: '+573206549870',
    whatsapp: '573206549870',
    address: 'Av. 30 de Agosto # 48-12, Pereira',
    website: 'https://electricidadsegura.co',
    social: '@electricidadsegurapereira',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces&q=80',
    description: 'Electricista certificado Conte con más de 15 años de trayectoria. Instalaciones residenciales, tableros eléctricos, iluminación LED, certificación RETIE y atención de cortocircuitos 24/7.',
    city: 'Pereira',
    isDelivery: true,
    isFeatured: true,
    yearsOfExperience: 15,
    responseTime: '< 20 mins',
    priceRange: '$$ (Accesible)',
    services: [
      { id: 's13', name: 'Atención de emergencias y cortocircuitos', priceEstimate: '$70.000 COP', duration: '1 hr' },
      { id: 's14', name: 'Instalación de lámparas, tomas e interruptores', priceEstimate: '$35.000 COP/pto', duration: '30 mins' },
      { id: 's15', name: 'Reorganización y actualización de tablero eléctrico', priceEstimate: '$120.000 COP', duration: '3 hrs' }
    ],
    reviews: [
      { id: 'r8', author: 'Daniela Toro', rating: 5, date: 'Hace 2 días', comment: 'Puntualidad británica y trabajo super prolijo. Instaló 8 lámparas LED en mi casa.', verifiedBooking: true }
    ]
  },
  {
    id: 'p5',
    name: 'Dra. Mariana Ortiz',
    businessName: 'Ortiz Odontología & Estética',
    category: 'Salud',
    rating: 5.0,
    reviewCount: 142,
    tags: ['Salud', 'Belleza'],
    phone: '+573117894561',
    whatsapp: '573117894561',
    address: 'Calle 19 # 5-48, Consultorio 401, Pereira',
    website: 'https://ortizodontologia.com',
    social: '@dramarianaortiz',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1594824813590-78965a12ec68?w=256&h=256&fit=crop&crop=faces&q=80',
    description: 'Odontóloga especialista en rehabilitación oral, diseño de sonrisa no invasivo, profilaxis con ultrasonido, blanqueamiento dental de última generación y ortodoncia invisible.',
    city: 'Pereira',
    isDelivery: false,
    isFeatured: true,
    yearsOfExperience: 10,
    responseTime: '< 25 mins',
    priceRange: '$$$ (Premium)',
    services: [
      { id: 's16', name: 'Limpieza profunda con ultrasonido y pulido', priceEstimate: '$85.000 COP', duration: '45 mins' },
      { id: 's17', name: 'Blanqueamiento dental LED en consultorio', priceEstimate: '$220.000 COP', duration: '1.5 hrs' },
      { id: 's18', name: 'Valoración diagnóstica con cámara intraoral', priceEstimate: '$40.000 COP', duration: '30 mins' }
    ],
    reviews: [
      { id: 'r9', author: 'Guillermo Paz', rating: 5, date: 'Hace 6 días', comment: 'El consultorio es modernísimo y la doctora tiene una mano maravillosa. Cero dolor.', verifiedBooking: true }
    ]
  },
  {
    id: 'p6',
    name: 'Andrea Luna Spa',
    businessName: 'Luna & Glow Estética',
    category: 'Belleza',
    rating: 4.9,
    reviewCount: 165,
    tags: ['Belleza', 'Salud', 'Domicilio'],
    phone: '+573132223344',
    whatsapp: '573132223344',
    address: 'Av. Circunvalar # 8-30, Pereira',
    website: 'https://lunaandglow.co',
    social: '@luna.glow.spa',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces&q=80',
    description: 'Estudio de belleza y bienestar. Tratamientos faciales de hidratación profunda, masajes relajantes y descontracturantes, lifting de pestañas, micropigmentación y manicure spa a domicilio.',
    city: 'Pereira',
    isDelivery: true,
    isFeatured: false,
    yearsOfExperience: 7,
    responseTime: '< 15 mins',
    priceRange: '$$ (Moderado)',
    services: [
      { id: 's19', name: 'Limpieza facial profunda con microdermoabrasión', priceEstimate: '$75.000 COP', duration: '1 hr' },
      { id: 's20', name: 'Masaje relajante con aromaterapia y piedras volcánicas', priceEstimate: '$90.000 COP', duration: '1 hr' },
      { id: 's21', name: 'Lifting de pestañas + laminado de cejas', priceEstimate: '$65.000 COP', duration: '1.2 hrs' }
    ],
    reviews: [
      { id: 'r10', author: 'Paula Andrea Ríos', rating: 5, date: 'Hace 1 semana', comment: 'Una experiencia relajante insuperable en Pereira. Andrea es muy detallista.', verifiedBooking: true }
    ]
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-101',
    providerId: 'p1',
    providerName: 'Juan Pérez (Plomería Pro)',
    providerAvatar: INITIAL_PROVIDERS[0].avatarUrl,
    serviceName: 'Destape de cañerías y tuberías con sonda',
    category: 'Reparaciones',
    date: '2026-08-20',
    time: '10:00 AM',
    status: 'confirmada',
    priceEstimate: '$60.000 COP',
    notes: 'Fuga en el sifón del lavaplatos cocina principal',
    clientName: 'Carlos Correa',
    clientPhone: '+57 300 123 4567',
    clientEmail: 'carloscorreaup@gmail.com',
    address: 'Carrera 15 # 12-45, Barrio Álamos, Pereira',
    createdAt: '2026-08-18'
  },
  {
    id: 'b-102',
    providerId: 'p3',
    providerName: 'TechFix Pereira',
    providerAvatar: INITIAL_PROVIDERS[2].avatarUrl,
    serviceName: 'Mantenimiento preventivo completo',
    category: 'Tecnología',
    date: '2026-08-22',
    time: '03:30 PM',
    status: 'pendiente',
    priceEstimate: '$65.000 COP',
    notes: 'Laptop Lenovo con sobrecalentamiento y ventilador ruidoso',
    clientName: 'Carlos Correa',
    clientPhone: '+57 300 123 4567',
    clientEmail: 'carloscorreaup@gmail.com',
    address: 'Edificio Torres de Álamos Apto 402',
    createdAt: '2026-08-18'
  }
];
