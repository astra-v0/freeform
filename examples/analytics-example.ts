/**
 * Analytics Examples
 * 
 * This file demonstrates various ways to use the analytics module
 */

import {
  SurveyAnalytics,
  formatTime,
  printSummary,
  exportToCSV,
  downloadCSV,
  getProblemQuestions,
  getDashboardData
} from '../src/analytics/index.js';

// Example 1: Basic tracking
function basicTrackingExample() {
  console.log('\n=== Example 1: Basic Tracking ===\n');
  
  const analytics = new SurveyAnalytics(
    'survey-123',
    'session-456',
    5,
    {
      enableTracking: true,
      persistToStorage: true
    }
  );

  // Simulate answering questions
  analytics.startQuestion('q1');
  setTimeout(() => {
    analytics.endQuestion('q1', true);
    console.log('Question 1 completed');
    
    const snapshot = analytics.getSnapshot();
    console.log('Progress:', snapshot.progress.completionPercentage + '%');
  }, 1000);
}

// Example 2: Get summary across all sessions
function summaryExample() {
  console.log('\n=== Example 2: Survey Summary ===\n');
  
  // Get summary for a specific survey
  const summary = SurveyAnalytics.getSummary('survey-123');
  
  // Print formatted summary
  printSummary(summary);
  
  // Access specific data
  console.log('\nCustom Summary:');
  console.log('- Completion Rate:', summary.completionRate.toFixed(2) + '%');
  console.log('- Average Time:', formatTime(summary.averageCompletionTimeMs));
  console.log('- Abandoned Sessions:', summary.abandonedSessions);
}

// Example 3: Identify problem questions
function problemQuestionsExample() {
  console.log('\n=== Example 3: Problem Questions ===\n');
  
  const summary = SurveyAnalytics.getSummary('survey-123');
  const problems = getProblemQuestions(summary, 15); // 15% abandonment threshold
  
  if (problems.length > 0) {
    console.log('Found problem questions:');
    problems.forEach(p => {
      console.log(`- ${p.questionId}:`);
      console.log(`  Abandonment Rate: ${p.abandonmentRate.toFixed(2)}%`);
      console.log(`  Average Time: ${formatTime(p.averageTimeMs)}`);
    });
  } else {
    console.log('No problem questions found!');
  }
}

// Example 4: Export analytics data
function exportExample() {
  console.log('\n=== Example 4: Export Data ===\n');
  
  // Get all sessions
  const sessions = SurveyAnalytics.getAllSessions();
  console.log(`Found ${sessions.length} sessions`);
  
  // Export to CSV
  const csv = exportToCSV(sessions);
  console.log('CSV generated');
  console.log('First 200 characters:', csv.substring(0, 200));
  
  // In a browser, you could download it:
  // downloadCSV(csv, 'survey-analytics.csv');
}

// Example 5: Dashboard data
function dashboardExample() {
  console.log('\n=== Example 5: Dashboard Data ===\n');
  
  const summary = SurveyAnalytics.getSummary('survey-123');
  const dashboard = getDashboardData(summary);
  
  console.log('Dashboard Overview:');
  console.log(JSON.stringify(dashboard.overview, null, 2));
  
  if (dashboard.problemQuestions.length > 0) {
    console.log('\nProblem Questions:');
    console.log(JSON.stringify(dashboard.problemQuestions, null, 2));
  }
  
  if (dashboard.recentAbandoned.length > 0) {
    console.log('\nRecent Abandoned Surveys:');
    console.log(JSON.stringify(dashboard.recentAbandoned, null, 2));
  }
}

// Example 6: Check for abandoned surveys
function abandonmentDetectionExample() {
  console.log('\n=== Example 6: Abandonment Detection ===\n');
  
  const analytics = new SurveyAnalytics(
    'survey-123',
    'session-789',
    10,
    {
      enableTracking: true,
      abandonmentThresholdMs: 5 * 60 * 1000 // 5 minutes
    }
  );

  analytics.startQuestion('q1');
  
  // Check if abandoned
  if (analytics.isAbandoned()) {
    const abandoned = analytics.getAbandonedData();
    console.log('Survey was abandoned at question:', abandoned?.lastQuestionId);
    console.log('Completion:', abandoned?.completionPercentage + '%');
  } else {
    console.log('Survey is still active');
  }
}

// Example 7: Complete survey flow
async function completeSurveyFlowExample() {
  console.log('\n=== Example 7: Complete Survey Flow ===\n');
  
  const analytics = new SurveyAnalytics(
    'survey-complete',
    `session_${Date.now()}`,
    3,
    { enableTracking: true }
  );

  // Question 1
  console.log('Starting question 1...');
  analytics.startQuestion('q1');
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2s
  analytics.endQuestion('q1', true);
  console.log('Question 1 completed');

  // Question 2
  console.log('Starting question 2...');
  analytics.startQuestion('q2');
  await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate 3s
  analytics.endQuestion('q2', true);
  console.log('Question 2 completed');

  // Question 3
  console.log('Starting question 3...');
  analytics.startQuestion('q3');
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate 1.5s
  analytics.endQuestion('q3', true);
  console.log('Question 3 completed');

  // Complete survey
  analytics.completeSurvey();
  console.log('Survey completed!');

  // Get final data
  const data = analytics.getData();
  console.log('\nFinal Analytics:');
  console.log('- Total Time:', formatTime(data.totalTimeMs || 0));
  console.log('- Questions Answered:', data.answeredQuestions.length);
  console.log('- Completed:', data.completed);
  
  // Get timing for each question
  console.log('\nQuestion Timings:');
  data.questionTimings.forEach(t => {
    console.log(`- ${t.questionId}: ${formatTime(t.timeSpentMs || 0)}`);
  });
}

// Run examples
async function runExamples() {
  console.log('🔍 Survey Analytics Examples\n');
  console.log('================================');
  
  // Note: Some examples require existing data in localStorage
  // You may need to run a survey first to see meaningful results
  
  try {
    await completeSurveyFlowExample();
    summaryExample();
    problemQuestionsExample();
    dashboardExample();
    exportExample();
    abandonmentDetectionExample();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run:
// runExamples();

export {
  basicTrackingExample,
  summaryExample,
  problemQuestionsExample,
  exportExample,
  dashboardExample,
  abandonmentDetectionExample,
  completeSurveyFlowExample
};

