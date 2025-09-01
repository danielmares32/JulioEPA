// Custom React hooks for API data fetching and state management

import { useState, useEffect, useCallback } from 'react';
import {
  Course,
  Lesson,
  Quiz,
  Assignment,
  ReadingMaterial,
  LessonProgress,
  QuizAttempt,
  AssignmentSubmission,
  ReadingProgress
} from '../../shared/types/database';
import {
  courseService,
  lessonService,
  quizService,
  assignmentService,
  readingService
} from '../services/api';

// Generic API hook for loading states and error handling
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useApiState<T>(): [ApiState<T>, (promise: Promise<any>) => Promise<T | null>] {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    refetch: async () => {},
  });

  const executeRequest = useCallback(async (promise: Promise<any>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await promise;
      if (response.success) {
        setState(prev => ({ ...prev, data: response.data, loading: false }));
        return response.data;
      } else {
        setState(prev => ({ ...prev, error: response.error || 'Unknown error', loading: false }));
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  const refetch = useCallback(async () => {
    // This will be set by individual hooks
  }, []);

  return [{ ...state, refetch }, executeRequest];
}

// Course hooks
export function useCourse(courseId: string) {
  const [state, executeRequest] = useApiState<Course & { modules: any[] }>();

  const loadCourse = useCallback(async () => {
    if (courseId) {
      await executeRequest(courseService.getCourseWithModules(courseId));
    }
  }, [courseId, executeRequest]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  return {
    ...state,
    refetch: loadCourse,
  };
}

export function useUserCourses() {
  const [state, executeRequest] = useApiState<any[]>();

  const loadCourses = useCallback(async () => {
    await executeRequest(courseService.getUserEnrollments());
  }, [executeRequest]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return {
    ...state,
    refetch: loadCourses,
  };
}

// Lesson progress hooks
export function useLessonProgress(lessonId: string) {
  const [state, executeRequest] = useApiState<LessonProgress>();

  const loadProgress = useCallback(async () => {
    if (lessonId) {
      await executeRequest(lessonService.getLessonProgress(lessonId));
    }
  }, [lessonId, executeRequest]);

  const updateProgress = useCallback(async (
    status: 'in_progress' | 'completed',
    progress: number,
    timeSpent: number
  ) => {
    if (lessonId) {
      return await executeRequest(lessonService.updateLessonProgress({
        lessonId,
        status,
        progress,
        timeSpent,
      }));
    }
    return null;
  }, [lessonId, executeRequest]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    ...state,
    updateProgress,
    refetch: loadProgress,
  };
}

// Quiz hooks
export function useQuiz(lessonId: string) {
  const [state, executeRequest] = useApiState<Quiz & { questions: any[] }>();

  const loadQuiz = useCallback(async () => {
    if (lessonId) {
      await executeRequest(quizService.getQuiz(lessonId));
    }
  }, [lessonId, executeRequest]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  return {
    ...state,
    refetch: loadQuiz,
  };
}

export function useQuizAttempt() {
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAttempt = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quizService.createQuizAttempt({ quizId });
      if (response.success) {
        setAttempt(response.data);
      } else {
        setError(response.error || 'Failed to start quiz');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (questionId: string, answer: any) => {
    if (!attempt) return;
    
    try {
      await quizService.submitQuizAnswer({
        attemptId: attempt.id,
        questionId,
        answer,
      });
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  }, [attempt]);

  const completeAttempt = useCallback(async () => {
    if (!attempt) return null;
    
    setLoading(true);
    
    try {
      const response = await quizService.completeQuizAttempt({ attemptId: attempt.id });
      if (response.success) {
        setAttempt(response.data);
        return response.data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete quiz');
    } finally {
      setLoading(false);
    }
    
    return null;
  }, [attempt]);

  return {
    attempt,
    loading,
    error,
    startAttempt,
    submitAnswer,
    completeAttempt,
  };
}

// Assignment hooks
export function useAssignment(lessonId: string) {
  const [state, executeRequest] = useApiState<Assignment & { resources: any[] }>();

  const loadAssignment = useCallback(async () => {
    if (lessonId) {
      await executeRequest(assignmentService.getAssignment(lessonId));
    }
  }, [lessonId, executeRequest]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  return {
    ...state,
    refetch: loadAssignment,
  };
}

export function useAssignmentSubmission(assignmentId: string) {
  const [state, executeRequest] = useApiState<AssignmentSubmission & { files: any[] }>();
  const [submitting, setSubmitting] = useState(false);

  const loadSubmission = useCallback(async () => {
    if (assignmentId) {
      await executeRequest(assignmentService.getAssignmentSubmission(assignmentId));
    }
  }, [assignmentId, executeRequest]);

  const submitAssignment = useCallback(async (files: File[], submissionText?: string) => {
    if (!assignmentId) return null;
    
    setSubmitting(true);
    
    try {
      const response = await assignmentService.createAssignmentSubmission({
        assignmentId,
        submissionText,
        files,
      });
      
      if (response.success) {
        await loadSubmission(); // Reload to get updated submission
        return response.data;
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (err) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [assignmentId, loadSubmission]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  return {
    ...state,
    submitting,
    submitAssignment,
    refetch: loadSubmission,
  };
}

// Reading material hooks
export function useReadingMaterial(lessonId: string) {
  const [state, executeRequest] = useApiState<ReadingMaterial>();

  const loadReading = useCallback(async () => {
    if (lessonId) {
      await executeRequest(readingService.getReadingMaterial(lessonId));
    }
  }, [lessonId, executeRequest]);

  useEffect(() => {
    loadReading();
  }, [loadReading]);

  return {
    ...state,
    refetch: loadReading,
  };
}

export function useReadingProgress(readingId: string) {
  const [state, executeRequest] = useApiState<ReadingProgress>();

  const loadProgress = useCallback(async () => {
    if (readingId) {
      await executeRequest(readingService.getReadingProgress(readingId));
    }
  }, [readingId, executeRequest]);

  const updateProgress = useCallback(async (
    progress: number,
    readingTime: number,
    lastPosition: number
  ) => {
    if (readingId) {
      return await executeRequest(readingService.updateReadingProgress({
        readingId,
        progress,
        readingTime,
        lastPosition,
      }));
    }
    return null;
  }, [readingId, executeRequest]);

  const toggleBookmark = useCallback(async () => {
    if (readingId) {
      return await executeRequest(readingService.toggleReadingBookmark(readingId));
    }
    return null;
  }, [readingId, executeRequest]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    ...state,
    updateProgress,
    toggleBookmark,
    refetch: loadProgress,
  };
}

// Dashboard hooks
export function useDashboardStats() {
  const [state, executeRequest] = useApiState<{
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalHoursSpent: number;
    recentActivities: any[];
    upcomingTasks: any[];
  }>();

  const loadStats = useCallback(async () => {
    await executeRequest(courseService.getCourseAnalytics('dashboard'));
  }, [executeRequest]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    ...state,
    refetch: loadStats,
  };
}