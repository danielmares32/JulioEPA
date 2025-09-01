// Updated Dashboard that uses database data

import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Calendar,
  Bell,
  Download,
  Award,
  Users,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../hooks/useLanguage';
import { useDashboardStats, useUserCourses } from '../hooks/useApi';
import { LoadingSpinner, ErrorMessage } from '../components/ErrorBoundary';
import { offlineManager } from '../services/offlineSync';
import styles from './Dashboard.module.css';

interface Activity {
  id: string;
  type: 'course_started' | 'lesson_completed' | 'quiz_passed' | 'assignment_submitted';
  description: string;
  courseTitle?: string;
  lessonTitle?: string;
  createdAt: string;
}

export function DashboardDatabase() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  // API hooks
  const { data: dashboardStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: userCourses, loading: coursesLoading, error: coursesError } = useUserCourses();
  
  // Local state
  const [isOffline, setIsOffline] = useState(offlineManager.isOffline());
  const [pendingSyncs, setPendingSyncs] = useState(offlineManager.getPendingSyncCount());
  
  // Monitor online/offline status and sync status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setPendingSyncs(offlineManager.getPendingSyncCount());
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Update pending syncs periodically
    const interval = setInterval(() => {
      setPendingSyncs(offlineManager.getPendingSyncCount());
    }, 5000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Hace unos minutos';
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (hours < 48) return 'Ayer';
    return date.toLocaleDateString();
  };
  
  const handleSync = async () => {
    try {
      await offlineManager.syncPendingChanges();
      await refetchStats();
      setPendingSyncs(offlineManager.getPendingSyncCount());
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_started':
        return <BookOpen size={16} />;
      case 'lesson_completed':
        return <Award size={16} />;
      case 'quiz_passed':
        return <TrendingUp size={16} />;
      case 'assignment_submitted':
        return <Calendar size={16} />;
      default:
        return <Clock size={16} />;
    }
  };
  
  // Loading state
  if (statsLoading || coursesLoading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }
  
  // Error state
  if (statsError && !dashboardStats) {
    return (
      <ErrorMessage 
        message={`Error cargando datos: ${statsError}`}
        onRetry={refetchStats}
      />
    );
  }
  
  // Use mock data if API data not available (offline fallback)
  const stats = dashboardStats || {
    totalCourses: 5,
    completedCourses: 2,
    inProgressCourses: 3,
    totalHoursSpent: 48,
    recentActivities: [],
    upcomingTasks: []
  };
  
  const courses = userCourses || [];

  const widgets = [
    {
      title: 'Cursos Inscritos',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'primary',
      trend: `${courses.length} activos`
    },
    {
      title: 'Cursos Completados',
      value: stats.completedCourses,
      icon: Award,
      color: 'success',
      trend: `${Math.round((stats.completedCourses / Math.max(stats.totalCourses, 1)) * 100)}% del total`
    },
    {
      title: 'En Progreso',
      value: stats.inProgressCourses,
      icon: TrendingUp,
      color: 'warning',
      trend: 'Continúa aprendiendo'
    },
    {
      title: 'Horas de Estudio',
      value: Math.round(stats.totalHoursSpent || 0),
      icon: Clock,
      color: 'secondary',
      trend: 'Tiempo invertido'
    }
  ];

  return (
    <div className={styles.dashboard}>
      {/* Connection Status */}
      <div className={styles.connectionStatus}>
        <div className={`${styles.statusIndicator} ${isOffline ? styles.offline : styles.online}`}>
          {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
          <span>{isOffline ? t('offline') : t('online')}</span>
        </div>
        
        {pendingSyncs > 0 && (
          <div className={styles.syncStatus}>
            <AlertTriangle size={16} />
            <span>{pendingSyncs} cambios pendientes</span>
            {!isOffline && (
              <button onClick={handleSync} className={styles.syncButtonSmall}>
                {t('syncNow')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            ¡Bienvenido, {user?.name?.split(' ')[0]}!
          </h1>
          <p className={styles.subtitle}>
            Aquí está tu resumen de actividades y progreso académico
          </p>
        </div>
        <button className={styles.syncButton} onClick={handleSync} disabled={isOffline}>
          <Download size={18} />
          Sincronizar datos
        </button>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {widgets.map((widget) => {
          const Icon = widget.icon;
          return (
            <div key={widget.title} className={`${styles.statCard} ${styles[widget.color]}`}>
              <div className={styles.statIcon}>
                <Icon size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>{widget.title}</p>
                <p className={styles.statValue}>{widget.value}</p>
                <p className={styles.statTrend}>{widget.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Recent Activity */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Clock size={20} />
              Actividad Reciente
            </h2>
          </div>
          <div className={styles.cardContent}>
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              <div className={styles.activityList}>
                {stats.recentActivities.slice(0, 5).map((activity: Activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityDescription}>
                        {activity.description}
                        {activity.courseTitle && (
                          <span className={styles.courseTitle}> - {activity.courseTitle}</span>
                        )}
                      </p>
                      <p className={styles.activityTime}>
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>No hay actividad reciente</p>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Calendar size={20} />
              Tareas Próximas
            </h2>
            <button className={styles.viewAllButton}>Ver todas</button>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.taskList}>
              {stats.upcomingTasks && stats.upcomingTasks.length > 0 ? (
                stats.upcomingTasks.map((task: any) => (
                  <div key={task.id} className={styles.taskItem}>
                    <div className={styles.taskInfo}>
                      <p className={styles.taskTitle}>{task.title}</p>
                      <p className={styles.taskCourse}>{task.courseTitle}</p>
                    </div>
                    <div className={styles.taskDue}>
                      <span className={`${styles.dueBadge} ${task.urgent ? styles.urgent : ''}`}>
                        {task.dueDate ? formatDate(task.dueDate) : 'Sin fecha'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>No hay tareas próximas</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Bell size={20} />
              Acciones Rápidas
            </h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.quickActions}>
              <button className={styles.actionButton}>
                <BookOpen size={20} />
                <span>Continuar último curso</span>
              </button>
              <button className={styles.actionButton}>
                <Download size={20} />
                <span>Descargar materiales</span>
              </button>
              <button className={styles.actionButton}>
                <Users size={20} />
                <span>Unirse a grupo de estudio</span>
              </button>
              <button className={styles.actionButton}>
                <Calendar size={20} />
                <span>Ver calendario</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}