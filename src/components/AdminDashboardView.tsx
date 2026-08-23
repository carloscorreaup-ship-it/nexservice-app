import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Store,
  ShoppingBag,
  Wrench,
  Search,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Power,
  ArrowLeft,
  Scale,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Ban,
  UserX,
  FileText,
  AlertOctagon,
  Calendar
} from 'lucide-react';
import { UserSession, Provider, ProductItem, BookingOrOrder, UserReport, ReportResolutionType } from '../types';

interface AdminDashboardViewProps {
  users: UserSession[];
  providers: Provider[];
  products: ProductItem[];
  bookings: BookingOrOrder[];
  reports: UserReport[];
  onToggleUserStatus: (email: string, currentStatus: boolean) => void;
  onToggleProviderVerification: (providerId: string, currentStatus: boolean) => void;
  onResolveReport: (reportId: string, resolution: ReportResolutionType, notes: string, sanctionDays?: number) => Promise<void>;
  onBack?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  providers,
  products,
  bookings,
  reports = [],
  onToggleUserStatus,
  onResolveReport,
  onBack,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'reports'>('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'client' | 'provider' | 'both'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  // Report resolution form states per report
  const [selectedResolutions, setSelectedResolutions] = useState<Record<string, ReportResolutionType>>({});
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [sanctionDaysMap, setSanctionDaysMap] = useState<Record<string, number>>({});
  const [isSubmittingResolution, setIsSubmittingResolution] = useState<Record<string, boolean>>({});
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  const pendingReportsCount = reports.filter(r => r.status === 'pendiente').length;

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);

    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && u.isActive) ||
      (filterStatus === 'suspended' && !u.isActive);

    return matchSearch && matchRole && matchStatus;
  });

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'pending') return r.status === 'pendiente';
    if (reportFilter === 'resolved') return r.status === 'resuelto';
    return true;
  });

  const activeUsersCount = users.filter(u => u.isActive).length;
  const suspendedUsersCount = users.filter(u => !u.isActive).length;

  const handleExecuteResolution = async (reportId: string) => {
    const resolution = selectedResolutions[reportId] || 'desestimada_sin_sancion';
    const notes = resolutionNotes[reportId]?.trim() || 'Caso evaluado conforme a los términos de servicio de NexService.';
    const sanctionDays = sanctionDaysMap[reportId] || 7;

    setIsSubmittingResolution(prev => ({ ...prev, [reportId]: true }));
    try {
      await onResolveReport(reportId, resolution, notes, sanctionDays);
    } catch (e) {
      console.error('Error resolving report:', e);
    } finally {
      setIsSubmittingResolution(prev => ({ ...prev, [reportId]: false }));
    }
  };

  return (
    <div className="pb-24 max-w-6xl mx-auto px-4 pt-4">
      {/* Top Banner with Back Button */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 mb-6 shadow-elevation-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
                <span>Volver</span>
              </button>
            )}
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-200">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
                  Super Administrador Master
                </span>
                <span className="text-[10px] font-serif italic text-slate-500 hidden sm:inline">
                  NexService.app By <strong className="text-red-600">Pasiflora Biohacking Pro.</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#141b2b] mt-1 font-geist">Panel de Control & Moderación</h1>
              <p className="text-xs text-slate-500">Gestión de usuarios y resolución de denuncias para <strong>carloscorreaup@gmail.com</strong></p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs between Users & Reports */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveAdminTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              activeAdminTab === 'reports'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Casos & Denuncias</span>
            {pendingReportsCount > 0 && (
              <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                {pendingReportsCount} pendientes
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              activeAdminTab === 'users'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Base de Datos de Usuarios ({users.length})</span>
          </button>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 text-red-600 text-xs font-semibold mb-1">
              <Scale className="w-4 h-4" />
              <span>Denuncias Totales</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{reports.length}</div>
            <div className="text-[10px] text-red-600 font-bold mt-0.5">
              {pendingReportsCount} en evaluación (5 días)
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 text-[#0052ff] text-xs font-semibold mb-1">
              <Users className="w-4 h-4" />
              <span>Usuarios Registrados</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{users.length}</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              {activeUsersCount} activos • {suspendedUsersCount} suspendidos
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold mb-1">
              <Store className="w-4 h-4" />
              <span>Proveedores</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{providers.length}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              {providers.filter(p => p.verified).length} verificados
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 text-purple-600 text-xs font-semibold mb-1">
              <Wrench className="w-4 h-4" />
              <span>Pedidos / Citas</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{bookings.length}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              En sistema
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: GESTIÓN DE DENUNCIAS (CASOS EN 5 DÍAS HÁBILES) */}
      {/* ======================================================== */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-4">
          {/* Sub-filter */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReportFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportFilter === 'pending'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pendientes de Evaluación ({pendingReportsCount})
              </button>
              <button
                onClick={() => setReportFilter('resolved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportFilter === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Resueltos ({reports.filter(r => r.status === 'resuelto').length})
              </button>
              <button
                onClick={() => setReportFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({reports.length})
              </button>
            </div>

            <div className="text-xs text-slate-500 hidden md:block">
              ⚖️ Plazo reglamentario de evaluación: <strong>5 días hábiles</strong>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No hay denuncias en esta sección</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                La comunidad está operando con normalidad y sin reclamos pendientes por resolver.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((rep) => {
                const isPending = rep.status === 'pendiente';
                const currentRes = selectedResolutions[rep.id] || 'sancion_temporal';
                const currentNotes = resolutionNotes[rep.id] || '';
                const currentDays = sanctionDaysMap[rep.id] || 7;
                const submitting = isSubmittingResolution[rep.id];

                return (
                  <div
                    key={rep.id}
                    className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all shadow-sm ${
                      isPending ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Radicado #{rep.id.slice(-6)}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Radicado el {rep.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs bg-amber-50 text-amber-900 border border-amber-200 font-bold px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Límite de Evaluación: {rep.deadlineDate}</span>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                          isPending ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isPending ? 'En Evaluación (5 Días)' : 'Resuelto'}
                        </span>
                      </div>
                    </div>

                    {/* Parties Involved */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {/* Denunciante */}
                      <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5">
                        <div className="text-[10px] uppercase font-bold text-[#0052ff] tracking-wider mb-1 flex items-center gap-1">
                          <span>👤 Denunciante:</span>
                        </div>
                        <div className="font-bold text-sm text-slate-900">{rep.reporterName}</div>
                        <div className="text-xs text-slate-600 truncate">{rep.reporterEmail}</div>
                      </div>

                      {/* Denunciado */}
                      <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5">
                        <div className="text-[10px] uppercase font-bold text-rose-600 tracking-wider mb-1 flex items-center gap-1">
                          <span>🚨 Denunciado ({rep.targetType === 'provider' ? 'Proveedor' : 'Cliente'}):</span>
                        </div>
                        <div className="font-bold text-sm text-slate-900">{rep.targetName}</div>
                        <div className="text-xs text-slate-600 truncate">{rep.targetEmail}</div>
                      </div>
                    </div>

                    {/* Facts / Explanation */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-lg">
                          Motivo: {rep.reasonLabel}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-700 mb-1">Explicación de los Hechos:</div>
                      <blockquote className="text-xs text-slate-900 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-200">
                        "{rep.explanation}"
                      </blockquote>
                      {rep.evidenceNotes && (
                        <div className="mt-2 text-xs text-slate-600 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60">
                          <strong>Pruebas / Notas adicionales:</strong> {rep.evidenceNotes}
                        </div>
                      )}
                    </div>

                    {/* Resolution Section */}
                    {isPending ? (
                      <div className="bg-white border-2 border-red-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-red-700 uppercase tracking-wider">
                          <Scale className="w-4 h-4 text-red-600" />
                          <span>Emitir Decisión Oficial del Super Administrador:</span>
                        </div>

                        {/* 4 Decision Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Option 1: Ban Definitivo */}
                          <button
                            type="button"
                            onClick={() => setSelectedResolutions(prev => ({ ...prev, [rep.id]: 'ban_definitivo' }))}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              currentRes === 'ban_definitivo'
                                ? 'bg-red-50 border-red-600 ring-2 ring-red-400 text-red-950 font-bold'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                              <Ban className="w-3.5 h-3.5" />
                              <span>1. Retirar al Usuario Definitivamente</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Expulsión permanente y bloqueo total de la cuenta.
                            </p>
                          </button>

                          {/* Option 2: Sanción Temporal */}
                          <button
                            type="button"
                            onClick={() => setSelectedResolutions(prev => ({ ...prev, [rep.id]: 'sancion_temporal' }))}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              currentRes === 'sancion_temporal'
                                ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-400 text-amber-950 font-bold'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                              <Clock className="w-3.5 h-3.5" />
                              <span>2. Sanción Temporal por Tiempo</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Suspensión temporal por 7, 15 o 30 días.
                            </p>
                          </button>

                          {/* Option 3: Advertencia a quien denuncia */}
                          <button
                            type="button"
                            onClick={() => setSelectedResolutions(prev => ({ ...prev, [rep.id]: 'advertencia_denunciante' }))}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              currentRes === 'advertencia_denunciante'
                                ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-400 text-purple-950 font-bold'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800">
                              <AlertOctagon className="w-3.5 h-3.5" />
                              <span>3. Advertencia a quien denuncia</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Los hechos no ameritan denuncia; se amonesta al denunciante.
                            </p>
                          </button>

                          {/* Option 4: Desestimar sin sanción */}
                          <button
                            type="button"
                            onClick={() => setSelectedResolutions(prev => ({ ...prev, [rep.id]: 'desestimada_sin_sancion' }))}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              currentRes === 'desestimada_sin_sancion'
                                ? 'bg-slate-100 border-slate-600 ring-2 ring-slate-400 text-slate-900 font-bold'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                              <span>4. Desestimar / Archivar sin Sanción</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Cierre amistoso sin amonestaciones.
                            </p>
                          </button>
                        </div>

                        {/* Days selector if temporal */}
                        {currentRes === 'sancion_temporal' && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                            <span className="font-bold text-amber-900">Duración de la suspensión temporal:</span>
                            <div className="flex items-center gap-1.5">
                              {[7, 15, 30].map(days => (
                                <button
                                  key={days}
                                  type="button"
                                  onClick={() => setSanctionDaysMap(prev => ({ ...prev, [rep.id]: days }))}
                                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    currentDays === days
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'bg-white text-amber-900 border border-amber-200'
                                  }`}
                                >
                                  {days} días
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resolution Notes */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Fundamento Oficial de la Decisión Administrativa:
                          </label>
                          <textarea
                            value={currentNotes}
                            onChange={e => setResolutionNotes(prev => ({ ...prev, [rep.id]: e.target.value }))}
                            placeholder="Describe el motivo de la decisión que será notificado a las partes involucradas..."
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 resize-none"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleExecuteResolution(rep.id)}
                            disabled={submitting}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>{submitting ? 'Aplicando Resolución...' : 'Emitir Resolución Oficial'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Resolved view */
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Caso Resuelto Oficialmente ({rep.resolvedAt})</span>
                          </div>
                          <span className="bg-emerald-200 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                            {rep.resolution === 'ban_definitivo' && '🚫 Retiro Definitivo'}
                            {rep.resolution === 'sancion_temporal' && `⏳ Suspensión ${rep.sanctionDays} Días`}
                            {rep.resolution === 'advertencia_denunciante' && '⚠️ Advertencia al Denunciante'}
                            {rep.resolution === 'desestimada_sin_sancion' && '⚖️ Desestimada'}
                          </span>
                        </div>
                        <div className="text-slate-700 mt-1">
                          <strong>Resolución del Admin:</strong> {rep.resolutionNotes || 'Caso archivado conforme a reglamento.'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BASE DE DATOS DE USUARIOS */}
      {/* ======================================================== */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          {/* Filter and Search */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo, teléfono o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#141b2b] placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilterRole('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterRole === 'all' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos ({users.length})
                </button>
                <button
                  onClick={() => setFilterRole('client')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterRole === 'client' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Clientes
                </button>
                <button
                  onClick={() => setFilterRole('provider')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterRole === 'provider' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Proveedores
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterStatus === 'all' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterStatus === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Activos ({activeUsersCount})
                </button>
                <button
                  onClick={() => setFilterStatus('suspended')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterStatus === 'suspended' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Suspendidos ({suspendedUsersCount})
                </button>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.map((u) => {
              const isMe = u.email.toLowerCase() === 'carloscorreaup@gmail.com';

              return (
                <div
                  key={u.email}
                  className={`bg-white border rounded-3xl p-4 sm:p-5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !u.isActive ? 'border-rose-300 bg-rose-50/40 opacity-80' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden ring-2 ring-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        u.name.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900">{u.name}</h3>
                        {isMe && (
                          <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                            SUPER ADMIN
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-100 text-rose-700 border-rose-300'
                        }`}>
                          {u.isActive ? 'ACTIVO' : 'DESACTIVADO / SUSPENDIDO'}
                        </span>
                        {u.warningsCount && u.warningsCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-300">
                            ⚠️ {u.warningsCount} Advertencia{u.warningsCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {u.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#0052ff]" /> {u.city}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1">
                        Dirección: {u.fixedLocation?.address || 'Sin registrar'} • Rol: <strong className="capitalize text-slate-700">{u.role}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isMe && (
                      <button
                        onClick={() => onToggleUserStatus(u.email, u.isActive)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                          u.isActive
                            ? 'bg-rose-100 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{u.isActive ? 'Desactivar Usuario' : 'Activar Usuario'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
