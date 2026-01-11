/**
 * SERVICIO DE LOGIN - mod-auth-login
 * 
 * L�gica de negocio para login con email/password.
 * Extra�da de clientAuthService.ts del proyecto original.
 */

import {
  loginWithEmailPassword,
  sendPasswordReset,
  checkEmailExists,
  getFirebaseErrorMessage,
} from '../adapters/firebase/client';
import type { FirebaseConfig, AuthUser, CheckEmailResult } from '../types';

// ============================================
// VALIDACIONES
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
 * Valida contrase�a (m�nimo 6 caracteres)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

// ============================================
// SERVICIO PRINCIPAL
// ============================================

export interface LoginServiceConfig {
  firebaseConfig?: FirebaseConfig;
}

/**
 * Crea una instancia del servicio de login
 */
export function createLoginService(config?: LoginServiceConfig) {
  const firebaseConfig = config?.firebaseConfig;

  return {
    /**
     * Verifica si un email ya est� registrado
     */
    async checkEmail(email: string): Promise<CheckEmailResult> {
      if (!isValidEmail(email)) {
        throw new Error('Ingresa un email v�lido');
      }
      
      try {
        return await checkEmailExists(email, firebaseConfig);
      } catch (error) {
        throw new Error(getFirebaseErrorMessage(error));
      }
    },

    /**
     * Inicia sesi�n con email y password
     */
    async login(email: string, password: string): Promise<AuthUser> {
      // Validaciones
      if (!isValidEmail(email)) {
        throw new Error('Ingresa un email v�lido');
      }
      
      if (!isValidPassword(password)) {
        throw new Error('La contrase�a debe tener al menos 6 caracteres');
      }

      try {
        const user = await loginWithEmailPassword(email, password, firebaseConfig);
        
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
        };
      } catch (error) {
        throw new Error(getFirebaseErrorMessage(error));
      }
    },

    /**
     * Env�a email de recuperaci�n de contrase�a
     */
    async sendPasswordReset(email: string): Promise<void> {
      if (!isValidEmail(email)) {
        throw new Error('Ingresa un email v�lido');
      }

      try {
        await sendPasswordReset(email, firebaseConfig);
      } catch (error) {
        throw new Error(getFirebaseErrorMessage(error));
      }
    },
  };
}

// ============================================
// INSTANCIA POR DEFECTO
// ============================================

let defaultService: ReturnType<typeof createLoginService> | null = null;

/**
 * Obtiene la instancia por defecto del servicio de login
 */
export function getLoginService(config?: LoginServiceConfig) {
  if (!defaultService) {
    defaultService = createLoginService(config);
  }
  return defaultService;
}

// Re-exportar para conveniencia
export { getFirebaseErrorMessage };
