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

export interface SimpleNextButtonCondition {
  elementId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
  value: string | string[];
  action: {
    type: 'jump';
    elementId: string;
  };
}

export interface SimpleNextButtonConfig {
  text?: string;
  url?: string;
  icon?: string;
  style?: 'filled' | 'outlined' | 'ghost' | 'link' | 'none';
  condition?: SimpleNextButtonCondition;
}

export interface SimpleQuestion {
  id?: string;
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
  hidden?: boolean;
  final?: boolean;
  submit?: boolean;
  nextButton?: SimpleNextButtonConfig;
}

export interface SimpleSurveyResult {
  answers: Record<string, string | string[] | boolean | number | Record<string, string>>;
  completedAt: Date;
}

export interface SimpleSurveyProps {
  questions: SimpleQuestion[];
  theme?: Partial<SurveyTheme>;
  onComplete?: (result: SimpleSurveyResult) => void;
  onSubmit?: (result: SimpleSurveyResult) => void;
}

const generateId = (index: number): string => `q${index + 1}`;

const convertQuestions = (simpleQuestions: SimpleQuestion[]): Question[] => {
  // Find the last visible question to mark it as final
  const visibleQuestions = simpleQuestions.filter(q => !q.hidden);
  const lastVisibleQuestion = visibleQuestions[visibleQuestions.length - 1];
  
  return simpleQuestions.map((q, index) => {
    const id = q.id || generateId(index);
    const isLastVisible = q === lastVisibleQuestion;

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
        hidden: q.hidden,
        final: q.final ?? isLastVisible,
        submit: q.submit,
        nextButton: q.nextButton,
      };
    }

    if (q.type === 'choice') {
      const options: ChoiceOption[] = (q.options || []).map((opt, optIndex) => {
        if (typeof opt === 'string') {
          return {
            id: `${id}_opt${optIndex + 1}`,
            label: opt,
            value: opt, // Use original value without processing
          };
        }
        return {
          id: `${id}_opt${optIndex + 1}`,
          label: opt.label,
          value: opt.value || opt.label, // Use original value without processing
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
        hidden: q.hidden,
        final: q.final ?? isLastVisible,
        submit: q.submit,
        nextButton: q.nextButton,
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
        hidden: q.hidden,
        final: q.final ?? isLastVisible,
        submit: q.submit,
        nextButton: q.nextButton,
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
        hidden: q.hidden,
        final: q.final ?? isLastVisible,
        submit: q.submit,
        nextButton: q.nextButton,
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
        hidden: q.hidden,
        final: q.final ?? isLastVisible,
        submit: q.submit,
        nextButton: q.nextButton,
      };
    }

    throw new Error(`Unknown question type: ${q.type}`);
  });
};

export const SimpleSurvey: React.FC<SimpleSurveyProps> = ({
  questions,
  theme,
  onComplete,
  onSubmit,
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

  const convertResponseToResult = (response: SurveyResponse): SimpleSurveyResult => {
    const answers: Record<string, string | string[] | boolean | number | Record<string, string>> = {};
    response.answers.forEach((answer) => {

      const key = answer.questionId;
      answers[key] = answer.value;
    });

    return {
      answers,
      completedAt: response.endTime || new Date(),
    };
  };

  const handleComplete = (response: SurveyResponse) => {
    if (onComplete) {
      onComplete(convertResponseToResult(response));
    }
  };

  const handleSubmit = (response: SurveyResponse) => {
    if (onSubmit) {
      onSubmit(convertResponseToResult(response));
    }
  };

  return <Survey config={config} onComplete={handleComplete} onSubmit={handleSubmit} />;
};
