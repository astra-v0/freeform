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
