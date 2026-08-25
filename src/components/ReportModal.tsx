import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle2, Info, Send, Scale } from 'lucide-react';
import { UserReport, ReportReason, UserSession } from '../types';
import { calculateBusinessDaysDeadline } from '../services/firestoreService';

interface ReportModalProps {
  currentUser: UserSession;
  targetUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    type: 'provider' | 'client';
  };
  onClose: () => void;
  onSubmitReport: (report: UserReport) => Promise<void>;
}

const REPORT_REASONS: { value: ReportReason; label: string; icon: string; desc: string }[] = [
  {
    value: 'fraude_estafa',
    label: 'Fraude o Estafa Económica',
    icon: '💸',
    desc: 'Cobros no autorizados, retención de dinero o estafa en pago/servicio.'
  },
  {
    value: 'mal_servicio',
    label: 'Mal Servicio o Incumplimiento Grave',
    icon: '⚠️',
    desc: 'Trabajo deficiente, abandono del servicio o daños graves a propiedad.'
  },
  {
    value: 'incumplimiento',
    label: 'Inasistencia o Cancelación Arbitraria',
    icon: '⏱️',
    desc: 'No se presentó a la cita acordada y no dio explicaciones ni reembolso.'
  },
  {
    value: 'acoso_maltrato',
    label: 'Acoso, Ofensas, Amenazas o Maltrato',
    icon: '🛑',
    desc: 'Trato irrespetuoso, amenazas verbales, acoso u hostigamiento.'
  },
  {
    value: 'producto_defectuoso',
    label: 'Producto Defectuoso, Roto o Falso',
    icon: '📦',
    desc: 'El artículo entregado no coincide con lo ofrecido o está inservible.'
  },
  {
    value: 'suplantacion',
    label: 'Suplantación de Identidad o Perfil Falso',
    icon: '🎭',
    desc: 'El usuario usa datos, fotos o números falsos para engañar.'
  },
  {
    value: 'otro',
    label: 'Otro Motivo Grave',
    icon: '📝',
    desc: 'Cualquier otro hecho grave que vulnere los términos de servicio.'
  }
];

export const ReportModal: React.FC<ReportModalProps> = ({
  currentUser,
  targetUser,
  onClose,
  onSubmitReport
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason>('fraude_estafa');
  const [explanation, setExplanation] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (explanation.trim().length < 15) {
      setErrorMessage('Por favor ingresa una explicación detallada de al menos 15 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const selectedReasonObj = REPORT_REASONS.find(r => r.value === selectedReason);
      const deadline = calculateBusinessDaysDeadline(new Date(), 5);

      const newReport: UserReport = {
        id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        reporterEmail: currentUser.email,
        reporterName: currentUser.name || 'Usuario NexService',
        reporterAvatar: currentUser.avatarUrl,
        targetId: targetUser.id,
        targetEmail: targetUser.email || 'desconocido@nexservice.app',
        targetName: targetUser.name,
        targetAvatar: targetUser.avatarUrl,
        targetType: targetUser.type,
        reason: selectedReason,
        reasonLabel: selectedReasonObj?.label || 'Denuncia General',
        explanation: explanation.trim(),
        evidenceNotes: evidenceNotes.trim() || undefined,
        status: 'pendiente',
        createdAt: new Date().toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        deadlineDate: deadline
      };

      await onSubmitReport(newReport);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Ocurrió un error al enviar la denuncia. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">Radicar Denuncia Formal</h3>
              <p className="text-xs text-white/80">Canal confidencial con el Super Administrador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-all text-white/90 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          /* Confirmation State */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">¡Denuncia Radicada con Éxito!</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Tu reporte contra <strong className="text-slate-900">{targetUser.name}</strong> ha sido enviado de forma confidencial al Administrador.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left text-xs text-blue-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#0052ff]">
                <Scale className="w-4 h-4" />
                <span>Plazo de Evaluación Oficial</span>
              </div>
              <p>
                El Administrador evaluará los hechos en un plazo de <strong>5 días hábiles</strong>. El usuario denunciado recibirá una notificación del caso en curso para garantizar el debido proceso.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#0052ff] hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Entendido y Cerrar
            </button>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Target User Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-200 overflow-hidden ring-2 ring-slate-300 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0">
                {targetUser.avatarUrl ? (
                  <img src={targetUser.avatarUrl} alt={targetUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  targetUser.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600">
                  Denunciando a {targetUser.type === 'provider' ? 'Proveedor' : 'Cliente'}:
                </div>
                <div className="font-black text-sm text-slate-900 truncate">{targetUser.name}</div>
                <div className="text-xs text-slate-500 truncate">{targetUser.email}</div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Motivo Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                1. Selecciona el motivo principal de la denuncia: *
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {REPORT_REASONS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedReason(r.value)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedReason === r.value
                        ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-400 text-rose-950 font-bold'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-base shrink-0">{r.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal truncate">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Explicación de los Hechos */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  2. Explicación detallada de los hechos: *
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {explanation.length}/15 mín.
                </span>
              </div>
              <textarea
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="Describe con claridad lo sucedido: fechas, acuerdos incumplidos, montos o situaciones ocurridas..."
                rows={3}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none"
              />
            </div>

            {/* Pruebas / Teléfono de Contacto */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                3. Pruebas o notas adicionales (opcional):
              </label>
              <input
                type="text"
                value={evidenceNotes}
                onChange={e => setEvidenceNotes(e.target.value)}
                placeholder="Ej: Tengo capturas de chat en WhatsApp, recibo de transferencia..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-[11px] text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Términos del Debido Proceso (5 Días Hábiles):</span>
              </div>
              <p className="leading-tight text-slate-700">
                El Administrador evaluará el caso y podrá: <strong>retirar definitivamente al usuario</strong>, <strong>sancionarlo temporalmente</strong>, o <strong>emitir una advertencia a quien denuncia</strong> en caso de ser una denuncia infundada o falsa.
              </p>
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
                disabled={loading || explanation.trim().length < 15}
                className="flex-2 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Radicando...' : 'Radicar Denuncia al Admin'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
