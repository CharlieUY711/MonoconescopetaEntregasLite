# mod-auth-google

M�dulo independiente de login con Google para Firebase Authentication.

## Caracter�sticas

- Login con popup (por defecto) o redirect
- Creaci�n autom�tica de perfil en Firestore
- Manejo de cuenta existente con diferente credencial
- Linking de cuentas (Google + password)
- Scopes personalizables
- UI personalizable via theme

## Instalaci�n

```bash
npm install firebase
```

## Uso

### Componente React

```tsx
import { GoogleLoginButton } from 'mod-auth-google';

function App() {
  return (
    <GoogleLoginButton
      onSuccess={(result) => {
        console.log('Usuario:', result.user);
        console.log('Es nuevo:', result.isNew);
        navigate('/dashboard');
      }}
      onError={(error) => console.error(error)}
      onNeedsLinking={(email) => {
        // El email ya tiene cuenta password, mostrar modal de linking
        showLinkingModal(email);
      }}
      buttonText="Continuar con Google"
      mode="popup"
      fullWidth={true}
    />
  );
}
```

### Como Hook

```tsx
import { useGoogleLogin } from 'mod-auth-google';

function CustomGoogleButton() {
  const { state, login, linkWithPassword } = useGoogleLogin({
    onSuccess: (result) => navigate('/dashboard'),
    onNeedsLinking: (email) => setLinkingEmail(email),
  });

  return (
    <button onClick={login} disabled={state.loading}>
      {state.loading ? 'Cargando...' : 'Google'}
    </button>
  );
}
```

### Funciones Directas

```tsx
import { 
  loginWithGooglePopup, 
  linkGoogleWithPassword,
  getFirebaseErrorMessage 
} from 'mod-auth-google';

// Login directo
try {
  const result = await loginWithGooglePopup();
  console.log('Usuario:', result.user);
  
  if (result.needsLinking) {
    // Mostrar UI para que usuario ingrese password
  }
} catch (error) {
  console.error(getFirebaseErrorMessage(error));
}

// Vincular cuentas
const user = await linkGoogleWithPassword('user@example.com', 'password');
```

## Props del Componente

| Prop | Tipo | Default | Descripci�n |
|------|------|---------|-------------|
| `onSuccess` | `(result) => void` | - | Callback al login exitoso |
| `onError` | `(error) => void` | - | Callback al error |
| `onNeedsLinking` | `(email) => void` | - | Callback cuando necesita linking |
| `firebaseConfig` | `FirebaseConfig` | - | Config Firebase |
| `theme` | `ThemeConfig` | - | Personalizaci�n visual |
| `mode` | `'popup' \| 'redirect'` | `'popup'` | Modo de auth |
| `buttonText` | `string` | `'Acceder con Google'` | Texto del bot�n |
| `iconOnly` | `boolean` | `false` | Solo mostrar icono |
| `fullWidth` | `boolean` | `false` | Ancho completo |
| `additionalScopes` | `string[]` | - | Scopes adicionales |
| `forceAccountSelection` | `boolean` | `true` | Forzar selecci�n de cuenta |
| `createProfile` | `boolean` | `true` | Crear perfil en Firestore |
| `disabled` | `boolean` | `false` | Deshabilitar bot�n |

## Configuraci�n Google Cloud

### 1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente

### 2. Configurar OAuth Consent Screen

1. APIs & Services > OAuth consent screen
2. Selecciona "External" (o Internal si es G Suite)
3. Completa la informaci�n requerida:
   - App name
   - User support email
   - Developer contact information
4. En Scopes, agrega: `email`, `profile`, `openid`

### 3. Crear credenciales OAuth 2.0

1. APIs & Services > Credentials
2. Create Credentials > OAuth client ID
3. Application type: Web application
4. Authorized JavaScript origins:
   - `http://localhost:5173` (desarrollo)
   - `https://tu-dominio.com` (producci�n)
5. Authorized redirect URIs:
   - `http://localhost:5173/__/auth/handler`
   - `https://tu-proyecto.firebaseapp.com/__/auth/handler`

### 4. Configurar en Firebase

1. Firebase Console > Authentication > Sign-in method
2. Habilitar Google
3. Agregar Web client ID y secret de las credenciales OAuth

### 5. Authorized Domains

1. Firebase Console > Authentication > Settings
2. En Authorized domains, agregar:
   - `localhost`
   - Tu dominio de producci�n

## Popup vs Redirect

### Popup (recomendado)
- UX m�s fluida
- No pierde estado de la app
- Puede ser bloqueado por browsers

### Redirect
- M�s compatible con mobile
- No tiene problemas de popups bloqueados
- Pierde estado de la app (necesita manejar en useEffect)

```tsx
// Popup (default)
<GoogleLoginButton mode="popup" />

// Redirect
<GoogleLoginButton mode="redirect" />
```

## Linking de Cuentas

Cuando un usuario intenta login con Google pero ya existe una cuenta con ese email usando password:

```tsx
function LoginPage() {
  const [linkingEmail, setLinkingEmail] = useState<string | null>(null);
  const { linkWithPassword } = useGoogleLogin();

  const handleLink = async (password: string) => {
    if (!linkingEmail) return;
    
    try {
      await linkWithPassword(linkingEmail, password);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <GoogleLoginButton
        onNeedsLinking={(email) => setLinkingEmail(email)}
        onSuccess={(result) => navigate('/dashboard')}
      />
      
      {linkingEmail && (
        <LinkingModal
          email={linkingEmail}
          onSubmit={handleLink}
          onCancel={() => setLinkingEmail(null)}
        />
      )}
    </>
  );
}
```

## Perfil Creado en Firestore

Cuando un usuario nuevo se registra con Google, se crean documentos en:

### users/{uid}
```json
{
  "uid": "abc123",
  "email": "user@gmail.com",
  "displayName": "John Doe",
  "role": "client",
  "clientId": null,
  "provider": "google",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### client_accounts/{email}
```json
{
  "email": "user@gmail.com",
  "emailNormalized": "user@gmail.com",
  "uid": "abc123",
  "status": "active",
  "authProvider": "google",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### client_profiles/{uid}
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@gmail.com",
  "phone": null,
  "entity": null,
  "address": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Variables de Entorno

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_APP_ID=1:123:web:abc
```

## Troubleshooting

### Error: "popup-blocked"
- El navegador bloque� el popup
- Soluci�n: Indicar al usuario que permita popups, o usar mode="redirect"

### Error: "account-exists-with-different-credential"
- Ya existe cuenta con ese email usando password
- Soluci�n: Usar `onNeedsLinking` para mostrar UI de linking

### Error: "operation-not-allowed"
- Google no est� habilitado en Firebase
- Soluci�n: Habilitar en Firebase Console > Authentication > Sign-in method

### Error: "unauthorized-domain"
- El dominio no est� autorizado
- Soluci�n: Agregar dominio en Firebase Console > Authentication > Settings

## Licencia

MIT
