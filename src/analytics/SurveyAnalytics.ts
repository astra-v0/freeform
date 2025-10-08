/**
 * SurveyAnalytics - Developer-only analytics module
 * 
 * This module tracks survey progress, timing, and abandonment.
 * It is designed for developers to analyze survey performance and user behavior.
 * 
 * Features:
 * - Question-level timing tracking
 * - Survey completion time tracking
 * - Progress persistence
 * - Abandonment detection
 * 
 * @example
 * ```typescript
 * const analytics = new SurveyAnalytics('survey-123', 'session-456', {
 *   enableTracking: true,
 *   persistToStorage: true
 * });
 * 
 * analytics.startQuestion('q1');
 * // ... user answers question ...
 * analytics.endQuestion('q1');
 * 
 * const snapshot = analytics.getSnapshot();
 * console.log('Time spent:', snapshot.timing.totalTimeMs);
 * ```
 */

import {
  SurveyAnalyticsData,
  QuestionTimingData,
  AnalyticsSnapshot,
  AbandonedSurveyData,
  SurveyAnalyticsSummary,
  AnalyticsConfig
} from '../types/analytics.js';

const DEFAULT_STORAGE_KEY = 'survey_analytics';
const DEFAULT_ABANDONEMENT_THRESHOLD = 30 * 60 * 1000; // 30 minutes

export class SurveyAnalytics {
  private data: SurveyAnalyticsData;
  private config: Required<AnalyticsConfig>;
  private currentQuestionStartTime: Date | null = null;
  private totalQuestions: number;

