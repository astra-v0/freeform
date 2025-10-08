/**
 * React Analytics Examples
 * 
 * This file demonstrates how to use analytics in React applications
 */

import React, { useState, useEffect } from 'react';
import {
  useSurveyAnalytics,
  SurveyAnalytics,
  formatTime,
  printSummary,
  getDashboardData
} from '../src/index.js';
import type { SurveyConfig } from '../src/types/index.js';

// Example 1: Basic Survey with Analytics Hook
export function SurveyWithAnalyticsHook({ config }: { config: SurveyConfig }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState(0);

  const analytics = useSurveyAnalytics({
    surveyId: config.id,
    sessionId: `session_${Date.now()}`,
    totalQuestions: config.questions.length,
    enableTracking: true,
    persistToStorage: true,
    onComplete: (analytics) => {
      const data = analytics.getData();
      console.log('Survey completed!');
      console.log('Total time:', formatTime(data.totalTimeMs || 0));
      
      // Send to backend
      sendAnalyticsToBackend(data);
    },
    onAbandon: (analytics) => {
      const abandoned = analytics.getAbandonedData();
      console.warn('Survey abandoned at question:', abandoned?.lastQuestionId);
    }
  });

  useEffect(() => {
    // Track current question
    const questionId = config.questions[currentQuestion]?.id;
    if (questionId) {
      analytics.startQuestion(questionId);
    }
  }, [currentQuestion]);

  const handleAnswer = (questionId: string, answer: any) => {
    analytics.endQuestion(questionId, true);
    
    // Update progress
    const snapshot = analytics.getSnapshot();
    if (snapshot) {
      setProgress(snapshot.progress.completionPercentage);
    }
    
    // Move to next question
    if (currentQuestion < config.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analytics.completeSurvey();
    }
  };

  return (
    <div>
      <div>Progress: {progress.toFixed(0)}%</div>
      {/* Render your survey questions */}
    </div>
  );
}

