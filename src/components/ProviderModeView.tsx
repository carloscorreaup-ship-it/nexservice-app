import React, { useState } from 'react';
import {
  Store,
  ShoppingBag,
  Wrench,
  MapPin,
  Plus,
  Trash2,
  Edit,
  Check,
  ShieldCheck,
  Calendar,
  DollarSign,
  Camera,
  AlertCircle,
  Building2,
  Truck,
  Navigation,
  Star,
  UserCheck,
  MessageSquare,
  X
} from 'lucide-react';
import { Provider, ProductItem, ServiceItem, UserSession, ServiceModality, BookingOrOrder } from '../types';
import { formatCurrencyCOP } from '../utils/userUtils';

interface ProviderModeViewProps {
  currentCity: string;
  userSession: UserSession;
  bookings?: BookingOrOrder[];
  onSaveProviderProfile: (profile: Partial<Provider>) => void;
  onSwitchToClientMode: () => void;
  onOpenRatingModal?: (target: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    type: 'provider' | 'client';
    itemName?: string;
  }) => void;
}

export const ProviderModeView: React.FC<ProviderModeViewProps> = ({
  currentCity,
  userSession,
  bookings = [],
  onSaveProviderProfile,
  onSwitchToClientMode,
  onOpenRatingModal,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'location' | 'verification' | 'orders'>('products');
  
  // Profile state
  const [businessName, setBusinessName] = useState(userSession.providerProfile?.businessName || userSession.name || 'Mi Negocio');
  const [category, setCategory] = useState(userSession.providerProfile?.category || 'reparaciones');
  const [serviceModality, setServiceModality] = useState<ServiceModality>(userSession.fixedLocation?.serviceModality || 'physical_store');
  const [address, setAddress] = useState(userSession.providerProfile?.address || userSession.fixedLocation?.address || 'Calle 14 # 15-20, Pereira');
  const [phone, setPhone] = useState(userSession.providerProfile?.phone || userSession.phone || '+57 300 000 0000');
  const [whatsapp, setWhatsapp] = useState(userSession.providerProfile?.whatsapp || userSession.phone || '573000000000');
  const [description, setDescription] = useState(userSession.providerProfile?.description || 'Ofrecemos los mejores productos y servicios con garantía.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Products state
  const [products, setProducts] = useState<ProductItem[]>(userSession.providerProfile?.products || []);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('tecnologia');
  const [newProdCondition, setNewProdCondition] = useState<'nuevo' | 'usado'>('nuevo');
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [newProdImageUrl, setNewProdImageUrl] = useState('');

  // Services state
  const [services, setServices] = useState<ServiceItem[]>(userSession.providerProfile?.services || []);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvDuration, setNewSrvDuration] = useState('1 hr');
  const [newSrvImages, setNewSrvImages] = useState<string[]>([]);
  const [newSrvImageUrl, setNewSrvImageUrl] = useState('');

  const handleProductFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 10 - newProdImages.length;
    if (remainingSlots <= 0) {
      alert('Ya has alcanzado el límite máximo de 10 imágenes por producto.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    filesToProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`La imagen ${file.name} supera los 5MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewProdImages(prev => prev.length < 10 ? [...prev, reader.result as string] : prev);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleServiceFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 10 - newSrvImages.length;
    if (remainingSlots <= 0) {
      alert('Ya has alcanzado el límite máximo de 10 imágenes por servicio.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    filesToProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`La imagen ${file.name} supera los 5MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewSrvImages(prev => prev.length < 10 ? [...prev, reader.result as string] : prev);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddProduct = () => {
    if (!newProdName || !newProdPrice) return;
    const finalImages = newProdImages.length > 0
      ? newProdImages
      : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=450&fit=crop&q=80'];

    const item: ProductItem = {
      id: `prod-${Date.now()}`,
      providerId: userSession.id || 'my-provider-id',
      providerName: userSession.name,
      providerBusinessName: businessName,
      name: newProdName,
      description: newProdDesc,
      price: Number(newProdPrice) || 0,
      category: newProdCategory,
      tags: ['Local', currentCity],
      images: finalImages,
      inStock: true,
      condition: newProdCondition,
      deliveryAvailable: true,
      city: currentCity,
      verifiedSeller: true
    };
    const updated = [item, ...products];
    setProducts(updated);
    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    setNewProdImages([]);
    setNewProdImageUrl('');
    onSaveProviderProfile({ products: updated });
  };

  const handleAddService = () => {
    if (!newSrvName || !newSrvPrice) return;
    const srv: ServiceItem = {
      id: `srv-${Date.now()}`,
      providerId: userSession.id || 'my-provider-id',
      name: newSrvName,
      priceEstimate: `$${Number(newSrvPrice).toLocaleString('es-CO')} COP`,
      duration: newSrvDuration,
      category: category,
      images: newSrvImages.length > 0 ? newSrvImages : undefined,
      isHomeService: true
    };
    const updated = [srv, ...services];
    setServices(updated);
    setShowAddServiceModal(false);
    setNewSrvName('');
    setNewSrvPrice('');
    setNewSrvImages([]);
    setNewSrvImageUrl('');
    onSaveProviderProfile({ services: updated });
  };

  const handleSaveGeneral = () => {
    onSaveProviderProfile({
      businessName,
      category,
      address,
      phone,
      whatsapp,
      description,
      products,
      services,
      city: currentCity,
      verified: true
    });
    alert('¡Perfil de Proveedor / Vendedor actualizado con éxito!');
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 mb-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-2 inline-block">
            Panel de Negocio & Ventas
          </span>
          <h1 className="text-2xl font-bold text-white">Mi Estudio de Proveedor / Vendedor</h1>
          <p className="text-xs text-slate-300 mt-1">
            Administra tu catálogo de productos, lista de servicios, dirección fija para el mapa y pedidos.
          </p>
        </div>

        <button
          onClick={handleSaveGeneral}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Check className="w-4 h-4" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all ${
            activeTab === 'products'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Mis Productos ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all ${
            activeTab === 'services'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Mis Servicios ({services.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all ${
            activeTab === 'location'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Ubicación en Mapa</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Pedidos & Clientes ({bookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all ${
            activeTab === 'verification'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sello Verificado</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Catálogo de Productos en Venta Directa</h2>
              <p className="text-xs text-slate-400">Los clientes podrán verlos y comprarlos directamente por WhatsApp</p>
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Producto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex gap-3 items-center justify-between">
                <img src={p.images[0]} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                  <p className="text-xs text-emerald-400 font-extrabold">{formatCurrencyCOP(p.price)}</p>
                  <span className="text-[10px] text-slate-500 uppercase">{p.condition}</span>
                </div>
                <button
                  onClick={() => {
                    const filtered = products.filter(item => item.id !== p.id);
                    setProducts(filtered);
                    onSaveProviderProfile({ products: filtered });
                  }}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl"
                  title="Eliminar Producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {products.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 text-xs">
                Aún no has publicado ningún producto. Haz clic en "Publicar Producto" para empezar a vender.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE MANAGEMENT */}
      {activeTab === 'services' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Tarifario de Servicios Ofrecidos</h2>
              <p className="text-xs text-slate-400">Define los servicios que tus clientes pueden cotizar o agendar</p>
            </div>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Servicio</span>
            </button>
          </div>

          <div className="space-y-3">
            {services.map((s) => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{s.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="font-extrabold text-emerald-400">{s.priceEstimate}</span>
                    <span>• {s.duration || '1 hr'}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const filtered = services.filter(item => item.id !== s.id);
                    setServices(filtered);
                    onSaveProviderProfile({ services: filtered });
                  }}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl"
                  title="Eliminar Servicio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {services.length === 0 && (
              <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 text-xs">
                No tienes servicios listados. Haz clic en "Añadir Servicio" para comenzar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FIXED LOCATION & VISIBILITY */}
      {activeTab === 'location' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Modalidad de Atención y Posición en el Mapa</h3>
            <p className="text-xs text-slate-400">
              Define si operas con local físico, a domicilio o como vendedor ambulante en {currentCity}.
            </p>
          </div>

          {/* Selector de Modalidad */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2 text-xs">Modalidad de Servicio / Venta</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div
                onClick={() => setServiceModality('physical_store')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  serviceModality === 'physical_store'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>🏢 Local Físico</span>
                </div>
                <p className="text-[10px] text-slate-400">Tienda o taller físico con atención presencial.</p>
              </div>

              <div
                onClick={() => setServiceModality('home_delivery')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  serviceModality === 'home_delivery'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>🛵 A Domicilio</span>
                </div>
                <p className="text-[10px] text-slate-400">Entrega o servicio directo en casa del cliente.</p>
              </div>

              <div
                onClick={() => setServiceModality('mobile_street')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  serviceModality === 'mobile_street'
                    ? 'bg-amber-600/20 border-amber-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>🚐 Ambulante / Móvil</span>
                </div>
                <p className="text-[10px] text-slate-400">Food truck o técnico móvil itinerante.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre Comercial / Local</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {serviceModality === 'physical_store'
                  ? 'Dirección Física Exacta (Obligatorio para local)'
                  : serviceModality === 'home_delivery'
                  ? 'Zona o Barrio Base de Domicilios'
                  : 'Punto o Zona Ambulante'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                placeholder={
                  serviceModality === 'physical_store'
                    ? 'Ej: Carrera 15 # 12-45, Local 102'
                    : 'Ej: Cobertura en toda la ciudad / Zona Álamos'
                }
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">WhatsApp de Ventas Directas</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <button
              onClick={() => {
                onSaveProviderProfile({
                  businessName,
                  address,
                  whatsapp,
                  serviceModality,
                });
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 3000);
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Ubicación y Modalidad</span>
            </button>

            {savedSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-center font-semibold">
                ✓ Ubicación y modalidad actualizadas correctamente.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: VERIFICATION BADGE */}
      {activeTab === 'verification' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sello de Proveedor / Vendedor Verificado</h3>
              <p className="text-xs text-slate-400">Aumenta la confianza y visibilidad en los resultados de búsqueda</p>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-300 mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Tu cuenta cuenta con insignia de verificación oficial activa para operar en {currentCity}.</span>
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS & CLIENT RATINGS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-white">Pedidos y Clientes Atendidos</h2>
              <p className="text-xs text-slate-400">Califica a tus clientes de 1 a 5 estrellas para premiar su puntualidad y trato</p>
            </div>
          </div>

          {bookings && bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((ord) => (
                <div key={ord.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 font-black flex items-center justify-center text-sm shrink-0">
                      {ord.clientName ? ord.clientName.substring(0, 2).toUpperCase() : 'CL'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{ord.clientName || 'Cliente NexService'}</h4>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
                          Cliente
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Solicitó: <strong>{ord.itemName}</strong> • <span className="text-emerald-400">{ord.totalAmount}</span>
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>📅 {ord.date} {ord.time}</span>
                        <span>•</span>
                        <span>📍 {ord.clientAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {onOpenRatingModal && (
                      <button
                        type="button"
                        onClick={() => onOpenRatingModal({
                          id: ord.clientEmail || `client-${ord.id}`,
                          name: ord.clientName || 'Cliente',
                          email: ord.clientEmail,
                          type: 'client',
                          itemName: ord.itemName
                        })}
                        className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                        <span>Calificar Cliente (1-5 ⭐)</span>
                      </button>
                    )}

                    {ord.clientPhone && (
                      <button
                        type="button"
                        onClick={() => window.open(`https://wa.me/${ord.clientPhone.replace(/\D/g, '')}?text=Hola+${encodeURIComponent(ord.clientName || 'estimado cliente')},+te+contacto+sobre+tu+pedido+de+${encodeURIComponent(ord.itemName)}`, '_blank')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-slate-400 text-xs">
              <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              Aún no tienes solicitudes directas registradas. Cuando un cliente te contacte o agende, podrás calificarlo aquí con 1 a 5 estrellas.
            </div>
          )}
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Nuevo Producto para Venta</h3>
                <p className="text-xs text-slate-400">Agrega nombre, precio y hasta 10 fotos reales</p>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs mb-5">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nombre del Producto</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ej: Filtro de agua, Memoria RAM, Celular..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Precio COP ($)</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="85000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Condición</label>
                  <select
                    value={newProdCondition}
                    onChange={(e) => setNewProdCondition(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="usado">Usado (Excelente)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Descripción del Producto</label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Detalles del producto, especificaciones, garantía..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* 10 Images Upload Area */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Fotos del Producto (Hasta 10 imágenes)</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {newProdImages.length}/10 fotos
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Sube fotos desde tu galería o cámara. Los clientes podrán hacer clic sobre ellas y ampliarlas.
                </p>

                {/* Upload Buttons */}
                {newProdImages.length < 10 && (
                  <div className="flex gap-2">
                    <label className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-600/20">
                      <Camera className="w-4 h-4" />
                      <span>Subir Fotos de Galería / Cámara</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleProductFilesUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Images Preview Grid */}
                {newProdImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {newProdImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-600 bg-slate-950">
                        <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-black px-1 rounded-sm shadow-xs">
                            PORTADA
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setNewProdImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Guardar Producto ({newProdImages.length || 1} fotos)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Nuevo Servicio Ofrecido</h3>
                <p className="text-xs text-slate-400">Agrega detalles y fotos de trabajos realizados</p>
              </div>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs mb-5">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nombre del Servicio</label>
                <input
                  type="text"
                  value={newSrvName}
                  onChange={(e) => setNewSrvName(e.target.value)}
                  placeholder="Ej: Mantenimiento, Instalación, Asesoría..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Precio Estimado ($ COP)</label>
                  <input
                    type="number"
                    value={newSrvPrice}
                    onChange={(e) => setNewSrvPrice(e.target.value)}
                    placeholder="60000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Duración Estimada</label>
                  <input
                    type="text"
                    value={newSrvDuration}
                    onChange={(e) => setNewSrvDuration(e.target.value)}
                    placeholder="Ej: 1 - 2 hrs"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 10 Images Upload Area for Services */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Camera className="w-4 h-4 text-blue-400" />
                    <span>Fotos de Trabajos Realizados (Hasta 10 imágenes)</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-500/30">
                    {newSrvImages.length}/10 fotos
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Muestra fotos de calidad de tus proyectos, herramientas o resultados para dar confianza a tus clientes.
                </p>

                {/* Upload Button */}
                {newSrvImages.length < 10 && (
                  <div className="flex gap-2">
                    <label className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-600/20">
                      <Camera className="w-4 h-4" />
                      <span>Subir Fotos de Trabajos / Proyectos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleServiceFilesUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Service Images Preview Grid */}
                {newSrvImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {newSrvImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-600 bg-slate-950">
                        <img src={img} alt={`Trabajo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewSrvImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddService}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Guardar Servicio ({newSrvImages.length} fotos)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
