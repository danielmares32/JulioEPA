import bcrypt from 'bcrypt';
import { query } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create users
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const adminResult = await query(
      `INSERT INTO users (email, name, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET 
         name = EXCLUDED.name, 
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role
       RETURNING *`,
      ['admin@uaa.mx', 'Administrador UAA', hashedPassword, 'admin']
    );

    const instructorResult = await query(
      `INSERT INTO users (email, name, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET 
         name = EXCLUDED.name, 
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role
       RETURNING *`,
      ['instructor@uaa.mx', 'Dr. María González', hashedPassword, 'instructor']
    );

    const studentResult = await query(
      `INSERT INTO users (email, name, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET 
         name = EXCLUDED.name, 
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role
       RETURNING *`,
      ['estudiante@uaa.mx', 'Juan Pérez Estudiante', hashedPassword, 'student']
    );

    const adminId = adminResult.rows[0].id;
    const instructorId = instructorResult.rows[0].id;
    const studentId = studentResult.rows[0].id;

    // Define categories (as strings since courses table uses category varchar)
    console.log('📂 Setting up categories...');
    const categories = [
      'Ingeniería de Software',
      'Bases de Datos', 
      'Redes y Comunicaciones',
      'Inteligencia Artificial'
    ];

    // Create courses
    console.log('📚 Creating courses...');
    const coursesData = [
      {
        title: 'Desarrollo Web Full Stack',
        description: 'Aprende a desarrollar aplicaciones web completas utilizando tecnologías modernas como React, Node.js y bases de datos relacionales.',
        instructor_id: instructorId,
        category: categories[0],
        level: 'Intermedio',
        duration: 120,
        price: 599.00,
        thumbnail: '/images/courses/default-course.png'
      },
      {
        title: 'Diseño de Bases de Datos Avanzado',
        description: 'Domina el diseño y optimización de bases de datos relacionales y NoSQL para aplicaciones empresariales.',
        instructor_id: instructorId,
        category: categories[1],
        level: 'Avanzado',
        duration: 80,
        price: 459.00,
        thumbnail: '/images/courses/default-course.png'
      },
      {
        title: 'Redes de Computadoras',
        description: 'Fundamentos y configuración de redes TCP/IP, protocolos de comunicación y seguridad de redes.',
        instructor_id: instructorId,
        category: categories[2],
        level: 'Intermedio',
        duration: 100,
        price: 399.00,
        thumbnail: '/images/courses/default-course.png'
      }
    ];

    const coursePromises = coursesData.map(course => 
      query(
        `INSERT INTO courses (title, description, instructor_id, category, level, duration, price, thumbnail, is_published) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) 
         RETURNING *`,
        [course.title, course.description, course.instructor_id, course.category, 
         course.level, course.duration, course.price, course.thumbnail]
      )
    );

    const courseResults = await Promise.all(coursePromises);
    const courses = courseResults.map(result => result.rows[0]);

    // Create modules and lessons for the first course
    console.log('📝 Creating modules and lessons...');
    const fullStackCourse = courses[0];
    
    const modulesData = [
      { title: 'Introducción al Desarrollo Web', description: 'Conceptos fundamentales del desarrollo web', order_index: 1 },
      { title: 'Frontend con React', description: 'Desarrollo de interfaces de usuario con React', order_index: 2 },
      { title: 'Backend con Node.js', description: 'Desarrollo de APIs y servicios backend', order_index: 3 },
      { title: 'Base de Datos', description: 'Integración con bases de datos', order_index: 4 }
    ];

    const modulePromises = modulesData.map(module => 
      query(
        `INSERT INTO modules (course_id, title, description, order_index) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [fullStackCourse.id, module.title, module.description, module.order_index]
      )
    );

    const moduleResults = await Promise.all(modulePromises);
    const modules = moduleResults.map(result => result.rows[0]);

    // Create lessons for the first module
    const lessonsData = [
      {
        title: 'HTML y CSS Básico',
        description: 'Introducción a los lenguajes de marcado y estilos web',
        type: 'video',
        video_url: 'https://example.com/videos/html-css-basic',
        duration: 45,
        order_index: 1
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'Conceptos básicos del lenguaje JavaScript',
        type: 'video',
        video_url: 'https://example.com/videos/js-fundamentals',
        duration: 60,
        order_index: 2
      },
      {
        title: 'Responsive Design',
        description: 'Diseño web adaptable a diferentes dispositivos',
        type: 'video',
        video_url: 'https://example.com/videos/responsive-design',
        duration: 40,
        order_index: 3
      }
    ];

    const lessonPromises = lessonsData.map(lesson => 
      query(
        `INSERT INTO lessons (module_id, title, description, type, video_url, duration, order_index) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [modules[0].id, lesson.title, lesson.description, lesson.type, lesson.video_url, lesson.duration, lesson.order_index]
      )
    );

    const lessonResults = await Promise.all(lessonPromises);
    const lessons = lessonResults.map(result => result.rows[0]);

    // Create a quiz for the first lesson
    console.log('🧭 Creating quizzes...');
    const quizResult = await query(
      `INSERT INTO quizzes (lesson_id, title, description, passing_score, attempts, time_limit) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [lessons[0].id, 'Quiz: HTML y CSS Básico', 'Evalúa tu conocimiento sobre HTML y CSS', 70, 3, 600]
    );

    const quiz = quizResult.rows[0];

    // Create quiz questions
    const questionsData = [
      {
        type: 'multiple-choice',
        question: '¿Cuál es la etiqueta HTML correcta para crear un párrafo?',
        options: JSON.stringify(['<p>', '<paragraph>', '<para>', '<text>']),
        correct_answer: '0',
        points: 10,
        order_index: 1
      },
      {
        type: 'true-false',
        question: 'CSS significa "Cascading Style Sheets"',
        options: JSON.stringify(['Verdadero', 'Falso']),
        correct_answer: 'true',
        points: 10,
        order_index: 2
      },
      {
        type: 'short-answer',
        question: '¿Qué propiedad CSS se usa para cambiar el color de texto?',
        options: null,
        correct_answer: 'color',
        points: 15,
        order_index: 3,
        explanation: 'La propiedad "color" se utiliza para establecer el color del texto en CSS.'
      }
    ];

    const questionPromises = questionsData.map(question => 
      query(
        `INSERT INTO quiz_questions (quiz_id, type, question, options, correct_answer, points, order_index, explanation) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [quiz.id, question.type, question.question, question.options, 
         question.correct_answer, question.points, question.order_index, question.explanation]
      )
    );

    await Promise.all(questionPromises);

    // Create an assignment for the second lesson
    console.log('📋 Creating assignments...');
    const assignmentResult = await query(
      `INSERT INTO assignments (lesson_id, title, description, instructions, due_date, max_files) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [lessons[1].id, 'Práctica JavaScript', 'Ejercicios básicos de JavaScript',
       JSON.stringify(['Resuelve los ejercicios propuestos y sube tu código en un archivo .js']),
       new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 3] // Due in 7 days
    );

    // Create reading material for the third lesson
    console.log('📖 Creating reading materials...');
    const readingResult = await query(
      `INSERT INTO reading_materials (lesson_id, title, content, estimated_read_time) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [lessons[2].id, 'Guía de Responsive Design', 
       'El diseño responsive es una técnica de diseño web que permite que las páginas web se adapten a diferentes tamaños de pantalla...', 
       15]
    );

    const reading = readingResult.rows[0];

    // Enroll the student in the course
    console.log('🎓 Creating enrollments...');
    await query(
      `INSERT INTO enrollments (user_id, course_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [studentId, fullStackCourse.id]
    );

    // Create some lesson progress
    console.log('📈 Creating progress records...');
    await query(
      `INSERT INTO lesson_progress (user_id, lesson_id, status, progress, completed_at, time_spent) 
       VALUES ($1, $2, 'completed', 100.0, CURRENT_TIMESTAMP, 45)`,
      [studentId, lessons[0].id]
    );

    // Create a quiz attempt
    const attemptResult = await query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, attempt_number, started_at) 
       VALUES ($1, $2, 1, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [studentId, quiz.id]
    );

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Created:');
    console.log('  - 3 users (admin, instructor, student)');
    console.log('  - 4 categories');
    console.log('  - 3 courses');
    console.log('  - 4 modules');
    console.log('  - 3 lessons');
    console.log('  - 1 quiz with 3 questions');
    console.log('  - 1 assignment');
    console.log('  - 1 reading material');
    console.log('  - Student enrollment and progress');
    console.log('');
    console.log('🔑 Test credentials:');
    console.log('  Admin: admin@uaa.mx / password123');
    console.log('  Instructor: instructor@uaa.mx / password123');
    console.log('  Student: estudiante@uaa.mx / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };