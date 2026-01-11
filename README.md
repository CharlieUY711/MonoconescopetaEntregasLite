# ODDY Entregas Lite

Sistema de gestión de entregas de última milla para empresas que necesitan cumplir con sus compromisos operativos.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

El servidor de desarrollo estará disponible en `http://localhost:5173/`

## 🔥 Firebase Setup

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Opcional: Usar emuladores en desarrollo
# VITE_USE_FIREBASE_EMULATORS=true
```

Obtén estos valores desde la consola de Firebase:
https://console.firebase.google.com/ > Project Settings > General > Your apps

### Configuración de Firebase

1. **Crear proyecto en Firebase Console**
   - Ir a https://console.firebase.google.com/
   - Crear nuevo proyecto o usar existente

2. **Habilitar Authentication**
   - En Firebase Console > Authentication > Sign-in method
   - Habilitar "Email/Password"
   - Habilitar "Google" (configurar OAuth consent screen si es necesario)

3. **Crear base de datos Firestore**
   - En Firebase Console > Firestore Database
   - Crear base de datos en modo producción
   - Seleccionar región (ej: us-central1)

4. **Desplegar Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Desplegar Cloud Functions**
   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   firebase deploy --only functions
   ```

6. **Configurar Firebase Trigger Email Extension** (para códigos de verificación)
   
   Esta extensión permite enviar emails de verificación a los clientes:
   
   a. Ir a Firebase Console > Extensions
   b. Buscar "Trigger Email" e instalar
   c. Configurar:
      - **SMTP connection URI**: Tu configuración SMTP
        - Gmail: `smtps://usuario@gmail.com:app_password@smtp.gmail.com:465`
        - SendGrid: `smtps://apikey:SG.xxxx@smtp.sendgrid.net:465`
      - **Email documents collection**: `mail`
      - **Default FROM address**: `noreply@tudominio.com`
   
   **Nota**: Para Gmail, necesitas crear una "App Password" en tu cuenta de Google.
   
   d. Una vez instalada, la extensión procesa automáticamente los documentos en la colección `mail`

### Configurar primer usuario Admin

Después del primer login, el usuario se crea con rol "client" por defecto. Para tener un admin:

1. Ir a Firebase Console > Firestore
2. Buscar la colección `users`
3. Encontrar el documento del usuario
4. Cambiar el campo `role` de `"client"` a `"admin"`

### Seed de datos (opcional)

Para poblar Firestore con datos de ejemplo:

```bash
# Requiere ts-node instalado globalmente o via npx
npx ts-node --esm scripts/seedFirestore.ts
```

**Nota**: El script usa Firebase Admin SDK. Para producción, necesitas configurar `GOOGLE_APPLICATION_CREDENTIALS` con el path a tu service account JSON.

## 🧪 Desarrollo con Emuladores

Para desarrollo local sin afectar datos de producción:

```bash
# Iniciar emuladores
firebase emulators:start

# En otra terminal, iniciar la app con emuladores
VITE_USE_FIREBASE_EMULATORS=true npm run dev
```

La UI de emuladores estará en http://localhost:4000/

## 📱 Vistas del Sistema

### Públicas
- **Landing Page** (`/`) - Página de inicio con información de servicios
- **Login** (`/#acceso-clientes`) - Formulario de acceso integrado en la landing

### Dashboard Operador
- **Inicio** (`/dashboard`) - Vista principal con entregas
- **Entregas** (`/dashboard/entregas`) - Gestión de entregas
- **Entidades** (`/dashboard/base-datos/entidades`) - Gestión de entidades
- **Personas** (`/dashboard/base-datos/personas`) - Gestión de personas

### Dashboard Cliente
- **Inicio** (`/dashboard-cliente`) - Vista de entregas del cliente
- Solo lectura + acuse de recibo

## 👥 Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `admin` | Administrador | CRUD entregas, cambiar estados, ver todos |
| `client` | Cliente | Ver sus entregas, confirmar recepción |
| `driver_mock` | Chofer (mock) | Ver entregas (sin lógica avanzada en V1) |

## 🎯 Funcionalidades V1

### Autenticación
- ✅ Login con Email/Password
- ✅ Login con Google
- ✅ Registro automático en primer login
- ✅ Perfil de usuario en Firestore

### Entregas
- ✅ Listado con filtros y búsqueda
- ✅ Detalle con historial de eventos
- ✅ CRUD (solo admin)
- ✅ Cambio de estados (solo admin)
- ✅ Acuse de recibo (solo cliente, vía Cloud Function)

### Seguridad
- ✅ Firestore Rules fail-closed
- ✅ Cliente solo ve sus entregas (filtro por clientId)
- ✅ Cliente no puede modificar status directamente
- ✅ Acuse ejecutado vía Cloud Function autenticada

## 🎨 Criterios Visuales

El sistema sigue criterios visuales **canónicos**:

| Elemento | Valor |
|----------|-------|
| Altura de inputs/selects/botones | 35px |
| Radio de esquinas | 8px |
| Color primario (Sidebar/Acciones) | #00A9CE |
| Color secundario (Toolbar) | #FF6B35 |

## 📋 Estados de Entrega (Canónicos)

- Borrador
- Confirmado
- En curso
- En destino
- Recibido
- Cancelado

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── App.tsx                 # Router principal
│   ├── components/
│   │   ├── Dashboard.tsx       # Layout del dashboard
│   │   ├── dashboard/          # Vistas del dashboard
│   │   ├── landing/            # Componentes del landing
│   │   └── ui/                 # Componentes UI reutilizables
│   ├── contexts/
│   │   └── AuthContext.tsx     # Contexto de autenticación
│   ├── data/
│   │   ├── catalogos.ts        # Catálogos canónicos
│   │   └── entregas.ts         # Mock data (fallback)
│   ├── services/
│   │   ├── deliveriesService.ts # Servicio de entregas
│   │   └── usersService.ts     # Servicio de usuarios
│   └── state/
│       └── role.ts             # Role Switcher (solo dev)
├── lib/
│   └── firebase.ts             # Configuración Firebase
└── styles/                     # Estilos globales

functions/
├── src/
│   └── index.ts                # Cloud Functions (confirmReceipt)
├── package.json
└── tsconfig.json

firestore.rules                 # Security Rules
firestore.indexes.json          # Índices Firestore
firebase.json                   # Configuración Firebase
scripts/
└── seedFirestore.ts            # Script de seed
```

## 🚀 Deploy

### Hosting (Frontend)

```bash
# Build
npm run build

# Deploy hosting
firebase deploy --only hosting
```

### Cloud Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

### Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Todo junto

```bash
# Build frontend
npm run build

# Deploy todo
firebase deploy
```

## 📚 Documentación Adicional

Ver documentación completa en [`docs/ODDY_ENTREGAS_LITE_V1.md`](docs/ODDY_ENTREGAS_LITE_V1.md)

## 🛠️ Stack Tecnológico

- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS 4** (Estilos)
- **React Router DOM 7** (Navegación)
- **Firebase 12** (Auth, Firestore, Functions)
- **Lucide React** (Iconos)
- **Radix UI** (Componentes)

---

*ODDY Entregas Lite V1 - Enero 2026*
