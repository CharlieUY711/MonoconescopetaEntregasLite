/**
 * TIPOS - mod-auth-google
 * 
 * Tipos para el m�dulo de login con Google.
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
 * Usuario autenticado
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

/**
 * Resultado del login con Google
 */
export interface GoogleLoginResult {
  user: AuthUser;
  isNew: boolean;
  needsLinking?: boolean;
  email?: string;
}

/**
 * Modo de autenticaci�n de Google
 */
export type GoogleAuthMode = 'popup' | 'redirect';

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
 * Props del bot�n de Google
 */
export interface GoogleLoginButtonProps {
  /** Callback al completar login exitoso */
  onSuccess: (result: GoogleLoginResult) => void;
  /** Callback al ocurrir un error */
  onError?: (error: string) => void;
  /** Callback cuando necesita linking con cuenta password */
  onNeedsLinking?: (email: string) => void;
  /** Configuraci�n Firebase (opcional si se usa env vars) */
  firebaseConfig?: FirebaseConfig;
  /** Configuraci�n del tema (opcional) */
  theme?: ThemeConfig;
  /** Modo de autenticaci�n: popup o redirect */
  mode?: GoogleAuthMode;
  /** Texto del bot�n */
  buttonText?: string;
  /** Mostrar solo icono */
  iconOnly?: boolean;
  /** Ancho completo */
  fullWidth?: boolean;
  /** Scopes adicionales de Google */
  additionalScopes?: string[];
  /** Forzar selecci�n de cuenta */
  forceAccountSelection?: boolean;
  /** Crear perfil en Firestore para usuarios nuevos */
  createProfile?: boolean;
  /** Disabled */
  disabled?: boolean;
}

/**
 * Opciones para el hook useGoogleLogin
 */
export interface UseGoogleLoginOptions {
  /** Configuraci�n Firebase */
  firebaseConfig?: FirebaseConfig;
  /** Modo de autenticaci�n */
  mode?: GoogleAuthMode;
  /** Callback al completar login */
  onSuccess?: (result: GoogleLoginResult) => void;
  /** Callback al error */
  onError?: (error: string) => void;
  /** Callback cuando necesita linking */
  onNeedsLinking?: (email: string) => void;
  /** Scopes adicionales */
  additionalScopes?: string[];
  /** Forzar selecci�n de cuenta */
  forceAccountSelection?: boolean;
  /** Crear perfil en Firestore */
  createProfile?: boolean;
}

/**
 * Estado del hook useGoogleLogin
 */
export interface GoogleLoginState {
  loading: boolean;
  error: string | null;
  user: AuthUser | null;
}

/**
 * Retorno del hook useGoogleLogin
 */
export interface UseGoogleLoginReturn {
  /** Estado actual */
  state: GoogleLoginState;
  /** Ejecutar login con Google */
  login: () => Promise<GoogleLoginResult | null>;
  /** Limpiar error */
  clearError: () => void;
  /** Vincular cuenta Google con cuenta password existente */
  linkWithPassword: (email: string, password: string) => Promise<AuthUser | null>;
}
