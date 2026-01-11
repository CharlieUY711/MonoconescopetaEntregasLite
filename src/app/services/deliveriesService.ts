/**
 * DELIVERIES SERVICE - ODDY Entregas Lite V1
 * 
 * Gestión de entregas en Firestore:
 * - Suscripción en tiempo real filtrada por rol/clientId
 * - CRUD de entregas (solo admin)
 * - Acuse de recibo via Cloud Function
 * - Registro de eventos/historial
 */

import { 
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, type UserProfile, type UserRole } from '../../lib/firebase';
import type { Entrega, HistoryEvent } from '../data/entregas';

// ============================================
// CONSTANTES
// ============================================

const DELIVERIES_COLLECTION = 'deliveries';
const EVENTS_SUBCOLLECTION = 'events';

// ============================================
// TIPOS FIRESTORE
// ============================================

/**
 * Estructura de delivery en Firestore
 */
interface FirestoreDelivery {
  clientId: string;
  fecha: string;
  remitente: string;
  destinatario: string;
  direccion: string;
  estado: string;
  conductor: string;
  vehiculo: string;
  observaciones: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  receivedAt: Timestamp | null;
}

/**
 * Estructura de evento en Firestore
 */
interface FirestoreEvent {
  type: string;
  fromStatus: string | null;
  toStatus: string | null;
  actorUid: string;
  actorRole: string;
  timestamp: Timestamp;
  note: string | null;
}

/**
 * Datos para crear una nueva entrega
 */
export interface CreateDeliveryData {
  clientId: string;
  fecha: string;
  remitente: string;
  destinatario: string;
  direccion: string;
  estado: string;
  conductor?: string;
  vehiculo?: string;
  observaciones?: string;
}

/**
 * Datos para actualizar una entrega
 */
export interface UpdateDeliveryData {
  fecha?: string;
  remitente?: string;
  destinatario?: string;
  direccion?: string;
  estado?: string;
  conductor?: string;
  vehiculo?: string;
  observaciones?: string;
}

// ============================================
// HELPERS
// ============================================

/**
 * Convierte documento Firestore a tipo Entrega de UI
 */
function firestoreToEntrega(id: string, data: FirestoreDelivery): Entrega {
  return {
    id,
    fecha: data.fecha,
    remitente: data.remitente,
    destinatario: data.destinatario,
    direccion: data.direccion,
    estado: data.estado,
    conductor: data.conductor || '-',
    vehiculo: data.vehiculo || '-',
    observaciones: data.observaciones || '',
    ownerId: data.clientId,
    history: [], // Se carga aparte si es necesario
    acuseTimestamp: data.receivedAt?.toDate()?.toISOString() || undefined
  };
}

/**
 * Convierte evento Firestore a HistoryEvent de UI
 */
function firestoreToHistoryEvent(data: FirestoreEvent): HistoryEvent {
  let description = data.note || '';
  
  // Generar descripción si no hay nota
  if (!description && data.type === 'STATUS_CHANGED') {
    description = `Estado: ${data.fromStatus} → ${data.toStatus}`;
  } else if (!description && data.type === 'CLIENT_CONFIRMED_RECEIPT') {
    description = 'Cliente confirmó recepción';
  }

  return {
    type: data.type,
    timestamp: data.timestamp?.toDate()?.toISOString() || new Date().toISOString(),
    description
  };
}

// ============================================
// SUSCRIPCIONES EN TIEMPO REAL
// ============================================

/**
 * Suscribe a entregas filtradas según el perfil del usuario
 * - admin: todas las entregas
 * - client: solo entregas donde clientId coincide
 * - driver_mock: todas las entregas (readonly)
 * 
 * @param profile - Perfil del usuario actual
 * @param onData - Callback cuando llegan datos
 * @param onError - Callback en caso de error
 * @returns Función para cancelar suscripción
 */
export function subscribeDeliveriesForUser(
  profile: UserProfile,
  onData: (deliveries: Entrega[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const deliveriesRef = collection(db, DELIVERIES_COLLECTION);
  
  let q;
  
  if (profile.role === 'admin' || profile.role === 'driver_mock') {
    // Admin y driver ven todas las entregas, ordenadas por fecha descendente
    q = query(
      deliveriesRef,
      orderBy('createdAt', 'desc')
    );
  } else {
    // Cliente solo ve sus entregas
    if (!profile.clientId) {
      // Sin clientId, no ve nada
      onData([]);
      return () => {};
    }
    
    q = query(
      deliveriesRef,
      where('clientId', '==', profile.clientId),
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const deliveries: Entrega[] = [];
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreDelivery;
        deliveries.push(firestoreToEntrega(docSnap.id, data));
      });

      onData(deliveries);
    },
    (error) => {
      console.error('[DeliveriesService] Error en suscripción:', error);
      onError?.(error);
    }
  );
}

