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
  Calendar,
  Star,
  Check,
  X,
  Filter,
  UserCheck
} from 'lucide-react';
import { UserSession, Provider, ProductItem, BookingOrOrder, UserReport, ReportResolutionType } from '../types';

interface AdminDashboardViewProps {
  users: UserSession[];
  providers: Provider[];
  products: ProductItem[];
  bookings: BookingOrOrder[];
  reports: UserReport[];
  onToggleUserStatus: (email: string, currentStatus: boolean) => void;
  onDeleteUser: (email: string) => void;
  onToggleProviderVerification?: (providerId: string, currentStatus: boolean) => void;
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
  onDeleteUser,
  onResolveReport,
  onBack,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'reports'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'client' | 'provider'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  // Report resolution form states per report
  const [selectedResolutions, setSelectedResolutions] = useState<Record<string, ReportResolutionType>>({});
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [sanctionDaysMap, setSanctionDaysMap] = useState<Record<string, number>>({});
  const [isSubmittingResolution, setIsSubmittingResolution] = useState<Record<string, boolean>>({});
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  const pendingReportsCount = reports.filter(r => r.status === 'pendiente').length;

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.city && u.city.toLowerCase().includes(term)) ||
      (u.phone && u.phone.includes(term)) ||
      (u.fixedLocation?.address && u.fixedLocation.address.toLowerCase().includes(term));

    const matchRole =
      filterRole === 'all' ||
      (filterRole === 'client' && u.role === 'client') ||
      (filterRole === 'provider' && (u.role === 'provider' || u.role === 'both' || u.mode === 'provider'));

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
    const resolution = selectedResolutions[reportId] || 'sancion_temporal';
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
    <div className="min-h-screen pb-28 pt-4 px-3 sm:px-6 max-w-6xl mx-auto font-inter">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer shrink-0"
                title="Volver a la vista anterior"
              >
                <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
                <span className="hidden sm:inline">Volver</span>
              </button>
            )}
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-200 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
                  Super Administrador
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Control Master • NexService App
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Panel de Administración & Usuarios
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Activación, desactivación y moderación oficial de cuentas de usuarios y proveedores
              </p>
            </div>
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Usuarios Totales</span>
              <Users className="w-4 h-4 text-[#0052ff]" />
            </div>
            <div className="text-2xl font-black text-slate-900">{users.length}</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">
              {activeUsersCount} activos • {suspendedUsersCount} inactivos
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Proveedores</span>
              <Store className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{providers.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {providers.filter(p => p.verified).length} verificados oficiales
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Denuncias & Casos</span>
              <Scale className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{reports.length}</div>
            <div className="text-[11px] text-red-600 font-bold mt-1">
              {pendingReportsCount} en evaluación (5 días)
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Servicios / Pedidos</span>
              <Wrench className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{bookings.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              En base de datos
            </div>
          </div>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-6 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeAdminTab === 'users'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4 text-[#0052ff]" />
            <span>Usuarios & Activación ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('reports')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeAdminTab === 'reports'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Casos & Denuncias</span>
            {pendingReportsCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeAdminTab === 'reports' ? 'bg-white text-red-600' : 'bg-red-600 text-white animate-pulse'
              }`}>
                {pendingReportsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: GESTIÓN DE USUARIOS (ACTIVAR / DESACTIVAR) */}
      {/* ======================================================== */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo, teléfono, ciudad o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-blue-100 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills Grid */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {/* Role filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Rol:
                </span>
                <button
                  onClick={() => setFilterRole('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterRole === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos ({users.length})
                </button>
                <button
                  onClick={() => setFilterRole('client')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterRole === 'client'
                      ? 'bg-[#0052ff] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Clientes
                </button>
                <button
                  onClick={() => setFilterRole('provider')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterRole === 'provider'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Proveedores
                </button>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Estado:
                </span>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === 'active'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Activos ({activeUsersCount})
                </button>
                <button
                  onClick={() => setFilterStatus('suspended')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === 'suspended'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Desactivados ({suspendedUsersCount})
                </button>
              </div>
            </div>
          </div>

          {/* User Cards List */}
          {filteredUsers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-3">
                <UserX className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No se encontraron usuarios</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No hay resultados que coincidan con tu búsqueda o filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u) => {
                const isMe = u.email.toLowerCase() === 'carloscorreaup@gmail.com';
                const userRating = u.rating || 5.0;

                return (
                  <div
                    key={u.email}
                    className={`bg-white border rounded-3xl p-4 sm:p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      !u.isActive
                        ? 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Avatar with Status Dot */}
                      <div className="relative shrink-0">
                        <div className="w-13 h-13 rounded-2xl bg-slate-100 overflow-hidden ring-2 ring-slate-200 flex items-center justify-center text-sm font-bold text-slate-700">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            u.name ? u.name.substring(0, 2).toUpperCase() : 'US'
                          )}
                        </div>
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white ${
                            u.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          title={u.isActive ? 'Usuario Activo' : 'Usuario Desactivado'}
                        />
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-sm sm:text-base text-slate-900 truncate">
                            {u.name || 'Usuario'}
                          </h3>

                          {isMe && (
                            <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2.5 py-0.5 rounded-full border border-red-200">
                              SUPER ADMIN
                            </span>
                          )}

                          {/* Role Badge */}
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                            u.role === 'provider' || u.mode === 'provider'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-[#0052ff] border-blue-200'
                          }`}>
                            {u.role === 'provider' || u.mode === 'provider' ? 'Proveedor' : 'Cliente'}
                          </span>

                          {/* Status Badge */}
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-100 text-rose-700 border-rose-300'
                          }`}>
                            {u.isActive ? '✓ ACTIVO' : '✕ DESACTIVADO'}
                          </span>

                          {/* Warnings badge */}
                          {u.warningsCount !== undefined && u.warningsCount > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-300">
                              ⚠️ {u.warningsCount} Advertencia{u.warningsCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Contact info grid */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <strong className="text-slate-800 truncate">{u.email}</strong>
                          </span>
                          {u.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{u.phone}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#0052ff] shrink-0" />
                            <span>{u.city || 'Pereira'}, Colombia</span>
                          </span>
                        </div>

                        {/* Location and rating row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-400">
                          <span>Dirección: <strong className="text-slate-600">{u.fixedLocation?.address || 'Sin registrar'}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{userRating.toFixed(1)}</span>
                            <span className="text-slate-400 font-normal">({u.reviewCount || 0} reseñas)</span>
                          </span>
                          {u.sanctionUntil && !u.isActive && (
                            <span className="text-rose-600 font-bold">
                              • Suspendido hasta: {u.sanctionUntil}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Activar / Desactivar */}
                    <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                      {!isMe ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onToggleUserStatus(u.email, u.isActive)}
                            className={`w-full md:w-auto px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
                              u.isActive
                                ? 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                            }`}
                            title={u.isActive ? 'Suspender o desactivar cuenta de usuario' : 'Reactivar cuenta de usuario'}
                          >
                            <Power className="w-4 h-4" />
                            <span>{u.isActive ? 'Desactivar Usuario' : 'Activar Usuario'}</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => onDeleteUser(u.email)}
                            className="w-full md:w-auto px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 bg-red-100 hover:bg-red-600 text-red-700 hover:text-white border border-red-300"
                            title="Eliminar usuario permanentemente"
                          >
                            <UserX className="w-4 h-4" />
                            <span className="hidden md:inline">Eliminar</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic px-3 py-1">
                          (Cuenta Master)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: GESTIÓN DE DENUNCIAS (RESOLUCIÓN EN 5 DÍAS HÁBILES) */}
      {/* ======================================================== */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-4">
          {/* Sub-filter bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setReportFilter('pending')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportFilter === 'pending'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pendientes ({pendingReportsCount})
              </button>
              <button
                onClick={() => setReportFilter('resolved')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportFilter === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Resueltos ({reports.filter(r => r.status === 'resuelto').length})
              </button>
              <button
                onClick={() => setReportFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({reports.length})
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              ⚖️ Plazo reglamentario: <strong>5 días hábiles</strong>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No hay casos pendientes</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No existen denuncias pendientes de resolución administrativa en este momento.
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
                          <span>Límite (5 días hábiles): {rep.deadlineDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Parties Comparison Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {/* Reporter */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                          👤 Parte Denunciante
                        </div>
                        <div className="font-bold text-sm text-slate-900">{rep.reporterName}</div>
                        <div className="text-xs text-slate-500 truncate">{rep.reporterEmail}</div>
                      </div>

                      {/* Reported User */}
                      <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-3.5">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 mb-1">
                          🎯 Parte Denunciada ({rep.targetType === 'provider' ? 'Proveedor' : 'Cliente'})
                        </div>
                        <div className="font-bold text-sm text-red-950">{rep.targetName}</div>
                        <div className="text-xs text-red-700 truncate">{rep.targetEmail}</div>
                      </div>
                    </div>

                    {/* Reason & Facts */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Motivo:</span>
                        <span className="bg-red-100 text-red-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                          {rep.reasonLabel}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-900 block mb-1">
                          Hechos Denunciados:
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-3 italic">
                          "{rep.explanation}"
                        </p>
                      </div>

                      {rep.evidenceNotes && (
                        <div className="text-xs text-slate-600 pt-1">
                          <strong>Pruebas / Notas adicionales:</strong> {rep.evidenceNotes}
                        </div>
                      )}
                    </div>

                    {/* RESOLUTION ACTIONS (FOR PENDING) */}
                    {isPending ? (
                      <div className="border-t border-slate-200 pt-4 space-y-3">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Scale className="w-4 h-4 text-red-600" />
                          <span>Decisión del Administrador:</span>
                        </div>

                        {/* 4 Resolution Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedResolutions(prev => ({ ...prev, [rep.id]: 'ban_definitivo' }))}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              currentRes === 'ban_definitivo'
                                ? 'bg-red-600 text-white border-red-700 shadow-sm'
                                : 'bg-slate-50 hover:bg-red-50 text-slate-800 border-slate-200'
                            }`}
                          >
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <Ban className="w-4 h-4" />
                              <span>1. Retirar Definitivamente</span>
                            </div>
                            <p className={`text-[10px] mt-1 ${currentRes === 'ban_definitivo' ? 'text-white/80' : 'text-slate-500'}`}>
                              Expulsión permanente y desactivación de cuenta.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedResolutions(prev => ({ ...prev, [rep.id]: 'sancion_temporal' }))}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              currentRes === 'sancion_temporal'
                                ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                                : 'bg-slate-50 hover:bg-amber-50 text-slate-800 border-slate-200'
                            }`}
                          >
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>2. Sanción Temporal</span>
                            </div>
                            <p className={`text-[10px] mt-1 ${currentRes === 'sancion_temporal' ? 'text-white/80' : 'text-slate-500'}`}>
                              Suspensión por días con reactivación programada.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedResolutions(prev => ({ ...prev, [rep.id]: 'advertencia_denunciante' }))}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              currentRes === 'advertencia_denunciante'
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                                : 'bg-slate-50 hover:bg-indigo-50 text-slate-800 border-slate-200'
                            }`}
                          >
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" />
                              <span>3. Advertencia al Denunciante</span>
                            </div>
                            <p className={`text-[10px] mt-1 ${currentRes === 'advertencia_denunciante' ? 'text-white/80' : 'text-slate-500'}`}>
                              Amonestación si los hechos no ameritan sanción.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedResolutions(prev => ({ ...prev, [rep.id]: 'desestimada_sin_sancion' }))}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              currentRes === 'desestimada_sin_sancion'
                                ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>4. Desestimar Caso</span>
                            </div>
                            <p className={`text-[10px] mt-1 ${currentRes === 'desestimada_sin_sancion' ? 'text-white/80' : 'text-slate-500'}`}>
                              Cierre amistoso y archivo sin sanciones.
                            </p>
                          </button>
                        </div>

                        {/* Suspension Days selector */}
                        {currentRes === 'sancion_temporal' && (
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-amber-900">Duración de la suspensión temporal:</span>
                            <div className="flex items-center gap-1.5">
                              {[7, 15, 30].map(days => (
                                <button
                                  key={days}
                                  type="button"
                                  onClick={() => setSanctionDaysMap(prev => ({ ...prev, [rep.id]: days }))}
                                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
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

                        {/* Notes */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Fundamento Oficial de la Decisión Administrativa:
                          </label>
                          <textarea
                            value={currentNotes}
                            onChange={e => setResolutionNotes(prev => ({ ...prev, [rep.id]: e.target.value }))}
                            placeholder="Escribe la explicación oficial que se notificará a las partes..."
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 resize-none"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleExecuteResolution(rep.id)}
                            disabled={submitting}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                          >
                            <Scale className="w-4 h-4" />
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
    </div>
  );
};
