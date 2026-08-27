import React, { useState, useRef } from 'react';
import { X, Star, Sparkles, CheckCircle2, MessageSquare, Send, Camera, Image, Trash2, Link as LinkIcon, UploadCloud } from 'lucide-react';
import { UserSession, Review } from '../types';

interface RatingReviewModalProps {
  currentUser: UserSession;
  target: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    type: 'provider' | 'client' | 'product';
    currentRating?: number;
    reviewCount?: number;
    itemName?: string;
  };
  onClose: () => void;
  onSubmitReview: (review: Review, targetType: 'provider' | 'cliente' | 'producto', targetId: string) => Promise<void>;
}

const RATING_LEVELS = [
  { value: 1, label: 'Pésimo', emoji: '😡', desc: 'Experiencia muy insatisfactoria o deficiente.' },
  { value: 2, label: 'Regular', emoji: '😕', desc: 'Varios aspectos negativos que deben mejorar.' },
  { value: 3, label: 'Aceptable', emoji: '😐', desc: 'Cumplió con lo básico acordado.' },
  { value: 4, label: 'Muy Bueno', emoji: '😊', desc: 'Buen servicio y atención, muy recomendado.' },
  { value: 5, label: '¡Excelente!', emoji: '🤩', desc: 'Calidad superior, puntual y totalmente recomendado.' },
];

export const RatingReviewModal: React.FC<RatingReviewModalProps> = ({
  currentUser,
  target,
  onClose,
  onSubmitReview
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentLevel = RATING_LEVELS.find(r => r.value === (hoverRating || rating)) || RATING_LEVELS[4];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const now = new Date();
      const newReview: Review = {
        id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        author: currentUser.name || 'Usuario NexService',
        authorEmail: currentUser.email,
        authorAvatar: currentUser.avatarUrl,
        rating: rating,
        date: now.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        comment: comment.trim() || `Calificación de ${rating} estrellas otorgada con éxito.`,
        imageUrl: imageUrl.trim() || undefined,
        images: imageUrl.trim() ? [imageUrl.trim()] : undefined,
        verifiedBooking: true,
        targetType: target.type === 'provider' ? 'proveedor' : target.type === 'product' ? 'producto' : 'cliente',
        targetId: target.id,
      };

      const mappedTargetType: 'provider' | 'cliente' | 'producto' =
        target.type === 'provider' ? 'provider' : target.type === 'product' ? 'producto' : 'cliente';

      await onSubmitReview(
        newReview,
        mappedTargetType,
        target.id
      );

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTargetTypeLabel = () => {
    if (target.type === 'provider') return 'Proveedor';
    if (target.type === 'product') return 'Producto';
    return 'Cliente';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0052ff] via-blue-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                Calificar {getTargetTypeLabel()}
              </h3>
              <p className="text-sm text-white/80">Comentario con foto o solo texto (1 a 5 ⭐)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-all text-white/90 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">¡Calificación Publicada!</h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Tu valoración de <strong>{rating} estrellas ⭐</strong> {imageUrl ? 'con foto adjunta' : 'en texto'} para <strong className="text-slate-900">{target.name}</strong> ha sido guardada con éxito.
            </p>

            <button
              onClick={onClose}
              className="w-full bg-[#0052ff] hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        ) : (
          /* Rating Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Target Profile Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-200 overflow-hidden ring-2 ring-slate-300 flex items-center justify-center text-base font-bold text-slate-700 shrink-0">
                {target.avatarUrl ? (
                  <img src={target.avatarUrl} alt={target.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  target.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#0052ff]">
                  {getTargetTypeLabel()}:
                </div>
                <div className="font-black text-base text-slate-900 truncate">{target.name}</div>
                {target.itemName && (
                  <div className="text-sm text-slate-500 truncate">Por: {target.itemName}</div>
                )}
              </div>
            </div>

            {/* Interactive Stars Selector */}
            <div className="bg-gradient-to-b from-amber-50/70 to-white border border-amber-200/80 rounded-2xl p-3.5 text-center space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Selecciona tu puntuación (1 a 5 estrellas):
              </label>

              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = (hoverRating !== null ? hoverRating : rating) >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(starVal)}
                      className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                      title={`${starVal} de 5 estrellas`}
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-300 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Dynamic feedback label */}
              <div className="pt-0.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-300 rounded-full text-sm font-extrabold text-amber-950 shadow-xs">
                  <span>{currentLevel.emoji}</span>
                  <span>{currentLevel.value} Estrellas • {currentLevel.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{currentLevel.desc}</p>
              </div>
            </div>

            {/* Comment Area (Text Only or with Photo) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-bold text-slate-800">
                  Comentario u opinión:
                </label>
                <span className="text-[10px] text-slate-400">Texto o con foto</span>
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={`Cuenta tu experiencia con ${target.name}: calidad, puntualidad, atención...`}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            {/* Photo / Image Attachment Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                  <Camera className="w-3.5 h-3.5 text-[#0052ff]" />
                  <span>Foto del Servicio o Producto (Opcional)</span>
                </div>
                <span className="text-[10px] text-slate-400">Evidencia real</span>
              </div>

              {imageUrl ? (
                /* Preview Attached Image */
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white p-2 flex items-center gap-3">
                  <img src={imageUrl} alt="Evidencia" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Foto adjunta
                    </span>
                    <p className="text-[10px] text-slate-500 truncate">Se publicará junto a tu reseña</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Upload Buttons */
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#0052ff] rounded-xl text-sm font-bold text-slate-700 hover:text-[#0052ff] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Subir Foto / Captura</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 flex items-center gap-1 transition-all cursor-pointer"
                    title="Pegar enlace de imagen"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Enlace</span>
                  </button>
                </div>
              )}

              {showUrlInput && !imageUrl && (
                <div className="pt-1 flex gap-2">
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/foto.jpg"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-sm text-slate-900 focus:outline-none focus:border-[#0052ff]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="px-2.5 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-xl"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-2.5 bg-[#0052ff] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Publicando...' : 'Publicar Calificación'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

