import React, { useState } from 'react';
import { MessageSquare, Phone, X, Send, ShieldCheck, MapPin } from 'lucide-react';
import { Provider, ProductItem } from '../types';

interface WhatsAppModalProps {
  provider: Provider;
  product?: ProductItem;
  initialMessage?: string;
  onClose: () => void;
  onSendBookingConfirmation?: (provider: Provider, message: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  provider,
  product,
  initialMessage,
  onClose,
  onSendBookingConfirmation,
}) => {
  const defaultMsg = product
    ? `Hola ${provider.name}, te escribo desde NexService.app. Estoy interesado en comprar tu producto "${product.name}" por $${product.price.toLocaleString('es-CO')} COP. ¿Está disponible para entrega en ${provider.city}?`
    : `Hola ${provider.name}, te escribo desde NexService.app. Me interesa cotizar tus servicios de ${provider.businessName} en ${provider.city}. ¿Tienes disponibilidad?`;

  const [message, setMessage] = useState(initialMessage || defaultMsg);

  const cleanPhone = (provider.whatsapp || provider.phone || '573000000000').replace(/\D/g, '');

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
    if (onSendBookingConfirmation) {
      onSendBookingConfirmation(provider, message);
    }
    onClose();
  };

  const handleDirectCall = () => {
    window.location.href = `tel:+${cleanPhone}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={provider.avatarUrl}
              alt={provider.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-base">{provider.name}</h3>
                {provider.verified && (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-xs text-slate-400">{provider.businessName}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="w-3 h-3 text-blue-400" /> {provider.address}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {product && (
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-3 mb-4 flex items-center gap-3">
            <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
              <p className="text-xs text-emerald-400 font-bold">${product.price.toLocaleString('es-CO')} COP</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Mensaje Directo a WhatsApp:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDirectCall}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 flex items-center justify-center transition-all"
            title="Llamada Telefónica Directa"
          >
            <Phone className="w-5 h-5 text-blue-400" />
          </button>
          <button
            onClick={handleOpenWhatsApp}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Abrir Chat en WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
