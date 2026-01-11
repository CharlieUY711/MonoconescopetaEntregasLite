/**
 * COMPONENTE GoogleLoginButton - mod-auth-google
 * 
 * Bot�n de login con Google.
 * Basado en ClientAccessInline.tsx del proyecto original.
 */

import React from 'react';
import { useGoogleLogin } from '../core/useGoogleLogin';
import type { GoogleLoginButtonProps, ThemeConfig } from '../types';

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
  buttonStyle: 'outline',
};

// ============================================
// ICONOS
// ============================================

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

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

export function GoogleLoginButton({
  onSuccess,
  onError,
  onNeedsLinking,
  firebaseConfig,
  theme: themeProp,
  mode = 'popup',
  buttonText = 'Acceder con Google',
  iconOnly = false,
  fullWidth = false,
  additionalScopes,
  forceAccountSelection = true,
  createProfile = true,
  disabled = false,
}: GoogleLoginButtonProps) {
  const theme = { ...defaultTheme, ...themeProp };
  
  const { state, login } = useGoogleLogin({
    firebaseConfig,
    mode,
    onSuccess,
    onError,
    onNeedsLinking,
    additionalScopes,
    forceAccountSelection,
    createProfile,
  });

  const handleClick = async () => {
    await login();
  };

  // ============================================
  // ESTILOS
  // ============================================

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: iconOnly ? 0 : '8px',
    height: '40px',
    padding: iconOnly ? '0 12px' : '0 16px',
    width: fullWidth ? '100%' : 'auto',
    minWidth: iconOnly ? '40px' : '135px',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: theme.fontFamily,
    borderRadius: theme.borderRadius,
    cursor: disabled || state.loading ? 'not-allowed' : 'pointer',
    opacity: disabled || state.loading ? 0.5 : 1,
    border: `1px solid ${theme.primaryColor}40`,
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    transition: 'background-color 0.2s, border-color 0.2s',
  };

  const errorStyle: React.CSSProperties = {
    marginTop: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    borderRadius: theme.borderRadius,
    backgroundColor: `${theme.errorColor}10`,
    border: `1px solid ${theme.errorColor}40`,
    color: theme.errorColor,
    textAlign: 'center',
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div style={{ display: 'inline-block', width: fullWidth ? '100%' : 'auto' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || state.loading}
        style={buttonStyle}
        onMouseEnter={(e) => {
          if (!disabled && !state.loading) {
            e.currentTarget.style.backgroundColor = `${theme.primaryColor}10`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.backgroundColor;
        }}
      >
        {state.loading ? (
          <LoaderIcon />
        ) : (
          <>
            {!iconOnly && buttonText}
            <GoogleIcon size={iconOnly ? 20 : 18} />
          </>
        )}
      </button>

      {state.error && (
        <div style={errorStyle}>
          {state.error}
        </div>
      )}

      {/* CSS para animaci�n de spin */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
