# Freeform

Lightweight survey builder with Typeform-style UI.

[![React Demo](/assets/demo.gif)](demo-react/)

## Features

- Text field
- Choice field
- Feedback field
- Info/notice field
- Social field

[![React Demo](/assets/demo2.gif)](demo-react/)

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

[MIT](LICENSE)
