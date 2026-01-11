/**
 * COMPONENTE RegisterForm - mod-auth-registro
 * 
 * Formulario de registro de usuarios.
 * Basado en ClientAccessInline.tsx del proyecto original.
 */

import React, { useState, useEffect } from 'react';
import { useRegister } from '../core/useRegister';
import { DEFAULT_PHONE_PREFIXES } from '../config/env';
import type { RegisterFormProps, ThemeConfig, PhonePrefix } from '../types';

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
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function RegisterForm({
  onSuccess,
  onError,
  onNavigateToLogin,
  firebaseConfig,
  theme: themeProp,
  initialEmail = '',
  showPhone = true,
  defaultPhonePrefix = '+598',
  phonePrefixes = DEFAULT_PHONE_PREFIXES,
  labels = {},
  requireEmailVerification = true,
}: RegisterFormProps) {
  const theme = { ...defaultTheme, ...themeProp };
  
  const {
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
  } = useRegister({
    firebaseConfig,
    onSuccess,
    onError,
    requireEmailVerification,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Inicializar valores
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
    setPhonePrefix(defaultPhonePrefix);
  }, [initialEmail, defaultPhonePrefix, setEmail, setPhonePrefix]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (state.step === 'FORM') {
      await requestCode();
    } else if (state.step === 'VERIFY_CODE') {
      await verifyAndFinalize();
    }
  };

  const handleCancel = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      reset();
    }
  };

  // Determinar color de borde para passwords
  const getPasswordBorderStyle = () => {
    if (state.password && state.confirmPassword) {
      return state.password === state.confirmPassword 
        ? { borderColor: theme.successColor }
        : { borderColor: theme.errorColor };
    }
    return {};
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
      boxSizing: 'border-box' as const,
    },
    select: {
      height: '40px',
      padding: '0 8px',
      fontSize: '14px',
      borderRadius: theme.borderRadius,
      border: `1px solid ${theme.primaryColor}40`,
      backgroundColor: theme.backgroundColor,
      cursor: 'pointer',
    },
    button: {
      height: '40px',
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
    buttonSecondary: {
      height: '40px',
      fontSize: '14px',
      fontWeight: 500,
      borderRadius: theme.borderRadius,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1px solid ${theme.primaryColor}40`,
      backgroundColor: 'transparent',
      color: theme.textColor,
    },
    message: {
      padding: '8px 12px',
      fontSize: '12px',
      borderRadius: theme.borderRadius,
      textAlign: 'center' as const,
    },
    row: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
    },
    codeInput: {
      height: '48px',
      width: '100%',
      padding: '0 12px',
      fontSize: '24px',
      fontFamily: 'monospace',
      letterSpacing: '0.3em',
      textAlign: 'center' as const,
      borderRadius: theme.borderRadius,
      border: `2px solid ${theme.primaryColor}`,
      backgroundColor: theme.backgroundColor,
      outline: 'none',
    },
  };

  // ============================================
  // RENDER - FORMULARIO
  // ============================================

  if (state.step === 'FORM' || state.step === 'VERIFY_CODE') {
    return (
      <div style={styles.container}>
        {/* Header */}
        {initialEmail && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: theme.textColor, opacity: 0.7 }}>
              Crear cuenta para:
            </p>
            <p style={{ fontSize: '14px', fontWeight: 500 }}>{initialEmail || state.email}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email (si no hay initialEmail) */}
          {!initialEmail && (
            <div style={{ marginBottom: '12px' }}>
              <input
                type="email"
                value={state.email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={labels.emailPlaceholder || 'Email *'}
                disabled={state.step === 'VERIFY_CODE'}
                style={{
                  ...styles.input,
                  opacity: state.step === 'VERIFY_CODE' ? 0.6 : 1,
                }}
              />
            </div>
          )}

          {/* Nombre y Apellido */}
          <div style={styles.row}>
            <input
              type="text"
              value={state.firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={labels.firstNamePlaceholder || 'Nombre *'}
              disabled={state.step === 'VERIFY_CODE'}
              style={{
                ...styles.input,
                flex: 1,
                opacity: state.step === 'VERIFY_CODE' ? 0.6 : 1,
              }}
            />
            <input
              type="text"
              value={state.lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={labels.lastNamePlaceholder || 'Apellido *'}
              disabled={state.step === 'VERIFY_CODE'}
              style={{
                ...styles.input,
                flex: 1,
                opacity: state.step === 'VERIFY_CODE' ? 0.6 : 1,
              }}
            />
          </div>

          {/* Tel�fono */}
          {showPhone && (
            <div style={styles.row}>
              <select
                value={state.phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                disabled={state.step === 'VERIFY_CODE'}
                style={{
                  ...styles.select,
                  width: '110px',
                  opacity: state.step === 'VERIFY_CODE' ? 0.6 : 1,
                }}
              >
                {phonePrefixes.map((p: PhonePrefix) => (
                  <option key={p.code} value={p.code}>
                    {p.code} {p.short}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={state.phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={labels.phonePlaceholder || 'Celular (opcional)'}
                disabled={state.step === 'VERIFY_CODE'}
                style={{
                  ...styles.input,
                  flex: 1,
                  opacity: state.step === 'VERIFY_CODE' ? 0.6 : 1,
                }}
              />
            </div>
          )}

          {/* Contrase�as */}
          <div style={styles.row}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={state.password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={labels.passwordPlaceholder || 'Contrase�a *'}
                disabled={state.step === 'VERIFY_CODE'}
                style={{
                  ...styles.input,
                  paddingRight: '36px',
                  ...getPasswordBorderStyle(),
                  opacity: state.step === 'VERIFY_CODE' ? 0.6 : 1,
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
                  opacity: 0.6,
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={state.confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={labels.confirmPasswordPlaceholder || 'Confirmar *'}
                disabled={state.step === 'VERIFY_CODE'}
                style={{
                  ...styles.input,
                  paddingRight: '36px',
                  ...getPasswordBorderStyle(),
                  opacity: state.step === 'VERIFY_CODE' ? 0.6 : 1,
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: 0.6,
                }}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Secci�n de c�digo (VERIFY_CODE step) */}
          {state.step === 'VERIFY_CODE' && (
            <div style={{ 
              paddingTop: '16px', 
              marginTop: '16px', 
              borderTop: `1px solid ${theme.primaryColor}30` 
            }}>
              <p style={{ 
                fontSize: '12px', 
                textAlign: 'center', 
                marginBottom: '12px',
                color: theme.textColor,
                opacity: 0.8,
              }}>
                {labels.codeInstructions || `Ingresa el c�digo enviado a ${state.email}`}
              </p>
              <input
                type="text"
                value={state.code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                autoFocus
                style={styles.codeInput}
              />
            </div>
          )}

          {/* Mensajes */}
          {(state.error || state.success) && (
            <div
              style={{
                ...styles.message,
                marginTop: '12px',
                backgroundColor: state.error ? `${theme.errorColor}10` : `${theme.successColor}10`,
                border: `1px solid ${state.error ? theme.errorColor : theme.successColor}40`,
                color: state.error ? theme.errorColor : theme.successColor,
              }}
            >
              {state.error || state.success}
            </div>
          )}

          {/* Botones */}
          <div style={{ ...styles.row, marginTop: '16px', marginBottom: 0 }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={state.loading}
              style={{ ...styles.buttonSecondary, width: '110px' }}
            >
              {labels.cancelButton || 'Cancelar'}
            </button>
            
            {state.step === 'FORM' ? (
              <button
                type="submit"
                disabled={state.loading || !state.firstName || !state.lastName || !state.password || !state.confirmPassword}
                style={{ 
                  ...styles.button, 
                  flex: 1,
                  opacity: state.loading ? 0.5 : 1,
                }}
              >
                {state.loading && <LoaderIcon />}
                {labels.submitButton || 'Registrar'}
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={state.loading || state.code.length !== 6}
                  style={{ 
                    ...styles.button, 
                    flex: 1,
                    opacity: state.loading ? 0.5 : 1,
                  }}
                >
                  {state.loading && <LoaderIcon />}
                  {labels.verifyButton || 'Confirmar'}
                </button>
                <button
                  type="button"
                  onClick={() => resendCode()}
                  disabled={state.loading}
                  style={{ ...styles.buttonSecondary, width: '100px' }}
                >
                  {labels.resendButton || 'Reenviar'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    );
  }

  // DONE state - normalmente el componente padre maneja esto
  return null;
}
