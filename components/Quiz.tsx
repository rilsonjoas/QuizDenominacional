'use client';
import { useState } from 'react';
import { Question } from '@/lib/types';
import styles from './Quiz.module.css';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  HelpCircle,
  ArrowRight,
  Clock,
  BarChart3
} from 'lucide-react';

interface QuizProps {
  questions: Question[];
  onSubmit: (answers: { [key: string]: string }) => void;
}

export default function Quiz({ questions, onSubmit }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular um pequeno delay para mostrar o loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit(answers);
    setIsSubmitting(false);
  };

  const canGoNext = currentQuestionIndex < totalQuestions - 1;
  const canGoPrevious = currentQuestionIndex > 0;
  const hasAnsweredCurrent = answers[currentQuestion.id];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className={styles.quizContainer}>
      {/* Header do Quiz */}
      <div className={styles.quizHeader}>
        <div className={styles.quizInfo}>
          <h2 className={styles.quizTitle}>
            <HelpCircle className={styles.quizIcon} />
            Quiz Denominacional
          </h2>
          <div className={styles.quizStats}>
            <div className={styles.stat}>
              <Clock className={styles.statIcon} />
              <span>Pergunta {currentQuestionIndex + 1} de {totalQuestions}</span>
            </div>
            <div className={styles.stat}>
              <BarChart3 className={styles.statIcon} />
              <span>{answeredQuestions} respondidas</span>
            </div>
          </div>
        </div>
        
        {/* Barra de Progresso */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={styles.progressText}>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Card da Pergunta */}
      <div className={styles.questionCard}>
        <div className={styles.questionHeader}>
          <span className={styles.questionNumber}>
            Pergunta {currentQuestionIndex + 1}
          </span>
          <h3 className={styles.questionText}>{currentQuestion.text}</h3>
        </div>

        <div className={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <label 
              key={option.value} 
              className={`${styles.optionLabel} ${
                answers[currentQuestion.id] === option.value ? styles.optionSelected : ''
              }`}
            >
              <input
                type="radio"
                name={currentQuestion.id}
                value={option.value}
                checked={answers[currentQuestion.id] === option.value}
                onChange={() => handleAnswerChange(currentQuestion.id, option.value)}
                className={styles.optionInput}
              />
              <div className={styles.optionContent}>
                <div className={styles.optionIcon}>
                  {answers[currentQuestion.id] === option.value ? (
                    <CheckCircle className={styles.checkIcon} />
                  ) : (
                    <Circle className={styles.circleIcon} />
                  )}
                </div>
                <div className={styles.optionText}>
                  <span className={styles.optionLetter}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option.text}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Navegação */}
      <div className={styles.navigation}>
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={`${styles.navButton} ${styles.navButtonPrevious} ${
            !canGoPrevious ? styles.navButtonDisabled : ''
          }`}
        >
          <ChevronLeft className={styles.navIcon} />
          Anterior
        </button>

        <div className={styles.navCenter}>
          {!isLastQuestion ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
              className={`${styles.navButton} ${styles.navButtonNext} ${
                !hasAnsweredCurrent ? styles.navButtonDisabled : ''
              }`}
            >
              Próxima
              <ChevronRight className={styles.navIcon} />
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!hasAnsweredCurrent || isSubmitting}
              className={`${styles.submitButton} ${
                !hasAnsweredCurrent || isSubmitting ? styles.submitButtonDisabled : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.loader} />
                  Processando...
                </>
              ) : (
                <>
                  Ver Resultado
                  <ArrowRight className={styles.submitIcon} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Indicadores de Perguntas */}
      <div className={styles.questionIndicators}>
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`${styles.indicator} ${
              index === currentQuestionIndex ? styles.indicatorActive : ''
            } ${answers[questions[index].id] ? styles.indicatorAnswered : ''}`}
            title={`Pergunta ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}