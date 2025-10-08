import React, { useState, useEffect } from 'react';
import { ChoiceQuestion as ChoiceQuestionType, UserAnswer, SurveyTheme } from '../../types/index.js';

interface ChoiceQuestionProps {
  question: ChoiceQuestionType;
  currentAnswer?: UserAnswer;
  theme: SurveyTheme;
  onAnswer: (answer: UserAnswer) => void;
}

export const ChoiceQuestion: React.FC<ChoiceQuestionProps> = ({
  question,
  currentAnswer,
  theme,
  onAnswer
}) => {
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [otherValue, setOtherValue] = useState<string>('');

  useEffect(() => {
    if (currentAnswer) {
      if (Array.isArray(currentAnswer.value)) {
        setSelectedValues(new Set(currentAnswer.value));
        const otherVal = currentAnswer.value.find(v => !question.options.some(o => o.value === v));
        if (otherVal) {
          setOtherValue(String(otherVal));
        }
      } else if (typeof currentAnswer.value === 'string') {
        setSelectedValues(new Set([currentAnswer.value]));
      }
    }
  }, [currentAnswer, question.options]);

  useEffect(() => {
    if (selectedValues.size > 0 || otherValue.trim()) {
      const values = Array.from(selectedValues);
      if (otherValue.trim() && question.allowOther) {
        values.push(otherValue.trim());
      }
      
      onAnswer({
        questionId: question.id,
        value: question.multiple ? values : values[0] || '',
        timestamp: new Date()
      });
    }
  }, [selectedValues, otherValue, question.id, question.multiple, question.allowOther, onAnswer]);

  const handleOptionChange = (optionValue: string, checked: boolean) => {
    const newSelected = new Set(selectedValues);
    
    if (question.multiple) {
      if (checked) {
        newSelected.add(optionValue);
      } else {
        newSelected.delete(optionValue);
      }
    } else {
      newSelected.clear();
      if (checked) {
        newSelected.add(optionValue);
      }
    }
    
    setSelectedValues(newSelected);
  };

  const optionStyle: React.CSSProperties = {
    display: 'block',
    padding: '12px 0',
    cursor: 'pointer',
    color: theme.accentColor
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 0',
    border: 'none',
    borderBottom: `1px solid ${theme.accentColor}`,
    background: 'transparent',
    color: theme.accentColor,
    fontSize: '18px',
    outline: 'none'
  };

  return (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 400,
        margin: '0 0 32px 0',
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
        {question.options.map((option) => (
          <label
            key={option.id}
            style={optionStyle}
          >
            <input
              type={question.multiple ? 'checkbox' : 'radio'}
              name={question.multiple ? `choice_${question.id}` : 'choice'}
              value={option.value}
              checked={selectedValues.has(option.value)}
              onChange={(e) => handleOptionChange(option.value, e.target.checked)}
              style={{
                marginRight: '12px',
                accentColor: theme.accentColor
              }}
            />
            <span style={{
              fontSize: '16px',
              color: theme.accentColor
            }}>
              {option.label}
            </span>
          </label>
        ))}

        {question.allowOther && (
          <div style={{
            marginTop: '24px'
          }}>
            <input
              type="text"
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              placeholder="Other option"
              style={inputStyle}
            />
          </div>
        )}
      </div>
    </div>
  );
};
