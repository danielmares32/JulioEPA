import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Play,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  TrendingUp,
  Zap,
  Award,
  Target
} from 'lucide-react';
import styles from './Courses.module.css';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  duration: number;
  category: string;
  is_enrolled: boolean;
  is_downloaded: boolean;
  progress: number;
  last_accessed?: string;
  featured?: boolean;
  rating?: number;
  students?: number;
  level?: 'Básico' | 'Intermedio' | 'Avanzado';
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Category definitions
  const categories: Category[] = [
    { id: 'featured', name: 'Destacados', icon: <Crown size={20} />, color: '#FFD700' },
    { id: 'trending', name: 'Tendencias', icon: <TrendingUp size={20} />, color: '#FF6B6B' },
    { id: 'programming', name: 'Programación', icon: <BookOpen size={20} />, color: '#4ECDC4' },
    { id: 'mathematics', name: 'Matemáticas', icon: <Target size={20} />, color: '#45B7D1' },
    { id: 'languages', name: 'Idiomas', icon: <Users size={20} />, color: '#96CEB4' },
    { id: 'technology', name: 'Tecnología', icon: <Zap size={20} />, color: '#FECA57' },
    { id: 'design', name: 'Diseño', icon: <Award size={20} />, color: '#FF9FF3' }
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesData = await window.electronAPI.getCourses();
      
      // Enhance courses with additional data
      const enhancedCourses = coursesData.map((course: Course) => ({
        ...course,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        students: Math.floor(Math.random() * 5000) + 100,
        level: ['Básico', 'Intermedio', 'Avanzado'][Math.floor(Math.random() * 3)] as Course['level'],
        featured: Math.random() > 0.7 // 30% chance of being featured
      }));

      setCourses(enhancedCourses);
      setLoading(false);
    } catch (error) {
      console.error('Error loading courses:', error);
      setLoading(false);
    }
  };

  const getCoursesByCategory = (categoryId: string) => {
    if (categoryId === 'featured') {
      return courses.filter(course => course.featured);
    }
    if (categoryId === 'trending') {
      return courses.filter(course => course.is_enrolled).slice(0, 6);
    }
    if (categoryId === 'programming') {
      return courses.filter(course => 
        course.category === 'Ciencias de la Computación' || 
        course.category === 'Desarrollo Web' ||
        course.category === 'Desarrollo Móvil'
      );
    }
    if (categoryId === 'mathematics') {
      return courses.filter(course => course.category === 'Matemáticas');
    }
    if (categoryId === 'languages') {
      return courses.filter(course => course.category === 'Idiomas');
    }
    if (categoryId === 'technology') {
      return courses.filter(course => 
        course.category === 'Seguridad' || 
        course.category === 'Electrónica' ||
        course.category === 'Ciencia de Datos'
      );
    }
    return courses.filter(course => course.category.toLowerCase().includes(categoryId));
  };

  const getFilteredCourses = () => {
    if (!searchTerm) return courses;
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleEnrollCourse = async (course: Course) => {
    if (!course.is_enrolled) {
      try {
        // Directly enroll in the course
        await window.electronAPI.enrollCourse(course.id);
        
        // Update local course state
        setCourses(prevCourses => 
          prevCourses.map(c => 
            c.id === course.id 
              ? { ...c, is_enrolled: true, progress: 0 }
              : c
          )
        );
        
        console.log(`Successfully enrolled in ${course.title}`);
      } catch (error) {
        console.error('Failed to enroll in course:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <BookOpen size={48} className={styles.spinningIcon} />
          <p>Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.coursesPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Catálogo de Cursos</h1>
            <p className={styles.pageSubtitle}>Descubre y aprende con los mejores cursos de la UAA</p>
          </div>
          
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar cursos, instructores, categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className={styles.searchResults}>
            <h2 className={styles.sectionTitle}>
              Resultados para "{searchTerm}" ({getFilteredCourses().length})
            </h2>
            <div className={styles.coursesGrid}>
              {getFilteredCourses().map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onEnrollCourse={handleEnrollCourse}
                  onViewCourse={(courseId) => navigate(`/course/${courseId}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories and Carousels */}
        {!searchTerm && (
          <div className={styles.categoriesContainer}>
            {categories.map((category) => {
              const categoryCourses = getCoursesByCategory(category.id);
              if (categoryCourses.length === 0) return null;

              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  courses={categoryCourses}
                  onEnrollCourse={handleEnrollCourse}
                  onViewCourse={(courseId) => navigate(`/course/${courseId}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Category Section Component
function CategorySection({ 
  category, 
  courses, 
  onEnrollCourse,
  onViewCourse
}: { 
  category: Category; 
  courses: Course[]; 
  onEnrollCourse: (course: Course) => void;
  onViewCourse: (courseId: string) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of one card + gap
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, [courses]);

  return (
    <div className={styles.categorySection}>
      <div className={styles.categoryHeader}>
        <div className={styles.categoryTitle}>
          <div 
            className={styles.categoryIcon} 
            style={{ backgroundColor: category.color }}
          >
            {category.icon}
          </div>
          <h2 className={styles.categoryName}>{category.name}</h2>
          <span className={styles.courseCount}>({courses.length})</span>
        </div>
        
        <div className={styles.carouselControls}>
          <button 
            className={`${styles.carouselBtn} ${!canScrollLeft ? styles.disabled : ''}`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className={`${styles.carouselBtn} ${!canScrollRight ? styles.disabled : ''}`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        className={styles.carouselContainer}
        ref={scrollContainerRef}
        onScroll={checkScrollability}
      >
        <div className={styles.coursesCarousel}>
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onEnrollCourse={onEnrollCourse}
              onViewCourse={onViewCourse}
              variant={category.id === 'featured' ? 'featured' : 'default'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ 
  course, 
  onEnrollCourse,
  onViewCourse,
  variant = 'default' 
}: { 
  course: Course; 
  onEnrollCourse: (course: Course) => void;
  onViewCourse: (courseId: string) => void;
  variant?: 'default' | 'featured'; 
}) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Básico': return '#4ECDC4';
      case 'Intermedio': return '#FFD93D';
      case 'Avanzado': return '#FF6B6B';
      default: return '#95A5A6';
    }
  };

  return (
    <div className={`${styles.courseCard} ${variant === 'featured' ? styles.featuredCard : ''}`}>
      {variant === 'featured' && (
        <div className={styles.featuredBadge}>
          <Crown size={16} />
          Destacado
        </div>
      )}
      
      <div className={styles.courseImage}>
        <div className={styles.courseThumbnail}>
          <BookOpen size={40} />
        </div>
        {course.is_enrolled && (
          <div className={styles.enrolledBadge}>
            <CheckCircle size={16} />
          </div>
        )}
        <div className={styles.courseRating}>
          <Star size={14} fill="currentColor" />
          {course.rating}
        </div>
      </div>

      <div className={styles.courseContent}>
        <div className={styles.courseCategory}>
          {course.category}
        </div>
        
        <h3 className={styles.courseTitle}>{course.title}</h3>
        <p className={styles.courseInstructor}>Por {course.instructor}</p>
        
        <div className={styles.courseStats}>
          <div className={styles.courseStat}>
            <Clock size={14} />
            {course.duration}h
          </div>
          <div className={styles.courseStat}>
            <Users size={14} />
            {course.students?.toLocaleString()}
          </div>
          <div 
            className={styles.courseLevel}
            style={{ backgroundColor: getLevelColor(course.level || 'Básico') }}
          >
            {course.level || 'Básico'}
          </div>
        </div>

        {course.is_enrolled && (
          <div className={styles.progressSection}>
            <div className={styles.progressLabel}>Progreso: {course.progress}%</div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className={styles.courseFooter}>
          <div className={styles.coursePrice}>
            Gratis
          </div>
          
          {course.is_enrolled ? (
            <button 
              className={`${styles.actionBtn} ${styles.continueBtn}`}
              onClick={() => onViewCourse(course.id)}
            >
              <Play size={16} />
              Continuar
            </button>
          ) : (
            <button 
              className={`${styles.actionBtn} ${styles.enrollBtn}`}
              onClick={() => onEnrollCourse(course)}
            >
              <CheckCircle size={16} />
              Inscribirse
            </button>
          )}
        </div>
      </div>
    </div>
  );
}