  constructor(
    surveyId: string,
    sessionId: string,
    totalQuestions: number,
    config: AnalyticsConfig = { enableTracking: true }
  ) {
    this.totalQuestions = totalQuestions;
    this.config = {
      enableTracking: config.enableTracking ?? true,
      storageKey: config.storageKey ?? DEFAULT_STORAGE_KEY,
      abandonmentThresholdMs: config.abandonmentThresholdMs ?? DEFAULT_ABANDONEMENT_THRESHOLD,
      persistToStorage: config.persistToStorage ?? true
    };

    // Try to restore from storage
    const restored = this.restoreFromStorage(sessionId);
    
    if (restored) {
      this.data = restored;
    } else {
      this.data = {
        surveyId,
        sessionId,
        startTime: new Date(),
        questionTimings: [],
        currentQuestionId: null,
        completed: false,
        abandoned: false,
        lastActivityTime: new Date(),
        visitedQuestions: [],
        answeredQuestions: []
      };
    }

    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Start tracking time for a specific question
   */
  public startQuestion(questionId: string): void {
    if (!this.config.enableTracking) return;

    this.currentQuestionStartTime = new Date();
    this.data.currentQuestionId = questionId;
    this.data.lastActivityTime = new Date();

    if (!this.data.visitedQuestions.includes(questionId)) {
      this.data.visitedQuestions.push(questionId);
    }

    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * End tracking time for a specific question and record the answer
   */
  public endQuestion(questionId: string, answered: boolean = true): void {
    if (!this.config.enableTracking) return;

    const endTime = new Date();
    
    if (this.currentQuestionStartTime && this.data.currentQuestionId === questionId) {
      const timeSpentMs = endTime.getTime() - this.currentQuestionStartTime.getTime();
      
      const timing: QuestionTimingData = {
        questionId,
        startTime: this.currentQuestionStartTime,
        endTime,
        timeSpentMs
      };

      this.data.questionTimings.push(timing);
      
      if (answered && !this.data.answeredQuestions.includes(questionId)) {
        this.data.answeredQuestions.push(questionId);
      }

      this.currentQuestionStartTime = null;
    }

    this.data.lastActivityTime = new Date();

    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Mark the survey as completed
   */
  public completeSurvey(): void {
    if (!this.config.enableTracking) return;

    // End current question if any
    if (this.data.currentQuestionId) {
      this.endQuestion(this.data.currentQuestionId, true);
    }

    const endTime = new Date();
    this.data.endTime = endTime;
    this.data.completed = true;
    this.data.totalTimeMs = endTime.getTime() - this.data.startTime.getTime();
    this.data.currentQuestionId = null;
    this.data.lastActivityTime = endTime;

    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Mark the survey as abandoned
   */
  public abandonSurvey(): void {
    if (!this.config.enableTracking) return;

    this.data.abandoned = true;
    this.data.lastActivityTime = new Date();

    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Get current analytics snapshot
   */
  public getSnapshot(): AnalyticsSnapshot {
    const now = new Date();
    const totalTimeMs = this.data.endTime 
      ? this.data.totalTimeMs! 
      : now.getTime() - this.data.startTime.getTime();

    const currentQuestionTimeMs = this.currentQuestionStartTime
      ? now.getTime() - this.currentQuestionStartTime.getTime()
      : 0;

    const answeredCount = this.data.answeredQuestions.length;
    const averageTimePerQuestionMs = answeredCount > 0
      ? this.data.questionTimings.reduce((sum, t) => sum + (t.timeSpentMs || 0), 0) / answeredCount
      : 0;

    return {
      surveyId: this.data.surveyId,
      sessionId: this.data.sessionId,
      timestamp: now,
      currentQuestionId: this.data.currentQuestionId,
      progress: {
        totalQuestions: this.totalQuestions,
        answeredQuestions: answeredCount,
        completionPercentage: (answeredCount / this.totalQuestions) * 100
      },
      timing: {
        totalTimeMs,
        averageTimePerQuestionMs,
        currentQuestionTimeMs
      }
    };
  }

  /**
   * Get full analytics data
   */
  public getData(): SurveyAnalyticsData {
    return { ...this.data };
  }

  /**
   * Get timing for a specific question
   */
  public getQuestionTiming(questionId: string): QuestionTimingData | undefined {
    return this.data.questionTimings.find(t => t.questionId === questionId);
  }

  /**
   * Get all question timings
   */
  public getAllQuestionTimings(): QuestionTimingData[] {
    return [...this.data.questionTimings];
  }

  /**
   * Check if survey is abandoned based on inactivity threshold
   */
  public isAbandoned(): boolean {
    if (this.data.completed || this.data.abandoned) {
      return this.data.abandoned;
    }

    const now = new Date();
    const inactivityMs = now.getTime() - this.data.lastActivityTime.getTime();
    
    return inactivityMs > this.config.abandonmentThresholdMs;
  }

  /**
   * Get abandoned survey data if applicable
   */
  public getAbandonedData(): AbandonedSurveyData | null {
    if (!this.isAbandoned() || !this.data.currentQuestionId) {
      return null;
    }

    const timeSpentMs = this.data.lastActivityTime.getTime() - this.data.startTime.getTime();
    const questionsCompleted = this.data.answeredQuestions.length;

    return {
      surveyId: this.data.surveyId,
      sessionId: this.data.sessionId,
      abandonedAt: this.data.lastActivityTime,
      lastQuestionId: this.data.currentQuestionId,
      questionsCompleted,
      totalQuestions: this.totalQuestions,
      timeSpentMs,
      completionPercentage: (questionsCompleted / this.totalQuestions) * 100
    };
  }

  /**
   * Save analytics data to storage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const allData = this.getAllStoredData();
      allData[this.data.sessionId] = {
        ...this.data,
        startTime: this.data.startTime.toISOString(),
        endTime: this.data.endTime?.toISOString(),
        lastActivityTime: this.data.lastActivityTime.toISOString(),
        questionTimings: this.data.questionTimings.map(t => ({
          ...t,
          startTime: t.startTime.toISOString(),
          endTime: t.endTime?.toISOString()
        }))
      };
      
      localStorage.setItem(this.config.storageKey, JSON.stringify(allData));
    } catch (error) {
      console.error('Failed to save analytics to storage:', error);
    }
  }

  /**
   * Restore analytics data from storage
   */
  private restoreFromStorage(sessionId: string): SurveyAnalyticsData | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const allData = this.getAllStoredData();
      const stored = allData[sessionId];
      
      if (!stored) return null;

      return {
        ...stored,
        startTime: new Date(stored.startTime),
        endTime: stored.endTime ? new Date(stored.endTime) : undefined,
        lastActivityTime: new Date(stored.lastActivityTime),
        questionTimings: stored.questionTimings.map((t: any) => ({
          ...t,
          startTime: new Date(t.startTime),
          endTime: t.endTime ? new Date(t.endTime) : undefined
        }))
      };
    } catch (error) {
      console.error('Failed to restore analytics from storage:', error);
      return null;
    }
  }

  /**
   * Get all stored analytics data
   */
  private getAllStoredData(): Record<string, any> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return {};
    }

    try {
      const data = localStorage.getItem(this.config.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get stored analytics data:', error);
      return {};
    }
  }

  /**
   * Clear analytics data from storage
   */
  public clearStorage(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const allData = this.getAllStoredData();
      delete allData[this.data.sessionId];
      localStorage.setItem(this.config.storageKey, JSON.stringify(allData));
    } catch (error) {
      console.error('Failed to clear analytics from storage:', error);
    }
  }

  /**
   * Static method to get all stored sessions
   */
  public static getAllSessions(storageKey: string = DEFAULT_STORAGE_KEY): SurveyAnalyticsData[] {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const data = localStorage.getItem(storageKey);
      if (!data) return [];

      const allData = JSON.parse(data);
      return Object.values(allData).map((stored: any) => ({
        ...stored,
        startTime: new Date(stored.startTime),
        endTime: stored.endTime ? new Date(stored.endTime) : undefined,
        lastActivityTime: new Date(stored.lastActivityTime),
        questionTimings: stored.questionTimings.map((t: any) => ({
          ...t,
          startTime: new Date(t.startTime),
          endTime: t.endTime ? new Date(t.endTime) : undefined
        }))
      }));
    } catch (error) {
      console.error('Failed to get all sessions:', error);
      return [];
    }
  }

