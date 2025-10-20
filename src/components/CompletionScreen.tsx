import React from 'react';
import { SurveyTheme } from '../types/index.js';

interface CompletionScreenProps {
  theme: SurveyTheme;
  isMobile: boolean;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  theme,
  isMobile,
}) => {
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
};
