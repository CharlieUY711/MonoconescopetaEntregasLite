/**
 * CLIENT DOCUMENTS SERVICE - ODDY Entregas Lite V1
 * 
 * Servicio para gestión de documentos e imágenes del usuario:
 * - Lectura de documentos desde Firestore
 * - Filtrado por tipo (archivos vs imágenes)
 * - Cálculo de uso de cuota
 * 
 * Colecciones:
 * - client_documents/{uid}/items/{docId}  (documentos de persona)
 * - entity_documents/{entityId}/items/{docId}  (documentos de entidad - futuro)
 */

import { 
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// ============================================
// TIPOS
// ============================================

export interface ClientDocument {
  id: string;
  name: string;
  fileName: string;
  contentType: string;
  size: number; // bytes
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface DocumentsQuota {
  usedBytes: number;
  quotaBytes: number;
  percentage: number;
}

export interface DocumentsResult {
  files: ClientDocument[];
  images: ClientDocument[];
  quota: DocumentsQuota;
}

// ============================================
// CONSTANTES
// ============================================

const CLIENT_DOCUMENTS_COLLECTION = 'client_documents';

// Cuotas por defecto
const PERSON_QUOTA_BYTES = 10 * 1024 * 1024; // 10 MB
const ENTITY_QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GB

// Tipos MIME de imágenes
const IMAGE_MIME_PREFIXES = ['image/'];

// ============================================
// HELPERS
// ============================================

/**
 * Determina si un contentType es una imagen
 */
export function isImageContentType(contentType: string): boolean {
  return IMAGE_MIME_PREFIXES.some(prefix => contentType.startsWith(prefix));
}

/**
 * Formatea bytes a texto legible
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Formatea fecha a texto legible
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Obtiene todos los documentos de un usuario
 * @param uid - UID del usuario
 * @returns Documentos separados en archivos e imágenes + cuota
 */
export async function getClientDocuments(uid: string): Promise<DocumentsResult> {
  try {
    const itemsRef = collection(db, CLIENT_DOCUMENTS_COLLECTION, uid, 'items');
    const q = query(itemsRef, orderBy('uploadedAt', 'desc'));
    const snapshot = await getDocs(q);

    const files: ClientDocument[] = [];
    const images: ClientDocument[] = [];
    let usedBytes = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const document: ClientDocument = {
        id: docSnap.id,
        name: data.name || data.fileName || 'Sin nombre',
        fileName: data.fileName || data.name || 'archivo',
        contentType: data.contentType || 'application/octet-stream',
        size: data.size || 0,
        url: data.url || '',
        uploadedAt: data.uploadedAt instanceof Timestamp 
          ? data.uploadedAt.toDate() 
          : new Date(data.uploadedAt || Date.now()),
        uploadedBy: data.uploadedBy || uid
      };

      usedBytes += document.size;

      // Separar por tipo
      if (isImageContentType(document.contentType)) {
        images.push(document);
      } else {
        files.push(document);
      }
    });

    const quota: DocumentsQuota = {
      usedBytes,
      quotaBytes: PERSON_QUOTA_BYTES,
      percentage: Math.min(100, (usedBytes / PERSON_QUOTA_BYTES) * 100)
    };

    return { files, images, quota };
  } catch (error) {
    console.error('[ClientDocumentsService] Error obteniendo documentos:', error);
    
    // Retornar vacío en caso de error
    return {
      files: [],
      images: [],
      quota: {
        usedBytes: 0,
        quotaBytes: PERSON_QUOTA_BYTES,
        percentage: 0
      }
    };
  }
}

/**
 * Elimina un documento del usuario
 * @param uid - UID del usuario
 * @param docId - ID del documento a eliminar
 */
export async function deleteClientDocument(uid: string, docId: string): Promise<void> {
  const docRef = doc(db, CLIENT_DOCUMENTS_COLLECTION, uid, 'items', docId);
  await deleteDoc(docRef);
}

/**
 * Obtiene la cuota del usuario (para mostrar en el perfil)
 * @param uid - UID del usuario
 */
export async function getClientQuota(uid: string): Promise<DocumentsQuota> {
  const { quota } = await getClientDocuments(uid);
  return quota;
}

// ============================================
// FUNCIONES PARA ENTIDADES (PLACEHOLDER)
// ============================================

/**
 * Obtiene documentos de una entidad (TODO: implementar)
 * @param entityId - ID de la entidad
 */
export async function getEntityDocuments(_entityId: string): Promise<DocumentsResult> {
  // TODO: Implementar cuando se necesite
  console.log('[ClientDocumentsService] getEntityDocuments no implementado aún');
  
  return {
    files: [],
    images: [],
    quota: {
      usedBytes: 0,
      quotaBytes: ENTITY_QUOTA_BYTES,
      percentage: 0
    }
  };
}
