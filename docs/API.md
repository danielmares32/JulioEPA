# API Documentation

## Base URL
```
http://localhost:3001/api  # Development
https://api.uaa.edu.mx/api # Production
```

## Authentication

All API requests require JWT authentication except for login endpoints.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Authentication Endpoints

### POST /auth/login
Login with institutional credentials.

**Request:**
```json
{
  "email": "carlos.martinez@edu.uaa.mx",
  "password": "password123",
  "rememberMe": true
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "carlos.martinez@edu.uaa.mx",
    "name": "Carlos Martínez",
    "role": "student"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### POST /auth/refresh
Refresh expired access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /auth/me
Get current user profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "carlos.martinez@edu.uaa.mx",
  "name": "Carlos Martínez",
  "role": "student",
  "avatar": "/uploads/avatars/carlos.jpg"
}
```

## Course Management

### GET /courses
List all available courses with optional filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search term
- `category` (string): Course category
- `level` (string): Difficulty level

**Response:**
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "Programación en JavaScript",
      "description": "Curso completo de JavaScript moderno",
      "instructor": "Dr. Ana García",
      "category": "Programación",
      "level": "Intermedio",
      "duration": "40 horas",
      "price": 2500,
      "currency": "MXN",
      "rating": 4.8,
      "enrolled": 1250,
      "thumbnail": "/images/courses/javascript.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### GET /courses/:id
Get specific course details with modules and content.

**Response:**
```json
{
  "id": "uuid",
  "title": "Programación en JavaScript",
  "description": "Curso completo...",
  "modules": [
    {
      "id": "uuid",
      "title": "Fundamentos",
      "order": 1,
      "lessons": [
        {
          "id": "uuid",
          "title": "Variables y tipos de datos",
          "type": "video",
          "duration": 900,
          "completed": false
        }
      ]
    }
  ],
  "progress": {
    "completed": 8,
    "total": 32,
    "percentage": 25
  }
}
```

### POST /courses/:id/enroll
Enroll in a course.

**Response:**
```json
{
  "success": true,
  "enrollment": {
    "courseId": "uuid",
    "enrolledAt": "2024-01-15T10:30:00Z",
    "progress": 0
  }
}
```

### GET /courses/enrollments/me
Get user's enrolled courses with progress.

**Response:**
```json
{
  "enrollments": [
    {
      "course": {
        "id": "uuid",
        "title": "Programación en JavaScript",
        "thumbnail": "/images/courses/javascript.jpg"
      },
      "progress": {
        "percentage": 75,
        "lastAccessed": "2024-01-20T14:20:00Z"
      },
      "enrolledAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Learning Content

### GET /courses/:courseId/lessons/:lessonId
Get lesson content and mark as accessed.

**Response:**
```json
{
  "id": "uuid",
  "title": "Variables y tipos de datos",
  "type": "video",
  "content": {
    "videoUrl": "/videos/lesson-1.mp4",
    "transcript": "En esta lección veremos...",
    "resources": [
      {
        "title": "Código de ejemplo",
        "url": "/downloads/example-1.js"
      }
    ]
  },
  "progress": {
    "completed": false,
    "timeSpent": 450
  }
}
```

### POST /courses/:courseId/lessons/:lessonId/progress
Update lesson progress.

**Request:**
```json
{
  "timeSpent": 900,
  "completed": true,
  "position": 850
}
```

## Quiz System

### GET /courses/:courseId/quizzes/:quizId
Get quiz questions and configuration.

**Response:**
```json
{
  "id": "uuid",
  "title": "Evaluación Módulo 1",
  "description": "Quiz sobre fundamentos",
  "timeLimit": 1800,
  "passingScore": 80,
  "maxAttempts": 3,
  "questions": [
    {
      "id": "uuid",
      "question": "¿Cuál es la diferencia entre let y var?",
      "type": "multiple-choice",
      "options": [
        "No hay diferencia",
        "let tiene scope de bloque",
        "var es más moderno",
        "let es más rápido"
      ],
      "points": 10
    }
  ],
  "attempts": {
    "used": 1,
    "remaining": 2,
    "bestScore": 85
  }
}
```

### POST /courses/:courseId/quizzes/:quizId/submit
Submit quiz answers.

**Request:**
```json
{
  "answers": [
    {
      "questionId": "uuid",
      "answer": 1
    }
  ],
  "timeSpent": 1200
}
```

**Response:**
```json
{
  "score": 85,
  "passed": true,
  "feedback": [
    {
      "questionId": "uuid",
      "correct": true,
      "explanation": "Correcto, let tiene scope de bloque..."
    }
  ],
  "attempt": {
    "number": 2,
    "score": 85,
    "completedAt": "2024-01-20T15:30:00Z"
  }
}
```

## Assignment System

### GET /courses/:courseId/assignments/:assignmentId
Get assignment details and submission status.

**Response:**
```json
{
  "id": "uuid",
  "title": "Proyecto Final - ToDo App",
  "description": "Crear una aplicación...",
  "dueDate": "2024-02-15T23:59:59Z",
  "maxPoints": 100,
  "allowedFileTypes": [".js", ".html", ".css", ".zip"],
  "maxFileSize": 10485760,
  "submission": {
    "status": "submitted",
    "submittedAt": "2024-02-10T18:20:00Z",
    "files": [
      {
        "name": "todo-app.zip",
        "size": 2048576,
        "url": "/uploads/assignments/todo-app.zip"
      }
    ],
    "grade": 95,
    "feedback": "Excelente trabajo..."
  }
}
```

### POST /courses/:courseId/assignments/:assignmentId/submit
Submit assignment files.

**Request (multipart/form-data):**
```
files: [File objects]
comments: "Comentarios adicionales sobre la entrega"
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "id": "uuid",
    "submittedAt": "2024-02-10T18:20:00Z",
    "files": [
      {
        "name": "todo-app.zip",
        "size": 2048576,
        "url": "/uploads/assignments/todo-app.zip"
      }
    ]
  }
}
```

## Reading Materials

### GET /courses/:courseId/readings/:readingId
Get reading material with progress tracking.

**Response:**
```json
{
  "id": "uuid",
  "title": "Fundamentos de Algoritmos",
  "content": "# Capítulo 1\n\nLos algoritmos son...",
  "estimatedTime": 1800,
  "progress": {
    "position": 0.65,
    "timeSpent": 1200,
    "completed": false,
    "bookmarks": [
      {
        "position": 0.3,
        "note": "Revisar este concepto",
        "createdAt": "2024-01-18T14:30:00Z"
      }
    ]
  }
}
```

### POST /courses/:courseId/readings/:readingId/progress
Update reading progress and bookmarks.

**Request:**
```json
{
  "position": 0.75,
  "timeSpent": 1500,
  "completed": false,
  "bookmarks": [
    {
      "position": 0.3,
      "note": "Concepto importante"
    }
  ]
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "value": null
    }
  }
}
```

## Rate Limiting

- **General**: 100 requests per 15 minutes
- **Login**: 5 attempts per 15 minutes
- **File Upload**: 10 uploads per hour

## Response Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **429**: Too Many Requests
- **500**: Internal Server Error