# AUTH BASELINE MAP - ODDY Entregas Lite

## Resumen del Inventario

Este documento mapea la implementaci�n de autenticaci�n existente en el proyecto
hacia los m�dulos independientes que se crean en `/Modulos/`.

---

## ARCHIVOS ORIGEN

### 1. Configuraci�n Firebase
**Archivo:** `src/lib/firebase.ts`

| Elemento | Uso | Destino M�dulo |
|----------|-----|----------------|
| `firebaseConfig` | Config via import.meta.env.VITE_* | Todos (adapters/firebase) |
| `initializeApp()` | Inicializaci�n �nica | Todos (createFirebaseClient) |
| `getAuth()` | Instancia auth | Todos |
| `googleProvider` | GoogleAuthProvider + scopes | mod-auth-google |
| `signInWithEmailAndPassword` | Login email/pass | mod-auth-login |
| `createUserWithEmailAndPassword` | Registro (NO usado directamente, va por CF) | mod-auth-registro |
| `signInWithPopup` | Google popup login | mod-auth-google |
| `getFirebaseErrorMessage()` | Traductor de errores | Todos |

**Variables de entorno actuales:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

---

### 2. Servicio de Autenticaci�n de Cliente
**Archivo:** `src/app/services/clientAuthService.ts`

| Funci�n | Descripci�n | Destino M�dulo |
|---------|-------------|----------------|
| `normalizeEmail()` | Trim + lowercase | Todos |
| `isValidEmail()` | Regex validaci�n | Todos |
| `isValidPassword()` | Min 6 chars | mod-auth-login, mod-auth-registro |
| `isValidCode()` | 6 d�gitos | mod-auth-email-verificacion |
| `checkEmailExists()` | Cloud Function | mod-auth-login, mod-auth-registro |
| `requestEmailCode()` | Cloud Function | mod-auth-email-verificacion |
| `verifyEmailCode()` | Cloud Function | mod-auth-email-verificacion |
| `finalizeRegistration()` | Cloud Function | mod-auth-registro |
| `loginWithEmail()` | signInWithEmailAndPassword wrapper | mod-auth-login |
| `loginWithGoogle()` | signInWithPopup + profile creation | mod-auth-google |
| `linkGoogleToPassword()` | Vinculaci�n de cuentas | mod-auth-google |
| `getSignInMethods()` | fetchSignInMethodsForEmail | mod-auth-login |
| `getCloudFunctionErrorMessage()` | Traductor errores CF | Todos |

**Tipos exportados:**
- `CheckEmailResult`
- `RequestCodeResult`
- `VerifyCodeResult`
- `FinalizeResult`
- `RegistrationData`
- `AuthStep`

---

### 3. Componente de Acceso (UI)
**Archivo:** `src/app/components/landing/ClientAccessInline.tsx`

| Elemento | Descripci�n | Destino M�dulo |
|----------|-------------|----------------|
| Email input + "Acceso/Registro" | Step EMAIL_STEP | mod-auth-login, mod-auth-registro |
| Password input + "Acceder" | Step LOGIN_STEP | mod-auth-login |
| "Acceder con Google" button | Google OAuth | mod-auth-google |
| Formulario expandido (Nombre, Apellido, etc.) | Step REGISTER_START | mod-auth-registro |
| Input c�digo 6 d�gitos | Step VERIFY_CODE | mod-auth-email-verificacion |
| "Restablecer contrase�a" link | sendPasswordResetEmail | mod-auth-login |
| Estados: loading, error, success | UX feedback | Todos |

**Campos de formulario actuales:**
- `email` (requerido)
- `password` (requerido, min 6 chars)
- `confirmPassword` (registro, debe coincidir)
- `firstName` (registro, min 2 chars)
- `lastName` (registro, min 2 chars)
- `phonePrefix` (registro, default +598)
- `phone` (registro, opcional)
- `code` (verificaci�n, 6 d�gitos)

---

### 4. Contexto de Autenticaci�n
**Archivo:** `src/app/contexts/AuthContext.tsx`

| Elemento | Descripci�n | Destino M�dulo |
|----------|-------------|----------------|
| `AuthProvider` | Provider de contexto | mod-auth-orchestrator |
| `useAuth()` | Hook principal | mod-auth-orchestrator |
| `useUserProfile()` | Hook perfil | mod-auth-orchestrator |
| `useIsAuthenticated()` | Hook boolean auth | mod-auth-orchestrator |
| `onAuthStateChanged` listener | Escucha cambios auth | mod-auth-orchestrator |
| `ensureUserProfile()` | Crea/actualiza perfil Firestore | mod-auth-orchestrator |
| Loading spinner | UI mientras carga | mod-auth-orchestrator |

**Estado del contexto:**
- `user: User | null`
- `profile: UserProfile | null`
- `uiRole: RolSistema`
- `loading: boolean`
- `error: string | null`
- `isNewUser: boolean`

---

### 5. Servicio de Usuarios
**Archivo:** `src/app/services/usersService.ts`

