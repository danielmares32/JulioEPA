// App Store-like Courses page that uses database data

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Star, 
  Clock, 
  Users, 
  Award,
  Play,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  Code2,
  Database,
  Network,
  Brain
} from 'lucide-react';
import { useTranslation } from '../hooks/useLanguage';
import { useUserCourses } from '../hooks/useApi';
import { LoadingSpinner, ErrorMessage } from '../components/ErrorBoundary';
import { Course, Enrollment } from '../../shared/types/database';
import { offlineManager } from '../services/offlineSync';
import { courseService, getImageUrl } from '../services/api';
import { useAuthStore } from '../store/authStore';
import styles from './Courses.module.css';

interface CourseWithEnrollment extends Course {
  enrollment?: Enrollment;
  isEnrolled: boolean;
  progress: number;
}

export function CoursesDatabase() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  // API hooks
  const { data: userCourses, loading: coursesLoading, error: coursesError, refetch } = useUserCourses();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [trendingCourses, setTrendingCourses] = useState<Course[]>([]);
  const [featuredCourse, setFeaturedCourse] = useState<Course | null>(null);
  const [carousels, setCarousels] = useState<Record<string, { scrollPosition: number, canScrollLeft: boolean, canScrollRight: boolean }>>({});
  const [isOffline, setIsOffline] = useState(offlineManager.isOffline());
  const [enrolling, setEnrolling] = useState<string | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process courses data
  useEffect(() => {
    if (userCourses) {
      const processedCourses: CourseWithEnrollment[] = userCourses.map(enrollment => ({
        ...enrollment.course,
        enrollment,
        isEnrolled: true,
        progress: enrollment.progress
      }));
      setCourses(processedCourses);
    }
  }, [userCourses]);

  // Load available courses for enrollment
  useEffect(() => {
    const loadAvailableCourses = async () => {
      if (!isOffline) {
        try {
          const response = await courseService.getCourses(1, 50);
          if (response.success) {
            const allCourses = response.data;
            setAvailableCourses(allCourses);
            
            // Generate recommendations (courses not enrolled)
            const notEnrolled = allCourses.filter(course => 
              !courses.some(enrolled => enrolled.id === course.id)
            );
            
            // Recommended: High-rated courses from different categories (more inclusive rating)
            let recommended = notEnrolled
              .filter(course => course.rating >= 4.0)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 8);
            
            // Fallback: if no high-rated courses, show any available courses
            if (recommended.length === 0) {
              recommended = notEnrolled
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 8);
            }
            
            setRecommendedCourses(recommended);
            
            // Featured course: Highest rated course not enrolled
            const featured = notEnrolled
              .sort((a, b) => b.rating - a.rating)[0];
            setFeaturedCourse(featured || null);
            
            // Trending: Courses with high student count
            const trending = notEnrolled
              .sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0))
              .slice(0, 8);
            setTrendingCourses(trending);
          }
        } catch (error) {
          console.error('Failed to load available courses:', error);
        }
      }
    };

    loadAvailableCourses();
  }, [isOffline, courses]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleEnrollCourse = async (courseId: string) => {
    if (isOffline) {
      alert('No se puede inscribir en cursos sin conexión');
      return;
    }

    setEnrolling(courseId);
    try {
      const response = await courseService.enrollInCourse(courseId);
      if (response.success) {
        await refetch(); // Reload user courses
        alert('Inscripción exitosa');
      } else {
        throw new Error(response.error || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Error al inscribirse en el curso');
    } finally {
      setEnrolling(null);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Helper function to normalize text for search (handle accents, case, etc.)
  const normalizeForSearch = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
      .trim();
  };

  // Get filtered courses for search (both enrolled and available)
  const getSearchResults = () => {
    if (!searchTerm.trim()) return [];
    
    const searchNormalized = normalizeForSearch(searchTerm);
    console.log('Search term:', searchTerm, 'Normalized:', searchNormalized);
    
    // Helper function to calculate relevance score for a course
    const calculateRelevanceScore = (course: any) => {
      const fieldWeights = [
        { field: course.title || '', weight: 10 },           // Title most important
        { field: course.category || '', weight: 8 },         // Category very important  
        { field: course.instructor?.name || '', weight: 6 }, // Instructor important
        { field: course.level || '', weight: 4 },            // Level less important
        { field: course.description || '', weight: 2 }       // Description least important
      ];
      
      let totalScore = 0;
      let hasMatch = false;
      
      fieldWeights.forEach(({ field, weight }) => {
        if (!field) return;
        
        const normalized = normalizeForSearch(field);
        const words = normalized.split(/\s+/).filter(word => word.length > 0);
        
        // Check if search term appears as a complete word or as start of a word
        const exactWordMatch = words.some(word => word === searchNormalized);
        const wordStartMatch = words.some(word => word.startsWith(searchNormalized));
        const substringMatch = searchNormalized.length >= 3 && normalized.includes(searchNormalized);
        
        if (exactWordMatch) {
          totalScore += weight * 3; // Exact match gets 3x weight
          hasMatch = true;
        } else if (wordStartMatch) {
          totalScore += weight * 2; // Word start gets 2x weight
          hasMatch = true;
        } else if (substringMatch) {
          totalScore += weight * 1; // Substring gets 1x weight
          hasMatch = true;
        }
        
        if (exactWordMatch || wordStartMatch || substringMatch) {
          console.log(`Match in "${field.substring(0, 30)}..." (weight: ${weight}, score added: ${exactWordMatch ? weight * 3 : wordStartMatch ? weight * 2 : weight})`);
        }
      });
      
      if (hasMatch) {
        console.log(`Course "${course.title}" total relevance score: ${totalScore}`);
      }
      
      return { hasMatch, score: totalScore };
    };
    
    // Search enrolled courses with relevance scoring
    console.log('Searching enrolled courses:', courses.length);
    const enrolledResults = courses
      .map(course => {
        const relevance = calculateRelevanceScore(course);
        return relevance.hasMatch ? { ...course, isEnrolled: true, relevanceScore: relevance.score } : null;
      })
      .filter(Boolean);
    
    // Search available courses (not enrolled) with relevance scoring
    console.log('Searching available courses:', availableCourses.length);
    const availableResults = availableCourses
      .filter(course => {
        // Don't include courses that are already enrolled
        return !courses.some(enrolled => enrolled.id === course.id);
      })
      .map(course => {
        const relevance = calculateRelevanceScore(course);
        return relevance.hasMatch ? { ...course, isEnrolled: false, progress: 0, relevanceScore: relevance.score } : null;
      })
      .filter(Boolean);
    
    console.log('Search results - Enrolled:', enrolledResults.length, 'Available:', availableResults.length);
    
    // Combine and sort by relevance score (highest first)
    const allResults = [...enrolledResults, ...availableResults];
    const sortedResults = allResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    
    console.log('Final sorted results:', sortedResults.map(r => `${r.title} (score: ${r.relevanceScore})`));
    
    return sortedResults;
  };

  const categories = ['all', ...Array.from(new Set(courses.map(course => course.category)))];

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'var(--color-error)';
    if (progress < 70) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const scrollCarousel = (carouselId: string, direction: 'left' | 'right') => {
    console.log(`Scrolling carousel: ${carouselId}, direction: ${direction}`);
    
    const container = document.getElementById(`carousel-${carouselId}`);
    if (!container) {
      console.error(`Carousel container not found: carousel-${carouselId}`);
      return;
    }

    const cardWidth = 320; // 300px card + 20px gap
    const scrollAmount = cardWidth * 2; // Scroll 2 cards at a time
    
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    console.log(`Current scroll: ${currentScroll}, Max scroll: ${maxScroll}, Container width: ${container.clientWidth}, Scroll width: ${container.scrollWidth}`);
    
    let newScrollPosition: number;
    if (direction === 'left') {
      newScrollPosition = Math.max(0, currentScroll - scrollAmount);
    } else {
      newScrollPosition = Math.min(maxScroll, currentScroll + scrollAmount);
    }

    console.log(`Scrolling to: ${newScrollPosition}`);

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });

    // Update carousel state after scroll animation
    setTimeout(() => {
      updateCarouselState(carouselId);
    }, 300);
  };

  const updateCarouselState = (carouselId: string) => {
    const container = document.getElementById(`carousel-${carouselId}`);
    if (!container) {
      console.error(`Cannot update carousel state, container not found: carousel-${carouselId}`);
      return;
    }

    const scrollPosition = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const canScrollLeft = scrollPosition > 0;
    const canScrollRight = scrollPosition < maxScroll - 5; // More lenient threshold
    
    console.log(`Updating carousel state for ${carouselId}:`, {
      scrollPosition,
      maxScroll,
      canScrollLeft,
      canScrollRight,
      clientWidth: container.clientWidth,
      scrollWidth: container.scrollWidth,
      childCount: container.children.length,
      calculation: `${container.scrollWidth} - ${container.clientWidth} = ${maxScroll}`
    });
    
    setCarousels(prev => ({
      ...prev,
      [carouselId]: {
        scrollPosition,
        canScrollLeft,
        canScrollRight
      }
    }));
  };

  const initializeCarousel = (carouselId: string) => {
    const container = document.getElementById(`carousel-${carouselId}`);
    if (!container) return;

    // Force minimum width to ensure scrolling is possible
    const childCount = container.children.length;
    if (childCount > 0) {
      const minRequiredWidth = childCount * 320; // 300px card + 20px gap
      container.style.minWidth = `${minRequiredWidth}px`;
      console.log(`Set minimum width for ${carouselId}: ${minRequiredWidth}px (${childCount} cards)`);
    }

    // Small delay to ensure styles are applied
    setTimeout(() => {
      updateCarouselState(carouselId);
    }, 100);
    
    // Add scroll listener
    const handleScroll = () => updateCarouselState(carouselId);
    container.addEventListener('scroll', handleScroll);
    
    return () => container.removeEventListener('scroll', handleScroll);
  };

  useEffect(() => {
    // Initialize carousels after data loads and DOM is ready
    const timer = setTimeout(() => {
      const carouselIds = ['continue-learning', 'recommendations', 'trending'];
      
      // Add category IDs that actually exist
      if (availableCourses.length > 0) {
        const uniqueCategories = [...new Set(availableCourses.map(course => course.category))];
        carouselIds.push(...uniqueCategories);
      }
      
      console.log('Initializing carousels:', carouselIds);
      console.log('Data counts:', {
        courses: courses.length,
        availableCourses: availableCourses.length,
        recommendedCourses: recommendedCourses.length,
        trendingCourses: trendingCourses.length
      });
      
      carouselIds.forEach(id => {
        const container = document.getElementById(`carousel-${id}`);
        if (container) {
          console.log(`Found carousel container: carousel-${id}`);
          initializeCarousel(id);
        } else {
          console.warn(`Carousel container not found: carousel-${id}`);
        }
      });
    }, 800); // Even longer timeout to ensure all content is rendered

    return () => {
      clearTimeout(timer);
    };
  }, [courses, availableCourses, recommendedCourses, trendingCourses]);

  // Loading state
  if (coursesLoading) {
    return <LoadingSpinner message="Cargando cursos..." />;
  }

  // Error state
  if (coursesError) {
    return (
      <ErrorMessage 
        message={`Error cargando cursos: ${coursesError}`}
        onRetry={refetch}
      />
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ingeniería de software':
        return <Code2 size={24} />;
      case 'bases de datos':
        return <Database size={24} />;
      case 'redes y comunicaciones':
        return <Network size={24} />;
      case 'inteligencia artificial':
        return <Brain size={24} />;
      default:
        return <BookOpen size={24} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ingeniería de software':
        return '#3B82F6';
      case 'bases de datos':
        return '#10B981';
      case 'redes y comunicaciones':
        return '#F59E0B';
      case 'inteligencia artificial':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const renderCourseCard = (course: Course | CourseWithEnrollment, isEnrolled = false) => {
    const enrolledCourse = course as CourseWithEnrollment;
    
    return (
      <div key={course.id} className={styles.courseCard}>
        <div className={styles.courseImage}>
          <img 
            src={getImageUrl(course.thumbnail || '')} 
            alt={course.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getImageUrl('');
            }}
          />
          {isEnrolled && enrolledCourse.progress === 100 && (
            <div className={styles.enrolledBadge}>
              <CheckCircle size={16} />
            </div>
          )}
          <div className={styles.courseRating}>
            <Star size={12} fill="currentColor" />
            {course.rating}
          </div>
        </div>
        
        <div className={styles.courseContent}>
          <span className={styles.courseCategory}>{course.category}</span>
          <h3 className={styles.courseTitle}>{course.title}</h3>
          <p className={styles.courseInstructor}>Dr. {course.instructor?.name || 'Instructor UAA'}</p>
          
          <div className={styles.courseStats}>
            <div className={styles.courseStat}>
              <Clock size={12} />
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className={styles.courseStat}>
              <Users size={12} />
              <span>{course.studentsCount?.toLocaleString() || '0'}</span>
            </div>
            <div 
              className={styles.courseLevel}
              style={{ backgroundColor: getCategoryColor(course.category) }}
            >
              {course.level}
            </div>
          </div>

          {isEnrolled && (
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>Progreso {enrolledCourse.progress}%</div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${enrolledCourse.progress}%`,
                    backgroundColor: getProgressColor(enrolledCourse.progress)
                  }}
                />
              </div>
            </div>
          )}

          <div className={styles.courseFooter}>
            <div className={styles.coursePrice}>
              {t('free')}
            </div>
            <button 
              onClick={() => isEnrolled ? handleViewCourse(course.id) : handleEnrollCourse(course.id)}
              className={`${styles.actionBtn} ${isEnrolled ? styles.continueBtn : styles.enrollBtn}`}
              disabled={enrolling === course.id}
            >
              {enrolling === course.id ? 'Inscribiendo...' : 
               isEnrolled ? (enrolledCourse.progress > 0 ? t('continue') : 'Comenzar') : t('enroll')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.coursesPage}>
      <div className={styles.container}>
        {/* Connection Status */}
        {isOffline && (
          <div className={styles.connectionStatus}>
            <div className={styles.offlineWarning}>
              <WifiOff size={16} />
              <span>Modo offline - Solo cursos descargados disponibles</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Aula Virtual</h1>
            <p className={styles.pageSubtitle}>Descubre y aprende con los mejores cursos de la UAA</p>
          </div>
          
          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar cursos, instructores o temas..."
                value={searchTerm}
                onChange={handleSearch}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className={styles.searchResults}>
            <h2 className={styles.sectionTitle}>
              Resultados para "{searchTerm}" ({getSearchResults().length} {getSearchResults().length === 1 ? 'curso' : 'cursos'})
            </h2>
            {getSearchResults().length === 0 ? (
              <div className={styles.noResults}>
                <div className={styles.noResultsContent}>
                  <Search size={48} />
                  <h3>No se encontraron cursos</h3>
                  <p>Intenta con otros términos de búsqueda o explora las categorías disponibles.</p>
                </div>
              </div>
            ) : (
              <div className={styles.coursesGrid}>
                {getSearchResults().map((course) => renderCourseCard(course, course.isEnrolled))}
              </div>
            )}
          </div>
        )}

        {/* Categories Container - Only show when not searching */}
        {!searchTerm && (
          <div className={styles.categoriesContainer}>
            
            {/* Continue Learning Section - Always show for enrolled courses */}
            {filteredCourses.length > 0 && (
              <div className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryTitle}>
                    <div className={styles.categoryIcon} style={{ backgroundColor: '#10B981' }}>
                      <Play size={24} />
                    </div>
                    <div>
                      <h2 className={styles.categoryName}>
                        {user?.role === 'student' ? 'Mis Cursos' : 'Continuar Aprendiendo'}
                      </h2>
                      <span className={styles.courseCount}>{filteredCourses.length} cursos</span>
                    </div>
                  </div>
                  {user?.role !== 'student' && (
                    <div className={styles.carouselControls}>
                      <button 
                        className={`${styles.carouselBtn} ${!carousels['continue-learning']?.canScrollLeft ? styles.disabled : ''}`}
                        onClick={() => scrollCarousel('continue-learning', 'left')}
                        disabled={!carousels['continue-learning']?.canScrollLeft}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        className={`${styles.carouselBtn} ${!carousels['continue-learning']?.canScrollRight ? styles.disabled : ''}`}
                        onClick={() => scrollCarousel('continue-learning', 'right')}
                        disabled={!carousels['continue-learning']?.canScrollRight}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className={styles.carouselContainer}>
                  {user?.role === 'student' ? (
                    // Simple grid for students
                    <div className={styles.coursesGrid}>
                      {filteredCourses.map((course) => renderCourseCard(course, true))}
                    </div>
                  ) : (
                    // Carousel for instructors/admins
                    <div id="carousel-continue-learning" className={styles.coursesCarousel}>
                      {filteredCourses.slice(0, 8).map((course) => renderCourseCard(course, true))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Available Courses Section - Simplified for students */}
            {!isOffline && availableCourses.length > 0 && (
              <div className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryTitle}>
                    <div className={styles.categoryIcon} style={{ backgroundColor: '#3B82F6' }}>
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h2 className={styles.categoryName}>
                        {user?.role === 'student' ? 'Cursos Disponibles' : 'Recomendaciones'}
                      </h2>
                      <span className={styles.courseCount}>
                        {user?.role === 'student' ? 'Explora nuevos cursos' : 'Cursos seleccionados para ti'}
                      </span>
                    </div>
                  </div>
                  {user?.role !== 'student' && (
                    <div className={styles.carouselControls}>
                      <button 
                        className={`${styles.carouselBtn} ${!carousels['recommendations']?.canScrollLeft ? styles.disabled : ''}`}
                        onClick={() => scrollCarousel('recommendations', 'left')}
                        disabled={!carousels['recommendations']?.canScrollLeft}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        className={`${styles.carouselBtn} ${!carousels['recommendations']?.canScrollRight ? styles.disabled : ''}`}
                        onClick={() => scrollCarousel('recommendations', 'right')}
                        disabled={!carousels['recommendations']?.canScrollRight}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className={styles.carouselContainer}>
                  {user?.role === 'student' ? (
                    // Simple grid for students
                    <div className={styles.coursesGrid}>
                      {availableCourses
                        .filter(course => !courses.some(enrolled => enrolled.id === course.id))
                        .slice(0, 6)
                        .map((course) => renderCourseCard(course, false))
                      }
                    </div>
                  ) : (
                    // Full carousel view for instructors/admins
                    <>
                      {/* Featured Course */}
                      {featuredCourse && (
                        <div className={styles.featuredCourseContainer}>
                          <div className={`${styles.courseCard} ${styles.featuredCard}`}>
                            <div className={styles.featuredBadge}>
                              <Star size={12} />
                              DESTACADO
                            </div>
                            {renderCourseCard(featuredCourse, false)}
                          </div>
                        </div>
                      )}
                      
                      {/* Recommendations Carousel */}
                      <div id="carousel-recommendations" className={styles.coursesCarousel}>
                        {recommendedCourses.map((course) => renderCourseCard(course, false))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}