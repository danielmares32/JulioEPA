import { Router } from 'express';
import {
  getQuiz,
  createQuizAttempt,
  submitQuizAnswer,
  completeQuizAttempt,
  getQuizAttempts
} from '../controllers/quizController';
import { authenticateToken } from '../middleware/auth';
import { quizAnswerValidation, handleValidationErrors } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Quiz routes
router.get('/lessons/:lessonId/quiz', getQuiz);
router.get('/:quizId/attempts', getQuizAttempts);

// Quiz attempt routes
router.post('/quiz-attempts', createQuizAttempt);
router.post('/quiz-attempts/:attemptId/answers', quizAnswerValidation, handleValidationErrors, submitQuizAnswer);
router.post('/quiz-attempts/:attemptId/complete', completeQuizAttempt);

export default router;