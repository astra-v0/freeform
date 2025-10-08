import React, { useState, useEffect, useRef } from 'react';
import {
  TextQuestion as TextQuestionType,
  UserAnswer,
  SurveyTheme,
} from '../../types/index.js';

interface TextQuestionProps {
  question: TextQuestionType;
  currentAnswer?: UserAnswer;
  theme: SurveyTheme;
  onAnswer: (answer: UserAnswer) => void;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  currentAnswer,
  theme,
  onAnswer,
}) => {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentAnswer && typeof currentAnswer.value === 'string') {
      setValue(currentAnswer.value);
    }
  }, [currentAnswer]);

  useEffect(() => {
    if (value.trim()) {
      onAnswer({
        questionId: question.id,
        value: value.trim(),
        timestamp: new Date(),
      });
      setError('');
    }
  }, [value, question.id, onAnswer]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && question.multiline) {
      const textarea = textareaRef.current;
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight to fit content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, question.multiline]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedValue = value.trim();

    if (!trimmedValue && question.required) {
      setError('Please fill in the required field');
      return;
    }

    if (question.maxLength && trimmedValue.length > question.maxLength) {
      setError(`Maximum length: ${question.maxLength} characters`);
      return;
    }

    setError('');
    onAnswer({
      questionId: question.id,
      value: trimmedValue,
      timestamp: new Date(),
    });
  };

  const unfocusedColor = hexToRgba(theme.accentColor, 0.7);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 0',
    border: 'none',
    borderBottom: isFocused
      ? `1px solid ${theme.accentColor}`
      : `1px solid ${unfocusedColor}`,
    boxShadow: isFocused ? `0 1px 0 0 ${theme.accentColor}` : 'none',
    background: 'transparent',
    color: '#ffffff',
    fontSize: '26px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'none',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease, border-bottom-color 0.2s ease',
  };

  return (
    <div>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 400,
          margin: '0 0 24px 0',
          color: theme.textColor,
        }}
      >
        {question.title}
      </h2>

      {question.description && (
        <p
          style={{
            fontSize: '16px',
            margin: '0 0 24px 0',
            color: theme.textColor,
          }}
        >
          {question.description}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          {question.multiline ? (
            <div>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={question.placeholder || 'Type your answer here...'}
                style={{
                  ...inputStyle,
                  minHeight: '28px',
                }}
                maxLength={question.maxLength}
                rows={1}
              />
              <div
                style={{
                  fontSize: '12px',
                  color: '#cccccc',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Shift ↑ + Enter ↵ to make a line break</span>
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={question.placeholder || 'Type your answer here...'}
              style={inputStyle}
              maxLength={question.maxLength}
            />
          )}

          {error && (
            <div
              style={{
                color: '#ff6b6b',
                fontSize: '14px',
                marginTop: '8px',
              }}
            >
              {error}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
