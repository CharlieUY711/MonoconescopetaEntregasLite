/**
 * CONFIGURACI�N DE ENTORNO - mod-auth-email-verificacion
 */

import type { FirebaseConfig } from '../types';

export const ENV_VAR_NAMES = {
  API_KEY: 'VITE_FIREBASE_API_KEY',
  AUTH_DOMAIN: 'VITE_FIREBASE_AUTH_DOMAIN',
  PROJECT_ID: 'VITE_FIREBASE_PROJECT_ID',
  STORAGE_BUCKET: 'VITE_FIREBASE_STORAGE_BUCKET',
  MESSAGING_SENDER_ID: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  APP_ID: 'VITE_FIREBASE_APP_ID',
  MEASUREMENT_ID: 'VITE_FIREBASE_MEASUREMENT_ID',
} as const;

function getEnvVar(name: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[name];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  return undefined;
}

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

export function validateFirebaseConfig(config: Partial<FirebaseConfig>): config is FirebaseConfig {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  for (const field of required) {
    if (!config[field as keyof FirebaseConfig]) {
      return false;
    }
  }
  return true;
}

export function resolveFirebaseConfig(propsConfig?: FirebaseConfig): FirebaseConfig {
  if (propsConfig && validateFirebaseConfig(propsConfig)) {
    return propsConfig;
  }
  const envConfig = getFirebaseConfigFromEnv();
  if (envConfig) {
    return envConfig;
  }
  throw new Error('[mod-auth-email-verificacion] No se encontr� configuraci�n de Firebase.');
}
