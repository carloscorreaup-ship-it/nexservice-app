import React, { useState } from 'react';
import { Provider, ServiceItem } from '../types';

interface ProviderDetailModalProps {
  provider: Provider | null;
  onClose: () => void;
  onBookService: (service: ServiceItem, date: string, time: string, notes: string) => void;
  onContactWhatsApp: (provider: Provider, customMsg?: string) => void;
  currentCity: string;
}

export const ProviderDetailModal: React.FC<ProviderDetailModalProps> = ({
  provider,
  onClose,
  onBookService,
  onContactWhatsApp,
  currentCity
}) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-08-20');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'servicios' | 'resenas' | 'info'>('servicios');

  if (!provider) return null;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    onBookService(selectedService, bookingDate, bookingTime, bookingNotes);
    setShowBookingForm(false);
    setSelectedService(null);
  };

  const handleDirectWhatsApp = (serviceName?: string) => {
    const text = serviceName 
      ? `Hola ${provider.name}, vi tu perfil en NexService.app en ${currentCity} y deseo cotizar el servicio de: "${serviceName}". ¿Tienes disponibilidad?`
      : customWhatsAppMsg || `Hola ${provider.name}, vi tu perfil en NexService.app en ${currentCity} y me gustaría consultar información sobre tus servicios.`;
    
    onContactWhatsApp(provider, text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-elevation-hover border border-[#c3c5d9]/30 relative overflow-hidden my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-[#e1e8fd] bg-[#f9f9ff]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0052ff] bg-[#0052ff]/10 px-2.5 py-1 rounded-full">
              Perfil Profesional
            </span>
            <span className="text-xs text-[#737688] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {provider.city}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#737688] hover:text-[#141b2b] hover:bg-[#e1e8fd] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6">
          {/* Provider Bio Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#f1f3ff]/50 p-4 rounded-xl border border-[#e1e8fd]">
            <div className="w-20 h-20 rounded-2xl bg-white overflow-hidden shrink-0 border-2 border-[#0052ff]/20 shadow-xs">
              <img 
                src={provider.avatarUrl} 
                alt={provider.name} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-geist text-xl md:text-2xl font-bold text-[#141b2b]">
                  {provider.name}
                </h3>
                {provider.verified && (
                  <span className="bg-[#0052ff]/10 text-[#0052ff] text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] filled">verified</span>
                    Verificado
                  </span>
                )}
              </div>

              <p className="text-[#434656] font-medium text-sm mt-0.5">
                {provider.businessName} • {provider.category}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#434656]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#bf3003] filled">star</span>
                  <strong className="text-[#141b2b] text-sm">{provider.rating.toFixed(1)}</strong> ({provider.reviewCount} opiniones)
                </span>

                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#0052ff]">timer</span>
                  Responde en {provider.responseTime || '< 20 mins'}
                </span>

                {provider.isDelivery && (
                  <span className="text-[#952200] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    Atención a Domicilio
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#737688] mb-1.5">
              Acerca del Profesional
            </h4>
            <p className="text-sm md:text-base text-[#434656] leading-relaxed">
              {provider.description}
            </p>
          </div>

          {/* Details pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#e1e8fd] text-xs">
              <span className="text-[#737688] block mb-1">Ubicación / Dirección</span>
              <span className="font-semibold text-[#141b2b] flex items-center gap-1 truncate">
                <span className="material-symbols-outlined text-[16px] text-[#0052ff]">pin_drop</span>
                {provider.address || 'Pereira, Colombia'}
              </span>
            </div>

            <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#e1e8fd] text-xs">
              <span className="text-[#737688] block mb-1">WhatsApp de Contacto</span>
              <span className="font-semibold text-[#25D366] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">call</span>
                +{provider.whatsapp}
              </span>
            </div>

            <div className="bg-[#f9f9ff] p-3 rounded-xl border border-[#e1e8fd] text-xs">
              <span className="text-[#737688] block mb-1">Sitio Web / Red Social</span>
              <span className="font-semibold text-[#0052ff] flex items-center gap-1 truncate">
                <span className="material-symbols-outlined text-[16px]">public</span>
                {provider.social || provider.website?.replace('https://', '') || 'Verificado'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#e1e8fd] gap-4">
            <button
              onClick={() => setActiveTab('servicios')}
              className={`pb-2.5 text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === 'servicios' ? 'text-[#0052ff]' : 'text-[#737688] hover:text-[#141b2b]'
              }`}
            >
              Servicios y Tarifas ({provider.services.length})
              {activeTab === 'servicios' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0052ff]"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('resenas')}
              className={`pb-2.5 text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === 'resenas' ? 'text-[#0052ff]' : 'text-[#737688] hover:text-[#141b2b]'
              }`}
            >
              Opiniones ({provider.reviews.length})
              {activeTab === 'resenas' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0052ff]"></div>
              )}
            </button>
          </div>

          {/* Tab 1: Services List */}
          {activeTab === 'servicios' && (
            <div className="space-y-3">
              {provider.services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white p-3.5 rounded-xl border border-[#e1e8fd] hover:border-[#0052ff] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <h5 className="font-semibold text-sm md:text-base text-[#141b2b]">
                      {service.name}
                    </h5>
                    <div className="flex items-center gap-3 text-xs text-[#737688]">
                      {service.priceEstimate && (
                        <span className="font-bold text-[#003ec7] bg-[#e9edff] px-2 py-0.5 rounded">
                          {service.priceEstimate}
                        </span>
                      )}
                      {service.duration && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {service.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDirectWhatsApp(service.name)}
                      className="bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">chat</span>
                      Cotizar WhatsApp
                    </button>

                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setShowBookingForm(true);
                      }}
                      className="bg-[#0052ff] hover:bg-[#003ec7] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Agendar Cita
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Reviews List */}
          {activeTab === 'resenas' && (
            <div className="space-y-3">
              {provider.reviews.map((rev) => (
                <div key={rev.id} className="bg-[#f9f9ff] p-3.5 rounded-xl border border-[#e1e8fd]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#141b2b]">{rev.author}</span>
                      {rev.verifiedBooking && (
                        <span className="bg-[#0052ff]/10 text-[#0052ff] text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px] filled">check_circle</span>
                          Cliente Verificado
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#737688]">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-1 mb-1 text-[#bf3003]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={`material-symbols-outlined text-[14px] ${i < Math.floor(rev.rating) ? 'filled' : ''}`}
                      >
                        star
                      </span>
                    ))}
                  </div>

                  <p className="text-xs md:text-sm text-[#434656] leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Inline Booking Form Modal */}
          {showBookingForm && selectedService && (
            <form onSubmit={handleBookingSubmit} className="bg-[#e9edff]/40 p-4 rounded-xl border-2 border-[#0052ff] space-y-3 animate-in fade-in duration-150">
              <div className="flex justify-between items-center">
                <h5 className="font-semibold text-sm text-[#003ec7] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">event_available</span>
                  Agendar: {selectedService.name}
                </h5>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="text-xs text-[#737688] hover:text-[#141b2b] cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#434656] mb-1">
                    Fecha deseada
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-white border border-[#c3c5d9] rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#0052ff] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#434656] mb-1">
                    Hora aproximada
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-white border border-[#c3c5d9] rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#0052ff] outline-none"
                  >
                    <option>08:00 AM</option>
                    <option>10:00 AM</option>
                    <option>02:00 PM</option>
                    <option>04:00 PM</option>
                    <option>06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#434656] mb-1">
                  Detalles del problema o requerimiento
                </label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Describe brevemente lo que necesitas para que el profesional prepare materiales..."
                  className="w-full bg-white border border-[#c3c5d9] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#0052ff] outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0052ff] hover:bg-[#003ec7] text-white py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                Confirmar Solicitud de Cita
              </button>
            </form>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 md:px-6 bg-[#f9f9ff] border-t border-[#e1e8fd] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <button
            onClick={() => handleDirectWhatsApp()}
            className="w-full sm:w-auto flex-1 bg-[#25D366] hover:bg-[#20B056] active:scale-[0.98] text-white py-3 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Escribir por WhatsApp</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#c3c5d9] hover:bg-[#f1f3ff] text-[#434656] text-sm font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
