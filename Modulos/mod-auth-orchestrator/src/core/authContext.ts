/**
 * AUTH CONTEXT - mod-auth-orchestrator
 * 
 * Contexto de autenticaci�n para compartir estado.
 * Basado en AuthContext.tsx del proyecto original.
 */

import { createContext, useContext } from 'react';
import type { AuthContextValue, UIRole, UserProfile } from '../types';

// ============================================
// CONTEXTO
// ============================================

const defaultContextValue: AuthContextValue = {
  user: null,
  profile: null,
  uiRole: 'Cliente',
  loading: true,
  error: null,
  isNewUser: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  clearNewUserFlag: () => {},
};

export const AuthContext = createContext<AuthContextValue>(defaultContextValue);

// ============================================
// HOOKS
// ============================================

/**
 * Hook principal para acceder al contexto de autenticaci�n
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
}

/**
 * Hook para obtener solo el perfil del usuario
 */
export function useUserProfile(): UserProfile | null {
  const { profile } = useAuth();
  return profile;
}

/**
 * Hook para verificar si el usuario est� autenticado
 */
export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth();
  return !loading && user !== null;
}

/**
 * Hook para obtener el rol de UI
 */
export function useUIRole(): UIRole {
  const { uiRole } = useAuth();
  return uiRole;
}

// ============================================
// HELPERS
// ============================================

/**
 * Mapea rol de Firebase a rol de UI
 */
export function mapFirebaseRoleToUI(role: 'admin' | 'client' | 'driver_mock'): UIRole {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'client':
      return 'Cliente';
    case 'driver_mock':
      return 'Chofer';
    default:
      return 'Cliente';
  }
}
