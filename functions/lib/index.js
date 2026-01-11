"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeRegistration = exports.verifyEmailCode = exports.requestEmailCode = exports.checkEmailExists = exports.confirmReceipt = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const bcrypt = __importStar(require("bcryptjs"));
// Inicializar Firebase Admin (solo una vez)
admin.initializeApp();
// ============================================
// HELPERS
// ============================================
/**
 * Normaliza email: trim + lowercase
 */
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
/**
 * Genera código de 6 dígitos
 */
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
/**
 * Valida formato de email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// ============================================
// CONFIRM RECEIPT FUNCTION
// ============================================
exports.confirmReceipt = (0, https_1.onCall)({ region: "us-central1" }, async (request) => {
    // 1. Verificar autenticación
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Debes estar autenticado para confirmar recepción.");
    }
    const uid = request.auth.uid;
    const deliveryId = request.data?.deliveryId;
    // Validar deliveryId
    if (!deliveryId || typeof deliveryId !== "string") {
        throw new https_1.HttpsError("invalid-argument", "deliveryId es requerido y debe ser un string.");
    }
    const db = admin.firestore();
    // 2. Obtener perfil del usuario
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
        throw new https_1.HttpsError("not-found", "Perfil de usuario no encontrado.");
    }
    const userProfile = userDoc.data();
    // 3. Verificar rol de cliente
    if (userProfile.role !== "client") {
        throw new https_1.HttpsError("permission-denied", "Solo los clientes pueden confirmar recepción.");
    }
    // 4. Obtener la entrega
    const deliveryRef = db.collection("deliveries").doc(deliveryId);
    const deliveryDoc = await deliveryRef.get();
    if (!deliveryDoc.exists) {
        throw new https_1.HttpsError("not-found", "Entrega no encontrada.");
    }
    const deliveryData = deliveryDoc.data();
    // 5. Verificar que la entrega pertenece al cliente
    if (deliveryData.clientId !== userProfile.clientId) {
        throw new https_1.HttpsError("permission-denied", "No tienes permiso para confirmar esta entrega.");
    }
    // 6. Verificar estado "En destino"
    if (deliveryData.estado !== "En destino") {
        throw new https_1.HttpsError("failed-precondition", `La entrega no está "En destino". Estado actual: ${deliveryData.estado}`);
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
});
// ============================================
// CHECK EMAIL EXISTS
// ============================================
/**
 * Verifica si un email ya está registrado en client_accounts O en Firebase Auth
 * @param email - Email a verificar
 * @returns { exists: boolean }
 */
exports.checkEmailExists = (0, https_1.onCall)({ region: "us-central1" }, async (request) => {
    const email = request.data?.email;
    // Validar email
    if (!email || typeof email !== "string") {
        throw new https_1.HttpsError("invalid-argument", "Email es requerido.");
    }
    if (!isValidEmail(email)) {
        throw new https_1.HttpsError("invalid-argument", "Formato de email inválido.");
    }
    const emailNormalized = normalizeEmail(email);
    const db = admin.firestore();
    // Buscar en client_accounts
    const accountDoc = await db
        .collection("client_accounts")
        .doc(emailNormalized)
        .get();
    // Si existe en client_accounts, retornar true
    if (accountDoc.exists) {
        return {
            exists: true,
            email: emailNormalized,
        };
    }
    // También verificar en Firebase Auth
    try {
        await admin.auth().getUserByEmail(emailNormalized);
        // Si no lanza error, el usuario existe en Auth
        return {
            exists: true,
            email: emailNormalized,
        };
    }
    catch (error) {
        const authError = error;
        // Si el error es "user-not-found", el email no existe
        if (authError.code === "auth/user-not-found") {
            return {
                exists: false,
                email: emailNormalized,
            };
        }
        // Cualquier otro error, asumimos que no existe para no bloquear
        return {
            exists: false,
            email: emailNormalized,
        };
    }
});
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
exports.requestEmailCode = (0, https_1.onCall)({ region: "us-central1" }, async (request) => {
    const { email, password, firstName, lastName, phone } = request.data || {};
    // Validaciones
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
        throw new https_1.HttpsError("invalid-argument", "Email inválido.");
    }
    if (!password || typeof password !== "string" || password.length < 6) {
        throw new https_1.HttpsError("invalid-argument", "La contraseña debe tener al menos 6 caracteres.");
    }
    if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2) {
        throw new https_1.HttpsError("invalid-argument", "Nombre es requerido.");
    }
    if (!lastName || typeof lastName !== "string" || lastName.trim().length < 2) {
        throw new https_1.HttpsError("invalid-argument", "Apellido es requerido.");
    }
    const emailNormalized = normalizeEmail(email);
    const db = admin.firestore();
    // Verificar que el email no esté ya registrado
    const existingAccount = await db
        .collection("client_accounts")
        .doc(emailNormalized)
        .get();
    if (existingAccount.exists) {
        throw new https_1.HttpsError("already-exists", "Este email ya está registrado. Por favor, inicia sesión.");
    }
    // Rate limiting: verificar si hay una verificación reciente
    const verificationRef = db
        .collection("email_verifications")
        .doc(emailNormalized);
    const existingVerification = await verificationRef.get();
    if (existingVerification.exists) {
        const data = existingVerification.data();
        const createdAt = data.createdAt.toDate();
        const now = new Date();
        const secondsSinceCreation = (now.getTime() - createdAt.getTime()) / 1000;
        // Rate limit: 60 segundos entre solicitudes
        if (secondsSinceCreation < 60 && !data.verified) {
            const waitSeconds = Math.ceil(60 - secondsSinceCreation);
            throw new https_1.HttpsError("resource-exhausted", `Por favor espera ${waitSeconds} segundos antes de solicitar otro código.`);
        }
    }
    // Generar código y hash
    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
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
});
// ============================================
// VERIFY EMAIL CODE
// ============================================
/**
 * Verifica el código ingresado por el usuario
 *
 * @param email - Email del usuario
 * @param code - Código de 6 dígitos
 */
