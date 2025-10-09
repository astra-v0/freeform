# Freeform

A lightweight, programmatic survey builder with Typeform-style UI.

## Features

- 🎨 Clean, modern UI inspired by Typeform
- 📝 Multiple question types (text, choice, feedback forms)
- ⚡ TypeScript support
- ⚛️ React components included
- 💾 Export responses to CSV/JSON
- 🎯 Conditional logic support

## Installation

```bash
npm install github:astra-v0/freeform
```

## Quick Start

### React

```tsx
import { SimpleSurvey } from '@astra-v0/freeform';

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
import { SurveyBuilder } from '@astra-v0/freeform';

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

