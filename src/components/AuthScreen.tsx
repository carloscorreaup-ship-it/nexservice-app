import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, HelpCircle, Sparkles, Shield, Wrench, Settings, FileText, ExternalLink } from 'lucide-react';

const GoogleLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);
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
            const googleName = result.user.displayName || (googleEmail ? googleEmail.split('@')[0] : 'Usuario Google');
            const rawPhoto = result.user.photoURL || '';
            const googleAvatar = rawPhoto ? rawPhoto.replace(/=s\d+(-c)?$/, '=s400-c') : getEmailAvatarUrl(googleEmail, googleName);

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
                phone: result.user.phoneNumber || '',
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
            } else if (rawPhoto && (!dbUser.avatarUrl || dbUser.avatarUrl.includes('ui-avatars.com'))) {
              dbUser.avatarUrl = googleAvatar;
              await saveUserToDB(dbUser);
            }

            onAuthSuccess({
              email: googleEmail,
              name: googleName,
              avatarUrl: (dbUser && dbUser.avatarUrl) || googleAvatar,
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
        const rawPhoto = result.user.photoURL || '';
        const googleAvatar = rawPhoto ? rawPhoto.replace(/=s\d+(-c)?$/, '=s400-c') : getEmailAvatarUrl(googleEmail, googleName);

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
            phone: result.user.phoneNumber || '',
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
        } else if (rawPhoto && (!dbUser.avatarUrl || dbUser.avatarUrl.includes('ui-avatars.com'))) {
          dbUser.avatarUrl = googleAvatar;
          await saveUserToDB(dbUser);
        }

        onAuthSuccess({
          email: googleEmail,
          name: googleName,
          avatarUrl: (dbUser && dbUser.avatarUrl) || googleAvatar,
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
          <div className="text-sm font-serif italic text-slate-600 font-medium mt-0.5">
            By <span className="text-[#0052ff] font-semibold">Pasiflora Biohacking Pro.</span>
          </div>

          <p className="text-sm text-slate-500 mt-2">
            {mode === 'login' && 'Ingresa a tu cuenta para continuar'}
            {mode === 'register' && 'Crea una cuenta en pocos segundos'}
            {mode === 'forgot' && 'Recupera el acceso a tu cuenta'}
          </p>
        </div>

        {/* Success/Error Alerts */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-sm text-rose-700 font-semibold leading-relaxed">
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
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-sm text-emerald-700 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>{successMessage}</div>
          </div>
        )}

        {/* Tab switch */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 text-center py-2 text-sm font-bold rounded-xl transition-all ${
                mode === 'login' ? 'bg-white text-[#0052ff] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 text-center py-2 text-sm font-bold rounded-xl transition-all ${
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
              <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-slate-700">Contraseña</label>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base text-[#141b2b] focus:outline-none focus:border-[#0052ff]"
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
            className="w-full bg-[#0052ff] hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold text-base py-3.5 rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-4"
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
              className="text-sm font-bold text-slate-500 hover:text-slate-800"
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
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-sm group hover:shadow"
            >
              <GoogleLogo className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
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

            {/* Quick Demo Access Buttons Removed */}
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

