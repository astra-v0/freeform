import React from 'react';
import { SocialQuestion as SocialQuestionType, UserAnswer, SurveyTheme } from '../../types/index.js';
import { Share2, Facebook, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';

interface SocialQuestionProps {
  question: SocialQuestionType;
  currentAnswer?: UserAnswer;
  theme: SurveyTheme;
  onAnswer: (answer: UserAnswer) => void;
}

export const SocialQuestion: React.FC<SocialQuestionProps> = ({
  question,
  currentAnswer: _currentAnswer,
  theme,
  onAnswer
}) => {
  const handleSocialClick = (socialName: string, url: string) => {
    // Track the social share
    onAnswer({
      questionId: question.id,
      value: { action: 'share', platform: socialName, url },
      timestamp: new Date()
    });
    
    // Open the social share URL
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getSocialIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('facebook')) return Facebook;
    if (lowerName.includes('twitter') || lowerName.includes('x')) return Twitter;
    if (lowerName.includes('linkedin')) return Linkedin;
    if (lowerName.includes('mail') || lowerName.includes('email')) return Mail;
    return ExternalLink;
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px'
      }}>        
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '400',
            margin: '0 0 8px 0',
            color: theme.textColor
          }}>
            {question.title}
          </h2>
          
          {question.description && (
            <p style={{
              fontSize: '16px',
              margin: '0',
              color: theme.textColor,
              opacity: 0.8
            }}>
              {question.description}
            </p>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {question.socials.map((social, index) => {
          const IconComponent = getSocialIcon(social.name);
          
          return (
            <button
              key={index}
              onClick={() => handleSocialClick(social.name, social.url)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                backgroundColor: 'transparent',
                border: `2px solid ${theme.accentColor}`,
                borderRadius: '12px',
                color: theme.textColor,
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.accentColor;
                e.currentTarget.style.color = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.textColor;
              }}
            >
              <IconComponent 
                size={20} 
                style={{ marginRight: '12px' }}
              />
              {social.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
