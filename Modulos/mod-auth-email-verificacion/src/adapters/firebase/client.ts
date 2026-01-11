/**
 * CLIENTE FIREBASE - mod-auth-email-verificacion
 * 
 * Llamadas a Cloud Functions para verificaci�n de email.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { 
  FirebaseConfig, 
  VerificationRequestData, 
  RequestCodeResult, 
  VerifyCodeResult 
} from '../../types';
import { resolveFirebaseConfig } from '../../config/env';

// ============================================
// SINGLETON
// ============================================

let firebaseApp: FirebaseApp | null = null;

export function createFirebaseClient(config?: FirebaseConfig): FirebaseApp {
  if (firebaseApp) return firebaseApp;

  const resolvedConfig = resolveFirebaseConfig(config);
  const existingApps = getApps();
  
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
  } else {
    firebaseApp = initializeApp(resolvedConfig);
  }

  return firebaseApp;
}

// ============================================
// HELPERS
// ============================================

/**
 * Normaliza email: trim + lowercase
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida c�digo de verificaci�n (6 d�gitos)
 */
export function isValidCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

// ============================================
// CLOUD FUNCTIONS
// ============================================

/**
 * Solicita c�digo de verificaci�n por email
 * 
 * Esta funci�n llama a la Cloud Function 'requestEmailCode' que:
 * 1. Genera c�digo de 6 d�gitos
 * 2. Hashea con bcrypt y guarda en email_verifications
 * 3. Env�a email via extensi�n Trigger Email
 */
export async function requestEmailCode(
  data: VerificationRequestData,
  config?: FirebaseConfig
): Promise<RequestCodeResult> {
  const app = createFirebaseClient(config);
  const functions = getFunctions(app);
  
  const requestFn = httpsCallable<VerificationRequestData, RequestCodeResult>(
    functions, 
    'requestEmailCode'
  );
  
  const result = await requestFn({
    email: normalizeEmail(data.email),
    password: data.password,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone?.trim(),
  });
  
  return result.data;
}

/**
 * Verifica el c�digo ingresado
 * 
 * Esta funci�n llama a la Cloud Function 'verifyEmailCode' que:
 * 1. Busca la verificaci�n por email
 * 2. Verifica expiraci�n y n�mero de intentos
 * 3. Compara c�digo con hash usando bcrypt
 * 4. Marca como verificado si es correcto
 */
export async function verifyEmailCode(
  email: string, 
  code: string,
  config?: FirebaseConfig
): Promise<VerifyCodeResult> {
  const app = createFirebaseClient(config);
  const functions = getFunctions(app);
  
  const verifyFn = httpsCallable<{ email: string; code: string }, VerifyCodeResult>(
    functions, 
    'verifyEmailCode'
  );
  
  const result = await verifyFn({ 
    email: normalizeEmail(email), 
    code 
  });
  
  return result.data;
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
  };
  
  if (fnError.code?.includes('functions/')) {
    const code = fnError.code.replace('functions/', '');
    
    switch (code) {
      case 'invalid-argument':
        return fnError.message || 'Datos inv�lidos';
      case 'not-found':
        return 'No se encontr� una solicitud de verificaci�n. Solicita un nuevo c�digo.';
      case 'resource-exhausted':
        return fnError.message || 'Demasiados intentos. Solicita un nuevo c�digo.';
      case 'deadline-exceeded':
        return 'El c�digo ha expirado. Solicita uno nuevo.';
      case 'failed-precondition':
        return fnError.message || 'Condici�n no cumplida';
      default:
        return fnError.message || 'Error inesperado';
    }
  }
  
  return fnError.message || 'Error al verificar';
}
