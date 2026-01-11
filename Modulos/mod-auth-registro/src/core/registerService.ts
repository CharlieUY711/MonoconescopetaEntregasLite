/**
 * SERVICIO DE REGISTRO - mod-auth-registro
 * 
 * L�gica de negocio para registro de usuarios.
 * Extra�da de clientAuthService.ts del proyecto original.
 */

import {
  checkEmailExists,
  requestEmailCode,
  verifyEmailCode,
  finalizeRegistration,
  loginAfterRegister,
  getCloudFunctionErrorMessage,
} from '../adapters/firebase/client';
import type { 
  FirebaseConfig, 
  RegistrationData, 
  RequestCodeResult, 
  FinalizeResult 
} from '../types';

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

/**
 * Valida c�digo de verificaci�n (6 d�gitos)
 */
export function isValidCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Valida nombre (m�nimo 2 caracteres)
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

/**
 * Valida que las contrase�as coincidan
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Valida datos de registro completos
 */
export function validateRegistrationData(data: RegistrationData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isValidEmail(data.email)) {
    errors.push('Email inv�lido');
  }

  if (!isValidPassword(data.password)) {
    errors.push('La contrase�a debe tener al menos 6 caracteres');
  }

  if (!isValidName(data.firstName)) {
    errors.push('Ingresa tu nombre (m�nimo 2 caracteres)');
  }

  if (!isValidName(data.lastName)) {
    errors.push('Ingresa tu apellido (m�nimo 2 caracteres)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// SERVICIO PRINCIPAL
// ============================================

export interface RegisterServiceConfig {
  firebaseConfig?: FirebaseConfig;
  requireEmailVerification?: boolean;
}

/**
 * Crea una instancia del servicio de registro
 */
export function createRegisterService(config?: RegisterServiceConfig) {
  const firebaseConfig = config?.firebaseConfig;
  const requireVerification = config?.requireEmailVerification ?? true;

  return {
    /**
     * Verifica si un email ya est� registrado
     */
    async checkEmail(email: string): Promise<boolean> {
      if (!isValidEmail(email)) {
        throw new Error('Ingresa un email v�lido');
      }
      
      try {
        const result = await checkEmailExists(email, firebaseConfig);
        return result.exists;
      } catch (error) {
        throw new Error(getCloudFunctionErrorMessage(error));
      }
    },

    /**
     * Solicita c�digo de verificaci�n
     */
    async requestCode(data: RegistrationData): Promise<RequestCodeResult> {
      const validation = validateRegistrationData(data);
      if (!validation.valid) {
        throw new Error(validation.errors[0]);
      }

      try {
        return await requestEmailCode(data, firebaseConfig);
      } catch (error) {
        throw new Error(getCloudFunctionErrorMessage(error));
      }
    },

    /**
     * Verifica c�digo y finaliza registro
     */
    async verifyAndFinalize(
      email: string, 
      code: string, 
      password: string
    ): Promise<FinalizeResult> {
      if (!isValidCode(code)) {
        throw new Error('Ingresa el c�digo de 6 d�gitos');
      }

      try {
        // 1. Verificar c�digo
        await verifyEmailCode(email, code, firebaseConfig);
        
        // 2. Finalizar registro
        const result = await finalizeRegistration(email, firebaseConfig);
        
        // 3. Auto-login
        await loginAfterRegister(email, password, firebaseConfig);
        
        return result;
      } catch (error) {
        throw new Error(getCloudFunctionErrorMessage(error));
      }
    },

    /**
     * Reenviar c�digo de verificaci�n
     */
    async resendCode(data: RegistrationData): Promise<RequestCodeResult> {
      try {
        return await requestEmailCode(data, firebaseConfig);
      } catch (error) {
        throw new Error(getCloudFunctionErrorMessage(error));
      }
    },

    /**
     * Validar datos antes de enviar
     */
    validate: validateRegistrationData,
  };
}

// Re-exportar para conveniencia
export { getCloudFunctionErrorMessage };
