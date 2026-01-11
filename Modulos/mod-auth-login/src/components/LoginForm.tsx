/**
 * COMPONENTE LoginForm - mod-auth-login
 * 
 * Formulario de login con email/password.
 * Basado en ClientAccessInline.tsx del proyecto original.
 */

import React, { useState, useEffect } from 'react';
import { useLogin } from '../core/useLogin';
import type { LoginFormProps, ThemeConfig } from '../types';

// ============================================
// ESTILOS POR DEFECTO
// ============================================

const defaultTheme: ThemeConfig = {
  primaryColor: '#00A9CE',
  secondaryColor: '#6366f1',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  errorColor: '#ef4444',
  successColor: '#22c55e',
  borderRadius: '0.375rem',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  buttonStyle: 'filled',
};

// ============================================
// ICONOS INLINE
// ============================================

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function LoginForm({
  onSuccess,
  onError,
  onNavigateToRegister,
  onForgotPassword,
  firebaseConfig,
  theme: themeProp,
  initialEmail = '',
  showRememberMe = false,
  showForgotPassword = true,
  labels = {},
}: LoginFormProps) {
  const theme = { ...defaultTheme, ...themeProp };
  
  const {
    state,
    setEmail,
    setPassword,
    setRememberMe,
    checkEmail,
    login,
    sendPasswordReset,
    clearError,
  } = useLogin({
    firebaseConfig,
    onSuccess,
    onError,
  });

  const [showPassword, setShowPassword] = useState(false);

  // Inicializar email si se proporciona
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail, setEmail]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const exists = await checkEmail();
    
    if (!exists && onNavigateToRegister) {
      onNavigateToRegister(state.email);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login();
  };

  const handleForgotPassword = async () => {
    if (onForgotPassword) {
      onForgotPassword(state.email);
    } else {
      await sendPasswordReset();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (state.step === 'EMAIL') {
        handleEmailSubmit(e);
      } else {
        handleLogin(e);
      }
    }
  };

  // ============================================
  // ESTILOS DIN�MICOS
  // ============================================

  const styles = {
    container: {
      fontFamily: theme.fontFamily,
      color: theme.textColor,
    },
    input: {
      height: '40px',
      width: '100%',
      padding: '0 12px',
      fontSize: '14px',
      borderRadius: theme.borderRadius,
      border: `1px solid ${theme.primaryColor}40`,
      backgroundColor: theme.backgroundColor,
      outline: 'none',
    },
    inputFocused: {
      borderColor: theme.primaryColor,
    },
    inputError: {
      borderColor: theme.errorColor,
    },
    inputSuccess: {
      borderColor: theme.successColor,
    },
    button: {
      height: '40px',
      width: '100%',
      fontSize: '14px',
      fontWeight: 500,
      borderRadius: theme.borderRadius,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      border: theme.buttonStyle === 'outline' ? `1px solid ${theme.primaryColor}` : 'none',
      backgroundColor: theme.buttonStyle === 'outline' ? 'transparent' : theme.primaryColor,
      color: theme.buttonStyle === 'outline' ? theme.primaryColor : '#ffffff',
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    message: {
      padding: '8px 12px',
      fontSize: '12px',
      borderRadius: theme.borderRadius,
      textAlign: 'center' as const,
    },
    errorMessage: {
      backgroundColor: `${theme.errorColor}10`,
      border: `1px solid ${theme.errorColor}40`,
      color: theme.errorColor,
    },
    successMessage: {
      backgroundColor: `${theme.successColor}10`,
      border: `1px solid ${theme.successColor}40`,
      color: theme.successColor,
    },
    link: {
      color: theme.primaryColor,
      fontSize: '12px',
      cursor: 'pointer',
      textDecoration: 'none',
      background: 'none',
      border: 'none',
      padding: 0,
    },
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div style={styles.container}>
      <form onSubmit={state.step === 'EMAIL' ? handleEmailSubmit : handleLogin}>
        {/* Email Input */}
        <div style={{ marginBottom: '12px' }}>
          <input
            type="email"
            value={state.email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={labels.emailPlaceholder || 'Ingrese su correo'}
            disabled={state.loading || state.step === 'PASSWORD'}
            style={{
              ...styles.input,
              ...(state.step === 'PASSWORD' ? styles.inputSuccess : {}),
            }}
          />
        </div>

        {/* Password Input (solo en step PASSWORD) */}
        {state.step === 'PASSWORD' && (
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={state.password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={labels.passwordPlaceholder || 'Ingrese su contrase�a'}
              autoFocus
              disabled={state.loading}
              style={{
                ...styles.input,
                paddingRight: '40px',
                ...(state.error ? styles.inputError : {}),
                ...(state.success ? styles.inputSuccess : {}),
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: theme.textColor,
                opacity: 0.6,
              }}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        {/* Remember Me */}
        {showRememberMe && state.step === 'PASSWORD' && (
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={state.rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '12px', cursor: 'pointer' }}>
              {labels.rememberMeLabel || 'Recordarme'}
            </label>
          </div>
        )}

        {/* Error / Success Message */}
        {(state.error || state.success) && (
          <div
            style={{
              ...styles.message,
              ...(state.error ? styles.errorMessage : styles.successMessage),
              marginBottom: '12px',
            }}
          >
            {state.error || state.success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={state.loading || (!state.email && state.step === 'EMAIL') || (!state.password && state.step === 'PASSWORD')}
          style={{
            ...styles.button,
            ...(state.loading ? styles.buttonDisabled : {}),
          }}
        >
          {state.loading && (
            <LoaderIcon 
              className="animate-spin" 
              style={{ width: '16px', height: '16px' }} 
            />
          )}
          {state.step === 'EMAIL' 
            ? (labels.submitButton || 'Continuar')
            : (labels.submitButton || 'Acceder')
          }
        </button>

        {/* Forgot Password Link */}
        {showForgotPassword && state.step === 'PASSWORD' && (
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={state.loading}
              style={styles.link}
            >
              {labels.forgotPasswordLink || '�Olvidaste tu contrase�a?'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
