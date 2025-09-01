import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Award, 
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';
import { useTranslation } from '../hooks/useLanguage';
import styles from './QuizView.module.css';

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  timeLimit?: number; // in minutes
  attempts: number;
  passingScore: number;
  questions: QuizQuestion[];
}

interface QuizViewProps {
  quiz: QuizData;
  onComplete: (score: number, answers: Record<string, any>) => void;
  onExit: () => void;
}

export function QuizView({ quiz, onComplete, onExit }: QuizViewProps) {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Timer effect
  useEffect(() => {
    if (timeRemaining && timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (question.type === 'multiple-choice') {
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
          earnedPoints += question.points;
        }
      } else if (question.type === 'true-false') {
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
          earnedPoints += question.points;
        }
      } else if (question.type === 'short-answer') {
        // Simple string comparison - in real app, this would be more sophisticated
        if (userAnswer?.toLowerCase().trim() === question.correctAnswer.toString().toLowerCase().trim()) {
          correctAnswers++;
          earnedPoints += question.points;
        }
      }
    });

    return {
      percentage: Math.round((earnedPoints / totalPoints) * 100),
      correctAnswers,
      totalQuestions,
      earnedPoints,
      totalPoints
    };
  };

  const handleSubmitQuiz = () => {
    const results = calculateScore();
    setScore(results.percentage);
    setIsSubmitted(true);
    setShowResults(true);
    onComplete(results.percentage, answers);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : null);
    setIsSubmitted(false);
    setShowResults(false);
    setScore(0);
  };

  const getAnsweredQuestionsCount = () => {
    return Object.keys(answers).length;
  };

  const isQuestionAnswered = (questionIndex: number) => {
    return answers[quiz.questions[questionIndex].id] !== undefined;
  };

  if (showResults) {
    const results = calculateScore();
    const passed = results.percentage >= quiz.passingScore;

    return (
      <div className={styles.quizContainer}>
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <div className={`${styles.scoreCircle} ${passed ? styles.passed : styles.failed}`}>
              {passed ? <Award size={32} /> : <AlertTriangle size={32} />}
              <div className={styles.scoreText}>
                <span className={styles.scorePercentage}>{results.percentage}%</span>
                <span className={styles.scoreLabel}>Score</span>
              </div>
            </div>
            
            <div className={styles.resultsInfo}>
              <h2 className={styles.resultsTitle}>
                {passed ? '¡Felicidades! Quiz Aprobado' : 'Quiz No Aprobado'}
              </h2>
              <p className={styles.resultsSubtitle}>
                {passed 
                  ? `Has superado la puntuación mínima de ${quiz.passingScore}%`
                  : `Necesitas al menos ${quiz.passingScore}% para aprobar`
                }
              </p>
            </div>
          </div>

          <div className={styles.resultStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{results.correctAnswers}</span>
              <span className={styles.statLabel}>Correctas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{results.totalQuestions - results.correctAnswers}</span>
              <span className={styles.statLabel}>Incorrectas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{results.earnedPoints}/{results.totalPoints}</span>
              <span className={styles.statLabel}>Puntos</span>
            </div>
          </div>

          <div className={styles.resultActions}>
            <button className={styles.reviewButton} onClick={() => setShowResults(false)}>
              Revisar Respuestas
            </button>
            {!passed && (
              <button className={styles.retryButton} onClick={handleRetry}>
                <RotateCcw size={16} />
                Intentar de Nuevo
              </button>
            )}
            <button className={styles.exitButton} onClick={onExit}>
              {passed ? 'Continuar' : 'Salir'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.quizContainer}>
      {/* Quiz Header */}
      <div className={styles.quizHeader}>
        <div className={styles.quizInfo}>
          <h2 className={styles.quizTitle}>{quiz.title}</h2>
          <p className={styles.quizDescription}>{quiz.description}</p>
        </div>
        
        <div className={styles.quizMeta}>
          {timeRemaining && (
            <div className={`${styles.timer} ${timeRemaining < 300 ? styles.timerWarning : ''}`}>
              <Clock size={16} />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
          <div className={styles.progress}>
            <span>{getAnsweredQuestionsCount()}/{totalQuestions} respondidas</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressTrack}>
          {quiz.questions.map((_, index) => (
            <div
              key={index}
              className={`${styles.progressDot} ${
                index === currentQuestionIndex ? styles.current :
                isQuestionAnswered(index) ? styles.answered : ''
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className={styles.questionContainer}>
        <div className={styles.questionHeader}>
          <span className={styles.questionNumber}>
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </span>
          <span className={styles.questionPoints}>
            {currentQuestion.points} punto{currentQuestion.points !== 1 ? 's' : ''}
          </span>
        </div>

        <h3 className={styles.questionText}>{currentQuestion.question}</h3>

        {/* Answer Options */}
        <div className={styles.answersContainer}>
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className={styles.multipleChoice}>
              {currentQuestion.options.map((option, index) => (
                <label key={index} className={styles.optionLabel}>
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={answers[currentQuestion.id] === index}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
                    className={styles.optionInput}
                  />
                  <span className={styles.optionText}>{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true-false' && (
            <div className={styles.trueFalse}>
              <label className={styles.optionLabel}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value="true"
                  checked={answers[currentQuestion.id] === true}
                  onChange={() => handleAnswerChange(currentQuestion.id, true)}
                  className={styles.optionInput}
                />
                <span className={styles.optionText}>Verdadero</span>
              </label>
              <label className={styles.optionLabel}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value="false"
                  checked={answers[currentQuestion.id] === false}
                  onChange={() => handleAnswerChange(currentQuestion.id, false)}
                  className={styles.optionInput}
                />
                <span className={styles.optionText}>Falso</span>
              </label>
            </div>
          )}

          {currentQuestion.type === 'short-answer' && (
            <div className={styles.shortAnswer}>
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className={styles.answerTextarea}
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Show explanation after answering (only in review mode) */}
        {isSubmitted && currentQuestion.explanation && answers[currentQuestion.id] !== undefined && (
          <div className={styles.explanation}>
            <div className={styles.explanationHeader}>
              <HelpCircle size={16} />
              Explicación
            </div>
            <p className={styles.explanationText}>{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={styles.quizNavigation}>
        <button
          onClick={handlePreviousQuestion}
          disabled={isFirstQuestion}
          className={styles.navButton}
        >
          <ArrowLeft size={16} />
          Anterior
        </button>

        <div className={styles.navCenter}>
          {!isSubmitted && (
            <button onClick={handleSubmitQuiz} className={styles.submitButton}>
              <CheckCircle size={16} />
              Enviar Quiz
            </button>
          )}
        </div>

        <button
          onClick={isLastQuestion ? (isSubmitted ? onExit : handleSubmitQuiz) : handleNextQuestion}
          className={styles.navButton}
        >
          {isLastQuestion ? (isSubmitted ? 'Salir' : 'Finalizar') : 'Siguiente'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}