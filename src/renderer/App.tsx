// Updated main App component using database-integrated components

import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSettingsStore } from './store/settingsStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';

// Import database-integrated components
import { LoginPage } from './pages/Login';
import { DashboardDatabase as Dashboard } from './pages/DashboardDatabase';
import { CoursesDatabase as Courses } from './pages/CoursesDatabase';
import { CourseViewDatabase as CourseView } from './pages/CourseViewDatabase';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';

// Import offline sync system
import { offlineManager } from './services/offlineSync';

import './styles/globals.css';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { applyTheme } = useSettingsStore();

  useEffect(() => {
    checkAuth();
    applyTheme();
    
    // Initialize offline sync system
    if (isAuthenticated) {
      console.log('Offline sync system initialized');
    }
  }, [checkAuth, applyTheme, isAuthenticated]);

  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          {!isAuthenticated ? (
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:courseId" element={<CourseView />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;