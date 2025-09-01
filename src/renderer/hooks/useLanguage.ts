import { useSettingsStore } from '../store/settingsStore';

// Translation keys and their values
export const translations = {
  es: {
    // Navigation
    dashboard: 'Dashboard',
    courses: 'Cursos',
    profile: 'Perfil',
    settings: 'Configuración',
    logout: 'Salir',
    
    // Dashboard
    welcome: 'Bienvenido de vuelta',
    lastSync: 'Última sincronización hace 5 minutos',
    syncNow: 'Sincronizar ahora',
    totalCourses: 'Total de Cursos',
    completedCourses: 'Cursos Completados',
    inProgress: 'En Progreso',
    totalHours: 'Horas Totales',
    recentActivity: 'Actividad Reciente',
    upcomingTasks: 'Tareas Próximas',
    quickActions: 'Acciones Rápidas',
    viewAll: 'Ver todo',
    noActivities: 'No hay actividades recientes',
    noTasks: 'No hay tareas próximas',
    
    // Settings
    settingsTitle: 'Configuración',
    settingsSubtitle: 'Personaliza tu experiencia en Aula Virtual',
    notifications: 'Notificaciones',
    notificationsDesc: 'Activar o desactivar todas las notificaciones',
    appearance: 'Apariencia',
    theme: 'Tema',
    themeDesc: 'Elige el tema de la aplicación',
    light: 'Claro',
    dark: 'Oscuro',
    automatic: 'Automático',
    language: 'Idioma',
    languageDesc: 'Idioma de la interfaz',
    downloads: 'Descargas',
    autoDownload: 'Descarga automática',
    autoDownloadDesc: 'Descargar cursos automáticamente al inscribirse',
    audio: 'Audio',
    soundsEnabled: 'Sonidos activados',
    soundsEnabledDesc: 'Activar o desactivar todos los sonidos',
    volume: 'Volumen',
    volumeDesc: 'Controla el volumen general',
    testSound: 'Probar sonido',
    testSoundDesc: 'Reproduce un sonido de prueba',
    testSoundBtn: '🔊 Probar',
    saveChanges: 'Guardar Cambios',
    saving: 'Guardando...',
    saved: 'Guardado',
    error: 'Error',
    reset: 'Restablecer',
    resetConfirm: '¿Estás seguro de que quieres restablecer todas las configuraciones?',
    
    // Courses
    courseCatalog: 'Catálogo de Cursos',
    courseCatalogDesc: 'Descubre y aprende con los mejores cursos de la UAA',
    searchPlaceholder: 'Buscar cursos, instructores, categorías...',
    resultsFor: 'Resultados para',
    free: 'Gratis',
    enroll: 'Inscribirse',
    continue: 'Continuar',
    progress: 'Progreso',
    
    // Profile
    profileTitle: 'Mi Perfil',
    personalInfo: 'Información Personal',
    academicProgress: 'Progreso Académico',
    editProfile: 'Editar Perfil',
    saveProfile: 'Guardar Perfil',
    
    // Course View
    backToCourses: 'Volver a Cursos',
    courseProgress: 'Progreso del Curso',
    courseContent: 'Contenido del Curso',
    markAsComplete: 'Marcar como Completado',
    completed: 'Completado',
    downloadMaterials: 'Descargar Materiales',
    startQuiz: 'Iniciar Quiz',
    viewAssignment: 'Ver Tarea',
    
    // Common
    loading: 'Cargando...',
    online: 'En línea',
    offline: 'Sin conexión',
    offlineMode: 'Modo sin conexión - Los cambios se sincronizarán cuando vuelva la conexión'
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    courses: 'Courses',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    
    // Dashboard
    welcome: 'Welcome back',
    lastSync: 'Last sync 5 minutes ago',
    syncNow: 'Sync now',
    totalCourses: 'Total Courses',
    completedCourses: 'Completed Courses',
    inProgress: 'In Progress',
    totalHours: 'Total Hours',
    recentActivity: 'Recent Activity',
    upcomingTasks: 'Upcoming Tasks',
    quickActions: 'Quick Actions',
    viewAll: 'View all',
    noActivities: 'No recent activities',
    noTasks: 'No upcoming tasks',
    
    // Settings
    settingsTitle: 'Settings',
    settingsSubtitle: 'Customize your Virtual Classroom experience',
    notifications: 'Notifications',
    notificationsDesc: 'Enable or disable all notifications',
    appearance: 'Appearance',
    theme: 'Theme',
    themeDesc: 'Choose the application theme',
    light: 'Light',
    dark: 'Dark',
    automatic: 'Automatic',
    language: 'Language',
    languageDesc: 'Interface language',
    downloads: 'Downloads',
    autoDownload: 'Auto-download',
    autoDownloadDesc: 'Automatically download courses when enrolling',
    audio: 'Audio',
    soundsEnabled: 'Sounds enabled',
    soundsEnabledDesc: 'Enable or disable all sounds',
    volume: 'Volume',
    volumeDesc: 'Control the general volume',
    testSound: 'Test sound',
    testSoundDesc: 'Play a test sound',
    testSoundBtn: '🔊 Test',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Error',
    reset: 'Reset',
    resetConfirm: 'Are you sure you want to reset all settings?',
    
    // Courses
    courseCatalog: 'Course Catalog',
    courseCatalogDesc: 'Discover and learn with the best UAA courses',
    searchPlaceholder: 'Search courses, instructors, categories...',
    resultsFor: 'Results for',
    free: 'Free',
    enroll: 'Enroll',
    continue: 'Continue',
    progress: 'Progress',
    
    // Profile
    profileTitle: 'My Profile',
    personalInfo: 'Personal Information',
    academicProgress: 'Academic Progress',
    editProfile: 'Edit Profile',
    saveProfile: 'Save Profile',
    
    // Course View
    backToCourses: 'Back to Courses',
    courseProgress: 'Course Progress',
    courseContent: 'Course Content',
    markAsComplete: 'Mark as Complete',
    completed: 'Completed',
    downloadMaterials: 'Download Materials',
    startQuiz: 'Start Quiz',
    viewAssignment: 'View Assignment',
    
    // Common
    loading: 'Loading...',
    online: 'Online',
    offline: 'Offline',
    offlineMode: 'Offline mode - Changes will sync when connection returns'
  }
};

export type TranslationKey = keyof typeof translations.es;
export type Language = keyof typeof translations;

export function useLanguage() {
  const { language } = useSettingsStore();
  
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.es[key] || key;
  };
  
  return { t, language };
}

export function useTranslation() {
  return useLanguage();
}