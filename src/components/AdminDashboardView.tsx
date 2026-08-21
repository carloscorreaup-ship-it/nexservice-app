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
  ArrowLeft
} from 'lucide-react';
import { UserSession, Provider, ProductItem, BookingOrOrder } from '../types';

interface AdminDashboardViewProps {
  users: UserSession[];
  providers: Provider[];
  products: ProductItem[];
  bookings: BookingOrOrder[];
  onToggleUserStatus: (email: string, currentStatus: boolean) => void;
  onToggleProviderVerification: (providerId: string, currentStatus: boolean) => void;
  onBack?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  providers,
  products,
  bookings,
  onToggleUserStatus,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'client' | 'provider' | 'both'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

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

  const activeUsersCount = users.filter(u => u.isActive).length;
  const suspendedUsersCount = users.filter(u => !u.isActive).length;

  return (
    <div className="pb-24 max-w-6xl mx-auto px-4 pt-4">
      {/* Top Banner with Back Button */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 mb-6 shadow-elevation-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4 text-[#0052ff]" />
                <span>Volver</span>
              </button>
            )}
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-200">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
                Super Administrador Master
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#141b2b] mt-1 font-geist">Base de Datos de Usuarios</h1>
              <p className="text-xs text-slate-500">Control total para <strong>carloscorreaup@gmail.com</strong></p>
            </div>
          </div>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 text-[#0052ff] text-xs font-semibold mb-1">
              <Users className="w-4 h-4" />
              <span>Total Usuarios</span>
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
            <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span>Productos</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{products.length}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              En venta
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

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 mb-6 space-y-3 shadow-sm">
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
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterRole === 'all' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setFilterRole('client')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterRole === 'client' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setFilterRole('provider')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterRole === 'provider' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Proveedores
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterStatus === 'all' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterStatus === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Activos ({activeUsersCount})
            </button>
            <button
              onClick={() => setFilterStatus('suspended')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
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
                    Dirección fija: {u.fixedLocation?.address || 'Sin registrar'} • Rol: <strong className="capitalize text-slate-700">{u.role}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {!isMe && (
                  <button
                    onClick={() => onToggleUserStatus(u.email, u.isActive)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
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
  );
};
