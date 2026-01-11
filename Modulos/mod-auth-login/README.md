# mod-auth-login

M�dulo independiente de login con email/password para Firebase Authentication.

## Instalaci�n

```bash
npm install firebase
```

## Configuraci�n R�pida

### Opci�n 1: Variables de Entorno

Crea un archivo `.env.local` con las credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### Opci�n 2: Props Directas

```tsx
<LoginForm 
  firebaseConfig={{
    apiKey: 'tu-api-key',
    authDomain: 'tu-proyecto.firebaseapp.com',
    projectId: 'tu-proyecto',
    appId: '1:123:web:abc',
  }}
  onSuccess={(user) => console.log(user)}
/>
```

## Uso

### Como Componente React

```tsx
import { LoginForm } from 'mod-auth-login';

function App() {
  return (
    <LoginForm
      onSuccess={(user) => {
        console.log('Usuario autenticado:', user);
        navigate('/dashboard');
      }}
      onError={(error) => {
        console.error('Error:', error);
      }}
      onNavigateToRegister={(email) => {
        // El email no existe, redirigir a registro
        navigate('/register', { state: { email } });
      }}
      showForgotPassword={true}
      showRememberMe={false}
      labels={{
        emailPlaceholder: 'Tu correo electr�nico',
        passwordPlaceholder: 'Tu contrase�a',
        submitButton: 'Ingresar',
        forgotPasswordLink: '�Olvidaste tu contrase�a?',
      }}
    />
  );
}
```

### Como Hook

```tsx
import { useLogin } from 'mod-auth-login';

function CustomLoginForm() {
  const {
    state,
    setEmail,
    setPassword,
    checkEmail,
    login,
    sendPasswordReset,
    reset,
  } = useLogin({
    onSuccess: (user) => navigate('/dashboard'),
    onError: (error) => toast.error(error),
  });

  const handleSubmit = async () => {
    if (state.step === 'EMAIL') {
      await checkEmail();
    } else {
      await login();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={state.email} 
        onChange={(e) => setEmail(e.target.value)}
        disabled={state.step === 'PASSWORD'}
      />
      
      {state.step === 'PASSWORD' && (
        <input 
          type="password" 
          value={state.password} 
          onChange={(e) => setPassword(e.target.value)}
        />
      )}

      {state.error && <p className="error">{state.error}</p>}
      
      <button type="submit" disabled={state.loading}>
        {state.loading ? 'Cargando...' : 'Continuar'}
      </button>
    </form>
  );
}
```

### Funciones Directas

```tsx
import { 
  loginWithEmailPassword, 
  checkEmailExists,
  sendPasswordReset,
  getFirebaseErrorMessage 
} from 'mod-auth-login';

// Login directo
try {
  const user = await loginWithEmailPassword('user@example.com', 'password123');
  console.log('Logged in as:', user.email);
} catch (error) {
  console.error(getFirebaseErrorMessage(error));
}

// Verificar si email existe
const result = await checkEmailExists('user@example.com');
if (result.exists) {
  // Mostrar campo de password
} else {
  // Redirigir a registro
}

// Enviar email de recuperaci�n
await sendPasswordReset('user@example.com');
```

## Props del Componente

| Prop | Tipo | Requerido | Descripci�n |
|------|------|-----------|-------------|
| `onSuccess` | `(user: AuthUser) => void` | ? | Callback cuando el login es exitoso |
| `onError` | `(error: string) => void` | ? | Callback cuando hay un error |
| `onNavigateToRegister` | `(email: string) => void` | ? | Callback cuando el email no existe |
| `onForgotPassword` | `(email: string) => void` | ? | Callback personalizado para recuperar contrase�a |
| `firebaseConfig` | `FirebaseConfig` | ? | Config Firebase (alternativa a env vars) |
| `theme` | `ThemeConfig` | ? | Personalizaci�n visual |
| `initialEmail` | `string` | ? | Email pre-llenado |
| `showRememberMe` | `boolean` | ? | Mostrar checkbox "Recordarme" |
| `showForgotPassword` | `boolean` | ? | Mostrar link "Olvid� mi contrase�a" |
| `labels` | `LoginFormLabels` | ? | Textos personalizados |

