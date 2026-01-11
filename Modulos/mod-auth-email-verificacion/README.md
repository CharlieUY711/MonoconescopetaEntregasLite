# mod-auth-email-verificacion

M�dulo independiente de verificaci�n de email con c�digo de 6 d�gitos.

## Flujo de Verificaci�n

1. Usuario proporciona email y datos
2. Se llama a Cloud Function `requestEmailCode`:
   - Genera c�digo de 6 d�gitos
   - Hashea con bcrypt y guarda en `email_verifications`
   - Env�a email via extensi�n Trigger Email
3. Usuario recibe email e ingresa c�digo
4. Se llama a Cloud Function `verifyEmailCode`:
   - Verifica expiraci�n (10 min)
   - Verifica intentos (m�x 5)
   - Compara c�digo con hash
   - Marca como `verified: true`
5. Frontend recibe confirmaci�n

## Instalaci�n

```bash
npm install firebase
```

## Uso

### Componente React

```tsx
import { VerificationForm } from 'mod-auth-email-verificacion';

function VerifyPage() {
  const userData = {
    email: 'user@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
  };

  return (
    <VerificationForm
      email={userData.email}
      userData={userData}
      onVerified={(email) => {
        console.log('Email verificado:', email);
        // Proceder con registro
      }}
      onError={(error) => console.error(error)}
      onCancel={() => navigate('/register')}
      autoSend={true}
      resendCooldown={60}
    />
  );
}
```

### Como Hook

```tsx
import { useEmailVerification } from 'mod-auth-email-verificacion';

function CustomVerification() {
  const {
    state,
    setCode,
    sendCode,
    verifyCode,
    resendCode,
    resendCountdown,
    canResend,
  } = useEmailVerification({
    email: 'user@example.com',
    userData: { email, password, firstName, lastName },
    onVerified: (email) => console.log('Verificado:', email),
  });

  return (
    <div>
      <input
        type="text"
        value={state.code}
        onChange={(e) => setCode(e.target.value)}
        maxLength={6}
      />
      <button onClick={verifyCode} disabled={state.loading}>
        Verificar
      </button>
      <button onClick={resendCode} disabled={!canResend}>
        Reenviar {resendCountdown > 0 && `(${resendCountdown}s)`}
      </button>
    </div>
  );
}
```

### Funciones Directas

```tsx
import { requestEmailCode, verifyEmailCode } from 'mod-auth-email-verificacion';

// Solicitar c�digo
const result = await requestEmailCode({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
});

// Verificar c�digo
const verification = await verifyEmailCode('user@example.com', '123456');
if (verification.verified) {
  console.log('Email verificado!');
}
```

## Props del Componente

| Prop | Tipo | Default | Descripci�n |
|------|------|---------|-------------|
| `email` | `string` | - | Email a verificar (requerido) |
| `userData` | `VerificationRequestData` | - | Datos para generar c�digo |
| `onVerified` | `(email) => void` | - | Callback al verificar |
| `onError` | `(error) => void` | - | Callback al error |
| `onCancel` | `() => void` | - | Callback para cancelar |
| `firebaseConfig` | `FirebaseConfig` | - | Config Firebase |
| `theme` | `ThemeConfig` | - | Personalizaci�n visual |
| `resendCooldown` | `number` | `60` | Segundos entre reenv�os |
| `autoSend` | `boolean` | `true` | Enviar c�digo al montar |
| `labels` | `VerificationFormLabels` | - | Textos personalizados |

## Cloud Functions Requeridas

### requestEmailCode

```typescript
export const requestEmailCode = onCall(async (request) => {
  const { email, password, firstName, lastName, phone } = request.data;
  
  // 1. Validar datos
  // 2. Generar c�digo de 6 d�gitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 3. Hashear y guardar
  const codeHash = await bcrypt.hash(code, 10);
  await db.collection('email_verifications').doc(email).set({
    codeHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 0,
    verified: false,
    pendingData: { email, password, firstName, lastName, phone },
    createdAt: new Date(),
  });
  
  // 4. Enviar email
  await db.collection('mail').add({
    to: email,
    message: {
      subject: 'C�digo de verificaci�n',
      html: `Tu c�digo es: ${code}`,
    },
  });
  
  return { success: true, email };
});
```

### verifyEmailCode

```typescript
export const verifyEmailCode = onCall(async (request) => {
  const { email, code } = request.data;
  
  const doc = await db.collection('email_verifications').doc(email).get();
  const data = doc.data();
  
  // Verificar expiraci�n
  if (data.expiresAt.toDate() < new Date()) {
    throw new HttpsError('deadline-exceeded', 'C�digo expirado');
  }
  
  // Verificar intentos
  if (data.attempts >= 5) {
    throw new HttpsError('resource-exhausted', 'Demasiados intentos');
  }
  
  // Verificar c�digo
  const isValid = await bcrypt.compare(code, data.codeHash);
  
  if (!isValid) {
    await doc.ref.update({ attempts: data.attempts + 1 });
    throw new HttpsError('invalid-argument', 'C�digo incorrecto');
  }
  
  await doc.ref.update({ verified: true });
  return { success: true, verified: true };
});
```

## Configuraci�n

### Extensi�n Trigger Email

1. Firebase Console > Extensions
2. Instalar "Trigger Email"
3. Configurar con SendGrid, Mailgun, o SMTP

### Colecci�n `email_verifications`

Estructura del documento:

```json
{
  "codeHash": "bcrypt hash del c�digo",
  "expiresAt": "Timestamp",
  "attempts": 0,
  "verified": false,
  "pendingData": {
    "email": "user@example.com",
    "password": "...",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+598..."
  },
  "createdAt": "Timestamp"
}
```

### Rate Limiting

- 60 segundos entre solicitudes de c�digo
- M�ximo 5 intentos de c�digo incorrecto
- C�digo expira en 10 minutos

## Variables de Entorno

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_APP_ID=1:123:web:abc
```

## Personalizaci�n

```tsx
<VerificationForm
  theme={{
    primaryColor: '#6366f1',
    successColor: '#22c55e',
    errorColor: '#ef4444',
    borderRadius: '8px',
  }}
  labels={{
    title: 'Verificar tu correo',
    instructions: 'Ingresa el c�digo que enviamos a',
    verifyButton: 'Confirmar',
    resendButton: 'Enviar de nuevo',
  }}
/>
```

## Licencia

MIT
