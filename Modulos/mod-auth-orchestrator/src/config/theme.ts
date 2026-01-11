/**
 * CONFIGURACI�N DE TEMA - mod-auth-orchestrator
 * 
 * Manejo de tema visual para los m�dulos de autenticaci�n.
 */

import type { ThemeConfig } from '../types';

/**
 * Tema por defecto
 */
export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#00A9CE',
  secondaryColor: '#6366f1',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  errorColor: '#ef4444',
  successColor: '#22c55e',
  borderRadius: '0.5rem',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  buttonStyle: 'filled',
};

/**
 * Clave de localStorage para el tema
 */
const THEME_STORAGE_KEY = 'mod-auth-theme';

/**
 * Guarda tema en localStorage
 */
export function saveTheme(theme: ThemeConfig): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.warn('[mod-auth-orchestrator] No se pudo guardar el tema:', error);
  }
}

/**
 * Carga tema desde localStorage
 */
export function loadTheme(): ThemeConfig | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ThemeConfig;
    }
  } catch (error) {
    console.warn('[mod-auth-orchestrator] No se pudo cargar el tema:', error);
  }
  return null;
}

/**
 * Elimina tema de localStorage
 */
export function clearTheme(): void {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.warn('[mod-auth-orchestrator] No se pudo eliminar el tema:', error);
  }
}

/**
 * Resuelve el tema a usar:
 * 1. Tema pasado por props
 * 2. Tema guardado en localStorage
 * 3. Tema por defecto
 */
export function resolveTheme(propsTheme?: Partial<ThemeConfig>): ThemeConfig {
  const storedTheme = loadTheme();
  
  return {
    ...DEFAULT_THEME,
    ...storedTheme,
    ...propsTheme,
  };
}

/**
 * Valida que un tema tenga todas las propiedades requeridas
 */
export function validateTheme(theme: Partial<ThemeConfig>): boolean {
  const required = [
    'primaryColor',
    'secondaryColor', 
    'backgroundColor',
    'textColor',
    'errorColor',
    'successColor',
    'borderRadius',
  ];
  
  return required.every(key => 
    theme[key as keyof ThemeConfig] !== undefined && 
    theme[key as keyof ThemeConfig] !== ''
  );
}

/**
 * Genera CSS variables desde un tema
 */
export function themeToCSS(theme: ThemeConfig): string {
  return `
    --auth-primary: ${theme.primaryColor};
    --auth-secondary: ${theme.secondaryColor};
    --auth-background: ${theme.backgroundColor};
    --auth-text: ${theme.textColor};
    --auth-error: ${theme.errorColor};
    --auth-success: ${theme.successColor};
    --auth-radius: ${theme.borderRadius};
    --auth-font: ${theme.fontFamily || DEFAULT_THEME.fontFamily};
  `;
}
