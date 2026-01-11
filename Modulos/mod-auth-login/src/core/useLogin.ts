/**
 * HOOK useLogin - mod-auth-login
 * 
 * Hook de React para manejar el estado y l�gica de login.
 */

import { useState, useCallback } from 'react';
import { createLoginService, isValidEmail, isValidPassword } from './loginService';
import type { 
  UseLoginOptions, 
  UseLoginReturn, 
  LoginFormState,
  AuthUser 
} from '../types';

const initialState: LoginFormState = {
  email: '',
  password: '',
  rememberMe: false,
  loading: false,
  error: null,
  success: null,
  step: 'EMAIL',
};

/**
 * Hook para manejar el flujo de login
 */
export function useLogin(options: UseLoginOptions = {}): UseLoginReturn {
  const [state, setState] = useState<LoginFormState>(initialState);
  
  const service = createLoginService({
    firebaseConfig: options.firebaseConfig,
  });

  // Setters
  const setEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, email, error: null }));
  }, []);

  const setPassword = useCallback((password: string) => {
    setState(prev => ({ ...prev, password, error: null }));
  }, []);

  const setRememberMe = useCallback((rememberMe: boolean) => {
    setState(prev => ({ ...prev, rememberMe }));
  }, []);

  // Verificar email
  const checkEmail = useCallback(async (): Promise<boolean> => {
    if (!isValidEmail(state.email)) {
      setState(prev => ({ ...prev, error: 'Ingresa un email v�lido' }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await service.checkEmail(state.email);
      
      if (result.exists) {
        setState(prev => ({ ...prev, loading: false, step: 'PASSWORD' }));
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Este email no est� registrado' 
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al verificar email';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      return false;
    }
  }, [state.email, service, options]);

  // Login
  const login = useCallback(async (): Promise<AuthUser | null> => {
    if (!isValidPassword(state.password)) {
      setState(prev => ({ 
        ...prev, 
        error: 'La contrase�a debe tener al menos 6 caracteres' 
      }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const user = await service.login(state.email, state.password);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        success: 'Login correcto' 
      }));
      
      options.onSuccess?.(user);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesi�n';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      return null;
    }
  }, [state.email, state.password, service, options]);

  // Reset password
  const sendPasswordReset = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await service.sendPasswordReset(state.email);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        success: 'Email de recuperaci�n enviado. Revisa tu bandeja de entrada.',
        step: 'EMAIL',
        password: '',
      }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar email';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return false;
    }
  }, [state.email, service]);

  // Reset form
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    state,
    setEmail,
    setPassword,
    setRememberMe,
    checkEmail,
    login,
    sendPasswordReset,
    reset,
    clearError,
  };
}
