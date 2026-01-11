/**
 * mod-auth-google
 * 
 * M�dulo independiente de login con Google para Firebase.
 */

// Componentes
export { GoogleLoginButton } from './components/GoogleLoginButton';

// Hooks
export { useGoogleLogin } from './core/useGoogleLogin';

// Adaptadores Firebase
export {
  createFirebaseClient,
  getFirebaseAuth,
  getFirestoreDb,
  getGoogleProvider,
  loginWithGooglePopup,
  loginWithGoogleRedirect,
  getGoogleRedirectResult,
  linkGoogleWithPassword,
  getSignInMethods,
  getFirebaseErrorMessage,
} from './adapters/firebase/client';

// Configuraci�n
export {
  resolveFirebaseConfig,
  validateFirebaseConfig,
  getFirebaseConfigFromEnv,
  ENV_VAR_NAMES,
} from './config/env';

// Tipos
export type {
  FirebaseConfig,
  AuthUser,
  GoogleLoginResult,
  GoogleAuthMode,
  ThemeConfig,
  GoogleLoginButtonProps,
  UseGoogleLoginOptions,
  GoogleLoginState,
  UseGoogleLoginReturn,
} from './types';
