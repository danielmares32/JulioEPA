import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  Eye, 
  Bookmark, 
  Share2, 
  Download,
  ZoomIn,
  ZoomOut,
  Type,
  Sun,
  Moon,
  CheckCircle,
  ArrowUp,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from '../hooks/useLanguage';
import { useReadingMaterial, useReadingProgress } from '../hooks/useApi';
import { LoadingSpinner, ErrorMessage } from './ErrorBoundary';
import { offlineManager } from '../services/offlineSync';
import styles from './ReadingView.module.css';

interface ReadingViewProps {
  lessonId: string;
  onComplete: () => void;
  onExit: () => void;
}

export function ReadingView({ lessonId, onComplete, onExit }: ReadingViewProps) {
  const { t } = useTranslation();
  
  // API hooks
  const { data: reading, loading: readingLoading, error: readingError } = useReadingMaterial(lessonId);
  const { 
    data: progressData, 
    updateProgress, 
    toggleBookmark,
    loading: progressLoading 
  } = useReadingProgress(reading?.id || '');
  
  // Local state
  const [fontSize, setFontSize] = useState(16);
  const [readingMode, setReadingMode] = useState<'light' | 'dark' | 'sepia'>('light');
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [readingTime, setReadingTime] = useState(0); // in seconds
  const [startTime] = useState(Date.now());
  const [isOffline, setIsOffline] = useState(offlineManager.isOffline());
  
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
  
  // Load existing progress
  useEffect(() => {
    if (progressData) {
      setReadingProgress(progressData.progress);
      setIsBookmarked(progressData.isBookmarked);
      setReadingTime(progressData.readingTime);
    }
  }, [progressData]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector(`.${styles.contentContainer}`);
      if (container) {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;
        const progress = Math.min((scrollTop / scrollHeight) * 100, 100);
        setReadingProgress(progress);
        setShowScrollToTop(scrollTop > 300);
        
        // Auto-save progress to API/offline storage
        if (reading && progress > 0) {
          updateProgress(progress, readingTime, scrollTop);
        }
      }
    };

    const container = document.querySelector(`.${styles.contentContainer}`);
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [reading, readingTime, updateProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      setReadingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatReadingTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const handleToggleBookmark = async () => {
    if (!reading) return;
    
    try {
      await toggleBookmark();
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      if (!isOffline) {
        alert('Error al cambiar favorito');
      }
    }
  };

  const scrollToTop = () => {
    const container = document.querySelector(`.${styles.contentContainer}`);
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: reading.title,
        text: `Lee "${reading.title}" en Aula Virtual`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([`# ${reading.title}\n\n${reading.content}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${reading.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleMarkComplete = async () => {
    if (!reading) return;
    
    try {
      // Update final progress
      await updateProgress(100, readingTime, 0);
      onComplete();
    } catch (error) {
      console.error('Failed to mark as complete:', error);
      // Still mark as complete locally
      onComplete();
    }
  };

  const getReadingModeClass = () => {
    switch (readingMode) {
      case 'dark':
        return styles.darkMode;
      case 'sepia':
        return styles.sepiaMode;
      default:
        return '';
    }
  };

  // Loading state
  if (readingLoading) {
    return <LoadingSpinner message="Cargando material de lectura..." />;
  }

  // Error state
  if (readingError || !reading) {
    return (
      <ErrorMessage 
        message={readingError || 'No se pudo cargar el material de lectura'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className={`${styles.readingContainer} ${getReadingModeClass()}`}>
      {/* Offline indicator */}
      {isOffline && (
        <div className={styles.offlineIndicator}>
          <AlertTriangle size={16} />
          <span>Sin conexión - El progreso se guardará localmente</span>
        </div>
      )}
      {/* Header */}
      <div className={styles.readingHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.readingTitle}>{reading.title}</h1>
          {reading.author && (
            <p className={styles.readingAuthor}>Por {reading.author}</p>
          )}
          
          <div className={styles.readingMeta}>
            <div className={styles.metaItem}>
              <Clock size={14} />
              <span>{reading.estimatedReadTime} min de lectura</span>
            </div>
            <div className={styles.metaItem}>
              <Eye size={14} />
              <span>{reading.wordCount} palabras</span>
            </div>
            <div className={styles.metaItem}>
              <BookOpen size={14} />
              <span>Tiempo leído: {formatReadingTime(readingTime)}</span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button 
            className={`${styles.actionButton} ${isBookmarked ? styles.bookmarked : ''}`}
            onClick={handleToggleBookmark}
            title="Marcar favorito"
            disabled={progressLoading}
          >
            <Bookmark size={16} />
          </button>
          <button 
            className={styles.actionButton}
            onClick={handleShare}
            title="Compartir"
          >
            <Share2 size={16} />
          </button>
          <button 
            className={styles.actionButton}
            onClick={handleDownload}
            title="Descargar"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Reading Controls */}
      <div className={styles.readingControls}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Tamaño de fuente:</span>
          <button 
            className={styles.controlButton}
            onClick={decreaseFontSize}
            disabled={fontSize <= 12}
          >
            <ZoomOut size={14} />
          </button>
          <span className={styles.fontSizeDisplay}>{fontSize}px</span>
          <button 
            className={styles.controlButton}
            onClick={increaseFontSize}
            disabled={fontSize >= 24}
          >
            <ZoomIn size={14} />
          </button>
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Modo de lectura:</span>
          <button 
            className={`${styles.modeButton} ${readingMode === 'light' ? styles.active : ''}`}
            onClick={() => setReadingMode('light')}
          >
            <Sun size={14} />
          </button>
          <button 
            className={`${styles.modeButton} ${readingMode === 'dark' ? styles.active : ''}`}
            onClick={() => setReadingMode('dark')}
          >
            <Moon size={14} />
          </button>
          <button 
            className={`${styles.modeButton} ${readingMode === 'sepia' ? styles.active : ''}`}
            onClick={() => setReadingMode('sepia')}
          >
            <Type size={14} />
          </button>
        </div>

        <div className={styles.progressContainer}>
          <span className={styles.progressLabel}>Progreso: {Math.round(readingProgress)}%</span>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.contentContainer}>
        <article 
          className={styles.readingContent}
          style={{ fontSize: `${fontSize}px` }}
        >
          {reading.content.split('\n').map((paragraph, index) => {
            if (paragraph.trim() === '') return null;
            
            // Check if it's a heading (starts with #)
            if (paragraph.startsWith('#')) {
              const headingLevel = paragraph.match(/^#+/)?.[0].length || 1;
              const headingText = paragraph.replace(/^#+\s*/, '');
              const HeadingTag = `h${Math.min(headingLevel, 6)}` as keyof JSX.IntrinsicElements;
              
              return (
                <HeadingTag key={index} className={styles.heading}>
                  {headingText}
                </HeadingTag>
              );
            }
            
            return (
              <p key={index} className={styles.paragraph}>
                {paragraph}
              </p>
            );
          })}
        </article>
      </div>

      {/* Footer Actions */}
      <div className={styles.readingFooter}>
        <button onClick={onExit} className={styles.exitButton}>
          Volver
        </button>
        
        <button 
          onClick={handleMarkComplete}
          className={styles.completeButton}
          disabled={readingProgress < 80 || progressLoading}
        >
          <CheckCircle size={16} />
          {progressLoading 
            ? 'Guardando...' 
            : readingProgress >= 80 
              ? 'Marcar como Completado' 
              : `${Math.round(readingProgress)}% leído`
          }
        </button>
      </div>

      {/* Scroll to Top */}
      {showScrollToTop && (
        <button 
          className={styles.scrollToTop}
          onClick={scrollToTop}
          title="Volver arriba"
        >
          <ArrowUp size={16} />
        </button>
      )}
    </div>
  );
}