/**
 * TIPOS - mod-auth-email-verificacion
 * 
 * Tipos para el m�dulo de verificaci�n de email con c�digo.
 */

/**
 * Configuraci�n de Firebase requerida
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

/**
 * Datos para solicitar c�digo
 */
export interface VerificationRequestData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Resultado de solicitar c�digo
 */
export interface RequestCodeResult {
  success: boolean;
  message: string;
  email: string;
}

/**
 * Resultado de verificar c�digo
 */
export interface VerifyCodeResult {
  success: boolean;
  message: string;
  verified: boolean;
}

/**
 * Estado de verificaci�n
 */
export type VerificationStep = 
  | 'READY'      // Listo para enviar c�digo
  | 'SENT'       // C�digo enviado
  | 'VERIFYING'  // Verificando c�digo
  | 'VERIFIED'   // Email verificado
  | 'ERROR';     // Error

/**
 * Estado del c�digo
 */
export type CodeStatus = 'idle' | 'success' | 'error';

/**
 * Configuraci�n del tema visual
 */
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  errorColor: string;
  successColor: string;
  borderRadius: string;
  fontFamily?: string;
}

/**
 * Props del formulario de verificaci�n
 */
export interface VerificationFormProps {
  /** Email a verificar */
  email: string;
  /** Datos del usuario (para enviar c�digo) */
  userData?: VerificationRequestData;
  /** Callback al verificar exitosamente */
  onVerified: (email: string) => void;
  /** Callback al ocurrir un error */
  onError?: (error: string) => void;
  /** Callback para cancelar */
  onCancel?: () => void;
  /** Configuraci�n Firebase (opcional si se usa env vars) */
  firebaseConfig?: FirebaseConfig;
  /** Configuraci�n del tema (opcional) */
  theme?: ThemeConfig;
  /** Tiempo en segundos entre reenv�os (default: 60) */
  resendCooldown?: number;
  /** Enviar c�digo autom�ticamente al montar */
  autoSend?: boolean;
  /** Textos personalizados */
  labels?: VerificationFormLabels;
}

/**
 * Etiquetas personalizables
 */
export interface VerificationFormLabels {
  title?: string;
  instructions?: string;
  codePlaceholder?: string;
  verifyButton?: string;
  resendButton?: string;
  cancelButton?: string;
  successMessage?: string;
  resendingMessage?: string;
}

/**
 * Estado interno del formulario
 */
export interface VerificationFormState {
  code: string;
  loading: boolean;
  error: string | null;
  success: string | null;
  step: VerificationStep;
  codeStatus: CodeStatus;
  resendCooldown: number;
}

/**
 * Opciones para el hook useEmailVerification
 */
export interface UseEmailVerificationOptions {
  /** Email a verificar */
  email: string;
  /** Datos del usuario */
  userData?: VerificationRequestData;
  /** Configuraci�n Firebase */
  firebaseConfig?: FirebaseConfig;
  /** Callback al verificar */
  onVerified?: (email: string) => void;
  /** Callback al error */
  onError?: (error: string) => void;
  /** Cooldown entre reenv�os */
  resendCooldown?: number;
}

/**
 * Retorno del hook useEmailVerification
 */
export interface UseEmailVerificationReturn {
  /** Estado actual */
  state: VerificationFormState;
  /** Actualizar c�digo */
  setCode: (code: string) => void;
  /** Enviar c�digo */
  sendCode: () => Promise<boolean>;
  /** Verificar c�digo */
  verifyCode: () => Promise<boolean>;
  /** Reenviar c�digo */
  resendCode: () => Promise<boolean>;
  /** Limpiar error */
  clearError: () => void;
  /** Reset completo */
  reset: () => void;
  /** Segundos restantes para poder reenviar */
  resendCountdown: number;
  /** Puede reenviar? */
  canResend: boolean;
}
