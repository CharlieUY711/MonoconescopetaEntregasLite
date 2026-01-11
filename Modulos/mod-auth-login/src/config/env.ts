/**
 * CONFIGURACI�N DE ENTORNO - mod-auth-login
 * 
 * Manejo de variables de entorno para Firebase.
 * Soporta tanto props directas como env vars.
 */

import type { FirebaseConfig } from '../types';

/**
 * Nombres de las variables de entorno esperadas
 */
export const ENV_VAR_NAMES = {
  API_KEY: 'VITE_FIREBASE_API_KEY',
  AUTH_DOMAIN: 'VITE_FIREBASE_AUTH_DOMAIN',
  PROJECT_ID: 'VITE_FIREBASE_PROJECT_ID',
  STORAGE_BUCKET: 'VITE_FIREBASE_STORAGE_BUCKET',
  MESSAGING_SENDER_ID: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  APP_ID: 'VITE_FIREBASE_APP_ID',
  MEASUREMENT_ID: 'VITE_FIREBASE_MEASUREMENT_ID',
} as const;

/**
 * Obtiene un valor de las variables de entorno de forma segura.
 * Soporta Vite (import.meta.env) y Node (process.env).
 */
function getEnvVar(name: string): string | undefined {
  // Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[name];
  }
  // Node
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  return undefined;
}

/**
 * Obtiene la configuraci�n de Firebase desde variables de entorno
 */
export function getFirebaseConfigFromEnv(): FirebaseConfig | null {
  const apiKey = getEnvVar(ENV_VAR_NAMES.API_KEY);
  const authDomain = getEnvVar(ENV_VAR_NAMES.AUTH_DOMAIN);
  const projectId = getEnvVar(ENV_VAR_NAMES.PROJECT_ID);
  const appId = getEnvVar(ENV_VAR_NAMES.APP_ID);

  // Validar campos requeridos
  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: getEnvVar(ENV_VAR_NAMES.STORAGE_BUCKET),
    messagingSenderId: getEnvVar(ENV_VAR_NAMES.MESSAGING_SENDER_ID),
    appId,
    measurementId: getEnvVar(ENV_VAR_NAMES.MEASUREMENT_ID),
  };
}

/**
 * Valida que una configuraci�n de Firebase tenga todos los campos requeridos
 */
export function validateFirebaseConfig(config: Partial<FirebaseConfig>): config is FirebaseConfig {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  
  for (const field of required) {
    if (!config[field as keyof FirebaseConfig]) {
      console.error(`[mod-auth-login] Campo requerido faltante: ${field}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Resuelve la configuraci�n de Firebase:
 * 1. Usa config pasada por props si existe
 * 2. Si no, intenta obtener de env vars
 * 3. Si no hay ninguna, lanza error
 */
export function resolveFirebaseConfig(propsConfig?: FirebaseConfig): FirebaseConfig {
  // Opci�n 1: Config por props
  if (propsConfig && validateFirebaseConfig(propsConfig)) {
    return propsConfig;
  }

  // Opci�n 2: Config por env vars
  const envConfig = getFirebaseConfigFromEnv();
  if (envConfig) {
    return envConfig;
  }

  // Error: No hay configuraci�n
  throw new Error(
    '[mod-auth-login] No se encontr� configuraci�n de Firebase. ' +
    'Proporciona firebaseConfig como prop o configura las variables de entorno: ' +
    Object.values(ENV_VAR_NAMES).join(', ')
  );
}
