/**
 * SERVICIO DE DOCUMENTOS INSTITUCIONALES - ODDY Entregas Lite
 * 
 * ============================================
 * V1 (ACTUAL): Solo lectura con datos mock
 * ============================================
 * - listDocs(): Retorna array de documentos mock
 * - No hay integración con Firestore/Storage
 * 
 * ============================================
 * V2 (PREVISTO): Administración completa
 * ============================================
 * Este skeleton está preparado para implementar:
 * - Integración con Firebase Storage para archivos
 * - Integración con Firestore para metadatos
 * - CRUD completo para administradores
 * 
 * Métodos previstos para V2:
 * - uploadDoc(file, metadata): Subir nuevo documento
 * - replaceDoc(docId, file): Reemplazar archivo existente
 * - deleteDoc(docId): Eliminar documento
 * - updateMetadata(docId, metadata): Actualizar metadatos
 */

import { institutionalDocs, type InstitutionalDoc } from '../data/institutionalDocs';

// ============================================
// V1: MÉTODOS ACTIVOS (SOLO LECTURA)
// ============================================

/**
 * Obtiene la lista de documentos institucionales
 * V1: Retorna datos mock locales
 * V2: Consultará Firestore
 */
export function listDocs(): InstitutionalDoc[] {
  return institutionalDocs;
}

/**
 * Obtiene un documento por su ID
 * V1: Busca en datos mock locales
 * V2: Consultará Firestore
 */
export function getDocById(docId: string): InstitutionalDoc | undefined {
  return institutionalDocs.find(doc => doc.id === docId);
}

// ============================================
// V2: MÉTODOS PREVISTOS (NO IMPLEMENTADOS)
// ============================================

/**
 * V2 admin action: Subir nuevo documento
 * @param _file - Archivo a subir
 * @param _metadata - Metadatos del documento (title, etc.)
 * @returns Promise con el documento creado
 * 
 * Implementación prevista:
 * 1. Subir archivo a Firebase Storage
 * 2. Obtener URLs de view y download
 * 3. Crear registro en Firestore
 * 4. Retornar documento con URLs
 */
export async function uploadDoc(
  _file: File,
  _metadata: { title: string }
): Promise<InstitutionalDoc> {
  // V2: Implementar integración con Firebase Storage/Firestore
  throw new Error('uploadDoc no implementado en V1');
}

/**
 * V2 admin action: Reemplazar archivo de documento existente
 * @param _docId - ID del documento a reemplazar
 * @param _file - Nuevo archivo
 * @returns Promise con el documento actualizado
 * 
 * Implementación prevista:
 * 1. Eliminar archivo anterior de Storage
 * 2. Subir nuevo archivo
 * 3. Actualizar URLs en Firestore
 * 4. Retornar documento actualizado
 */
export async function replaceDoc(
  _docId: string,
  _file: File
): Promise<InstitutionalDoc> {
  // V2: Implementar integración con Firebase Storage/Firestore
  throw new Error('replaceDoc no implementado en V1');
}

/**
 * V2 admin action: Eliminar documento
 * @param _docId - ID del documento a eliminar
 * @returns Promise<void>
 * 
 * Implementación prevista:
 * 1. Eliminar archivo de Storage
 * 2. Eliminar registro de Firestore
 */
export async function deleteDoc(_docId: string): Promise<void> {
  // V2: Implementar integración con Firebase Storage/Firestore
  throw new Error('deleteDoc no implementado en V1');
}

/**
 * V2 admin action: Actualizar metadatos del documento
 * @param _docId - ID del documento
 * @param _metadata - Metadatos a actualizar
 * @returns Promise con el documento actualizado
 */
export async function updateMetadata(
  _docId: string,
  _metadata: Partial<{ title: string }>
): Promise<InstitutionalDoc> {
  // V2: Implementar integración con Firestore
  throw new Error('updateMetadata no implementado en V1');
}
