import React, { useState } from 'react';
import { Provider } from '../types';

interface WhatsAppModalProps {
  provider: Provider | null;
  initialMessage?: string;
  onClose: () => void;
  onSendBookingConfirmation?: (provider: Provider, message: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  provider,
  initialMessage,
  onClose,
  onSendBookingConfirmation
}) => {
  if (!provider) return null;

  const defaultText = initialMessage || `Hola ${provider.name}, vi tu perfil en NexService.app y quisiera consultar disponibilidad y cotización para un servicio.`;
  const [message, setMessage] = useState(defaultText);
  const [copied, setCopied] = useState(false);

  const cleanPhone = provider.whatsapp.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  const handleOpenWhatsApp = () => {
    try {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // In case iframe blocks popups
    }
    if (onSendBookingConfirmation) {
      onSendBookingConfirmation(provider, message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-inter">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevation-hover border border-[#c3c5d9]/30 relative overflow-hidden">
        {/* WhatsApp Green Top Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#25D366]"></div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#737688] hover:text-[#141b2b] p-1 rounded-full hover:bg-[#f1f3ff] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4 pt-1">
          <div className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>

          <div>
            <h3 className="font-geist text-lg font-bold text-[#141b2b]">
              Contactar a {provider.name}
            </h3>
            <p className="text-xs text-[#434656]">
              {provider.businessName} • +{provider.whatsapp}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#434656] mb-1.5">
            Mensaje para enviar:
          </label>
          <div className="bg-[#f0fdf4] p-3 rounded-xl border border-[#bbf7d0] text-xs md:text-sm text-[#14532d]">
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-transparent border-none outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleCopy}
            className="flex-1 bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#003ec7] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">
              {copied ? 'done' : 'content_copy'}
            </span>
            {copied ? '¡Copiado!' : 'Copiar texto'}
          </button>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenWhatsApp}
          className="w-full bg-[#25D366] hover:bg-[#20B056] text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>Abrir chat en WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
