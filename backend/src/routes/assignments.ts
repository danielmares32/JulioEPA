import { Router } from 'express';
import {
  getAssignment,
  createAssignmentSubmission,
  getAssignmentSubmission,
  updateAssignmentGrade
} from '../controllers/assignmentController';
import { authenticateToken } from '../middleware/auth';
import { uploadAssignmentFiles, handleUploadError } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Assignment routes
router.get('/lessons/:lessonId/assignment', getAssignment);

// Assignment submission routes
router.post('/submissions', uploadAssignmentFiles.array('files'), handleUploadError, createAssignmentSubmission);
router.get('/assignments/:assignmentId/submission', getAssignmentSubmission);

// Grading routes (instructor only)
router.put('/submissions/:submissionId/grade', updateAssignmentGrade);

export default router;