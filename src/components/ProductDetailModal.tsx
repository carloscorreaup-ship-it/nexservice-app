import React, { useState } from 'react';
import { Star, ShieldCheck, MapPin, Truck, MessageSquare, X, CheckCircle2, ArrowLeft, ChevronRight } from 'lucide-react';
import { ProductItem, Provider } from '../types';
import { formatCurrencyCOP } from '../utils/userUtils';

interface ProductDetailModalProps {
  product: ProductItem;
  provider?: Provider;
  onClose: () => void;
  onContactWhatsApp: (product: ProductItem) => void;
  onViewProvider: (providerId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onContactWhatsApp,
  onViewProvider,
}) => {
  const [selectedImg, setSelectedImg] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header Image with Back Button */}
        <div className="relative h-64 bg-slate-100">
          <img
            src={product.images[selectedImg] || product.images[0]}
            alt={product.name}
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
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0052ff] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {product.condition} • {product.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-[#0052ff]" />
              <span>{product.city}, Colombia</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#141b2b] mb-2">{product.name}</h2>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-extrabold text-[#0052ff]">
              {formatCurrencyCOP(product.price)}
            </span>
            {product.inStock && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 ml-auto">
                <CheckCircle2 className="w-3.5 h-3.5" /> En Stock ({product.stockQuantity || 1} disponibles)
              </span>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-5 text-xs text-slate-700 leading-relaxed">
            <h4 className="font-bold text-slate-900 mb-1">Descripción del Producto</h4>
            <p className="whitespace-pre-line">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Garantía</span>
              <strong className="text-slate-800">{product.warranty || 'Directa con el vendedor'}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-0.5">Entrega</span>
              <strong className="text-slate-800">
                {product.deliveryAvailable ? (product.deliveryFee === 0 ? 'Envío Gratis' : `Domicilio (${formatCurrencyCOP(product.deliveryFee || 0)})`) : 'Retiro en tienda'}
              </strong>
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden">
                <img
                  src={product.providerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces&q=80'}
                  alt={product.providerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-[#141b2b]">{product.providerName}</h4>
                  {product.verifiedSeller && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-xs text-slate-500">{product.providerBusinessName || 'Proveedor Verificado'}</p>
              </div>
            </div>

            <button
              onClick={() => onViewProvider(product.providerId)}
              className="text-xs text-[#0052ff] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Ver Tienda</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
            <button
              onClick={() => onContactWhatsApp(product)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comprar / Consultar por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
