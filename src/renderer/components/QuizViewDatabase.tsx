// Updated QuizView component that uses API data and real quiz attempts

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Trophy, 
  Target,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '../hooks/useLanguage';
import { useQuizAttempt } from '../hooks/useApi';
import { LoadingSpinner, ErrorMessage } from './ErrorBoundary';
import { Quiz, QuizQuestion } from '../../shared/types/database';
import styles from './QuizView.module.css';

interface QuizViewDatabaseProps {
  quiz: Quiz & { questions: QuizQuestion[] };
  onComplete: (score: number, passed: boolean) => void;
  onExit: () => void;
}

export function QuizViewDatabase({ quiz, onComplete, onExit }: QuizViewDatabaseProps) {
  const { t } = useTranslation();
  const {
    attempt,
    loading,
    error,
    startAttempt,
    submitAnswer,
    completeAttempt
  } = useQuizAttempt();

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: any }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Timer effect
  useEffect(() => {
    if (quizStarted && quiz.timeLimit && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            handleCompleteQuiz(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeLeft, quiz.timeLimit]);

  // Initialize timer when quiz starts
  useEffect(() => {
    if (attempt && quiz.timeLimit && !quizStarted) {
      setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
      setQuizStarted(true);
    }
  }, [attempt, quiz.timeLimit, quizStarted]);

  const handleStartQuiz = async () => {
    try {
      await startAttempt(quiz.id);
    } catch (err) {
      console.error('Failed to start quiz:', err);
    }
  };

  const handleAnswerChange = async (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Submit answer to API immediately
    if (attempt) {
      try {
        await submitAnswer(questionId, answer);
      } catch (err) {
        console.error('Failed to submit answer:', err);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleCompleteQuiz = async () => {
    if (!attempt) return;

    try {
      const completedAttempt = await completeAttempt();
      if (completedAttempt) {
        setResults(completedAttempt);
        setQuizCompleted(true);
        
        // Notify parent component
        const passed = (completedAttempt.score || 0) >= quiz.passingScore;
        onComplete(completedAttempt.score || 0, passed);
      }
    } catch (err) {
      console.error('Failed to complete quiz:', err);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredQuestions = (): number => {
    return Object.keys(answers).length;
  };

  const renderQuestion = (question: QuizQuestion) => {
    const currentAnswer = answers[question.id];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className={styles.questionOptions}>
            {question.options?.map((option, index) => (
              <label key={index} className={styles.optionLabel}>
                <input
                  type="radio"
                  name={question.id}
                  value={index}
                  checked={currentAnswer === index}
                  onChange={() => handleAnswerChange(question.id, index)}
                  className={styles.optionInput}
                />
                <span className={styles.optionText}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className={styles.questionOptions}>
            <label className={styles.optionLabel}>
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={currentAnswer === true}
                onChange={() => handleAnswerChange(question.id, true)}
                className={styles.optionInput}
              />
              <span className={styles.optionText}>Verdadero</span>
            </label>
            <label className={styles.optionLabel}>
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={currentAnswer === false}
                onChange={() => handleAnswerChange(question.id, false)}
                className={styles.optionInput}
              />
              <span className={styles.optionText}>Falso</span>
            </label>
          </div>
        );

      case 'short-answer':
        return (
          <div className={styles.shortAnswerSection}>
            <textarea
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className={styles.shortAnswerInput}
              rows={4}
            />
          </div>
        );

      default:
        return <p>Tipo de pregunta no soportado</p>;
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Cargando quiz..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage 
        message={`Error cargando el quiz: ${error}`}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Quiz not started yet
  if (!attempt && !quizStarted) {
    return (
      <div className={styles.quizContainer}>
        <div className={styles.quizIntro}>
          <div className={styles.quizHeader}>
            <div className={styles.quizIcon}>
              <BookOpen size={48} />
            </div>
            <h2 className={styles.quizTitle}>{quiz.title}</h2>
            <p className={styles.quizDescription}>{quiz.description}</p>
          </div>

          <div className={styles.quizInfo}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Clock size={20} />
                <span>
                  {quiz.timeLimit ? `${quiz.timeLimit} minutos` : 'Sin límite de tiempo'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <Target size={20} />
                <span>{quiz.questions.length} preguntas</span>
              </div>
              <div className={styles.infoItem}>
                <Trophy size={20} />
                <span>Puntuación mínima: {quiz.passingScore}%</span>
              </div>
              <div className={styles.infoItem}>
                <AlertCircle size={20} />
                <span>Intentos permitidos: {quiz.attempts}</span>
              </div>
            </div>
          </div>

          <div className={styles.quizActions}>
            <button onClick={onExit} className={styles.cancelButton}>
              Cancelar
            </button>
            <button onClick={handleStartQuiz} className={styles.startButton}>
              <BookOpen size={16} />
              Iniciar Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz completed - show results
  if (quizCompleted && results) {
    const score = results.score || 0;
    const passed = score >= quiz.passingScore;
    
    return (
      <div className={styles.quizContainer}>
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <div className={`${styles.resultIcon} ${passed ? styles.passed : styles.failed}`}>
              {passed ? <Trophy size={48} /> : <AlertCircle size={48} />}
            </div>
            <h2 className={styles.resultsTitle}>
              {passed ? '¡Quiz Completado!' : 'Quiz No Aprobado'}
            </h2>
            <p className={styles.resultsScore}>
              Tu puntuación: <strong>{score}%</strong>
            </p>
          </div>

          <div className={styles.resultsSummary}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Preguntas contestadas:</span>
                <span className={styles.summaryValue}>{quiz.questions.length}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Tiempo utilizado:</span>
                <span className={styles.summaryValue}>
                  {results.timeSpent ? formatTime(results.timeSpent) : 'N/A'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Puntuación requerida:</span>
                <span className={styles.summaryValue}>{quiz.passingScore}%</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Estado:</span>
                <span className={`${styles.summaryValue} ${passed ? styles.passedText : styles.failedText}`}>
                  {passed ? 'Aprobado' : 'No Aprobado'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.resultsActions}>
            <button onClick={onExit} className={styles.continueButton}>
              <ArrowRight size={16} />
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredQuestions = getAnsweredQuestions();

  return (
    <div className={styles.quizContainer}>
      {/* Quiz Header */}
      <div className={styles.quizHeader}>
        <div className={styles.quizProgress}>
          <div className={styles.progressInfo}>
            <span>Pregunta {currentQuestionIndex + 1} de {quiz.questions.length}</span>
            <span>{answeredQuestions}/{quiz.questions.length} contestadas</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {timeLeft !== null && (
          <div className={`${styles.timer} ${timeLeft < 300 ? styles.timerWarning : ''}`}>
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Current Question */}
      <div className={styles.questionContainer}>
        <div className={styles.questionHeader}>
          <h3 className={styles.questionTitle}>
            {currentQuestion.question}
          </h3>
          <div className={styles.questionPoints}>
            {currentQuestion.points} punto{currentQuestion.points !== 1 ? 's' : ''}
          </div>
        </div>

        <div className={styles.questionContent}>
          {renderQuestion(currentQuestion)}
        </div>
      </div>

      {/* Navigation */}
      <div className={styles.quizNavigation}>
        <div className={styles.navigationButtons}>
          <button 
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={styles.navButton}
          >
            Anterior
          </button>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button 
              onClick={handleNextQuestion}
              className={styles.navButton}
            >
              Siguiente
            </button>
          ) : (
            <button 
              onClick={handleCompleteQuiz}
              className={styles.completeButton}
              disabled={answeredQuestions < quiz.questions.length}
            >
              Terminar Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}