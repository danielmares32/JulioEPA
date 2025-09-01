#!/usr/bin/env tsx

import { query } from '../config/database';

async function resetDatabase() {
  try {
    console.log('🗑️  Dropping all tables...');
    
    // Drop all tables (order matters due to foreign keys)
    const dropQueries = [
      'DROP TABLE IF EXISTS user_activities CASCADE',
      'DROP TABLE IF EXISTS reading_progress CASCADE',
      'DROP TABLE IF EXISTS reading_materials CASCADE', 
      'DROP TABLE IF EXISTS assignment_files CASCADE',
      'DROP TABLE IF EXISTS assignment_submissions CASCADE',
      'DROP TABLE IF EXISTS assignment_resources CASCADE',
      'DROP TABLE IF EXISTS assignments CASCADE',
      'DROP TABLE IF EXISTS quiz_answers CASCADE',
      'DROP TABLE IF EXISTS quiz_attempts CASCADE',
      'DROP TABLE IF EXISTS quiz_questions CASCADE',
      'DROP TABLE IF EXISTS quizzes CASCADE',
      'DROP TABLE IF EXISTS lesson_progress CASCADE',
      'DROP TABLE IF EXISTS lessons CASCADE',
      'DROP TABLE IF EXISTS modules CASCADE',
      'DROP TABLE IF EXISTS enrollments CASCADE',
      'DROP TABLE IF EXISTS courses CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
      'DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE',
    ];
    
    for (const dropQuery of dropQueries) {
      await query(dropQuery);
    }
    
    console.log('✅ All tables dropped successfully');
    
    console.log('🔄 Run "npm run migrate" to recreate the schema');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();