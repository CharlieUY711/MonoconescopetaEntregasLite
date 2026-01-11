/**
 * COMPONENTE AuthGateway - mod-auth-orchestrator
 * 
 * Gateway que integra m�ltiples m�dulos de autenticaci�n.
 * Permite usar login, registro, Google y verificaci�n juntos.
 */

import React, { useState, useEffect } from 'react';
import { resolveTheme, loadTheme } from '../config/theme';
import { ThemeSetupForm } from './ThemeSetupForm';
import type { AuthGatewayProps, ThemeConfig, AuthView, AuthUser } from '../types';

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AuthGateway({
  modules,
  initialView = 'login',
  firebaseConfig,
  theme: themeProp,
  onAuthenticated,
  onError,
  showGoogle = true,
  requireEmailVerification = true,
  title,
  subtitle,
  logo,
  labels = {},
  showToggle = true,
}: AuthGatewayProps) {
  // Estado
  const [view, setView] = useState<AuthView>(initialView);
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [needsThemeSetup, setNeedsThemeSetup] = useState(false);
  
  // Estado del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+598');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Resolver tema
  useEffect(() => {
    if (themeProp) {
      setTheme(resolveTheme(themeProp));
    } else {
      const storedTheme = loadTheme();
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        setNeedsThemeSetup(true);
      }
    }
  }, [themeProp]);

  // Si necesita configurar tema
  if (needsThemeSetup) {
    return (
      <ThemeSetupForm
        onSave={(savedTheme) => {
          setTheme(savedTheme);
          setNeedsThemeSetup(false);
        }}
        title="Configurar Apariencia"
      />
    );
  }

  // Si no hay tema a�n
  if (!theme) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <LoaderIcon />
      </div>
    );
  }

  // Determinar m�dulos disponibles
  const hasLogin = modules.includes('login');
  const hasRegister = modules.includes('register');
  const hasGoogle = modules.includes('google') && showGoogle;
  const hasVerification = modules.includes('verification');

  // Handlers (simplificados para demo - en producci�n importar de los m�dulos)
  const handleEmailSubmit = async () => {
    setLoading(true);
    setError(null);
    
    // Simular verificaci�n de email
    setTimeout(() => {
      setLoading(false);
      // En producci�n: llamar a checkEmailExists
      if (view === 'login') {
        setSuccess('Ingresa tu contrase�a');
      }
    }, 500);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    // En producci�n: llamar a loginWithEmailPassword
    setTimeout(() => {
      setLoading(false);
      const mockUser: AuthUser = {
        uid: 'demo-uid',
        email,
        displayName: null,
        photoURL: null,
        emailVerified: true,
      };
      onAuthenticated(mockUser, false);
    }, 500);
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Las contrase�as no coinciden');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    if (requireEmailVerification && hasVerification) {
      // Ir a verificaci�n
      setTimeout(() => {
        setLoading(false);
        setView('verification');
        setSuccess('C�digo enviado a tu correo');
      }, 500);
    } else {
      // Registrar directamente
      setTimeout(() => {
        setLoading(false);
        const mockUser: AuthUser = {
          uid: 'demo-uid',
          email,
          displayName: `${firstName} ${lastName}`,
          photoURL: null,
          emailVerified: !requireEmailVerification,
        };
        onAuthenticated(mockUser, true);
      }, 500);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    // En producci�n: llamar a loginWithGooglePopup
    setTimeout(() => {
      setLoading(false);
      const mockUser: AuthUser = {
        uid: 'google-uid',
        email: 'user@gmail.com',
        displayName: 'Google User',
        photoURL: null,
        emailVerified: true,
      };
      onAuthenticated(mockUser, false);
    }, 500);
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Ingresa el c�digo de 6 d�gitos');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // En producci�n: llamar a verifyEmailCode + finalizeRegistration
    setTimeout(() => {
      setLoading(false);
      const mockUser: AuthUser = {
        uid: 'verified-uid',
        email,
        displayName: `${firstName} ${lastName}`,
        photoURL: null,
        emailVerified: true,
      };
      onAuthenticated(mockUser, true);
    }, 500);
  };

  // ============================================
  // ESTILOS
  // ============================================

  const styles = {
    container: {
      maxWidth: '400px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: theme.fontFamily,
      color: theme.textColor,
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '24px',
    },
    logo: {
      marginBottom: '16px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 600,
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      opacity: 0.7,
    },
    tabs: {
      display: 'flex',
      marginBottom: '24px',
      borderBottom: `1px solid ${theme.primaryColor}20`,
    },
    tab: {
      flex: 1,
      padding: '12px',
      fontSize: '14px',
      fontWeight: 500,
      textAlign: 'center' as const,
      cursor: 'pointer',
      border: 'none',
      backgroundColor: 'transparent',
      borderBottom: '2px solid transparent',
      color: theme.textColor,
      opacity: 0.6,
    },
    tabActive: {
      opacity: 1,
      borderBottomColor: theme.primaryColor,
      color: theme.primaryColor,
    },
    input: {
      width: '100%',
      height: '44px',
      padding: '0 12px',
      marginBottom: '12px',
      fontSize: '14px',
      borderRadius: theme.borderRadius,
      border: `1px solid ${theme.primaryColor}40`,
      backgroundColor: theme.backgroundColor,
      boxSizing: 'border-box' as const,
      outline: 'none',
    },
    row: {
      display: 'flex',
      gap: '8px',
    },
    button: {
      width: '100%',
      height: '44px',
      marginTop: '8px',
      fontSize: '14px',
      fontWeight: 500,
      borderRadius: theme.borderRadius,
      border: 'none',
      backgroundColor: theme.primaryColor,
      color: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    buttonGoogle: {
      width: '100%',
      height: '44px',
      marginTop: '12px',
      fontSize: '14px',
      fontWeight: 500,
      borderRadius: theme.borderRadius,
      border: `1px solid ${theme.primaryColor}40`,
      backgroundColor: 'transparent',
      color: theme.textColor,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '20px 0',
      color: theme.textColor,
      opacity: 0.5,
      fontSize: '12px',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: `${theme.textColor}20`,
    },
    dividerText: {
      padding: '0 12px',
    },
    message: {
      padding: '10px 12px',
      marginTop: '12px',
      fontSize: '13px',
      borderRadius: theme.borderRadius,
      textAlign: 'center' as const,
    },
    link: {
      color: theme.primaryColor,
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      fontSize: '13px',
      textDecoration: 'underline',
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
      border: `2px solid ${theme.primaryColor}`,
      backgroundColor: theme.backgroundColor,
      outline: 'none',
    },
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {logo && (
          <div style={styles.logo}>
            {typeof logo === 'string' ? (
              <img src={logo} alt="Logo" style={{ height: '40px' }} />
            ) : (
              logo
            )}
          </div>
        )}
        {title && <h1 style={styles.title}>{title}</h1>}
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>

      {/* Tabs */}
      {showToggle && hasLogin && hasRegister && view !== 'verification' && (
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(view === 'login' ? styles.tabActive : {}),
            }}
            onClick={() => setView('login')}
          >
            {labels.loginTab || 'Iniciar Sesi�n'}
          </button>
          <button
            style={{
              ...styles.tab,
              ...(view === 'register' ? styles.tabActive : {}),
            }}
            onClick={() => setView('register')}
          >
            {labels.registerTab || 'Registrarse'}
          </button>
        </div>
      )}

      {/* Login Form */}
      {view === 'login' && hasLogin && (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={styles.input}
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contrase�a"
              style={{ ...styles.input, paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: 0.6,
              }}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            style={{
              ...styles.button,
              opacity: loading || !email || !password ? 0.5 : 1,
            }}
          >
            {loading && <LoaderIcon />}
            {labels.loginTab || 'Iniciar Sesi�n'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              style={styles.link}
              onClick={() => setView('forgot-password')}
            >
              {labels.forgotPassword || '�Olvidaste tu contrase�a?'}
            </button>
          </div>
        </>
      )}

      {/* Register Form */}
      {view === 'register' && hasRegister && (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={styles.input}
          />
          <div style={styles.row}>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nombre"
              style={{ ...styles.input, flex: 1 }}
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido"
              style={{ ...styles.input, flex: 1 }}
            />
          </div>
          <div style={styles.row}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contrase�a"
              style={{ ...styles.input, flex: 1 }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar"
              style={{ ...styles.input, flex: 1 }}
            />
          </div>
          <button
            onClick={handleRegister}
            disabled={loading || !email || !firstName || !lastName || !password}
            style={{
              ...styles.button,
              opacity: loading || !email || !firstName ? 0.5 : 1,
            }}
          >
            {loading && <LoaderIcon />}
            {labels.registerTab || 'Registrarse'}
          </button>
        </>
      )}

      {/* Verification Form */}
      {view === 'verification' && hasVerification && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>
              Ingresa el c�digo enviado a
            </p>
            <p style={{ fontWeight: 500 }}>{email}</p>
          </div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            style={styles.codeInput}
          />
          <button
            onClick={handleVerifyCode}
            disabled={loading || code.length !== 6}
            style={{
              ...styles.button,
              marginTop: '16px',
              opacity: loading || code.length !== 6 ? 0.5 : 1,
            }}
          >
            {loading && <LoaderIcon />}
            Verificar
          </button>
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button style={styles.link} onClick={() => setView('register')}>
              {labels.backToLogin || 'Volver'}
            </button>
          </div>
        </>
      )}

      {/* Google Button */}
      {hasGoogle && view !== 'verification' && (
        <>
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>{labels.orDivider || 'o'}</span>
            <div style={styles.dividerLine} />
          </div>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              ...styles.buttonGoogle,
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? <LoaderIcon /> : <GoogleIcon />}
            {labels.googleButton || 'Continuar con Google'}
          </button>
        </>
      )}

      {/* Messages */}
      {(error || success) && (
        <div
          style={{
            ...styles.message,
            backgroundColor: error ? `${theme.errorColor}10` : `${theme.successColor}10`,
            border: `1px solid ${error ? theme.errorColor : theme.successColor}40`,
            color: error ? theme.errorColor : theme.successColor,
          }}
        >
          {error || success}
        </div>
      )}

      {/* CSS */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