| Funci�n | Descripci�n | Destino M�dulo |
|---------|-------------|----------------|
| `getUserProfile()` | Lee perfil de Firestore | mod-auth-orchestrator |
| `ensureUserProfile()` | Crea/actualiza perfil | mod-auth-orchestrator |
| `mapFirebaseRoleToUI()` | Mapeo admin?Administrador | mod-auth-orchestrator |

---

### 6. Cloud Functions (Backend)
**Archivo:** `functions/src/index.ts`

| Funci�n | Descripci�n | Destino M�dulo |
|---------|-------------|----------------|
| `checkEmailExists` | Verifica email en client_accounts + Auth | mod-auth-login, mod-auth-registro |
| `requestEmailCode` | Genera c�digo + env�a email | mod-auth-email-verificacion |
| `verifyEmailCode` | Valida c�digo con bcrypt | mod-auth-email-verificacion |
| `finalizeRegistration` | Crea usuario Auth + documentos Firestore | mod-auth-registro |

**Colecciones Firestore usadas:**
- `users` - Perfiles de usuario
- `client_accounts` - Cuentas de cliente (por email normalizado)
- `client_profiles` - Datos adicionales de perfil
- `email_verifications` - C�digos de verificaci�n temporales
- `mail` - Cola para extensi�n Trigger Email

---

## DECISIONES DE DISE�O

### Modo Google Login
- **Actual:** `signInWithPopup` (popup)
- **Par�metros:** `prompt: 'consent select_account'`
- **Scopes:** `email`, `profile`

### Verificaci�n de Email
- **M�todo:** C�digo de 6 d�gitos por email (NO el nativo de Firebase)
- **Flujo:**
  1. Usuario ingresa datos ? `requestEmailCode` (CF)
  2. Backend genera c�digo, hashea con bcrypt, guarda en `email_verifications`
  3. Backend env�a email via extensi�n Trigger Email
  4. Usuario ingresa c�digo ? `verifyEmailCode` (CF)
  5. Backend compara hash ? marca `verified: true`
  6. Frontend llama `finalizeRegistration` (CF)
  7. Backend crea usuario en Auth + documentos Firestore

### Rate Limiting
- 60 segundos entre solicitudes de c�digo
- M�ximo 5 intentos de c�digo incorrecto
- C�digo expira en 10 minutos (+ 30 min extra despu�s de verificar)

### Manejo de Errores
- Funci�n `getFirebaseErrorMessage()` traduce c�digos Firebase a espa�ol
- Funci�n `getCloudFunctionErrorMessage()` traduce errores de Cloud Functions

---

## COMPATIBILIDAD

### Framework
- **Actual:** Vite + React 18
- **M�dulos deben:** Funcionar con React 18+, no depender de Vite espec�ficamente

### Estilos
- **Actual:** Tailwind CSS 4.x + clases CSS variables
- **M�dulos deben:** Aceptar ThemeConfig o usar ThemeSetupForm

### Routing
- **Actual:** react-router-dom v7
- **M�dulos deben:** Aceptar callback `onSuccess` en lugar de hacer navigate directamente

---

## NOTAS DE MIGRACI�N

1. **No cambiar nombres de campos** - Los campos del formulario deben mantener exactamente los mismos nombres.

2. **No cambiar estructura de Cloud Functions** - Los m�dulos de frontend asumen que existen las CFs con los mismos contratos.

3. **Copiar validaciones exactas** - Las funciones `isValidEmail`, `isValidPassword`, `isValidCode` deben replicarse exactamente.

4. **Google Provider config** - Mantener exactamente los scopes y customParameters actuales.

5. **Manejo de `account-exists-with-different-credential`** - El flujo de linking debe mantenerse.

---

## ARCHIVOS A CREAR POR M�DULO

### mod-auth-login
- `src/index.ts` - Exports p�blicos
- `src/core/loginService.ts` - L�gica de login
- `src/components/LoginForm.tsx` - Componente UI
- `src/adapters/firebase/client.ts` - Inicializaci�n Firebase
- `src/types/index.ts` - Tipos
- `src/config/env.ts` - Config de env vars

### mod-auth-registro
- `src/index.ts`
- `src/core/registerService.ts`
- `src/components/RegisterForm.tsx`
- `src/adapters/firebase/client.ts`
- `src/types/index.ts`
- `src/config/env.ts`

### mod-auth-google
- `src/index.ts`
- `src/core/googleService.ts`
- `src/components/GoogleLoginButton.tsx`
- `src/adapters/firebase/client.ts`
- `src/types/index.ts`
- `src/config/env.ts`

### mod-auth-email-verificacion
- `src/index.ts`
- `src/core/verificationService.ts`
- `src/components/VerificationForm.tsx`
- `src/adapters/firebase/client.ts`
- `src/types/index.ts`
- `src/config/env.ts`

### mod-auth-orchestrator
- `src/index.ts`
- `src/components/AuthGateway.tsx`
- `src/components/AuthWizard.tsx`
- `src/components/ThemeSetupForm.tsx`
- `src/core/authContext.ts`
- `src/config/theme.ts`
- `src/types/index.ts`

---

*Generado autom�ticamente a partir del an�lisis del c�digo existente.*
