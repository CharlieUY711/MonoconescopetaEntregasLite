/**
 * HOOK useRegister - mod-auth-registro
 * 
 * Hook de React para manejar el estado y l�gica de registro.
 */

import { useState, useCallback } from 'react';
import { 
  createRegisterService, 
  isValidEmail, 
  isValidPassword, 
  isValidName,
  isValidCode,
  passwordsMatch,
} from './registerService';
import type { 
  UseRegisterOptions, 
  UseRegisterReturn, 
  RegisterFormState,
  FinalizeResult,
  RegistrationData,
} from '../types';

const initialState: RegisterFormState = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phonePrefix: '+598',
  phone: '',
  code: '',
  loading: false,
  error: null,
  success: null,
  step: 'FORM',
};

/**
 * Hook para manejar el flujo de registro
 */
export function useRegister(options: UseRegisterOptions = {}): UseRegisterReturn {
  const [state, setState] = useState<RegisterFormState>(initialState);
  
  const service = createRegisterService({
    firebaseConfig: options.firebaseConfig,
    requireEmailVerification: options.requireEmailVerification,
  });

  // Setters
  const setEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, email, error: null }));
  }, []);

  const setPassword = useCallback((password: string) => {
    setState(prev => ({ ...prev, password, error: null }));
  }, []);

  const setConfirmPassword = useCallback((confirmPassword: string) => {
    setState(prev => ({ ...prev, confirmPassword, error: null }));
  }, []);

  const setFirstName = useCallback((firstName: string) => {
    setState(prev => ({ ...prev, firstName, error: null }));
  }, []);

  const setLastName = useCallback((lastName: string) => {
    setState(prev => ({ ...prev, lastName, error: null }));
  }, []);

  const setPhonePrefix = useCallback((phonePrefix: string) => {
    setState(prev => ({ ...prev, phonePrefix }));
  }, []);

  const setPhone = useCallback((phone: string) => {
    // Solo n�meros
    const cleaned = phone.replace(/\D/g, '');
    setState(prev => ({ ...prev, phone: cleaned }));
  }, []);

  const setCode = useCallback((code: string) => {
    // Solo n�meros, m�ximo 6
    const cleaned = code.replace(/\D/g, '').slice(0, 6);
    setState(prev => ({ ...prev, code: cleaned, error: null }));
  }, []);

  // Validar formulario
  const validate = useCallback((): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!isValidEmail(state.email)) {
      errors.push('Ingresa un email v�lido');
    }

    if (!isValidPassword(state.password)) {
      errors.push('La contrase�a debe tener al menos 6 caracteres');
    }

    if (!passwordsMatch(state.password, state.confirmPassword)) {
      errors.push('Las contrase�as no coinciden');
    }

    if (!isValidName(state.firstName)) {
      errors.push('Ingresa tu nombre');
    }

    if (!isValidName(state.lastName)) {
      errors.push('Ingresa tu apellido');
    }

    return { valid: errors.length === 0, errors };
  }, [state]);

  // Obtener datos de registro
  const getRegistrationData = useCallback((): RegistrationData => {
    const fullPhone = state.phone ? `${state.phonePrefix}${state.phone}` : undefined;
    return {
      email: state.email,
      password: state.password,
      firstName: state.firstName,
      lastName: state.lastName,
      phone: fullPhone,
    };
  }, [state]);

  // Solicitar c�digo
  const requestCode = useCallback(async (): Promise<boolean> => {
    const validation = validate();
    if (!validation.valid) {
      setState(prev => ({ ...prev, error: validation.errors[0] }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await service.requestCode(getRegistrationData());
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        success: 'C�digo enviado a tu correo',
        step: 'VERIFY_CODE',
      }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar c�digo';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      return false;
    }
  }, [validate, getRegistrationData, service, options]);

  // Verificar y finalizar
  const verifyAndFinalize = useCallback(async (): Promise<FinalizeResult | null> => {
    if (!isValidCode(state.code)) {
      setState(prev => ({ ...prev, error: 'Ingresa el c�digo de 6 d�gitos' }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await service.verifyAndFinalize(
        state.email, 
        state.code, 
        state.password
      );
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        success: 'Registro completado correctamente',
        step: 'DONE',
      }));
      
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al verificar c�digo';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      return null;
    }
  }, [state.email, state.code, state.password, service, options]);

  // Reenviar c�digo
  const resendCode = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null, code: '' }));

    try {
      await service.resendCode(getRegistrationData());
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        success: 'C�digo reenviado',
      }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al reenviar c�digo';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return false;
    }
  }, [getRegistrationData, service]);

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
    setConfirmPassword,
    setFirstName,
    setLastName,
    setPhonePrefix,
    setPhone,
    setCode,
    requestCode,
    verifyAndFinalize,
    resendCode,
    reset,
    clearError,
    validate,
  };
}
