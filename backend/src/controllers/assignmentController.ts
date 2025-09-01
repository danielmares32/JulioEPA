import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query, transaction } from '../config/database';
import path from 'path';

export const getAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lessonId } = req.params;

    // Get assignment for lesson
    const assignmentResult = await query(
      'SELECT * FROM assignments WHERE lesson_id = $1 AND is_published = true',
      [lessonId]
    );

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found for this lesson'
      });
    }

    const assignment = assignmentResult.rows[0];

    // Get resources
    const resourcesResult = await query(
      'SELECT * FROM assignment_resources WHERE assignment_id = $1 ORDER BY uploaded_at',
      [assignment.id]
    );

    assignment.resources = resourcesResult.rows;

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const createAssignmentSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assignmentId, submissionText } = req.body;
    const userId = req.user!.id;
    const files = req.files as Express.Multer.File[] || [];

    // Check if assignment exists
    const assignmentResult = await query(
      'SELECT * FROM assignments WHERE id = $1 AND is_published = true',
      [assignmentId]
    );

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    const assignment = assignmentResult.rows[0];

    // Validate file count
    if (files.length > assignment.max_files) {
      return res.status(400).json({
        success: false,
        error: `Too many files. Maximum ${assignment.max_files} files allowed.`
      });
    }

    // Check if already submitted
    const existingSubmission = await query(
      'SELECT id FROM assignment_submissions WHERE user_id = $1 AND assignment_id = $2',
      [userId, assignmentId]
    );

    if (existingSubmission.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Assignment already submitted'
      });
    }

    await transaction(async (client) => {
      // Create submission
      const submissionResult = await client.query(
        `INSERT INTO assignment_submissions (user_id, assignment_id, submission_text) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [userId, assignmentId, submissionText || null]
      );

      const submission = submissionResult.rows[0];

      // Save files
      const filePromises = files.map(async (file) => {
        const fileUrl = `/uploads/assignments/${file.filename}`;
        
        return client.query(
          `INSERT INTO assignment_files (submission_id, filename, original_name, size, mime_type, url)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [submission.id, file.filename, file.originalname, file.size, file.mimetype, fileUrl]
        );
      });

      const fileResults = await Promise.all(filePromises);
      submission.files = fileResults.map(result => result.rows[0]);

      // Log activity
      await client.query(
        `INSERT INTO user_activities (user_id, type, description, lesson_id) 
         SELECT $1, 'assignment_submitted', 'Entregó tarea: ' || a.title, a.lesson_id
         FROM assignments a 
         WHERE a.id = $2`,
        [userId, assignmentId]
      );

      res.status(201).json({
        success: true,
        data: submission
      });
    });
  } catch (error) {
    console.error('Create assignment submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getAssignmentSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user!.id;

    // Get submission with files
    const result = await query(
      `SELECT 
         asub.*,
         json_agg(
           json_build_object(
             'id', af.id,
             'filename', af.filename,
             'original_name', af.original_name,
             'size', af.size,
             'mime_type', af.mime_type,
             'url', af.url,
             'uploaded_at', af.uploaded_at
           )
         ) FILTER (WHERE af.id IS NOT NULL) as files
       FROM assignment_submissions asub
       LEFT JOIN assignment_files af ON asub.id = af.submission_id
       WHERE asub.user_id = $1 AND asub.assignment_id = $2
       GROUP BY asub.id`,
      [userId, assignmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    const submission = result.rows[0];
    submission.files = submission.files || [];

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Get assignment submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateAssignmentGrade = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const graderId = req.user!.id;

    // Verify grader has permission (instructor or admin)
    if (req.user!.role !== 'instructor' && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only instructors can grade assignments'
      });
    }

    const result = await query(
      `UPDATE assignment_submissions 
       SET grade = $1, feedback = $2, graded_at = CURRENT_TIMESTAMP, graded_by = $3
       WHERE id = $4
       RETURNING *`,
      [grade, feedback, graderId, submissionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update assignment grade error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};