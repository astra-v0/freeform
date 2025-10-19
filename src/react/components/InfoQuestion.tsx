import React from 'react';
import {
  InfoQuestion as InfoQuestionType,
  UserAnswer,
  SurveyTheme,
} from '../../types/index.js';
import { Info } from 'lucide-react';

interface InfoQuestionProps {
  question: InfoQuestionType;
  currentAnswer?: UserAnswer;
  theme: SurveyTheme;
  onAnswer: (answer: UserAnswer) => void;
  isMobile?: boolean;
}

export const InfoQuestion: React.FC<InfoQuestionProps> = ({
  question,
  currentAnswer: _currentAnswer,
  theme,
  onAnswer,
  isMobile = false,
}) => {
  // Auto-answer info questions immediately when they render
  React.useEffect(() => {
    onAnswer({
      questionId: question.id,
      value: 'viewed',
      timestamp: new Date(),
    });
  }, [question.id, onAnswer]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        padding: isMobile ? '16px' : '24px',
        backgroundColor: hexToRgba(theme.accentColor, 0.1),
        border: `1px solid ${hexToRgba(theme.accentColor, 0.3)}`,
        borderRadius: isMobile ? '10px' : '12px',
        marginBottom: isMobile ? '16px' : '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isMobile ? '40px' : '48px',
          height: isMobile ? '40px' : '48px',
          backgroundColor: theme.accentColor,
          borderRadius: '50%',
          marginRight: isMobile ? '14px' : '20px',
          flexShrink: 0,
        }}
      >
        <Info size={isMobile ? 20 : 24} color="#1a1a1a" />
      </div>

      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: isMobile ? '17px' : '20px',
            fontWeight: '500',
            margin: '0 0 8px 0',
            color: theme.textColor,
          }}
        >
          {question.title}
        </h3>

        {question.description && (
          <p
            style={{
              fontSize: isMobile ? '14px' : '16px',
              margin: '0',
              color: theme.textColor,
              opacity: 0.8,
              lineHeight: '1.5',
            }}
          >
            {question.description}
          </p>
        )}
      </div>
    </div>
  );
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
