/**
 * CLOUD FUNCTIONS - ODDY Entregas Lite V1
 * 
 * Funciones:
 * - confirmReceipt: Acuse de recibo seguro (solo cliente)
 * - checkEmailExists: Verifica si email está registrado
 * - requestEmailCode: Genera y envía código de verificación
 * - verifyEmailCode: Valida código de verificación
 * - finalizeRegistration: Completa registro de cliente
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as bcrypt from "bcryptjs";

// Inicializar Firebase Admin (solo una vez)
admin.initializeApp();

// ============================================
// TIPOS
// ============================================

interface ClientAccount {
  email: string;
  emailNormalized: string;
  uid: string | null;
  status: "pending_verification" | "active" | "disabled";
  authProvider: "password" | "google";
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

interface EmailVerification {
  codeHash: string;
  expiresAt: admin.firestore.Timestamp;
  attempts: number;
  verified: boolean;
  createdAt: admin.firestore.Timestamp;
  pendingData?: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

// ============================================
// HELPERS
// ============================================

/**
 * Normaliza email: trim + lowercase
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Genera código de 6 dígitos
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Valida formato de email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// CONFIRM RECEIPT FUNCTION
// ============================================

export const confirmReceipt = onCall(
  { region: "us-central1" },
  async (request) => {
    // 1. Verificar autenticación
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Debes estar autenticado para confirmar recepción."
      );
    }

    const uid = request.auth.uid;
    const deliveryId = request.data?.deliveryId;

    // Validar deliveryId
    if (!deliveryId || typeof deliveryId !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "deliveryId es requerido y debe ser un string."
      );
    }

    const db = admin.firestore();

    // 2. Obtener perfil del usuario
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      throw new HttpsError(
        "not-found",
        "Perfil de usuario no encontrado."
      );
    }

    const userProfile = userDoc.data()!;

    // 3. Verificar rol de cliente
    if (userProfile.role !== "client") {
      throw new HttpsError(
        "permission-denied",
        "Solo los clientes pueden confirmar recepción."
      );
    }

    // 4. Obtener la entrega
    const deliveryRef = db.collection("deliveries").doc(deliveryId);
    const deliveryDoc = await deliveryRef.get();

    if (!deliveryDoc.exists) {
      throw new HttpsError(
        "not-found",
        "Entrega no encontrada."
      );
    }

    const deliveryData = deliveryDoc.data()!;

    // 5. Verificar que la entrega pertenece al cliente
    if (deliveryData.clientId !== userProfile.clientId) {
      throw new HttpsError(
        "permission-denied",
        "No tienes permiso para confirmar esta entrega."
      );
    }

    // 6. Verificar estado "En destino"
    if (deliveryData.estado !== "En destino") {
      throw new HttpsError(
        "failed-precondition",
        `La entrega no está "En destino". Estado actual: ${deliveryData.estado}`
      );
    }

    // 7. Ejecutar transacción para actualizar delivery y crear evento
    const now = admin.firestore.FieldValue.serverTimestamp();
    const receivedAtDate = new Date();

    await db.runTransaction(async (transaction) => {
      // Actualizar delivery
      transaction.update(deliveryRef, {
        estado: "Recibido",
        receivedAt: now,
        updatedAt: now,
      });

      // Crear evento en subcolección
      const eventRef = deliveryRef.collection("events").doc();
      transaction.set(eventRef, {
        type: "CLIENT_CONFIRMED_RECEIPT",
        fromStatus: "En destino",
        toStatus: "Recibido",
        actorUid: uid,
        actorRole: "client",
        timestamp: now,
        note: "Cliente confirmó recepción",
      });
    });

    // 8. Retornar resultado exitoso
    return {
      success: true,
      deliveryId,
      newStatus: "Recibido",
      receivedAt: receivedAtDate.toISOString(),
      message: "Recepción confirmada exitosamente.",
    };
  }
);

// ============================================
// CHECK EMAIL EXISTS
// ============================================

/**
 * Verifica si un email ya está registrado en client_accounts
 * @param email - Email a verificar
 * @returns { exists: boolean }
 */
export const checkEmailExists = onCall(
  { region: "us-central1" },
  async (request) => {
    const email = request.data?.email;

    // Validar email
    if (!email || typeof email !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "Email es requerido."
      );
    }

    if (!isValidEmail(email)) {
      throw new HttpsError(
        "invalid-argument",
        "Formato de email inválido."
      );
    }

    const emailNormalized = normalizeEmail(email);
    const db = admin.firestore();

    // Buscar en client_accounts
    const accountDoc = await db
      .collection("client_accounts")
      .doc(emailNormalized)
      .get();

    return {
      exists: accountDoc.exists,
      email: emailNormalized,
    };
  }
);

// ============================================
// REQUEST EMAIL CODE
// ============================================

