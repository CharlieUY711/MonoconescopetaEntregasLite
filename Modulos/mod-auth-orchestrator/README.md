# mod-auth-orchestrator

M�dulo integrador que combina los m�dulos de autenticaci�n en un gateway unificado.

## Caracter�sticas

- **AuthGateway**: Componente �nico que integra login, registro, Google y verificaci�n
- **AuthWizard**: Generador de archivos de configuraci�n
- **ThemeSetupForm**: Formulario para configurar tema visual
- **Contexto de Auth**: Hooks y contexto para compartir estado

## Instalaci�n

```bash
npm install firebase
```

## Uso R�pido

### AuthGateway

```tsx
import { AuthGateway } from 'mod-auth-orchestrator';

function App() {
  return (
    <AuthGateway
      modules={['login', 'register', 'google', 'verification']}
      onAuthenticated={(user, isNew) => {
        console.log('Usuario:', user);
        console.log('Es nuevo:', isNew);
        navigate('/dashboard');
      }}
      onError={(error) => console.error(error)}
      showGoogle={true}
      requireEmailVerification={true}
      title="Bienvenido"
      subtitle="Inicia sesi�n o crea una cuenta"
    />
  );
}
```

### AuthWizard

El wizard genera archivos de configuraci�n:

```tsx
import { AuthWizard } from 'mod-auth-orchestrator';

function SetupPage() {
  const handleGenerate = (files) => {
    // files contiene:
    // - auth.config.ts
    // - firebase.client.ts
    // - AuthGateway.tsx
    // - theme.tokens.json (si se personaliz� tema)
    
    // Descargar o mostrar archivos
    Object.entries(files).forEach(([name, content]) => {
      console.log(`--- ${name} ---`);
      console.log(content);
    });
  };

  return (
    <AuthWizard
      onGenerate={handleGenerate}
      onCancel={() => navigate('/')}
    />
  );
}
```

### ThemeSetupForm

Se muestra autom�ticamente si no hay tema configurado:

```tsx
import { ThemeSetupForm } from 'mod-auth-orchestrator';

function ThemePage() {
  return (
    <ThemeSetupForm
      onSave={(theme) => {
        console.log('Tema guardado:', theme);
        // Se guarda autom�ticamente en localStorage
      }}
      initialTheme={{
        primaryColor: '#6366f1',
      }}
      title="Personalizar Apariencia"
    />
  );
}
```

## Props de AuthGateway

| Prop | Tipo | Default | Descripci�n |
|------|------|---------|-------------|
| `modules` | `AuthModule[]` | - | M�dulos a incluir (requerido) |
| `initialView` | `AuthView` | `'login'` | Vista inicial |
| `firebaseConfig` | `FirebaseConfig` | - | Config Firebase |
| `theme` | `ThemeConfig` | - | Tema visual |
| `onAuthenticated` | `(user, isNew) => void` | - | Callback al autenticarse |
| `onError` | `(error) => void` | - | Callback al error |
| `showGoogle` | `boolean` | `true` | Mostrar bot�n Google |
| `requireEmailVerification` | `boolean` | `true` | Requerir verificaci�n |
| `title` | `string` | - | T�tulo del formulario |
| `subtitle` | `string` | - | Subt�tulo |
| `logo` | `string \| ReactNode` | - | Logo |
| `labels` | `AuthGatewayLabels` | - | Textos personalizados |
| `showToggle` | `boolean` | `true` | Mostrar tabs login/registro |

## M�dulos Disponibles

```typescript
type AuthModule = 'login' | 'register' | 'google' | 'verification';
```

- **login**: Email + password
- **register**: Registro con nombre, apellido, tel�fono
- **google**: Login con Google (popup o redirect)
- **verification**: Verificaci�n de email con c�digo

## Configuraci�n del Tema

El tema se resuelve en este orden:
1. Tema pasado como prop
2. Tema guardado en localStorage
3. Tema por defecto
4. Si no hay ninguno, muestra ThemeSetupForm

