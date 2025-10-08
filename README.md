# Survey Builder

A lightweight, programmatic survey builder with Typeform-style UI.

## Features

- 🎨 Clean, modern UI inspired by Typeform
- 📝 Multiple question types (text, choice, feedback forms)
- ⚡ TypeScript support
- ⚛️ React components included
- 💾 Export responses to CSV/JSON
- 🎯 Conditional logic support
- 📊 **Analytics Module** - Track timing, progress, and abandonment (developer-only)

## Installation

```bash
npm install @your-org/survey-builder
```

## Quick Start

### React

```tsx
import { SimpleSurvey } from '@your-org/survey-builder';

function App() {
  const questions = [
    {
      title: 'What is your name?',
      type: 'text',
      placeholder: 'Enter your name',
      required: true
    },
    {
      title: 'Your experience level?',
      type: 'choice',
      options: ['Beginner', 'Intermediate', 'Advanced']
    }
  ];

  return (
    <SimpleSurvey 
      questions={questions}
      onComplete={(result) => console.log(result)}
    />
  );
}
```

### Vanilla JavaScript

```javascript
import { SurveyBuilder } from '@your-org/survey-builder';

const config = {
  id: 'my-survey',
  title: 'User Survey',
  questions: [
    {
      id: 'q1',
      type: 'text',
      title: 'What is your name?',
      required: true
    }
  ],
  startQuestionId: 'q1'
};

const survey = new SurveyBuilder(config);
const container = document.getElementById('survey-container');

survey
  .render(container)
  .onComplete((response) => {
    console.log('Survey completed:', response);
  });
```

## Question Types

- **Text**: Single or multi-line text input
- **Choice**: Single or multiple choice options
- **Feedback**: Pre-built form with name, email, company fields

## Export Data

```javascript
const exporter = new DataExporter(responses);

// Export to CSV
const csv = exporter.export({ format: 'csv' });

// Export to JSON
const json = exporter.export({ format: 'json' });

// Download file
survey.download('csv', 'survey-results.csv');
```

## Analytics (Developer-Only)

Track survey performance, timing, and abandonment to optimize your surveys.

### Quick Start

```typescript
import { SurveyAnalytics, formatTime, printSummary } from '@your-org/survey-builder';

// Initialize analytics
const analytics = new SurveyAnalytics('survey-id', 'session-id', 10, {
  enableTracking: true,
  persistToStorage: true
});

// Track questions
analytics.startQuestion('q1');
// ... user answers ...
analytics.endQuestion('q1', true);

// Get real-time snapshot
const snapshot = analytics.getSnapshot();
console.log('Progress:', snapshot.progress.completionPercentage + '%');
console.log('Time spent:', formatTime(snapshot.timing.totalTimeMs));

// Complete survey
analytics.completeSurvey();

// Get summary across all sessions
const summary = SurveyAnalytics.getSummary('survey-id');
printSummary(summary);
```

### React Hook

```tsx
import { useSurveyAnalytics } from '@your-org/survey-builder';

function MySurvey() {
  const analytics = useSurveyAnalytics({
    surveyId: 'survey-123',
    sessionId: `session_${Date.now()}`,
    totalQuestions: 10,
    enableTracking: true,
    onComplete: (analytics) => {
      const data = analytics.getData();
      console.log('Completed in', data.totalTimeMs, 'ms');
    }
  });

  return (
    <Survey 
      onQuestionChange={(id) => analytics.startQuestion(id)}
      onQuestionAnswer={(id) => analytics.endQuestion(id, true)}
      onComplete={() => analytics.completeSurvey()}
    />
  );
}
```

### Features

- ⏱️ **Question-level timing** - Track time spent on each question
- 📊 **Progress tracking** - Monitor completion percentage in real-time
- 💾 **Auto-persistence** - Automatically save to localStorage
- 🚫 **Abandonment detection** - Identify incomplete surveys
- 📈 **Aggregated analytics** - Get summaries across all sessions
- 📉 **Problem identification** - Find questions with high abandonment rates
- 📤 **Export to CSV/JSON** - Download analytics data

### Documentation

For complete analytics documentation, see [Analytics Guide](./docs/ANALYTICS.md).

### Example: Admin Dashboard

```tsx
import { SurveyAnalytics, getDashboardData } from '@your-org/survey-builder';

function Dashboard() {
  const summary = SurveyAnalytics.getSummary('survey-id');
  const dashboard = getDashboardData(summary);
  
  return (
    <div>
      <h2>Completion Rate: {dashboard.overview.completionRate}%</h2>
      <h3>Problem Questions:</h3>
      {dashboard.problemQuestions.map(q => (
        <div key={q.questionId}>
          {q.questionId}: {q.abandonmentRate}% abandonment
        </div>
      ))}
    </div>
  );
}
```

## Development

```bash
# Install dependencies
npm install

# Build library
npm run build

# Run demo
npm run demo

# Run tests
npm test
```

## License

MIT

