import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/database';

export const getCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT c.*, u.name as instructor_name 
       FROM courses c 
       LEFT JOIN users u ON c.instructor_id = u.id 
       WHERE c.is_published = true 
       ORDER BY c.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM courses WHERE is_published = true'
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT c.*, u.name as instructor_name 
       FROM courses c 
       LEFT JOIN users u ON c.instructor_id = u.id 
       WHERE c.id = $1 AND c.is_published = true`,
      [courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getCourseWithModules = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.id;

    // Get course data
    const courseResult = await query(
      `SELECT c.*, u.name as instructor_name 
       FROM courses c 
       LEFT JOIN users u ON c.instructor_id = u.id 
       WHERE c.id = $1 AND c.is_published = true`,
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const course = courseResult.rows[0];

    // Get modules with lessons
    const modulesResult = await query(
      `SELECT m.*, 
       json_agg(
         json_build_object(
           'id', l.id,
           'title', l.title,
           'description', l.description,
           'type', l.type,
           'duration', l.duration,
           'order_index', l.order_index,
           'video_url', l.video_url
         ) ORDER BY l.order_index
       ) as lessons
       FROM modules m 
       LEFT JOIN lessons l ON m.id = l.module_id AND l.is_published = true
       WHERE m.course_id = $1 AND m.is_published = true
       GROUP BY m.id 
       ORDER BY m.order_index`,
      [courseId]
    );

    course.modules = modulesResult.rows;

    // Get enrollment status
    const enrollmentResult = await query(
      'SELECT progress FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    course.is_enrolled = enrollmentResult.rows.length > 0;
    course.progress = enrollmentResult.rows[0]?.progress || 0;

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course with modules error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const enrollInCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.id;

    // Check if course exists
    const courseResult = await query(
      'SELECT id FROM courses WHERE id = $1 AND is_published = true',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    const result = await query(
      `INSERT INTO enrollments (user_id, course_id) 
       VALUES ($1, $2) 
       RETURNING id, enrolled_at, progress`,
      [userId, courseId]
    );

    // Update course students count
    await query(
      'UPDATE courses SET students_count = students_count + 1 WHERE id = $1',
      [courseId]
    );

    // Log activity
    await query(
      `INSERT INTO user_activities (user_id, type, description, course_id) 
       VALUES ($1, 'course_started', 'Se inscribió en el curso', $2)`,
      [userId, courseId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserEnrollments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT e.*, 
       json_build_object(
         'id', c.id,
         'title', c.title,
         'description', c.description,
         'thumbnail', c.thumbnail,
         'category', c.category,
         'level', c.level,
         'duration', c.duration,
         'rating', c.rating,
         'studentsCount', c.students_count,
         'instructor', json_build_object(
           'id', u.id,
           'name', u.name
         )
       ) as course
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE e.user_id = $1
       ORDER BY e.last_accessed_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get user enrollments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateLessonProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { status, progress, timeSpent } = req.body;
    const userId = req.user!.id;

    // Update or create lesson progress
    const result = await query(
      `INSERT INTO lesson_progress (user_id, lesson_id, status, progress, time_spent, started_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, 
         CASE WHEN $3 = 'in_progress' AND NOT EXISTS (
           SELECT 1 FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2
         ) THEN CURRENT_TIMESTAMP ELSE NULL END,
         CASE WHEN $3 = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
       )
       ON CONFLICT (user_id, lesson_id) 
       DO UPDATE SET 
         status = $3,
         progress = $4,
         time_spent = lesson_progress.time_spent + $5,
         completed_at = CASE WHEN $3 = 'completed' THEN CURRENT_TIMESTAMP ELSE lesson_progress.completed_at END,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, lessonId, status, progress, timeSpent]
    );

    // Update course enrollment progress
    await updateCourseProgress(userId, lessonId);

    // Log activity if completed
    if (status === 'completed') {
      const lessonResult = await query(
        'SELECT title, module_id FROM lessons WHERE id = $1',
        [lessonId]
      );
      
      if (lessonResult.rows.length > 0) {
        const lesson = lessonResult.rows[0];
        const moduleResult = await query(
          'SELECT course_id FROM modules WHERE id = $1',
          [lesson.module_id]
        );
        
        if (moduleResult.rows.length > 0) {
          await query(
            `INSERT INTO user_activities (user_id, type, description, course_id, lesson_id) 
             VALUES ($1, 'lesson_completed', $2, $3, $4)`,
            [userId, `Completó la lección: ${lesson.title}`, moduleResult.rows[0].course_id, lessonId]
          );
        }
      }
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update lesson progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getLessonProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user!.id;

    const result = await query(
      'SELECT * FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2',
      [userId, lessonId]
    );

    if (result.rows.length === 0) {
      // Return default progress
      return res.json({
        success: true,
        data: {
          user_id: userId,
          lesson_id: lessonId,
          status: 'not_started',
          progress: 0,
          time_spent: 0
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get lesson progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Helper function to update course progress
async function updateCourseProgress(userId: string, lessonId: string) {
  try {
    // Get course ID from lesson
    const courseQuery = await query(
      `SELECT m.course_id 
       FROM lessons l 
       JOIN modules m ON l.module_id = m.id 
       WHERE l.id = $1`,
      [lessonId]
    );

    if (courseQuery.rows.length === 0) return;

    const courseId = courseQuery.rows[0].course_id;

    // Calculate overall course progress
    const progressQuery = await query(
      `SELECT 
         COUNT(l.id) as total_lessons,
         COUNT(CASE WHEN lp.status = 'completed' THEN 1 END) as completed_lessons
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = $1
       WHERE m.course_id = $2 AND l.is_published = true`,
      [userId, courseId]
    );

    const { total_lessons, completed_lessons } = progressQuery.rows[0];
    const progress = total_lessons > 0 ? (completed_lessons / total_lessons) * 100 : 0;

    // Update enrollment progress
    await query(
      `UPDATE enrollments 
       SET progress = $1, 
           last_accessed_at = CURRENT_TIMESTAMP,
           completed_at = CASE WHEN $1 = 100 THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE user_id = $2 AND course_id = $3`,
      [progress, userId, courseId]
    );
  } catch (error) {
    console.error('Update course progress error:', error);
  }
}

export const getDashboardAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get user's enrollments count
    const enrollmentsResult = await query(
      'SELECT COUNT(*) as count FROM enrollments WHERE user_id = $1',
      [userId]
    );

    // Get user's completed courses count
    const completedCoursesResult = await query(
      'SELECT COUNT(*) as count FROM enrollments WHERE user_id = $1 AND progress = 100',
      [userId]
    );

    // Get user's total study time (in minutes)
    const studyTimeResult = await query(
      'SELECT COALESCE(SUM(time_spent), 0) as total FROM lesson_progress WHERE user_id = $1',
      [userId]
    );

    // Get user's current streak and achievements
    const activitiesResult = await query(
      `SELECT COUNT(*) as activities_count 
       FROM user_activities 
       WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );

    // Get recent course progress
    const recentProgressResult = await query(
      `SELECT 
         c.id, 
         c.title, 
         c.thumbnail,
         e.progress,
         e.last_accessed_at
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1 AND e.progress < 100
       ORDER BY e.last_accessed_at DESC
       LIMIT 3`,
      [userId]
    );

    const analytics = {
      enrolledCourses: parseInt(enrollmentsResult.rows[0].count),
      completedCourses: parseInt(completedCoursesResult.rows[0].count),
      totalStudyTime: parseInt(studyTimeResult.rows[0].total),
      weeklyActivities: parseInt(activitiesResult.rows[0].activities_count),
      recentProgress: recentProgressResult.rows
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};