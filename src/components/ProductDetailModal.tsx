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
  onOpenRatingModal?: (target: {
    id: string;
    name: string;
    avatarUrl?: string;
    type: 'product';
    currentRating?: number;
    reviewCount?: number;
  }) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onContactWhatsApp,
  onViewProvider,
  onOpenRatingModal,
}) => {
  const [selectedImg, setSelectedImg] = useState(0);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  const productRating = product.rating || 5.0;
  const productReviewsCount = product.reviewsCount || product.reviews?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl relative">
        {/* Header Image with Back Button */}
        <div className="relative h-64 bg-slate-100">
          <img
            src={product.images[selectedImg] || product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          <button
            onClick={onClose}
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md text-xs font-bold transition-all z-10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
            <span>Volver</span>
          </button>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-700 bg-white/90 hover:bg-white rounded-full shadow-md z-10 cursor-pointer"
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

          <h2 className="text-xl font-bold text-[#141b2b] mb-1">{product.name}</h2>

          {/* Product Star Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{productRating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-400">({productReviewsCount} valoraciones de clientes)</span>
          </div>

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
              className="text-xs text-[#0052ff] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Tienda</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* CUSTOMER REVIEWS & PHOTOS */}
          <div className="border-t border-slate-200 pt-5 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Opiniones y Fotos del Producto</span>
                </h4>
                <p className="text-[11px] text-slate-500">Experiencias reales de compradores</p>
              </div>

              {onOpenRatingModal && (
                <button
                  type="button"
                  onClick={() => onOpenRatingModal({
                    id: product.id,
                    name: product.name,
                    avatarUrl: product.images[0],
                    type: 'product',
                    currentRating: productRating,
                    reviewCount: productReviewsCount
                  })}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Opinar / Subir Foto</span>
                </button>
              )}
            </div>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-3">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0052ff] text-xs font-bold flex items-center justify-center">
                          {rev.author.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                          <span className="text-[10px] text-slate-400 ml-2">{rev.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {/* Attached Photo */}
                    {rev.imageUrl && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewZoomImage(rev.imageUrl || null)}
                          className="group relative rounded-xl overflow-hidden border border-slate-200 max-w-[120px] aspect-square block cursor-pointer"
                        >
                          <img
                            src={rev.imageUrl}
                            alt="Foto adjunta por el cliente"
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
              <div className="text-center py-6 bg-slate-50 rounded-2xl text-slate-500 text-xs">
                Aún no hay comentarios con foto para este producto. ¡Sé el primero en opinar!
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
            <button
              onClick={() => onContactWhatsApp(product)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comprar / Consultar por WhatsApp</span>
            </button>
          </div>
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
      </div>
    </div>
  );
};
