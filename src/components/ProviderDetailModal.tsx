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
  ArrowLeft
} from 'lucide-react';
import { Provider, ProductItem, ServiceItem } from '../types';
import { formatCurrencyCOP } from '../utils/userUtils';

interface ProviderDetailModalProps {
  provider: Provider;
  currentCity: string;
  onClose: () => void;
  onContactWhatsApp: (provider: Provider, customMessage?: string) => void;
  onBookService: (service: ServiceItem, date: string, time: string, notes: string) => void;
  onSelectProduct?: (product: ProductItem) => void;
}

export const ProviderDetailModal: React.FC<ProviderDetailModalProps> = ({
  provider,
  currentCity,
  onClose,
  onContactWhatsApp,
  onBookService,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'services' | 'location' | 'reviews'>('catalog');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('10:00 AM');
  const [bookNotes, setBookNotes] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

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
        {/* Banner with Back Button */}
        <div className="relative h-44 sm:h-52 bg-slate-200">
          <img
            src={provider.bannerUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1000&h=400&fit=crop&q=80'}
            alt="Banner"
            className="w-full h-full object-cover"
          />

          <button
            onClick={onClose}
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md text-xs font-bold transition-all z-10"
          >
            <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
            <span>Volver</span>
          </button>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-700 bg-white/90 hover:bg-white rounded-full shadow-md z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute -bottom-8 left-6 flex items-end gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden ring-4 ring-white bg-white shadow-lg">
              <img
                src={provider.avatarUrl}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#141b2b]">{provider.name}</h2>
                {provider.verified && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verificado Oficial
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium">{provider.businessName}</p>
              
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{provider.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({provider.reviewCount} reseñas)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0052ff]" />
                  <span>{provider.address}, {provider.city}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onContactWhatsApp(provider)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Directo</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
            {provider.description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
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
          <div className="flex border-b border-slate-200 text-xs font-semibold mb-5 gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
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
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'services'
                  ? 'border-[#0052ff] text-[#0052ff] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Servicios ({provider.services.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
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
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex gap-3 items-center justify-between"
                    >
                      <img src={prod.images[0]} alt={prod.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-[#0052ff] font-bold uppercase">{prod.condition}</span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{prod.name}</h4>
                        <div className="text-xs font-extrabold text-emerald-600 mt-0.5">
                          {formatCurrencyCOP(prod.price)}
                        </div>
                      </div>
                      <button
                        onClick={() => onContactWhatsApp(provider, `Hola ${provider.name}, deseo comprar el producto "${prod.name}".`)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl text-xs"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl text-slate-500 text-xs">
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
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{srv.name}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
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
                      className="bg-[#0052ff] hover:bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all"
                    >
                      Reservar
                    </button>
                    <button
                      onClick={() => onContactWhatsApp(provider, `Hola ${provider.name}, deseo cotizar el servicio "${srv.name}".`)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl text-xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: LOCATION */}
          {activeTab === 'location' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0052ff]" />
                Dirección Fija Registrada
              </h4>
              <p className="text-xs text-slate-700">{provider.address}, {provider.city}, Colombia</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${provider.coordinates.lat},${provider.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-xs font-bold text-[#0052ff] hover:underline"
              >
                Ver ruta en Google Maps →
              </a>
            </div>
          )}
        </div>

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

              <div className="space-y-3 text-xs">
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
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 bg-[#0052ff] hover:bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/20"
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
