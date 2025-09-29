import { createBrowserRouter, createHashRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthLayout } from './components/AuthLayout';
import { LoginPage } from './pages/Login';
import { DashboardDatabase as DashboardPage } from './pages/DashboardDatabase';
import { CoursesDatabase as CoursesPage } from './pages/CoursesDatabase';
import { CourseViewDatabase as CourseViewPage } from './pages/CourseViewDatabase';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';

const routes = [
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'courses',
        element: <CoursesPage />
      },
      {
        path: 'course/:courseId',
        element: <CourseViewPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />
      }
    ]
  }
];

// Use HashRouter for Electron environment, BrowserRouter for development
export const router = typeof window !== 'undefined' && window.location.protocol === 'file:'
  ? createHashRouter(routes)
  : createBrowserRouter(routes);