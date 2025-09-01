import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import quizRoutes from './routes/quizzes';
import assignmentRoutes from './routes/assignments';
import readingRoutes from './routes/reading';

// Import middleware
import { authenticateToken } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.join(process.cwd(), uploadsDir)));

// Serve public assets (course thumbnails, etc.)
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

// Default course thumbnail endpoints (handle multiple formats)
const defaultSvg = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#4F46E5"/>
  <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">
    Curso UAA
  </text>
</svg>`;

app.get('/images/courses/default-course.png', (req, res) => {
  res.set('Content-Type', 'image/svg+xml');
  res.send(defaultSvg);
});

app.get('/images/default-course.jpg', (req, res) => {
  res.set('Content-Type', 'image/svg+xml');
  res.send(defaultSvg);
});

app.get('/images/default-course.png', (req, res) => {
  res.set('Content-Type', 'image/svg+xml');
  res.send(defaultSvg);
});

// Health check endpoint
app.get('/health', (req, res) => {
  const { getUserCacheStats } = require('./middleware/auth');
  const cacheStats = getUserCacheStats();
  
  res.json({
    success: true,
    message: 'Aula Virtual Backend is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    performance: {
      userCacheSize: cacheStats.size,
      uptime: Math.floor(process.uptime())
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/reading', readingRoutes);

// Enrollments shortcut route
app.get('/api/enrollments', authenticateToken, async (req, res) => {
  const { getUserEnrollments } = await import('./controllers/courseController');
  return getUserEnrollments(req as any, res);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request entity too large'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔌 Initializing database connection...');
    await initializeDatabase();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Aula Virtual Backend running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
      console.log('📁 Available endpoints:');
      console.log('  - POST /api/auth/login');
      console.log('  - POST /api/auth/register');
      console.log('  - GET  /api/courses');
      console.log('  - GET  /api/courses/:id/modules');
      console.log('  - POST /api/courses/:id/enroll');
      console.log('  - GET  /api/quizzes/lessons/:lessonId/quiz');
      console.log('  - POST /api/assignments/submissions');
      console.log('  - GET  /api/reading/lessons/:lessonId/reading');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();