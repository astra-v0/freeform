export { SurveyBuilder } from './SurveyBuilder.js';
export { SurveyEngine } from './core/SurveyEngine.js';
export { DataExporter } from './export/DataExporter.js';

export { Survey } from './react/Survey.js';
export { SurveyBuilder as ReactSurveyBuilder } from './react/SurveyBuilder.js';
export { SimpleSurvey } from './react/SimpleSurvey.js';
export type { SimpleQuestion, SimpleSurveyResult, SimpleSurveyProps } from './react/SimpleSurvey.js';
export { SurveyWithAnalytics } from './react/SurveyWithAnalytics.js';
export type { SurveyWithAnalyticsProps } from './react/SurveyWithAnalytics.js';

// Analytics exports (developer-only)
export { SurveyAnalytics } from './analytics/SurveyAnalytics.js';
export { useSurveyAnalytics } from './analytics/useSurveyAnalytics.js';
export type { UseSurveyAnalyticsOptions } from './analytics/useSurveyAnalytics.js';
export {
  formatTime,
  formatTimeSeconds,
  formatTimeMinutes,
  calculateCompletionPercentage,
  getSlowestQuestions,
  getFastestQuestions,
  getProblemQuestions,
  exportToCSV,
  exportTimingsToCSV,
  downloadCSV,
  printSummary,
  exportToJSON,
  calculateMedianTime,
  getDashboardData
} from './analytics/AnalyticsUtils.js';

import { SurveyBuilder } from './SurveyBuilder.js';
export type {
  SurveyConfig,
  SurveyTheme,
  Question,
  QuestionBase,
  TextQuestion,
  ChoiceQuestion,
  ChoiceOption,
  FeedbackFormQuestion,
  ConditionalQuestion,
  UserAnswer,
  SurveyResponse,
  SurveyFlowState,
  ExportOptions,
  SurveyResults
} from './types/index.js';

// Analytics types
export type {
  QuestionTimingData,
  SurveyAnalyticsData,
  AnalyticsSnapshot,
  AbandonedSurveyData,
  SurveyAnalyticsSummary,
  AnalyticsConfig
} from './types/analytics.js';

export { QuestionRenderer } from './components/QuestionRenderer.js';
export { TextQuestionRenderer } from './components/TextQuestionRenderer.js';
export { ChoiceQuestionRenderer } from './components/ChoiceQuestionRenderer.js';
export { FeedbackFormRenderer } from './components/FeedbackFormRenderer.js';

export const createSurvey = SurveyBuilder.createConfig;
export const createTheme = SurveyBuilder.createTheme;
export const createTextQuestion = SurveyBuilder.createTextQuestion;
export const createChoiceQuestion = SurveyBuilder.createChoiceQuestion;
export const createFeedbackForm = SurveyBuilder.createFeedbackForm;

export const VERSION = '1.0.0';
