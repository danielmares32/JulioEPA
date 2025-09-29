// API Service Layer for Database Communication

import {
  Course,
  Module,
  Lesson,
  Quiz,
  QuizAttempt,
  Assignment,
  AssignmentSubmission,
  ReadingMaterial,
  LessonProgress,
  ReadingProgress,
  ApiResponse,
  PaginatedResponse,
  CreateQuizAttemptRequest,
  SubmitQuizAnswerRequest,
  CompleteQuizAttemptRequest,
  CreateAssignmentSubmissionRequest,
  UpdateReadingProgressRequest,
  UpdateLessonProgressRequest,
  Enrollment
} from '../../shared/types/database';

// Base API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.aulavirtual.uaa.mx' 
  : 'http://85.31.235.51:3001/api';

// Base URL for assets (without /api suffix)
export const ASSETS_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.aulavirtual.uaa.mx' 
  : 'http://85.31.235.51:3001';

// Helper function to get proper image URLs
export const getImageUrl = (imagePath: string) => {
  if (!imagePath) return `${ASSETS_BASE_URL}/images/default-course.jpg`;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return `${ASSETS_BASE_URL}${imagePath}`;
  return `${ASSETS_BASE_URL}/${imagePath}`;
};

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{user: any, token: string}>> {
    const response = await this.request<{user: any, token: string}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Course Services
  async getCourses(page = 1, limit = 20): Promise<PaginatedResponse<Course>> {
    return this.request<Course[]>(`/courses?page=${page}&limit=${limit}`);
  }

  async getCourse(courseId: string): Promise<ApiResponse<Course>> {
    return this.request<Course>(`/courses/${courseId}`);
  }

  async getCourseWithModules(courseId: string): Promise<ApiResponse<Course & { modules: (Module & { lessons: Lesson[] })[] }>> {
    return this.request<Course & { modules: (Module & { lessons: Lesson[] })[] }>(`/courses/${courseId}/modules`);
  }

  async enrollInCourse(courseId: string): Promise<ApiResponse<Enrollment>> {
    return this.request<Enrollment>(`/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  async getUserEnrollments(): Promise<ApiResponse<(Enrollment & { course: Course })[]>> {
    return this.request<(Enrollment & { course: Course })[]>('/enrollments');
  }

  // Lesson Progress Services
  async getLessonProgress(lessonId: string): Promise<ApiResponse<LessonProgress>> {
    return this.request<LessonProgress>(`/courses/lessons/${lessonId}/progress`);
  }

  async updateLessonProgress(request: UpdateLessonProgressRequest): Promise<ApiResponse<LessonProgress>> {
    return this.request<LessonProgress>(`/courses/lessons/${request.lessonId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  // Quiz Services
  async getQuiz(lessonId: string): Promise<ApiResponse<Quiz & { questions: any[] }>> {
    return this.request<Quiz & { questions: any[] }>(`/lessons/${lessonId}/quiz`);
  }

  async createQuizAttempt(request: CreateQuizAttemptRequest): Promise<ApiResponse<QuizAttempt>> {
    return this.request<QuizAttempt>('/quiz-attempts', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async submitQuizAnswer(request: SubmitQuizAnswerRequest): Promise<ApiResponse<void>> {
    return this.request<void>(`/quiz-attempts/${request.attemptId}/answers`, {
      method: 'POST',
      body: JSON.stringify({
        questionId: request.questionId,
        answer: request.answer,
      }),
    });
  }

  async completeQuizAttempt(request: CompleteQuizAttemptRequest): Promise<ApiResponse<QuizAttempt>> {
    return this.request<QuizAttempt>(`/quiz-attempts/${request.attemptId}/complete`, {
      method: 'POST',
    });
  }

  async getQuizAttempts(quizId: string): Promise<ApiResponse<QuizAttempt[]>> {
    return this.request<QuizAttempt[]>(`/quizzes/${quizId}/attempts`);
  }

  // Assignment Services
  async getAssignment(lessonId: string): Promise<ApiResponse<Assignment & { resources: any[] }>> {
    return this.request<Assignment & { resources: any[] }>(`/lessons/${lessonId}/assignment`);
  }

  async createAssignmentSubmission(request: CreateAssignmentSubmissionRequest): Promise<ApiResponse<AssignmentSubmission>> {
    const formData = new FormData();
    formData.append('assignmentId', request.assignmentId);
    
    if (request.submissionText) {
      formData.append('submissionText', request.submissionText);
    }

    request.files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    return this.request<AssignmentSubmission>('/assignment-submissions', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async getAssignmentSubmission(assignmentId: string): Promise<ApiResponse<AssignmentSubmission & { files: any[] }>> {
    return this.request<AssignmentSubmission & { files: any[] }>(`/assignments/${assignmentId}/submission`);
  }

  // Reading Material Services
  async getReadingMaterial(lessonId: string): Promise<ApiResponse<ReadingMaterial>> {
    return this.request<ReadingMaterial>(`/lessons/${lessonId}/reading`);
  }

  async updateReadingProgress(request: UpdateReadingProgressRequest): Promise<ApiResponse<ReadingProgress>> {
    return this.request<ReadingProgress>(`/reading/${request.readingId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({
        progress: request.progress,
        readingTime: request.readingTime,
        lastPosition: request.lastPosition,
      }),
    });
  }

  async getReadingProgress(readingId: string): Promise<ApiResponse<ReadingProgress>> {
    return this.request<ReadingProgress>(`/reading/${readingId}/progress`);
  }

  async toggleReadingBookmark(readingId: string): Promise<ApiResponse<ReadingProgress>> {
    return this.request<ReadingProgress>(`/reading/${readingId}/bookmark`, {
      method: 'POST',
    });
  }

  // File Services
  async downloadFile(url: string): Promise<Blob> {
    const response = await fetch(url, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }
    
    return response.blob();
  }

  // Analytics and Stats
  async getCourseAnalytics(courseId: string): Promise<ApiResponse<{
    totalLessons: number;
    completedLessons: number;
    averageQuizScore: number;
    timeSpent: number;
    lastAccessedAt: string;
  }>> {
    return this.request(`/courses/${courseId}/analytics`);
  }

  async getUserDashboardStats(): Promise<ApiResponse<{
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalHoursSpent: number;
    recentActivities: any[];
    upcomingTasks: any[];
  }>> {
    return this.request('/dashboard/stats');
  }
}

// Create singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Convenience functions
export const courseService = {
  getCourses: apiClient.getCourses.bind(apiClient),
  getCourse: apiClient.getCourse.bind(apiClient),
  getCourseWithModules: apiClient.getCourseWithModules.bind(apiClient),
  enrollInCourse: apiClient.enrollInCourse.bind(apiClient),
  getUserEnrollments: apiClient.getUserEnrollments.bind(apiClient),
  getCourseAnalytics: apiClient.getCourseAnalytics.bind(apiClient),
};

export const lessonService = {
  getLessonProgress: apiClient.getLessonProgress.bind(apiClient),
  updateLessonProgress: apiClient.updateLessonProgress.bind(apiClient),
};

export const quizService = {
  getQuiz: apiClient.getQuiz.bind(apiClient),
  createQuizAttempt: apiClient.createQuizAttempt.bind(apiClient),
  submitQuizAnswer: apiClient.submitQuizAnswer.bind(apiClient),
  completeQuizAttempt: apiClient.completeQuizAttempt.bind(apiClient),
  getQuizAttempts: apiClient.getQuizAttempts.bind(apiClient),
};

export const assignmentService = {
  getAssignment: apiClient.getAssignment.bind(apiClient),
  createAssignmentSubmission: apiClient.createAssignmentSubmission.bind(apiClient),
  getAssignmentSubmission: apiClient.getAssignmentSubmission.bind(apiClient),
};

export const readingService = {
  getReadingMaterial: apiClient.getReadingMaterial.bind(apiClient),
  updateReadingProgress: apiClient.updateReadingProgress.bind(apiClient),
  getReadingProgress: apiClient.getReadingProgress.bind(apiClient),
  toggleReadingBookmark: apiClient.toggleReadingBookmark.bind(apiClient),
};