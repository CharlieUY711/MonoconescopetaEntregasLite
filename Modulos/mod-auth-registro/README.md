# mod-auth-registro

M�dulo independiente de registro de usuarios con verificaci�n de email por c�digo.

## Flujo de Registro

1. Usuario ingresa datos (nombre, apellido, email, contrase�a, tel�fono)
2. Se llama a Cloud Function `requestEmailCode` que genera c�digo de 6 d�gitos
3. Backend env�a email con c�digo via extensi�n Trigger Email
4. Usuario ingresa c�digo
5. Se llama a `verifyEmailCode` para validar
6. Se llama a `finalizeRegistration` que crea cuenta en Firebase Auth + Firestore
7. Auto-login despu�s del registro

## Instalaci�n

```bash
npm install firebase
```

## Uso

### Como Componente React

```tsx
import { RegisterForm } from 'mod-auth-registro';

function App() {
  return (
    <RegisterForm
      onSuccess={(result) => {
        console.log('Registrado:', result.uid);
        navigate('/dashboard');
      }}
      onError={(error) => console.error(error)}
      onNavigateToLogin={() => navigate('/login')}
      showPhone={true}
      defaultPhonePrefix="+598"
      requireEmailVerification={true}
    />
  );
}
```

### Como Hook

```tsx
import { useRegister } from 'mod-auth-registro';

function CustomRegisterForm() {
  const {
    state,
    setEmail,
    setPassword,
    setConfirmPassword,
    setFirstName,
    setLastName,
    setPhone,
    setCode,
    requestCode,
    verifyAndFinalize,
    validate,
  } = useRegister({
    onSuccess: (result) => navigate('/dashboard'),
  });

  const handleSubmit = async () => {
    if (state.step === 'FORM') {
      await requestCode();
    } else {
      await verifyAndFinalize();
    }
  };

  // ... render form
}
```

## Props del Componente

| Prop | Tipo | Requerido | Descripci�n |
|------|------|-----------|-------------|
| `onSuccess` | `(result) => void` | ? | Callback cuando el registro es exitoso |
| `onError` | `(error: string) => void` | ? | Callback cuando hay un error |
| `onNavigateToLogin` | `() => void` | ? | Callback para ir a login |
| `firebaseConfig` | `FirebaseConfig` | ? | Config Firebase |
| `theme` | `ThemeConfig` | ? | Personalizaci�n visual |
| `initialEmail` | `string` | ? | Email pre-llenado |
| `showPhone` | `boolean` | ? | Mostrar campo tel�fono (default: true) |
| `defaultPhonePrefix` | `string` | ? | Prefijo por defecto (default: +598) |
| `phonePrefixes` | `PhonePrefix[]` | ? | Lista de prefijos |
| `requireEmailVerification` | `boolean` | ? | Requiere verificaci�n (default: true) |
| `labels` | `RegisterFormLabels` | ? | Textos personalizados |

## Campos del Formulario

| Campo | Tipo | Validaci�n | Requerido |
|-------|------|------------|-----------|
| `email` | `string` | Regex email | ? |
| `password` | `string` | M�nimo 6 chars | ? |
| `confirmPassword` | `string` | Debe coincidir | ? |
| `firstName` | `string` | M�nimo 2 chars | ? |
| `lastName` | `string` | M�nimo 2 chars | ? |
| `phonePrefix` | `string` | - | ? |
| `phone` | `string` | Solo n�meros | ? |
| `code` | `string` | 6 d�gitos | ? (en verificaci�n) |

## Cloud Functions Requeridas

Este m�dulo requiere las siguientes Cloud Functions desplegadas:

### checkEmailExists
Verifica si un email ya est� registrado.

### requestEmailCode
Genera c�digo, hashea con bcrypt, guarda en `email_verifications`, env�a email.

### verifyEmailCode
Compara c�digo con hash, marca como verificado.

### finalizeRegistration
Crea usuario en Auth + documentos en Firestore.

## Configuraci�n Firebase

### 1. Extensi�n Trigger Email
Para enviar los c�digos por email, necesitas instalar la extensi�n:

1. Firebase Console > Extensions
2. Buscar "Trigger Email"
3. Instalar con SendGrid, Mailgun, o SMTP

### 2. Colecciones Firestore
El m�dulo usa estas colecciones:
- `email_verifications` - C�digos temporales
- `client_accounts` - Cuentas de cliente
- `client_profiles` - Datos de perfil
- `users` - Perfiles de usuario (compatibilidad)
- `mail` - Cola para extensi�n Trigger Email

### 3. Reglas Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // email_verifications - solo acceso por Cloud Functions
    match /email_verifications/{email} {
      allow read, write: if false;
    }
    
    // mail - solo Cloud Functions pueden escribir
    match /mail/{document} {
      allow read, write: if false;
    }
    
    // users, client_accounts, client_profiles
    // ... tus reglas existentes
  }
}
```

## Personalizaci�n del Tema

```tsx
<RegisterForm
  theme={{
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    errorColor: '#ef4444',
    successColor: '#22c55e',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
    buttonStyle: 'filled',
  }}
  onSuccess={handleSuccess}
/>
```

## Variables de Entorno

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_APP_ID=1:123:web:abc
```

## Exports

```typescript
// Componentes
export { RegisterForm } from './components/RegisterForm';

// Hooks
export { useRegister } from './core/useRegister';

// Servicios
export { createRegisterService, normalizeEmail, isValidEmail, isValidPassword, isValidCode, isValidName, passwordsMatch, validateRegistrationData } from './core/registerService';

// Adaptadores
export { createFirebaseClient, checkEmailExists, requestEmailCode, verifyEmailCode, finalizeRegistration, loginAfterRegister, getCloudFunctionErrorMessage } from './adapters/firebase/client';

// Tipos
export type { FirebaseConfig, RegistrationData, RequestCodeResult, FinalizeResult, RegisterStep, ThemeConfig, RegisterFormProps, PhonePrefix, RegisterFormLabels, RegisterFormState, UseRegisterOptions, UseRegisterReturn } from './types';
```

## Licencia

MIT
