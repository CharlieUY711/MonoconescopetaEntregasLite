/**
 * DATOS MOCK DE ENTREGAS - ODDY Entregas Lite V1
 * 
 * Incluye:
 * - ownerId: Para filtrar entregas por cliente
 * - history: Array de eventos del registro
 * - acuseTimestamp: Timestamp ISO cuando el cliente confirma recepción
 */

import { MOCK_CLIENT_ID } from '../state/role';

// ============================================
// TIPOS
// ============================================

export interface HistoryEvent {
  type: string;
  timestamp: string; // ISO string
  description?: string;
}

export interface Entrega {
  id: string;
  fecha: string;
  remitente: string;
  destinatario: string;
  direccion: string;
  estado: string;
  conductor: string;
  vehiculo: string;
  observaciones: string;
  ownerId: string; // ID del cliente dueño
  history: HistoryEvent[];
  acuseTimestamp?: string; // ISO string cuando se confirma recepción
}

// ============================================
// DATOS MOCK
// ============================================

export const mockEntregasData: Entrega[] = [
  { 
    id: 'ETG-001', 
    fecha: '2025-01-10',
    remitente: 'Corporación ABC', 
    destinatario: 'Almacenes del Sur', 
    direccion: 'Av. Brasil 2345, Montevideo',
    estado: 'En curso', 
    conductor: 'Carlos Méndez',
    vehiculo: 'ABC-1234',
    observaciones: 'Entrega urgente - Cliente preferencial',
    ownerId: MOCK_CLIENT_ID, // Pertenece al cliente mock
    history: [
      { type: 'CREATED', timestamp: '2025-01-10T08:00:00Z', description: 'Entrega creada' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-10T09:00:00Z', description: 'Estado: Borrador → Confirmado' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-10T10:30:00Z', description: 'Estado: Confirmado → En curso' }
    ]
  },
  { 
    id: 'ETG-002', 
    fecha: '2025-01-10',
    remitente: 'Distribuidora Norte', 
    destinatario: 'Comercial Este', 
    direccion: 'Bvar. Artigas 1234, Montevideo',
    estado: 'Confirmado', 
    conductor: 'Ana Silva',
    vehiculo: 'XYZ-5678',
    observaciones: 'Requiere firma del responsable',
    ownerId: 'client_002', // Otro cliente
    history: [
      { type: 'CREATED', timestamp: '2025-01-10T07:30:00Z', description: 'Entrega creada' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-10T08:15:00Z', description: 'Estado: Borrador → Confirmado' }
    ]
  },
  { 
    id: 'ETG-003', 
    fecha: '2025-01-09',
    remitente: 'Logística Central', 
    destinatario: 'Farmacia Popular', 
    direccion: '18 de Julio 987, Montevideo',
    estado: 'Recibido', 
    conductor: 'Juan Rodríguez',
    vehiculo: 'LMN-9012',
    observaciones: 'Entrega realizada sin novedad',
    ownerId: MOCK_CLIENT_ID,
    history: [
      { type: 'CREATED', timestamp: '2025-01-09T06:00:00Z', description: 'Entrega creada' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-09T07:00:00Z', description: 'Estado: Borrador → Confirmado' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-09T09:00:00Z', description: 'Estado: Confirmado → En curso' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-09T14:00:00Z', description: 'Estado: En curso → En destino' },
      { type: 'CLIENT_CONFIRMED_RECEIPT', timestamp: '2025-01-09T14:30:00Z', description: 'Cliente confirmó recepción' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-09T14:30:00Z', description: 'Estado: En destino → Recibido' }
    ],
    acuseTimestamp: '2025-01-09T14:30:00Z'
  },
  { 
    id: 'ETG-004', 
    fecha: '2025-01-09',
    remitente: 'Importadora Global', 
    destinatario: 'Tienda Tecnológica', 
    direccion: 'Colonia 456, Montevideo',
    estado: 'Borrador', 
    conductor: '-',
    vehiculo: '-',
    observaciones: 'Esperando confirmación del destinatario',
    ownerId: 'client_003',
    history: [
      { type: 'CREATED', timestamp: '2025-01-09T15:00:00Z', description: 'Entrega creada' }
    ]
  },
  { 
    id: 'ETG-005', 
    fecha: '2025-01-08',
    remitente: 'Comercial Sur', 
    destinatario: 'Supermercado Centro', 
    direccion: 'Mercedes 789, Montevideo',
    estado: 'En destino', 
    conductor: 'María González',
    vehiculo: 'RST-3456',
    observaciones: 'Mercadería refrigerada',
    ownerId: MOCK_CLIENT_ID, // Pertenece al cliente mock - EN DESTINO para probar acuse
    history: [
      { type: 'CREATED', timestamp: '2025-01-08T06:00:00Z', description: 'Entrega creada' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-08T07:00:00Z', description: 'Estado: Borrador → Confirmado' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-08T09:00:00Z', description: 'Estado: Confirmado → En curso' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-08T14:00:00Z', description: 'Estado: En curso → En destino' }
    ]
  },
  { 
    id: 'ETG-006', 
    fecha: '2025-01-08',
    remitente: 'Distribuidora Este', 
    destinatario: 'Restaurant La Esquina', 
    direccion: 'Yi 234, Montevideo',
    estado: 'Recibido', 
    conductor: 'Pedro Martínez',
    vehiculo: 'UVW-7890',
    observaciones: 'Entrega completada 14:30hs',
    ownerId: 'client_002',
    history: [
      { type: 'CREATED', timestamp: '2025-01-08T05:00:00Z', description: 'Entrega creada' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-08T06:00:00Z', description: 'Estado: Borrador → Confirmado' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-08T08:00:00Z', description: 'Estado: Confirmado → En curso' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-08T13:00:00Z', description: 'Estado: En curso → En destino' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-08T14:30:00Z', description: 'Estado: En destino → Recibido' }
    ],
    acuseTimestamp: '2025-01-08T14:30:00Z'
  },
  { 
    id: 'ETG-007', 
    fecha: '2025-01-07',
    remitente: 'Almacén Central', 
    destinatario: 'Ferretería Industrial', 
    direccion: 'Canelones 567, Montevideo',
    estado: 'Cancelado', 
    conductor: '-',
    vehiculo: '-',
    observaciones: 'Cancelado por cliente - Reprogramar',
    ownerId: MOCK_CLIENT_ID,
    history: [
      { type: 'CREATED', timestamp: '2025-01-07T08:00:00Z', description: 'Entrega creada' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-07T09:00:00Z', description: 'Estado: Borrador → Confirmado' },
      { type: 'STATUS_CHANGE', timestamp: '2025-01-07T10:00:00Z', description: 'Estado: Confirmado → Cancelado' }
    ]
  }
];

// ============================================
// HELPERS
// ============================================

/**
 * Agrega un evento al historial de una entrega
 */
export function addHistoryEvent(
  entrega: Entrega, 
  type: string, 
  description?: string
): Entrega {
  const newEvent: HistoryEvent = {
    type,
    timestamp: new Date().toISOString(),
    description
  };
  
  return {
    ...entrega,
    history: [...entrega.history, newEvent]
  };
}

/**
 * Formatea un timestamp ISO a fecha/hora legible
 */
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtiene la descripción legible de un tipo de evento
 */
export function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'CREATED': 'Creación',
    'STATUS_CHANGE': 'Cambio de estado',
    'CLIENT_CONFIRMED_RECEIPT': 'Acuse de recibo',
    'UPDATED': 'Actualización',
    'ASSIGNED': 'Asignación'
  };
  return labels[type] || type;
}