exports.verifyEmailCode = (0, https_1.onCall)({ region: "us-central1" }, async (request) => {
    const { email, code } = request.data || {};
    // Validaciones
    if (!email || typeof email !== "string") {
        throw new https_1.HttpsError("invalid-argument", "Email es requerido.");
    }
    if (!code || typeof code !== "string" || code.length !== 6) {
        throw new https_1.HttpsError("invalid-argument", "Código de 6 dígitos es requerido.");
    }
    const emailNormalized = normalizeEmail(email);
    const db = admin.firestore();
    const verificationRef = db
        .collection("email_verifications")
        .doc(emailNormalized);
    const verificationDoc = await verificationRef.get();
    if (!verificationDoc.exists) {
        throw new https_1.HttpsError("not-found", "No se encontró una solicitud de verificación. Solicita un nuevo código.");
    }
    const verification = verificationDoc.data();
    // Verificar expiración
    if (verification.expiresAt.toDate() < new Date()) {
        await verificationRef.delete();
        throw new https_1.HttpsError("deadline-exceeded", "El código ha expirado. Solicita uno nuevo.");
    }
    // Verificar intentos (máximo 5)
    if (verification.attempts >= 5) {
        await verificationRef.delete();
        throw new https_1.HttpsError("resource-exhausted", "Demasiados intentos fallidos. Solicita un nuevo código.");
    }
    // Verificar código
    const isValidCode = await bcrypt.compare(code, verification.codeHash);
    if (!isValidCode) {
        // Incrementar intentos
        await verificationRef.update({
            attempts: verification.attempts + 1,
        });
        const remainingAttempts = 4 - verification.attempts;
        throw new https_1.HttpsError("invalid-argument", `Código incorrecto. ${remainingAttempts > 0 ? `Te quedan ${remainingAttempts} intentos.` : "Último intento."}`);
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
});
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
exports.finalizeRegistration = (0, https_1.onCall)({ region: "us-central1" }, async (request) => {
    const { email } = request.data || {};
    if (!email || typeof email !== "string") {
        throw new https_1.HttpsError("invalid-argument", "Email es requerido.");
    }
    const emailNormalized = normalizeEmail(email);
    const db = admin.firestore();
    // Obtener verificación
    const verificationRef = db
        .collection("email_verifications")
        .doc(emailNormalized);
    const verificationDoc = await verificationRef.get();
    if (!verificationDoc.exists) {
        throw new https_1.HttpsError("not-found", "No se encontró verificación. Inicia el proceso nuevamente.");
    }
    const verification = verificationDoc.data();
    // Verificar que esté verificado
    if (!verification.verified) {
        throw new https_1.HttpsError("failed-precondition", "El email no ha sido verificado. Completa la verificación primero.");
    }
    // Verificar expiración (dar 30 minutos extra después de verificar)
    const extendedExpiration = new Date(verification.expiresAt.toDate().getTime() + 30 * 60 * 1000);
    if (extendedExpiration < new Date()) {
        await verificationRef.delete();
        throw new https_1.HttpsError("deadline-exceeded", "La sesión ha expirado. Inicia el proceso nuevamente.");
    }
    const pendingData = verification.pendingData;
    if (!pendingData) {
        throw new https_1.HttpsError("internal", "Datos de registro no encontrados. Inicia el proceso nuevamente.");
    }
    // Verificar que no exista ya la cuenta
    const existingAccount = await db
        .collection("client_accounts")
        .doc(emailNormalized)
        .get();
    if (existingAccount.exists) {
        await verificationRef.delete();
        throw new https_1.HttpsError("already-exists", "Esta cuenta ya fue creada. Por favor, inicia sesión.");
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
            });
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
    }
    catch (error) {
        // Si falla la creación del usuario Auth, propagar error
        const authError = error;
        if (authError.code === "auth/email-already-exists") {
            throw new https_1.HttpsError("already-exists", "Este email ya está registrado en el sistema.");
        }
        console.error("Error en finalizeRegistration:", error);
        throw new https_1.HttpsError("internal", "Error al crear la cuenta. Por favor, intenta nuevamente.");
    }
});
//# sourceMappingURL=index.js.map