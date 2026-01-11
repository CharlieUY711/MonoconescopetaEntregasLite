/**
 * TIPOS - mod-auth-login
 * 
 * Tipos para el m�dulo de login con email/password.
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
 * Resultado de verificar si un email existe
 */
export interface CheckEmailResult {
  exists: boolean;
  email: string;
}

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
 * Props del formulario de login
 */
export interface LoginFormProps {
  /** Callback al completar login exitoso */
  onSuccess: (user: AuthUser) => void;
  /** Callback al ocurrir un error */
  onError?: (error: string) => void;
  /** Callback para navegar a registro */
  onNavigateToRegister?: (email: string) => void;
  /** Callback para recuperar contrase�a */
  onForgotPassword?: (email: string) => void;
  /** Configuraci�n Firebase (opcional si se usa env vars) */
  firebaseConfig?: FirebaseConfig;
  /** Configuraci�n del tema (opcional) */
  theme?: ThemeConfig;
  /** Email pre-llenado (opcional) */
  initialEmail?: string;
  /** Mostrar opci�n "Recordarme" */
  showRememberMe?: boolean;
  /** Mostrar link "Olvid� mi contrase�a" */
  showForgotPassword?: boolean;
  /** Textos personalizados */
  labels?: LoginFormLabels;
}

/**
 * Etiquetas personalizables del formulario
 */
export interface LoginFormLabels {
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  submitButton?: string;
  forgotPasswordLink?: string;
  rememberMeLabel?: string;
  loadingText?: string;
}

/**
 * Usuario autenticado (simplificado)
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

/**
 * Estado interno del formulario de login
 */
export interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  step: 'EMAIL' | 'PASSWORD';
}

/**
 * Opciones para el hook useLogin
 */
export interface UseLoginOptions {
  /** Configuraci�n Firebase */
  firebaseConfig?: FirebaseConfig;
  /** Callback al completar login */
  onSuccess?: (user: AuthUser) => void;
  /** Callback al error */
  onError?: (error: string) => void;
}

/**
 * Retorno del hook useLogin
 */
export interface UseLoginReturn {
  /** Estado del formulario */
  state: LoginFormState;
  /** Actualizar email */
  setEmail: (email: string) => void;
  /** Actualizar password */
  setPassword: (password: string) => void;
  /** Actualizar rememberMe */
  setRememberMe: (value: boolean) => void;
  /** Verificar si email existe */
  checkEmail: () => Promise<boolean>;
  /** Ejecutar login */
  login: () => Promise<AuthUser | null>;
  /** Enviar email de reset */
  sendPasswordReset: () => Promise<boolean>;
  /** Limpiar formulario */
  reset: () => void;
  /** Limpiar error */
  clearError: () => void;
}
