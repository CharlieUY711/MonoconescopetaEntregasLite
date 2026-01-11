/**
 * USERS SERVICE - ODDY Entregas Lite V1
 * 
 * Gestión de perfiles de usuario en Firestore:
 * - Crear/actualizar perfil al login
 * - Obtener perfil actual
 * - Mapeo de roles Firebase ↔ roles UI
 */

import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  db, 
  type User, 
  type UserProfile, 
  type UserRole,
  type AuthProvider 
} from '../../lib/firebase';
import type { RolSistema } from '../data/catalogos';

// ============================================
// CONSTANTES
// ============================================

const USERS_COLLECTION = 'users';
const DEFAULT_CLIENT_ID = 'client_demo';

// ============================================
// TIPOS INTERNOS
// ============================================

interface FirestoreUserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  clientId: string | null;
  provider: AuthProvider;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// MAPEO DE ROLES
// ============================================

/**
 * Convierte rol de Firestore a rol de UI (catálogos)
 */
export function mapFirebaseRoleToUI(role: UserRole): RolSistema {
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

/**
 * Convierte rol de UI a rol de Firestore
 */
export function mapUIRoleToFirebase(role: RolSistema): UserRole {
  switch (role) {
    case 'Administrador':
      return 'admin';
    case 'Cliente':
      return 'client';
    case 'Chofer':
      return 'driver_mock';
    default:
      return 'client';
  }
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Obtiene el perfil de usuario desde Firestore
 * @returns { exists, data } para diagnóstico
 */
export async function getUserProfile(uid: string): Promise<{ exists: boolean; data: UserProfile | null }> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data() as FirestoreUserProfile;
    return { 
      exists: true, 
      data: {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      }
    };
  }
  return { exists: false, data: null };
}

/**
 * Asegura que existe un documento users/{uid} en Firestore.
 * Si no existe, lo crea con valores por defecto.
 * Si existe, actualiza updatedAt.
 * 
 * @param user - Usuario de Firebase Auth
 * @param provider - Proveedor de autenticación usado
 */
export async function ensureUserProfile(
  user: User, 
  provider: AuthProvider = 'password'
): Promise<UserProfile> {
  console.log('[UsersService] ensureUserProfile llamado para:', user.uid);
  
  try {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Usuario existente: actualizar último acceso
      console.log('[UsersService] Usuario existente, actualizando...');
      const existingData = userSnap.data() as FirestoreUserProfile;
      
      try {
        await setDoc(userRef, {
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (updateError) {
        console.warn('[UsersService] No se pudo actualizar updatedAt:', updateError);
        // No fallar si solo no se puede actualizar el timestamp
      }

      return {
        ...existingData,
        createdAt: existingData.createdAt?.toDate() || new Date(),
        updatedAt: new Date()
      };
    }

    // Usuario nuevo: crear perfil con valores por defecto
    console.log('[UsersService] Usuario nuevo, creando perfil...');
    const newProfileData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || null,
      role: 'client' as UserRole,
      clientId: DEFAULT_CLIENT_ID,
      provider,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, newProfileData);
    console.log('[UsersService] Perfil creado exitosamente');

    // Retornar con fechas como Date
    return {
      ...newProfileData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('[UsersService] Error en ensureUserProfile:', error);
    
    // Retornar perfil mínimo para no bloquear la app
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || null,
      role: 'client',
      clientId: DEFAULT_CLIENT_ID,
      provider,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

/**
 * Actualiza campos específicos del perfil de usuario
 * Solo admin debería poder cambiar role y clientId de otros usuarios
 */
export async function updateUserProfile(
  uid: string, 
  updates: Partial<Pick<UserProfile, 'displayName' | 'role' | 'clientId'>>
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  
  await setDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Verifica si el usuario actual tiene rol admin
 */
export async function isCurrentUserAdmin(uid: string): Promise<boolean> {
  const { data } = await getUserProfile(uid);
  return data?.role === 'admin';
}

/**
 * Obtiene el clientId del usuario actual
 * @returns clientId o null si no tiene
 */
export async function getCurrentUserClientId(uid: string): Promise<string | null> {
  const { data } = await getUserProfile(uid);
  return data?.clientId || null;
}
