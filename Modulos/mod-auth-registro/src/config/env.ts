/**
 * CONFIGURACI�N DE ENTORNO - mod-auth-registro
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
 */
function getEnvVar(name: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[name];
  }
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
 * Valida configuraci�n de Firebase
 */
export function validateFirebaseConfig(config: Partial<FirebaseConfig>): config is FirebaseConfig {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  
  for (const field of required) {
    if (!config[field as keyof FirebaseConfig]) {
      console.error(`[mod-auth-registro] Campo requerido faltante: ${field}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Resuelve la configuraci�n de Firebase
 */
export function resolveFirebaseConfig(propsConfig?: FirebaseConfig): FirebaseConfig {
  if (propsConfig && validateFirebaseConfig(propsConfig)) {
    return propsConfig;
  }

  const envConfig = getFirebaseConfigFromEnv();
  if (envConfig) {
    return envConfig;
  }

  throw new Error(
    '[mod-auth-registro] No se encontr� configuraci�n de Firebase. ' +
    'Proporciona firebaseConfig como prop o configura las variables de entorno.'
  );
}

/**
 * Prefijos telef�nicos por defecto
 */
export const DEFAULT_PHONE_PREFIXES = [
  { code: '+598', country: '???? Uruguay', short: 'UY' },
  { code: '+54', country: '???? Argentina', short: 'AR' },
  { code: '+55', country: '???? Brasil', short: 'BR' },
  { code: '+56', country: '???? Chile', short: 'CL' },
  { code: '+57', country: '???? Colombia', short: 'CO' },
  { code: '+51', country: '???? Per�', short: 'PE' },
  { code: '+595', country: '???? Paraguay', short: 'PY' },
  { code: '+591', country: '???? Bolivia', short: 'BO' },
  { code: '+593', country: '???? Ecuador', short: 'EC' },
  { code: '+58', country: '???? Venezuela', short: 'VE' },
  { code: '+52', country: '???? M�xico', short: 'MX' },
  { code: '+1', country: '???? Estados Unidos', short: 'US' },
  { code: '+34', country: '???? Espa�a', short: 'ES' },
];
