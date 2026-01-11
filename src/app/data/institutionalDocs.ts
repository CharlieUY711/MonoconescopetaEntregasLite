/**
 * DATOS MOCK DE DOCUMENTOS INSTITUCIONALES - ODDY Entregas Lite V1
 * 
 * Biblioteca de documentos institucionales (politicas).
 * V1: Datos mock locales, solo lectura.
 * V2: Integracion con Firestore/Storage para administracion.
 */

// ============================================
// TIPOS
// ============================================

export interface InstitutionalDoc {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  fileName: string;
  lastUpdated: string;
  content: string;
}

// ============================================
// DATOS - 5 DOCUMENTOS (PDFs en /docs)
// ============================================

export const institutionalDocs: InstitutionalDoc[] = [
  {
    id: 'DOC-001',
    title: 'Politica de Privacidad',
    description: 'Como protegemos tus datos personales',
    downloadUrl: '/docs/Pol%C3%ADtica%20de%20Privacidad%20(DOC-001).pdf',
    fileName: 'Politica de Privacidad (DOC-001).pdf',
    lastUpdated: '15 de enero de 2026',
    content: `
      <h2>1. Introduccion</h2>
      <p>En ODDY Entregas, nos comprometemos a proteger la privacidad de nuestros usuarios y clientes. Esta politica describe como recopilamos, usamos y protegemos su informacion personal.</p>
      
      <h2>2. Informacion que Recopilamos</h2>
      <p>Recopilamos informacion que usted nos proporciona directamente, incluyendo:</p>
      <ul>
        <li>Nombre y datos de contacto</li>
        <li>Direcciones de entrega y facturacion</li>
        <li>Informacion de pago</li>
        <li>Historial de entregas y preferencias</li>
      </ul>
      
      <h2>3. Uso de la Informacion</h2>
      <p>Utilizamos su informacion para:</p>
      <ul>
        <li>Procesar y gestionar sus entregas</li>
        <li>Comunicarnos con usted sobre el estado de sus envios</li>
        <li>Mejorar nuestros servicios</li>
        <li>Cumplir con obligaciones legales</li>
      </ul>
      
      <h2>4. Proteccion de Datos</h2>
      <p>Implementamos medidas de seguridad tecnicas y organizativas para proteger su informacion personal contra acceso no autorizado, perdida o alteracion.</p>
      
      <h2>5. Sus Derechos</h2>
      <p>Usted tiene derecho a acceder, rectificar, eliminar o portar sus datos personales. Para ejercer estos derechos, contactenos a traves de nuestros canales oficiales.</p>
      
      <h2>6. Contacto</h2>
      <p>Para consultas sobre privacidad, escriba a: <strong>privacidad@oddy.com.uy</strong></p>
    `
  },
  {
    id: 'DOC-002',
    title: 'Terminos y Condiciones',
    description: 'Condiciones de uso de nuestros servicios',
    downloadUrl: '/docs/T%C3%A9rminos%20y%20Condiciones%20(DOC-002).pdf',
    fileName: 'Terminos y Condiciones (DOC-002).pdf',
    lastUpdated: '10 de enero de 2026',
    content: `
      <h2>1. Aceptacion de los Terminos</h2>
      <p>Al utilizar los servicios de ODDY Entregas, usted acepta estos terminos y condiciones en su totalidad. Si no esta de acuerdo, le pedimos que no utilice nuestros servicios.</p>
      
      <h2>2. Descripcion del Servicio</h2>
      <p>ODDY Entregas proporciona servicios de logistica y entrega de paquetes en todo el territorio nacional, incluyendo:</p>
      <ul>
        <li>Recoleccion en origen</li>
        <li>Transporte seguro</li>
        <li>Entrega en destino</li>
        <li>Seguimiento en tiempo real</li>
      </ul>
      
      <h2>3. Obligaciones del Cliente</h2>
      <p>El cliente se compromete a:</p>
      <ul>
        <li>Proporcionar informacion precisa y completa</li>
        <li>Asegurar que los envios cumplan con las regulaciones vigentes</li>
        <li>No enviar articulos prohibidos o peligrosos</li>
        <li>Realizar los pagos en tiempo y forma</li>
      </ul>
      
      <h2>4. Responsabilidad</h2>
      <p>ODDY Entregas se responsabiliza por los envios desde la recoleccion hasta la entrega, sujeto a las limitaciones establecidas en este documento.</p>
      
      <h2>5. Tarifas y Pagos</h2>
      <p>Las tarifas se calculan segun peso, dimensiones y distancia. Los pagos deben realizarse segun los plazos acordados en cada contrato de servicio.</p>
      
      <h2>6. Modificaciones</h2>
      <p>Nos reservamos el derecho de modificar estos terminos. Los cambios seran notificados con 30 dias de anticipacion.</p>
    `
  },
  {
    id: 'DOC-003',
    title: 'Politica de Seguridad',
    description: 'Protocolos de seguridad y proteccion',
    downloadUrl: '/docs/Pol%C3%ADtica%20de%20Seguridad%20(DOC-003).pdf',
    fileName: 'Politica de Seguridad (DOC-003).pdf',
    lastUpdated: '5 de enero de 2026',
    content: `
      <h2>1. Compromiso con la Seguridad</h2>
      <p>En ODDY Entregas, la seguridad es nuestra prioridad. Implementamos protocolos rigurosos para proteger tanto a nuestro personal como a los envios de nuestros clientes.</p>
      
      <h2>2. Seguridad en el Transporte</h2>
      <p>Nuestros protocolos de transporte incluyen:</p>
      <ul>
        <li>Vehiculos equipados con GPS y sistemas de rastreo</li>
        <li>Camaras de seguridad en unidades</li>
        <li>Sellos de seguridad en cada envio</li>
        <li>Rutas optimizadas y monitoreadas</li>
      </ul>
      
      <h2>3. Seguridad del Personal</h2>
      <p>Todo nuestro personal:</p>
      <ul>
        <li>Pasa por verificacion de antecedentes</li>
        <li>Recibe capacitacion continua en seguridad</li>
        <li>Cuenta con identificacion oficial de la empresa</li>
        <li>Sigue protocolos estrictos de entrega</li>
      </ul>
      
      <h2>4. Seguridad de la Informacion</h2>
      <p>Protegemos la informacion digital mediante:</p>
      <ul>
        <li>Encriptacion de datos en transito y reposo</li>
        <li>Acceso restringido basado en roles</li>
        <li>Auditorias de seguridad periodicas</li>
        <li>Respaldos automaticos</li>
      </ul>
      
      <h2>5. Reportar Incidentes</h2>
      <p>Para reportar cualquier incidente de seguridad: <strong>seguridad@oddy.com.uy</strong></p>
    `
  },
  {
    id: 'DOC-004',
    title: 'Politica de Entregas',
    description: 'Compromisos y estandares de servicio',
    downloadUrl: '/docs/Pol%C3%ADtica%20de%20Entregas%20(DOC-004).pdf',
    fileName: 'Politica de Entregas (DOC-004).pdf',
    lastUpdated: '8 de enero de 2026',
    content: `
      <h2>1. Tiempos de Entrega</h2>
      <p>Nos comprometemos a cumplir con los siguientes tiempos de entrega:</p>
      <ul>
        <li><strong>Montevideo:</strong> 24-48 horas habiles</li>
        <li><strong>Interior:</strong> 48-72 horas habiles</li>
        <li><strong>Express:</strong> Mismo dia (sujeto a disponibilidad)</li>
      </ul>
      
      <h2>2. Proceso de Entrega</h2>
      <p>Nuestro proceso estandar incluye:</p>
      <ul>
        <li>Notificacion previa al destinatario</li>
        <li>Intentos de entrega (maximo 3)</li>
        <li>Confirmacion de recepcion digital</li>
        <li>Acuse de recibo con firma</li>
      </ul>
      
      <h2>3. Entregas Fallidas</h2>
      <p>En caso de no poder completar la entrega:</p>
      <ul>
        <li>Se notifica al remitente y destinatario</li>
        <li>Se coordina nuevo intento de entrega</li>
        <li>Opcion de retiro en sucursal</li>
      </ul>
      
      <h2>4. Restricciones</h2>
      <p>No realizamos entregas de:</p>
      <ul>
        <li>Materiales peligrosos o inflamables</li>
        <li>Articulos ilegales o prohibidos</li>
        <li>Animales vivos</li>
        <li>Dinero en efectivo o valores</li>
      </ul>
      
      <h2>5. Reclamos</h2>
      <p>Los reclamos deben realizarse dentro de las 48 horas posteriores a la entrega a traves de nuestros canales oficiales.</p>
    `
  },
  {
    id: 'DOC-005',
    title: 'Codigo de Conducta',
    description: 'Valores y principios de ODDY',
    downloadUrl: '/docs/C%C3%B3digo%20de%20Conducta%20(DOC-005).pdf',
    fileName: 'Codigo de Conducta (DOC-005).pdf',
    lastUpdated: '1 de enero de 2026',
    content: `
      <h2>1. Nuestros Valores</h2>
      <p>En ODDY Entregas nos guiamos por valores fundamentales que definen nuestra cultura:</p>
      <ul>
        <li><strong>Integridad:</strong> Actuamos con honestidad y transparencia</li>
        <li><strong>Compromiso:</strong> Cumplimos lo que prometemos</li>
        <li><strong>Respeto:</strong> Valoramos a cada persona</li>
        <li><strong>Excelencia:</strong> Buscamos la mejora continua</li>
      </ul>
      
      <h2>2. Conducta Profesional</h2>
      <p>Esperamos que todos los colaboradores:</p>
      <ul>
        <li>Traten a clientes y colegas con respeto</li>
        <li>Mantengan la confidencialidad de la informacion</li>
        <li>Cumplan con las politicas y procedimientos</li>
        <li>Representen dignamente a la empresa</li>
      </ul>
      
      <h2>3. Relacion con Clientes</h2>
      <p>Nos comprometemos a:</p>
      <ul>
        <li>Brindar un servicio de calidad</li>
        <li>Comunicar de forma clara y oportuna</li>
        <li>Resolver problemas de manera eficiente</li>
        <li>Proteger la informacion del cliente</li>
      </ul>
      
      <h2>4. Responsabilidad Social</h2>
      <p>ODDY Entregas se compromete con:</p>
      <ul>
        <li>Practicas ambientalmente responsables</li>
        <li>Apoyo a la comunidad local</li>
        <li>Condiciones laborales justas</li>
        <li>Diversidad e inclusion</li>
      </ul>
      
      <h2>5. Reporte de Inquietudes</h2>
      <p>Para reportar violaciones a este codigo: <strong>etica@oddy.com.uy</strong></p>
    `
  }
];
