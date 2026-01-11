/**
 * FIREBASE CONFIGURATION - ODDY Entregas Lite V1
 * 
 * Inicialización central de Firebase:
 * - Auth (Email/Password + Google)
 * - Firestore
 * - Cloud Functions
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  type User
} from 'firebase/auth';
import { 
  getFirestore,
  connectFirestoreEmulator
} from 'firebase/firestore';
import {
  getFunctions,
  connectFunctionsEmulator
} from 'firebase/functions';

// ============================================
// FIREBASE CONFIG
// ============================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validación en desarrollo
if (import.meta.env.DEV && !firebaseConfig.apiKey) {
  console.error('[FIREBASE] ⚠️ Variables de entorno no configuradas. Crea .env.local con las credenciales.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ============================================
// EXPORTS - AUTH, DB, FUNCTIONS
// ============================================

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Agregar scopes necesarios
googleProvider.addScope('email');
googleProvider.addScope('profile');
// Forzar selección de cuenta y consentimiento
googleProvider.setCustomParameters({
  prompt: 'consent select_account'
});

// ============================================
// EMULATORS (desarrollo local)
// ============================================

// Conectar a emuladores si está en desarrollo y configurado
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  console.info('[FIREBASE] Conectando a emuladores...');
  
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.info('[FIREBASE] Emuladores conectados');
  } catch (error) {
    console.warn('[FIREBASE] Error conectando emuladores:', error);
  }
}

// ============================================
// TIPOS
// ============================================

/**
 * Rol del usuario en el sistema
 * - admin: Control total, puede gestionar entregas y usuarios
 * - client: Solo lectura de sus entregas + acuse de recibo
 * - driver_mock: Rol mock para chofer (sin lógica avanzada en V1)
 */
export type UserRole = 'admin' | 'client' | 'driver_mock';

/**
 * Proveedor de autenticación
 */
export type AuthProvider = 'password' | 'google';

/**
 * Perfil de usuario almacenado en Firestore
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  clientId: string | null;
  provider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Traduce códigos de error de Firebase a mensajes amigables
 */
export function getFirebaseErrorMessage(error: unknown): string {
  const firebaseError = error as { code?: string; message?: string };
  
  switch (firebaseError.code) {
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/user-disabled':
      return 'Usuario deshabilitado';
    case 'auth/user-not-found':
      return 'Usuario no encontrado';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Contraseña incorrecta';
    case 'auth/email-already-in-use':
      return 'Este email ya está registrado';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intenta más tarde';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu internet';
    case 'auth/popup-closed-by-user':
      return 'Inicio de sesión cancelado, intente nuevamente';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente. Permite los popups para este sitio.';
    default:
      return firebaseError.message || 'Error al autenticar';
  }
}

// Re-export para uso externo
export { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  type User 
};
