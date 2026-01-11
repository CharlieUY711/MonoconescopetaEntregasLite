/**
 * mod-auth-email-verificacion
 * 
 * M�dulo independiente de verificaci�n de email con c�digo de 6 d�gitos.
 */

// Componentes
export { VerificationForm } from './components/VerificationForm';

// Hooks
export { useEmailVerification } from './core/useEmailVerification';

// Adaptadores Firebase
export {
  createFirebaseClient,
  requestEmailCode,
  verifyEmailCode,
  normalizeEmail,
  isValidEmail,
  isValidCode,
  getCloudFunctionErrorMessage,
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
  VerificationRequestData,
  RequestCodeResult,
  VerifyCodeResult,
  VerificationStep,
  CodeStatus,
  ThemeConfig,
  VerificationFormProps,
  VerificationFormLabels,
  VerificationFormState,
  UseEmailVerificationOptions,
  UseEmailVerificationReturn,
} from './types';
