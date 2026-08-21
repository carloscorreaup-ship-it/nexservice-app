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
  AlertCircle
} from 'lucide-react';
import { Provider, ProductItem, ServiceItem, UserSession } from '../types';
import { formatCurrencyCOP } from '../utils/userUtils';

interface ProviderModeViewProps {
  currentCity: string;
  userSession: UserSession;
  onSaveProviderProfile: (profile: Partial<Provider>) => void;
  onSwitchToClientMode: () => void;
}

export const ProviderModeView: React.FC<ProviderModeViewProps> = ({
  currentCity,
  userSession,
  onSaveProviderProfile,
  onSwitchToClientMode,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'location' | 'verification'>('products');
  
  // Profile state
  const [businessName, setBusinessName] = useState(userSession.providerProfile?.businessName || userSession.name || 'Mi Negocio');
  const [category, setCategory] = useState(userSession.providerProfile?.category || 'reparaciones');
  const [address, setAddress] = useState(userSession.providerProfile?.address || userSession.fixedLocation?.address || 'Calle 14 # 15-20, Pereira');
  const [phone, setPhone] = useState(userSession.providerProfile?.phone || userSession.phone || '+57 300 000 0000');
  const [whatsapp, setWhatsapp] = useState(userSession.providerProfile?.whatsapp || userSession.phone || '573000000000');
  const [description, setDescription] = useState(userSession.providerProfile?.description || 'Ofrecemos los mejores productos y servicios con garantía.');

  // Products state
  const [products, setProducts] = useState<ProductItem[]>(userSession.providerProfile?.products || []);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('tecnologia');
  const [newProdCondition, setNewProdCondition] = useState<'nuevo' | 'usado'>('nuevo');

  // Services state
  const [services, setServices] = useState<ServiceItem[]>(userSession.providerProfile?.services || []);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvDuration, setNewSrvDuration] = useState('1 hr');

  const handleAddProduct = () => {
    if (!newProdName || !newProdPrice) return;
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
      images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=450&fit=crop&q=80'],
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
      isHomeService: true
    };
    const updated = [srv, ...services];
    setServices(updated);
    setShowAddServiceModal(false);
    setNewSrvName('');
    setNewSrvPrice('');
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
            <h3 className="text-base font-bold text-white mb-1">Dirección Fija y Posición en Snap Map</h3>
            <p className="text-xs text-slate-400">
              Permite que los clientes vean tu taller, tienda o consultorio en el mapa de {currentCity}.
            </p>
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
              <label className="block text-slate-300 font-semibold mb-1">Dirección Física Exacta</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
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

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Nuevo Producto para Venta</h3>
            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="block text-slate-400 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ej: Filtro de agua, Memoria RAM..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Precio en Pesos COP ($)</label>
                <input
                  type="number"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  placeholder="85000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Descripción</label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Detalles del producto y garantía..."
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl"
              >
                Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Nuevo Servicio Ofrecido</h3>
            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="block text-slate-400 mb-1">Nombre del Servicio</label>
                <input
                  type="text"
                  value={newSrvName}
                  onChange={(e) => setNewSrvName(e.target.value)}
                  placeholder="Ej: Mantenimiento e instalación..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Precio Estimado en COP ($)</label>
                <input
                  type="number"
                  value={newSrvPrice}
                  onChange={(e) => setNewSrvPrice(e.target.value)}
                  placeholder="60000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Duración Estimada</label>
                <input
                  type="text"
                  value={newSrvDuration}
                  onChange={(e) => setNewSrvDuration(e.target.value)}
                  placeholder="Ej: 1 - 2 hrs"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddService}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-xl"
              >
                Guardar Servicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
