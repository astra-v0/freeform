/**
 * React hook for survey analytics
 * Developer-only hook for tracking survey metrics
 */

import { useRef, useEffect, useCallback } from 'react';
import { SurveyAnalytics } from './SurveyAnalytics.js';
import { AnalyticsConfig, AnalyticsSnapshot } from '../types/analytics.js';

export interface UseSurveyAnalyticsOptions extends AnalyticsConfig {
  surveyId: string;
  sessionId: string;
  totalQuestions: number;
  onComplete?: (analytics: SurveyAnalytics) => void;
  onAbandon?: (analytics: SurveyAnalytics) => void;
}

export function useSurveyAnalytics(options: UseSurveyAnalyticsOptions) {
  const analyticsRef = useRef<SurveyAnalytics | null>(null);
  const currentQuestionRef = useRef<string | null>(null);

  // Initialize analytics
  useEffect(() => {
    if (!analyticsRef.current) {
      analyticsRef.current = new SurveyAnalytics(
        options.surveyId,
        options.sessionId,
        options.totalQuestions,
        {
          enableTracking: options.enableTracking,
          storageKey: options.storageKey,
          abandonmentThresholdMs: options.abandonmentThresholdMs,
          persistToStorage: options.persistToStorage
        }
      );
    }
  }, [options.surveyId, options.sessionId, options.totalQuestions]);

  // Track question changes
  const startQuestion = useCallback((questionId: string) => {
    if (!analyticsRef.current) return;

    // End previous question if any
    if (currentQuestionRef.current && currentQuestionRef.current !== questionId) {
      analyticsRef.current.endQuestion(currentQuestionRef.current, true);
    }

    analyticsRef.current.startQuestion(questionId);
    currentQuestionRef.current = questionId;
  }, []);

  const endQuestion = useCallback((questionId: string, answered: boolean = true) => {
    if (!analyticsRef.current) return;

    analyticsRef.current.endQuestion(questionId, answered);
    
    if (currentQuestionRef.current === questionId) {
      currentQuestionRef.current = null;
    }
  }, []);

  const completeSurvey = useCallback(() => {
    if (!analyticsRef.current) return;

    analyticsRef.current.completeSurvey();
    
    if (options.onComplete) {
      options.onComplete(analyticsRef.current);
    }
  }, [options.onComplete]);

  const abandonSurvey = useCallback(() => {
    if (!analyticsRef.current) return;

    analyticsRef.current.abandonSurvey();
    
    if (options.onAbandon) {
      options.onAbandon(analyticsRef.current);
    }
  }, [options.onAbandon]);

  const getSnapshot = useCallback((): AnalyticsSnapshot | null => {
    if (!analyticsRef.current) return null;
    return analyticsRef.current.getSnapshot();
  }, []);

  const getAnalytics = useCallback((): SurveyAnalytics | null => {
    return analyticsRef.current;
  }, []);

  // Check for abandonment on unmount
  useEffect(() => {
    return () => {
      if (analyticsRef.current && !analyticsRef.current.getData().completed) {
        if (analyticsRef.current.isAbandoned()) {
          analyticsRef.current.abandonSurvey();
          
          if (options.onAbandon) {
            options.onAbandon(analyticsRef.current);
          }
        }
      }
    };
  }, [options.onAbandon]);

  return {
    startQuestion,
    endQuestion,
    completeSurvey,
    abandonSurvey,
    getSnapshot,
    getAnalytics
  };
}

