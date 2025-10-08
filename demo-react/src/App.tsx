import { SimpleSurvey, SimpleQuestion } from '../../src/react/SimpleSurvey';

function App() {
  const questions: SimpleQuestion[] = [
    {
      title: 'What is your name?',
      type: 'text',
      placeholder: 'Enter your name',
      required: true
    },
    {
      title: 'What is your programming experience level?',
      type: 'choice',
      options: ['Beginner', 'Intermediate', 'Advanced'],
      required: true
    },
    {
      title: 'Tell us about your favorite technologies',
      type: 'text',
      multiline: true,
      placeholder: 'For example: React, Vue, Angular...'
    }
  ];

  const handleComplete = (result: any) => {
    console.log('Survey completed!', result);
    alert(`Thank you! Received answers:\n${JSON.stringify(result.answers, null, 2)}`);
  };

  return (
    <SimpleSurvey 
      questions={questions}
      onComplete={handleComplete}
    />
  );
}

export default App;
