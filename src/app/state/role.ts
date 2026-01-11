/**
 * GESTIÓN DE ROLES - ODDY Entregas Lite V1
 * 
 * Sistema de roles para desarrollo/demo sin autenticación real.
 * Persiste en localStorage con clave: oddy_role_v1
 */

import { useState, useEffect, useCallback } from 'react';
import { ROLES_SISTEMA, type RolSistema } from '../data/catalogos';

const STORAGE_KEY = 'oddy_role_v1';
const DEFAULT_ROLE: RolSistema = 'Administrador';

// Cliente mock ID para filtrar entregas
export const MOCK_CLIENT_ID = 'client_001';

/**
 * Obtiene el rol actual del localStorage
 */
export function getRole(): RolSistema {
  if (typeof window === 'undefined') return DEFAULT_ROLE;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ROLES_SISTEMA.includes(stored as RolSistema)) {
    return stored as RolSistema;
  }
  return DEFAULT_ROLE;
}

/**
 * Guarda el rol en localStorage
 */
export function setRole(role: RolSistema): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, role);
  // Disparar evento para sincronizar entre componentes
  window.dispatchEvent(new CustomEvent('oddy_role_change', { detail: role }));
}

/**
 * Hook para usar y escuchar cambios de rol
 */
export function useRole(): [RolSistema, (role: RolSistema) => void] {
  const [role, setRoleState] = useState<RolSistema>(getRole);

  useEffect(() => {
    // Sincronizar con localStorage al montar
    setRoleState(getRole());

    // Escuchar cambios de rol
    const handleRoleChange = (e: CustomEvent<RolSistema>) => {
      setRoleState(e.detail);
    };

    window.addEventListener('oddy_role_change', handleRoleChange as EventListener);
    return () => {
      window.removeEventListener('oddy_role_change', handleRoleChange as EventListener);
    };
  }, []);

  const updateRole = useCallback((newRole: RolSistema) => {
    setRole(newRole);
    setRoleState(newRole);
  }, []);

  return [role, updateRole];
}

/**
 * Helpers para verificar permisos según rol
 */
export function canManageEntregas(role: RolSistema): boolean {
  return role === 'Administrador' || role === 'Chofer';
}

export function canAccessDatabase(role: RolSistema): boolean {
  return role === 'Administrador';
}

export function canAccessConfig(role: RolSistema): boolean {
  return role === 'Administrador';
}

export function canConfirmReceipt(role: RolSistema): boolean {
  return role === 'Cliente';
}

export function isClientRole(role: RolSistema): boolean {
  return role === 'Cliente';
}
