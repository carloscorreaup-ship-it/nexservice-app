import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare, CheckCircle2, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone PWA
    const isAppStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isAppStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      (window as any).__pwaInstallPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      (window as any).__pwaInstallPrompt = null;
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger Android / Chromium native install dialog
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Show iOS step-by-step helper
      setShowIOSModal(true);
    } else {
      // General instructions modal
      setShowIOSModal(true);
    }
  };

  // If already running standalone or dismissed, do not show banner
  if (isStandalone || dismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom / Banner Prompt */}
      <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-fade-in">
        <div className="bg-[#0f172a]/95 backdrop-blur-md text-white border border-slate-700/80 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-3 ring-1 ring-white/10">
          {/* Logo / Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0052ff] to-[#00d2ff] p-0.5 shrink-0 shadow-md">
            <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="NexService Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Text Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-xs text-white truncate">Instalar NexService</h4>
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                APP LOCAL
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              Instala la app en tu celular sin Play Store.
            </p>
          </div>

          {/* Install & Dismiss Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-[#0052ff] hover:bg-blue-600 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {installedSuccess && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>¡NexService instalada con éxito en tu pantalla de inicio!</span>
        </div>
      )}

      {/* iOS / Safari Step-by-Step Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-slide-up text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 p-1">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Instalar en tu Celular</h3>
                  <p className="text-[11px] text-slate-500">Funciona como App Nativa</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="p-2 bg-blue-100 text-[#0052ff] rounded-xl font-bold">1</div>
                <div>
                  <strong className="block text-slate-900">Toca el botón Compartir</strong>
                  En el menú de tu navegador (Safari / Chrome), pulsa el botón de <strong>Compartir</strong> <Share2 className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" />.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="p-2 bg-blue-100 text-[#0052ff] rounded-xl font-bold">2</div>
                <div>
                  <strong className="block text-slate-900">Selecciona "Agregar a inicio"</strong>
                  Desliza hacia abajo en las opciones y selecciona <PlusSquare className="w-3.5 h-3.5 inline text-emerald-600 mx-0.5" /> <strong>"Agregar al inicio"</strong> o <strong>"Instalar aplicación"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold">3</div>
                <div>
                  <strong className="block text-slate-900">¡Listo!</strong>
                  El ícono oficial de <strong>NexService</strong> aparecerá en la pantalla principal de tu celular con acceso rápido.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-[#0052ff] hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
