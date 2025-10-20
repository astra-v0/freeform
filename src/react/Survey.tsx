import React, { useState, useCallback, useRef } from 'react';
import {
  SurveyConfig,
  Question,
  UserAnswer,
  SurveyFlowState,
  SurveyResponse,
  TextQuestion as TextQuestionType,
  FeedbackFormQuestion,
} from '../types/index.js';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { ValidationUtils } from '../utils/validation.js';
import { SurveyFlowUtils } from '../utils/surveyFlow.js';
import { ThemeUtils } from '../utils/themeUtils.js';
import { QuestionWrapper } from '../components/QuestionWrapper.js';
import { CompletionScreen } from '../components/CompletionScreen.js';
import { ValidationError } from '../components/ValidationError.js';
import { NavigationButtons } from '../components/NavigationButtons.js';

interface SurveyProps {
  config: SurveyConfig;
  onComplete?: (response: SurveyResponse) => void;
  onSubmit?: (response: SurveyResponse) => void;
  onAnswer?: (answer: UserAnswer) => void;
}


export const Survey: React.FC<SurveyProps> = ({
  config,
  onComplete,
  onSubmit,
  onAnswer,
}) => {
  const isMobile = useIsMobile();
  
  const theme = ThemeUtils.mergeThemes(
    ThemeUtils.getDefaultTheme(),
    config.theme
  );

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


  const handleNext = useCallback(() => {
    const currentQuestion = getCurrentQuestion();
    
    // Validate required answer
    if (!currentQuestion) return;
    
    const requiredValidation = ValidationUtils.validateRequiredAnswer(
      currentQuestion,
      pendingAnswer
    );
    if (!requiredValidation.isValid) {
      setValidationError(requiredValidation.errorMessage);
      return;
    }

    // Validate text question with validation rules
    if (currentQuestion?.type === 'text' && pendingAnswer) {
      const textValidation = ValidationUtils.validateTextQuestion(
        currentQuestion as TextQuestionType,
        pendingAnswer
      );
      if (!textValidation.isValid) {
        setValidationError(textValidation.errorMessage);
        return;
      }
    }

    // Validate feedback form
    if (currentQuestion?.type === 'feedback' && pendingAnswer) {
      const feedbackValidation = ValidationUtils.validateFeedbackForm(
        currentQuestion as FeedbackFormQuestion,
        pendingAnswer
      );
      if (!feedbackValidation.isValid) {
        setValidationError(feedbackValidation.errorMessage);
        return;
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
      const nextQuestionId = currentQuestion 
        ? SurveyFlowUtils.getNextQuestionId(
            currentQuestion,
            config,
            newVisitedQuestions
          )
        : null;

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
    
    // Check for conditional navigation after saving the answer
    let nextQuestionId: string | null = null;
    if (currentQuestion?.nextButton?.condition) {
      nextQuestionId = SurveyFlowUtils.getConditionalNextQuestionId(
        currentQuestion,
        newAnswers
      );
    }
    
    // If no conditional navigation, use normal flow
    if (!nextQuestionId) {
      nextQuestionId = currentQuestion 
        ? SurveyFlowUtils.getNextQuestionId(
            currentQuestion,
            config,
            newVisitedQuestions
          )
        : null;
    }

    console.log('currentQuestion', currentQuestion);

    // Check for submit/complete actions after saving the answer
    if (currentQuestion?.submit && onSubmit) {
      const response: SurveyResponse = {
        surveyId: config.id,
        sessionId: sessionIdRef.current,
        answers: Array.from(newAnswers.values()),
        completed: false,
        startTime: startTimeRef.current,
        endTime: new Date(),
        metadata: config.metadata,
      };
      onSubmit(response);
    }

    // check if next question is final
    const nextQuestion = nextQuestionId ? config.questions.find(q => q.id === nextQuestionId) : null;
    if (nextQuestion?.final && onComplete) {
      const response: SurveyResponse = {
        surveyId: config.id,
        sessionId: sessionIdRef.current,
        answers: Array.from(newAnswers.values()),
        completed: true,
        startTime: startTimeRef.current,
        endTime: new Date(),
        metadata: config.metadata,
      };
      onComplete(response);
    }

    // Check for URL redirect after processing submit/complete
    if (currentQuestion?.nextButton?.url) {
      // If this is a final question, call onComplete before redirect
      window.location.href = currentQuestion.nextButton.url;
      return;
    }

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
      console.log('Survey ending - checking submit/complete:', {
        currentQuestionId: currentQuestion?.id,
        isSubmit: currentQuestion?.submit,
        isFinal: currentQuestion?.final,
        hasOnSubmit: !!onSubmit,
        hasOnComplete: !!onComplete
      });
      
      if (currentQuestion?.submit && onSubmit) {
        console.log('Calling onSubmit');
        onSubmit(response);
      } else if (currentQuestion?.final && onComplete) {
        console.log('Calling onComplete');
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
      return <CompletionScreen theme={theme} isMobile={isMobile} />;
    }

    const currentAnswer = currentState.answers.get(question.id);
    const questionNumber =
      config.questions.findIndex(q => q.id === question.id) + 1;

    return (
      <QuestionWrapper
        question={question}
        currentAnswer={currentAnswer}
        theme={theme}
        onAnswer={handleAnswerChange}
        isMobile={isMobile}
        questionNumber={questionNumber}
        onNavigation={renderNavigation}
      />
    );
  };

  const renderNavigation = () => {
    const question = getCurrentQuestion();
    if (!question) return null;

    const nextButtonConfig = question.nextButton;
    const buttonText = nextButtonConfig?.text || 'OK';
    const buttonStyle = nextButtonConfig?.style || 'filled';

    return (
      <div style={{ marginTop: isMobile ? '12px' : '15px' }}>
        {validationError && (
          <ValidationError message={validationError} isMobile={isMobile} />
        )}

        <NavigationButtons
          canGoBack={currentState.canGoBack}
          onBack={handleBack}
          onNext={handleNext}
          nextButtonText={buttonText}
          nextButtonStyle={buttonStyle}
          nextButtonIcon={nextButtonConfig?.icon}
          theme={theme}
          isMobile={isMobile}
        />
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
