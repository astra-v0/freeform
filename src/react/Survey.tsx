import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  SurveyConfig,
  Question,
  UserAnswer,
  SurveyFlowState,
  SurveyResponse,
  TextQuestion as TextQuestionType,
  FeedbackFormQuestion,
} from '../types/index.js';
import { TextQuestion } from './components/TextQuestion.js';
import { ChoiceQuestion } from './components/ChoiceQuestion.js';
import { FeedbackForm } from './components/FeedbackForm.js';
import { InfoQuestion } from './components/InfoQuestion.js';
import { SocialQuestion } from './components/SocialQuestion.js';

interface SurveyProps {
  config: SurveyConfig;
  onComplete?: (response: SurveyResponse) => void;
  onSubmit?: (response: SurveyResponse) => void;
  onAnswer?: (answer: UserAnswer) => void;
}

function lightenColor(color: string, amount: number) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = (num >> 16) + amount;
  const b = ((num >> 8) & 0x00ff) + amount;
  const g = (num & 0x0000ff) + amount;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Hook to detect mobile device
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export const Survey: React.FC<SurveyProps> = ({
  config,
  onComplete,
  onSubmit,
  onAnswer,
}) => {
  const isMobile = useIsMobile();
  
  const defaultTheme = {
    backgroundColor: '#1d1d1d',
    textColor: '#ffffff',
    accentColor: '#4A9EFF',
  };

  const theme = config.theme || defaultTheme;

  const [currentState, setCurrentState] = useState<SurveyFlowState>({
    currentQuestionId: config.startQuestionId,
    visitedQuestions: [],
    answers: new Map(),
    canGoBack: false,
    canGoNext: true,
  });

  const [pendingAnswer, setPendingAnswer] = useState<UserAnswer | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const sessionIdRef = useRef<string>(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const startTimeRef = useRef<Date>(new Date());

  const getCurrentQuestion = useCallback((): Question | undefined => {
    return config.questions.find(q => q.id === currentState.currentQuestionId);
  }, [config.questions, currentState.currentQuestionId]);

  const handleAnswerChange = useCallback((answer: UserAnswer) => {
    setPendingAnswer(answer);
    setValidationError('');
  }, []);

  const getNextQuestionId = useCallback((currentQuestion: Question): string | null => {
    const currentIndex = config.questions.findIndex(
      q => q.id === currentQuestion.id
    );
    const remainingQuestions = config.questions.slice(currentIndex + 1);

    const nextQuestion = remainingQuestions.find(
      q => !currentState.visitedQuestions.includes(q.id) && !q.hidden
    );

    return nextQuestion?.id || null;
  }, [config.questions, currentState.visitedQuestions]);

  const handleNext = useCallback(() => {
    const currentQuestion = getCurrentQuestion();
    
    // If button has URL, redirect immediately without validation
    if (currentQuestion?.nextButton?.url) {
      window.location.href = currentQuestion.nextButton.url;
      return;
    }
    
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

      if (
        typeof pendingAnswer.value === 'string' &&
        !pendingAnswer.value.trim()
      ) {
        setValidationError('Please enter an answer');
        return;
      }

      if (
        Array.isArray(pendingAnswer.value) &&
        pendingAnswer.value.length === 0
      ) {
        setValidationError('Please select at least one option');
        return;
      }
    }

    // Validate text question with validation rules
    if (
      currentQuestion?.type === 'text' &&
      pendingAnswer &&
      typeof pendingAnswer.value === 'string'
    ) {
      const textQuestion = currentQuestion as TextQuestionType;
      const trimmedValue = pendingAnswer.value.trim();

      if (textQuestion.validation && trimmedValue) {
        if (textQuestion.validation.type === 'number') {
          const numValue = parseFloat(trimmedValue);
          if (isNaN(numValue)) {
            setValidationError(
              textQuestion.validation.errorMessage ||
                'Please enter a valid number'
            );
            return;
          }
          if (
            textQuestion.validation.min !== undefined &&
            numValue < textQuestion.validation.min
          ) {
            setValidationError(
              textQuestion.validation.errorMessage ||
                `Value must be at least ${textQuestion.validation.min}`
            );
            return;
          }
          if (
            textQuestion.validation.max !== undefined &&
            numValue > textQuestion.validation.max
          ) {
            setValidationError(
              textQuestion.validation.errorMessage ||
                `Value must be at most ${textQuestion.validation.max}`
            );
            return;
          }
        }
      }
    }

    // Validate feedback form required fields
    if (currentQuestion?.type === 'feedback' && pendingAnswer) {
      const feedbackQuestion = currentQuestion as FeedbackFormQuestion;
      const formData = pendingAnswer.value as Record<string, string>;
      const requiredFields: string[] = [];

      const fieldNames = ['firstName', 'lastName', 'email', 'company'] as const;
      fieldNames.forEach(fieldName => {
        const field = feedbackQuestion.fields[fieldName];
        const isEnabled = typeof field === 'boolean' ? field : field.enabled;
        const isRequired =
          typeof field === 'boolean' ? false : (field.required ?? false);

        if (
          isEnabled &&
          isRequired &&
          (!formData[fieldName] || !formData[fieldName].trim())
        ) {
          const displayName =
            fieldName.charAt(0).toUpperCase() +
            fieldName.slice(1).replace(/([A-Z])/g, ' $1');
          requiredFields.push(displayName);
        }
      });

      if (requiredFields.length > 0) {
        setValidationError(
          `Please fill in the required fields: ${requiredFields.join(', ')}`
        );
        return;
      }

      // Validate email format if email field is enabled and has a value
      const emailField = feedbackQuestion.fields.email;
      const isEmailEnabled =
        typeof emailField === 'boolean' ? emailField : emailField.enabled;
      if (isEmailEnabled && formData.email && formData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          setValidationError('Please enter a valid email address');
          return;
        }
      }
    }

    if (!pendingAnswer || !pendingAnswer.value) {
      const emptyAnswer = {
        questionId: currentState.currentQuestionId,
        value: '',
        timestamp: new Date(),
      };

      const newAnswers = new Map(currentState.answers);
      newAnswers.set(currentState.currentQuestionId, emptyAnswer);

      const newVisitedQuestions = [
        ...currentState.visitedQuestions,
        currentState.currentQuestionId,
      ];
      const nextQuestionId = currentQuestion ? getNextQuestionId(currentQuestion) : null;

      if (nextQuestionId) {
        setCurrentState(prev => ({
          ...prev,
          currentQuestionId: nextQuestionId,
          visitedQuestions: newVisitedQuestions,
          answers: newAnswers,
          canGoBack: true,
          canGoNext: true,
        }));

        // Load the answer for the next question if it exists
        const nextAnswer = newAnswers.get(nextQuestionId);
        setPendingAnswer(nextAnswer || null);

        setValidationError('');
      } else {
        const response: SurveyResponse = {
          surveyId: config.id,
          sessionId: sessionIdRef.current,
          answers: Array.from(newAnswers.values()),
          completed: true,
          startTime: startTimeRef.current,
          endTime: new Date(),
          metadata: config.metadata,
        };

        // Check if this is a submit or complete action
        const currentQuestion = getCurrentQuestion();
        if (currentQuestion?.submit && onSubmit) {
          onSubmit(response);
        } else if (currentQuestion?.final && onComplete) {
          onComplete(response);
        }
      }
      return;
    }

    setValidationError('');
    const answer = {
      ...pendingAnswer,
      questionId: currentState.currentQuestionId,
      timestamp: new Date(),
    };

    const newAnswers = new Map(currentState.answers);
    newAnswers.set(currentState.currentQuestionId, answer);

    const newVisitedQuestions = [
      ...currentState.visitedQuestions,
      currentState.currentQuestionId,
    ];

    const nextQuestion = getCurrentQuestion();
    const nextQuestionId = nextQuestion ? getNextQuestionId(nextQuestion) : null;

    if (nextQuestionId) {
      setCurrentState(prev => ({
        ...prev,
        currentQuestionId: nextQuestionId,
        visitedQuestions: newVisitedQuestions,
        answers: newAnswers,
        canGoBack: true,
        canGoNext: true,
      }));

      // Load the answer for the next question if it exists (user went back and forward)
      const nextAnswer = newAnswers.get(nextQuestionId);
      setPendingAnswer(nextAnswer || null);

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
        metadata: config.metadata,
      };

      // Check if this is a submit or complete action
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion?.submit && onSubmit) {
        onSubmit(response);
      } else if (currentQuestion?.final && onComplete) {
        onComplete(response);
      }
    }
  }, [
    pendingAnswer,
    currentState,
    config,
    onAnswer,
    onComplete,
    onSubmit,
    getCurrentQuestion,
    getNextQuestionId,
  ]);

  const handleBack = useCallback(() => {
    if (!currentState.canGoBack || currentState.visitedQuestions.length === 0) {
      return;
    }

    const previousQuestionId =
      currentState.visitedQuestions[currentState.visitedQuestions.length - 1];
    const newVisitedQuestions = currentState.visitedQuestions.slice(0, -1);

    // Don't delete the answer, keep it for when user comes back
    // Just restore the pending answer from the previous question
    const previousAnswer = currentState.answers.get(previousQuestionId);
    setPendingAnswer(previousAnswer || null);

    setCurrentState(prev => ({
      ...prev,
      currentQuestionId: previousQuestionId,
      visitedQuestions: newVisitedQuestions,
      canGoBack: newVisitedQuestions.length > 0,
      canGoNext: true,
    }));

    setValidationError('');
  }, [currentState]);

  const renderCurrentQuestion = () => {
    const question = getCurrentQuestion();
    if (!question) {
      return (
        <div
          style={{
            textAlign: 'center',
            color: theme.textColor,
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 400,
              margin: 0,
              color: theme.textColor,
            }}
          >
            Thank you for participating!
          </h2>
          <p
            style={{
              fontSize: isMobile ? '14px' : '16px',
              marginTop: isMobile ? '12px' : '16px',
              color: theme.textColor,
            }}
          >
            Your answers have been saved successfully.
          </p>
        </div>
      );
    }

    const currentAnswer = currentState.answers.get(question.id);
    const questionNumber =
      config.questions.findIndex(q => q.id === question.id) + 1;

    const questionIconStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: isMobile ? '28px' : '32px',
      height: isMobile ? '28px' : '32px',
      backgroundColor: theme.accentColor,
      color: '#1a1a1a',
      borderRadius: '6px',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: 'bold',
      marginRight: isMobile ? '12px' : '16px',
      marginBottom: isMobile ? '12px' : '16px',
    };

    const questionTitleStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: isMobile ? '20px' : '32px',
    };

    const questionContentStyle: React.CSSProperties = {
      flex: 1,
    };

    switch (question.type) {
      case 'text':
        return (
          <div style={questionTitleStyle}>
            <div style={questionIconStyle}>{questionNumber}</div>
            <div style={questionContentStyle}>
              <TextQuestion
                question={question}
                currentAnswer={currentAnswer}
                theme={theme}
                onAnswer={handleAnswerChange}
                isMobile={isMobile}
              />
              {renderNavigation()}
            </div>
          </div>
        );
      case 'choice':
        return (
          <div style={questionTitleStyle}>
            <div style={questionIconStyle}>{questionNumber}</div>
            <div style={questionContentStyle}>
              <ChoiceQuestion
                question={question}
                currentAnswer={currentAnswer}
                theme={theme}
                onAnswer={handleAnswerChange}
                isMobile={isMobile}
              />
              {renderNavigation()}
            </div>
          </div>
        );
      case 'feedback':
        return (
          <div style={questionTitleStyle}>
            <div style={questionIconStyle}>{questionNumber}</div>
            <div style={questionContentStyle}>
              <FeedbackForm
                question={question}
                currentAnswer={currentAnswer}
                theme={theme}
                onAnswer={handleAnswerChange}
                isMobile={isMobile}
              />
              {renderNavigation()}
            </div>
          </div>
        );
      case 'info':
        return (
          <div style={questionTitleStyle}>
            <div style={questionContentStyle}>
              <InfoQuestion
                question={question}
                currentAnswer={currentAnswer}
                theme={theme}
                onAnswer={handleAnswerChange}
                isMobile={isMobile}
              />
              {renderNavigation()}
            </div>
          </div>
        );
      case 'social':
        return (
          <div style={questionTitleStyle}>
            <div style={questionContentStyle}>
              <SocialQuestion
                question={question}
                currentAnswer={currentAnswer}
                theme={theme}
                onAnswer={handleAnswerChange}
                isMobile={isMobile}
              />
              {renderNavigation()}
            </div>
          </div>
        );
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  const renderNavigation = () => {
    const question = getCurrentQuestion();
    if (!question) return null;

    // Get next button configuration
    const nextButtonConfig = question.nextButton;
    const buttonText = nextButtonConfig?.text || 'OK';
    const buttonStyle = nextButtonConfig?.style || 'filled';

    const getButtonStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        border: 'none',
        padding: isMobile ? '14px 28px' : '12px 32px',
        fontSize: isMobile ? '15px' : '16px',
        fontWeight: '500',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: '44px',
        minWidth: isMobile ? '80px' : 'auto',
        touchAction: 'manipulation',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      };

      switch (buttonStyle) {
        case 'outlined':
          return {
            ...baseStyle,
            backgroundColor: 'transparent',
            color: theme.accentColor,
            border: `2px solid ${theme.accentColor}`,
          };
        case 'ghost':
          return {
            ...baseStyle,
            backgroundColor: 'transparent',
            color: theme.accentColor,
            border: 'none',
          };
        case 'link':
          return {
            ...baseStyle,
            backgroundColor: 'transparent',
            color: theme.accentColor,
            border: 'none',
            textDecoration: 'underline',
            padding: '8px 16px',
          };
        case 'none':
          return {
            ...baseStyle,
            display: 'none',
          };
        case 'filled':
        default:
          return {
            ...baseStyle,
            backgroundColor: theme.accentColor,
            color: '#1a1a1a',
          };
      }
    };

    const okButtonStyle = getButtonStyle();

    const backButtonStyle: React.CSSProperties = {
      background: 'transparent',
      color: '#cccccc',
      border: `1px solid ${lightenColor(theme.backgroundColor, 50)}`,
      borderRadius: '8px',
      padding: isMobile ? '14px 28px' : '12px 32px',
      fontSize: isMobile ? '15px' : '16px',
      cursor: 'pointer',
      minHeight: '44px',
      minWidth: isMobile ? '80px' : 'auto',
      touchAction: 'manipulation',
    };

    return (
      <div style={{ marginTop: isMobile ? '12px' : '15px' }}>
        {validationError && (
          <div
            style={{
              color: '#ffffff',
              fontSize: isMobile ? '13px' : '14px',
              marginBottom: isMobile ? '12px' : '16px',
              padding: isMobile ? '10px 14px' : '12px 16px',
              backgroundColor: 'rgb(139 57 19)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              position: 'relative',
            }}
          >
            <AlertTriangle
              size={isMobile ? 18 : 20}
              style={{
                marginRight: isMobile ? '10px' : '12px',
                flexShrink: 0,
              }}
            />
            {validationError}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: isMobile ? '8px' : '12px',
          }}
        >
          {currentState.canGoBack ? (
            <button onClick={handleBack} style={backButtonStyle}>
              Back
            </button>
          ) : (
            <div></div>
          )}

          {buttonStyle !== 'none' && (
            <button
              onClick={handleNext}
              style={okButtonStyle}
              onMouseEnter={_e => {
                // _e.currentTarget.style.fontWeight = '600';
              }}
              onMouseLeave={_e => {
                // _e.currentTarget.style.fontWeight = '500';
              }}
            >
              {nextButtonConfig?.icon && (
                <img 
                  src={nextButtonConfig.icon} 
                  alt="" 
                  style={{ 
                    width: '16px', 
                    height: '16px',
                    objectFit: 'contain'
                  }} 
                />
              )}
              {buttonText}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="survey-container"
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: isMobile ? '16px' : '40px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="survey-content"
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '600px',
          maxHeight: '100%',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {renderCurrentQuestion()}
      </div>
    </div>
  );
};
