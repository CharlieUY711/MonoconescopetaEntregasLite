/**
 * TIPOS - mod-auth-registro
 * 
 * Tipos para el m�dulo de registro de usuarios.
 * Extra�dos de la implementaci�n original de ODDY Entregas Lite.
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
 * Datos de registro del usuario
 */
export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Resultado de solicitar c�digo de verificaci�n
 */
export interface RequestCodeResult {
  success: boolean;
  message: string;
  email: string;
}

/**
 * Resultado de finalizar registro
 */
export interface FinalizeResult {
  success: boolean;
  uid: string;
  email: string;
  message: string;
}

/**
 * Paso actual del registro
 */
export type RegisterStep = 
  | 'FORM'         // Formulario de datos
  | 'VERIFY_CODE'  // Verificar c�digo de email
  | 'DONE'         // Registro completado
  | 'ERROR';       // Error

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
  buttonStyle?: 'filled' | 'outline';
}

/**
 * Props del formulario de registro
 */
export interface RegisterFormProps {
  /** Callback al completar registro exitoso */
  onSuccess: (result: FinalizeResult) => void;
  /** Callback al ocurrir un error */
  onError?: (error: string) => void;
  /** Callback para navegar a login */
  onNavigateToLogin?: () => void;
  /** Configuraci�n Firebase (opcional si se usa env vars) */
  firebaseConfig?: FirebaseConfig;
  /** Configuraci�n del tema (opcional) */
  theme?: ThemeConfig;
  /** Email pre-llenado (opcional) */
  initialEmail?: string;
  /** Mostrar campo de tel�fono */
  showPhone?: boolean;
  /** Prefijo telef�nico por defecto */
  defaultPhonePrefix?: string;
  /** Lista de prefijos telef�nicos disponibles */
  phonePrefixes?: PhonePrefix[];
  /** Textos personalizados */
  labels?: RegisterFormLabels;
  /** Requerir verificaci�n de email */
  requireEmailVerification?: boolean;
}

/**
 * Prefijo telef�nico
 */
export interface PhonePrefix {
  code: string;
  country: string;
  short: string;
}

/**
 * Etiquetas personalizables del formulario
 */
export interface RegisterFormLabels {
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  confirmPasswordPlaceholder?: string;
  firstNamePlaceholder?: string;
  lastNamePlaceholder?: string;
  phonePlaceholder?: string;
  submitButton?: string;
  verifyButton?: string;
  resendButton?: string;
  cancelButton?: string;
  loadingText?: string;
  codeInstructions?: string;
}

/**
 * Estado interno del formulario de registro
 */
export interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phonePrefix: string;
  phone: string;
  code: string;
  loading: boolean;
  error: string | null;
  success: string | null;
  step: RegisterStep;
}

/**
 * Opciones para el hook useRegister
 */
export interface UseRegisterOptions {
  /** Configuraci�n Firebase */
  firebaseConfig?: FirebaseConfig;
  /** Callback al completar registro */
  onSuccess?: (result: FinalizeResult) => void;
  /** Callback al error */
  onError?: (error: string) => void;
  /** Requerir verificaci�n de email */
  requireEmailVerification?: boolean;
}

/**
 * Retorno del hook useRegister
 */
export interface UseRegisterReturn {
  /** Estado del formulario */
  state: RegisterFormState;
  /** Actualizar email */
  setEmail: (email: string) => void;
  /** Actualizar password */
  setPassword: (password: string) => void;
  /** Actualizar confirmPassword */
  setConfirmPassword: (password: string) => void;
  /** Actualizar firstName */
  setFirstName: (name: string) => void;
  /** Actualizar lastName */
  setLastName: (name: string) => void;
  /** Actualizar phonePrefix */
  setPhonePrefix: (prefix: string) => void;
  /** Actualizar phone */
  setPhone: (phone: string) => void;
  /** Actualizar code */
  setCode: (code: string) => void;
  /** Solicitar c�digo de verificaci�n */
  requestCode: () => Promise<boolean>;
  /** Verificar c�digo y finalizar registro */
  verifyAndFinalize: () => Promise<FinalizeResult | null>;
  /** Reenviar c�digo */
  resendCode: () => Promise<boolean>;
  /** Limpiar formulario */
  reset: () => void;
  /** Limpiar error */
  clearError: () => void;
  /** Validar formulario */
  validate: () => { valid: boolean; errors: string[] };
}
