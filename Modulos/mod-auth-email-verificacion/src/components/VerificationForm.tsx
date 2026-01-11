/**
 * COMPONENTE VerificationForm - mod-auth-email-verificacion
 * 
 * Formulario de verificaci�n de email con c�digo de 6 d�gitos.
 * Basado en ClientAccessInline.tsx del proyecto original.
 */

import React, { useEffect } from 'react';
import { useEmailVerification } from '../core/useEmailVerification';
import type { VerificationFormProps, ThemeConfig } from '../types';

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
};

// ============================================
// ICONOS
// ============================================

function LoaderIcon() {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ============================================
// COMPONENTE
// ============================================

export function VerificationForm({
  email,
  userData,
  onVerified,
  onError,
  onCancel,
  firebaseConfig,
  theme: themeProp,
  resendCooldown = 60,
  autoSend = true,
  labels = {},
}: VerificationFormProps) {
  const theme = { ...defaultTheme, ...themeProp };
  
  const {
    state,
    setCode,
    sendCode,
    verifyCode,
    resendCode,
    resendCountdown,
    canResend,
  } = useEmailVerification({
    email,
    userData,
    firebaseConfig,
    onVerified,
    onError,
    resendCooldown,
  });

  // Auto-enviar c�digo al montar
  useEffect(() => {
    if (autoSend && userData && state.step === 'READY') {
      sendCode();
    }
  }, [autoSend, userData, state.step, sendCode]);

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && state.code.length === 6) {
      verifyCode();
    }
  };

  // ============================================
  // ESTILOS
  // ============================================

  const styles = {
    container: {
      fontFamily: theme.fontFamily,
      color: theme.textColor,
    },
    title: {
      fontSize: '16px',
      fontWeight: 600,
      textAlign: 'center' as const,
      marginBottom: '8px',
    },
    instructions: {
      fontSize: '13px',
      textAlign: 'center' as const,
      marginBottom: '16px',
      opacity: 0.8,
    },
    codeInput: {
      width: '100%',
      height: '56px',
      padding: '0 16px',
      fontSize: '28px',
      fontFamily: 'monospace',
      letterSpacing: '0.4em',
      textAlign: 'center' as const,
      borderRadius: theme.borderRadius,
      border: `2px solid ${
        state.codeStatus === 'success' 
          ? theme.successColor 
          : state.codeStatus === 'error' 
            ? theme.errorColor 
            : theme.primaryColor
      }`,
      backgroundColor: theme.backgroundColor,
      outline: 'none',
      transition: 'border-color 0.2s',
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
      border: 'none',
      backgroundColor: theme.primaryColor,
      color: '#ffffff',
      flex: 1,
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
      padding: '0 16px',
    },
    message: {
      padding: '8px 12px',
      fontSize: '12px',
      borderRadius: theme.borderRadius,
      textAlign: 'center' as const,
      marginTop: '12px',
    },
    countdown: {
      fontSize: '12px',
      color: theme.textColor,
      opacity: 0.6,
      marginLeft: '8px',
    },
  };

  // ============================================
  // RENDER
  // ============================================

  if (state.step === 'VERIFIED') {
    return (
      <div style={styles.container}>
        <div style={{
          ...styles.message,
          backgroundColor: `${theme.successColor}10`,
          border: `1px solid ${theme.successColor}40`,
          color: theme.successColor,
        }}>
          {labels.successMessage || '�Email verificado correctamente!'}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* T�tulo */}
      <h3 style={styles.title}>
        {labels.title || 'Verificar Email'}
      </h3>
      
      {/* Instrucciones */}
      <p style={styles.instructions}>
        {labels.instructions || `Ingresa el c�digo de 6 d�gitos enviado a`}
        <br />
        <strong style={{ color: theme.textColor }}>{email}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        {/* Input de c�digo */}
        <input
          type="text"
          inputMode="numeric"
          value={state.code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={labels.codePlaceholder || '000000'}
          maxLength={6}
          autoFocus
          disabled={state.loading}
          style={{
            ...styles.codeInput,
            opacity: state.loading ? 0.6 : 1,
          }}
        />

        {/* Mensajes */}
        {(state.error || state.success) && (
          <div
            style={{
              ...styles.message,
              backgroundColor: state.error 
                ? `${theme.errorColor}10` 
                : `${theme.successColor}10`,
              border: `1px solid ${state.error ? theme.errorColor : theme.successColor}40`,
              color: state.error ? theme.errorColor : theme.successColor,
            }}
          >
            {state.error || state.success}
          </div>
        )}

        {/* Botones */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginTop: '16px' 
        }}>
          {/* Verificar */}
          <button
            type="submit"
            disabled={state.loading || state.code.length !== 6}
            style={{
              ...styles.button,
              opacity: state.loading || state.code.length !== 6 ? 0.5 : 1,
              cursor: state.loading || state.code.length !== 6 ? 'not-allowed' : 'pointer',
            }}
          >
            {state.loading && <LoaderIcon />}
            {labels.verifyButton || 'Verificar'}
          </button>

          {/* Reenviar */}
          <button
            type="button"
            onClick={() => resendCode()}
            disabled={!canResend}
            style={{
              ...styles.buttonSecondary,
              opacity: canResend ? 1 : 0.5,
              cursor: canResend ? 'pointer' : 'not-allowed',
            }}
          >
            {labels.resendButton || 'Reenviar'}
            {resendCountdown > 0 && (
              <span style={styles.countdown}>({resendCountdown}s)</span>
            )}
          </button>

          {/* Cancelar */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={state.loading}
              style={styles.buttonSecondary}
            >
              {labels.cancelButton || 'Cancelar'}
            </button>
          )}
        </div>
      </form>

      {/* CSS para animaci�n */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
