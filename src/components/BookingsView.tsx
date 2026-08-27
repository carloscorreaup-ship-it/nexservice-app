import React from 'react';
import { Calendar, ShoppingBag, Wrench, MessageSquare, CheckCircle, Clock, AlertCircle, Flag, Star } from 'lucide-react';
import { BookingOrOrder } from '../types';

interface BookingsViewProps {
  bookings: BookingOrOrder[];
  onUpdateBookingStatus: (id: string, status: BookingOrOrder['status']) => void;
  onExploreServices: () => void;
  onOpenWhatsApp: (phone: string, text: string) => void;
  currentCity: string;
  onOpenReportModal?: (target: { id: string; name: string; email: string; avatarUrl?: string; type: 'provider' | 'client' }) => void;
  onOpenRatingModal?: (target: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    type: 'provider' | 'client';
    itemName?: string;
  }) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  onUpdateBookingStatus,
  onExploreServices,
  onOpenWhatsApp,
  currentCity,
  onOpenReportModal,
  onOpenRatingModal,
}) => {
  return (
    <div className="pb-24 max-w-4xl mx-auto px-4 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#141b2b]">Mis Pedidos y Servicios</h1>
          <p className="text-sm text-slate-500">Historial y seguimiento en tiempo real</p>
        </div>
        <button
          onClick={onExploreServices}
          className="bg-[#0052ff] hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
        >
          Explorar Más
        </button>
      </div>

      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <img src={b.providerAvatar} alt={b.providerName} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052ff] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {b.type === 'producto' ? 'Pedido de Producto' : 'Reserva de Servicio'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{b.itemName}</h3>
                  <p className="text-sm text-slate-500">Con: {b.providerName}</p>
                </div>
              </div>

              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border capitalize ${
                b.status === 'confirmada' || b.status === 'completada'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : b.status === 'en_camino'
                  ? 'bg-blue-50 text-[#0052ff] border-blue-200 animate-pulse'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {b.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-sm text-slate-700 mb-3 border border-slate-100">
              <div>
                <span className="text-slate-400 block">Fecha & Hora:</span>
                <strong>{b.date} • {b.time}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Monto Total:</span>
                <strong className="text-emerald-600">{b.totalAmount || 'Por cotizar'}</strong>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 block">Dirección de Entrega:</span>
                <strong className="truncate block">{b.clientAddress}</strong>
              </div>
            </div>

            {b.notes && (
              <p className="text-sm text-slate-500 mb-3 italic">"{b.notes}"</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onOpenWhatsApp(b.clientPhone, `Hola, sobre mi solicitud #${b.id} de "${b.itemName}"...`)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              {onOpenRatingModal && (
                <button
                  type="button"
                  onClick={() => onOpenRatingModal({
                    id: b.providerId,
                    name: b.providerName,
                    avatarUrl: b.providerAvatar,
                    type: 'provider',
                    itemName: b.itemName
                  })}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Calificar este servicio/producto con estrellas (1 a 5)"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Calificar (1-5 ⭐)</span>
                </button>
              )}

              {onOpenReportModal && (
                <button
                  type="button"
                  onClick={() => onOpenReportModal({
                    id: b.providerId,
                    name: b.providerName,
                    email: b.clientEmail || 'soporte@nexservice.app',
                    avatarUrl: b.providerAvatar,
                    type: 'provider'
                  })}
                  className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Denunciar este pedido/servicio ante el Super Administrador"
                >
                  <Flag className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Denunciar</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-slate-400 text-sm">
            Aún no tienes pedidos o servicios agendados.
          </div>
        )}
      </div>
    </div>
  );
};

