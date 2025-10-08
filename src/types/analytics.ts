/**
 * Analytics types for survey tracking
 * These types are for developer use only - not exposed to end users
 */

export interface QuestionTimingData {
  questionId: string;
  startTime: Date;
  endTime?: Date;
  timeSpentMs?: number;
}

export interface SurveyAnalyticsData {
  surveyId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  totalTimeMs?: number;
  questionTimings: QuestionTimingData[];
  currentQuestionId: string | null;
  completed: boolean;
  abandoned: boolean;
  lastActivityTime: Date;
  visitedQuestions: string[];
  answeredQuestions: string[];
}

export interface AnalyticsSnapshot {
  surveyId: string;
  sessionId: string;
  timestamp: Date;
  currentQuestionId: string | null;
  progress: {
    totalQuestions: number;
    answeredQuestions: number;
    completionPercentage: number;
  };
  timing: {
    totalTimeMs: number;
    averageTimePerQuestionMs: number;
    currentQuestionTimeMs: number;
  };
}

export interface AbandonedSurveyData {
  surveyId: string;
  sessionId: string;
  abandonedAt: Date;
  lastQuestionId: string;
  questionsCompleted: number;
  totalQuestions: number;
  timeSpentMs: number;
  completionPercentage: number;
}

export interface SurveyAnalyticsSummary {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  completionRate: number;
  averageCompletionTimeMs: number;
  averageTimePerQuestionMs: number;
  questionAnalytics: {
    questionId: string;
    averageTimeMs: number;
    abandonmentRate: number;
    timesViewed: number;
  }[];
  abandonedSurveys: AbandonedSurveyData[];
}

export interface AnalyticsConfig {
  enableTracking: boolean;
  storageKey?: string;
  abandonmentThresholdMs?: number; // Time after which a survey is considered abandoned
  persistToStorage?: boolean;
}

