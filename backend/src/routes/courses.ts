import { Router } from 'express';
import {
  getCourses,
  getCourse,
  getCourseWithModules,
  enrollInCourse,
  getUserEnrollments,
  updateLessonProgress,
  getLessonProgress,
  getDashboardAnalytics
} from '../controllers/courseController';
import { authenticateToken } from '../middleware/auth';
import { updateProgressValidation, handleValidationErrors } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Course routes
router.get('/', getCourses);
router.get('/dashboard/analytics', getDashboardAnalytics);
router.get('/:courseId', getCourse);
router.get('/:courseId/modules', getCourseWithModules);
router.post('/:courseId/enroll', enrollInCourse);

// Enrollment routes
router.get('/enrollments/me', getUserEnrollments);

// Lesson progress routes
router.get('/lessons/:lessonId/progress', getLessonProgress);
router.put('/lessons/:lessonId/progress', updateProgressValidation, handleValidationErrors, updateLessonProgress);

export default router;