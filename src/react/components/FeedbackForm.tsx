import React, { useState, useEffect } from 'react';
import { FeedbackFormQuestion, UserAnswer, SurveyTheme } from '../../types/index.js';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface FeedbackFormProps {
  question: FeedbackFormQuestion;
  currentAnswer?: UserAnswer;
  theme: SurveyTheme;
  onAnswer: (answer: UserAnswer) => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  question,
  currentAnswer,
  theme,
  onAnswer
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    firstName: '',
    lastName: '',
    email: '',
    company: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (currentAnswer && typeof currentAnswer.value === 'object' && !Array.isArray(currentAnswer.value)) {
      setFormData(currentAnswer.value as Record<string, string>);
    }
  }, [currentAnswer]);

  useEffect(() => {
    const hasData = Object.values(formData).some(v => v.trim());
    if (hasData) {
      onAnswer({
        questionId: question.id,
        value: formData,
        timestamp: new Date()
      });
    }
  }, [formData, question.id, onAnswer]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const unfocusedColor = hexToRgba(theme.accentColor, 0.7);
  
  const getInputStyle = (fieldName: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px 0',
    border: 'none',
    borderBottom: focusedField === fieldName 
      ? `1px solid ${theme.accentColor}`
      : `1px solid ${unfocusedColor}`,
    boxShadow: focusedField === fieldName 
      ? `0 2px 0 0 ${theme.accentColor}` 
      : 'none',
    background: 'transparent',
    color: '#ffffff',
    fontSize: '26px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'box-shadow 0.2s ease, border-bottom-color 0.2s ease'
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#cccccc'
  };

  return (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 400,
        margin: '0 0 24px 0',
        color: theme.textColor
      }}>
        {question.title}
      </h2>

      {question.description && (
        <p style={{
          fontSize: '16px',
          margin: '0 0 24px 0',
          color: theme.textColor
        }}>
          {question.description}
        </p>
      )}

      <div>
        {question.fields.firstName && (
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              onFocus={() => setFocusedField('firstName')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your first name"
              style={getInputStyle('firstName')}
            />
            {errors.firstName && (
              <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '4px' }}>
                {errors.firstName}
              </div>
            )}
          </div>
        )}

        {question.fields.lastName && (
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              onFocus={() => setFocusedField('lastName')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your last name"
              style={getInputStyle('lastName')}
            />
            {errors.lastName && (
              <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '4px' }}>
                {errors.lastName}
              </div>
            )}
          </div>
        )}

        {question.fields.email && (
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your email"
              style={getInputStyle('email')}
            />
            {errors.email && (
              <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '4px' }}>
                {errors.email}
              </div>
            )}
          </div>
        )}

        {question.fields.company && (
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              onFocus={() => setFocusedField('company')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter company name"
              style={getInputStyle('company')}
            />
            {errors.company && (
              <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '4px' }}>
                {errors.company}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
