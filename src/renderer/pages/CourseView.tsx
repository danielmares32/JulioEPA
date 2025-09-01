import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  Download,
  Star,
  Users,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { useTranslation } from '../hooks/useLanguage';
import { QuizView } from '../components/QuizView';
import { AssignmentView } from '../components/AssignmentView';
import { ReadingView } from '../components/ReadingView';
import styles from './CourseView.module.css';

interface Lesson {
  id: string;
  title: string;
  duration: number; // in seconds
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  completed: boolean;
  locked: boolean;
  videoUrl?: string;
  description?: string;
  quizData?: any;
  assignmentData?: any;
  readingData?: any;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  completed: boolean;
  progress: number; // 0-100
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  duration: number;
  category: string;
  is_enrolled: boolean;
  progress: number;
  rating: number;
  students: number;
  level: string;
  modules: Module[];
}

export function CourseViewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
    }
  }, [courseId]);

  const loadCourse = async (id: string) => {
    try {
      setLoading(true);
      
      // Mock course data - in real app, this would come from API
      const mockCourse: Course = {
        id: id,
        title: 'Fundamentos de Programación',
        description: 'Aprende los conceptos básicos de la programación con Python. Este curso cubre variables, estructuras de control, funciones y programación orientada a objetos.',
        instructor: 'Dr. María González',
        thumbnail: '/images/courses/programming.jpg',
        duration: 7200, // 2 hours in seconds
        category: 'Ciencias de la Computación',
        is_enrolled: true,
        progress: 35,
        rating: 4.8,
        students: 1250,
        level: 'Básico',
        modules: [
          {
            id: 'mod1',
            title: 'Introducción a la Programación',
            completed: true,
            progress: 100,
            lessons: [
              {
                id: 'les1',
                title: '¿Qué es la programación?',
                duration: 480,
                type: 'video',
                completed: true,
                locked: false,
                videoUrl: '/videos/lesson1.mp4',
                description: 'Introducción básica a los conceptos de programación'
              },
              {
                id: 'les2',
                title: 'Historia de los lenguajes de programación',
                duration: 600,
                type: 'video',
                completed: true,
                locked: false,
                videoUrl: '/videos/lesson2.mp4'
              },
              {
                id: 'les3',
                title: 'Quiz: Conceptos básicos',
                duration: 300,
                type: 'quiz',
                completed: true,
                locked: false,
                quizData: {
                  id: 'quiz1',
                  title: 'Quiz: Conceptos básicos de Programación',
                  description: 'Evalúa tus conocimientos sobre los conceptos fundamentales de programación',
                  timeLimit: 10,
                  attempts: 3,
                  passingScore: 70,
                  questions: [
                    {
                      id: 'q1',
                      type: 'multiple-choice',
                      question: '¿Qué es la programación?',
                      options: [
                        'El proceso de crear software usando lenguajes de programación',
                        'Solo escribir código en cualquier idioma',
                        'Usar únicamente Python',
                        'Configurar computadoras'
                      ],
                      correctAnswer: 0,
                      explanation: 'La programación es el proceso de crear software mediante el uso de lenguajes de programación específicos.',
                      points: 10
                    },
                    {
                      id: 'q2',
                      type: 'true-false',
                      question: 'Python es un lenguaje de programación interpretado.',
                      correctAnswer: true,
                      explanation: 'Correcto. Python es un lenguaje interpretado, lo que significa que el código se ejecuta línea por línea.',
                      points: 10
                    },
                    {
                      id: 'q3',
                      type: 'short-answer',
                      question: '¿Cuál es la principal ventaja de los lenguajes de alto nivel?',
                      correctAnswer: 'facilidad',
                      explanation: 'Los lenguajes de alto nivel son más fáciles de leer y escribir, más cercanos al lenguaje humano.',
                      points: 15
                    }
                  ]
                }
              }
            ]
          },
          {
            id: 'mod2',
            title: 'Variables y Tipos de Datos',
            completed: false,
            progress: 60,
            lessons: [
              {
                id: 'les4',
                title: 'Variables en Python',
                duration: 720,
                type: 'video',
                completed: true,
                locked: false,
                videoUrl: '/videos/lesson4.mp4'
              },
              {
                id: 'les5',
                title: 'Tipos de datos primitivos',
                duration: 540,
                type: 'video',
                completed: false,
                locked: false,
                videoUrl: '/videos/lesson5.mp4'
              },
              {
                id: 'les6',
                title: 'Ejercicios prácticos',
                duration: 900,
                type: 'assignment',
                completed: false,
                locked: false,
                assignmentData: {
                  id: 'assignment1',
                  title: 'Ejercicios de Variables y Tipos de Datos',
                  description: 'Completa los siguientes ejercicios para practicar el uso de variables y tipos de datos en Python.',
                  instructions: [
                    'Crea un programa que solicite al usuario su nombre y edad',
                    'Declara variables de diferentes tipos: entero, flotante, cadena y booleano',
                    'Realiza operaciones matemáticas básicas con las variables numéricas',
                    'Imprime los resultados de manera formateada',
                    'Comenta tu código explicando cada sección'
                  ],
                  dueDate: '2024-12-31T23:59:59',
                  maxScore: 100,
                  allowedFileTypes: ['.py', '.txt', '.pdf'],
                  maxFileSize: 5,
                  maxFiles: 3,
                  submissionStatus: 'not-submitted',
                  resources: [
                    {
                      id: 'res1',
                      name: 'Plantilla de ejercicios.py',
                      size: 1024,
                      type: 'python',
                      url: '/resources/template.py'
                    },
                    {
                      id: 'res2', 
                      name: 'Guía de referencia Python.pdf',
                      size: 2048000,
                      type: 'pdf',
                      url: '/resources/python_guide.pdf'
                    }
                  ]
                }
              }
            ]
          },
          {
            id: 'mod3',
            title: 'Estructuras de Control',
            completed: false,
            progress: 0,
            lessons: [
              {
                id: 'les7',
                title: 'Condicionales (if, elif, else)',
                duration: 600,
                type: 'video',
                completed: false,
                locked: false,
                videoUrl: '/videos/lesson7.mp4'
              },
              {
                id: 'les8',
                title: 'Bucles (for y while)',
                duration: 780,
                type: 'video',
                completed: false,
                locked: true
              },
              {
                id: 'les9',
                title: 'Documentación: Estructuras de Control en Python',
                duration: 900,
                type: 'reading',
                completed: false,
                locked: true,
                readingData: {
                  id: 'reading1',
                  title: 'Estructuras de Control en Python',
                  author: 'Dr. María González',
                  content: `# Estructuras de Control en Python\n\nLas estructuras de control son fundamentales en la programación, ya que nos permiten dirigir el flujo de ejecución de nuestros programas.\n\n## Condicionales\n\nLas estructuras condicionales nos permiten ejecutar diferentes bloques de código según se cumplan o no ciertas condiciones.\n\n### Estructura if\n\nLa estructura más básica es el **if**, que ejecuta un bloque de código solo si la condición es verdadera.\n\n### Estructura if-else\n\nCuando necesitamos ejecutar un bloque de código alternativo si la condición es falsa, utilizamos **if-else**.\n\n### Estructura if-elif-else\n\nPara múltiples condiciones, Python nos ofrece **elif** (else if), que nos permite evaluar varias condiciones en secuencia.\n\n## Bucles\n\nLos bucles nos permiten repetir bloques de código múltiples veces.\n\n### Bucle for\n\nEl bucle **for** se utiliza para iterar sobre secuencias (listas, tuplas, cadenas, etc.).\n\n### Bucle while\n\nEl bucle **while** ejecuta un bloque de código mientras una condición sea verdadera.\n\n## Control de Flujo\n\nPython proporciona declaraciones para controlar el flujo dentro de los bucles:\n\n- **break**: Termina el bucle completamente\n- **continue**: Salta a la siguiente iteración\n- **pass**: No hace nada, utilizada como placeholder\n\n## Mejores Prácticas\n\n1. Mantén las condiciones simples y legibles\n2. Evita bucles infinitos\n3. Usa nombres descriptivos para las variables\n4. Indenta correctamente tu código\n5. Considera usar list comprehensions cuando sea apropiado\n\n## Ejercicios Prácticos\n\nPara dominar estos conceptos, es importante practicar con ejemplos reales y casos de uso diversos.`,
                  estimatedReadTime: 15,
                  wordCount: 285,
                  lastModified: '2024-08-20T10:30:00'
                }
              }
            ]
          }
        ]
      };

      setCourse(mockCourse);
      
      // Set first incomplete lesson as current
      const firstIncompleteLesson = findFirstIncompleteLesson(mockCourse.modules);
      if (firstIncompleteLesson) {
        setCurrentLesson(firstIncompleteLesson);
      } else {
        // If all complete, set first lesson
        setCurrentLesson(mockCourse.modules[0]?.lessons[0] || null);
      }
      
      // Expand modules with current lesson
      const moduleWithCurrentLesson = mockCourse.modules.find(mod => 
        mod.lessons.some(lesson => lesson.id === firstIncompleteLesson?.id)
      );
      if (moduleWithCurrentLesson) {
        setExpandedModules([moduleWithCurrentLesson.id]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      setLoading(false);
    }
  };

  const findFirstIncompleteLesson = (modules: Module[]): Lesson | null => {
    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (!lesson.completed && !lesson.locked) {
          return lesson;
        }
      }
    }
    return null;
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectLesson = (lesson: Lesson) => {
    if (lesson.locked) return;
    setCurrentLesson(lesson);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!course) return;
    
    const updatedCourse = { ...course };
    for (const module of updatedCourse.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        lesson.completed = true;
        
        // Update module progress
        const completedLessons = module.lessons.filter(l => l.completed).length;
        module.progress = (completedLessons / module.lessons.length) * 100;
        module.completed = module.progress === 100;
        
        // Unlock next lesson
        const currentIndex = module.lessons.findIndex(l => l.id === lessonId);
        if (currentIndex < module.lessons.length - 1) {
          module.lessons[currentIndex + 1].locked = false;
        } else {
          // Unlock first lesson of next module
          const moduleIndex = updatedCourse.modules.findIndex(m => m.id === module.id);
          if (moduleIndex < updatedCourse.modules.length - 1) {
            const nextModule = updatedCourse.modules[moduleIndex + 1];
            if (nextModule.lessons.length > 0) {
              nextModule.lessons[0].locked = false;
            }
          }
        }
        
        break;
      }
    }
    
    // Update overall course progress
    const totalLessons = updatedCourse.modules.reduce((total, mod) => total + mod.lessons.length, 0);
    const completedLessons = updatedCourse.modules.reduce((total, mod) => 
      total + mod.lessons.filter(l => l.completed).length, 0
    );
    updatedCourse.progress = Math.round((completedLessons / totalLessons) * 100);
    
    setCourse(updatedCourse);
    
    console.log(`Lesson ${lessonId} marked as complete`);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getLessonIcon = (lesson: Lesson) => {
    switch (lesson.type) {
      case 'video':
        return <Play size={16} />;
      case 'reading':
        return <FileText size={16} />;
      case 'quiz':
        return <CheckCircle size={16} />;
      case 'assignment':
        return <BookOpen size={16} />;
      default:
        return <BookOpen size={16} />;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <BookOpen size={48} className={styles.spinningIcon} />
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.errorContainer}>
        <p>Course not found</p>
        <button onClick={() => navigate('/courses')} className={styles.backButton}>
          <ArrowLeft size={16} />
          {t('backToCourses')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.courseView}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate('/courses')} className={styles.backButton}>
          <ArrowLeft size={16} />
          {t('backToCourses')}
        </button>
        <div className={styles.courseInfo}>
          <h1 className={styles.courseTitle}>{course.title}</h1>
          <div className={styles.courseMetadata}>
            <span className={styles.instructor}>{course.instructor}</span>
            <span className={styles.separator}>•</span>
            <div className={styles.rating}>
              <Star size={16} fill="currentColor" />
              {course.rating}
            </div>
            <span className={styles.separator}>•</span>
            <div className={styles.students}>
              <Users size={16} />
              {course.students.toLocaleString()}
            </div>
            <span className={styles.separator}>•</span>
            <span className={styles.level}>{course.level}</span>
          </div>
          <div className={styles.progressContainer}>
            <span className={styles.progressLabel}>{t('courseProgress')}: {course.progress}%</span>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Video/Content Area */}
        <div className={styles.contentArea}>
          {currentLesson && (
            <>
              <div className={styles.videoContainer}>
                {currentLesson.type === 'video' ? (
                  <div className={styles.videoPlayer}>
                    <div className={styles.videoPlaceholder}>
                      <div className={styles.playButton} onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause size={48} /> : <Play size={48} />}
                      </div>
                      <div className={styles.videoOverlay}>
                        <h3>{currentLesson.title}</h3>
                        <p>Duration: {formatTime(currentLesson.duration)}</p>
                      </div>
                    </div>
                    
                    {/* Video Controls */}
                    <div className={styles.videoControls}>
                      <button onClick={() => setIsPlaying(!isPlaying)} className={styles.controlButton}>
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </button>
                      
                      <div className={styles.timeControls}>
                        <span className={styles.timeDisplay}>
                          {formatTime(currentTime)} / {formatTime(currentLesson.duration)}
                        </span>
                        <div className={styles.progressSlider}>
                          <input
                            type="range"
                            min="0"
                            max={currentLesson.duration}
                            value={currentTime}
                            onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                            className={styles.slider}
                          />
                        </div>
                      </div>
                      
                      <div className={styles.volumeControls}>
                        <Volume2 size={20} />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(parseInt(e.target.value))}
                          className={styles.volumeSlider}
                        />
                      </div>
                      
                      <button className={styles.controlButton}>
                        <Maximize size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.nonVideoContent}>
                    {currentLesson.type === 'quiz' && currentLesson.quizData ? (
                      <QuizView 
                        quiz={currentLesson.quizData}
                        onComplete={() => markLessonComplete(currentLesson.id)}
                        onExit={() => console.log('Exit quiz')}
                      />
                    ) : currentLesson.type === 'assignment' && currentLesson.assignmentData ? (
                      <AssignmentView 
                        assignment={currentLesson.assignmentData}
                        onSubmit={(files, text) => {
                          console.log('Assignment submitted:', { files, text });
                          markLessonComplete(currentLesson.id);
                        }}
                        onExit={() => console.log('Exit assignment')}
                      />
                    ) : currentLesson.type === 'reading' && currentLesson.readingData ? (
                      <ReadingView 
                        reading={currentLesson.readingData}
                        onComplete={() => markLessonComplete(currentLesson.id)}
                        onExit={() => console.log('Exit reading')}
                      />
                    ) : (
                      <div className={styles.contentPlaceholder}>
                        <div className={styles.contentType}>
                          {getLessonIcon(currentLesson)}
                          <h2>{currentLesson.title}</h2>
                        </div>
                        <div className={styles.contentDescription}>
                          {currentLesson.description || `This is a ${currentLesson.type} lesson.`}
                        </div>
                        <p>Content not available yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Lesson Actions */}
              <div className={styles.lessonActions}>
                {!currentLesson.completed && (
                  <button 
                    onClick={() => markLessonComplete(currentLesson.id)}
                    className={styles.completeButton}
                  >
                    <CheckCircle size={16} />
                    {t('markAsComplete')}
                  </button>
                )}
                {currentLesson.completed && (
                  <div className={styles.completedIndicator}>
                    <CheckCircle size={16} />
                    {t('completed')}
                  </div>
                )}
                <button className={styles.downloadButton}>
                  <Download size={16} />
                  {t('downloadMaterials')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar - Course Content */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>{t('courseContent')}</h3>
          </div>
          
          <div className={styles.modulesList}>
            {course.modules.map((module) => (
              <div key={module.id} className={styles.module}>
                <div 
                  className={styles.moduleHeader}
                  onClick={() => toggleModule(module.id)}
                >
                  <div className={styles.moduleTitle}>
                    {expandedModules.includes(module.id) ? 
                      <ChevronDown size={16} /> : 
                      <ChevronRight size={16} />
                    }
                    <span>{module.title}</span>
                    {module.completed && <CheckCircle size={16} className={styles.moduleCompleted} />}
                  </div>
                  <div className={styles.moduleProgress}>
                    <span>{Math.round(module.progress)}%</span>
                  </div>
                </div>
                
                {expandedModules.includes(module.id) && (
                  <div className={styles.lessonsList}>
                    {module.lessons.map((lesson) => (
                      <div 
                        key={lesson.id}
                        className={`${styles.lessonItem} ${
                          currentLesson?.id === lesson.id ? styles.active : ''
                        } ${lesson.locked ? styles.locked : ''}`}
                        onClick={() => selectLesson(lesson)}
                      >
                        <div className={styles.lessonIcon}>
                          {lesson.completed ? (
                            <CheckCircle size={16} className={styles.completedIcon} />
                          ) : (
                            getLessonIcon(lesson)
                          )}
                        </div>
                        <div className={styles.lessonInfo}>
                          <span className={styles.lessonTitle}>{lesson.title}</span>
                          <div className={styles.lessonMeta}>
                            <Clock size={12} />
                            <span>{formatTime(lesson.duration)}</span>
                            <span className={styles.lessonType}>{lesson.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}