## Campos del Formulario

| Campo | Tipo | Validaci�n | Descripci�n |
|-------|------|------------|-------------|
| `email` | `string` | Regex email v�lido | Email del usuario |
| `password` | `string` | M�nimo 6 caracteres | Contrase�a |
| `rememberMe` | `boolean` | - | Opcional, para persistencia |

## Personalizaci�n del Tema

```tsx
<LoginForm
  theme={{
    primaryColor: '#6366f1',      // Color principal (botones, bordes focus)
    secondaryColor: '#8b5cf6',    // Color secundario
    backgroundColor: '#ffffff',    // Fondo de inputs
    textColor: '#1f2937',          // Color de texto
    errorColor: '#ef4444',         // Color de errores
    successColor: '#22c55e',       // Color de �xito
    borderRadius: '8px',           // Radio de bordes
    fontFamily: 'Inter, sans-serif', // Fuente
    buttonStyle: 'filled',         // 'filled' o 'outline'
  }}
  onSuccess={handleSuccess}
/>
```

## Configuraci�n Firebase Console

### 1. Crear Proyecto
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Add project"
3. Sigue el asistente

### 2. Habilitar Authentication
1. En el men� lateral: **Build > Authentication**
2. Clic en **Get started**
3. En **Sign-in method**, habilita **Email/Password**

### 3. Obtener Credenciales
1. Ve a **Project Settings** (�cono de engranaje)
2. En **Your apps**, clic en el �cono de Web (`</>`)
3. Registra la app y copia `firebaseConfig`

### 4. Dominios Autorizados
1. En **Authentication > Settings > Authorized domains**
2. Agrega tu dominio (ej: `localhost`, `tu-app.com`)

## Cloud Function Requerida

Este m�dulo usa la Cloud Function `checkEmailExists` para verificar si un email est� registrado. Si no la tienes desplegada, puedes:

1. **Desplegarla** desde el directorio `functions/` del proyecto original
2. **Omitirla** y usar `getSignInMethods` directamente (menos seguro)

```typescript
// functions/src/index.ts
export const checkEmailExists = onCall(async (request) => {
  const email = request.data?.email;
  // ... verificar en Firestore y Firebase Auth
  return { exists: true/false, email };
});
```

## Troubleshooting

### Error: "No se encontr� configuraci�n de Firebase"
- Verifica que las variables de entorno est�n definidas
- O pasa `firebaseConfig` como prop

### Error: "auth/invalid-credential"
- La contrase�a es incorrecta
- El usuario no existe

### Error: "auth/too-many-requests"
- Demasiados intentos fallidos
- Espera unos minutos

### Error: "auth/network-request-failed"
- Verifica tu conexi�n a internet
- El dominio puede no estar autorizado en Firebase

## Exports

```typescript
// Componentes
export { LoginForm } from './components/LoginForm';

// Hooks
export { useLogin } from './core/useLogin';

// Servicios
export { createLoginService, getLoginService, normalizeEmail, isValidEmail, isValidPassword } from './core/loginService';

// Adaptadores Firebase
export { createFirebaseClient, getFirebaseAuth, loginWithEmailPassword, sendPasswordReset, checkEmailExists, getFirebaseErrorMessage } from './adapters/firebase/client';

// Configuraci�n
export { resolveFirebaseConfig, validateFirebaseConfig, getFirebaseConfigFromEnv, ENV_VAR_NAMES } from './config/env';

// Tipos
export type { FirebaseConfig, CheckEmailResult, ThemeConfig, LoginFormProps, AuthUser, UseLoginOptions, UseLoginReturn } from './types';
```

## Licencia

MIT