/**
 * Suscribe a los eventos/historial de una entrega específica
 */
export function subscribeDeliveryEvents(
  deliveryId: string,
  onData: (events: HistoryEvent[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const eventsRef = collection(db, DELIVERIES_COLLECTION, deliveryId, EVENTS_SUBCOLLECTION);
  const q = query(eventsRef, orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const events: HistoryEvent[] = [];
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreEvent;
        events.push(firestoreToHistoryEvent(data));
      });

      onData(events);
    },
    (error) => {
      console.error('[DeliveriesService] Error en suscripción de eventos:', error);
      onError?.(error);
    }
  );
}

// ============================================
// OPERACIONES CRUD (SOLO ADMIN)
// ============================================

/**
 * Crea una nueva entrega (solo admin)
 */
export async function createDelivery(
  data: CreateDeliveryData,
  actorUid: string,
  actorRole: UserRole
): Promise<string> {
  const deliveryData: Omit<FirestoreDelivery, 'createdAt' | 'updatedAt'> & { createdAt: ReturnType<typeof serverTimestamp>, updatedAt: ReturnType<typeof serverTimestamp> } = {
    clientId: data.clientId,
    fecha: data.fecha,
    remitente: data.remitente,
    destinatario: data.destinatario,
    direccion: data.direccion,
    estado: data.estado,
    conductor: data.conductor || '-',
    vehiculo: data.vehiculo || '-',
    observaciones: data.observaciones || '',
    receivedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, DELIVERIES_COLLECTION), deliveryData);

  // Crear evento de creación
  await addDoc(collection(db, DELIVERIES_COLLECTION, docRef.id, EVENTS_SUBCOLLECTION), {
    type: 'CREATED',
    fromStatus: null,
    toStatus: data.estado,
    actorUid,
    actorRole,
    timestamp: serverTimestamp(),
    note: 'Entrega creada'
  });

  return docRef.id;
}

/**
 * Actualiza una entrega existente (solo admin)
 * Registra evento STATUS_CHANGED si el estado cambió
 */
export async function updateDeliveryAsAdmin(
  deliveryId: string,
  updates: UpdateDeliveryData,
  currentStatus: string,
  actorUid: string,
  actorRole: UserRole
): Promise<void> {
  const deliveryRef = doc(db, DELIVERIES_COLLECTION, deliveryId);
  
  // Preparar datos de actualización
  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: serverTimestamp()
  };

  await updateDoc(deliveryRef, updateData);

  // Si cambió el estado, registrar evento
  if (updates.estado && updates.estado !== currentStatus) {
    await addDoc(collection(db, DELIVERIES_COLLECTION, deliveryId, EVENTS_SUBCOLLECTION), {
      type: 'STATUS_CHANGED',
      fromStatus: currentStatus,
      toStatus: updates.estado,
      actorUid,
      actorRole,
      timestamp: serverTimestamp(),
      note: null
    });
  }
}

// ============================================
// ACUSE DE RECIBO (VIA CLOUD FUNCTION)
// ============================================

/**
 * Resultado de la función confirmReceipt
 */
interface ConfirmReceiptResult {
  success: boolean;
  deliveryId: string;
  newStatus: string;
  receivedAt: string;
  message?: string;
}

/**
 * Confirma la recepción de una entrega (solo cliente)
 * Ejecuta vía Cloud Function para garantizar seguridad
 * 
 * @param deliveryId - ID de la entrega a confirmar
 * @returns Resultado de la operación
 */
export async function confirmReceipt(deliveryId: string): Promise<ConfirmReceiptResult> {
  const confirmReceiptFn = httpsCallable<{ deliveryId: string }, ConfirmReceiptResult>(
    functions, 
    'confirmReceipt'
  );

  try {
    const result = await confirmReceiptFn({ deliveryId });
    return result.data;
  } catch (error) {
    console.error('[DeliveriesService] Error en confirmReceipt:', error);
    throw error;
  }
}

// ============================================
// HELPERS PARA UI
// ============================================

/**
 * Verifica si un usuario puede confirmar recepción de una entrega
 */
export function canUserConfirmReceipt(
  profile: UserProfile | null,
  delivery: Entrega | null
): boolean {
  if (!profile || !delivery) return false;
  
  return (
    profile.role === 'client' &&
    delivery.estado === 'En destino' &&
    delivery.ownerId === profile.clientId
  );
}

/**
 * Verifica si un usuario puede editar entregas
 */
export function canUserEditDeliveries(profile: UserProfile): boolean {
  return profile.role === 'admin';
}

/**
 * Verifica si un usuario puede crear entregas
 */
export function canUserCreateDeliveries(profile: UserProfile): boolean {
  return profile.role === 'admin';
}
