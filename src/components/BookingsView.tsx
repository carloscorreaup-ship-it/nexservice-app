import React, { useState } from 'react';
import { Booking } from '../types';

interface BookingsViewProps {
  bookings: Booking[];
  onUpdateBookingStatus: (id: string, newStatus: Booking['status']) => void;
  onExploreServices: () => void;
  onOpenWhatsApp: (phone: string, text: string) => void;
  currentCity: string;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  onUpdateBookingStatus,
  onExploreServices,
  onOpenWhatsApp,
  currentCity
}) => {
  const [filter, setFilter] = useState<'todas' | 'pendiente' | 'confirmada' | 'completada'>('todas');

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'todas') return true;
    return b.status === filter;
  });

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 pt-22 pb-24 md:pb-16 font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0052ff] bg-[#0052ff]/10 px-3 py-1 rounded-full mb-1">
            <span className="material-symbols-outlined text-[14px]">event_note</span>
            <span>Gestión de Servicios</span>
          </div>
          <h1 className="font-geist text-2xl md:text-3xl font-bold text-[#141b2b]">
            Mis Solicitudes y Citas
          </h1>
          <p className="text-sm text-[#434656]">
            Historial de servicios contactados y citas agendadas en {currentCity}.
          </p>
        </div>

        <button
          onClick={onExploreServices}
          className="bg-[#0052ff] hover:bg-[#003ec7] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          Buscar más servicios
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#e1e8fd] gap-2 md:gap-4 mb-6 overflow-x-auto pb-1">
        {[
          { id: 'todas', label: `Todas (${bookings.length})` },
          { id: 'confirmada', label: `Confirmadas (${bookings.filter(b => b.status === 'confirmada').length})` },
          { id: 'pendiente', label: `Pendientes (${bookings.filter(b => b.status === 'pendiente').length})` },
          { id: 'completada', label: `Completadas (${bookings.filter(b => b.status === 'completada').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              filter === tab.id
                ? 'bg-[#0052ff] text-white'
                : 'text-[#434656] hover:bg-[#f1f3ff]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 border border-[#e1e8fd] shadow-elevation-1 hover:shadow-elevation-hover transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#f1f3ff] overflow-hidden shrink-0 border border-[#c3c5d9]/60">
                  <img src={b.providerAvatar} alt={b.providerName} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-geist font-bold text-base md:text-lg text-[#141b2b]">
                      {b.serviceName}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                        b.status === 'confirmada'
                          ? 'bg-[#25D366]/15 text-[#0a8039]'
                          : b.status === 'pendiente'
                          ? 'bg-[#bf3003]/10 text-[#bf3003]'
                          : 'bg-[#737688]/15 text-[#434656]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm font-medium text-[#0052ff]">
                    {b.providerName}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#737688]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {b.date} • {b.time}
                    </span>
                    {b.priceEstimate && (
                      <span className="font-bold text-[#141b2b]">
                        Est: {b.priceEstimate}
                      </span>
                    )}
                  </div>

                  {b.notes && (
                    <p className="text-xs text-[#434656] bg-[#f9f9ff] p-2 rounded-lg border border-[#e1e8fd] mt-2">
                      <strong>Nota:</strong> {b.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#f1f3ff]">
                <button
                  onClick={() => onOpenWhatsApp(
                    b.clientPhone, 
                    `Hola, consulto sobre mi servicio agendado de "${b.serviceName}" para la fecha ${b.date}.`
                  )}
                  className="bg-[#25D366] hover:bg-[#20B056] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Chat WhatsApp</span>
                </button>

                {b.status === 'pendiente' && (
                  <button
                    onClick={() => onUpdateBookingStatus(b.id, 'confirmada')}
                    className="bg-[#e9edff] hover:bg-[#0052ff] text-[#003ec7] hover:text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Marcar Confirmada
                  </button>
                )}

                {b.status === 'confirmada' && (
                  <button
                    onClick={() => onUpdateBookingStatus(b.id, 'completada')}
                    className="bg-[#e9edff] hover:bg-[#25D366] text-[#003ec7] hover:text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Marcar Completada
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#e1e8fd] max-w-md mx-auto shadow-elevation-1">
          <div className="w-16 h-16 rounded-full bg-[#f1f3ff] text-[#0052ff] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">event_busy</span>
          </div>
          <h4 className="font-geist text-lg font-bold text-[#141b2b] mb-1">
            No tienes citas en este estado
          </h4>
          <p className="text-xs text-[#737688] mb-5">
            Explora profesionales en Pereira y cotiza servicios con respuesta inmediata por WhatsApp.
          </p>
          <button
            onClick={onExploreServices}
            className="bg-[#0052ff] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#003ec7] transition-colors cursor-pointer"
          >
            Explorar Servicios
          </button>
        </div>
      )}
    </main>
  );
};
