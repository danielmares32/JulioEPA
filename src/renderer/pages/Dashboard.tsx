import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Calendar,
  Bell,
  Download,
  Award,
  Users
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../hooks/useLanguage';
import styles from './Dashboard.module.css';

interface Activity {
  id: number;
  type: string;
  description: string;
  created_at: string;
}

interface Stats {
  enrolledCourses: number;
  completedCourses: number;
  averageProgress: number;
  totalHours: number;
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({
    enrolledCourses: 5,
    completedCourses: 2,
    averageProgress: 65,
    totalHours: 48
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const offlineData = await window.electronAPI.getOfflineData();
      setActivities(offlineData.activities || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

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

  const widgets = [
    {
      title: 'Cursos Inscritos',
      value: stats.enrolledCourses,
      icon: BookOpen,
      color: 'primary',
      trend: '+2 este mes'
    },
    {
      title: 'Cursos Completados',
      value: stats.completedCourses,
      icon: Award,
      color: 'success',
      trend: '40% del total'
    },
    {
      title: 'Progreso Promedio',
      value: `${stats.averageProgress}%`,
      icon: TrendingUp,
      color: 'warning',
      trend: '+15% esta semana'
    },
    {
      title: 'Horas de Estudio',
      value: stats.totalHours,
      icon: Clock,
      color: 'secondary',
      trend: '6h esta semana'
    }
  ];

  const upcomingTasks = [
    { id: 1, title: 'Entrega de proyecto final', course: 'Programación Web', due: '2 días', urgent: true },
    { id: 2, title: 'Quiz Capítulo 5', course: 'Base de Datos', due: '5 días', urgent: false },
    { id: 3, title: 'Foro de discusión', course: 'Inteligencia Artificial', due: '1 semana', urgent: false },
    { id: 4, title: 'Práctica de laboratorio', course: 'Redes', due: '3 días', urgent: true }
  ];

  return (
    <div className={styles.dashboard}>
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
        <button className={styles.syncButton}>
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
            {activities.length > 0 ? (
              <div className={styles.activityList}>
                {activities.slice(0, 5).map((activity, index) => (
                  <div key={`activity-${index}`} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <div className={styles.activityDot} />
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityDescription}>
                        {activity.description}
                      </p>
                      <p className={styles.activityTime}>
                        {formatDate(activity.created_at)}
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
              {upcomingTasks.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskInfo}>
                    <p className={styles.taskTitle}>{task.title}</p>
                    <p className={styles.taskCourse}>{task.course}</p>
                  </div>
                  <div className={styles.taskDue}>
                    <span className={`${styles.dueBadge} ${task.urgent ? styles.urgent : ''}`}>
                      {task.due}
                    </span>
                  </div>
                </div>
              ))}
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