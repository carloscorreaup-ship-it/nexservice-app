import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  MapPin,
  MessageSquare,
  X,
  ShoppingBag,
  Wrench,
  Calendar,
  Clock,
  CheckCircle2,
  FileCheck,
  ArrowLeft,
  Flag,
  Edit
} from 'lucide-react';
import { Provider, ProductItem, ServiceItem } from '../types';
import { formatCurrencyCOP, getCategoryName, getCategoryEmoji } from '../utils/userUtils';

interface ProviderDetailModalProps {
  provider: Provider;
  currentCity: string;
  onClose: () => void;
  onContactWhatsApp: (provider: Provider, customMessage?: string) => void;
  onBookService: (service: ServiceItem, date: string, time: string, notes: string) => void;
  onSelectProduct?: (product: ProductItem) => void;
  onEditProvider?: () => void;
  onOpenReportModal?: (target: { id: string; name: string; email: string; avatarUrl?: string; type: 'provider' | 'client' }) => void;
  onOpenRatingModal?: (target: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    type: 'provider' | 'client';
    currentRating?: number;
    reviewCount?: number;
  }) => void;
}

export const ProviderDetailModal: React.FC<ProviderDetailModalProps> = ({
  provider,
  currentCity,
  onClose,
  onContactWhatsApp,
  onBookService,
  onOpenReportModal,
  onOpenRatingModal,
  onSelectProduct,
  onEditProvider,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'services' | 'location' | 'reviews'>('catalog');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('10:00 AM');
  const [bookNotes, setBookNotes] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  const handleConfirmBooking = () => {
    if (!selectedService || !bookDate) {
      alert('Por favor selecciona la fecha para el servicio.');
      return;
    }
    onBookService(selectedService, bookDate, bookTime, bookNotes);
    setShowBookingForm(false);
    setSelectedService(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col">
        {/* Header without Banner */}
        <div className="relative bg-white pt-6 pb-2 px-6 flex items-center justify-between border-b border-slate-100">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-sm font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
            <span>Volver</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-2 flex justify-center sm:justify-start">
          <div className="w-24 h-24 rounded-3xl overflow-hidden ring-2 ring-[#0052ff]/20 bg-slate-100 shadow-lg">
            <img
              src={provider.avatarUrl}
              alt={provider.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#141b2b]">{provider.name}</h2>
                {provider.verified && (
                  <span className="flex items-center gap-1 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verificado Oficial
                  </span>
                )}
              </div>
              <p className="text-base text-slate-500 font-medium">{provider.businessName}</p>
              
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="flex items-center gap-1 text-amber-500 font-bold hover:underline cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{provider.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({provider.reviewCount} reseñas)</span>
                </button>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0052ff]" />
                  <span>{provider.address}, {provider.city}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <button
                onClick={() => onContactWhatsApp(provider)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Directo</span>
              </button>

              {onEditProvider && (
                <button
                  onClick={onEditProvider}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-slate-800/20 transition-all cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar Perfil</span>
                </button>
              )}

              {onOpenRatingModal && (
                <button
                  type="button"
                  onClick={() => onOpenRatingModal({
                    id: provider.id,
                    name: provider.name,
                    email: provider.email,
                    avatarUrl: provider.avatarUrl,
                    type: 'provider',
                    currentRating: provider.rating,
                    reviewCount: provider.reviewCount
                  })}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-sm font-bold transition-all cursor-pointer shadow-xs"
                  title="Calificar a este proveedor con estrellas"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Calificar (1-5 ⭐)</span>
                </button>
              )}

              {onOpenReportModal && (
                <button
                  type="button"
                  onClick={() => onOpenReportModal({
                    id: provider.id,
                    name: provider.name,
                    email: provider.email || `${provider.id}@nexservice.app`,
                    avatarUrl: provider.avatarUrl,
                    type: 'provider'
                  })}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-bold transition-all cursor-pointer"
                  title="Denunciar este proveedor ante el Super Administrador"
                >
                  <Flag className="w-3.5 h-3.5 text-rose-600" />
                  <span>Denunciar</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
            {provider.description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4 text-sm">
            {/* Categoría General */}
            <span className="bg-blue-50 text-[#0052ff] px-3 py-1 rounded-xl border border-blue-200 flex items-center gap-1.5 font-bold">
              <span>{getCategoryEmoji(provider.category)}</span>
              <span>{getCategoryName(provider.category)}</span>
            </span>

            {provider.serviceModality === 'physical_store' ? (
              <span className="bg-blue-50 text-[#0052ff] px-3 py-1 rounded-xl border border-blue-200 flex items-center gap-1.5 font-bold">
                🏢 Local Físico Abierto al Público
              </span>
            ) : provider.serviceModality === 'mobile_street' ? (
              <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1.5 font-bold">
                🚐 Venta / Servicio Ambulante Móvil
              </span>
            ) : provider.serviceModality === 'home_delivery' ? (
              <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-bold">
                🛵 Atención Exclusiva a Domicilio
              </span>
            ) : null}
            {provider.documentVerified && (
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-[#0052ff]" /> RUT Verificado
              </span>
            )}
            {provider.yearsOfExperience && (
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> {provider.yearsOfExperience} años de experiencia
              </span>
            )}
            {provider.openHours && (
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {provider.openHours}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 text-sm font-semibold mb-5 gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'catalog'
                  ? 'border-[#0052ff] text-[#0052ff] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Catálogo de Productos ({provider.products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'services'
                  ? 'border-[#0052ff] text-[#0052ff] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Servicios ({provider.services.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-[#0052ff] text-[#0052ff] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Reseñas ({provider.reviews?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'location'
                  ? 'border-[#0052ff] text-[#0052ff] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Ubicación Fija</span>
            </button>
          </div>

          {/* TAB 1: PRODUCT CATALOG */}
          {activeTab === 'catalog' && (
            <div>
              {provider.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {provider.products.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct?.(prod)}
                      className={`bg-slate-50 border border-slate-200 rounded-2xl p-3 flex gap-3 items-center justify-between transition-colors ${onSelectProduct ? 'cursor-pointer hover:bg-slate-100 hover:border-slate-300' : ''}`}
                    >
                      <img src={prod.images[0]} alt={prod.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-[#0052ff] font-bold uppercase">{prod.condition}</span>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{prod.name}</h4>
                        <div className="text-sm font-extrabold text-emerald-600 mt-0.5">
                          {formatCurrencyCOP(prod.price)}
                        </div>
                      </div>
                      <button
                        onClick={() => onContactWhatsApp(provider, `Hola ${provider.name}, deseo comprar el producto "${prod.name}".`)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl text-sm cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl text-slate-500 text-sm">
                  Este proveedor se enfoca en servicios profesionales.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-3">
              {provider.services.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{srv.name}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-600">
                        <span className="font-extrabold text-emerald-600">{srv.priceEstimate}</span>
                        {srv.duration && <span>• {srv.duration}</span>}
                        {srv.isHomeService && (
                          <span className="text-[#0052ff] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            A Domicilio
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedService(srv);
                          setShowBookingForm(true);
                        }}
                        className="bg-[#0052ff] hover:bg-blue-600 text-white text-sm font-bold py-2 px-3.5 rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        Reservar Cita
                      </button>
                      <button
                        onClick={() => onContactWhatsApp(provider, `Hola ${provider.name}, deseo cotizar el servicio "${srv.name}".`)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl text-sm cursor-pointer shadow-xs"
                        title="Consultar por WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Up to 10 Service Work Photos */}
                  {srv.images && srv.images.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                        Fotos de trabajos realizados ({srv.images.length} fotos - Toca para ampliar):
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {srv.images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPreviewZoomImage(img)}
                            className="relative group rounded-xl overflow-hidden aspect-square w-16 h-16 shrink-0 border border-slate-300 shadow-xs cursor-pointer"
                          >
                            <img src={img} alt={`Trabajo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity">
                              Ver
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: REVIEWS & 1-5 STARS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {/* Summary card */}
              <div className="bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl sm:text-4xl font-black text-amber-500 flex items-center gap-1 font-geist">
                    <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                    <span>{provider.rating.toFixed(1)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">Promedio de Calificación</div>
                    <div className="text-[11px] text-slate-500">Basado en {provider.reviewCount} calificaciones de clientes</div>
                  </div>
                </div>

                {onOpenRatingModal && (
                  <button
                    type="button"
                    onClick={() => onOpenRatingModal({
                      id: provider.id,
                      name: provider.name,
                      email: provider.email,
                      avatarUrl: provider.avatarUrl,
                      type: 'provider',
                      currentRating: provider.rating,
                      reviewCount: provider.reviewCount
                    })}
                    className="bg-[#0052ff] hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Calificar (1 a 5 ⭐)</span>
                  </button>
                )}
              </div>

              {/* Reviews List */}
              {provider.reviews && provider.reviews.length > 0 ? (
                <div className="space-y-3">
                  {provider.reviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0052ff] text-sm font-bold flex items-center justify-center">
                            {rev.author.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900">{rev.author}</span>
                            <span className="text-[10px] text-slate-400 ml-2">{rev.date}</span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed italic">
                        "{rev.comment}"
                      </p>

                      {/* Attached Photo */}
                      {(rev.imageUrl || (rev.images && rev.images[0])) && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setPreviewZoomImage(rev.imageUrl || (rev.images && rev.images[0]) || null)}
                            className="group relative rounded-xl overflow-hidden border border-slate-200 max-w-[120px] aspect-square block cursor-pointer"
                          >
                            <img
                              src={rev.imageUrl || (rev.images && rev.images[0])}
                              alt="Foto del servicio/trabajo"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                              Ver foto
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl text-slate-500 text-sm">
                  Aún no hay reseñas escritas. ¡Sé el primero en calificar a este proveedor!
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LOCATION */}
          {activeTab === 'location' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0052ff]" />
                Dirección Fija Registrada
              </h4>
              <p className="text-sm text-slate-700">{provider.address}, {provider.city}, Colombia</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${provider.coordinates.lat},${provider.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-sm font-bold text-[#0052ff] hover:underline"
              >
                Ver ruta en Google Maps →
              </a>
            </div>
          )}
        </div>

        {/* IMAGE ZOOM MODAL */}
        {previewZoomImage && (
          <div
            className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewZoomImage(null)}
          >
            <div className="relative max-w-lg max-h-[85vh] rounded-2xl overflow-hidden bg-black shadow-2xl">
              <img src={previewZoomImage} alt="Zoom" className="w-full h-full object-contain max-h-[80vh]" />
              <button
                onClick={() => setPreviewZoomImage(null)}
                className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-slate-900 rounded-full cursor-pointer shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* BOOKING MODAL */}
        {showBookingForm && selectedService && (
          <div className="absolute inset-0 bg-white/95 z-20 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="text-base font-bold text-slate-900">Agendar {selectedService.name}</h3>
                <button onClick={() => setShowBookingForm(false)} className="p-2 text-slate-500 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-slate-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Hora</label>
                  <input
                    type="text"
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Detalles o requerimientos</label>
                  <textarea
                    value={bookNotes}
                    onChange={(e) => setBookNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowBookingForm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 bg-[#0052ff] hover:bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/20"
              >
                Confirmar Solicitud
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

