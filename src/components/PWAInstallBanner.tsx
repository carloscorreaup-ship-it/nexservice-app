import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY_INSTALLED = 'nexservice_pwa_installed';
const STORAGE_KEY_DISMISSED = 'nexservice_pwa_dismissed';

/**
 * Checks whether the app is currently running as an installed PWA (standalone).
 * Works across Chrome, Safari, Edge, and Firefox.
 */
export function isAppInstalledPWA(): boolean {
  // Check display-mode standalone (Chrome, Edge, Firefox)
  const standaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
  // Check iOS Safari standalone flag
  const iosSafariStandalone = (window.navigator as any).standalone === true;
  // Check localStorage marker set after successful install
  const markerInstalled = localStorage.getItem(STORAGE_KEY_INSTALLED) === 'true';

  return standaloneMedia || iosSafariStandalone || markerInstalled;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // 1. Already running as standalone PWA → mark installed, hide everything
    if (isAppInstalledPWA()) {
      setIsInstalled(true);
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      return;
    }

    // 2. User previously dismissed the banner
    if (localStorage.getItem(STORAGE_KEY_DISMISSED) === 'true') {
      setIsDismissed(true);
      return;
    }

    // 3. Listen for beforeinstallprompt (Android / Chromium browsers)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Store globally so ProfileView can also trigger it
      (window as any).__pwaInstallPrompt = e;
    };

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).__pwaInstallPrompt = null;
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Auto-dismiss the banner after 15 seconds so it's not intrusive
    const autoDismissTimer = setTimeout(() => {
      setIsDismissed(true);
      // We don't save to localStorage here so it can show again next time they enter
      // but only once per session basically, or they can manually dismiss to never see it again.
      sessionStorage.setItem('nexservice_pwa_session_dismissed', 'true');
    }, 15000);

    if (sessionStorage.getItem('nexservice_pwa_session_dismissed') === 'true') {
      setIsDismissed(true);
      clearTimeout(autoDismissTimer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(autoDismissTimer);
    };
  }, []);

  /**
   * Single-tap install: triggers the native browser install dialog immediately.
   * No extra modals, no multi-step guides.
   */
  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
        setIsInstalled(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
      }
      // Whether accepted or dismissed, the prompt can only be used once
      setDeferredPrompt(null);
      (window as any).__pwaInstallPrompt = null;
    } catch {
      // Prompt failed silently — browser doesn't support it
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt]);

  /**
   * Dismiss the banner permanently (persisted in localStorage).
   */
  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_DISMISSED, 'true');
    setIsDismissed(true);
  }, []);

  // Don't render if: already installed, already dismissed, or no install prompt available
  if (isInstalled || isDismissed || !deferredPrompt) {
    return (
      <>
        {/* Success toast — show even after banner hides */}
        {showSuccess && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>¡NexService instalada con éxito!</span>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Floating Install Banner */}
      <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-fade-in">
        <div className="bg-[#0f172a]/95 backdrop-blur-md text-white border border-slate-700/80 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-3 ring-1 ring-white/10">
          {/* Logo */}
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

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-sm text-white truncate">Instalar NexService</h4>
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                GRATIS
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              Acceso rápido desde tu pantalla de inicio.
            </p>
          </div>

          {/* Install & Dismiss */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="bg-[#0052ff] hover:bg-blue-600 active:scale-95 text-white font-extrabold text-sm px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60"
            >
              <Download className={`w-3.5 h-3.5 ${isInstalling ? 'animate-bounce' : ''}`} />
              <span>{isInstalling ? 'Instalando...' : 'Instalar'}</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
              title="No volver a mostrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>¡NexService instalada con éxito!</span>
        </div>
      )}
    </>
  );
};

