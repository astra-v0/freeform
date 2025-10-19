import React from 'react';
import { Survey } from './Survey.js';
import {
  SurveyConfig,
  Question,
  SurveyTheme,
  ChoiceOption,
  SurveyResponse,
} from '../types/index.js';

export interface SimpleSocialLink {
  name: string;
  url: string;
  icon?: string;
}

export interface SimpleQuestion {
  title: string;
  description?: string;
  placeholder?: string;
  type: 'text' | 'choice' | 'feedback' | 'info' | 'social';

  multiline?: boolean;
  maxLength?: number;

  // Validation for text fields
  validation?: {
    type?: 'text' | 'number' | 'email';
    min?: number;
    max?: number;
    pattern?: string;
    errorMessage?: string;
  };

  options?: string[] | Array<{ label: string; value?: string }>;
  multiple?: boolean;
  allowOther?: boolean;

  fields?: {
    firstName?: boolean | { enabled: boolean; required?: boolean };
    lastName?: boolean | { enabled: boolean; required?: boolean };
    email?: boolean | { enabled: boolean; required?: boolean };
    company?: boolean | { enabled: boolean; required?: boolean };
  };
  requiredFields?: string[];

  // For info questions
  icon?: string;

  // For social questions
  socials?: SimpleSocialLink[];

  required?: boolean;
}

export interface SimpleSurveyResult {
  answers: Record<string, string | string[] | boolean | number | Record<string, string>>;
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
        validation: q.validation,
        required: q.required,
      };
    }

    if (q.type === 'choice') {
      const options: ChoiceOption[] = (q.options || []).map((opt, optIndex) => {
        if (typeof opt === 'string') {
          return {
            id: `${id}_opt${optIndex + 1}`,
            label: opt,
            value: opt.toLowerCase().replace(/\s+/g, '_'),
          };
        }
        return {
          id: `${id}_opt${optIndex + 1}`,
          label: opt.label,
          value: opt.value || opt.label.toLowerCase().replace(/\s+/g, '_'),
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
        required: q.required,
      };
    }

    if (q.type === 'feedback') {
      const fields = q.fields || {};
      const requiredFields = q.requiredFields || [];

      // Helper to convert field config
      const convertField = (fieldName: string, defaultEnabled: boolean) => {
        const field = fields[fieldName as keyof typeof fields];

        // If field is already an object, use it as is
        if (typeof field === 'object' && field !== null) {
          return field;
        }

        // If field is boolean or undefined
        const enabled = field ?? defaultEnabled;
        const required = requiredFields.includes(fieldName);

        return typeof enabled === 'boolean'
          ? required
            ? { enabled, required: true }
            : enabled
          : enabled;
      };

      return {
        id,
        type: 'feedback',
        title: q.title,
        description: q.description,
        fields: {
          firstName: convertField('firstName', true),
          lastName: convertField('lastName', true),
          email: convertField('email', true),
          company: convertField('company', false),
        },
        required: q.required,
      };
    }

    if (q.type === 'info') {
      return {
        id,
        type: 'info',
        title: q.title,
        description: q.description,
        icon: q.icon,
        required: q.required,
      };
    }

    if (q.type === 'social') {
      return {
        id,
        type: 'social',
        title: q.title,
        description: q.description,
        socials: (q.socials || []).map(social => ({
          name: social.name,
          url: social.url,
          icon: social.icon,
        })),
        required: q.required,
      };
    }

    throw new Error(`Unknown question type: ${q.type}`);
  });
};

export const SimpleSurvey: React.FC<SimpleSurveyProps> = ({
  questions,
  theme,
  onComplete,
}) => {
  const config: SurveyConfig = {
    id: `survey_${Date.now()}`,
    title: 'Survey',
    theme: {
      backgroundColor: theme?.backgroundColor || '#1d1d1d',
      textColor: theme?.textColor || '#ffffff',
      accentColor: theme?.accentColor || '#4A9EFF',
    },
    questions: convertQuestions(questions),
    startQuestionId: 'q1',
  };

  const handleComplete = (response: SurveyResponse) => {
    if (onComplete) {
      const answers: Record<string, string | string[] | boolean | number | Record<string, string>> = {};
      response.answers.forEach((answer) => {
        const questionIndex = parseInt(answer.questionId.substring(1)) - 1;
        const originalQuestion = questions[questionIndex];

        const key = originalQuestion.title;
        answers[key] = answer.value;
      });

      onComplete({
        answers,
        completedAt: response.endTime || new Date(),
      });
    }
  };

  return <Survey config={config} onComplete={handleComplete} />;
};
