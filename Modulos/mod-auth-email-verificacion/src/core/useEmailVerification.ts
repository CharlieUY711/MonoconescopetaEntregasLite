/**
 * HOOK useEmailVerification - mod-auth-email-verificacion
 * 
 * Hook de React para manejar la verificaci�n de email con c�digo.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  requestEmailCode,
  verifyEmailCode,
  isValidCode,
  getCloudFunctionErrorMessage,
} from '../adapters/firebase/client';
import type {
  UseEmailVerificationOptions,
  UseEmailVerificationReturn,
  VerificationFormState,
} from '../types';

const initialState: VerificationFormState = {
  code: '',
  loading: false,
  error: null,
  success: null,
  step: 'READY',
  codeStatus: 'idle',
  resendCooldown: 0,
};

const DEFAULT_COOLDOWN = 60; // segundos

/**
 * Hook para manejar verificaci�n de email
 */
export function useEmailVerification(
  options: UseEmailVerificationOptions
): UseEmailVerificationReturn {
  const [state, setState] = useState<VerificationFormState>(initialState);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  
  const cooldownSeconds = options.resendCooldown ?? DEFAULT_COOLDOWN;

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Iniciar countdown
  const startCountdown = useCallback(() => {
    setCountdown(cooldownSeconds);
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cooldownSeconds]);

  // Actualizar c�digo
  const setCode = useCallback((code: string) => {
    // Solo n�meros, m�ximo 6
    const cleaned = code.replace(/\D/g, '').slice(0, 6);
    setState(prev => ({ 
      ...prev, 
      code: cleaned, 
      error: null,
      codeStatus: 'idle',
    }));
  }, []);

  // Enviar c�digo
  const sendCode = useCallback(async (): Promise<boolean> => {
    if (!options.userData) {
      setState(prev => ({ 
        ...prev, 
        error: 'Datos de usuario requeridos para enviar c�digo' 
      }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await requestEmailCode(options.userData, options.firebaseConfig);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        success: 'C�digo enviado a tu correo',
        step: 'SENT',
      }));
      
      startCountdown();
      return true;
    } catch (error) {
      const errorMessage = getCloudFunctionErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        step: 'ERROR',
      }));
      options.onError?.(errorMessage);
      return false;
    }
  }, [options, startCountdown]);

  // Verificar c�digo
  const verifyCode = useCallback(async (): Promise<boolean> => {
    if (!isValidCode(state.code)) {
      setState(prev => ({ 
        ...prev, 
        error: 'Ingresa el c�digo de 6 d�gitos',
        codeStatus: 'error',
      }));
      return false;
    }

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      step: 'VERIFYING' 
    }));

    try {
      const result = await verifyEmailCode(
        options.email, 
        state.code, 
        options.firebaseConfig
      );
      
      if (result.verified) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          success: 'Email verificado correctamente',
          step: 'VERIFIED',
          codeStatus: 'success',
        }));
        
        options.onVerified?.(options.email);
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'C�digo inv�lido',
          codeStatus: 'error',
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = getCloudFunctionErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        codeStatus: 'error',
      }));
      options.onError?.(errorMessage);
      return false;
    }
  }, [state.code, options]);

  // Reenviar c�digo
  const resendCode = useCallback(async (): Promise<boolean> => {
    if (countdown > 0) {
      setState(prev => ({ 
        ...prev, 
        error: `Espera ${countdown} segundos antes de reenviar` 
      }));
      return false;
    }

    setState(prev => ({ 
      ...prev, 
      code: '', 
      codeStatus: 'idle',
      success: null,
    }));
    
    return sendCode();
  }, [countdown, sendCode]);

  // Limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Reset
  const reset = useCallback(() => {
    setState(initialState);
    setCountdown(0);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  }, []);

  return {
    state,
    setCode,
    sendCode,
    verifyCode,
    resendCode,
    clearError,
    reset,
    resendCountdown: countdown,
    canResend: countdown === 0 && !state.loading,
  };
}
