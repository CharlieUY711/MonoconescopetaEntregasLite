/**
 * TIPOS - mod-auth-orchestrator
 * 
 * Tipos para el m�dulo orquestador de autenticaci�n.
 */

import type { ReactNode } from 'react';

/**
 * Configuraci�n de Firebase
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
 * M�dulos disponibles
 */
export type AuthModule = 'login' | 'register' | 'google' | 'verification';

/**
 * Vista actual del gateway
 */
export type AuthView = 'login' | 'register' | 'verification' | 'forgot-password';

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
 * Perfil de usuario (Firestore)
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'admin' | 'client' | 'driver_mock';
  clientId: string | null;
  provider: 'password' | 'google';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rol de UI
 */
export type UIRole = 'Administrador' | 'Cliente' | 'Chofer';

/**
 * Estado del contexto de autenticaci�n
 */
export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  uiRole: UIRole;
  loading: boolean;
  error: string | null;
  isNewUser: boolean;
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
 * Props del AuthGateway
 */
export interface AuthGatewayProps {
  /** M�dulos a incluir */
  modules: AuthModule[];
  /** Vista inicial */
  initialView?: AuthView;
  /** Configuraci�n Firebase */
  firebaseConfig?: FirebaseConfig;
  /** Configuraci�n del tema */
  theme?: ThemeConfig;
  /** Callback al autenticarse */
  onAuthenticated: (user: AuthUser, isNew: boolean) => void;
  /** Callback al error */
  onError?: (error: string) => void;
  /** Mostrar Google login */
  showGoogle?: boolean;
  /** Requerir verificaci�n de email */
  requireEmailVerification?: boolean;
  /** T�tulo del formulario */
  title?: string;
  /** Subt�tulo */
  subtitle?: string;
  /** Logo (URL o componente) */
  logo?: string | ReactNode;
  /** Textos personalizados */
  labels?: AuthGatewayLabels;
  /** Mostrar toggle login/registro */
  showToggle?: boolean;
}

/**
 * Textos personalizables del AuthGateway
 */
export interface AuthGatewayLabels {
  loginTitle?: string;
  registerTitle?: string;
  loginTab?: string;
  registerTab?: string;
  orDivider?: string;
  googleButton?: string;
  forgotPassword?: string;
  backToLogin?: string;
}

/**
 * Props del ThemeSetupForm
 */
export interface ThemeSetupFormProps {
  /** Callback al guardar tema */
  onSave: (theme: ThemeConfig) => void;
  /** Tema inicial */
  initialTheme?: Partial<ThemeConfig>;
  /** T�tulo */
  title?: string;
}

/**
 * Configuraci�n del wizard de generaci�n
 */
export interface WizardConfig {
  /** M�dulos seleccionados */
  modules: AuthModule[];
  /** Configuraci�n Firebase */
  firebaseConfig: FirebaseConfig;
  /** Modo de Google (si aplica) */
  googleMode?: 'popup' | 'redirect';
  /** Requerir verificaci�n de email */
  requireEmailVerification: boolean;
  /** Tema personalizado */
  theme?: ThemeConfig;
  /** Nombre del proyecto */
  projectName?: string;
}

/**
 * Archivos generados
 */
export interface GeneratedFiles {
  'auth.config.ts': string;
  'firebase.client.ts': string;
  'theme.tokens.json'?: string;
  'AuthGateway.tsx': string;
}

/**
 * Props del AuthWizard
 */
export interface AuthWizardProps {
  /** Callback al generar archivos */
  onGenerate: (files: GeneratedFiles) => void;
  /** Callback al cancelar */
  onCancel?: () => void;
}

/**
 * Opciones del AuthProvider
 */
export interface AuthProviderOptions {
  /** Configuraci�n Firebase */
  firebaseConfig?: FirebaseConfig;
  /** Callback al cambiar estado de auth */
  onAuthStateChange?: (user: AuthUser | null) => void;
}

/**
 * Valor del contexto de autenticaci�n
 */
export interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearNewUserFlag: () => void;
}
