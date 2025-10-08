/**
 * Utility functions for working with survey analytics
 * Developer-only utilities for formatting and analyzing data
 */

import { 
  QuestionTimingData, 
  SurveyAnalyticsData, 
  SurveyAnalyticsSummary
} from '../types/analytics.js';

/**
 * Format milliseconds to human-readable time string
 */
export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format milliseconds to seconds with decimal
 */
export function formatTimeSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format milliseconds to minutes with decimal
 */
export function formatTimeMinutes(ms: number): string {
  return `${(ms / 60000).toFixed(2)}m`;
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercentage(
  answeredQuestions: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return (answeredQuestions / totalQuestions) * 100;
}

/**
 * Get slowest questions from timing data
 */
export function getSlowestQuestions(
  timings: QuestionTimingData[],
  limit: number = 5
): QuestionTimingData[] {
  return [...timings]
    .filter(t => t.timeSpentMs !== undefined)
    .sort((a, b) => (b.timeSpentMs || 0) - (a.timeSpentMs || 0))
    .slice(0, limit);
}

/**
 * Get fastest questions from timing data
 */
export function getFastestQuestions(
  timings: QuestionTimingData[],
  limit: number = 5
): QuestionTimingData[] {
  return [...timings]
    .filter(t => t.timeSpentMs !== undefined)
    .sort((a, b) => (a.timeSpentMs || 0) - (b.timeSpentMs || 0))
    .slice(0, limit);
}

/**
 * Get questions where users spend the most time (potential problem areas)
 */
export function getProblemQuestions(
  summary: SurveyAnalyticsSummary,
  threshold: number = 20 // abandonment rate threshold percentage
): Array<{ questionId: string; abandonmentRate: number; averageTimeMs: number }> {
  return summary.questionAnalytics
    .filter(q => q.abandonmentRate > threshold)
    .sort((a, b) => b.abandonmentRate - a.abandonmentRate)
    .map(q => ({
      questionId: q.questionId,
      abandonmentRate: q.abandonmentRate,
      averageTimeMs: q.averageTimeMs
    }));
}

/**
 * Export analytics data to CSV format
 */
export function exportToCSV(data: SurveyAnalyticsData[]): string {
  const headers = [
    'Survey ID',
    'Session ID',
    'Start Time',
    'End Time',
    'Total Time (ms)',
    'Completed',
    'Abandoned',
    'Questions Answered',
    'Questions Visited'
  ];

  const rows = data.map(d => [
    d.surveyId,
    d.sessionId,
    d.startTime.toISOString(),
    d.endTime?.toISOString() || '',
    d.totalTimeMs || '',
    d.completed.toString(),
    d.abandoned.toString(),
    d.answeredQuestions.length.toString(),
    d.visitedQuestions.length.toString()
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csv;
}

/**
 * Export question timings to CSV format
 */
export function exportTimingsToCSV(data: SurveyAnalyticsData[]): string {
  const headers = [
    'Survey ID',
    'Session ID',
    'Question ID',
    'Start Time',
    'End Time',
    'Time Spent (ms)'
  ];

  const rows: string[][] = [];
  data.forEach(session => {
    session.questionTimings.forEach(timing => {
      rows.push([
        session.surveyId,
        session.sessionId,
        timing.questionId,
        timing.startTime.toISOString(),
        timing.endTime?.toISOString() || '',
        timing.timeSpentMs?.toString() || ''
      ]);
    });
  });

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csv;
}

/**
 * Download data as CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Print analytics summary to console
 */
export function printSummary(summary: SurveyAnalyticsSummary): void {
  console.group('📊 Survey Analytics Summary');
  
  console.log('📈 Overview');
  console.log(`  Total Sessions: ${summary.totalSessions}`);
  console.log(`  Completed: ${summary.completedSessions}`);
  console.log(`  Abandoned: ${summary.abandonedSessions}`);
  console.log(`  Completion Rate: ${summary.completionRate.toFixed(2)}%`);
  console.log(`  Average Completion Time: ${formatTime(summary.averageCompletionTimeMs)}`);
  console.log(`  Average Time per Question: ${formatTime(summary.averageTimePerQuestionMs)}`);
  
  if (summary.questionAnalytics.length > 0) {
    console.log('\n📋 Question Analytics');
    summary.questionAnalytics.forEach(q => {
      console.log(`  ${q.questionId}:`);
      console.log(`    Average Time: ${formatTime(q.averageTimeMs)}`);
      console.log(`    Abandonment Rate: ${q.abandonmentRate.toFixed(2)}%`);
      console.log(`    Times Viewed: ${q.timesViewed}`);
    });
  }
  
  if (summary.abandonedSurveys.length > 0) {
    console.log('\n⚠️ Abandoned Surveys');
    summary.abandonedSurveys.forEach(a => {
      console.log(`  Session ${a.sessionId}:`);
      console.log(`    Last Question: ${a.lastQuestionId}`);
      console.log(`    Completion: ${a.completionPercentage.toFixed(2)}%`);
      console.log(`    Time Spent: ${formatTime(a.timeSpentMs)}`);
    });
  }
  
  console.groupEnd();
}

/**
 * Get analytics data as JSON string
 */
export function exportToJSON(data: SurveyAnalyticsData | SurveyAnalyticsSummary): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Calculate median time from array of timings
 */
export function calculateMedianTime(timings: QuestionTimingData[]): number {
  const times = timings
    .filter(t => t.timeSpentMs !== undefined)
    .map(t => t.timeSpentMs!)
    .sort((a, b) => a - b);

  if (times.length === 0) return 0;

  const mid = Math.floor(times.length / 2);
  return times.length % 2 === 0
    ? (times[mid - 1] + times[mid]) / 2
    : times[mid];
}

/**
 * Get analytics dashboard data for visualization
 */
export function getDashboardData(summary: SurveyAnalyticsSummary) {
  return {
    overview: {
      totalSessions: summary.totalSessions,
      completedSessions: summary.completedSessions,
      abandonedSessions: summary.abandonedSessions,
      completionRate: summary.completionRate,
      averageCompletionTime: formatTime(summary.averageCompletionTimeMs),
      averageTimePerQuestion: formatTime(summary.averageTimePerQuestionMs)
    },
    problemQuestions: getProblemQuestions(summary),
    questionPerformance: summary.questionAnalytics.map(q => ({
      questionId: q.questionId,
      averageTime: formatTime(q.averageTimeMs),
      abandonmentRate: `${q.abandonmentRate.toFixed(2)}%`,
      views: q.timesViewed
    })),
    recentAbandoned: summary.abandonedSurveys
      .sort((a, b) => b.abandonedAt.getTime() - a.abandonedAt.getTime())
      .slice(0, 10)
      .map(a => ({
        sessionId: a.sessionId,
        lastQuestion: a.lastQuestionId,
        completion: `${a.completionPercentage.toFixed(2)}%`,
        timeSpent: formatTime(a.timeSpentMs),
        abandonedAt: a.abandonedAt.toISOString()
      }))
  };
}