```typescript
interface ThemeConfig {
  primaryColor: string;      // Color principal
  secondaryColor: string;    // Color secundario
  backgroundColor: string;   // Fondo de inputs
  textColor: string;         // Color de texto
  errorColor: string;        // Color de errores
  successColor: string;      // Color de �xito
  borderRadius: string;      // Radio de bordes
  fontFamily?: string;       // Fuente
  buttonStyle?: 'filled' | 'outline';
}
```

### Guardar/Cargar Tema

```typescript
import { saveTheme, loadTheme, clearTheme } from 'mod-auth-orchestrator';

// Guardar en localStorage
saveTheme({
  primaryColor: '#6366f1',
  // ...
});

// Cargar desde localStorage
const theme = loadTheme();

// Eliminar tema guardado
clearTheme();
```

## Contexto de Autenticaci�n

### Usando los hooks

```tsx
import { useAuth, useIsAuthenticated, useUIRole } from 'mod-auth-orchestrator';

function Profile() {
  const { user, profile, signOut } = useAuth();
  const isAuthenticated = useIsAuthenticated();
  const role = useUIRole();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <h1>Hola, {profile?.displayName}</h1>
      <p>Rol: {role}</p>
      <button onClick={signOut}>Cerrar Sesi�n</button>
    </div>
  );
}
```

### Mapeo de Roles

```typescript
import { mapFirebaseRoleToUI } from 'mod-auth-orchestrator';

mapFirebaseRoleToUI('admin');        // 'Administrador'
mapFirebaseRoleToUI('client');       // 'Cliente'
mapFirebaseRoleToUI('driver_mock');  // 'Chofer'
```

## Archivos Generados por el Wizard

### auth.config.ts

```typescript
export const authConfig = {
  modules: ['login', 'register', 'google', 'verification'],
  googleMode: 'popup',
  requireEmailVerification: true,
};
```

### firebase.client.ts

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// ...

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '...',
  // ...
};

export const auth = getAuth(app);
export const db = getFirestore(app);
```

### AuthGateway.tsx

```tsx
import { AuthGateway } from 'mod-auth-orchestrator';
import { firebaseConfig } from './firebase.client';

export function AppAuthGateway({ onAuthenticated }) {
  return (
    <AuthGateway
      modules={['login', 'register', 'google', 'verification']}
      firebaseConfig={firebaseConfig}
      onAuthenticated={onAuthenticated}
    />
  );
}
```

### theme.tokens.json

```json
{
  "primaryColor": "#00A9CE",
  "secondaryColor": "#6366f1",
  "backgroundColor": "#ffffff",
  "textColor": "#1f2937",
  "errorColor": "#ef4444",
  "successColor": "#22c55e",
  "borderRadius": "0.5rem",
  "fontFamily": "system-ui, sans-serif",
  "buttonStyle": "filled"
}
```

## Variables de Entorno

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_APP_ID=1:123:web:abc
```

## Integraci�n con Otros M�dulos

El orchestrator puede usar los otros m�dulos directamente:

```tsx
import { LoginForm } from 'mod-auth-login';
import { RegisterForm } from 'mod-auth-registro';
import { GoogleLoginButton } from 'mod-auth-google';
import { VerificationForm } from 'mod-auth-email-verificacion';
```

O usar el AuthGateway que los integra autom�ticamente.

## Exports

```typescript
// Componentes
export { AuthGateway, AuthWizard, ThemeSetupForm } from './components';

// Contexto y hooks
export { AuthContext, useAuth, useUserProfile, useIsAuthenticated, useUIRole, mapFirebaseRoleToUI } from './core/authContext';

// Configuraci�n
export { DEFAULT_THEME, saveTheme, loadTheme, clearTheme, resolveTheme, validateTheme, themeToCSS } from './config/theme';
export { resolveFirebaseConfig, validateFirebaseConfig, getFirebaseConfigFromEnv } from './config/env';

// Tipos
export type { FirebaseConfig, AuthModule, AuthView, AuthUser, UserProfile, UIRole, AuthState, ThemeConfig, AuthGatewayProps, WizardConfig, GeneratedFiles } from './types';
```

## Licencia

MIT
