/**
 * Survey component with integrated analytics
 * 
 * This is an enhanced version of the Survey component that includes built-in analytics tracking.
 * Use this for development and testing to automatically collect analytics data.
 */

import React, { useEffect } from 'react';
import { Survey } from './Survey.js';
import { SurveyConfig, SurveyResponse } from '../types/index.js';
import { useSurveyAnalytics, UseSurveyAnalyticsOptions } from '../analytics/useSurveyAnalytics.js';
import { SurveyAnalytics } from '../analytics/SurveyAnalytics.js';

export interface SurveyWithAnalyticsProps {
  config: SurveyConfig;
  sessionId?: string;
  analyticsConfig?: Partial<Omit<UseSurveyAnalyticsOptions, 'surveyId' | 'sessionId' | 'totalQuestions'>>;
  onComplete?: (response: SurveyResponse, analytics: SurveyAnalytics) => void;
  onAnalyticsUpdate?: (analytics: SurveyAnalytics) => void;
}

export const SurveyWithAnalytics: React.FC<SurveyWithAnalyticsProps> = ({
  config,
  sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  analyticsConfig = {},
  onComplete,
  onAnalyticsUpdate
}) => {
  const analytics = useSurveyAnalytics({
    surveyId: config.id,
    sessionId,
    totalQuestions: config.questions.length,
    enableTracking: true,
    persistToStorage: true,
    ...analyticsConfig
  });

  // Track the first question
  useEffect(() => {
    if (config.startQuestionId) {
      analytics.startQuestion(config.startQuestionId);
    }
  }, [config.startQuestionId]);

  const handleAnswer = (answer: any) => {
    // Track question completion
    if (answer.questionId) {
      analytics.endQuestion(answer.questionId, true);
    }

    // Notify about analytics update
    const analyticsInstance = analytics.getAnalytics();
    if (onAnalyticsUpdate && analyticsInstance) {
      onAnalyticsUpdate(analyticsInstance);
    }
  };

  const handleComplete = (response: SurveyResponse) => {
    analytics.completeSurvey();
    
    const analyticsInstance = analytics.getAnalytics();
    if (onComplete && analyticsInstance) {
      onComplete(response, analyticsInstance);
    }
  };

  return (
    <Survey
      config={config}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
    />
  );
};

