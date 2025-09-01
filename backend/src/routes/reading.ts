import { Router } from 'express';
import {
  getReadingMaterial,
  updateReadingProgress,
  getReadingProgress,
  getUserReadingStatistics
} from '../controllers/readingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Reading material routes
router.get('/lessons/:lessonId/reading', getReadingMaterial);

// Reading progress routes
router.get('/lessons/:lessonId/progress', getReadingProgress);
router.put('/lessons/:lessonId/progress', updateReadingProgress);

// Reading statistics
router.get('/statistics/me', getUserReadingStatistics);

export default router;