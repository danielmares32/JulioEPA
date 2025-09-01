// Database Models and Types

// User and Enrollment Models
export interface User {
  id: string;
  email: string;
  name: string;
  studentId?: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructor?: User;
  thumbnail: string;
  category: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  duration: number; // in seconds
  rating: number;
  studentsCount: number;
  isPublished: boolean;
  price: number; // 0 for free courses
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progress: number; // 0-100
  lastAccessedAt: string;
}

// Course Content Models
export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  order: number;
  duration: number; // in seconds
  isPublished: boolean;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  timeSpent: number; // in seconds
}

// Quiz Models
export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  timeLimit?: number; // in minutes, null for unlimited
  attempts: number; // max attempts allowed
  passingScore: number; // 0-100
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | number | boolean;
  explanation?: string;
  points: number;
  order: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  isPassed?: boolean;
  timeSpent?: number; // in seconds
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string | number | boolean;
  isCorrect: boolean;
  pointsEarned: number;
}

// Assignment Models
export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  instructions: string[];
  dueDate?: string;
  maxScore: number;
  allowedFileTypes: string[];
  maxFileSize: number; // in MB
  maxFiles: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentResource {
  id: string;
  assignmentId: string;
  name: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  userId: string;
  assignmentId: string;
  submissionText?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface AssignmentFile {
  id: string;
  submissionId: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

// Reading Material Models
export interface ReadingMaterial {
  id: string;
  lessonId: string;
  title: string;
  author?: string;
  content: string;
  estimatedReadTime: number; // in minutes
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  readingId: string;
  progress: number; // 0-100 based on scroll position
  readingTime: number; // in seconds
  isBookmarked: boolean;
  lastPosition: number; // scroll position
  completedAt?: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface CreateQuizAttemptRequest {
  quizId: string;
}

export interface SubmitQuizAnswerRequest {
  attemptId: string;
  questionId: string;
  answer: string | number | boolean;
}

export interface CompleteQuizAttemptRequest {
  attemptId: string;
}

export interface CreateAssignmentSubmissionRequest {
  assignmentId: string;
  submissionText?: string;
  files: File[];
}

export interface UpdateReadingProgressRequest {
  readingId: string;
  progress: number;
  readingTime: number;
  lastPosition: number;
}

export interface UpdateLessonProgressRequest {
  lessonId: string;
  status: 'in_progress' | 'completed';
  progress: number;
  timeSpent: number;
}