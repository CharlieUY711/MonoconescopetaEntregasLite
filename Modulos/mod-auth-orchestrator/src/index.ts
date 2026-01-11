/**
 * mod-auth-orchestrator
 * 
 * M�dulo integrador de autenticaci�n.
 * Combina login, registro, Google y verificaci�n en un gateway unificado.
 */

// Componentes
export { AuthGateway } from './components/AuthGateway';
export { AuthWizard } from './components/AuthWizard';
export { ThemeSetupForm } from './components/ThemeSetupForm';

// Contexto y hooks
export {
  AuthContext,
  useAuth,
  useUserProfile,
  useIsAuthenticated,
  useUIRole,
  mapFirebaseRoleToUI,
} from './core/authContext';

// Configuraci�n de tema
export {
  DEFAULT_THEME,
  saveTheme,
  loadTheme,
  clearTheme,
  resolveTheme,
  validateTheme,
  themeToCSS,
} from './config/theme';

// Configuraci�n de entorno
export {
  resolveFirebaseConfig,
  validateFirebaseConfig,
  getFirebaseConfigFromEnv,
  ENV_VAR_NAMES,
} from './config/env';

// Tipos
export type {
  FirebaseConfig,
  AuthModule,
  AuthView,
  AuthUser,
  UserProfile,
  UIRole,
  AuthState,
  ThemeConfig,
  AuthGatewayProps,
  AuthGatewayLabels,
  ThemeSetupFormProps,
  WizardConfig,
  GeneratedFiles,
  AuthWizardProps,
  AuthProviderOptions,
  AuthContextValue,
} from './types';
