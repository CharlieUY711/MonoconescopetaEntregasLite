/**
 * CLIENTE FIREBASE - mod-auth-registro
 * 
 * Inicializaci�n y gesti�n del cliente Firebase para registro.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, type Auth, type User } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { 
  FirebaseConfig, 
  RegistrationData, 
  RequestCodeResult, 
  FinalizeResult 
} from '../../types';
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
// CLOUD FUNCTIONS
// ============================================

/**
 * Verifica si un email ya est� registrado
 */
export async function checkEmailExists(
  email: string,
  config?: FirebaseConfig
): Promise<{ exists: boolean; email: string }> {
  const app = createFirebaseClient(config);
  const functions = getFunctions(app);
  
  const checkFn = httpsCallable<{ email: string }, { exists: boolean; email: string }>(
    functions, 
    'checkEmailExists'
  );
  
  const normalizedEmail = email.trim().toLowerCase();
  const result = await checkFn({ email: normalizedEmail });
  
  return result.data;
}

/**
 * Solicita c�digo de verificaci�n por email
 */
export async function requestEmailCode(
  data: RegistrationData,
  config?: FirebaseConfig
): Promise<RequestCodeResult> {
  const app = createFirebaseClient(config);
  const functions = getFunctions(app);
  
  const requestFn = httpsCallable<RegistrationData, RequestCodeResult>(
    functions, 
    'requestEmailCode'
  );
  
  const result = await requestFn({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone?.trim(),
  });
  
  return result.data;
}

/**
 * Verifica el c�digo ingresado
 */
export async function verifyEmailCode(
  email: string, 
  code: string,
  config?: FirebaseConfig
): Promise<{ success: boolean; message: string; verified: boolean }> {
  const app = createFirebaseClient(config);
  const functions = getFunctions(app);
  
  const verifyFn = httpsCallable<
    { email: string; code: string }, 
    { success: boolean; message: string; verified: boolean }
  >(functions, 'verifyEmailCode');
  
  const result = await verifyFn({ 
    email: email.trim().toLowerCase(), 
    code 
  });
  
  return result.data;
}

/**
 * Finaliza el registro creando la cuenta
 */
export async function finalizeRegistration(
  email: string,
  config?: FirebaseConfig
): Promise<FinalizeResult> {
  const app = createFirebaseClient(config);
  const functions = getFunctions(app);
  
  const finalizeFn = httpsCallable<{ email: string }, FinalizeResult>(
    functions, 
    'finalizeRegistration'
  );
  
  const result = await finalizeFn({ email: email.trim().toLowerCase() });
  return result.data;
}

/**
 * Login despu�s de registrar (para auto-login)
 */
export async function loginAfterRegister(
  email: string,
  password: string,
  config?: FirebaseConfig
): Promise<User> {
  const auth = getFirebaseAuth(config);
  const userCredential = await signInWithEmailAndPassword(
    auth, 
    email.trim().toLowerCase(), 
    password
  );
  return userCredential.user;
}

// ============================================
// MANEJO DE ERRORES
// ============================================

/**
 * Traduce errores de Cloud Functions a mensajes amigables
 */
export function getCloudFunctionErrorMessage(error: unknown): string {
  const fnError = error as { 
    code?: string; 
    message?: string;
    details?: string;
  };
  
  if (fnError.code?.includes('functions/')) {
    const code = fnError.code.replace('functions/', '');
    
    switch (code) {
      case 'invalid-argument':
        return fnError.message || 'Datos inv�lidos';
      case 'already-exists':
        return fnError.message || 'Este email ya est� registrado';
      case 'not-found':
        return fnError.message || 'No encontrado';
      case 'resource-exhausted':
        return fnError.message || 'Demasiados intentos';
      case 'deadline-exceeded':
        return fnError.message || 'Tiempo expirado';
      case 'failed-precondition':
        return fnError.message || 'Condici�n no cumplida';
      case 'unauthenticated':
        return 'Debes iniciar sesi�n';
      case 'permission-denied':
        return 'No tienes permiso';
      case 'internal':
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return fnError.message || 'Error inesperado';
    }
  }
  
  // Errores de Firebase Auth
  const firebaseError = error as { code?: string; message?: string };
  switch (firebaseError.code) {
    case 'auth/email-already-in-use':
      return 'Este email ya est� registrado';
    case 'auth/weak-password':
      return 'La contrase�a debe tener al menos 6 caracteres';
    case 'auth/invalid-email':
      return 'Email inv�lido';
    default:
      return firebaseError.message || 'Error al registrar';
  }
}
