/**
 * CATÁLOGOS CANÓNICOS - ODDY Entregas Lite V1
 * 
 * Este archivo contiene TODOS los catálogos y enums utilizados en el sistema.
 * Es la única fuente de verdad para tipos, estados y roles.
 */

// ============================================
// TIPOS DE ENTIDAD
// ============================================

/**
 * Tipos de Entidad V1
 * - Remitente: Entidad que origina un envío (depósitos, empresas, sucursales)
 * - Destinatario: Entidad que recibe envíos (comercios, empresas, instituciones)
 * - Operador Logístico: Entidad que gestiona el servicio de entrega (Oddy)
 * - Proveedor: Entidad que presta servicios o suministros
 */
export const TIPOS_ENTIDAD = [
  'Remitente',
  'Destinatario',
  'Operador Logístico',
  'Proveedor'
] as const;

export type TipoEntidad = typeof TIPOS_ENTIDAD[number];

/**
 * FUTURO (NO implementar en V1):
 * - Punto Operativo: Ubicación física relevante (depósitos, hubs, sucursales, lockers)
 * - Entidad Interna: Entidad usada para organización interna
 */
export const TIPOS_ENTIDAD_FUTURO = [
  'Punto Operativo',
  'Entidad Interna'
] as const;

// ============================================
// ROLES DE PERSONA
// ============================================

/**
 * Roles de Persona V1
 * IMPORTANTE: Jamás usar "Cliente" como rol de persona.
 * 
 * - Remitente: Persona que entrega u origina el envío. Punto de contacto en el retiro
 * - Destinatario: Persona que recibe el envío. Puede confirmar recepción
 * - Receptor: Persona que recibe. No necesariamente el destinatario nominal
 * - Chofer: Persona que transporta el envío. Futuro: Asociada a vehículo y ruta
 * - Usuario: Persona que opera el sistema. Crea pedidos, consulta estados
 * - Operador: Persona con funciones operativas ampliadas. Coordina entregas, asigna choferes
 * - Administrador: Persona con control total del sistema. Configuración, usuarios, entidades
 * - Contacto: Persona de referencia dentro de una entidad. No interactúa directamente con el sistema
 */
export const ROLES_PERSONA = [
  'Remitente',
  'Destinatario',
  'Receptor',
  'Chofer',
  'Usuario',
  'Operador',
  'Administrador',
  'Contacto'
] as const;

export type RolPersona = typeof ROLES_PERSONA[number];

// ============================================
// ESTADOS DE PEDIDO/ENTREGA
// ============================================

/**
 * Estados Canónicos de Pedido/Entrega V1
 * Usar EXACTAMENTE estos estados, NO agregar adicionales.
 */
export const ESTADOS_ENTREGA = [
  'Borrador',
  'Confirmado',
  'En curso',
  'En destino',
  'Recibido',
  'Cancelado'
] as const;

export type EstadoEntrega = typeof ESTADOS_ENTREGA[number];

// ============================================
// ESTADOS DE ENTIDAD/PERSONA
// ============================================

export const ESTADOS_REGISTRO = [
  'Activo',
  'Inactivo'
] as const;

export type EstadoRegistro = typeof ESTADOS_REGISTRO[number];

// ============================================
// ROLES DEL SISTEMA (AUTENTICACIÓN)
// ============================================

/**
 * Roles del sistema V1 para permisos:
 * - Administrador: CRUD completo, todas las vistas
 * - Chofer: Vista operativa básica (mock)
 * - Cliente: Solo lectura + validación (acuse de recibo)
 */
/**
 * Roles de acceso al sistema (para el switcher de desarrollo)
 * IMPORTANTE: "Cliente" NO es un rol válido - usar "Usuario" en su lugar
 */
export const ROLES_SISTEMA = [
  'Administrador',
  'Operador',
  'Usuario'
] as const;

export type RolSistema = typeof ROLES_SISTEMA[number];

// ============================================
// COLORES PARA ESTADOS
// ============================================

export const COLORES_ESTADO_ENTREGA: Record<EstadoEntrega, { text: string; bg: string }> = {
  'Borrador': { text: 'text-gray-600', bg: 'bg-gray-50' },
  'Confirmado': { text: 'text-orange-600', bg: 'bg-orange-50' },
  'En curso': { text: 'text-blue-600', bg: 'bg-blue-50' },
  'En destino': { text: 'text-purple-600', bg: 'bg-purple-50' },
  'Recibido': { text: 'text-green-600', bg: 'bg-green-50' },
  'Cancelado': { text: 'text-red-600', bg: 'bg-red-50' }
};

export const COLORES_ESTADO_REGISTRO: Record<EstadoRegistro, string> = {
  'Activo': 'text-green-600',
  'Inactivo': 'text-gray-500'
};

export const COLORES_TIPO_ENTIDAD: Record<TipoEntidad, string> = {
  'Remitente': 'text-blue-600',
  'Destinatario': 'text-purple-600',
  'Operador Logístico': 'text-teal-600',
  'Proveedor': 'text-green-600'
};

export const COLORES_ROL_PERSONA: Record<RolPersona, string> = {
  'Remitente': 'text-blue-600',
  'Destinatario': 'text-purple-600',
  'Receptor': 'text-indigo-600',
  'Chofer': 'text-amber-600',
  'Usuario': 'text-teal-600',
  'Operador': 'text-cyan-600',
  'Administrador': 'text-orange-600',
  'Contacto': 'text-green-600'
};

// ============================================
// HELPERS
// ============================================

export function getColorEstadoEntrega(estado: string): { text: string; bg: string } {
  return COLORES_ESTADO_ENTREGA[estado as EstadoEntrega] || { text: 'text-gray-600', bg: 'bg-gray-50' };
}

export function getColorEstadoRegistro(estado: string): string {
  return COLORES_ESTADO_REGISTRO[estado as EstadoRegistro] || 'text-gray-600';
}

export function getColorTipoEntidad(tipo: string): string {
  return COLORES_TIPO_ENTIDAD[tipo as TipoEntidad] || 'text-gray-600';
}

export function getColorRolPersona(rol: string): string {
  return COLORES_ROL_PERSONA[rol as RolPersona] || 'text-gray-600';
}

