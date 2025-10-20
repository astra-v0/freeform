import React from 'react';
import { Question, UserAnswer, SurveyTheme } from '../types/index.js';
import { TextQuestion } from '../react/components/TextQuestion.js';
import { ChoiceQuestion } from '../react/components/ChoiceQuestion.js';
import { FeedbackForm } from '../react/components/FeedbackForm.js';
import { InfoQuestion } from '../react/components/InfoQuestion.js';
import { SocialQuestion } from '../react/components/SocialQuestion.js';

interface QuestionWrapperProps {
  question: Question;
  currentAnswer?: UserAnswer;
  theme: SurveyTheme;
  onAnswer: (answer: UserAnswer) => void;
  isMobile: boolean;
  questionNumber: number;
  onNavigation: () => React.ReactNode;
}

export const QuestionWrapper: React.FC<QuestionWrapperProps> = ({
  question,
  currentAnswer,
  theme,
  onAnswer,
  isMobile,
  questionNumber,
  onNavigation,
}) => {
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

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'text':
        return (
          <TextQuestion
            question={question}
            currentAnswer={currentAnswer}
            theme={theme}
            onAnswer={onAnswer}
            isMobile={isMobile}
          />
        );
      case 'choice':
        return (
          <ChoiceQuestion
            question={question}
            currentAnswer={currentAnswer}
            theme={theme}
            onAnswer={onAnswer}
            isMobile={isMobile}
          />
        );
      case 'feedback':
        return (
          <FeedbackForm
            question={question}
            currentAnswer={currentAnswer}
            theme={theme}
            onAnswer={onAnswer}
            isMobile={isMobile}
          />
        );
      case 'info':
        return (
          <InfoQuestion
            question={question}
            currentAnswer={currentAnswer}
            theme={theme}
            onAnswer={onAnswer}
            isMobile={isMobile}
          />
        );
      case 'social':
        return (
          <SocialQuestion
            question={question}
            currentAnswer={currentAnswer}
            theme={theme}
            onAnswer={onAnswer}
            isMobile={isMobile}
          />
        );
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  return (
    <div style={questionTitleStyle}>
      {question.type !== 'info' && question.type !== 'social' && (
        <div style={questionIconStyle}>{questionNumber}</div>
      )}
      <div style={questionContentStyle}>
        {renderQuestionContent()}
        {onNavigation()}
      </div>
    </div>
  );
};
