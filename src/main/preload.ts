import { contextBridge } from 'electron';

// Inline seed data for demo
const seedCourses = [
  {
    id: 'cs101',
    title: 'Fundamentos de Programación',
    description: 'Aprende los conceptos básicos de la programación con Python. Este curso cubre variables, estructuras de control, funciones y programación orientada a objetos.',
    instructor: 'Dr. María González',
    thumbnail: '/images/courses/programming.jpg',
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
    duration: 190,
    category: 'Desarrollo Móvil',
    is_enrolled: false,
    is_downloaded: false,
    progress: 0
  }
];


const seedActivities = [
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

const seedNotifications = [
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

// Expose API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth APIs
  login: (email: string, _password: string) => 
    Promise.resolve({ 
      success: true, 
      user: { 
        id: 1,
        name: 'Carlos Martínez Rodríguez', 
        email: email,
        role: 'student' 
      } 
    }),
  logout: () => Promise.resolve(),
  getStoredToken: () => Promise.resolve('demo_token_123'),
  
  // Course APIs
  getCourses: () => Promise.resolve(seedCourses),
  saveCourse: () => Promise.resolve(),
  enrollCourse: (courseId: string) => {
    const course = seedCourses.find(c => c.id === courseId);
    if (course) {
      course.is_enrolled = true;
      course.progress = 0;
      
      // Check if auto-download is enabled (you'd get this from settings store)
      const settings = JSON.parse(localStorage.getItem('aula-virtual-settings-storage') || '{}');
      if (settings.state?.autoDownload) {
        course.is_downloaded = true;
        console.log(`Auto-downloading course: ${course.title}`);
      }
      
      console.log(`Enrolled in course: ${course.title}`);
    }
    return Promise.resolve({ success: true });
  },
  
  // Offline data
  getOfflineData: () => Promise.resolve({
    courses: seedCourses.filter(c => c.is_enrolled),
    activities: seedActivities,
    notifications: seedNotifications.filter(n => !n.read)
  }),
  
  // System APIs
  checkOnlineStatus: () => Promise.resolve(true),
  minimizeWindow: () => console.log('Window minimized'),
  maximizeWindow: () => console.log('Window maximized'),
  closeWindow: () => console.log('Window closed'),
  showNotification: (title: string, body: string) => {
    console.log('Notification:', title, body);
  },
  onOnlineStatusChange: (_callback: (isOnline: boolean) => void) => {
    console.log('Online status listener added');
  },
  
  // Settings APIs
  updateNotificationSettings: (enabled: boolean) => {
    console.log(`Notification settings updated: ${enabled ? 'enabled' : 'disabled'}`);
    // Here you would update system notification permissions
    return Promise.resolve();
  },
  
  updateDownloadSettings: (enabled: boolean) => {
    console.log(`Auto-download settings updated: ${enabled ? 'enabled' : 'disabled'}`);
    // Here you would update download behavior for new courses
    return Promise.resolve();
  },
  
  // Audio API for testing
  playTestSound: () => {
    console.log('Playing test sound...');
    // Here you could play a test notification sound
    return Promise.resolve();
  },
  
  syncData: () => Promise.resolve()
});