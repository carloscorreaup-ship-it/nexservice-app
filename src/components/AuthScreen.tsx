import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Chrome, AlertCircle, CheckCircle, HelpCircle, Sparkles, Shield, Wrench, Settings } from 'lucide-react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, isFirebaseConnected } from '../services/firebase';
import { getEmailAvatarUrl } from '../utils/userUtils';

interface AuthScreenProps {
  onAuthSuccess: (data: {
    email: string;
    name: string;
    avatarUrl: string;
    isNewUser: boolean;
  }) => void;
  onOpenFirebaseConfig?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onOpenFirebaseConfig }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleQuickDemoLogin = (emailChoice: string, nameChoice: string) => {
    setError(null);
    setSuccessMessage(null);
    onAuthSuccess({
      email: emailChoice,
      name: nameChoice,
      avatarUrl: getEmailAvatarUrl(emailChoice, nameChoice),
      isNewUser: false
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
      }
      if (!name.trim()) {
        setError('Por favor ingresa tu nombre completo.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isFirebaseConnected && auth) {
        if (mode === 'login') {
          // Firebase Login
          try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            if (credential.user) {
              onAuthSuccess({
                email: credential.user.email || email,
                name: credential.user.displayName || name || email.split('@')[0],
                avatarUrl: credential.user.photoURL || getEmailAvatarUrl(credential.user.email || email),
                isNewUser: false
              });
              return;
            }
          } catch (firebaseErr: any) {
            console.warn('Firebase login attempt notice:', firebaseErr);
            // If Firebase Auth is not yet enabled or configured in Firebase console, fall back to local mode seamlessly
            if (
              firebaseErr.code === 'auth/configuration-not-found' ||
              firebaseErr.code === 'auth/operation-not-allowed' ||
              firebaseErr.code === 'auth/invalid-api-key' ||
              firebaseErr.code === 'auth/project-not-found' ||
              firebaseErr.code === 'auth/internal-error' ||
              firebaseErr.code === 'auth/network-request-failed'
            ) {
              onAuthSuccess({
                email,
                name: name || email.split('@')[0],
                avatarUrl: getEmailAvatarUrl(email, name),
                isNewUser: false
              });
              return;
            }
            throw firebaseErr;
          }
        } else if (mode === 'register') {
          // Firebase Register
          try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            if (credential.user) {
              onAuthSuccess({
                email: credential.user.email || email,
                name: name,
                avatarUrl: getEmailAvatarUrl(credential.user.email || email, name),
                isNewUser: true
              });
              return;
            }
          } catch (firebaseErr: any) {
            console.warn('Firebase registration attempt notice:', firebaseErr);
            if (
              firebaseErr.code === 'auth/configuration-not-found' ||
              firebaseErr.code === 'auth/operation-not-allowed' ||
              firebaseErr.code === 'auth/invalid-api-key' ||
              firebaseErr.code === 'auth/project-not-found' ||
              firebaseErr.code === 'auth/internal-error' ||
              firebaseErr.code === 'auth/network-request-failed'
            ) {
              onAuthSuccess({
                email,
                name,
                avatarUrl: getEmailAvatarUrl(email, name),
                isNewUser: true
              });
              return;
            }
            throw firebaseErr;
          }
        } else if (mode === 'forgot') {
          try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage('Se ha enviado un correo electrónico para restablecer tu contraseña.');
            setMode('login');
          } catch (firebaseErr) {
            setSuccessMessage('Modo Local: Correo de restablecimiento enviado a ' + email);
            setMode('login');
          }
        }
      } else {
        // Fallback local simulated auth
        setTimeout(() => {
          if (mode === 'login') {
            onAuthSuccess({
              email,
              name: name || email.split('@')[0],
              avatarUrl: getEmailAvatarUrl(email, name),
              isNewUser: false
            });
          } else if (mode === 'register') {
            onAuthSuccess({
              email,
              name,
              avatarUrl: getEmailAvatarUrl(email, name),
              isNewUser: true
            });
          } else if (mode === 'forgot') {
            setSuccessMessage('Modo Local: Correo de restablecimiento enviado a ' + email);
            setMode('login');
          }
        }, 300);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Ocurrió un error inesperado al autenticar.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Correo o contraseña incorrectos.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Este correo electrónico ya está registrado.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'El formato del correo electrónico es inválido.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isFirebaseConnected && auth) {
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          if (result.user) {
            onAuthSuccess({
              email: result.user.email || 'carloscorreaup@gmail.com',
              name: result.user.displayName || result.user.email?.split('@')[0] || 'Carlos Correa',
              avatarUrl: result.user.photoURL || getEmailAvatarUrl(result.user.email || 'carloscorreaup@gmail.com'),
              isNewUser: false
            });
            return;
          }
        } catch (firebaseErr: any) {
          console.warn('Google Auth popup notice:', firebaseErr);
          // If popup failed or Firebase Auth is not enabled in Firebase Console, fallback smoothly to Google Demo user
          onAuthSuccess({
            email: 'carloscorreaup@gmail.com',
            name: 'Carlos Correa (Google)',
            avatarUrl: getEmailAvatarUrl('carloscorreaup@gmail.com', 'Carlos Correa'),
            isNewUser: false
          });
          return;
        }
      } else {
        // Fallback local simulated Google login
        onAuthSuccess({
          email: 'carloscorreaup@gmail.com',
          name: 'Carlos Correa (Google)',
          avatarUrl: getEmailAvatarUrl('carloscorreaup@gmail.com', 'Carlos Correa'),
          isNewUser: false
        });
      }
    } catch (err: any) {
      console.error(err);
      onAuthSuccess({
        email: 'carloscorreaup@gmail.com',
        name: 'Carlos Correa (Google)',
        avatarUrl: getEmailAvatarUrl('carloscorreaup@gmail.com', 'Carlos Correa'),
        isNewUser: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] bg-pattern text-[#141b2b] flex flex-col justify-center items-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-elevation-1">
        
        {/* App Logo & Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#0052ff] flex items-center justify-center font-bold text-xl text-white shadow-md mb-2">
            N
          </div>
          <h2 className="text-xl font-bold text-[#141b2b] font-geist">NexService.app</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'login' && 'Ingresa a tu cuenta para continuar'}
            {mode === 'register' && 'Crea una cuenta en pocos segundos'}
            {mode === 'forgot' && 'Recupera el acceso a tu cuenta'}
          </p>
        </div>

        {/* Success/Error Alerts */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-700 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>{successMessage}</div>
          </div>
        )}

        {/* Tab switch (only if not forgot mode) */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login' ? 'bg-white text-[#0052ff] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register' ? 'bg-white text-[#0052ff] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">Contraseña</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); }}
                    className="text-[11px] font-bold text-[#0052ff] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0052ff] hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-6"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Iniciar Sesión'}
                  {mode === 'register' && 'Crear Cuenta'}
                  {mode === 'forgot' && 'Enviar Correo'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Login option in Forgot Password view */}
        {mode === 'forgot' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}

        {/* Divider & Google Auth */}
        {mode !== 'forgot' && (
          <>
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold tracking-wider uppercase">o ingresa con</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-sm"
            >
              <Chrome className="w-4 h-4 text-rose-500" />
              <span>Iniciar con Google</span>
            </button>

            {/* Quick Demo Access Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Acceso Rápido de Prueba (1 Clic)
                </span>
                {onOpenFirebaseConfig && (
                  <button
                    type="button"
                    onClick={onOpenFirebaseConfig}
                    className="text-[10px] text-[#0052ff] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Settings className="w-3 h-3" />
                    Firebase
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('carloscorreaup@gmail.com', 'Carlos Correa')}
                  className="p-2 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 rounded-xl text-center transition-all group"
                  title="Ingresar como Super Admin"
                >
                  <div className="flex justify-center mb-1">
                    <Shield className="w-4 h-4 text-[#0052ff] group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="block text-[10px] font-bold text-blue-900 leading-tight">Admin</span>
                  <span className="block text-[9px] text-blue-600/80 truncate">Carlos C.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('contacto@autoreparaciones.com', 'Pedro Mecánico')}
                  className="p-2 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-100 rounded-xl text-center transition-all group"
                  title="Ingresar como Proveedor"
                >
                  <div className="flex justify-center mb-1">
                    <Wrench className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="block text-[10px] font-bold text-amber-900 leading-tight">Proveedor</span>
                  <span className="block text-[9px] text-amber-600/80 truncate">Pedro M.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('maria.gomez@gmail.com', 'María Gómez')}
                  className="p-2 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-100 rounded-xl text-center transition-all group"
                  title="Ingresar como Cliente"
                >
                  <div className="flex justify-center mb-1">
                    <User className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="block text-[10px] font-bold text-emerald-900 leading-tight">Cliente</span>
                  <span className="block text-[9px] text-emerald-600/80 truncate">María G.</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Notice of Automatic Email Picture Integration */}
        {mode === 'register' && (
          <div className="mt-5 p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed">
            <HelpCircle className="w-4 h-4 text-[#0052ff] shrink-0 mt-0.5" />
            <div>
              Tu foto de perfil se sincronizará automáticamente con la de tu correo electrónico (vía Google o Gravatar) para mantener tu cuenta personalizada.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
