# Freeform

Lightweight survey builder with Typeform-style UI.

## Installation

```bash
npm install github:astra-v0/freeform
```

## Usage

```tsx
import { SimpleSurvey } from '@astra-v0/freeform';

function App() {
  const questions = [
    {
      title: 'What is your name?',
      type: 'text',
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

## Question Types

`text` • `choice` • `feedback`

## License

Project 
