/**
 * CLIENTE FIREBASE - mod-auth-google
 * 
 * Inicializaci�n y gesti�n del cliente Firebase para Google Auth.
 * Basado en la implementaci�n original de ODDY Entregas Lite.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  type Auth,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  type Firestore 
} from 'firebase/firestore';
import type { FirebaseConfig, AuthUser, GoogleLoginResult, GoogleAuthMode } from '../../types';
import { resolveFirebaseConfig } from '../../config/env';

// ============================================
// SINGLETON
// ============================================

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestore: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export function createFirebaseClient(config?: FirebaseConfig): FirebaseApp {
  if (firebaseApp) return firebaseApp;

  const resolvedConfig = resolveFirebaseConfig(config);
  const existingApps = getApps();
  
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
  } else {
    firebaseApp = initializeApp(resolvedConfig);
  }

  return firebaseApp;
}

export function getFirebaseAuth(config?: FirebaseConfig): Auth {
  if (firebaseAuth) return firebaseAuth;
  const app = createFirebaseClient(config);
  firebaseAuth = getAuth(app);
  return firebaseAuth;
}

export function getFirestoreDb(config?: FirebaseConfig): Firestore {
  if (firestore) return firestore;
  const app = createFirebaseClient(config);
  firestore = getFirestore(app);
  return firestore;
}

/**
 * Crea y configura el GoogleAuthProvider
 */
export function getGoogleProvider(
  additionalScopes?: string[],
  forceAccountSelection: boolean = true
): GoogleAuthProvider {
  if (googleProvider && !additionalScopes) {
    return googleProvider;
  }

  googleProvider = new GoogleAuthProvider();
  
  // Scopes por defecto (igual que el proyecto original)
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  
  // Scopes adicionales
  if (additionalScopes) {
    additionalScopes.forEach(scope => googleProvider!.addScope(scope));
  }

  // Forzar selecci�n de cuenta (igual que el proyecto original)
  if (forceAccountSelection) {
    googleProvider.setCustomParameters({
      prompt: 'consent select_account'
    });
  }

  return googleProvider;
}

// ============================================
// FUNCIONES DE AUTH
// ============================================

/**
 * Convierte User de Firebase a AuthUser
 */
function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

/**
 * Login con Google usando popup
 */
export async function loginWithGooglePopup(
  config?: FirebaseConfig,
  options?: {
    additionalScopes?: string[];
    forceAccountSelection?: boolean;
    createProfile?: boolean;
  }
): Promise<GoogleLoginResult> {
  const auth = getFirebaseAuth(config);
  const provider = getGoogleProvider(
    options?.additionalScopes,
    options?.forceAccountSelection ?? true
  );

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Verificar si es usuario nuevo
    let isNew = false;
    if (options?.createProfile !== false) {
      const db = getFirestoreDb(config);
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      isNew = !profileDoc.exists();

      // Crear perfil si es nuevo
      if (isNew) {
        await createUserProfile(user, db);
      }
    }

    return {
      user: toAuthUser(user),
      isNew,
    };
  } catch (error: unknown) {
    const authError = error as { code?: string; customData?: { email?: string } };
    
    // Caso: cuenta existe con diferente credencial
    if (authError.code === 'auth/account-exists-with-different-credential') {
      const email = authError.customData?.email;
      if (email) {
        return {
          user: null as unknown as AuthUser,
          isNew: false,
          needsLinking: true,
          email,
        };
      }
    }
    
    throw error;
  }
}

/**
 * Login con Google usando redirect
 */
export async function loginWithGoogleRedirect(
  config?: FirebaseConfig,
  options?: {
    additionalScopes?: string[];
    forceAccountSelection?: boolean;
  }
): Promise<void> {
  const auth = getFirebaseAuth(config);
  const provider = getGoogleProvider(
    options?.additionalScopes,
    options?.forceAccountSelection ?? true
  );

  await signInWithRedirect(auth, provider);
}

/**
 * Obtiene el resultado del redirect
 */
export async function getGoogleRedirectResult(
  config?: FirebaseConfig,
  createProfile: boolean = true
): Promise<GoogleLoginResult | null> {
  const auth = getFirebaseAuth(config);
  const result = await getRedirectResult(auth);

  if (!result) return null;

  const user = result.user;
  let isNew = false;

  if (createProfile) {
    const db = getFirestoreDb(config);
    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    isNew = !profileDoc.exists();

    if (isNew) {
      await createUserProfile(user, db);
    }
  }

  return {
    user: toAuthUser(user),
    isNew,
  };
}

/**
 * Crea perfil de usuario en Firestore (igual que el proyecto original)
 */
async function createUserProfile(user: User, db: Firestore): Promise<void> {
  const now = serverTimestamp();
  const email = user.email?.trim().toLowerCase() || '';
  const displayName = user.displayName || '';
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Crear en users
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email,
    displayName,
    role: 'client',
    clientId: null,
    provider: 'google',
    createdAt: now,
    updatedAt: now,
  });

  // Crear en client_accounts
  await setDoc(doc(db, 'client_accounts', email), {
    email,
    emailNormalized: email,
    uid: user.uid,
    status: 'active',
    authProvider: 'google',
    createdAt: now,
    updatedAt: now,
  });

  // Crear en client_profiles
  await setDoc(doc(db, 'client_profiles', user.uid), {
    firstName,
    lastName,
    email,
    phone: null,
    entity: null,
    address: null,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Vincula cuenta Google con cuenta password existente
 */
export async function linkGoogleWithPassword(
  email: string,
  password: string,
  config?: FirebaseConfig
): Promise<AuthUser> {
  const auth = getFirebaseAuth(config);
  
  // Login con email/password
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Obtener credencial de Google via popup
  const provider = getGoogleProvider();
  const googleResult = await signInWithPopup(auth, provider);
  const googleCredential = EmailAuthProvider.credential(
    googleResult.user.email || '',
    ''
  );
  
  // Vincular
  await linkWithCredential(userCredential.user, googleCredential);
  
  return toAuthUser(userCredential.user);
}

/**
 * Obtiene los m�todos de login disponibles para un email
 */
export async function getSignInMethods(
  email: string,
  config?: FirebaseConfig
): Promise<string[]> {
  const auth = getFirebaseAuth(config);
  return fetchSignInMethodsForEmail(auth, email.trim().toLowerCase());
}

// ============================================
// MANEJO DE ERRORES
// ============================================

export function getFirebaseErrorMessage(error: unknown): string {
  const firebaseError = error as { code?: string; message?: string };
  
  switch (firebaseError.code) {
    case 'auth/popup-closed-by-user':
      return 'Inicio de sesi�n cancelado, intente nuevamente';
    case 'auth/popup-blocked':
      return 'El navegador bloque� la ventana emergente. Permite los popups para este sitio.';
    case 'auth/account-exists-with-different-credential':
      return 'Ya existe una cuenta con este email usando otro m�todo de inicio de sesi�n.';
    case 'auth/cancelled-popup-request':
      return 'Operaci�n cancelada';
    case 'auth/network-request-failed':
      return 'Error de conexi�n. Verifica tu internet';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intenta m�s tarde';
    case 'auth/user-disabled':
      return 'Usuario deshabilitado';
    case 'auth/operation-not-allowed':
      return 'El inicio de sesi�n con Google no est� habilitado';
    default:
      return firebaseError.message || 'Error al iniciar sesi�n con Google';
  }
}
