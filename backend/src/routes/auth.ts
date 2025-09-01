import { Router } from 'express';
import { login, register, getCurrentUser } from '../controllers/authController';
import { loginValidation, registerValidation, handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/register', registerValidation, handleValidationErrors, register);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

export default router;