/**
 * SEED SCRIPT - ODDY Entregas Lite V1
 * 
 * Script para poblar Firestore con datos iniciales de desarrollo.
 * EJECUTAR SOLO UNA VEZ para setup inicial.
 * 
 * Uso:
 *   npx ts-node --esm scripts/seedFirestore.ts
 * 
 * O con Firebase Admin SDK service account:
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json npx ts-node --esm scripts/seedFirestore.ts
 * 
 * Variables de entorno requeridas:
 *   - FIREBASE_PROJECT_ID (o usar default oddy-entregas)
 *   - GOOGLE_APPLICATION_CREDENTIALS (opcional, para producción)
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ============================================
// CONFIGURACIÓN
// ============================================

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'charlie-7df41';

// Inicializar Firebase Admin
// Si hay GOOGLE_APPLICATION_CREDENTIALS, usa service account
// Si no, usa application default credentials
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS) as ServiceAccount;
  initializeApp({
    credential: cert(serviceAccount),
    projectId: PROJECT_ID
  });
} else {
  // Para desarrollo local con emuladores o ADC
  initializeApp({
    projectId: PROJECT_ID
  });
}

const db = getFirestore();

// ============================================
// DATOS SEED
// ============================================

const CLIENT_DEMO_ID = 'client_demo';

// Usuarios de prueba (se crearán como referencia, pero los usuarios
// reales se crean al hacer login por primera vez)
const seedUsers = [
  {
    uid: 'admin_001',
    email: 'admin@oddy.com',
    displayName: 'Admin Oddy',
    role: 'admin',
    clientId: null,
    provider: 'password'
  },
  {
    uid: 'client_demo_001',
    email: 'cliente@demo.com',
    displayName: 'Cliente Demo',
    role: 'client',
    clientId: CLIENT_DEMO_ID,
    provider: 'password'
  },
  {
    uid: 'driver_001',
    email: 'chofer@oddy.com',
    displayName: 'Chofer Demo',
    role: 'driver_mock',
    clientId: null,
    provider: 'password'
  }
];

// Entregas de prueba (equivalentes al mock actual)
const seedDeliveries = [
  { 
    clientId: CLIENT_DEMO_ID,
    fecha: '2025-01-10',
    remitente: 'Corporación ABC', 
    destinatario: 'Almacenes del Sur', 
    direccion: 'Av. Brasil 2345, Montevideo',
    estado: 'En curso', 
    conductor: 'Carlos Méndez',
    vehiculo: 'ABC-1234',
    observaciones: 'Entrega urgente - Cliente preferencial',
    receivedAt: null
  },
  { 
    clientId: 'client_002',
    fecha: '2025-01-10',
    remitente: 'Distribuidora Norte', 
    destinatario: 'Comercial Este', 
    direccion: 'Bvar. Artigas 1234, Montevideo',
    estado: 'Confirmado', 
    conductor: 'Ana Silva',
    vehiculo: 'XYZ-5678',
    observaciones: 'Requiere firma del responsable',
    receivedAt: null
  },
  { 
    clientId: CLIENT_DEMO_ID,
    fecha: '2025-01-09',
    remitente: 'Logística Central', 
    destinatario: 'Farmacia Popular', 
    direccion: '18 de Julio 987, Montevideo',
    estado: 'Recibido', 
    conductor: 'Juan Rodríguez',
    vehiculo: 'LMN-9012',
    observaciones: 'Entrega realizada sin novedad',
    receivedAt: new Date('2025-01-09T14:30:00Z')
  },
  { 
    clientId: 'client_003',
    fecha: '2025-01-09',
    remitente: 'Importadora Global', 
    destinatario: 'Tienda Tecnológica', 
    direccion: 'Colonia 456, Montevideo',
    estado: 'Borrador', 
    conductor: '-',
    vehiculo: '-',
    observaciones: 'Esperando confirmación del destinatario',
    receivedAt: null
  },
  { 
    clientId: CLIENT_DEMO_ID,
    fecha: '2025-01-08',
    remitente: 'Comercial Sur', 
    destinatario: 'Supermercado Centro', 
    direccion: 'Mercedes 789, Montevideo',
    estado: 'En destino', 
    conductor: 'María González',
    vehiculo: 'RST-3456',
    observaciones: 'Mercadería refrigerada',
    receivedAt: null
  },
  { 
    clientId: 'client_002',
    fecha: '2025-01-08',
    remitente: 'Distribuidora Este', 
    destinatario: 'Restaurant La Esquina', 
    direccion: 'Yi 234, Montevideo',
    estado: 'Recibido', 
    conductor: 'Pedro Martínez',
    vehiculo: 'UVW-7890',
    observaciones: 'Entrega completada 14:30hs',
    receivedAt: new Date('2025-01-08T14:30:00Z')
  },
  { 
    clientId: CLIENT_DEMO_ID,
    fecha: '2025-01-07',
    remitente: 'Almacén Central', 
    destinatario: 'Ferretería Industrial', 
    direccion: 'Canelones 567, Montevideo',
    estado: 'Cancelado', 
    conductor: '-',
    vehiculo: '-',
    observaciones: 'Cancelado por cliente - Reprogramar',
    receivedAt: null
  }
];

// Eventos iniciales por estado
function getInitialEvents(delivery: typeof seedDeliveries[0], docId: string) {
  const events = [];
  const baseDate = new Date(delivery.fecha);
  
  // Evento de creación siempre
  events.push({
    type: 'CREATED',
    fromStatus: null,
    toStatus: 'Borrador',
    actorUid: 'admin_001',
    actorRole: 'admin',
    timestamp: new Date(baseDate.getTime()),
    note: 'Entrega creada'
  });

  // Agregar eventos según el estado actual
  if (['Confirmado', 'En curso', 'En destino', 'Recibido', 'Cancelado'].includes(delivery.estado)) {
    events.push({
      type: 'STATUS_CHANGED',
      fromStatus: 'Borrador',
      toStatus: 'Confirmado',
      actorUid: 'admin_001',
      actorRole: 'admin',
      timestamp: new Date(baseDate.getTime() + 3600000), // +1h
      note: null
    });
  }

  if (['En curso', 'En destino', 'Recibido'].includes(delivery.estado)) {
    events.push({
      type: 'STATUS_CHANGED',
      fromStatus: 'Confirmado',
      toStatus: 'En curso',
      actorUid: 'admin_001',
      actorRole: 'admin',
      timestamp: new Date(baseDate.getTime() + 7200000), // +2h
      note: null
    });
  }

  if (['En destino', 'Recibido'].includes(delivery.estado)) {
    events.push({
      type: 'STATUS_CHANGED',
      fromStatus: 'En curso',
      toStatus: 'En destino',
      actorUid: 'admin_001',
      actorRole: 'admin',
      timestamp: new Date(baseDate.getTime() + 28800000), // +8h
      note: null
    });
  }

  if (delivery.estado === 'Recibido') {
    events.push({
      type: 'CLIENT_CONFIRMED_RECEIPT',
      fromStatus: 'En destino',
      toStatus: 'Recibido',
      actorUid: 'client_demo_001',
      actorRole: 'client',
      timestamp: delivery.receivedAt || new Date(baseDate.getTime() + 30600000), // +8.5h
      note: 'Cliente confirmó recepción'
    });
  }

  if (delivery.estado === 'Cancelado') {
    events.push({
      type: 'STATUS_CHANGED',
      fromStatus: 'Confirmado',
      toStatus: 'Cancelado',
      actorUid: 'admin_001',
      actorRole: 'admin',
      timestamp: new Date(baseDate.getTime() + 7200000), // +2h
      note: 'Cancelado por cliente'
    });
  }

  return events;
}

// ============================================
// FUNCIONES DE SEED
// ============================================

async function seedUsersCollection() {
  console.log('\n📋 Creando usuarios de referencia...');
  
  for (const user of seedUsers) {
    const userRef = db.collection('users').doc(user.uid);
    await userRef.set({
      ...user,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    console.log(`  ✓ Usuario: ${user.email} (${user.role})`);
  }
}

async function seedDeliveriesCollection() {
  console.log('\n📦 Creando entregas de prueba...');
  
  for (let i = 0; i < seedDeliveries.length; i++) {
    const delivery = seedDeliveries[i];
    const docId = `ETG-${String(i + 1).padStart(3, '0')}`;
    
    // Crear documento de delivery
    const deliveryRef = db.collection('deliveries').doc(docId);
    await deliveryRef.set({
      ...delivery,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Crear eventos iniciales
    const events = getInitialEvents(delivery, docId);
    for (const event of events) {
      await deliveryRef.collection('events').add(event);
    }
    
    console.log(`  ✓ Entrega: ${docId} - ${delivery.estado} (${events.length} eventos)`);
  }
}

async function main() {
  console.log('🚀 ODDY Entregas Lite - Seed Firestore');
  console.log('=====================================');
  console.log(`Proyecto: ${PROJECT_ID}`);
  
  try {
    await seedUsersCollection();
    await seedDeliveriesCollection();
    
    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n📌 Notas importantes:');
    console.log('  - Los usuarios reales se crean al hacer login por primera vez');
    console.log('  - Para tener un usuario admin, actualiza manualmente en Firestore');
    console.log('    el campo role a "admin" después de crear el usuario');
    console.log(`  - El cliente demo tiene clientId: "${CLIENT_DEMO_ID}"`);
    
  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
    process.exit(1);
  }
}

main();
