# 🎓 Aula Virtual 2.0 - Desktop Application

![Status](https://img.shields.io/badge/status-MVP-green) ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue) ![Tech](https://img.shields.io/badge/tech-Electron%20+%20React-orange)

**Universidad Autónoma de Aguascalientes**

Aplicación de escritorio offline-first para gestión educativa que permite a estudiantes y profesores acceder a recursos educativos sin conexión constante a internet.

## ✨ Características

- 🔌 **Modo Offline**: Acceso completo sin conexión a internet
- 🔐 **Autenticación segura** con credenciales institucionales
- 📚 **Catálogo de cursos** interactivo
- 🛒 **Carrito de compras** para inscripción a cursos
- 📊 **Dashboard** con métricas de progreso
- 🔔 **Notificaciones nativas** del sistema
- 🔄 **Sincronización automática** al reconectar
- 💾 **Base de datos local** SQLite
- 🔄 **Auto-actualizaciones** automáticas

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm 9+
- Sistema operativo: Windows 10+, macOS 10.14+, o Linux

### Instalación para Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/uaa/aula-virtual-desktop.git
cd aula-virtual-desktop

# Instalar dependencias
npm install

# 🎮 Demo completo con datos realistas
npm run demo

# O iniciar en modo desarrollo
npm run dev
```

## 🎮 **Demo Interactivo**

La aplicación incluye datos de demostración completos para showcasing:

**Contenido del Demo:**
- 📚 **10 cursos realistas** de la UAA (Programación, IA, Cálculo, etc.)
- 👤 **Usuario demo**: Carlos Martínez (estudiante)
- 📊 **Dashboard con métricas reales**
- 🛒 **Carrito pre-cargado** con 3 cursos
- 📈 **Progreso en cursos** (85% Programación, 65% Cálculo)
- 🔔 **5 notificaciones** realistas
- 📝 **8 actividades recientes**
- 💾 **Modo offline completo**

**Credenciales Demo:**
```
Email: cualquier-email@edu.uaa.mx
Contraseña: cualquier-contraseña
```

**Funcionalidades Demostradas:**
- ✅ Autenticación con persistencia
- ✅ Dashboard interactivo
- ✅ Catálogo con filtros y búsqueda  
- ✅ Carrito funcional con checkout
- ✅ Indicadores online/offline
- ✅ Notificaciones nativas
- ✅ Interfaz responsive

### Scripts Disponibles

```bash
# 🎮 Demo con datos completos
npm run demo            # Inicia demo con 10 cursos, carrito y datos realistas

# Desarrollo
npm run dev              # Inicia la app en modo desarrollo
npm run dev:renderer     # Solo servidor Vite
npm run electron        # Solo Electron

# Build
npm run build           # Construye todo el proyecto
npm run build:main      # Construye proceso principal
npm run build:renderer  # Construye interfaz React

# Distribución
npm run dist           # Crea instalador para la plataforma actual
npm run dist:win       # Crea instalador para Windows
npm run dist:mac       # Crea instalador para macOS
npm run dist:linux     # Crea instalador para Linux

# Calidad de código
npm run lint           # Linter ESLint
npm run typecheck      # Verificación TypeScript
npm test              # Ejecuta tests
```

## 🏗️ Arquitectura

```
src/
├── main/              # Proceso principal Electron
│   ├── index.ts       # Punto de entrada principal
│   ├── preload.ts     # Script de preload
│   ├── database.ts    # Gestión SQLite
│   └── windows/       # Configuración de ventanas
├── renderer/          # Proceso renderizador (React)
│   ├── components/    # Componentes reutilizables
│   ├── pages/        # Páginas principales
│   ├── store/        # Estado global (Zustand)
│   └── styles/       # Estilos CSS Modules
└── shared/           # Código compartido
    ├── constants/    # Constantes globales
    └── types/       # Tipos TypeScript
```

## 📋 Stack Tecnológico

### Frontend
- **Electron 28+** - Framework para apps desktop
- **React 18+** - Librería de UI
- **TypeScript** - Tipado estático
- **Zustand** - Gestión de estado
- **React Router** - Enrutado
- **CSS Modules** - Estilos modulares
- **Lucide React** - Iconos

### Backend
- **Node.js** - Runtime de JavaScript
- **SQLite** - Base de datos local
- **Better SQLite3** - Driver SQLite optimizado
- **JWT** - Autenticación

### Build & Deploy
- **Vite** - Build tool y dev server
- **Electron Builder** - Empaquetado y distribución
- **ESLint** - Linting
- **TypeScript** - Compilación

## 🎨 Diseño UI/UX

### Paleta de Colores UAA
- **Primario**: `#1E3A8A` (Azul UAA)
- **Secundario**: `#60A5FA` (Azul claro)
- **Éxito**: `#10B981` (Verde)
- **Error**: `#EF4444` (Rojo)
- **Advertencia**: `#F59E0B` (Naranja)

### Tipografía
- **Inter** - Font principal (Google Fonts)
- Tamaños: 12px, 14px, 16px, 18px, 20px, 24px, 32px

## 🔧 Configuración

### Variables de Entorno

Crear `.env` basado en `.env.example`:

```bash
NODE_ENV=development
API_URL=https://api.uaa.edu.mx
ELECTRON_DEV_TOOLS=true
```

### Base de Datos

La aplicación usa SQLite para almacenamiento offline:
- **Ubicación**: `~/AppData/Roaming/aula-virtual-desktop/` (Windows)
- **Archivo**: `aula-virtual.db`
- **Migración**: Automática al iniciar

## 📱 Características por Módulo

### 🔐 Autenticación
- Login con credenciales institucionales
- Opción "Recordarme" (30 días)
- Recuperación de contraseña por email
- Almacenamiento seguro de tokens

### 🏠 Dashboard
- Resumen de actividades recientes
- Estadísticas de progreso académico
- Widgets informativos configurables
- Accesos rápidos personalizables

### 📚 Catálogo de Cursos
- Grid de cursos disponibles
- Búsqueda y filtros avanzados
- Vista detallada de cursos
- Sistema de inscripción

### 🛒 Carrito de Compras
- Agregar/eliminar cursos
- Cálculo de totales
- Proceso de checkout
- Historial de compras

## 🔄 Sincronización Offline

### Estrategia
1. **Descarga inicial** de datos esenciales
2. **Cola de sincronización** para operaciones offline
3. **Resolución de conflictos** automática
4. **Indicadores visuales** de estado

### Datos Sincronizados
- Cursos inscritos y materiales
- Progreso académico
- Notificaciones
- Configuración de usuario

## 🚀 Distribución

### Requisitos del Sistema

| Componente | Mínimo | Recomendado |
|------------|---------|-------------|
| **SO** | Windows 10, macOS 10.14, Ubuntu 18.04 | Última versión |
| **RAM** | 4GB | 8GB+ |
| **Almacenamiento** | 500MB | 1GB+ |
| **Resolución** | 1024x768 | 1920x1080+ |

### Instaladores

```bash
# Crear instaladores para todas las plataformas
npm run dist

# Archivos generados en /release/
├── aula-virtual-desktop-1.0.0.exe     # Windows
├── aula-virtual-desktop-1.0.0.dmg     # macOS  
└── aula-virtual-desktop-1.0.0.AppImage # Linux
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📊 Métricas de Calidad

### Objetivos
- ✅ Tiempo de inicio: < 3 segundos
- ✅ Tiempo de respuesta: < 500ms
- ✅ Uso de memoria: < 512MB
- ✅ Tamaño instalador: < 100MB
- ✅ Disponibilidad offline: 100%

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Convenciones de Código
- **ESLint** + **Prettier** para formateo
- **Conventional Commits** para mensajes
- **TypeScript strict mode** activado
- Tests requeridos para nuevas funcionalidades

## 📄 Licencia

Propietario © 2025 Universidad Autónoma de Aguascalientes

---

## 📞 Soporte

- **Email**: soporte.tecnico@uaa.mx
- **Teléfono**: +52 (449) 910-8400
- **Issues**: [GitHub Issues](https://github.com/uaa/aula-virtual-desktop/issues)

---

*Desarrollado con ❤️ por el equipo de Sistemas UAA*# JulioEPA
