import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query, transaction } from '../config/database';

export const getQuiz = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lessonId } = req.params;

    // Get quiz for lesson
    const quizResult = await query(
      'SELECT * FROM quizzes WHERE lesson_id = $1 AND is_published = true',
      [lessonId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found for this lesson'
      });
    }

    const quiz = quizResult.rows[0];

    // Get questions (without correct answers for security)
    const questionsResult = await query(
      `SELECT id, type, question, options, points, order_index, explanation
       FROM quiz_questions 
       WHERE quiz_id = $1 
       ORDER BY order_index`,
      [quiz.id]
    );

    quiz.questions = questionsResult.rows;

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const createQuizAttempt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { quizId } = req.body;
    const userId = req.user!.id;

    // Check if quiz exists
    const quizResult = await query(
      'SELECT * FROM quizzes WHERE id = $1 AND is_published = true',
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    const quiz = quizResult.rows[0];

    // Check attempt limit
    const attemptCountResult = await query(
      'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2',
      [userId, quizId]
    );

    const attemptCount = parseInt(attemptCountResult.rows[0].count);
    
    if (attemptCount >= quiz.attempts) {
      return res.status(403).json({
        success: false,
        error: 'Maximum attempts exceeded'
      });
    }

    // Create new attempt
    const result = await query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, attempt_number) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, quizId, attemptCount + 1]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create quiz attempt error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const submitQuizAnswer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { questionId, answer } = req.body;
    const userId = req.user!.id;

    // Verify attempt belongs to user and is not completed
    const attemptResult = await query(
      'SELECT * FROM quiz_attempts WHERE id = $1 AND user_id = $2 AND completed_at IS NULL',
      [attemptId, userId]
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Quiz attempt not found or already completed'
      });
    }

    // Get question with correct answer
    const questionResult = await query(
      'SELECT * FROM quiz_questions WHERE id = $1',
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    const question = questionResult.rows[0];

    // Check if answer is correct
    let isCorrect = false;
    let pointsEarned = 0;

    if (question.type === 'multiple-choice') {
      isCorrect = parseInt(answer) === parseInt(question.correct_answer);
    } else if (question.type === 'true-false') {
      isCorrect = (answer === true || answer === 'true') === (question.correct_answer === 'true');
    } else if (question.type === 'short-answer') {
      // Simple case-insensitive comparison (could be enhanced with fuzzy matching)
      isCorrect = answer.toLowerCase().trim().includes(question.correct_answer.toLowerCase().trim());
    }

    if (isCorrect) {
      pointsEarned = question.points;
    }

    // Save answer
    const result = await query(
      `INSERT INTO quiz_answers (attempt_id, question_id, answer, is_correct, points_earned)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (attempt_id, question_id) 
       DO UPDATE SET 
         answer = $3,
         is_correct = $4,
         points_earned = $5,
         created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [attemptId, questionId, answer.toString(), isCorrect, pointsEarned]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Submit quiz answer error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const completeQuizAttempt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user!.id;

    await transaction(async (client) => {
      // Verify attempt belongs to user
      const attemptResult = await client.query(
        'SELECT qa.*, q.passing_score FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id WHERE qa.id = $1 AND qa.user_id = $2 AND qa.completed_at IS NULL',
        [attemptId, userId]
      );

      if (attemptResult.rows.length === 0) {
        throw new Error('Quiz attempt not found or already completed');
      }

      const attempt = attemptResult.rows[0];

      // Calculate score
      const scoreResult = await client.query(
        `SELECT 
           SUM(points_earned) as earned_points,
           SUM(qq.points) as total_points
         FROM quiz_answers qa
         JOIN quiz_questions qq ON qa.question_id = qq.id
         WHERE qa.attempt_id = $1`,
        [attemptId]
      );

      const { earned_points, total_points } = scoreResult.rows[0];
      const score = total_points > 0 ? (earned_points / total_points) * 100 : 0;
      const isPassed = score >= attempt.passing_score;

      // Calculate time spent
      const timeSpent = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);

      // Update attempt
      const updatedAttempt = await client.query(
        `UPDATE quiz_attempts 
         SET completed_at = CURRENT_TIMESTAMP, score = $1, is_passed = $2, time_spent = $3
         WHERE id = $4
         RETURNING *`,
        [score, isPassed, timeSpent, attemptId]
      );

      // Log activity
      await client.query(
        `INSERT INTO user_activities (user_id, type, description, lesson_id) 
         SELECT $1, 'quiz_passed', 'Completó quiz: ' || q.title, q.lesson_id
         FROM quiz_attempts qa 
         JOIN quizzes q ON qa.quiz_id = q.id 
         WHERE qa.id = $2`,
        [userId, attemptId]
      );

      res.json({
        success: true,
        data: updatedAttempt.rows[0]
      });
    });
  } catch (error) {
    console.error('Complete quiz attempt error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

export const getQuizAttempts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const userId = req.user!.id;

    const result = await query(
      `SELECT qa.*, 
       json_agg(
         json_build_object(
           'question_id', qans.question_id,
           'answer', qans.answer,
           'is_correct', qans.is_correct,
           'points_earned', qans.points_earned,
           'question', qq.question,
           'correct_answer', qq.correct_answer,
           'explanation', qq.explanation
         ) ORDER BY qq.order_index
       ) as answers
       FROM quiz_attempts qa
       LEFT JOIN quiz_answers qans ON qa.id = qans.attempt_id
       LEFT JOIN quiz_questions qq ON qans.question_id = qq.id
       WHERE qa.quiz_id = $1 AND qa.user_id = $2
       GROUP BY qa.id
       ORDER BY qa.started_at DESC`,
      [quizId, userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};