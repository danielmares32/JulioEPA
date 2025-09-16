import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  User, 
  Settings, 
  LogOut, 
  Minimize2, 
  Maximize2, 
  X,
  Wifi,
  WifiOff,
  Menu,
  ChevronLeft 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../hooks/useLanguage';
import { ConnectionStatus } from './ConnectionStatus';
import styles from './Layout.module.css';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    // Check online status
    checkOnlineStatus();
    
    // Listen for online status changes
    window.electronAPI.onOnlineStatusChange((online) => {
      setIsOnline(online);
    });

    // Check periodically
    const interval = setInterval(checkOnlineStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkOnlineStatus = async () => {
    const online = await window.electronAPI.checkOnlineStatus();
    setIsOnline(online);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleMaximize = () => {
    window.electronAPI.maximizeWindow();
    setIsMaximized(!isMaximized);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Role-based navigation items
  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: Home, label: t('dashboard') },
      { path: '/courses', icon: BookOpen, label: t('courses') }
    ];

    // Students get simplified navigation
    if (user?.role === 'student') {
      return [
        ...baseItems,
        { path: '/profile', icon: User, label: t('profile') }
      ];
    }

    // Instructors and admins get full navigation
    return [
      ...baseItems,
      { path: '/profile', icon: User, label: t('profile') },
      { path: '/settings', icon: Settings, label: t('settings') }
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className={styles.layout}>
      {/* Title Bar */}
      <div className={`${styles.titleBar} drag-region`}>
        <div className={styles.titleBarContent}>
          <div className={styles.logo}>
            <img src="/Logotipo_UAA.jpg" alt="UAA" className={styles.logoImage} />
            <span className={styles.appTitle}>Aula Virtual 2.0</span>
          </div>
          
          <div className={styles.titleBarCenter}>
            <ConnectionStatus />
          </div>

          <div className={styles.titleBarRight}>
            <button 
              onClick={handleLogout} 
              className={`${styles.logoutButton} no-drag`}
              title={t('logout')}
            >
              <LogOut size={16} />
              <span>{t('logout')}</span>
            </button>
          </div>

          <div className={`${styles.windowControls} no-drag`}>
            <button onClick={() => window.electronAPI.minimizeWindow()} className={styles.controlButton}>
              <Minimize2 size={16} />
            </button>
            <button onClick={handleMaximize} className={styles.controlButton}>
              <Maximize2 size={16} />
            </button>
            <button onClick={() => window.electronAPI.closeWindow()} className={`${styles.controlButton} ${styles.closeButton}`}>
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${styles.mainContent} ${!sidebarVisible ? styles.sidebarHidden : ''}`}>
        {/* Sidebar Toggle Button - when sidebar is hidden */}
        {!sidebarVisible && (
          <button 
            onClick={toggleSidebar}
            className={styles.sidebarToggleButton}
            title="Mostrar menú"
          >
            <Menu size={18} />
          </button>
        )}
        
        {/* Sidebar */}
        {sidebarVisible && (
          <aside className={styles.sidebar}>
            {/* Sidebar Header with toggle button */}
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarTitle}>
                <span>Navegación</span>
              </div>
              <button 
                onClick={toggleSidebar}
                className={styles.sidebarToggleInside}
                title="Ocultar menú"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
            
            <nav className={styles.navigation}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className={styles.badge}>{item.badge}</span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className={styles.sidebarFooter}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userDetails}>
                  <p className={styles.userName}>{user?.name}</p>
                  <p className={styles.userRole}>
                    {user?.role === 'student' ? 'Estudiante' : 
                     user?.role === 'instructor' ? 'Instructor' : 
                     user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </p>
                </div>
              </div>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <LogOut size={18} />
              </button>
            </div>
          </aside>
        )}

        {/* Page Content */}
        <main className={`${styles.pageContent} ${!sidebarVisible ? styles.fullWidth : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="offline-indicator">
          {t('offlineMode')}
        </div>
      )}
    </div>
  );
}