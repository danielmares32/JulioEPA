import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Demo routes with mock data
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Aula Virtual Backend (Demo Mode) is running',
    timestamp: new Date().toISOString(),
    mode: 'demo'
  });
});

// Mock auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'estudiante@uaa.mx' && password === 'password123') {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          name: 'Juan Pérez Estudiante',
          email: 'estudiante@uaa.mx',
          role: 'student'
        },
        token: 'demo-jwt-token'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      name: 'Juan Pérez Estudiante',
      email: 'estudiante@uaa.mx',
      role: 'student'
    }
  });
});

// Mock courses routes
app.get('/api/courses', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Desarrollo Web Full Stack',
        description: 'Aprende a desarrollar aplicaciones web completas',
        instructor: 'Dr. María González',
        difficulty_level: 'intermediate',
        estimated_duration: 120,
        price: 599.00,
        thumbnail: '/images/courses/fullstack.jpg',
        is_enrolled: true
      },
      {
        id: '2',
        title: 'Bases de Datos Avanzado',
        description: 'Domina el diseño y optimización de bases de datos',
        instructor: 'Dr. María González',
        difficulty_level: 'advanced',
        estimated_duration: 80,
        price: 459.00,
        thumbnail: '/images/courses/database.jpg',
        is_enrolled: false
      }
    ]
  });
});

app.get('/api/courses/:id/modules', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      title: 'Desarrollo Web Full Stack',
      modules: [
        {
          id: '1',
          title: 'Introducción al Desarrollo Web',
          lessons: [
            {
              id: '1',
              title: 'HTML y CSS Básico',
              duration: 45,
              is_completed: false
            },
            {
              id: '2',
              title: 'JavaScript Fundamentals',
              duration: 60,
              is_completed: false
            }
          ]
        }
      ]
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Aula Virtual Backend (Demo Mode) running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔑 Test credentials: estudiante@uaa.mx / password123`);
  console.log('');
  console.log('⚠️  Demo Mode: Using mock data instead of database');
  console.log('   To use real database, fix PostgreSQL and use: npm run dev');
});