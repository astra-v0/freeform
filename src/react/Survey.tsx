import React, { useState, useCallback, useRef } from 'react';
import { SurveyConfig, Question, UserAnswer, SurveyFlowState, SurveyResponse } from '../types/index.js';
import { TextQuestion } from './components/TextQuestion.js';
import { ChoiceQuestion } from './components/ChoiceQuestion.js';
import { FeedbackForm } from './components/FeedbackForm.js';

interface SurveyProps {
  config: SurveyConfig;
  onComplete?: (response: SurveyResponse) => void;
  onAnswer?: (answer: UserAnswer) => void;
}

export const Survey: React.FC<SurveyProps> = ({ 
  config, 
  onComplete, 
  onAnswer
}) => {
  const defaultTheme = {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#0066cc'
  };

  const theme = config.theme || defaultTheme;

  const [currentState, setCurrentState] = useState<SurveyFlowState>({
    currentQuestionId: config.startQuestionId,
    visitedQuestions: [],
    answers: new Map(),
    canGoBack: false,
    canGoNext: true
  });

  const [pendingAnswer, setPendingAnswer] = useState<UserAnswer | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const startTimeRef = useRef<Date>(new Date());

  const getCurrentQuestion = useCallback((): Question | undefined => {
    return config.questions.find(q => q.id === currentState.currentQuestionId);
  }, [config.questions, currentState.currentQuestionId]);

  const isLastQuestion = useCallback((): boolean => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || currentQuestion.type === 'conditional') {
      return false;
    }
    
    const remainingQuestions = config.questions.filter(q => 
      !currentState.visitedQuestions.includes(q.id) && 
      q.id !== currentState.currentQuestionId
    );
    
    return remainingQuestions.length === 0;
  }, [config.questions, currentState.visitedQuestions, currentState.currentQuestionId, getCurrentQuestion]);

  const handleAnswerChange = useCallback((answer: UserAnswer) => {
    setPendingAnswer(answer);
    setValidationError('');
  }, []);

  const handleNext = useCallback(() => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion?.required === true) {
      if (!pendingAnswer || !pendingAnswer.value) {
        if (currentQuestion.type === 'choice') {
          setValidationError('Please select one of the options');
        } else if (currentQuestion.type === 'feedback') {
          setValidationError('Please fill in the required fields');
        } else {
          setValidationError('Please enter an answer');
        }
        return;
      }
      
      if (typeof pendingAnswer.value === 'string' && !pendingAnswer.value.trim()) {
        setValidationError('Please enter an answer');
        return;
      }
      
      if (Array.isArray(pendingAnswer.value) && pendingAnswer.value.length === 0) {
        setValidationError('Please select at least one option');
        return;
      }
    }

    if (!pendingAnswer || !pendingAnswer.value) {
      const emptyAnswer = {
        questionId: currentState.currentQuestionId,
        value: '',
        timestamp: new Date()
      };
      
      const newAnswers = new Map(currentState.answers);
      newAnswers.set(currentState.currentQuestionId, emptyAnswer);
      
      const newVisitedQuestions = [...currentState.visitedQuestions, currentState.currentQuestionId];
      const nextQuestionId = getNextQuestionId(currentQuestion!);
      
      if (nextQuestionId) {
        setCurrentState(prev => ({
          ...prev,
          currentQuestionId: nextQuestionId,
          visitedQuestions: newVisitedQuestions,
          answers: newAnswers,
          canGoBack: true,
          canGoNext: true
        }));
        setValidationError('');
      } else {
        const response: SurveyResponse = {
          surveyId: config.id,
          sessionId: sessionIdRef.current,
          answers: Array.from(newAnswers.values()),
          completed: true,
          startTime: startTimeRef.current,
          endTime: new Date(),
          metadata: config.metadata
        };
        
        if (onComplete) {
          onComplete(response);
        }
      }
      return;
    }

    setValidationError('');
    const answer = {
      ...pendingAnswer,
      questionId: currentState.currentQuestionId,
      timestamp: new Date()
    };

    const newAnswers = new Map(currentState.answers);
    newAnswers.set(currentState.currentQuestionId, answer);

    const newVisitedQuestions = [...currentState.visitedQuestions, currentState.currentQuestionId];

    const nextQuestionId = getNextQuestionId(getCurrentQuestion()!);
    
    if (nextQuestionId) {
      setCurrentState(prev => ({
        ...prev,
        currentQuestionId: nextQuestionId,
        visitedQuestions: newVisitedQuestions,
        answers: newAnswers,
        canGoBack: true,
        canGoNext: true
      }));

      setPendingAnswer(null);

      if (onAnswer) {
        onAnswer(answer);
      }
    } else {
      const response: SurveyResponse = {
        surveyId: config.id,
        sessionId: sessionIdRef.current,
        answers: Array.from(newAnswers.values()),
        completed: true,
        startTime: startTimeRef.current,
        endTime: new Date(),
        metadata: config.metadata
      };
      
      if (onComplete) {
        onComplete(response);
      }
    }
  }, [pendingAnswer, currentState, config, onAnswer, onComplete, getCurrentQuestion]);

  const getNextQuestionId = (currentQuestion: Question): string | null => {
    const currentIndex = config.questions.findIndex(q => q.id === currentQuestion.id);
    const remainingQuestions = config.questions.slice(currentIndex + 1);
    
    const nextQuestion = remainingQuestions.find(q => 
      !currentState.visitedQuestions.includes(q.id)
    );
    
    return nextQuestion?.id || null;
  };

  const handleBack = useCallback(() => {
    if (!currentState.canGoBack || currentState.visitedQuestions.length === 0) {
      return;
    }

    const previousQuestionId = currentState.visitedQuestions[currentState.visitedQuestions.length - 1];
    const newVisitedQuestions = currentState.visitedQuestions.slice(0, -1);
    
    const newAnswers = new Map(currentState.answers);
    newAnswers.delete(currentState.currentQuestionId);

    setCurrentState(prev => ({
      ...prev,
      currentQuestionId: previousQuestionId,
      visitedQuestions: newVisitedQuestions,
      answers: newAnswers,
      canGoBack: newVisitedQuestions.length > 0,
      canGoNext: true
    }));
    
    setValidationError('');
  }, [currentState]);

  const renderCurrentQuestion = () => {
    const question = getCurrentQuestion();
    if (!question) {
      return (
        <div style={{ 
          textAlign: 'center',
          color: theme.textColor 
        }}>
          <h2 style={{ 
            fontSize: '24px',
            fontWeight: 400,
            margin: 0,
            color: theme.textColor 
          }}>
            Thank you for participating!
          </h2>
          <p style={{ fontSize: '16px', marginTop: '16px', color: theme.textColor }}>
            Your answers have been saved successfully.
          </p>
        </div>
      );
    }

    const currentAnswer = currentState.answers.get(question.id);

    switch (question.type) {
      case 'text':
        return (
          <TextQuestion
            question={question}
            currentAnswer={currentAnswer}
            theme={theme}
            onAnswer={handleAnswerChange}
          />
        );
      case 'choice':
        return (
          <ChoiceQuestion
            question={question}
            currentAnswer={currentAnswer}
            theme={theme}
            onAnswer={handleAnswerChange}
          />
        );
      case 'feedback':
        return (
          <FeedbackForm
            question={question}
            currentAnswer={currentAnswer}
            theme={theme}
            onAnswer={handleAnswerChange}
          />
        );
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  const renderNavigation = () => {
    const question = getCurrentQuestion();
    if (!question) return null;

    const buttonStyle: React.CSSProperties = {
      background: 'transparent',
      color: theme.accentColor,
      border: 'none',
      padding: '12px 0',
      fontSize: '16px',
      cursor: 'pointer',
      textDecoration: 'underline'
    };

    return (
      <div>
        {validationError && (
          <div style={{
            color: theme.accentColor,
            fontSize: '14px',
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: `${theme.accentColor}10`,
            borderLeft: `3px solid ${theme.accentColor}`
          }}>
            {validationError}
          </div>
        )}
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: validationError ? '16px' : '48px'
        }}>
          {currentState.canGoBack ? (
            <button onClick={handleBack} style={buttonStyle}>
              Back
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNext}
            style={buttonStyle}
          >
            {isLastQuestion() ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '40px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px'
      }}>
        {renderCurrentQuestion()}
        {renderNavigation()}
      </div>
    </div>
  );
};
