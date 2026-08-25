import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  Camera,
  Crosshair,
  Navigation,
  Sparkles,
  CheckCircle2,
  Store,
  Truck,
  Building2,
  AlertCircle
} from 'lucide-react';
import { UserRole, Coordinates, ServiceModality } from '../types';
import { getEmailAvatarUrl } from '../utils/userUtils';
import { requestUserCoordinates, reverseGeocodeAddress, DEFAULT_COLOMBIA_COORDS } from '../utils/geoUtils';

interface OnboardingScreenProps {
  defaultEmail?: string;
  defaultName?: string;
  defaultAvatarUrl?: string;
  onComplete: (data: {
    email: string;
    name: string;
    phone: string;
    role: UserRole;
    address: string;
    city: string;
    department: string;
    coordinates: Coordinates;
    avatarUrl: string;
    serviceModality: ServiceModality;
  }) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  defaultEmail,
  defaultName,
  defaultAvatarUrl,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(defaultName || '');
  const [email, setEmail] = useState(defaultEmail || '');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('both');
  const [serviceModality, setServiceModality] = useState<ServiceModality>('physical_store');
  const [city, setCity] = useState('Pereira');
  const [department, setDepartment] = useState('Risaralda');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<Coordinates>(DEFAULT_COLOMBIA_COORDS['Pereira'] || { lat: 4.81333, lng: -75.69611 });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'success' | 'denied'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
    if (defaultName) setName(defaultName);
  }, [defaultEmail, defaultName]);

  // Request GPS automatically when landing on Step 3
  useEffect(() => {
    if (step === 3 && gpsStatus === 'idle') {
      triggerGpsDetection();
    }
  }, [step]);

  const triggerGpsDetection = async () => {
    setIsDetectingGps(true);
    setGpsStatus('detecting');

    const detected = await requestUserCoordinates();
    if (detected) {
      setCoords(detected);
      setGpsStatus('success');

      // Reverse geocode to get city, department, and address
      const geoResult = await reverseGeocodeAddress(detected);
      if (geoResult) {
        if (geoResult.city) setCity(geoResult.city);
        if (geoResult.department) setDepartment(geoResult.department);
        if (geoResult.address && !address) setAddress(geoResult.address);
      }
    } else {
      setGpsStatus('denied');
    }
    setIsDetectingGps(false);
  };

  // Automatic Avatar Preview derived from Email, or Google profile picture
  const autoAvatarUrl = defaultAvatarUrl || getEmailAvatarUrl(email, name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      // Step 3 Validation
      if (serviceModality === 'physical_store' && (!address || address.trim().length < 5)) {
        setValidationError('Para la modalidad de Local Físico, es obligatorio ingresar una dirección exacta (ej: Carrera 15 # 12-45).');
        return;
      }

      let finalAddress = address.trim();
      if (serviceModality === 'home_delivery' && !finalAddress) {
        finalAddress = `Servicio a Domicilio (${city}, ${department})`;
      } else if (serviceModality === 'mobile_street' && !finalAddress) {
        finalAddress = `Puesto Ambulante / Móvil (${city})`;
      }

      onComplete({
        email,
        name,
        phone,
        role,
        address: finalAddress,
        city,
        department,
        coordinates: coords,
        avatarUrl: autoAvatarUrl,
        serviceModality,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] bg-pattern text-[#141b2b] flex flex-col justify-center items-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-elevation-1">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-sm shrink-0">
              <img
                src="/logo.png"
                alt="NexService.app"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-tight">
                <h2 className="text-lg font-extrabold text-[#141b2b] font-geist">
                  NexService<span className="text-[#0052ff]">.app</span>
                </h2>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  Paso {step}/3
                </span>
              </div>
              <div className="text-[10px] font-serif italic text-slate-500 font-medium">
                By <span className="text-[#0052ff] font-semibold">Pasiflora Biohacking Pro.</span>
              </div>
            </div>
          </div>

          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full cursor-pointer transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Atrás</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: ACCOUNT & AUTOMATIC EMAIL AVATAR */}
          {step === 1 && (
            <>
              <div>
                <h3 className="text-lg font-bold text-[#141b2b] mb-1 font-geist">Crea tu Perfil</h3>
                <p className="text-xs text-slate-500 mb-3">La foto de perfil se sincroniza automáticamente con tu correo.</p>
              </div>

              {/* Live Avatar Preview */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-[#0052ff] bg-white shadow-sm shrink-0">
                  <img src={autoAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Foto de Perfil Automática</span>
                  <span className="text-[11px] text-emerald-600">Sincronizada con tu correo / Google</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp de Contacto Directo</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-[#141b2b] focus:outline-none focus:border-[#0052ff] font-mono"
                />
              </div>
            </>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 2 && (
            <>
              <div>
                <h3 className="text-lg font-bold text-[#141b2b] mb-1 font-geist">¿Cómo usarás la app?</h3>
                <p className="text-xs text-slate-500 mb-3">Puedes alternar tu modo en cualquier momento.</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div
                  onClick={() => setRole('both')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    role === 'both'
                      ? 'bg-blue-50 border-[#0052ff] text-[#141b2b]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm mb-1 text-[#0052ff]">
                    <span>⭐ Cliente y Proveedor (Recomendado)</span>
                    {role === 'both' && <Check className="w-4 h-4 text-[#0052ff]" />}
                  </div>
                  <p className="text-slate-500">Podrás comprar productos, agendar servicios y también publicar los tuyos.</p>
                </div>

                <div
                  onClick={() => setRole('client')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    role === 'client'
                      ? 'bg-blue-50 border-[#0052ff] text-[#141b2b]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm mb-1 text-slate-900">
                    <span>🛒 Solo Cliente / Comprador</span>
                    {role === 'client' && <Check className="w-4 h-4 text-[#0052ff]" />}
                  </div>
                  <p className="text-slate-500">Buscar y comprar productos o cotizar servicios verificados.</p>
                </div>

                <div
                  onClick={() => setRole('provider')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    role === 'provider'
                      ? 'bg-blue-50 border-[#0052ff] text-[#141b2b]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm mb-1 text-slate-900">
                    <span>💼 Proveedor / Vendedor</span>
                    {role === 'provider' && <Check className="w-4 h-4 text-[#0052ff]" />}
                  </div>
                  <p className="text-slate-500">Publicar productos y ofrecer servicios en tu ciudad.</p>
                </div>
              </div>
            </>
          )}

          {/* STEP 3: MODALITY & LOCATION WITH GPS FOR MAP */}
          {step === 3 && (
            <>
              <div>
                <h3 className="text-lg font-bold text-[#141b2b] mb-1 font-geist">Modalidad y Ubicación</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Indica cómo atiendes a tus clientes y tu punto en el mapa de {city}.
                </p>
              </div>

              {/* OBLIGATORIO: SELECTOR DE MODALIDAD */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Modalidad de Atención <span className="text-red-500">* (Obligatorio)</span>
                </label>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {/* Opción 1: Local Físico */}
                  <div
                    onClick={() => setServiceModality('physical_store')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      serviceModality === 'physical_store'
                        ? 'bg-blue-50/80 border-[#0052ff] shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        serviceModality === 'physical_store' ? 'bg-[#0052ff] text-white' : 'bg-white text-slate-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                        <span>🏢 Local o Dirección Física Fija</span>
                        {serviceModality === 'physical_store' && <Check className="w-4 h-4 text-[#0052ff]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tienes tienda, taller, oficina o consultorio abierto para visitas presenciales.
                      </p>
                    </div>
                  </div>

                  {/* Opción 2: A Domicilio */}
                  <div
                    onClick={() => setServiceModality('home_delivery')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      serviceModality === 'home_delivery'
                        ? 'bg-emerald-50/80 border-emerald-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        serviceModality === 'home_delivery' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                        <span>🛵 Solo a Domicilio</span>
                        {serviceModality === 'home_delivery' && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Sin local físico. Se muestra tu área de cobertura y distancia según tu GPS.
                      </p>
                    </div>
                  </div>

                  {/* Opción 3: Ambulante / Móvil */}
                  <div
                    onClick={() => setServiceModality('mobile_street')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      serviceModality === 'mobile_street'
                        ? 'bg-amber-50/80 border-amber-500 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        serviceModality === 'mobile_street' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600'
                      }`}
                    >
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                        <span>🚐 Ambulante / Móvil</span>
                        {serviceModality === 'mobile_street' && <Check className="w-4 h-4 text-amber-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Food truck, vendedor o técnico móvil. Muestra tu ubicación satelital en vivo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* GPS Detection Status Banner */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  gpsStatus === 'success'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : gpsStatus === 'detecting'
                    ? 'bg-blue-50 border-blue-200 text-blue-950 animate-pulse'
                    : gpsStatus === 'denied'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {gpsStatus === 'detecting' ? (
                      <Crosshair className="w-4 h-4 text-[#0052ff] animate-spin shrink-0" />
                    ) : gpsStatus === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Navigation className="w-4 h-4 text-amber-600 shrink-0" />
                    )}

                    <div className="text-xs truncate">
                      {gpsStatus === 'detecting' && <span className="font-bold">Obteniendo coordenadas GPS...</span>}
                      {gpsStatus === 'success' && (
                        <div>
                          <span className="font-bold text-emerald-800 block">GPS del Celular Activo</span>
                          <span className="text-[10px] text-emerald-600 font-mono">
                            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                          </span>
                        </div>
                      )}
                      {gpsStatus === 'denied' && (
                        <div>
                          <span className="font-bold text-amber-800 block">Permiso de GPS no concedido</span>
                          <span className="text-[10px] text-amber-700">Puedes ingresar tu ciudad manualmente.</span>
                        </div>
                      )}
                      {gpsStatus === 'idle' && <span>Presiona para ubicar tu celular</span>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={triggerGpsDetection}
                    disabled={isDetectingGps}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-[#0052ff] hover:text-[#0052ff] rounded-xl text-[11px] font-bold shadow-xs transition-all cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Crosshair className={`w-3 h-3 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    <span>{gpsStatus === 'success' ? 'Re-detectar' : 'Detectar GPS'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ciudad / Municipio</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              {/* DIRECCIÓN FÍSICA - CONDICIONAL SEGÚN MODALIDAD */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {serviceModality === 'physical_store' ? (
                    <span>
                      Dirección Física del Local / Taller <span className="text-red-500">* (Obligatorio)</span>
                    </span>
                  ) : serviceModality === 'home_delivery' ? (
                    <span>Barrio o Zona Base de Domicilios (Opcional)</span>
                  ) : (
                    <span>Punto de Venta / Zona Ambulante (Opcional)</span>
                  )}
                </label>
                <input
                  type="text"
                  required={serviceModality === 'physical_store'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full border rounded-xl p-3 text-sm text-[#141b2b] focus:outline-none ${
                    serviceModality === 'physical_store'
                      ? 'bg-white border-blue-300 focus:border-[#0052ff] ring-1 ring-blue-100'
                      : 'bg-slate-50 border-slate-200 focus:border-[#0052ff]'
                  }`}
                  placeholder={
                    serviceModality === 'physical_store'
                      ? 'Ej: Carrera 15 # 12-45, Local 102, Barrio Álamos'
                      : serviceModality === 'home_delivery'
                      ? 'Ej: Cobertura en toda la ciudad / Barrio Los Álamos'
                      : 'Ej: Plaza de Bolívar / Parque El Lago'
                  }
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {serviceModality === 'physical_store'
                    ? 'Los clientes podrán ver tu local en el mapa y pedir indicaciones de cómo llegar.'
                    : serviceModality === 'home_delivery'
                    ? 'Tu ubicación en el mapa mostrará que atiendes a domicilio y calculará la distancia hasta el cliente usando el GPS.'
                    : 'Tu ubicación en el mapa se mostrará como puesto ambulante móvil mediante GPS.'}
                </p>
              </div>

              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#0052ff] hover:bg-blue-600 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{step === 3 ? 'Comenzar en NexService' : 'Continuar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
