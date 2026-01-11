/**
 * CLIENT ACCESS INLINE - ODDY Entregas Lite V1
 * 
 * Componente de acceso para clientes en el header:
 * - Input email + Avanzar
 * - Boton Google
 * - Campo de contraseña inline cuando el email existe
 * - Formulario expandido debajo del header
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  checkEmailExists,
  requestEmailCode,
  verifyEmailCode,
  finalizeRegistration,
  loginWithEmail,
  loginWithGoogle,
  isValidEmail,
  isValidPassword,
  isValidCode,
  getCloudFunctionErrorMessage,
  type AuthStep,
  type RegistrationData,
} from '../../services/clientAuthService';
import { auth, getFirebaseErrorMessage } from '../../../lib/firebase';

// ============================================
// GOOGLE ICON SVG
// ============================================

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ============================================
// ESTILOS COMUNES
// ============================================

const inputStyle = "h-[32px] w-[180px] px-3 text-xs rounded-md border border-cyan-300/50 bg-background focus:outline-none focus:border-cyan-500 disabled:opacity-50";
const buttonPrimaryStyle = "h-[32px] w-[135px] text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5";
const buttonSecondaryStyle = "h-[32px] w-[135px] text-sm font-medium rounded-md border border-cyan-300/50 bg-background hover:bg-accent flex items-center justify-center gap-1.5";

// ============================================
// COMPONENT
// ============================================

export function ClientAccessInline() {
  const navigate = useNavigate();
  
  // Estado principal
  const [step, setStep] = useState<AuthStep>('EMAIL_STEP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPasswordError, setIsPasswordError] = useState(false);
  
  // Datos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+598'); // Uruguay por defecto
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  
  // Estados para foco de campos de contraseña en registro
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  // Estado para el resultado de verificación del código
  const [codeStatus, setCodeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Prefijos telefónicos internacionales
  const phonePrefixes = [
    { code: '+598', country: '🇺🇾 Uruguay', short: 'UY' },
    { code: '+54', country: '🇦🇷 Argentina', short: 'AR' },
    { code: '+55', country: '🇧🇷 Brasil', short: 'BR' },
    { code: '+56', country: '🇨🇱 Chile', short: 'CL' },
    { code: '+57', country: '🇨🇴 Colombia', short: 'CO' },
    { code: '+51', country: '🇵🇪 Perú', short: 'PE' },
    { code: '+595', country: '🇵🇾 Paraguay', short: 'PY' },
    { code: '+591', country: '🇧🇴 Bolivia', short: 'BO' },
    { code: '+593', country: '🇪🇨 Ecuador', short: 'EC' },
    { code: '+58', country: '🇻🇪 Venezuela', short: 'VE' },
    { code: '+52', country: '🇲🇽 México', short: 'MX' },
    { code: '+1', country: '🇺🇸 Estados Unidos', short: 'US' },
    { code: '+34', country: '🇪🇸 España', short: 'ES' },
    { code: '+39', country: '🇮🇹 Italia', short: 'IT' },
    { code: '+33', country: '🇫🇷 Francia', short: 'FR' },
    { code: '+49', country: '🇩🇪 Alemania', short: 'DE' },
    { code: '+44', country: '🇬🇧 Reino Unido', short: 'GB' },
  ];
  
  // Visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Muestra campo de password inline
  const showPasswordField = step === 'LOGIN_STEP';
  // Muestra formulario expandido para registro
  const showExpandedForm = step === 'REGISTER_START' || step === 'VERIFY_CODE';

  // Determinar color de borde para campos de contraseña en registro
  const getPasswordBorderClass = () => {
    // Si alguno tiene foco, usar celeste clarito con focus para intenso
    if (passwordFocused || confirmPasswordFocused) {
      return 'border-cyan-300/50 focus:border-cyan-500';
    }
    // Si ambos tienen valor, verificar coincidencia
    if (password && confirmPassword) {
      return password === confirmPassword ? 'border-green-500' : 'border-red-500';
    }
    // Por defecto, celeste clarito
    return 'border-cyan-300/50 focus:border-cyan-500';
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleEmailSubmit = useCallback(async () => {
    if (!isValidEmail(email)) {
      setError('Ingresa un email válido');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await checkEmailExists(email);
      
      if (result.exists) {
        setStep('LOGIN_STEP');
      } else {
        setStep('REGISTER_START');
      }
    } catch (err) {
      setError(getCloudFunctionErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleLogin = useCallback(async () => {
    if (!isValidPassword(password)) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsPasswordError(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setIsPasswordError(false);

    try {
      await loginWithEmail(email, password);
      setSuccess('Login correcto: accediendo a su espacio de trabajo');
      setTimeout(() => {
        setStep('DONE');
        navigate('/dashboard', { state: { focusSearch: true } });
      }, 800);
    } catch (err) {
      const firebaseError = err as { code?: string };
      // Detectar si es error de contraseña incorrecta
      if (firebaseError.code === 'auth/wrong-password' || 
          firebaseError.code === 'auth/invalid-credential') {
        setError('Contraseña incorrecta, ingrésela nuevamente');
        setIsPasswordError(true);
      } else {
        setError(getFirebaseErrorMessage(err));
        setIsPasswordError(false);
      }
      setLoading(false);
    }
  }, [email, password, navigate]);

  const handleResetPassword = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setIsPasswordError(false);

    try {
      await sendPasswordResetEmail(auth, email);
      // Limpiar formulario y volver al estado original
      setEmail('');
      setPassword('');
      setStep('EMAIL_STEP');
      setSuccess('Email de recuperación enviado. Revisa tu bandeja de entrada.');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleRequestCode = useCallback(async () => {
    if (!isValidPassword(password)) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!firstName.trim() || firstName.trim().length < 2) {
      setError('Ingresa tu nombre');
      return;
    }
    if (!lastName.trim() || lastName.trim().length < 2) {
      setError('Ingresa tu apellido');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const fullPhone = phone ? `${phonePrefix}${phone}` : undefined;
      const data: RegistrationData = {
        email,
        password,
        firstName,
        lastName,
        phone: fullPhone,
      };
      
      await requestEmailCode(data);
      setSuccess('Código enviado a tu correo');
      setStep('VERIFY_CODE');
    } catch (err) {
      setError(getCloudFunctionErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [email, password, confirmPassword, firstName, lastName, phone]);

  const handleVerifyAndFinalize = useCallback(async () => {
    if (!isValidCode(code)) {
      setError('Ingresa el código de 6 dígitos');
      setCodeStatus('error');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setCodeStatus('idle');

    try {
      await verifyEmailCode(email, code);
      await finalizeRegistration(email);
      await loginWithEmail(email, password);

      setCodeStatus('success');
      setSuccess('Registro completado correctamente');
      setTimeout(() => {
        setStep('DONE');
        navigate('/dashboard', { state: { focusSearch: true } });
      }, 800);
    } catch (err) {
      setCodeStatus('error');
      setError(getCloudFunctionErrorMessage(err));
      setLoading(false);
    }
  }, [email, code, password, navigate]);

  const handleGoogleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await loginWithGoogle();
      
      if (result.needsLinking) {
        setEmail(result.email || '');
        setError('Este correo ya tiene una cuenta con contraseña. Ingresa tu contraseña.');
        setStep('LOGIN_STEP');
        setLoading(false);
      } else {
        setSuccess('Inicio de sesión correcto');
        setTimeout(() => {
          setStep('DONE');
          navigate('/dashboard');
        }, 800);
      }
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
      setLoading(false);
    }
  }, [navigate]);

  const handleReset = useCallback(() => {
    setStep('EMAIL_STEP');
    setError(null);
    setSuccess(null);
    setIsPasswordError(false);
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setPhonePrefix('+598');
    setPhone('');
    setCode('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  // ============================================
  // RENDER
  // ============================================

  if (step === 'DONE') {
    return null;
  }

  const hasMessage = error || success;

  return (
    <>
      <div className="relative flex flex-col">
        {/* Fila principal: Email [+ Password] + Avanzar | Acceder con G */}
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (showPasswordField) {
                  handleLogin();
                } else {
                  handleEmailSubmit();
                }
              }
            }}
            placeholder="Ingrese su correo"
            disabled={loading || showPasswordField || showExpandedForm}
            className={`h-[32px] w-[180px] px-3 text-xs rounded-md border bg-background focus:outline-none disabled:opacity-50 ${
              showPasswordField 
                ? 'border-green-500' 
                : 'border-cyan-300/50 focus:border-cyan-500'
            }`}
          />

          {/* Cuando NO está en modo login: mostrar botones normales */}
          {!showPasswordField && (
            <>
              <button
                onClick={handleEmailSubmit}
                disabled={loading || !email || showExpandedForm}
                className={buttonPrimaryStyle}
              >
                {loading && !showExpandedForm && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Acceso/Registro
              </button>

              <button
                onClick={handleGoogleLogin}
                disabled={loading || showExpandedForm}
                className={buttonSecondaryStyle}
              >
                {loading && step === 'EMAIL_STEP' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    Acceder con
                    <GoogleIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </>
          )}

          {/* Cuando SÍ está en modo login: campo contraseña + botón Acceder */}
          {showPasswordField && (
            <>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Ingrese su contraseña"
                  autoFocus
                  disabled={loading}
                  className={`h-[32px] w-[180px] px-3 text-xs rounded-md border bg-background focus:outline-none disabled:opacity-50 pr-9 ${
                    isPasswordError 
                      ? 'border-red-500' 
                      : success 
                        ? 'border-green-500' 
                        : 'border-cyan-300/50 focus:border-cyan-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading || !password}
                className="h-[32px] w-[90px] text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Acceder
              </button>
            </>
          )}
        </div>

        {/* Campo de mensaje + botón restablecer contraseña */}
        {hasMessage && (
          <div className="mt-2 flex gap-2">
            <div
              className={`h-[20px] flex items-center justify-center text-xs rounded-md border ${
                isPasswordError ? 'flex-1' : 'w-full'
              } ${
                error
                  ? 'border-red-400 text-red-500 bg-red-50/50'
                  : 'border-green-400 text-green-600 bg-green-50/50'
              }`}
            >
              {error || success}
            </div>
            {isPasswordError && (
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="h-[20px] w-[150px] px-3 text-xs font-medium rounded-md border border-cyan-400 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 disabled:opacity-50 whitespace-nowrap"
              >
                Restablecer contraseña
              </button>
            )}
          </div>
        )}

        {/* Formulario expandido - posicionado debajo del header, mismo ancho */}
        {showExpandedForm && (
          <div className="absolute top-full left-0 right-0 mt-[45px] p-4 bg-card border border-cyan-300/30 rounded-md shadow-lg z-50">
              {/* REGISTER - Formulario unificado */}
              {(step === 'REGISTER_START' || step === 'VERIFY_CODE') && (
                <div className="space-y-2">
                  {/* Título centrado */}
                  <div className="text-center mb-4">
                    <p className="text-xs text-muted-foreground">Crear una cuenta para:</p>
                    <p className="text-sm font-medium text-foreground mt-1">{email}</p>
                  </div>
                  
                  {/* Campos del formulario */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Nombre *"
                      autoFocus={step === 'REGISTER_START'}
                      disabled={step === 'VERIFY_CODE'}
                      className="h-[32px] flex-1 px-3 text-sm rounded-md border border-cyan-300/50 bg-background focus:outline-none focus:border-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Apellido *"
                      disabled={step === 'VERIFY_CODE'}
                      className="h-[32px] flex-1 px-3 text-sm rounded-md border border-cyan-300/50 bg-background focus:outline-none focus:border-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
                      disabled={step === 'VERIFY_CODE'}
                      className="h-[32px] w-[110px] px-2 text-sm rounded-md border border-cyan-300/50 bg-background focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {phonePrefixes.map((prefix) => (
                        <option key={prefix.code} value={prefix.code}>
                          {prefix.code} {prefix.short}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Celular (opcional)"
                      disabled={step === 'VERIFY_CODE'}
                      className="h-[32px] flex-1 px-3 text-sm rounded-md border border-cyan-300/50 bg-background focus:outline-none focus:border-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        placeholder="Contraseña *"
                        disabled={step === 'VERIFY_CODE'}
                        className={`h-[32px] w-full px-3 pr-9 text-sm rounded-md border bg-background focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${getPasswordBorderClass()}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setConfirmPasswordFocused(true)}
                        onBlur={() => setConfirmPasswordFocused(false)}
                        placeholder="Confirmar *"
                        disabled={step === 'VERIFY_CODE'}
                        className={`h-[32px] w-full px-3 pr-9 text-sm rounded-md border bg-background focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${getPasswordBorderClass()}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Sección de verificación de código (aparece después de presionar Registrar) */}
                  {step === 'VERIFY_CODE' && (
                    <>
                      <div className="pt-3 border-t border-cyan-300/30">
                        <p className="text-xs text-muted-foreground text-center mb-2">
                          Ingresa el código enviado a <strong className="text-foreground">{email}</strong>
                        </p>
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => {
                            setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                            setCodeStatus('idle');
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleVerifyAndFinalize()}
                          placeholder="000000"
                          maxLength={6}
                          autoFocus
                          className={`w-full h-[32px] px-3 text-center text-xl font-mono tracking-[0.3em] rounded-md border bg-background focus:outline-none ${
                            codeStatus === 'success' 
                              ? 'border-green-500' 
                              : codeStatus === 'error' 
                                ? 'border-red-500' 
                                : 'border-cyan-500'
                          }`}
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Botones */}
                  <div className="flex gap-2 pt-3">
                    {step === 'REGISTER_START' ? (
                      <>
                        {/* Cancelar (mismo ancho que prefijo) + Registrar (mismo ancho que celular) */}
                        <button
                          onClick={handleReset}
                          disabled={loading}
                          className="h-[32px] w-[110px] text-sm font-medium rounded-md border border-cyan-300/50 bg-background hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleRequestCode}
                          disabled={loading || !firstName || !lastName || !password || !confirmPassword}
                          className="h-[32px] flex-1 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Registrar
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Confirmar + Reenviar */}
                        <button
                          onClick={handleVerifyAndFinalize}
                          disabled={loading || code.length !== 6}
                          className="h-[32px] flex-1 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Confirmar
                        </button>
                        <button
                          onClick={() => {
                            setCode('');
                            handleRequestCode();
                          }}
                          disabled={loading}
                          className="h-[32px] px-4 text-sm font-medium rounded-md border border-cyan-300/50 bg-background hover:bg-accent flex items-center justify-center"
                        >
                          Reenviar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </>
  );
}
