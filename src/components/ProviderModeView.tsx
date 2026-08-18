import React, { useState, useEffect } from 'react';
import { Provider, ServiceItem } from '../types';
import { classifyTextToCategory, CATEGORY_KNOWLEDGE } from '../utils/serviceClassifier';

interface ProviderModeViewProps {
  currentCity: string;
  onSaveProviderProfile: (profile: Partial<Provider>) => void;
  existingProfile?: Partial<Provider>;
  onSwitchToClientMode: () => void;
}

export const ProviderModeView: React.FC<ProviderModeViewProps> = ({
  currentCity,
  onSaveProviderProfile,
  existingProfile,
  onSwitchToClientMode
}) => {
  const [businessName, setBusinessName] = useState(existingProfile?.businessName || existingProfile?.name || '');
  const [ownerName, setOwnerName] = useState(existingProfile?.name || '');
  const [whatsapp, setWhatsapp] = useState(existingProfile?.whatsapp?.replace('57', '') || '');
  const [category, setCategory] = useState(existingProfile?.category || 'Reparaciones');
  const [address, setAddress] = useState(existingProfile?.address || '');
  const [website, setWebsite] = useState(existingProfile?.website || '');
  const [social, setSocial] = useState(existingProfile?.social || '');
  const [description, setDescription] = useState(
    existingProfile?.description || 
    'Ofrezco servicios profesionales de alta calidad y puntualidad garantizada con cotización previa inmediata por WhatsApp.'
  );
  const [isDelivery, setIsDelivery] = useState(existingProfile?.isDelivery ?? true);
  const [isPublished, setIsPublished] = useState(!!existingProfile?.businessName);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [autoCategoryNotice, setAutoCategoryNotice] = useState<string | null>(null);

  // Auto classification effect based on text inputs (e.g. "organizo neveras" or "baño de gatos")
  useEffect(() => {
    const textToAnalyze = `${businessName} ${newServiceName} ${description}`;
    const detected = classifyTextToCategory(textToAnalyze);
    if (detected && detected.name !== category) {
      setCategory(detected.name);
      setAutoCategoryNotice(`Clasificado automáticamente en la categoría "${detected.name}"`);
    }
  }, [businessName, description]);

  // Example services list
  const [services, setServices] = useState<ServiceItem[]>(
    existingProfile?.services || [
      { id: 's-custom-1', name: 'Diagnóstico o visita de valoración', priceEstimate: '$30.000 COP', duration: '45 mins' },
      { id: 's-custom-2', name: 'Servicio general estándar', priceEstimate: '$65.000 COP', duration: '1 - 2 hrs' }
    ]
  );
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    setServices([
      ...services,
      {
        id: `s-${Date.now()}`,
        name: newServiceName.trim(),
        priceEstimate: newServicePrice.trim() || 'A convenir',
        duration: '1 hr'
      }
    ]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !whatsapp.trim()) return;

    const formattedWhatsapp = whatsapp.startsWith('57') ? whatsapp : `57${whatsapp.replace(/\D/g, '')}`;

    const profileData: Partial<Provider> = {
      name: ownerName.trim() || businessName.trim(),
      businessName: businessName.trim(),
      category,
      whatsapp: formattedWhatsapp,
      phone: `+${formattedWhatsapp}`,
      address: address.trim() || `${currentCity}, Colombia`,
      website: website.trim(),
      social: social.trim(),
      description: description.trim(),
      city: currentCity,
      isDelivery,
      services,
      verified: true,
      rating: existingProfile?.rating || 5.0,
      reviewCount: existingProfile?.reviewCount || 1,
      tags: [category, isDelivery ? 'Domicilio' : 'Presencial'],
      avatarUrl: existingProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces&q=80'
    };

    onSaveProviderProfile(profileData);
    setIsPublished(true);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  return (
    <main className="flex-grow w-full max-w-4xl mx-auto px-4 md:px-6 pt-22 pb-24 md:pb-16 flex flex-col items-center font-inter">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#003ec7] text-white px-5 py-3.5 rounded-2xl shadow-elevation-hover flex items-center gap-3 border border-[#645efb] animate-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-[#25D366] text-[24px] filled">check_circle</span>
          <div>
            <h5 className="font-semibold text-sm">¡Perfil publicado con éxito!</h5>
            <p className="text-xs text-[#dfe3ff]">Tu servicio ya está visible para clientes en {currentCity}.</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="w-full max-w-2xl mb-8 text-center mt-2">
        <div className="inline-flex items-center justify-center bg-[#0052ff]/10 text-[#0052ff] px-4 py-2 rounded-full mb-3.5 border border-[#0052ff]/20">
          <span className="material-symbols-outlined mr-2 text-[18px]">storefront</span>
          <span className="text-xs font-semibold uppercase tracking-wider">Modo Proveedor Activo</span>
        </div>
        <h1 className="font-geist text-2xl md:text-3xl font-bold text-[#141b2b] mb-2">
          Configura tu Perfil Profesional
        </h1>
        <p className="text-sm md:text-base text-[#434656] leading-relaxed">
          Completa la información para que los clientes en <strong className="text-[#0052ff]">{currentCity}</strong> puedan encontrarte y contactarte fácilmente.
        </p>
      </div>

      {/* Provider Dashboard Preview (If already published) */}
      {isPublished && (
        <div className="w-full max-w-2xl mb-8 bg-[#e9edff]/60 border border-[#0052ff]/30 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#c3c5d9]/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0052ff] filled text-[20px]">verified</span>
              <h3 className="font-geist font-bold text-base text-[#003ec7]">
                Estado de tu Negocio en {currentCity}
              </h3>
            </div>
            <span className="bg-[#25D366]/20 text-[#0a8039] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
              En Línea / Recibiendo Clientes
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-white p-3 rounded-xl border border-[#e1e8fd]">
              <span className="text-[11px] text-[#737688] block">Vistas de perfil</span>
              <strong className="text-lg font-bold text-[#003ec7]">148</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#e1e8fd]">
              <span className="text-[11px] text-[#737688] block">Clics a WhatsApp</span>
              <strong className="text-lg font-bold text-[#25D366]">32</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#e1e8fd]">
              <span className="text-[11px] text-[#737688] block">Calificación</span>
              <strong className="text-lg font-bold text-[#bf3003]">5.0 ★</strong>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSwitchToClientMode}
              className="flex-1 bg-white hover:bg-[#f1f3ff] text-[#003ec7] border border-[#0052ff]/40 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Ver cómo te ven los clientes en el Directorio
            </button>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="w-full max-w-2xl bg-white shadow-elevation-1 rounded-2xl p-6 md:p-8 border border-[#c3c5d9]/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mandatory Section */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0052ff] mb-4 flex items-center border-b border-[#e1e8fd] pb-2.5">
              <span className="material-symbols-outlined mr-2 text-[18px]">info</span>
              Información Obligatoria
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#141b2b] mb-1.5" htmlFor="business_name">
                  Nombre del Negocio / Profesional *
                </label>
                <input 
                  className="w-full bg-[#F3F4F6] border-2 border-transparent rounded-xl py-3 px-3.5 text-[#141b2b] text-sm md:text-base focus:bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/20 transition-all outline-none" 
                  id="business_name" 
                  name="business_name" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej: Juan Pérez Plomería o Multiservicios Express" 
                  required 
                  type="text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#141b2b] mb-1.5" htmlFor="whatsapp">
                  Teléfono WhatsApp para Clientes *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl bg-[#e9edff] text-[#003ec7] font-semibold text-sm border-r border-[#c3c5d9]/40">
                    +57
                  </span>
                  <input 
                    className="w-full bg-[#F3F4F6] border-2 border-transparent rounded-r-xl py-3 px-3.5 text-[#141b2b] text-sm md:text-base focus:bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/20 transition-all outline-none" 
                    id="whatsapp" 
                    name="whatsapp" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="300 000 0000" 
                    required 
                    type="tel"
                  />
                </div>
                <p className="mt-1 text-xs text-[#737688]">
                  Los clientes usarán este número para contactarte de forma directa y solicitar presupuestos.
                </p>
              </div>
            </div>
          </div>

          {/* Optional Section */}
          <div className="pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#434656] mb-4 flex items-center border-b border-[#e1e8fd] pb-2.5">
              <span className="material-symbols-outlined mr-2 text-[18px]">tune</span>
              Información Opcional (Recomendada)
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#141b2b] mb-1.5" htmlFor="category">
                  Categoría Principal
                </label>
                <div className="relative">
                  <select 
                    className="w-full bg-[#F3F4F6] border-2 border-transparent rounded-xl py-3 px-3.5 appearance-none text-[#141b2b] text-sm md:text-base focus:bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/20 transition-all outline-none cursor-pointer" 
                    id="category" 
                    name="category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setAutoCategoryNotice(null);
                    }}
                  >
                    <option value="Reparaciones">Plomería & Reparaciones</option>
                    <option value="Hogar">Hogar & Mantenimiento</option>
                    <option value="Tecnología">Soporte Técnico & Tecnología</option>
                    <option value="Legal">Legal & Asesoría Jurídica</option>
                    <option value="Salud">Salud & Odontología</option>
                    <option value="Belleza">Belleza & Estética</option>
                    <option value="Educación">Educación & Clases</option>
                    <option value="Mascotas">Veterinaria & Mascotas</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#737688]">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>

                {autoCategoryNotice && (
                  <p className="mt-1.5 text-xs text-[#0052ff] font-semibold flex items-center gap-1 animate-in fade-in">
                    <span className="material-symbols-outlined text-[15px] filled">auto_awesome</span>
                    {autoCategoryNotice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#141b2b] mb-1.5" htmlFor="address">
                  Dirección Física o Zona de Cobertura
                </label>
                <input 
                  className="w-full bg-[#F3F4F6] border-2 border-transparent rounded-xl py-3 px-3.5 text-[#141b2b] text-sm md:text-base focus:bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/20 transition-all outline-none" 
                  id="address" 
                  name="address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Calle 14 # 15-20, Centro, Pereira" 
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#141b2b] mb-1.5" htmlFor="website">
                    Link Web (Opcional)
                  </label>
                  <input 
                    className="w-full bg-[#F3F4F6] border-2 border-transparent rounded-xl py-3 px-3.5 text-[#141b2b] text-sm focus:bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/20 transition-all outline-none" 
                    id="website" 
                    name="website" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://tusitio.com" 
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#141b2b] mb-1.5" htmlFor="social">
                    Instagram / Facebook
                  </label>
                  <input 
                    className="w-full bg-[#F3F4F6] border-2 border-transparent rounded-xl py-3 px-3.5 text-[#141b2b] text-sm focus:bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/20 transition-all outline-none" 
                    id="social" 
                    name="social" 
                    value={social}
                    onChange={(e) => setSocial(e.target.value)}
                    placeholder="@tuusuario" 
                    type="text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#141b2b] mb-1.5" htmlFor="desc">
                  Descripción de tus Servicios y Experiencia
                </label>
                <textarea
                  id="desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F3F4F6] border-2 border-transparent rounded-xl py-3 px-3.5 text-[#141b2b] text-sm focus:bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/20 transition-all outline-none"
                  placeholder="Detalla tus especialidades, años en el oficio, garantías ofrecidas..."
                ></textarea>
              </div>

              {/* Service Delivery Checkbox */}
              <div className="flex items-center gap-3 p-3 bg-[#f1f3ff] rounded-xl">
                <input
                  type="checkbox"
                  id="delivery_check"
                  checked={isDelivery}
                  onChange={(e) => setIsDelivery(e.target.checked)}
                  className="w-4 h-4 text-[#0052ff] rounded focus:ring-[#0052ff]"
                />
                <label htmlFor="delivery_check" className="text-xs font-medium text-[#141b2b] cursor-pointer">
                  Presto servicio a domicilio en {currentCity} y municipios aledaños
                </label>
              </div>

              {/* Services & Rates mini builder */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#141b2b] mb-2">
                  Servicios y Tarifas Estimadas
                </label>
                
                <div className="space-y-2 mb-3">
                  {services.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-[#f9f9ff] p-2.5 rounded-lg border border-[#e1e8fd] text-xs">
                      <span className="font-medium text-[#141b2b]">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#003ec7] bg-[#e9edff] px-2 py-0.5 rounded">{s.priceEstimate}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(s.id)}
                          className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nuevo servicio (Ej. Cambio de toma eléctrica)"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="flex-1 bg-[#F3F4F6] border border-[#c3c5d9] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#0052ff] outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Tarifa (Ej. $40.000 COP)"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-32 bg-[#F3F4F6] border border-[#c3c5d9] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#0052ff] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="bg-[#0052ff] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[#003ec7] cursor-pointer shrink-0"
                  >
                    + Agregar
                  </button>
                </div>

                {/* Intelligent Template Suggestions for Active Category */}
                {(() => {
                  const currentKnowledge = CATEGORY_KNOWLEDGE.find(
                    (k) => k.name.toLowerCase() === category.toLowerCase()
                  );
                  if (!currentKnowledge) return null;

                  return (
                    <div className="mt-3 bg-[#e9edff]/50 p-2.5 rounded-xl border border-[#0052ff]/20">
                      <span className="text-[11px] font-bold text-[#003ec7] block mb-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] filled">lightbulb</span>
                        Sugerencias populares para {category}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentKnowledge.suggestedServices.map((tmpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (!services.some(s => s.name === tmpl.name)) {
                                setServices([
                                  ...services,
                                  {
                                    id: `s-${Date.now()}-${idx}`,
                                    name: tmpl.name,
                                    priceEstimate: tmpl.priceEstimate || 'A convenir',
                                    duration: tmpl.duration || '1 hr'
                                  }
                                ]);
                              }
                            }}
                            className="bg-white hover:bg-[#0052ff] text-[#003ec7] hover:text-white border border-[#0052ff]/30 text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left flex items-center gap-1"
                          >
                            <span>+ {tmpl.name}</span>
                            <span className="font-bold opacity-80">({tmpl.priceEstimate})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              className="w-full bg-[#0052ff] hover:bg-[#003ec7] active:scale-[0.99] text-white font-geist font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-sm cursor-pointer" 
              type="submit"
            >
              <span className="material-symbols-outlined text-[20px]">publish</span>
              <span>Publicar mi Servicio en {currentCity}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
