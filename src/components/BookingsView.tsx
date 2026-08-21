import React from 'react';
import { Calendar, ShoppingBag, Wrench, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { BookingOrOrder } from '../types';

interface BookingsViewProps {
  bookings: BookingOrOrder[];
  onUpdateBookingStatus: (id: string, status: BookingOrOrder['status']) => void;
  onExploreServices: () => void;
  onOpenWhatsApp: (phone: string, text: string) => void;
  currentCity: string;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  onUpdateBookingStatus,
  onExploreServices,
  onOpenWhatsApp,
  currentCity,
}) => {
  return (
    <div className="pb-24 max-w-4xl mx-auto px-4 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Pedidos y Servicios</h1>
          <p className="text-xs text-slate-400">Historial y seguimiento en tiempo real</p>
        </div>
        <button
          onClick={onExploreServices}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
        >
          Explorar Más
        </button>
      </div>

      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <img src={b.providerAvatar} alt={b.providerName} className="w-12 h-12 rounded-2xl object-cover" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {b.type === 'producto' ? 'Pedido de Producto' : 'Reserva de Servicio'}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">{b.itemName}</h3>
                  <p className="text-xs text-slate-400">Con: {b.providerName}</p>
                </div>
              </div>

              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border capitalize ${
                b.status === 'confirmada' || b.status === 'completada'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : b.status === 'en_camino'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {b.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-800/50 p-3 rounded-2xl text-xs text-slate-300 mb-3">
              <div>
                <span className="text-slate-500 block">Fecha & Hora:</span>
                <strong>{b.date} • {b.time}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Monto Total:</span>
                <strong className="text-emerald-400">{b.totalAmount || 'Por cotizar'}</strong>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 block">Dirección de Entrega:</span>
                <strong className="truncate block">{b.clientAddress}</strong>
              </div>
            </div>

            {b.notes && (
              <p className="text-xs text-slate-400 mb-3 italic">"{b.notes}"</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => onOpenWhatsApp(b.clientPhone, `Hola, sobre mi solicitud #${b.id} de "${b.itemName}"...`)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Contactar por WhatsApp</span>
              </button>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-slate-400 text-xs">
            Aún no tienes pedidos o servicios agendados.
          </div>
        )}
      </div>
    </div>
  );
};
