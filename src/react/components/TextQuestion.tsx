import React, { useState, useEffect, useRef } from 'react';
import { TextQuestion as TextQuestionType, UserAnswer, SurveyTheme } from '../../types/index.js';

interface TextQuestionProps {
  question: TextQuestionType;
  currentAnswer?: UserAnswer;
  theme: SurveyTheme;
  onAnswer: (answer: UserAnswer) => void;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  currentAnswer,
  theme,
  onAnswer
}) => {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
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
        timestamp: new Date()
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
      timestamp: new Date()
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 0',
    border: 'none',
    borderBottom: `1px solid ${theme.accentColor}`,
    background: 'transparent',
    color: '#ffffff',
    fontSize: '26px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'none',
    overflow: 'hidden'
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

      <form onSubmit={handleSubmit}>
        <div>
          {question.multiline ? (
            <div>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={question.placeholder || "Type your answer here..."}
                style={{
                  ...inputStyle,
                  minHeight: '28px'
                }}
                maxLength={question.maxLength}
                rows={1}
              />
              <div style={{
                fontSize: '12px',
                color: '#cccccc',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>Shift ↑ + Enter ↵ to make a line break</span>
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={question.placeholder || "Type your answer here..."}
              style={inputStyle}
              maxLength={question.maxLength}
            />
          )}

          {error && (
            <div style={{
              color: '#ff6b6b',
              fontSize: '14px',
              marginTop: '8px'
            }}>
              {error}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
