import React, { useState, useEffect } from 'react';
import {
  ChoiceQuestion as ChoiceQuestionType,
  UserAnswer,
  SurveyTheme,
} from '../../types/index.js';

interface ChoiceQuestionProps {
  question: ChoiceQuestionType;
  currentAnswer?: UserAnswer;
  theme: SurveyTheme;
  onAnswer: (answer: UserAnswer) => void;
  isMobile?: boolean;
}

function lightenColor(color: string, amount: number) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = (num >> 16) + amount;
  const b = ((num >> 8) & 0x00ff) + amount;
  const g = (num & 0x0000ff) + amount;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const ChoiceQuestion: React.FC<ChoiceQuestionProps> = ({
  question,
  currentAnswer,
  theme,
  onAnswer,
  isMobile = false,
}) => {
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [otherValue, setOtherValue] = useState<string>('');

  useEffect(() => {
    if (currentAnswer) {
      if (Array.isArray(currentAnswer.value)) {
        setSelectedValues(new Set(currentAnswer.value));
        const otherVal = currentAnswer.value.find(
          v => !question.options.some(o => o.value === v)
        );
        if (otherVal) {
          setOtherValue(String(otherVal));
        }
      } else if (typeof currentAnswer.value === 'string') {
        setSelectedValues(new Set([currentAnswer.value]));
      }
    } else {
      // Reset selection when no answer exists (e.g., new question)
      setSelectedValues(new Set());
      setOtherValue('');
    }
  }, [currentAnswer, question.id, question.options]);

  useEffect(() => {
    if (selectedValues.size > 0 || otherValue.trim()) {
      const values = Array.from(selectedValues);
      if (otherValue.trim() && question.allowOther) {
        values.push(otherValue.trim());
      }

      onAnswer({
        questionId: question.id,
        value: question.multiple ? values : values[0] || '',
        timestamp: new Date(),
      });
    }
  }, [
    selectedValues,
    otherValue,
    question.id,
    question.multiple,
    question.allowOther,
    onAnswer,
  ]);

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
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    marginBottom: isMobile ? '10px' : '7px',
    backgroundColor: '#2a2a2a',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    color: '#ffffff',
    touchAction: 'manipulation',
  };

  const selectedOptionStyle: React.CSSProperties = {
    ...optionStyle,
    backgroundColor: `${theme.backgroundColor}`,
    border: `2px solid ${theme.accentColor}`,
  };

  const letterStyle: React.CSSProperties = {
    display: 'inline-block',
    width: isMobile ? '28px' : '24px',
    height: isMobile ? '28px' : '24px',
    backgroundColor: theme.backgroundColor,
    border: `1px solid ${lightenColor(theme.backgroundColor, 50)}`,
    borderRadius: '4px',
    textAlign: 'center',
    lineHeight: isMobile ? '28px' : '24px',
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: 'bold',
    marginRight: isMobile ? '12px' : '16px',
  };

  const letterStyleSelected: React.CSSProperties = {
    ...letterStyle,
    backgroundColor: theme.accentColor,
    color: theme.backgroundColor,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 0',
    border: 'none',
    borderBottom: `1px solid ${theme.accentColor}`,
    background: 'transparent',
    color: '#ffffff',
    fontSize: isMobile ? '18px' : '26px',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div>
      <h2
        style={{
          fontSize: isMobile ? '18px' : '24px',
          fontWeight: 400,
          margin: isMobile ? '0 0 16px 0' : '0 0 24px 0',
          color: theme.textColor,
        }}
      >
        {question.title}
      </h2>

      {question.description && (
        <p
          style={{
            fontSize: isMobile ? '14px' : '16px',
            margin: isMobile ? '0 0 16px 0' : '0 0 24px 0',
            color: theme.textColor,
          }}
        >
          {question.description}
        </p>
      )}

      <div>
        {question.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index); // A, B, C, D, E...
          const isSelected = selectedValues.has(option.value);

          return (
            <div
              key={option.id}
              style={isSelected ? selectedOptionStyle : optionStyle}
              onClick={() => handleOptionChange(option.value, !isSelected)}
            >
              <input
                type={question.multiple ? 'checkbox' : 'radio'}
                name={question.multiple ? `choice_${question.id}` : 'choice'}
                value={option.value}
                checked={isSelected}
                onChange={e =>
                  handleOptionChange(option.value, e.target.checked)
                }
                style={{
                  display: 'none', // Hide the default input
                }}
              />
              <div style={isSelected ? letterStyleSelected : letterStyle}>
                {letter}
              </div>
              <span
                style={{
                  fontSize: isMobile ? '15px' : '16px',
                  color: '#ffffff',
                  flex: 1,
                }}
              >
                {option.label}
              </span>
            </div>
          );
        })}

        {question.allowOther && (
          <div
            style={{
              marginTop: isMobile ? '16px' : '24px',
              padding: isMobile ? '14px 16px' : '16px 20px',
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                fontSize: isMobile ? '13px' : '14px',
                color: '#cccccc',
                marginBottom: isMobile ? '10px' : '12px',
              }}
            >
              Other option:
            </div>
            <input
              type="text"
              value={otherValue}
              onChange={e => setOtherValue(e.target.value)}
              placeholder="Specify your option"
              style={inputStyle}
            />
          </div>
        )}
      </div>
    </div>
  );
};
