import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Student ID must be at least 5 characters long'),
];

export const updateProgressValidation = [
  body('status')
    .isIn(['in_progress', 'completed'])
    .withMessage('Status must be either in_progress or completed'),
  body('progress')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  body('timeSpent')
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive integer'),
];

export const quizAnswerValidation = [
  body('questionId')
    .isUUID()
    .withMessage('Question ID must be a valid UUID'),
  body('answer')
    .notEmpty()
    .withMessage('Answer is required'),
];

export const readingProgressValidation = [
  body('progress')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  body('readingTime')
    .isInt({ min: 0 })
    .withMessage('Reading time must be a positive integer'),
  body('lastPosition')
    .isInt({ min: 0 })
    .withMessage('Last position must be a positive integer'),
];