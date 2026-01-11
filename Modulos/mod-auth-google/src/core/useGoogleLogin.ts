/**
 * HOOK useGoogleLogin - mod-auth-google
 * 
 * Hook de React para manejar el login con Google.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  loginWithGooglePopup,
  loginWithGoogleRedirect,
  getGoogleRedirectResult,
  linkGoogleWithPassword,
  getFirebaseErrorMessage,
} from '../adapters/firebase/client';
import type {
  UseGoogleLoginOptions,
  UseGoogleLoginReturn,
  GoogleLoginState,
  GoogleLoginResult,
  AuthUser,
} from '../types';

const initialState: GoogleLoginState = {
  loading: false,
  error: null,
  user: null,
};

/**
 * Hook para manejar el login con Google
 */
export function useGoogleLogin(options: UseGoogleLoginOptions = {}): UseGoogleLoginReturn {
  const [state, setState] = useState<GoogleLoginState>(initialState);
  const mode = options.mode || 'popup';

  // Verificar redirect result al montar (si mode es redirect)
  useEffect(() => {
    if (mode === 'redirect') {
      getGoogleRedirectResult(
        options.firebaseConfig,
        options.createProfile ?? true
      ).then((result) => {
        if (result) {
          if (result.needsLinking && result.email) {
            options.onNeedsLinking?.(result.email);
          } else {
            setState(prev => ({ ...prev, user: result.user }));
            options.onSuccess?.(result);
          }
        }
      }).catch((error) => {
        const errorMessage = getFirebaseErrorMessage(error);
        setState(prev => ({ ...prev, error: errorMessage }));
        options.onError?.(errorMessage);
      });
    }
  }, [mode]);

  // Login
  const login = useCallback(async (): Promise<GoogleLoginResult | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let result: GoogleLoginResult | null;

      if (mode === 'popup') {
        result = await loginWithGooglePopup(options.firebaseConfig, {
          additionalScopes: options.additionalScopes,
          forceAccountSelection: options.forceAccountSelection ?? true,
          createProfile: options.createProfile ?? true,
        });
      } else {
        // Redirect mode - el resultado se obtiene en useEffect
        await loginWithGoogleRedirect(options.firebaseConfig, {
          additionalScopes: options.additionalScopes,
          forceAccountSelection: options.forceAccountSelection ?? true,
        });
        return null;
      }

      // Manejar linking
      if (result.needsLinking && result.email) {
        setState(prev => ({ ...prev, loading: false }));
        options.onNeedsLinking?.(result.email);
        return result;
      }

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        user: result!.user 
      }));
      
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      return null;
    }
  }, [mode, options]);

  // Vincular con cuenta password
  const linkWithPassword = useCallback(async (
    email: string, 
    password: string
  ): Promise<AuthUser | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const user = await linkGoogleWithPassword(email, password, options.firebaseConfig);
      setState(prev => ({ ...prev, loading: false, user }));
      return user;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      options.onError?.(errorMessage);
      return null;
    }
  }, [options]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    state,
    login,
    clearError,
    linkWithPassword,
  };
}
