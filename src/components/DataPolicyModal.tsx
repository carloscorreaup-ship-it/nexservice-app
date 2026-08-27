import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Lock } from 'lucide-react';

interface DataPolicyModalProps {
  onClose: () => void;
  onAccept?: () => void;
}

export const DataPolicyModal: React.FC<DataPolicyModalProps> = ({ onClose, onAccept }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0052ff]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 font-geist">
                Autorización de Tratamiento de Datos Personales
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Conforme a la Ley 1581 de 2012 y Decreto 1377 de 2013 • Colombia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Legal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
          
          <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-2.5 text-sm text-blue-900">
            <Lock className="w-4 h-4 text-[#0052ff] shrink-0 mt-0.5" />
            <p>
              <strong>Pasiflora Biohacking Pro.</strong>, como responsable del tratamiento de datos personales, garantiza la seguridad, confidencialidad e integridad de la información que suministras en <strong>NexService.app</strong>.
            </p>
          </div>

          <section className="space-y-2">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#0052ff]" />
              1. Identificación del Responsable del Tratamiento
            </h4>
            <p className="text-slate-600 text-sm">
              <strong>Razón Social / Marca:</strong> Pasiflora Biohacking Pro.<br />
              <strong>Plataforma:</strong> NexService.app<br />
              <strong>Finalidad:</strong> Plataforma tecnológica de geolocalización, catálogo y conexión directa entre clientes y proveedores de productos y servicios.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. Finalidades Autorizadas del Tratamiento
            </h4>
            <p className="text-slate-600 text-sm">
              Al registrarte o iniciar sesión, autorizas de manera previa, libre, expresa e informada a <strong>Pasiflora Biohacking Pro.</strong> el tratamiento de tus datos personales para:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
              <li>Crear, administrar y autenticar tu cuenta de usuario (vía Correo o Google).</li>
              <li>Permitir la publicación de tu catálogo de productos y servicios si actúas como proveedor.</li>
              <li>Visualizar tu ubicación fija en el mapa interactivo para cálculo de distancias y cercanía.</li>
              <li>Facilitar la comunicación directa mediante enlaces de WhatsApp y llamadas telefónicas con los proveedores o clientes.</li>
              <li>Gestionar solicitudes, pedidos, cotizaciones y reservas realizadas dentro de la aplicación.</li>
              <li>Garantizar la seguridad, prevención del fraude y verificación de identidad de los usuarios y proveedores de la red.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-slate-900 text-base">
              3. Derechos del Titular de los Datos (Habeas Data)
            </h4>
            <p className="text-slate-600 text-sm">
              Conforme al Artículo 8 de la Ley 1581 de 2012, tienes derecho a:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
              <li><strong>Conocer, actualizar y rectificar</strong> tus datos personales frente a Pasiflora Biohacking Pro.</li>
              <li><strong>Solicitar prueba</strong> de la autorización otorgada.</li>
              <li><strong>Ser informado</strong> respecto del uso que se le ha dado a tus datos personales.</li>
              <li><strong>Revocar la autorización</strong> y/o solicitar la supresión del dato cuando no se respeten los principios y garantías constitucionales y legales.</li>
              <li>Acceder en forma gratuita a tus datos personales que hayan sido objeto de tratamiento.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-slate-900 text-base">
              4. Canales para Ejercer tus Derechos
            </h4>
            <p className="text-slate-600 text-sm">
              Puedes ejercer tus derechos de consulta, actualización o eliminación de datos en cualquier momento a través del panel de tu perfil en la aplicación o comunicándote al canal de soporte oficial de <strong>Pasiflora Biohacking Pro.</strong>
            </p>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-200/70 font-semibold text-sm transition-all"
          >
            Cerrar
          </button>
          {onAccept && (
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0052ff] hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Acepto los Términos y Autorizo</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

