# ODDY Entregas Lite

Sistema de gestión de entregas de última milla para empresas que necesitan cumplir con sus compromisos operativos.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

El servidor de desarrollo estará disponible en `http://localhost:5173/`

## 📱 Vistas del Sistema

### Públicas
- **Landing Page** (`/`) - Página de inicio con información de servicios
- **Login** (`/login`) - Acceso clientes de ODDY

### Dashboard
- **Inicio** (`/dashboard`) - Vista principal del dashboard
- **Entregas** (`/dashboard/entregas`) - Gestión de entregas
- **Entidades** (`/dashboard/base-datos/entidades`) - Gestión de entidades
- **Personas** (`/dashboard/base-datos/personas`) - Gestión de personas

## 🎨 Criterios Visuales

El sistema sigue criterios visuales **canónicos**:

| Elemento | Valor |
|----------|-------|
| Altura de inputs/selects/botones | 35px |
| Radio de esquinas | 8px |
| Color primario (Sidebar/Acciones) | #00A9CE |
| Color secundario (Toolbar) | #FF6B35 |

## 📋 Catálogos V1

### Estados de Entrega
- Borrador
- Confirmado
- En curso
- En destino
- Recibido
- Cancelado

### Tipos de Entidad
- Remitente
- Destinatario
- Operador Logístico
- Proveedor

### Roles de Persona
- Remitente
- Destinatario
- Receptor
- Usuario
- Administrador
- Contacto

## 📚 Documentación

Ver documentación completa en [`docs/ODDY_ENTREGAS_LITE_V1.md`](docs/ODDY_ENTREGAS_LITE_V1.md)

## 🛠️ Stack Tecnológico

- **React** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS** (Estilos)
- **React Router DOM** (Navegación)
- **Lucide React** (Iconos)
- **Radix UI** (Componentes)

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── App.tsx                 # Router principal
│   ├── components/
│   │   ├── Dashboard.tsx       # Layout del dashboard
│   │   ├── auth/               # Componentes de autenticación
│   │   ├── dashboard/          # Vistas del dashboard
│   │   ├── landing/            # Componentes del landing
│   │   └── ui/                 # Componentes UI reutilizables
│   └── data/
│       └── catalogos.ts        # Catálogos canónicos
├── assets/                     # Assets estáticos
└── styles/                     # Estilos globales
```

## 📝 Notas

- El proyecto está diseñado para **validación visual y funcional**
- Los datos son mockeados en memoria
- El diseño sigue fielmente el Figma de referencia

---

*ODDY Entregas Lite V1 - Enero 2026*
