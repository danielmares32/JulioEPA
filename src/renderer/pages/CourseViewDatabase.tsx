// Updated CourseView that uses database data instead of mock data

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
  Settings,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '../hooks/useLanguage';
import { useCourse, useLessonProgress, useQuiz, useAssignment, useReadingMaterial } from '../hooks/useApi';
import { QuizView } from '../components/QuizView';
import { AssignmentView } from '../components/AssignmentView';
import { ReadingView } from '../components/ReadingView';
import { Lesson } from '../../shared/types/database';
import styles from './CourseView.module.css';

// Enhanced lesson interface that includes database data
interface EnhancedLesson extends Lesson {
  completed: boolean;
  locked: boolean;
  quizData?: any;
  assignmentData?: any;
  readingData?: any;
}

// Enhanced module interface
interface EnhancedModule {
  id: string;
  title: string;
  lessons: EnhancedLesson[];
  completed: boolean;
  progress: number;
}

export function CourseViewDatabase() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Course data from API
  const { data: course, loading: courseLoading, error: courseError, refetch: refetchCourse } = useCourse(courseId!);
  
  // Local state
  const [currentLesson, setCurrentLesson] = useState<EnhancedLesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [enhancedModules, setEnhancedModules] = useState<EnhancedModule[]>([]);

  // Lesson progress hook for current lesson
  const { 
    data: lessonProgress, 
    updateProgress,
    loading: progressLoading 
  } = useLessonProgress(currentLesson?.id || '');

  // Content hooks - only load when needed
  const { data: quizData, loading: quizLoading } = useQuiz(
    currentLesson?.type === 'quiz' ? currentLesson.id : ''
  );
  
  const { data: assignmentData, loading: assignmentLoading } = useAssignment(
    currentLesson?.type === 'assignment' ? currentLesson.id : ''
  );
  
  const { data: readingData, loading: readingLoading } = useReadingMaterial(
    currentLesson?.type === 'reading' ? currentLesson.id : ''
  );

  // Process course data and enhance with progress information
  useEffect(() => {
    if (course && course.modules) {
      const processedModules: EnhancedModule[] = course.modules.map(module => {
        const enhancedLessons: EnhancedLesson[] = module.lessons.map(lesson => ({
          ...lesson,
          completed: false, // This would come from lesson progress API
          locked: false, // This would be calculated based on course logic
        }));

        const completedLessons = enhancedLessons.filter(l => l.completed).length;
        const progress = enhancedLessons.length > 0 ? (completedLessons / enhancedLessons.length) * 100 : 0;

        return {
          id: module.id,
          title: module.title,
          lessons: enhancedLessons,
          completed: progress === 100,
          progress,
        };
      });

      setEnhancedModules(processedModules);

      // Set current lesson to first incomplete or first lesson
      const firstIncomplete = findFirstIncompleteLesson(processedModules);
      if (firstIncomplete) {
        setCurrentLesson(firstIncomplete);
        
        // Expand module containing current lesson
        const moduleWithCurrentLesson = processedModules.find(mod => 
          mod.lessons.some(lesson => lesson.id === firstIncomplete.id)
        );
        if (moduleWithCurrentLesson) {
          setExpandedModules([moduleWithCurrentLesson.id]);
        }
      }
    }
  }, [course]);

  // Update current lesson with content data
  useEffect(() => {
    if (currentLesson && !currentLesson.quizData && !currentLesson.assignmentData && !currentLesson.readingData) {
      const updatedLesson = { ...currentLesson };
      
      if (currentLesson.type === 'quiz' && quizData) {
        updatedLesson.quizData = quizData;
      } else if (currentLesson.type === 'assignment' && assignmentData) {
        updatedLesson.assignmentData = assignmentData;
      } else if (currentLesson.type === 'reading' && readingData) {
        updatedLesson.readingData = readingData;
      }
      
      setCurrentLesson(updatedLesson);
    }
  }, [currentLesson, quizData, assignmentData, readingData]);

  const findFirstIncompleteLesson = (modules: EnhancedModule[]): EnhancedLesson | null => {
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

  const selectLesson = (lesson: EnhancedLesson) => {
    if (lesson.locked) return;
    setCurrentLesson(lesson);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      await updateProgress('completed', 100, currentTime || duration);
      
      // Update local state
      setEnhancedModules(prevModules => {
        const updatedModules = prevModules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => 
            lesson.id === lessonId ? { ...lesson, completed: true } : lesson
          )
        }));
        
        // Recalculate module progress
        return updatedModules.map(module => {
          const completedLessons = module.lessons.filter(l => l.completed).length;
          const progress = (completedLessons / module.lessons.length) * 100;
          
          return {
            ...module,
            progress,
            completed: progress === 100
          };
        });
      });
      
      // Unlock next lesson (this logic would ideally come from the backend)
      unlockNextLesson(lessonId);
      
      console.log(`Lesson ${lessonId} marked as complete`);
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
    }
  };

  const unlockNextLesson = (completedLessonId: string) => {
    setEnhancedModules(prevModules => {
      const updatedModules = [...prevModules];
      
      for (const module of updatedModules) {
        const currentIndex = module.lessons.findIndex(l => l.id === completedLessonId);
        if (currentIndex !== -1) {
          // Unlock next lesson in same module
          if (currentIndex < module.lessons.length - 1) {
            module.lessons[currentIndex + 1].locked = false;
          } else {
            // Unlock first lesson of next module
            const moduleIndex = updatedModules.findIndex(m => m.id === module.id);
            if (moduleIndex < updatedModules.length - 1) {
              const nextModule = updatedModules[moduleIndex + 1];
              if (nextModule.lessons.length > 0) {
                nextModule.lessons[0].locked = false;
              }
            }
          }
          break;
        }
      }
      
      return updatedModules;
    });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getLessonIcon = (lesson: EnhancedLesson) => {
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

  // Loading state
  if (courseLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <BookOpen size={48} className={styles.spinningIcon} />
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (courseError) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} color="var(--color-error)" />
        <p>Error loading course: {courseError}</p>
        <button onClick={() => refetchCourse()} className={styles.backButton}>
          Try Again
        </button>
        <button onClick={() => navigate('/courses')} className={styles.backButton}>
          <ArrowLeft size={16} />
          {t('backToCourses')}
        </button>
      </div>
    );
  }

  // No course found
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
            <span className={styles.instructor}>{course.instructor?.name || 'Unknown Instructor'}</span>
            <span className={styles.separator}>•</span>
            <div className={styles.rating}>
              <Star size={16} fill="currentColor" />
              {course.rating}
            </div>
            <span className={styles.separator}>•</span>
            <div className={styles.students}>
              <Users size={16} />
              {course.studentsCount?.toLocaleString() || '0'}
            </div>
            <span className={styles.separator}>•</span>
            <span className={styles.level}>{course.level}</span>
          </div>
          <div className={styles.progressContainer}>
            <span className={styles.progressLabel}>{t('courseProgress')}: {Math.round((lessonProgress?.progress || 0))}%</span>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${lessonProgress?.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Content Area */}
        <div className={styles.contentArea}>
          {currentLesson ? (
            <>
              <div className={styles.videoContainer}>
                {currentLesson.type === 'video' ? (
                  // Video Player (same as before)
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
                    
                    {/* Video Controls - same as before */}
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
                    {/* Dynamic content based on lesson type and loaded data */}
                    {currentLesson.type === 'quiz' && quizData ? (
                      <QuizView 
                        quiz={quizData}
                        onComplete={() => markLessonComplete(currentLesson.id)}
                        onExit={() => console.log('Exit quiz')}
                      />
                    ) : currentLesson.type === 'assignment' && assignmentData ? (
                      <AssignmentView 
                        assignment={assignmentData}
                        onSubmit={(files, text) => {
                          console.log('Assignment submitted:', { files, text });
                          markLessonComplete(currentLesson.id);
                        }}
                        onExit={() => console.log('Exit assignment')}
                      />
                    ) : currentLesson.type === 'reading' && readingData ? (
                      <ReadingView 
                        reading={readingData}
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
                        
                        {/* Loading states for content */}
                        {(currentLesson.type === 'quiz' && quizLoading) && <p>Loading quiz...</p>}
                        {(currentLesson.type === 'assignment' && assignmentLoading) && <p>Loading assignment...</p>}
                        {(currentLesson.type === 'reading' && readingLoading) && <p>Loading reading material...</p>}
                        
                        {/* No content available */}
                        {!quizLoading && !assignmentLoading && !readingLoading && (
                          <p>Content not available yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Lesson Actions */}
              <div className={styles.lessonActions}>
                {!lessonProgress?.status.includes('completed') && !progressLoading && (
                  <button 
                    onClick={() => markLessonComplete(currentLesson.id)}
                    className={styles.completeButton}
                    disabled={progressLoading}
                  >
                    <CheckCircle size={16} />
                    {progressLoading ? 'Updating...' : t('markAsComplete')}
                  </button>
                )}
                {lessonProgress?.status === 'completed' && (
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
          ) : (
            <div className={styles.contentPlaceholder}>
              <p>Select a lesson to begin</p>
            </div>
          )}
        </div>

        {/* Sidebar - Course Content */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>{t('courseContent')}</h3>
          </div>
          
          <div className={styles.modulesList}>
            {enhancedModules.map((module) => (
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