import { SimpleSurvey, SimpleQuestion } from '../../src/react/SimpleSurvey';

function App() {
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
      title: 'Would you be open to participating in collaborative projects, providing feedback, or advising Astra\'s proof-of-concept studies?*',
      type: 'choice',
      options: [
        'Yes',
        'No',
        'Maybe, please contact me'
      ],
      required: true
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
