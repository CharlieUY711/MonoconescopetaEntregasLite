/**
 * AUTH CONTEXT - ODDY Entregas Lite V1
 * 
 * Contexto de autenticación para compartir estado del usuario
 * entre componentes. Escucha cambios de auth y carga perfil de Firestore.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, onAuthStateChanged, signOut as firebaseSignOut, type User, type UserProfile } from '../../lib/firebase';
import { ensureUserProfile, getUserProfile, mapFirebaseRoleToUI } from '../services/usersService';
import type { RolSistema } from '../data/catalogos';

// ============================================
// TIPOS
// ============================================

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  uiRole: RolSistema;
  loading: boolean;
  error: string | null;
  isNewUser: boolean;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearNewUserFlag: () => void;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    uiRole: 'Cliente',
    loading: true,
    error: null,
    isNewUser: false
  });

  // Escuchar cambios de autenticación
  useEffect(() => {
    console.log('[AuthContext] Iniciando listener de auth...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[AuthContext] Auth state changed:', user?.email || 'no user');
      
      if (user) {
        try {
          // Intentar obtener/crear el perfil
          console.log('[AuthContext] Cargando perfil para:', user.uid);
          const { profile, isNewUser } = await ensureUserProfile(user, 'password');
          console.log('[AuthContext] Perfil cargado:', profile, 'Es nuevo:', isNewUser);
          
          const uiRole = mapFirebaseRoleToUI(profile.role);
          
          setState({
            user,
            profile,
            uiRole,
            loading: false,
            error: null,
            isNewUser
          });
        } catch (error) {
          console.error('[AuthContext] Error cargando perfil:', error);
          
          // Aún así permitir acceso con perfil mínimo
          setState({
            user,
            profile: {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || null,
              role: 'client',
              clientId: 'client_demo',
              provider: 'password',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            uiRole: 'Cliente',
            loading: false,
            error: 'Error cargando perfil, usando valores por defecto',
            isNewUser: false
          });
        }
      } else {
        // Usuario no autenticado
        console.log('[AuthContext] Usuario no autenticado');
        setState({
          user: null,
          profile: null,
          uiRole: 'Cliente',
          loading: false,
          error: null,
          isNewUser: false
        });
      }
    });

    return () => {
      console.log('[AuthContext] Limpiando listener');
      unsubscribe();
    };
  }, []);

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      console.log('[AuthContext] Cerrando sesión...');
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('[AuthContext] Error cerrando sesión:', error);
    }
  };

  // Función para refrescar el perfil
  const refreshProfile = async () => {
    if (!state.user) return;

    try {
      const { data } = await getUserProfile(state.user.uid);
      if (data) {
        const uiRole = mapFirebaseRoleToUI(data.role);
        setState(prev => ({ ...prev, profile: data, uiRole }));
      }
    } catch (error) {
      console.error('[AuthContext] Error refrescando perfil:', error);
    }
  };

  // Función para limpiar el flag de usuario nuevo
  const clearNewUserFlag = () => {
    setState(prev => ({ ...prev, isNewUser: false }));
  };

  const value: AuthContextValue = {
    ...state,
    signOut,
    refreshProfile,
    clearNewUserFlag
  };

  // Mostrar loading mientras se inicializa
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A9CE] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
}

/**
 * Hook para obtener solo el perfil del usuario (más simple)
 */
export function useUserProfile(): UserProfile | null {
  const { profile } = useAuth();
  return profile;
}

/**
 * Hook para verificar si el usuario está autenticado
 */
export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth();
  return !loading && user !== null;
}
