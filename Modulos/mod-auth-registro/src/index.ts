/**
 * mod-auth-registro
 * 
 * M�dulo independiente de registro de usuarios para Firebase.
 * Incluye verificaci�n de email con c�digo de 6 d�gitos.
 */

// Componentes
export { RegisterForm } from './components/RegisterForm';

// Hooks
export { useRegister } from './core/useRegister';

// Servicios
export { 
  createRegisterService,
  normalizeEmail,
  isValidEmail,
  isValidPassword,
  isValidCode,
  isValidName,
  passwordsMatch,
  validateRegistrationData,
} from './core/registerService';

// Adaptadores Firebase
export {
  createFirebaseClient,
  getFirebaseAuth,
  checkEmailExists,
  requestEmailCode,
  verifyEmailCode,
  finalizeRegistration,
  loginAfterRegister,
  getCloudFunctionErrorMessage,
} from './adapters/firebase/client';

// Configuraci�n
export {
  resolveFirebaseConfig,
  validateFirebaseConfig,
  getFirebaseConfigFromEnv,
  ENV_VAR_NAMES,
  DEFAULT_PHONE_PREFIXES,
} from './config/env';

// Tipos
export type {
  FirebaseConfig,
  RegistrationData,
  RequestCodeResult,
  FinalizeResult,
  RegisterStep,
  ThemeConfig,
  RegisterFormProps,
  PhonePrefix,
  RegisterFormLabels,
  RegisterFormState,
  UseRegisterOptions,
  UseRegisterReturn,
} from './types';