// Example 2: Real-time Analytics Display
export function SurveyWithLiveAnalytics({ config }: { config: SurveyConfig }) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);

  const analytics = useSurveyAnalytics({
    surveyId: config.id,
    sessionId: `session_${Date.now()}`,
    totalQuestions: config.questions.length,
    enableTracking: true
  });

  useEffect(() => {
    // Update timing display every second
    const interval = setInterval(() => {
      const snapshot = analytics.getSnapshot();
      if (snapshot) {
        setTimeSpent(snapshot.timing.totalTimeMs);
        setQuestionTime(snapshot.timing.currentQuestionTimeMs);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [analytics]);

  return (
    <div>
      <div style={{ padding: '16px', backgroundColor: '#f5f5f5', marginBottom: '16px' }}>
        <h3>Analytics (Developer View)</h3>
        <p>Total Time: {formatTime(timeSpent)}</p>
        <p>Current Question Time: {formatTime(questionTime)}</p>
      </div>
      {/* Your survey UI */}
    </div>
  );
}

// Example 3: Admin Dashboard Component
export function AnalyticsDashboard({ surveyId }: { surveyId: string }) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load analytics data
    const data = SurveyAnalytics.getSummary(surveyId);
    setSummary(data);
    setLoading(false);
  }, [surveyId]);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!summary) {
    return <div>No analytics data available</div>;
  }

  const dashboard = getDashboardData(summary);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Survey Analytics Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard
          title="Total Sessions"
          value={dashboard.overview.totalSessions}
          color="#4A9EFF"
        />
        <StatCard
          title="Completion Rate"
          value={dashboard.overview.completionRate.toFixed(2) + '%'}
          color="#52c41a"
        />
        <StatCard
          title="Avg. Completion Time"
          value={dashboard.overview.averageCompletionTime}
          color="#fa8c16"
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2>Question Performance</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Question ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Avg. Time</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Abandonment Rate</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Views</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.questionPerformance.map((q: any) => (
              <tr key={q.questionId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px' }}>{q.questionId}</td>
                <td style={{ padding: '12px' }}>{q.averageTime}</td>
                <td style={{ 
                  padding: '12px',
                  color: parseFloat(q.abandonmentRate) > 20 ? '#ff4d4f' : '#000'
                }}>
                  {q.abandonmentRate}
                </td>
                <td style={{ padding: '12px' }}>{q.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dashboard.problemQuestions.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: '#ff4d4f' }}>⚠️ Problem Questions</h2>
          <div>
            {dashboard.problemQuestions.map((p: any) => (
              <div 
                key={p.questionId}
                style={{
                  padding: '16px',
                  backgroundColor: '#fff2e8',
                  borderLeft: '4px solid #fa8c16',
                  marginBottom: '8px'
                }}
              >
                <strong>{p.questionId}</strong>
                <div>Abandonment Rate: {p.abandonmentRate.toFixed(2)}%</div>
                <div>Average Time: {formatTime(p.averageTimeMs)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboard.recentAbandoned.length > 0 && (
        <div>
          <h2>Recent Abandoned Surveys</h2>
          <div>
            {dashboard.recentAbandoned.map((a: any) => (
              <div 
                key={a.sessionId}
                style={{
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  marginBottom: '8px',
                  borderRadius: '4px'
                }}
              >
                <div><strong>Session:</strong> {a.sessionId}</div>
                <div><strong>Last Question:</strong> {a.lastQuestion}</div>
                <div><strong>Completion:</strong> {a.completion}</div>
                <div><strong>Time Spent:</strong> {a.timeSpent}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '32px' }}>
        <button
          onClick={() => printSummary(summary)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4A9EFF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Print Summary to Console
        </button>
      </div>
    </div>
  );
}

// Helper component for stat cards
function StatCard({ title, value, color }: { title: string; value: any; color: string }) {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}

// Example 4: Automatic Analytics Tracking Component
export function AutoTrackedSurvey({ config }: { config: SurveyConfig }) {
  const analytics = useSurveyAnalytics({
    surveyId: config.id,
    sessionId: `session_${Date.now()}`,
    totalQuestions: config.questions.length,
    enableTracking: true,
    persistToStorage: true,
    onComplete: (analytics) => {
      const data = analytics.getData();
      
      // Automatically send to your analytics backend
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: data.surveyId,
          sessionId: data.sessionId,
          totalTime: data.totalTimeMs,
          questionTimings: data.questionTimings,
          completed: data.completed
        })
      });
    }
  });

  return (
    <div>
      {/* Your survey component */}
      {/* Analytics are tracked automatically through the hook */}
    </div>
  );
}

// Example 5: A/B Testing with Analytics
export function ABTestSurvey({ configA, configB }: { configA: SurveyConfig; configB: SurveyConfig }) {
  const [variant] = useState(Math.random() < 0.5 ? 'A' : 'B');
  const config = variant === 'A' ? configA : configB;

  const analytics = useSurveyAnalytics({
    surveyId: `${config.id}_${variant}`,
    sessionId: `${variant}_${Date.now()}`,
    totalQuestions: config.questions.length,
    enableTracking: true,
    onComplete: (analytics) => {
      const data = analytics.getData();
      
      // Track experiment results
      trackExperiment({
        experiment: 'survey_design',
        variant,
        metric: 'completion_time',
        value: data.totalTimeMs,
        metadata: {
          completed: data.completed,
          questionsAnswered: data.answeredQuestions.length
        }
      });
    }
  });

  return (
    <div>
      <div style={{ padding: '8px', backgroundColor: '#f0f0f0', marginBottom: '16px' }}>
        Testing Variant: {variant}
      </div>
      {/* Render survey based on variant */}
    </div>
  );
}

// Mock functions (implement these based on your backend)
function sendAnalyticsToBackend(data: any) {
  console.log('Sending analytics to backend:', data);
  // Implement your backend integration
}

function trackExperiment(data: any) {
  console.log('Tracking experiment:', data);
  // Implement your A/B testing integration
}

// Example usage in a real app:
export function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  const surveyConfig: SurveyConfig = {
    id: 'my-survey',
    title: 'Customer Feedback Survey',
    startQuestionId: 'q1',
    questions: [
      // Your questions here
    ]
  };

  if (showDashboard) {
    return <AnalyticsDashboard surveyId={surveyConfig.id} />;
  }

  return (
    <div>
      <button onClick={() => setShowDashboard(true)}>
        View Analytics Dashboard
      </button>
      <SurveyWithAnalyticsHook config={surveyConfig} />
    </div>
  );
}

