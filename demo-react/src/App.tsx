import { useState } from 'react';
import { SimpleSurvey, SimpleQuestion } from '../../src/index';
import { AnalyticsDemo } from './AnalyticsDemo';

function App() {
  const [view, setView] = useState<'survey' | 'analytics'>('survey');
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  const questions: SimpleQuestion[] = [
    {
      title: 'Please describe your professional background and area of expertise (e.g., endocrinology, bioinformatics, data science, longevity research).',
      type: 'text',
      multiline: true,
      placeholder: 'Type your answer here...',
      required: true
    },
    {
      title: 'How mature do you think AI tools are for real clinical or research use in your field?',
      type: 'choice',
      options: [
        'Not mature',
        'Somewhat mature', 
        'Moderately mature',
        'Very mature',
        'Fully mature'
      ],
      required: true
    },
    {
      title: 'This survey is confidential and will be used only for research purposes.',
      type: 'info',
      description: 'Your responses will not be used for any other purpose. We will not share your data with any third parties.'
    },
    {
      title: 'Would you be open to participating in collaborative projects, providing feedback, or advising Astra\'s proof-of-concept studies?*',
      type: 'choice',
      options: [
        'Yes',
        'No',
        'Maybe, please contact me'
      ],
      required: true
    },
    {
      title: 'Please provide your contact information. Fields marked with * are required.',
      type: 'feedback',
      fields: {
        firstName: { enabled: true, required: true },
        lastName: { enabled: true, required: false },
        email: { enabled: true, required: true },
        company: { enabled: true, required: false }
      },
      required: true
    },
    {
      title: 'Thanks for your time! Share this survey with your colleagues!',
      type: 'social',
      socials: [
        {
          name: 'Facebook',
          url: 'https://www.facebook.com/sharer/sharer.php?u=https://www.google.com'
        },
        {
          name: 'Twitter',
          url: 'https://www.twitter.com/share?url=https://www.google.com'
        },
        {
          name: 'LinkedIn',
          url: 'https://www.linkedin.com/shareArticle?url=https://www.google.com'
        },
        {
          name: 'Email',
          url: 'mailto:?subject=Check out this survey&body=I found this survey and thought you might be interested: https://www.google.com'
        }
      ]
    }
  ];

  const handleComplete = (result: any) => {
    console.log('Survey completed!', result);
    console.log('📊 Analytics data has been collected. Click "View Analytics" to see the dashboard.');
    setSurveyCompleted(true);
  };

  const handleRestart = () => {
    setSurveyCompleted(false);
    setView('survey');
  };

  if (surveyCompleted) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1d1d1d',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Thank you! 🎉</h1>
          <p style={{ fontSize: '18px', marginBottom: '32px' }}>
            Your responses have been saved.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => setView('analytics')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4A9EFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              View Analytics Dashboard
            </button>
            <button
              onClick={handleRestart}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#4A9EFF',
                border: '1px solid #4A9EFF',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Take Survey Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'analytics') {
    return (
      <div>
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000
        }}>
          <button
            onClick={() => setView('survey')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4A9EFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to Survey
          </button>
        </div>
        <AnalyticsDemo />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setView('analytics')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4A9EFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          📊 View Analytics
        </button>
      </div>
      <SimpleSurvey 
        questions={questions}
        onComplete={handleComplete}
        enableAnalytics={true}
      />
    </div>
  );
}

export default App;