  /**
   * Static method to get analytics summary for all sessions of a survey
   */
  public static getSummary(
    surveyId: string, 
    storageKey: string = DEFAULT_STORAGE_KEY
  ): SurveyAnalyticsSummary {
    const allSessions = SurveyAnalytics.getAllSessions(storageKey);
    const surveySessions = allSessions.filter(s => s.surveyId === surveyId);

    const completedSessions = surveySessions.filter(s => s.completed);
    const abandonedSessions = surveySessions.filter(s => s.abandoned || 
      (!s.completed && new Date().getTime() - s.lastActivityTime.getTime() > DEFAULT_ABANDONEMENT_THRESHOLD)
    );

    const totalSessions = surveySessions.length;
    const completionRate = totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0;

    const completionTimes = completedSessions
      .filter(s => s.totalTimeMs)
      .map(s => s.totalTimeMs!);
    const averageCompletionTimeMs = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    // Calculate average time per question
    const allTimings = surveySessions.flatMap(s => s.questionTimings);
    const averageTimePerQuestionMs = allTimings.length > 0
      ? allTimings.reduce((sum, t) => sum + (t.timeSpentMs || 0), 0) / allTimings.length
      : 0;

    // Calculate per-question analytics
    const questionMap = new Map<string, { times: number[], views: number, abandonments: number }>();
    
    surveySessions.forEach(session => {
      session.questionTimings.forEach(timing => {
        if (!questionMap.has(timing.questionId)) {
          questionMap.set(timing.questionId, { times: [], views: 0, abandonments: 0 });
        }
        const qData = questionMap.get(timing.questionId)!;
        qData.views++;
        if (timing.timeSpentMs) {
          qData.times.push(timing.timeSpentMs);
        }
      });

      // Track abandonments
      if (session.abandoned || (!session.completed && session.currentQuestionId)) {
        const lastQuestionId = session.currentQuestionId;
        if (lastQuestionId && questionMap.has(lastQuestionId)) {
          questionMap.get(lastQuestionId)!.abandonments++;
        }
      }
    });

    const questionAnalytics = Array.from(questionMap.entries()).map(([questionId, data]) => ({
      questionId,
      averageTimeMs: data.times.length > 0 
        ? data.times.reduce((a, b) => a + b, 0) / data.times.length 
        : 0,
      abandonmentRate: data.views > 0 ? (data.abandonments / data.views) * 100 : 0,
      timesViewed: data.views
    }));

    // Get abandoned survey details
    const abandonedSurveys: AbandonedSurveyData[] = abandonedSessions
      .filter(s => s.currentQuestionId)
      .map(s => {
        const timeSpentMs = s.endTime
          ? s.endTime.getTime() - s.startTime.getTime()
          : s.lastActivityTime.getTime() - s.startTime.getTime();
        
        return {
          surveyId: s.surveyId,
          sessionId: s.sessionId,
          abandonedAt: s.lastActivityTime,
          lastQuestionId: s.currentQuestionId!,
          questionsCompleted: s.answeredQuestions.length,
          totalQuestions: s.visitedQuestions.length,
          timeSpentMs,
          completionPercentage: s.visitedQuestions.length > 0
            ? (s.answeredQuestions.length / s.visitedQuestions.length) * 100
            : 0
        };
      });

    return {
      totalSessions,
      completedSessions: completedSessions.length,
      abandonedSessions: abandonedSessions.length,
      completionRate,
      averageCompletionTimeMs,
      averageTimePerQuestionMs,
      questionAnalytics,
      abandonedSurveys
    };
  }

  /**
   * Static method to clear all analytics data
   */
  public static clearAllData(storageKey: string = DEFAULT_STORAGE_KEY): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear all analytics data:', error);
    }
  }
}

