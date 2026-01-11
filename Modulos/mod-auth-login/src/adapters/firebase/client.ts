/**
 * CLIENTE FIREBASE - mod-auth-login
 * 
 * Inicializaci�n y gesti�n del cliente Firebase.
 * Singleton para evitar m�ltiples inicializaciones.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  type Auth,
  type User
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { FirebaseConfig, CheckEmailResult } from '../../types';
import { resolveFirebaseConfig } from '../../config/env';

// ============================================
// SINGLETON
// ============================================

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

/**
 * Inicializa o retorna el cliente Firebase existente
 */
export function createFirebaseClient(config?: FirebaseConfig): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  const resolvedConfig = resolveFirebaseConfig(config);
  
  // Verificar si ya existe una app inicializada
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
  } else {
    firebaseApp = initializeApp(resolvedConfig);
  }

  return firebaseApp;
}

/**
 * Obtiene la instancia de Auth
 */
export function getFirebaseAuth(config?: FirebaseConfig): Auth {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const app = createFirebaseClient(config);
  firebaseAuth = getAuth(app);
  return firebaseAuth;
}

// ============================================
// FUNCIONES DE AUTH
// ============================================

/**
 * Login con email y password
 */
export async function loginWithEmailPassword(
  email: string, 
  password: string,
  config?: FirebaseConfig
): Promise<User> {
  const auth = getFirebaseAuth(config);
  const normalizedEmail = email.trim().toLowerCase();
  
  const userCredential = await signInWithEmailAndPassword(
    auth, 
    normalizedEmail, 
    password
  );
  
  return userCredential.user;
}

/**
 * Env�a email de recuperaci�n de contrase�a
 */
export async function sendPasswordReset(
  email: string,
  config?: FirebaseConfig
): Promise<void> {
  const auth = getFirebaseAuth(config);
  const normalizedEmail = email.trim().toLowerCase();
  
  await sendPasswordResetEmail(auth, normalizedEmail);
}

/**
 * Obtiene los m�todos de login disponibles para un email
 */
export async function getSignInMethods(
  email: string,
  config?: FirebaseConfig
): Promise<string[]> {
  const auth = getFirebaseAuth(config);
  const normalizedEmail = email.trim().toLowerCase();
  
  return fetchSignInMethodsForEmail(auth, normalizedEmail);
}

/**
 * Verifica si un email existe (via Cloud Function)
 * NOTA: Requiere que la Cloud Function 'checkEmailExists' est� desplegada
 */
export async function checkEmailExists(
  email: string,
  config?: FirebaseConfig
): Promise<CheckEmailResult> {
  const app = createFirebaseClient(config);
  const functions = getFunctions(app);
  
  const checkFn = httpsCallable<{ email: string }, CheckEmailResult>(
    functions, 
    'checkEmailExists'
  );
  
  const normalizedEmail = email.trim().toLowerCase();
  const result = await checkFn({ email: normalizedEmail });
  
  return result.data;
}

// ============================================
// MANEJO DE ERRORES
// ============================================

/**
 * Traduce c�digos de error de Firebase a mensajes amigables en espa�ol
 */
export function getFirebaseErrorMessage(error: unknown): string {
  const firebaseError = error as { code?: string; message?: string };
  
  switch (firebaseError.code) {
    case 'auth/invalid-email':
      return 'Email inv�lido';
    case 'auth/user-disabled':
      return 'Usuario deshabilitado';
    case 'auth/user-not-found':
      return 'Usuario no encontrado';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Contrase�a incorrecta';
    case 'auth/email-already-in-use':
      return 'Este email ya est� registrado';
    case 'auth/weak-password':
      return 'La contrase�a debe tener al menos 6 caracteres';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intenta m�s tarde';
    case 'auth/network-request-failed':
      return 'Error de conexi�n. Verifica tu internet';
    case 'auth/popup-closed-by-user':
      return 'Inicio de sesi�n cancelado';
    case 'auth/popup-blocked':
      return 'El navegador bloque� la ventana emergente';
    default:
      return firebaseError.message || 'Error al autenticar';
  }
}
