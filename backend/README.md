# Aula Virtual 2.0 - Backend API

Backend API para la plataforma educativa Aula Virtual de la Universidad Autónoma de Aguascalientes (UAA).

## 🚀 Características

- **Autenticación JWT** - Sistema de autenticación seguro con tokens JWT
- **Gestión de Cursos** - CRUD completo para cursos, módulos y lecciones
- **Sistema de Quizzes** - Quizzes interactivos con diferentes tipos de preguntas
- **Entrega de Tareas** - Sistema de entrega de tareas con carga de archivos
- **Material de Lectura** - Gestión de contenido de lectura con seguimiento de progreso
- **Seguimiento de Progreso** - Monitoreo completo del progreso del estudiante
- **Carga de Archivos** - Soporte para múltiples tipos de archivo
- **Base de Datos PostgreSQL** - Esquema robusto y escalable

## 📋 Requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita `.env` con tu configuración:
   ```env
   # Base de datos
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=aula_virtual
   DB_USER=postgres
   DB_PASSWORD=tu_password
   
   # JWT
   JWT_SECRET=tu-clave-secreta-super-segura
   
   # Servidor
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

4. **Configurar la base de datos**
   ```bash
   # Crear la base de datos
   createdb aula_virtual
   
   # Ejecutar migraciones
   npm run migrate
   
   # Poblar con datos de prueba
   npm run seed
   ```

5. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## 📖 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil del usuario

### Cursos
- `GET /api/courses` - Listar cursos
- `GET /api/courses/:id` - Obtener curso específico
- `GET /api/courses/:id/modules` - Obtener módulos del curso
- `POST /api/courses/:id/enroll` - Inscribirse en curso
- `GET /api/courses/enrollments/me` - Mis inscripciones

### Progreso de Lecciones
- `GET /api/courses/lessons/:lessonId/progress` - Obtener progreso
- `PUT /api/courses/lessons/:lessonId/progress` - Actualizar progreso

### Quizzes
- `GET /api/quizzes/lessons/:lessonId/quiz` - Obtener quiz de lección
- `POST /api/quizzes/quiz-attempts` - Crear intento de quiz
- `POST /api/quizzes/quiz-attempts/:id/answers` - Enviar respuesta
- `POST /api/quizzes/quiz-attempts/:id/complete` - Completar quiz
- `GET /api/quizzes/:quizId/attempts` - Obtener intentos de quiz

### Tareas
- `GET /api/assignments/lessons/:lessonId/assignment` - Obtener tarea
- `POST /api/assignments/submissions` - Enviar tarea (con archivos)
- `GET /api/assignments/assignments/:id/submission` - Ver mi entrega
- `PUT /api/assignments/submissions/:id/grade` - Calificar (instructores)

### Material de Lectura
- `GET /api/reading/lessons/:lessonId/reading` - Obtener material
- `GET /api/reading/lessons/:lessonId/progress` - Obtener progreso de lectura
- `PUT /api/reading/lessons/:lessonId/progress` - Actualizar progreso
- `GET /api/reading/statistics/me` - Mis estadísticas de lectura

## 🗄️ Estructura de la Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `categories` - Categorías de cursos
- `courses` - Cursos disponibles
- `modules` - Módulos de los cursos
- `lessons` - Lecciones individuales
- `course_enrollments` - Inscripciones de estudiantes
- `lesson_progress` - Progreso en lecciones

### Sistema de Quizzes
- `quizzes` - Quizzes de las lecciones
- `quiz_questions` - Preguntas de los quizzes
- `quiz_attempts` - Intentos de quiz
- `quiz_answers` - Respuestas de los estudiantes

### Sistema de Tareas
- `assignments` - Tareas asignadas
- `assignment_submissions` - Entregas de estudiantes
- `assignment_files` - Archivos adjuntos
- `assignment_resources` - Recursos de la tarea

### Material de Lectura
- `reading_materials` - Contenido de lectura
- `reading_material_resources` - Recursos adicionales
- `reading_progress` - Progreso de lectura

### Actividades
- `user_activities` - Registro de actividades del usuario

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Incluye el token en el header:

```
Authorization: Bearer <tu-jwt-token>
```

## 📁 Carga de Archivos

Los archivos se almacenan en la carpeta `uploads/` y son accesibles vía:
```
GET /uploads/assignments/nombre-archivo.ext
```

### Tipos de archivo permitidos:
- Documentos: `.pdf`, `.doc`, `.docx`, `.txt`
- Imágenes: `.png`, `.jpg`, `.jpeg`, `.gif`
- Comprimidos: `.zip`, `.rar`

### Límites:
- Tamaño máximo por archivo: 10MB
- Máximo 10 archivos por envío

## 🧪 Datos de Prueba

Después de ejecutar `npm run seed`, tendrás acceso a:

### Usuarios de prueba:
- **Admin**: `admin@uaa.mx` / `password123`
- **Instructor**: `instructor@uaa.mx` / `password123`  
- **Estudiante**: `estudiante@uaa.mx` / `password123`

### Contenido de prueba:
- 3 cursos con diferentes niveles
- Módulos y lecciones completas
- Quizzes interactivos
- Tareas para entregar
- Material de lectura

## 🚀 Despliegue

### Variables de entorno de producción:
```env
NODE_ENV=production
JWT_SECRET=clave-super-secreta-de-producción
DATABASE_URL=postgresql://usuario:password@host:5432/db_name
```

### Scripts disponibles:
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar TypeScript
- `npm start` - Servidor de producción
- `npm run migrate` - Ejecutar migraciones
- `npm run seed` - Poblar base de datos
- `npm run lint` - Verificar código

## 🔧 Desarrollo

La aplicación está construida con:
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Multer** - Carga de archivos
- **bcrypt** - Hash de contraseñas

### Estructura del proyecto:
```
backend/
├── src/
│   ├── config/         # Configuración de BD y otros
│   ├── controllers/    # Controladores de rutas
│   ├── middleware/     # Middleware personalizado
│   ├── routes/         # Definición de rutas
│   ├── scripts/        # Scripts de migración y seed
│   └── server.ts       # Punto de entrada
├── uploads/            # Archivos subidos
└── package.json
```

## 🐛 Solución de Problemas

### Error de conexión a BD:
1. Verificar que PostgreSQL esté ejecutándose
2. Validar credenciales en `.env`
3. Asegurarse de que la base de datos existe

### Error de permisos de archivo:
```bash
chmod 755 uploads/
```

### Error de JWT:
Verificar que `JWT_SECRET` esté configurado y sea seguro.

## 📝 Licencia

Este proyecto es parte del sistema Aula Virtual de la Universidad Autónoma de Aguascalientes.