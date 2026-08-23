import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Chrome, AlertCircle, CheckCircle, HelpCircle, Sparkles, Shield, Wrench, Settings, FileText, ExternalLink } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, isFirebaseConnected } from '../services/firebase';
import { getEmailAvatarUrl } from '../utils/userUtils';
import { DataPolicyModal } from './DataPolicyModal';
import { getUserByEmail, saveUserToDB } from '../services/firestoreService';
import { requestUserCoordinates, reverseGeocodeAddress, findNearestCity } from '../utils/geoUtils';

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
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if returning from a Google Redirect authentication flow
  useEffect(() => {
    if (isFirebaseConnected && auth) {
      getRedirectResult(auth)
        .then(async (result) => {
          if (result && result.user) {
            const googleEmail = result.user.email || '';
            const googleName = result.user.displayName || googleEmail.split('@')[0] || 'Usuario Google';
            const googleAvatar = result.user.photoURL || getEmailAvatarUrl(googleEmail, googleName);

            const dbUser = await getUserByEmail(googleEmail);
            if (!dbUser) {
              const detectedCoords = await requestUserCoordinates({ timeout: 4000 });
              let initialCity = 'Pereira';
              let initialDept = 'Risaralda';
              let initialAddr = 'Pereira, Risaralda';
              let initialCoords = { lat: 4.81333, lng: -75.69611 };

              if (detectedCoords) {
                initialCoords = detectedCoords;
                const geo = await reverseGeocodeAddress(detectedCoords);
                const nearest = findNearestCity(detectedCoords);
                initialCity = geo?.city || nearest.name;
                initialDept = geo?.department || nearest.department;
                initialAddr = geo?.address || `${initialCity}, ${initialDept}`;
              }

              await saveUserToDB({
                email: googleEmail,
                name: googleName,
                phone: result.user.phoneNumber || '+57 300 000 0000',
                city: initialCity,
                department: initialDept,
                mode: 'client',
                role: 'both',
                isOnboarded: false,
                hasChosenCity: false,
                favorites: [],
                isVerified: true,
                isActive: true,
                avatarUrl: googleAvatar,
                fixedLocation: {
                  address: initialAddr,
                  city: initialCity,
                  department: initialDept,
                  coordinates: initialCoords,
                  isPublicOnMap: true
                }
              });
            }

            onAuthSuccess({
              email: googleEmail,
              name: googleName,
              avatarUrl: googleAvatar,
              isNewUser: !dbUser
            });
          }
        })
        .catch((err) => {
          console.warn('Google redirect result notice:', err);
        });
    }
  }, [isFirebaseConnected, onAuthSuccess]);

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

    if (mode === 'register') {
      if (!acceptTerms) {
        setError('Debes autorizar el tratamiento de datos personales (Ley 1581 de 2012) para registrarte.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (!name.trim()) {
        setError('Por favor ingresa tu nombre completo.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isFirebaseConnected && auth) {
        if (mode === 'login') {
          // Firebase Login
          try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            if (credential.user) {
              const userEmail = credential.user.email || email;
              const dbUser = await getUserByEmail(userEmail);
              
              onAuthSuccess({
                email: userEmail,
                name: credential.user.displayName || dbUser?.name || name || userEmail.split('@')[0],
                avatarUrl: credential.user.photoURL || dbUser?.avatarUrl || getEmailAvatarUrl(userEmail),
                isNewUser: false
              });
              return;
            }
          } catch (firebaseErr: any) {
            console.warn('Firebase login attempt notice:', firebaseErr);
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
              const userEmail = credential.user.email || email;
              const avatar = credential.user.photoURL || getEmailAvatarUrl(userEmail, name);
              
              onAuthSuccess({
                email: userEmail,
                name: name,
                avatarUrl: avatar,
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
            setSuccessMessage('Modo de prueba: Enlace de restablecimiento enviado a ' + email);
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

    if (!isFirebaseConnected || !auth) {
      setError('Firebase no está inicializado. Verifica la conexión en el modal de Firebase.');
      setLoading(false);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      provider.addScope('email');
      provider.addScope('profile');

      // Attempt Real Firebase Google Popup
      const result = await signInWithPopup(auth, provider);
      
      if (result && result.user) {
        const googleEmail = result.user.email || '';
        const googleName = result.user.displayName || (googleEmail ? googleEmail.split('@')[0] : 'Usuario Google');
        const googleAvatar = result.user.photoURL || getEmailAvatarUrl(googleEmail, googleName);

        // Check or store in Firestore
        const dbUser = await getUserByEmail(googleEmail);
        if (!dbUser) {
          const detectedCoords = await requestUserCoordinates({ timeout: 4000 });
          let initialCity = 'Pereira';
          let initialDept = 'Risaralda';
          let initialAddr = 'Pereira, Risaralda';
          let initialCoords = { lat: 4.81333, lng: -75.69611 };

          if (detectedCoords) {
            initialCoords = detectedCoords;
            const geo = await reverseGeocodeAddress(detectedCoords);
            const nearest = findNearestCity(detectedCoords);
            initialCity = geo?.city || nearest.name;
            initialDept = geo?.department || nearest.department;
            initialAddr = geo?.address || `${initialCity}, ${initialDept}`;
          }

          await saveUserToDB({
            email: googleEmail,
            name: googleName,
            phone: result.user.phoneNumber || '+57 300 000 0000',
            city: initialCity,
            department: initialDept,
            mode: 'client',
            role: 'both',
            isOnboarded: false,
            hasChosenCity: false,
            favorites: [],
            isVerified: true,
            isActive: true,
            avatarUrl: googleAvatar,
            fixedLocation: {
              address: initialAddr,
              city: initialCity,
              department: initialDept,
              coordinates: initialCoords,
              isPublicOnMap: true
            }
          });
        }

        onAuthSuccess({
          email: googleEmail,
          name: googleName,
          avatarUrl: googleAvatar,
          isNewUser: !dbUser
        });
        return;
      }
    } catch (err: any) {
      console.error('Google Auth Error Details:', err);

      if (err.code === 'auth/popup-closed-by-user') {
        setError('Cerraste la ventana de Google antes de completar la verificación.');
      } else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setError('Google Auth aún no está activado en Firebase Console. Debes ir a Firebase Console > Authentication > Proveedores de acceso y activar "Google". Haz clic en el botón de abajo para ir directo a la consola.');
      } else if (err.code === 'auth/popup-blocked') {
        // Automatically try redirect if popup was blocked by browser
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: any) {
          setError('El navegador bloqueó la ventana emergente de Google. Permite las ventanas emergentes en tu navegador.');
        }
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`El dominio actual no está en la lista de dominios autorizados de Firebase Console (Authentication > Settings > Authorized Domains).`);
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Solicitud cancelada. Por favor presiona el botón nuevamente.');
      } else {
        setError(`Error de Google Auth (${err.code || err.message}). Activa el proveedor de Google en Firebase Console.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] bg-pattern text-[#141b2b] flex flex-col justify-center items-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-elevation-1">
        
        {/* App Logo & Header with "By Pasiflora Biohacking Pro." in italic */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200/80 shadow-md p-2 flex items-center justify-center mb-3">
            <img 
              src="/logo.png" 
              alt="NexService.app" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fb = e.currentTarget.parentElement?.querySelector('.auth-fallback');
                if (fb) fb.classList.remove('hidden');
              }}
            />
            <div className="auth-fallback hidden w-full h-full rounded-2xl bg-[#0052ff] flex items-center justify-center text-white font-bold text-2xl">
              N
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-[#141b2b] font-geist tracking-tight">
            NexService<span className="text-[#0052ff]">.app</span>
          </h2>
          
          {/* By Pasiflora Biohacking Pro. in italic */}
          <div className="text-xs font-serif italic text-slate-600 font-medium mt-0.5">
            By <span className="text-[#0052ff] font-semibold">Pasiflora Biohacking Pro.</span>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            {mode === 'login' && 'Ingresa a tu cuenta para continuar'}
            {mode === 'register' && 'Crea una cuenta en pocos segundos'}
            {mode === 'forgot' && 'Recupera el acceso a tu cuenta'}
          </p>
        </div>

        {/* Success/Error Alerts */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 font-semibold leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              {error}
              {error.includes('Firebase Console') && (
                <a
                  href="https://console.firebase.google.com/project/nexservice-app/authentication/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-1 text-[#0052ff] underline font-bold flex items-center gap-1"
                >
                  Abrir Firebase Console <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-700 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>{successMessage}</div>
          </div>
        )}

        {/* Tab switch */}
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

          {/* LEYENDA Y AUTORIZACIÓN DE MANEJO DE DATOS (LEY 1581 DE 2012) */}
          {mode === 'register' && (
            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-left select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0052ff] focus:ring-[#0052ff]"
                />
                <span className="text-[11px] text-slate-700 leading-tight">
                  Autorizo el tratamiento de mis datos personales a <strong>Pasiflora Biohacking Pro.</strong> conforme a la <strong>Ley 1581 de 2012</strong> (Habeas Data) y Decreto 1377 de 2013.
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowPolicyModal(true)}
                className="text-[11px] text-[#0052ff] font-bold hover:underline flex items-center gap-1 pl-6"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ver Política y Términos de Datos completa</span>
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0052ff] hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Iniciar Sesión'}
                  {mode === 'register' && 'Crear Cuenta y Autorizar'}
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

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-sm group"
            >
              <Chrome className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Continuar con Google</span>
            </button>

            {/* Aviso legal para Login */}
            {mode === 'login' && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(true)}
                  className="text-[10px] text-slate-500 hover:text-[#0052ff] underline inline-flex items-center gap-1"
                >
                  <Shield className="w-3 h-3 text-[#0052ff]" />
                  <span>Tratamiento de datos personales según Ley 1581 de 2012</span>
                </button>
              </div>
            )}

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

      </div>

      {/* Policy Modal */}
      {showPolicyModal && (
        <DataPolicyModal
          onClose={() => setShowPolicyModal(false)}
          onAccept={() => {
            setAcceptTerms(true);
            setShowPolicyModal(false);
          }}
        />
      )}
    </div>
  );
};
