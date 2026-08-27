import React from 'react';
import { Star, ShieldCheck, MapPin, MessageSquare, Truck, ArrowLeft } from 'lucide-react';
import { ProductItem } from '../types';
import { formatCurrencyCOP } from '../utils/userUtils';

interface ProductCardProps {
  product: ProductItem;
  onViewDetails: (product: ProductItem) => void;
  onContactWhatsApp: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onContactWhatsApp,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl overflow-hidden shadow-elevation-1 hover:shadow-elevation-hover transition-all flex flex-col justify-between group">
      {/* Product Image */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-[#0052ff] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            {product.condition}
          </span>
          {product.deliveryAvailable && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Truck className="w-2.5 h-2.5" /> {product.deliveryFee === 0 ? 'Envío Gratis' : 'Domicilio'}
            </span>
          )}
        </div>

        {product.verifiedSeller && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-emerald-600 p-1.5 rounded-full shadow-md">
            <ShieldCheck className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] text-slate-500 truncate block mb-1">
            Por <strong className="text-slate-800">{product.providerName}</strong>
          </span>

          <h3 
            onClick={() => onViewDetails(product)}
            className="text-base font-bold text-[#141b2b] hover:text-[#0052ff] cursor-pointer line-clamp-2 mb-1.5 transition-colors"
          >
            {product.name}
          </h3>

          <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-3 pt-2 border-t border-slate-100">
            <div>
              <span className="text-base font-extrabold text-[#0052ff]">
                {formatCurrencyCOP(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-slate-400 line-through ml-2">
                  {formatCurrencyCOP(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">
              {product.city}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(product)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2.5 px-3 rounded-2xl transition-all"
            >
              Ver Detalles
            </button>
            <button
              onClick={() => onContactWhatsApp(product)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-2.5 px-3 rounded-2xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

