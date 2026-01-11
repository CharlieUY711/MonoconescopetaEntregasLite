/**
 * mod-auth-login
 * 
 * M�dulo independiente de login con email/password para Firebase.
 * Extra�do de ODDY Entregas Lite.
 * 
 * @example
 * ```tsx
 * import { LoginForm, useLogin, loginWithEmailPassword } from 'mod-auth-login';
 * 
 * // Uso como componente
 * <LoginForm 
 *   onSuccess={(user) => console.log('Logged in:', user)}
 *   onNavigateToRegister={(email) => navigate('/register', { state: { email } })}
 * />
 * 
 * // Uso como hook
 * const { state, login, checkEmail } = useLogin({ onSuccess: handleSuccess });
 * 
 * // Uso directo de funciones
 * const user = await loginWithEmailPassword(email, password);
 * ```
 */

// Componentes
export { LoginForm } from './components/LoginForm';

// Hooks
export { useLogin } from './core/useLogin';

// Servicios
export { 
  createLoginService,
  getLoginService,
  normalizeEmail,
  isValidEmail,
  isValidPassword,
} from './core/loginService';

// Adaptadores Firebase
export {
  createFirebaseClient,
  getFirebaseAuth,
  loginWithEmailPassword,
  sendPasswordReset,
  getSignInMethods,
  checkEmailExists,
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
  CheckEmailResult,
  ThemeConfig,
  LoginFormProps,
  LoginFormLabels,
  AuthUser,
  LoginFormState,
  UseLoginOptions,
  UseLoginReturn,
} from './types';