/**
 * Genera código de verificación y lo envía por email
 * Guarda hash del código en email_verifications
 * 
 * @param email - Email del usuario
 * @param password - Contraseña elegida
 * @param firstName - Nombre
 * @param lastName - Apellido
 * @param phone - Teléfono (opcional)
 */
export const requestEmailCode = onCall(
  { region: "us-central1" },
  async (request) => {
    const { email, password, firstName, lastName, phone } = request.data || {};

    // Validaciones
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      throw new HttpsError("invalid-argument", "Email inválido.");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      throw new HttpsError(
        "invalid-argument",
        "La contraseña debe tener al menos 6 caracteres."
      );
    }

    if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2) {
      throw new HttpsError("invalid-argument", "Nombre es requerido.");
    }

    if (!lastName || typeof lastName !== "string" || lastName.trim().length < 2) {
      throw new HttpsError("invalid-argument", "Apellido es requerido.");
    }

    const emailNormalized = normalizeEmail(email);
    const db = admin.firestore();

    // Verificar que el email no esté ya registrado
    const existingAccount = await db
      .collection("client_accounts")
      .doc(emailNormalized)
      .get();

    if (existingAccount.exists) {
      throw new HttpsError(
        "already-exists",
        "Este email ya está registrado. Por favor, inicia sesión."
      );
    }

    // Rate limiting: verificar si hay una verificación reciente
    const verificationRef = db
      .collection("email_verifications")
      .doc(emailNormalized);
    const existingVerification = await verificationRef.get();

    if (existingVerification.exists) {
      const data = existingVerification.data() as EmailVerification;
      const createdAt = data.createdAt.toDate();
      const now = new Date();
      const secondsSinceCreation = (now.getTime() - createdAt.getTime()) / 1000;

      // Rate limit: 60 segundos entre solicitudes
      if (secondsSinceCreation < 60 && !data.verified) {
        const waitSeconds = Math.ceil(60 - secondsSinceCreation);
        throw new HttpsError(
          "resource-exhausted",
          `Por favor espera ${waitSeconds} segundos antes de solicitar otro código.`
        );
      }
    }

    // Generar código y hash
    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
    );

    // Guardar verificación con datos pendientes
    await verificationRef.set({
      codeHash,
      expiresAt,
      attempts: 0,
      verified: false,
      createdAt: now,
      pendingData: {
        email: emailNormalized,
        password, // Se hasheará al crear el usuario en Auth
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
      },
    });

    // Enviar email usando la extensión Trigger Email
    // Escribir en la colección 'mail' que la extensión procesa
    await db.collection("mail").add({
      to: emailNormalized,
      message: {
        subject: "ODDY Entregas - Código de verificación",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Bienvenido a ODDY Entregas</h2>
            <p>Hola ${firstName.trim()},</p>
            <p>Tu código de verificación es:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">
                ${code}
              </span>
            </div>
            <p>Este código expira en 10 minutos.</p>
            <p style="color: #6b7280; font-size: 14px;">
              Si no solicitaste este código, puedes ignorar este email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              ODDY Entregas Lite - Sistema de gestión de entregas
            </p>
          </div>
        `,
      },
    });

    return {
      success: true,
      message: "Código enviado al email proporcionado.",
      email: emailNormalized,
    };
  }
);

// ============================================
// VERIFY EMAIL CODE
// ============================================

/**
 * Verifica el código ingresado por el usuario
 * 
 * @param email - Email del usuario
 * @param code - Código de 6 dígitos
 */
export const verifyEmailCode = onCall(
  { region: "us-central1" },
  async (request) => {
    const { email, code } = request.data || {};

    // Validaciones
    if (!email || typeof email !== "string") {
      throw new HttpsError("invalid-argument", "Email es requerido.");
    }

    if (!code || typeof code !== "string" || code.length !== 6) {
      throw new HttpsError(
        "invalid-argument",
        "Código de 6 dígitos es requerido."
      );
    }

    const emailNormalized = normalizeEmail(email);
    const db = admin.firestore();

    const verificationRef = db
      .collection("email_verifications")
      .doc(emailNormalized);
    const verificationDoc = await verificationRef.get();

    if (!verificationDoc.exists) {
      throw new HttpsError(
        "not-found",
        "No se encontró una solicitud de verificación. Solicita un nuevo código."
      );
    }

    const verification = verificationDoc.data() as EmailVerification;

    // Verificar expiración
    if (verification.expiresAt.toDate() < new Date()) {
      await verificationRef.delete();
      throw new HttpsError(
        "deadline-exceeded",
        "El código ha expirado. Solicita uno nuevo."
      );
    }

    // Verificar intentos (máximo 5)
    if (verification.attempts >= 5) {
      await verificationRef.delete();
      throw new HttpsError(
        "resource-exhausted",
        "Demasiados intentos fallidos. Solicita un nuevo código."
      );
    }

    // Verificar código
    const isValidCode = await bcrypt.compare(code, verification.codeHash);

    if (!isValidCode) {
      // Incrementar intentos
      await verificationRef.update({
        attempts: verification.attempts + 1,
      });

      const remainingAttempts = 4 - verification.attempts;
      throw new HttpsError(
        "invalid-argument",
        `Código incorrecto. ${remainingAttempts > 0 ? `Te quedan ${remainingAttempts} intentos.` : "Último intento."}`
      );
    }

    // Código válido - marcar como verificado
    await verificationRef.update({
      verified: true,
    });

    return {
      success: true,
      message: "Código verificado correctamente.",
      verified: true,
    };
  }
);

// ============================================
// FINALIZE REGISTRATION
// ============================================

/**
 * Completa el registro del cliente:
 * - Crea usuario en Firebase Auth
 * - Crea documento en client_accounts
 * - Crea documento en client_profiles
 * - Crea documento en users (para compatibilidad con roles existentes)
 * 
 * @param email - Email verificado
 */
export const finalizeRegistration = onCall(
  { region: "us-central1" },
  async (request) => {
    const { email } = request.data || {};

    if (!email || typeof email !== "string") {
      throw new HttpsError("invalid-argument", "Email es requerido.");
    }

    const emailNormalized = normalizeEmail(email);
    const db = admin.firestore();

    // Obtener verificación
    const verificationRef = db
      .collection("email_verifications")
      .doc(emailNormalized);
    const verificationDoc = await verificationRef.get();

    if (!verificationDoc.exists) {
      throw new HttpsError(
        "not-found",
        "No se encontró verificación. Inicia el proceso nuevamente."
      );
    }

    const verification = verificationDoc.data() as EmailVerification;

    // Verificar que esté verificado
    if (!verification.verified) {
      throw new HttpsError(
        "failed-precondition",
        "El email no ha sido verificado. Completa la verificación primero."
      );
    }

    // Verificar expiración (dar 30 minutos extra después de verificar)
    const extendedExpiration = new Date(
      verification.expiresAt.toDate().getTime() + 30 * 60 * 1000
    );
    if (extendedExpiration < new Date()) {
      await verificationRef.delete();
      throw new HttpsError(
        "deadline-exceeded",
        "La sesión ha expirado. Inicia el proceso nuevamente."
      );
    }

    const pendingData = verification.pendingData;
    if (!pendingData) {
      throw new HttpsError(
        "internal",
        "Datos de registro no encontrados. Inicia el proceso nuevamente."
      );
    }

    // Verificar que no exista ya la cuenta
    const existingAccount = await db
      .collection("client_accounts")
      .doc(emailNormalized)
      .get();

    if (existingAccount.exists) {
      await verificationRef.delete();
      throw new HttpsError(
        "already-exists",
        "Esta cuenta ya fue creada. Por favor, inicia sesión."
      );
    }

    try {
      // 1. Crear usuario en Firebase Auth
      const userRecord = await admin.auth().createUser({
        email: emailNormalized,
        password: pendingData.password,
        displayName: `${pendingData.firstName} ${pendingData.lastName}`,
        emailVerified: true, // Ya verificamos el email
      });

      const now = admin.firestore.Timestamp.now();

      // 2. Crear documentos en transacción
      await db.runTransaction(async (transaction) => {
        // client_accounts
        transaction.set(db.collection("client_accounts").doc(emailNormalized), {
          email: emailNormalized,
          emailNormalized,
          uid: userRecord.uid,
          status: "active",
          authProvider: "password",
          createdAt: now,
          updatedAt: now,
        } as ClientAccount);

        // client_profiles
        transaction.set(db.collection("client_profiles").doc(userRecord.uid), {
          firstName: pendingData.firstName,
          lastName: pendingData.lastName,
          email: emailNormalized,
          phone: pendingData.phone || null,
          entity: null,
          address: null,
          createdAt: now,
          updatedAt: now,
        });

        // users (compatibilidad con sistema existente)
        transaction.set(db.collection("users").doc(userRecord.uid), {
          uid: userRecord.uid,
          email: emailNormalized,
          displayName: `${pendingData.firstName} ${pendingData.lastName}`,
          role: "client",
          clientId: null, // Se puede asignar después por admin
          provider: "password",
          createdAt: now,
          updatedAt: now,
        });
      });

      // 3. Limpiar verificación
      await verificationRef.delete();

      return {
        success: true,
        uid: userRecord.uid,
        email: emailNormalized,
        message: "Cuenta creada exitosamente. Ya puedes iniciar sesión.",
      };
    } catch (error) {
      // Si falla la creación del usuario Auth, propagar error
      const authError = error as { code?: string; message?: string };
      
      if (authError.code === "auth/email-already-exists") {
        throw new HttpsError(
          "already-exists",
          "Este email ya está registrado en el sistema."
        );
      }

      console.error("Error en finalizeRegistration:", error);
      throw new HttpsError(
        "internal",
        "Error al crear la cuenta. Por favor, intenta nuevamente."
      );
    }
  }
);
