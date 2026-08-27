import React, { useState } from 'react';
import { Flame, Check, X, ShieldAlert, Key, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { getFirebaseConfig, saveCustomFirebaseConfig, clearCustomFirebaseConfig, isFirebaseConnected } from '../services/firebase';
import { FirebaseConfig } from '../types';

interface FirebaseConfigModalProps {
  onClose: () => void;
  onConfigSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ onClose, onConfigSaved }) => {
  const current = getFirebaseConfig();
  const [apiKey, setApiKey] = useState(current?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(current?.authDomain || '');
  const [projectId, setProjectId] = useState(current?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(current?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(current?.messagingSenderId || '');
  const [appId, setAppId] = useState(current?.appId || '');
  const [jsonPaste, setJsonPaste] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handlePasteJson = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonPaste(val);
    try {
      let cleaned = val;
      if (cleaned.includes('firebaseConfig =')) {
        cleaned = cleaned.split('firebaseConfig =')[1];
      }
      if (cleaned.includes(';')) {
        cleaned = cleaned.split(';')[0];
      }
      cleaned = cleaned.trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
      setStatusMessage('Configuracion extraida del JSON correctamente');
    } catch (err) {
      // Typing or not full JSON yet
    }
  };

  const handleSave = () => {
    if (!apiKey || !projectId) {
      setStatusMessage('Por favor completa al menos el API Key y Project ID.');
      return;
    }

    const cfg: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    saveCustomFirebaseConfig(cfg);
    setStatusMessage('Configuracion guardada. Recargando servicio...');
    setTimeout(() => {
      onConfigSaved();
      window.location.reload();
    }, 600);
  };

  const handleReset = () => {
    clearCustomFirebaseConfig();
    setStatusMessage('Configuracion restablecida a modo local/mock.');
    setTimeout(() => {
      onConfigSaved();
      window.location.reload();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Conexion Firebase Firestore
              </h2>
              <p className="text-sm text-slate-400">
                Estado:{' '}
                {isFirebaseConnected ? (
                  <span className="text-emerald-400 font-semibold">Conectado a Firestore</span>
                ) : (
                  <span className="text-amber-400 font-semibold">Modo Local Offline</span>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3.5 mb-4 text-sm text-slate-300 space-y-1.5">
          <p className="font-semibold text-white flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            Como obtener tus claves de Firebase:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Entra a Firebase Console con tu cuenta Google.</li>
            <li>Selecciona tu proyecto nexservice-app.</li>
            <li>En Configuracion del Proyecto, copia las claves web y pegalas abajo.</li>
          </ol>
        </div>

        {/* Fast JSON paste */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            Pegar objeto de configuracion JSON completo (Rapido):
          </label>
          <textarea
            value={jsonPaste}
            onChange={handlePasteJson}
            placeholder='{ "apiKey": "AIzaSy...", "projectId": "nexservice-app" }'
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-emerald-400 font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Individual Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <label className="block text-slate-400 mb-1">API Key</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Project ID</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="nexservice-app"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Auth Domain</label>
            <input
              type="text"
              value={authDomain}
              onChange={(e) => setAuthDomain(e.target.value)}
              placeholder="nexservice-app.firebaseapp.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Storage Bucket</label>
            <input
              type="text"
              value={storageBucket}
              onChange={(e) => setStorageBucket(e.target.value)}
              placeholder="nexservice-app.firebasestorage.app"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Messaging Sender ID</label>
            <input
              type="text"
              value={messagingSenderId}
              onChange={(e) => setMessagingSenderId(e.target.value)}
              placeholder="81611240708"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">App ID</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="1:81611240708:web:..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono"
            />
          </div>
        </div>

        {statusMessage && (
          <div className="p-2.5 mb-4 rounded-xl bg-blue-500/20 border border-blue-500/40 text-sm text-blue-200 text-center font-medium">
            {statusMessage}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restablecer a Modo Local
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" /> Guardar y Conectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

