/**
 * Analytics Demo Component
 * 
 * This demonstrates the analytics module functionality.
 * Open the browser console to see analytics data.
 */

import React, { useState, useEffect } from 'react';
import { 
  SurveyAnalytics, 
  formatTime, 
  printSummary,
  getDashboardData 
} from '../../src/index';

export function AnalyticsDemo() {
  const [summary, setSummary] = useState<any>(null);
  const [allSessions, setAllSessions] = useState<any[]>([]);

  useEffect(() => {
    // Load analytics data
    loadAnalytics();
    
    // Refresh every 2 seconds
    const interval = setInterval(loadAnalytics, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = () => {
    const sessions = SurveyAnalytics.getAllSessions();
    setAllSessions(sessions);
    
    if (sessions.length > 0) {
      // Get summary for the first survey found
      const surveyId = sessions[0].surveyId;
      const summaryData = SurveyAnalytics.getSummary(surveyId);
      setSummary(summaryData);
    }
  };

  const handlePrintSummary = () => {
    if (summary) {
      printSummary(summary);
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all analytics data?')) {
      SurveyAnalytics.clearAllData();
      loadAnalytics();
    }
  };

  if (allSessions.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>📊 Analytics Demo</h1>
        <div style={styles.emptyState}>
          <p>No analytics data yet.</p>
          <p>Complete a survey to see analytics data here.</p>
        </div>
      </div>
    );
  }

  const dashboard = summary ? getDashboardData(summary) : null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Survey Analytics</h1>
      
      <div style={styles.actions}>
        <button onClick={handlePrintSummary} style={styles.button}>
          Print Summary to Console
        </button>
        <button onClick={handleClearAll} style={{...styles.button, ...styles.dangerButton}}>
          Clear All Data
        </button>
      </div>

      {dashboard && (
        <>
          <div style={styles.statsGrid}>
            <StatCard
              title="Total Sessions"
              value={dashboard.overview.totalSessions}
              color="#4A9EFF"
            />
            <StatCard
              title="Completed"
              value={dashboard.overview.completedSessions}
              color="#52c41a"
            />
            <StatCard
              title="Abandoned"
              value={dashboard.overview.abandonedSessions}
              color="#ff4d4f"
            />
            <StatCard
              title="Completion Rate"
              value={`${dashboard.overview.completionRate.toFixed(1)}%`}
              color="#fa8c16"
            />
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Average Times</h2>
            <div style={styles.infoGrid}>
              <div>
                <div style={styles.label}>Survey Completion</div>
                <div style={styles.value}>{dashboard.overview.averageCompletionTime}</div>
              </div>
              <div>
                <div style={styles.label}>Per Question</div>
                <div style={styles.value}>{dashboard.overview.averageTimePerQuestion}</div>
              </div>
            </div>
          </div>

          {dashboard.questionPerformance.length > 0 && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Question Performance</h2>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Question ID</th>
                    <th style={styles.th}>Average Time</th>
                    <th style={styles.th}>Abandonment Rate</th>
                    <th style={styles.th}>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.questionPerformance.map((q: any) => (
                    <tr key={q.questionId} style={styles.tableRow}>
                      <td style={styles.td}>{q.questionId}</td>
                      <td style={styles.td}>{q.averageTime}</td>
                      <td style={{
                        ...styles.td,
                        color: parseFloat(q.abandonmentRate) > 20 ? '#ff4d4f' : 'inherit'
                      }}>
                        {q.abandonmentRate}
                      </td>
                      <td style={styles.td}>{q.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {dashboard.problemQuestions.length > 0 && (
            <div style={styles.card}>
              <h2 style={{...styles.cardTitle, color: '#ff4d4f'}}>
                ⚠️ Problem Questions (High Abandonment)
              </h2>
              {dashboard.problemQuestions.map((p: any) => (
                <div key={p.questionId} style={styles.problemCard}>
                  <div style={styles.problemTitle}>{p.questionId}</div>
                  <div style={styles.problemStats}>
                    <span>Abandonment: {p.abandonmentRate.toFixed(2)}%</span>
                    <span>Average Time: {formatTime(p.averageTimeMs)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {dashboard.recentAbandoned.length > 0 && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Recent Abandoned Surveys</h2>
              {dashboard.recentAbandoned.slice(0, 5).map((a: any) => (
                <div key={a.sessionId} style={styles.abandonedCard}>
                  <div style={styles.abandonedHeader}>
                    <span style={styles.sessionId}>Session: {a.sessionId.substring(0, 20)}...</span>
                    <span style={styles.abandonedTime}>{a.timeSpent}</span>
                  </div>
                  <div style={styles.abandonedDetails}>
                    <span>Last Question: {a.lastQuestion}</span>
                    <span>Progress: {a.completion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>All Sessions ({allSessions.length})</h2>
        {allSessions.map((session) => (
          <div key={session.sessionId} style={styles.sessionCard}>
            <div style={styles.sessionHeader}>
              <span style={styles.sessionId}>{session.sessionId}</span>
              <span style={{
                ...styles.badge,
                backgroundColor: session.completed ? '#52c41a' : session.abandoned ? '#ff4d4f' : '#fa8c16'
              }}>
                {session.completed ? 'Completed' : session.abandoned ? 'Abandoned' : 'In Progress'}
              </span>
            </div>
            <div style={styles.sessionStats}>
              <span>Questions: {session.answeredQuestions.length} / {session.visitedQuestions.length}</span>
              {session.totalTimeMs && (
                <span>Time: {formatTime(session.totalTimeMs)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: any; color: string }) {
  return (
    <div style={{
      ...styles.statCard,
      borderLeft: `4px solid ${color}`
    }}>
      <div style={styles.statTitle}>{title}</div>
      <div style={{...styles.statValue, color}}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '32px',
    color: '#1a1a1a'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#4A9EFF',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  dangerButton: {
    backgroundColor: '#ff4d4f'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  statTitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#1a1a1a'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  label: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px'
  },
  value: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4A9EFF'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  tableHeader: {
    backgroundColor: '#f5f5f5'
  },
  th: {
    padding: '12px',
    textAlign: 'left' as const,
    fontWeight: 'bold',
    fontSize: '14px'
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0'
  },
  td: {
    padding: '12px',
    fontSize: '14px'
  },
  problemCard: {
    padding: '16px',
    backgroundColor: '#fff2e8',
    borderLeft: '4px solid #fa8c16',
    marginBottom: '12px',
    borderRadius: '4px'
  },
  problemTitle: {
    fontWeight: 'bold',
    marginBottom: '8px',
    fontSize: '16px'
  },
  problemStats: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    color: '#666'
  },
  abandonedCard: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    marginBottom: '12px'
  },
  abandonedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontWeight: 'bold'
  },
  abandonedDetails: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    color: '#666'
  },
  abandonedTime: {
    color: '#4A9EFF'
  },
  sessionCard: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    marginBottom: '12px'
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  sessionId: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#666'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    color: 'white',
    fontWeight: '500'
  },
  sessionStats: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    color: '#666'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '64px 20px',
    color: '#666'
  }
};

