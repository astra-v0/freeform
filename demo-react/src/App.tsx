import { SimpleSurvey, SimpleQuestion, SimpleSurveyResult } from '../../src/react/SimpleSurvey';

function App() {
  const questions: SimpleQuestion[] = [
    {
      id: 'q1',
      title: '👽 Greetings, Earthling! Please state your species and place of origin.',
      type: 'text',
      multiline: false,
      placeholder: 'e.g., Human, Earth (Alaska, USA)',
      required: true
    },
    {
      id: 'q2',
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
      id: 'q2.1',
      title: 'Im hidden',
      type: 'info',
      required: false,
      hidden: true
    },
    {
      id: 'q3',
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
      id: 'q4',
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
      id: 'q5',
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
      id: 'q6',
      title: 'Do you want to give us some data about you?',
      type: 'choice',
      options: [
        'Yes, right now',
        'Yes, later'
      ],
      required: true,
      nextButton: {
        condition: {
          elementId: 'q6',
          operator: 'equals',
          value: 'Yes, later',
          action: {
            type: 'jump',
            elementId: 'q7'
          }
        }
      }
    },
    {
      id: 'form',
      title: 'For continuing communication, please provide your cosmic identification signals.',
      type: 'feedback',
      fields: {
        firstName: { enabled: true, required: true },
        lastName: { enabled: true, required: false },
        email: { enabled: true, required: true }
      },
      required: true,
      submit: true
    },
    {
      id: 'q7',
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
      ],
      final: true,
      nextButton: {
        text: 'Home Page',
        url: 'http://astra-v0.ru',
        icon: 'http://astra-v0.ru/favicon.ico',
        style: 'filled'
      }
    }
  ];

  const handleComplete = (result: SimpleSurveyResult) => {
    console.log('Survey completed!', result);
    alert(`Survey completed! Final answers:\n${JSON.stringify(result.answers, null, 2)}`);
  };

  const handleSubmit = (result: SimpleSurveyResult) => {
    console.log('Form submitted!', result);
    alert(`Form submitted! Current answers:\n${JSON.stringify(result.answers, null, 2)}`);
  };

  return (
    <SimpleSurvey 
      questions={questions}
      onComplete={handleComplete}
      onSubmit={handleSubmit}
    />
  );
}

export default App;
