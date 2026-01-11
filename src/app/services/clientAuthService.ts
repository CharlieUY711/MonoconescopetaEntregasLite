/**
 * CLIENT AUTH SERVICE - ODDY Entregas Lite V1
 * 
 * Servicio para autenticación de clientes:
 * - Flujo de email con código de verificación
 * - Login con Google
 * - Linking de credenciales
 */

import { 
  auth, 
  db, 
  functions, 
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  getFirebaseErrorMessage,
  type User
} from '../../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  linkWithCredential, 
  EmailAuthProvider,
  fetchSignInMethodsForEmail
} from 'firebase/auth';

// ============================================
// TIPOS
// ============================================

export interface CheckEmailResult {
  exists: boolean;
  email: string;
}

export interface RequestCodeResult {
  success: boolean;
  message: string;
  email: string;
}

export interface VerifyCodeResult {
  success: boolean;
  message: string;
  verified: boolean;
}

export interface FinalizeResult {
  success: boolean;
  uid: string;
  email: string;
  message: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export type AuthStep = 
  | 'EMAIL_STEP'           // Input email
  | 'LOGIN_STEP'           // Email existe, pedir password
  | 'REGISTER_START'       // Email no existe, pedir datos + password
  | 'VERIFY_CODE'          // Verificar código
  | 'DONE'                 // Completado
  | 'ERROR';               // Error

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
 * Valida contraseña (mínimo 6 caracteres)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Valida código de verificación (6 dígitos)
 */
export function isValidCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

// ============================================
// CLOUD FUNCTION CALLS
// ============================================

/**
 * Verifica si un email está registrado
 */
export async function checkEmailExists(email: string): Promise<CheckEmailResult> {
  const checkFn = httpsCallable<{ email: string }, CheckEmailResult>(
    functions, 
    'checkEmailExists'
  );
  
  const result = await checkFn({ email: normalizeEmail(email) });
  return result.data;
}

/**
 * Solicita código de verificación por email
 */
export async function requestEmailCode(data: RegistrationData): Promise<RequestCodeResult> {
  const requestFn = httpsCallable<RegistrationData, RequestCodeResult>(
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
 * Verifica el código ingresado
 */
export async function verifyEmailCode(email: string, code: string): Promise<VerifyCodeResult> {
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

/**
 * Finaliza el registro creando la cuenta
 */
export async function finalizeRegistration(email: string): Promise<FinalizeResult> {
  const finalizeFn = httpsCallable<{ email: string }, FinalizeResult>(
    functions, 
    'finalizeRegistration'
  );
  
  const result = await finalizeFn({ email: normalizeEmail(email) });
  return result.data;
}

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Login con email y password
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(
    auth, 
    normalizeEmail(email), 
    password
  );
  return userCredential.user;
}

/**
 * Login con Google
 * Maneja caso de cuenta existente con diferente credencial
 */
export async function loginWithGoogle(): Promise<{
  user: User;
  isNew: boolean;
  needsLinking?: boolean;
  email?: string;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Verificar si es nuevo usuario (no tiene profile en Firestore)
    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    const isNew = !profileDoc.exists();
    
    // Si es nuevo, crear perfil
    if (isNew) {
      const now = serverTimestamp();
      const email = normalizeEmail(user.email || '');
      const displayName = user.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Crear en users
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        displayName,
        role: 'client',
        clientId: null,
        provider: 'google',
        createdAt: now,
        updatedAt: now,
      });
      
      // Crear en client_accounts
      await setDoc(doc(db, 'client_accounts', email), {
        email,
        emailNormalized: email,
        uid: user.uid,
        status: 'active',
        authProvider: 'google',
        createdAt: now,
        updatedAt: now,
      });
      
      // Crear en client_profiles
      await setDoc(doc(db, 'client_profiles', user.uid), {
        firstName,
        lastName,
        email,
        phone: null,
        entity: null,
        address: null,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    return { user, isNew };
  } catch (error: unknown) {
    const authError = error as { code?: string; customData?: { email?: string } };
    
    // Caso: cuenta existe con diferente credencial
    if (authError.code === 'auth/account-exists-with-different-credential') {
      const email = authError.customData?.email;
      if (email) {
        return {
          user: null as unknown as User,
          isNew: false,
          needsLinking: true,
          email,
        };
      }
    }
    
    throw error;
  }
}

/**
 * Vincula credencial de Google a cuenta existente con password
 */
export async function linkGoogleToPassword(
  email: string, 
  password: string
): Promise<User> {
  // Primero login con email/password
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Obtener credencial de Google
  const googleResult = await signInWithPopup(auth, googleProvider);
  const googleCredential = EmailAuthProvider.credential(
    googleResult.user.email || '',
    '' // No se usa para linking
  );
  
  // Vincular
  await linkWithCredential(userCredential.user, googleCredential);
  
  return userCredential.user;
}

/**
 * Obtiene los métodos de login disponibles para un email
 */
export async function getSignInMethods(email: string): Promise<string[]> {
  return fetchSignInMethodsForEmail(auth, normalizeEmail(email));
}

// ============================================
// ERROR HANDLING
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
  
  // Errores específicos de Cloud Functions
  if (fnError.code?.includes('functions/')) {
    const code = fnError.code.replace('functions/', '');
    
    switch (code) {
      case 'invalid-argument':
        return fnError.message || 'Datos inválidos';
      case 'already-exists':
        return fnError.message || 'Este email ya está registrado';
      case 'not-found':
        return fnError.message || 'No encontrado';
      case 'resource-exhausted':
        return fnError.message || 'Demasiados intentos';
      case 'deadline-exceeded':
        return fnError.message || 'Tiempo expirado';
      case 'failed-precondition':
        return fnError.message || 'Condición no cumplida';
      case 'unauthenticated':
        return 'Debes iniciar sesión';
      case 'permission-denied':
        return 'No tienes permiso';
      case 'internal':
        return 'Error del servidor. Intenta nuevamente.';
      default:
        return fnError.message || 'Error inesperado';
    }
  }
  
  // Intentar usar el mensaje de Firebase Auth
  return getFirebaseErrorMessage(error);
}
