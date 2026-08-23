import React, { useState } from 'react';
import { X, Star, Sparkles, CheckCircle2, MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { UserSession, Review } from '../types';

interface RatingReviewModalProps {
  currentUser: UserSession;
  target: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    type: 'provider' | 'client';
    currentRating?: number;
    reviewCount?: number;
    itemName?: string;
  };
  onClose: () => void;
  onSubmitReview: (review: Review, targetType: 'provider' | 'cliente', targetId: string) => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentLevel = RATING_LEVELS.find(r => r.value === (hoverRating || rating)) || RATING_LEVELS[4];

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
        verifiedBooking: true,
        targetType: target.type === 'provider' ? 'proveedor' : 'cliente',
        targetId: target.id,
      };

      await onSubmitReview(
        newReview,
        target.type === 'provider' ? 'provider' : 'cliente',
        target.id
      );

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
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
                Calificar a {target.type === 'provider' ? 'Proveedor' : 'Cliente'}
              </h3>
              <p className="text-xs text-white/80">Evaluación de 1 a 5 estrellas</p>
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
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Tu valoración de <strong>{rating} estrellas ⭐</strong> para <strong className="text-slate-900">{target.name}</strong> ha sido registrada y sumada al promedio oficial de reputación.
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
              <div className="w-11 h-11 rounded-xl bg-slate-200 overflow-hidden ring-2 ring-slate-300 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0">
                {target.avatarUrl ? (
                  <img src={target.avatarUrl} alt={target.name} className="w-full h-full object-cover" />
                ) : (
                  target.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#0052ff]">
                  {target.type === 'provider' ? 'Proveedor' : 'Cliente'}:
                </div>
                <div className="font-black text-sm text-slate-900 truncate">{target.name}</div>
                {target.itemName && (
                  <div className="text-xs text-slate-500 truncate">Por: {target.itemName}</div>
                )}
              </div>
            </div>

            {/* Interactive Stars Selector */}
            <div className="bg-gradient-to-b from-amber-50/70 to-white border border-amber-200/80 rounded-2xl p-4 text-center space-y-2">
              <label className="block text-xs font-bold text-slate-700">
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
                        className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
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
              <div className="pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-300 rounded-full text-xs font-extrabold text-amber-950 shadow-xs">
                  <span>{currentLevel.emoji}</span>
                  <span>{currentLevel.value} Estrellas • {currentLevel.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{currentLevel.desc}</p>
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Comentario u opinión sobre la experiencia (opcional):
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={`Cuenta tu experiencia con ${target.name}: puntualidad, amabilidad, calidad...`}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-2.5 bg-[#0052ff] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
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
