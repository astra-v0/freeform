/**
 * Survey Analytics Module
 * 
 * Developer-only analytics for tracking survey performance, timing, and abandonment.
 * This module is not intended for end-users.
 * 
 * @module analytics
 * 
 * @example Basic usage with vanilla JS
 * ```typescript
 * import { SurveyAnalytics } from 'freeform-survey/analytics';
 * 
 * const analytics = new SurveyAnalytics('survey-123', 'session-456', 10, {
 *   enableTracking: true,
 *   persistToStorage: true
 * });
 * 
 * analytics.startQuestion('q1');
 * // ... user answers ...
 * analytics.endQuestion('q1', true);
 * 
 * const snapshot = analytics.getSnapshot();
 * console.log('Progress:', snapshot.progress.completionPercentage + '%');
 * ```
 * 
 * @example React usage
 * ```typescript
 * import { useSurveyAnalytics } from 'freeform-survey/analytics';
 * 
 * function MySurvey() {
 *   const analytics = useSurveyAnalytics({
 *     surveyId: 'survey-123',
 *     sessionId: 'session-456',
 *     totalQuestions: 10,
 *     enableTracking: true,
 *     onComplete: (analytics) => {
 *       console.log('Survey completed!', analytics.getData());
 *     }
 *   });
 *   
 *   // Use analytics.startQuestion, analytics.endQuestion, etc.
 * }
 * ```
 * 
 * @example Getting summary across all sessions
 * ```typescript
 * import { SurveyAnalytics, printSummary } from 'freeform-survey/analytics';
 * 
 * const summary = SurveyAnalytics.getSummary('survey-123');
 * printSummary(summary);
 * ```
 */

export { SurveyAnalytics } from './SurveyAnalytics.js';
export { useSurveyAnalytics } from './useSurveyAnalytics.js';
export type { UseSurveyAnalyticsOptions } from './useSurveyAnalytics.js';

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
} from './AnalyticsUtils.js';

export type {
  QuestionTimingData,
  SurveyAnalyticsData,
  AnalyticsSnapshot,
  AbandonedSurveyData,
  SurveyAnalyticsSummary,
  AnalyticsConfig
} from '../types/analytics.js';

