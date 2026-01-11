# ODDY Entregas Lite V1 - Documentación

## Índice

1. [Descripción General](#descripción-general)
2. [Roles del Sistema V1](#roles-del-sistema-v1)
3. [Estados de Entrega V1](#estados-de-entrega-v1)
4. [Catálogos](#catálogos)
5. [Estructura del Dashboard](#estructura-del-dashboard)
6. [Criterios Visuales](#criterios-visuales)
7. [Funcionalidades por Rol](#funcionalidades-por-rol)
8. [Elementos Futuros (No implementados)](#elementos-futuros-no-implementados)

---

## Descripción General

**ODDY Entregas Lite** es un sistema de gestión de entregas de última milla diseñado para empresas que necesitan cumplir con sus compromisos operativos.

### Alcance V1

- El **cliente NO gestiona pedidos**
- El cliente SOLO puede:
  - Observar entregas
  - Seguir estados
  - Consultar datos y observaciones
  - Validar recepción ("Acuse de recibo")
  - Ver historial

---

## Roles del Sistema V1

### Roles Internos (Oddy)

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Administrador** | Control total del sistema | CRUD completo, configuración, usuarios, entidades |
| **Chofer** | Transporta envíos | Vista operativa básica, actualización de estados |

### Roles Externos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Cliente** | Usuario externo | Solo lectura + validación (acuse de recibo) |

---

## Estados de Entrega V1

Los estados canónicos de pedido/entrega son **EXACTAMENTE** estos (no agregar adicionales):

| Estado | Descripción | Color |
|--------|-------------|-------|
| **Borrador** | Entrega creada, pendiente de confirmación | Gris |
| **Confirmado** | Entrega confirmada, lista para asignación | Naranja |
| **En curso** | Entrega en proceso de transporte | Azul |
| **En destino** | Entrega llegó al punto de destino | Púrpura |
| **Recibido** | Entrega completada y confirmada | Verde |
| **Cancelado** | Entrega cancelada | Rojo |

---

## Catálogos

### Tipos de Entidad V1

| Tipo | Descripción |
|------|-------------|
| **Remitente** | Entidad que origina un envío (depósitos, empresas, sucursales) |
| **Destinatario** | Entidad que recibe envíos (comercios, empresas, instituciones) |
| **Operador Logístico** | Entidad que gestiona el servicio de entrega (Oddy) |
| **Proveedor** | Entidad que presta servicios o suministros |

### Roles de Persona V1

| Rol | Descripción |
|-----|-------------|
| **Remitente** | Persona que entrega u origina el envío |
| **Destinatario** | Persona que recibe el envío (puede confirmar recepción) |
| **Receptor** | Persona que recibe (no necesariamente el destinatario nominal) |
| **Usuario** | Persona que opera el sistema (crea pedidos, consulta estados) |
| **Administrador** | Persona con control total del sistema |
| **Contacto** | Persona de referencia dentro de una entidad |

### Estados de Registro

| Estado | Descripción |
|--------|-------------|
| **Activo** | Registro habilitado en el sistema |
| **Inactivo** | Registro deshabilitado |

---

## Estructura del Dashboard

### Patrón Canónico de Vistas

TODAS las vistas siguen **EXACTAMENTE** este patrón:

1. **Título de la vista** (izquierda)
2. **Tarjetas KPI contextuales** (derecha del título)
3. **Barra de acciones** (naranja):
   - Buscador
   - Nuevo / Nueva
   - Editar
   - Filtros (según contexto)
   - Vista (columnas)
   - Exportar
4. **Tabla principal**:
   - Últimos 7 registros
   - Primera fila seleccionada por defecto
   - Encabezado cyan (#00A9CE)

### Estados de la Vista

| Estado | Contenido Inferior |
|--------|-------------------|
| **NORMAL** | DOS tarjetas de detalle |
| **NUEVO** | Formulario (reemplaza tarjetas) |
| **EDITAR** | Formulario con datos (reemplaza tarjetas) |

> **REGLA**: Los estados son MUTUAMENTE EXCLUYENTES. El formulario REEMPLAZA las tarjetas de detalle, no se superpone.

---

## Criterios Visuales

### Dimensiones Obligatorias

| Elemento | Valor |
|----------|-------|
| **Altura de campos/inputs/selects/botones** | 35px EXACTOS |
| **Radio de esquinas** | 8px EXACTOS |

### Colores Principales

| Elemento | Color |
|----------|-------|
| **Sidebar / Acciones primarias** | #00A9CE (Cyan) |
| **Barra de herramientas** | #FF6B35 (Naranja) |
| **Encabezados de tabla** | #00A9CE (Cyan) |

### Reglas de Consistencia

- NO permitir variaciones de altura similares
- NO permitir variaciones de radio
- UN SOLO criterio visual para TODO el sistema

---

## Funcionalidades por Rol

### Cliente

- ✅ Ver pedidos
- ✅ Ver estados
- ✅ Ver observaciones
- ✅ Ver historial
- ✅ Marcar "Recibido / Acuse de recibo"
- ❌ NO crear pedidos
- ❌ NO editar pedidos

### Administrador

- ✅ CRUD completo (mock)
- ✅ Ver todas las vistas
- ✅ Gestionar entidades y personas
- ✅ Configuración del sistema

### Chofer

- ✅ Vista operativa básica (mock)
- ✅ Actualización de estados
- ❌ Sin lógica avanzada en V1

---

## Elementos Futuros (No implementados)

### Tipos de Entidad (FUTURO)

| Tipo | Descripción |
|------|-------------|
| Punto Operativo | Ubicación física relevante (depósitos, hubs, sucursales, lockers) |
| Entidad Interna | Entidad usada para organización interna |

### Roles de Persona (FUTURO - sin lógica avanzada)

| Rol | Descripción |
|-----|-------------|
| Chofer | Persona que transporta el envío (asociada a vehículo y ruta) |
| Operador | Persona con funciones operativas ampliadas |

### Estados Detallados para Choferes

Estados más granulares para el tracking de choferes - **NO implementar en V1**.

---

## Regla Maestra de Comportamiento

> **FUNCIONES IGUALES EN VISTAS DISTINTAS DEBEN HACER EXACTAMENTE LO MISMO.**

La única diferencia entre vistas es el **CONTEXTO**:
- Pedidos
- Entregas
- Entidades
- Personas

NO existen variantes de comportamiento por vista.

---

## Stack Tecnológico

- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Routing**: React Router DOM
- **Iconos**: Lucide React
- **UI Components**: Radix UI

---

## Instrucciones de Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

---

## Estructura de Archivos Clave

```
src/
├── app/
│   ├── App.tsx                 # Router principal
│   ├── components/
│   │   ├── Dashboard.tsx       # Layout del dashboard
│   │   ├── auth/
│   │   │   └── Login.tsx       # Página de login
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx     # Navegación lateral
│   │   │   ├── Topbar.tsx      # Barra superior
│   │   │   ├── EntregasPage.tsx
│   │   │   ├── EntitiesPage.tsx
│   │   │   ├── PeoplePage.tsx
│   │   │   └── *KPICards.tsx   # Tarjetas KPI por vista
│   │   └── landing/
│   │       └── *.tsx           # Componentes landing page
│   └── data/
│       └── catalogos.ts        # Catálogos canónicos
├── styles/
│   └── *.css                   # Estilos globales
└── main.tsx                    # Entry point
```

---

*Documento generado para ODDY Entregas Lite V1*
*Última actualización: Enero 2026*

