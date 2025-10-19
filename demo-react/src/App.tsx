import { SimpleSurvey, SimpleQuestion, SimpleSurveyResult } from '../../src/react/SimpleSurvey';

function App() {
  const questions: SimpleQuestion[] = [
    {
      title: '👽 Greetings, Earthling! Please state your species and place of origin.',
      type: 'text',
      multiline: false,
      placeholder: 'e.g., Human, Earth (Alaska, USA)',
      required: true
    },
    {
      title: 'How many planetary cycles ("years") have you experienced since your emergence?',
      type: 'text',
      placeholder: 'Enter your age in years',
      required: true,
      validation: {
        type: 'number',
        min: 0,
        max: 150,
        errorMessage: 'Please enter a valid age between 0 and 150'
      }
    },
    {
      title: 'What is your primary function on your home planet?',
      type: 'choice',
      options: [
        'Knowledge Accumulation (Student/Researcher)',
        'Resource Acquisition (Worker/Business)',
        'Offspring Nurturing (Parent/Caregiver)',
        'Planetary Leadership (Government/Administrator)',
        'Other'
      ],
      required: true
    },
    {
      title: 'If you were given the opportunity, would you willingly communicate with civilizations from other galaxies?',
      type: 'choice',
      options: [
        'Definitely',
        'Maybe, after knowing their intentions',
        'No, I prefer intergalactic privacy',
        'Unsure'
      ],
      required: true
    },
    {
      title: 'We have observed the phenomenon you call "pizza." Please rate its significance to your culture.',
      type: 'choice',
      options: [
        'Vital for survival',
        'Highly valued',
        'Occasionally consumed',
        'Unknown/Not important'
      ],
      required: false
    },
    {
      title: 'For continuing communication, please provide your cosmic identification signals. Fields marked with * are required.',
      type: 'feedback',
      fields: {
        firstName: { enabled: true, required: true },
        lastName: { enabled: true, required: false },
        email: { enabled: true, required: true }
      },
      required: true
    },
    {
      title: 'Thank you, Earthling! Share this transmission with your planetary network!',
      type: 'social',
      socials: [
        {
          name: 'Universal Spacebook',
          url: 'https://www.facebook.com/sharer/sharer.php?u=https://www.google.com'
        },
        {
          name: 'Interstellar Twixt',
          url: 'https://www.twitter.com/share?url=https://www.google.com'
        },
        {
          name: 'GalacticLink',
          url: 'https://www.linkedin.com/shareArticle?url=https://www.google.com'
        },
        {
          name: 'Wormhole Mail',
          url: 'mailto:?subject=Participate in Intergalactic Survey&body=Alien abductors want to know more about you: https://www.google.com'
        }
      ]
    }
  ];

  const handleComplete = (result: SimpleSurveyResult) => {
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
