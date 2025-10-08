import React from 'react';
import { Survey } from './Survey.js';
import { SurveyConfig, Question, SurveyTheme, ChoiceOption } from '../types/index.js';

export interface SimpleQuestion {
  title: string;
  description?: string;
  placeholder?: string;
  type: 'text' | 'choice' | 'feedback';
  
  multiline?: boolean;
  maxLength?: number;
  
  options?: string[] | Array<{ label: string; value?: string }>;
  multiple?: boolean;
  allowOther?: boolean;
  
  fields?: {
    firstName?: boolean;
    lastName?: boolean;
    email?: boolean;
    company?: boolean;
  };
  
  required?: boolean;
}

export interface SimpleSurveyResult {
  answers: Record<string, any>;
  completedAt: Date;
}

export interface SimpleSurveyProps {
  questions: SimpleQuestion[];
  theme?: Partial<SurveyTheme>;
  onComplete?: (result: SimpleSurveyResult) => void;
}

const generateId = (index: number): string => `q${index + 1}`;

const convertQuestions = (simpleQuestions: SimpleQuestion[]): Question[] => {
  return simpleQuestions.map((q, index) => {
    const id = generateId(index);
    
    if (q.type === 'text') {
      return {
        id,
        type: 'text',
        title: q.title,
        description: q.description,
        placeholder: q.placeholder,
        multiline: q.multiline,
        maxLength: q.maxLength,
        required: q.required
      };
    }
    
    if (q.type === 'choice') {
      const options: ChoiceOption[] = (q.options || []).map((opt, optIndex) => {
        if (typeof opt === 'string') {
          return {
            id: `${id}_opt${optIndex + 1}`,
            label: opt,
            value: opt.toLowerCase().replace(/\s+/g, '_')
          };
        }
        return {
          id: `${id}_opt${optIndex + 1}`,
          label: opt.label,
          value: opt.value || opt.label.toLowerCase().replace(/\s+/g, '_')
        };
      });
      
      return {
        id,
        type: 'choice',
        title: q.title,
        description: q.description,
        options,
        multiple: q.multiple,
        allowOther: q.allowOther,
        required: q.required
      };
    }
    
    if (q.type === 'feedback') {
      const fields = q.fields || {};
      return {
        id,
        type: 'feedback',
        title: q.title,
        description: q.description,
        fields: {
          firstName: fields.firstName ?? true,
          lastName: fields.lastName ?? true,
          email: fields.email ?? true,
          company: fields.company ?? false
        },
        required: q.required
      };
    }
    
    throw new Error(`Unknown question type: ${q.type}`);
  });
};

export const SimpleSurvey: React.FC<SimpleSurveyProps> = ({
  questions,
  theme,
  onComplete
}) => {
  const config: SurveyConfig = {
    id: `survey_${Date.now()}`,
    title: 'Survey',
    theme: {
      backgroundColor: theme?.backgroundColor || '#ffffff',
      textColor: theme?.textColor || '#000000',
      accentColor: theme?.accentColor || '#0066cc'
    },
    questions: convertQuestions(questions),
    startQuestionId: 'q1'
  };

  const handleComplete = (response: any) => {
    if (onComplete) {
      const answers: Record<string, any> = {};
      response.answers.forEach((answer: any) => {
        const questionIndex = parseInt(answer.questionId.substring(1)) - 1;
        const originalQuestion = questions[questionIndex];
        
        const key = originalQuestion.title;
        answers[key] = answer.value;
      });
      
      onComplete({
        answers,
        completedAt: response.endTime || new Date()
      });
    }
  };

  return <Survey config={config} onComplete={handleComplete} />;
};

