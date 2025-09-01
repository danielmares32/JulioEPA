import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query, transaction } from '../config/database';

export const getReadingMaterial = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lessonId } = req.params;

    // Get reading materials for lesson
    const result = await query(
      `SELECT rm.*, 
       json_agg(
         json_build_object(
           'id', rmr.id,
           'title', rmr.title,
           'url', rmr.url,
           'type', rmr.type,
           'order_index', rmr.order_index
         ) ORDER BY rmr.order_index
       ) FILTER (WHERE rmr.id IS NOT NULL) as resources
       FROM reading_materials rm
       LEFT JOIN reading_material_resources rmr ON rm.id = rmr.reading_material_id
       WHERE rm.lesson_id = $1 AND rm.is_published = true
       GROUP BY rm.id`,
      [lessonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reading material not found for this lesson'
      });
    }

    const readingMaterial = result.rows[0];
    readingMaterial.resources = readingMaterial.resources || [];

    res.json({
      success: true,
      data: readingMaterial
    });
  } catch (error) {
    console.error('Get reading material error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateReadingProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { timeSpent, isCompleted } = req.body;
    const userId = req.user!.id;

    // Validate input
    if (typeof timeSpent !== 'number' || timeSpent < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time spent value'
      });
    }

    await transaction(async (client) => {
      // Get or create reading progress
      const existingProgress = await client.query(
        'SELECT * FROM reading_progress WHERE user_id = $1 AND lesson_id = $2',
        [userId, lessonId]
      );

      let progressResult;
      
      if (existingProgress.rows.length === 0) {
        // Create new progress
        progressResult = await client.query(
          `INSERT INTO reading_progress (user_id, lesson_id, time_spent, is_completed, last_accessed_at) 
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
           RETURNING *`,
          [userId, lessonId, timeSpent, isCompleted || false]
        );
      } else {
        // Update existing progress
        const currentTimeSpent = existingProgress.rows[0].time_spent || 0;
        progressResult = await client.query(
          `UPDATE reading_progress 
           SET time_spent = $3, is_completed = $4, last_accessed_at = CURRENT_TIMESTAMP
           WHERE user_id = $1 AND lesson_id = $2
           RETURNING *`,
          [userId, lessonId, currentTimeSpent + timeSpent, isCompleted || existingProgress.rows[0].is_completed]
        );
      }

      const progress = progressResult.rows[0];

      // Log activity if completed for the first time
      if (isCompleted && !existingProgress.rows[0]?.is_completed) {
        await client.query(
          `INSERT INTO user_activities (user_id, type, description, lesson_id) 
           SELECT $1, 'reading_completed', 'Completó material de lectura: ' || l.title, $2
           FROM lessons l 
           WHERE l.id = $2`,
          [userId, lessonId]
        );
      }

      res.json({
        success: true,
        data: progress
      });
    });
  } catch (error) {
    console.error('Update reading progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getReadingProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user!.id;

    const result = await query(
      'SELECT * FROM reading_progress WHERE user_id = $1 AND lesson_id = $2',
      [userId, lessonId]
    );

    if (result.rows.length === 0) {
      // Return default progress
      return res.json({
        success: true,
        data: {
          user_id: userId,
          lesson_id: lessonId,
          time_spent: 0,
          is_completed: false,
          last_accessed_at: null
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get reading progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserReadingStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT 
         COUNT(*) as total_readings,
         COUNT(*) FILTER (WHERE is_completed = true) as completed_readings,
         SUM(time_spent) as total_time_spent,
         AVG(time_spent) FILTER (WHERE is_completed = true) as avg_completion_time
       FROM reading_progress 
       WHERE user_id = $1`,
      [userId]
    );

    const stats = result.rows[0];
    
    // Convert to more readable format
    const statistics = {
      total_readings: parseInt(stats.total_readings) || 0,
      completed_readings: parseInt(stats.completed_readings) || 0,
      completion_rate: stats.total_readings > 0 ? 
        ((parseInt(stats.completed_readings) || 0) / parseInt(stats.total_readings)) * 100 : 0,
      total_time_spent: parseInt(stats.total_time_spent) || 0,
      avg_completion_time: parseFloat(stats.avg_completion_time) || 0
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get reading statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};