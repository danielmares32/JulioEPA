import { getDatabase } from './database';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  price: number;
  duration: number;
  category: string;
  is_enrolled: boolean;
  is_downloaded: boolean;
  progress: number;
  last_accessed?: string;
}

export interface User {
  email: string;
  name: string;
  role: string;
  token?: string;
}

export interface Activity {
  type: string;
  description: string;
  course_id?: string;
  created_at: string;
}

export interface Notification {
  title: string;
  body: string;
  type: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

export const seedCourses: Course[] = [
  {
    id: 'cs101',
    title: 'Fundamentos de Programación',
    description: 'Aprende los conceptos básicos de la programación con Python. Este curso cubre variables, estructuras de control, funciones y programación orientada a objetos.',
    instructor: 'Dr. María González',
    thumbnail: '/images/courses/programming.jpg',
    price: 1200,
    duration: 120,
    category: 'Ciencias de la Computación',
    is_enrolled: true,
    is_downloaded: true,
    progress: 85,
    last_accessed: '2025-01-23T10:30:00Z'
  },
  {
    id: 'math201',
    title: 'Cálculo Diferencial e Integral',
    description: 'Curso completo de cálculo que abarca límites, derivadas, integrales y sus aplicaciones en ingeniería y ciencias.',
    instructor: 'Dr. Roberto Martínez',
    thumbnail: '/images/courses/calculus.jpg',
    price: 1500,
    duration: 180,
    category: 'Matemáticas',
    is_enrolled: true,
    is_downloaded: true,
    progress: 65,
    last_accessed: '2025-01-22T14:15:00Z'
  },
  {
    id: 'eng301',
    title: 'Inglés Técnico para Ingenieros',
    description: 'Desarrolla tus habilidades de comunicación técnica en inglés. Incluye terminología especializada y redacción de documentos técnicos.',
    instructor: 'Prof. Sarah Johnson',
    thumbnail: '/images/courses/english.jpg',
    price: 900,
    duration: 90,
    category: 'Idiomas',
    is_enrolled: true,
    is_downloaded: false,
    progress: 30,
    last_accessed: '2025-01-21T16:45:00Z'
  },
  {
    id: 'ai401',
    title: 'Introducción a la Inteligencia Artificial',
    description: 'Explora los fundamentos de la IA, incluyendo machine learning, redes neuronales y aplicaciones prácticas en la industria.',
    instructor: 'Dr. Ana López',
    thumbnail: '/images/courses/ai.jpg',
    price: 2000,
    duration: 150,
    category: 'Ciencias de la Computación',
    is_enrolled: false,
    is_downloaded: false,
    progress: 0
  },
  {
    id: 'db501',
    title: 'Bases de Datos Avanzadas',
    description: 'Diseño y administración de bases de datos relacionales y NoSQL. Incluye optimización de consultas y arquitecturas distribuidas.',
    instructor: 'Ing. Carlos Ruiz',
    thumbnail: '/images/courses/database.jpg',
    price: 1800,
    duration: 160,
    category: 'Ciencias de la Computación',
    is_enrolled: false,
    is_downloaded: false,
    progress: 0
  },
  {
    id: 'web601',
    title: 'Desarrollo Web Full Stack',
    description: 'Aprende a desarrollar aplicaciones web completas usando React, Node.js, Express y MongoDB. Proyecto final incluido.',
    instructor: 'Ing. Laura Herrera',
    thumbnail: '/images/courses/webdev.jpg',
    price: 2200,
    duration: 200,
    category: 'Desarrollo Web',
    is_enrolled: false,
    is_downloaded: false,
    progress: 0
  },
  {
    id: 'cyber701',
    title: 'Ciberseguridad Fundamentos',
    description: 'Protege sistemas y redes contra amenazas digitales. Aprende sobre criptografía, firewalls y mejores prácticas de seguridad.',
    instructor: 'Dr. Miguel Torres',
    thumbnail: '/images/courses/cybersecurity.jpg',
    price: 1600,
    duration: 140,
    category: 'Seguridad',
    is_enrolled: false,
    is_downloaded: false,
    progress: 0
  },
  {
    id: 'iot801',
    title: 'Internet de las Cosas (IoT)',
    description: 'Desarrolla proyectos IoT usando Arduino, Raspberry Pi y sensores. Conecta dispositivos a la nube y crea aplicaciones inteligentes.',
    instructor: 'Ing. Patricia Vargas',
    thumbnail: '/images/courses/iot.jpg',
    price: 1400,
    duration: 130,
    category: 'Electrónica',
    is_enrolled: true,
    is_downloaded: false,
    progress: 15,
    last_accessed: '2025-01-20T09:20:00Z'
  },
  {
    id: 'data901',
    title: 'Ciencia de Datos con Python',
    description: 'Analiza grandes volúmenes de datos usando pandas, NumPy y scikit-learn. Incluye visualización con matplotlib y seaborn.',
    instructor: 'Dr. Fernando Castro',
    thumbnail: '/images/courses/datascience.jpg',
    price: 1900,
    duration: 170,
    category: 'Ciencia de Datos',
    is_enrolled: false,
    is_downloaded: false,
    progress: 0
  },
  {
    id: 'mobile101',
    title: 'Desarrollo de Apps Móviles',
    description: 'Crea aplicaciones móviles nativas para iOS y Android usando React Native. Desde la interfaz hasta la publicación en stores.',
    instructor: 'Ing. Alejandra Morales',
    thumbnail: '/images/courses/mobile.jpg',
    price: 2100,
    duration: 190,
    category: 'Desarrollo Móvil',
    is_enrolled: false,
    is_downloaded: false,
    progress: 0
  }
];

export const seedUsers: User[] = [
  {
    email: 'carlos.martinez@edu.uaa.mx',
    name: 'Carlos Martínez Rodríguez',
    role: 'student'
  },
  {
    email: 'ana.garcia@edu.uaa.mx',
    name: 'Ana García López',
    role: 'student'
  },
  {
    email: 'dr.gonzalez@uaa.mx',
    name: 'Dr. María González',
    role: 'teacher'
  }
];

export const seedActivities: Activity[] = [
  {
    type: 'course_progress',
    description: 'Completaste el módulo "Variables y Tipos de Datos" en Fundamentos de Programación',
    course_id: 'cs101',
    created_at: '2025-01-23T10:30:00Z'
  },
  {
    type: 'assignment_submitted',
    description: 'Entregaste la tarea "Derivadas Parciales" en Cálculo Diferencial e Integral',
    course_id: 'math201',
    created_at: '2025-01-22T16:45:00Z'
  },
  {
    type: 'quiz_completed',
    description: 'Completaste el quiz "Grammar Review" en Inglés Técnico para Ingenieros',
    course_id: 'eng301',
    created_at: '2025-01-22T14:20:00Z'
  },
  {
    type: 'course_enrolled',
    description: 'Te inscribiste al curso "Internet de las Cosas (IoT)"',
    course_id: 'iot801',
    created_at: '2025-01-20T09:15:00Z'
  },
  {
    type: 'certificate_earned',
    description: 'Obtuviste el certificado del módulo "Python Básico"',
    course_id: 'cs101',
    created_at: '2025-01-19T11:30:00Z'
  },
  {
    type: 'discussion_post',
    description: 'Participaste en el foro "Aplicaciones del Cálculo en Ingeniería"',
    course_id: 'math201',
    created_at: '2025-01-18T15:45:00Z'
  },
  {
    type: 'course_download',
    description: 'Descargaste los materiales del curso "Fundamentos de Programación"',
    course_id: 'cs101',
    created_at: '2025-01-17T08:20:00Z'
  },
  {
    type: 'study_session',
    description: 'Completaste una sesión de estudio de 2 horas en Cálculo',
    course_id: 'math201',
    created_at: '2025-01-16T20:30:00Z'
  }
];

export const seedNotifications: Notification[] = [
  {
    title: 'Nueva tarea disponible',
    body: 'La tarea "Proyecto Final de Programación" ya está disponible en Fundamentos de Programación',
    type: 'assignment',
    read: false,
    action_url: '/courses/cs101/assignments',
    created_at: '2025-01-23T08:00:00Z'
  },
  {
    title: 'Recordatorio de entrega',
    body: 'La tarea "Derivadas Parciales" vence en 2 días',
    type: 'reminder',
    read: false,
    action_url: '/courses/math201/assignments',
    created_at: '2025-01-22T18:00:00Z'
  },
  {
    title: 'Nuevo material disponible',
    body: 'Se agregó un nuevo video sobre "Sensores IoT" en Internet de las Cosas',
    type: 'content',
    read: true,
    action_url: '/courses/iot801/content',
    created_at: '2025-01-21T10:30:00Z'
  },
  {
    title: 'Foro de discusión',
    body: 'Hay nuevas respuestas en el foro "Aplicaciones del Cálculo"',
    type: 'forum',
    read: true,
    action_url: '/courses/math201/forum',
    created_at: '2025-01-20T14:15:00Z'
  },
  {
    title: '¡Felicidades!',
    body: 'Completaste el 85% del curso Fundamentos de Programación',
    type: 'achievement',
    read: false,
    action_url: '/courses/cs101',
    created_at: '2025-01-19T16:45:00Z'
  }
];

export const seedCartItems = [
  { course_id: 'ai401' },
  { course_id: 'web601' },
  { course_id: 'data901' }
];

export async function initializeSeedData() {
  const db = getDatabase();
  
  try {
    console.log('🌱 Inicializando datos de demostración...');
    
    // Clear existing data
    db.exec('DELETE FROM activities');
    db.exec('DELETE FROM notifications'); 
    db.exec('DELETE FROM cart');
    db.exec('DELETE FROM course_content');
    db.exec('DELETE FROM courses');
    db.exec('DELETE FROM users');
    
    // Insert demo users
    const userStmt = db.prepare(`
      INSERT INTO users (email, name, role, token, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    seedUsers.forEach(user => {
      userStmt.run(user.email, user.name, user.role, 'demo_token_' + Math.random().toString(36).substr(2, 9));
    });
    
    // Insert demo courses
    const courseStmt = db.prepare(`
      INSERT INTO courses (
        id, title, description, instructor, thumbnail, price, duration, category,
        is_enrolled, is_downloaded, progress, last_accessed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    seedCourses.forEach(course => {
      courseStmt.run(
        course.id,
        course.title,
        course.description,
        course.instructor,
        course.thumbnail,
        course.price,
        course.duration,
        course.category,
        course.is_enrolled ? 1 : 0,
        course.is_downloaded ? 1 : 0,
        course.progress,
        course.last_accessed
      );
    });
    
    // Insert course content for enrolled courses
    const contentStmt = db.prepare(`
      INSERT INTO course_content (course_id, title, type, content, order_index, completed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    
    // Content for Programming course
    const programmingContent = [
      { title: 'Introducción a Python', type: 'video', content: 'Conceptos básicos del lenguaje Python', completed: 1 },
      { title: 'Variables y Tipos de Datos', type: 'lesson', content: 'Aprende sobre números, strings y listas', completed: 1 },
      { title: 'Estructuras de Control', type: 'lesson', content: 'If, for, while y sus aplicaciones', completed: 1 },
      { title: 'Funciones', type: 'video', content: 'Cómo crear y usar funciones', completed: 1 },
      { title: 'Programación Orientada a Objetos', type: 'lesson', content: 'Clases, objetos y herencia', completed: 0 },
      { title: 'Proyecto Final', type: 'assignment', content: 'Desarrolla una aplicación completa', completed: 0 }
    ];
    
    programmingContent.forEach((content, index) => {
      contentStmt.run('cs101', content.title, content.type, content.content, index + 1, content.completed);
    });
    
    // Content for Calculus course
    const calculusContent = [
      { title: 'Límites y Continuidad', type: 'lesson', content: 'Conceptos fundamentales de límites', completed: 1 },
      { title: 'Derivadas', type: 'video', content: 'Cálculo de derivadas y reglas', completed: 1 },
      { title: 'Aplicaciones de Derivadas', type: 'lesson', content: 'Optimización y análisis de funciones', completed: 1 },
      { title: 'Integrales Indefinidas', type: 'lesson', content: 'Antiderivadas y técnicas de integración', completed: 0 },
      { title: 'Integrales Definidas', type: 'video', content: 'Cálculo de áreas y volúmenes', completed: 0 }
    ];
    
    calculusContent.forEach((content, index) => {
      contentStmt.run('math201', content.title, content.type, content.content, index + 1, content.completed);
    });
    
    // Insert demo activities
    const activityStmt = db.prepare(`
      INSERT INTO activities (user_id, type, description, course_id, created_at)
      VALUES (1, ?, ?, ?, ?)
    `);
    
    seedActivities.forEach(activity => {
      activityStmt.run(activity.type, activity.description, activity.course_id, activity.created_at);
    });
    
    // Insert demo notifications
    const notificationStmt = db.prepare(`
      INSERT INTO notifications (title, body, type, read, action_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    seedNotifications.forEach(notification => {
      notificationStmt.run(
        notification.title,
        notification.body,
        notification.type,
        notification.read ? 1 : 0,
        notification.action_url,
        notification.created_at
      );
    });
    
    // Insert demo cart items
    const cartStmt = db.prepare(`
      INSERT INTO cart (course_id, quantity, added_at)
      VALUES (?, 1, datetime('now'))
    `);
    
    seedCartItems.forEach(item => {
      cartStmt.run(item.course_id);
    });
    
    // Insert settings
    const settingsStmt = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
    `);
    
    settingsStmt.run('app_version', '1.0.0');
    settingsStmt.run('last_sync', new Date().toISOString());
    settingsStmt.run('user_preferences', JSON.stringify({
      theme: 'light',
      notifications: true,
      auto_download: false,
      language: 'es'
    }));
    
    console.log('✅ Datos de demostración inicializados correctamente');
    console.log(`📚 ${seedCourses.length} cursos agregados`);
    console.log(`👥 ${seedUsers.length} usuarios creados`);
    console.log(`📝 ${seedActivities.length} actividades registradas`);
    console.log(`🔔 ${seedNotifications.length} notificaciones creadas`);
    console.log(`🛒 ${seedCartItems.length} elementos en carrito`);
    
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar datos de demostración:', error);
    return false;
  }
}