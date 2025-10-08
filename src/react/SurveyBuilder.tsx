import React, { useState, useCallback } from 'react';
import {
  SurveyConfig,
  SurveyResponse,
  SurveyTheme,
  Question,
} from '../types/index.js';
import { Survey } from './Survey.js';
import { DataExporter } from '../export/DataExporter.js';

interface SurveyBuilderProps {
  config: SurveyConfig;
  onComplete?: (response: SurveyResponse) => void;
  onAnswer?: (answer: any) => void;
  onError?: (error: Error) => void;
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
  config,
  onComplete,
  onAnswer,
  onError: _onError,
}) => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);

  const handleComplete = useCallback(
    (response: SurveyResponse) => {
      setResponses(prev => [...prev, response]);

      if (onComplete) {
        onComplete(response);
      }
    },
    [onComplete]
  );

  const handleAnswer = useCallback(
    (answer: any) => {
      if (onAnswer) {
        onAnswer(answer);
      }
    },
    [onAnswer]
  );

  const exportData = useCallback(
    (format: 'csv' | 'json' | 'object', options: any = {}) => {
      const exporter = new DataExporter(responses);
      return exporter.export({ format, ...options });
    },
    [responses]
  );

  const _downloadData = useCallback(
    (format: 'csv' | 'json', filename?: string) => {
      const data = exportData(format) as string;
      const defaultFilename = `${config.id}_${new Date().toISOString().split('T')[0]}.${format}`;
      const finalFilename = filename || defaultFilename;

      const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
      DataExporter.exportToFile(data, finalFilename, mimeType);
    },
    [config.id, exportData]
  );

  return (
    <Survey
      config={config}
      onComplete={handleComplete}
      onAnswer={handleAnswer}
    />
  );
};

export const createSurvey = (options: {
  id: string;
  title: string;
  description?: string;
  theme?: Partial<SurveyTheme>;
}): Partial<SurveyConfig> => {
  return {
    id: options.id,
    title: options.title,
    description: options.description,
    theme: {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#007bff',
      ...options.theme,
    },
    questions: [],
    startQuestionId: '',
  };
};

export const createTheme = (theme: SurveyTheme): SurveyTheme => {
  return theme;
};

export const createTextQuestion = (options: {
  id: string;
  title: string;
  description?: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  required?: boolean;
}): Question => {
  return {
    type: 'text',
    id: options.id,
    title: options.title,
    description: options.description,
    placeholder: options.placeholder,
    multiline: options.multiline,
    maxLength: options.maxLength,
    required: options.required,
  };
};

export const createChoiceQuestion = (options: {
  id: string;
  title: string;
  description?: string;
  options: Array<{ id: string; label: string; value: string }>;
  multiple?: boolean;
  allowOther?: boolean;
  required?: boolean;
}): Question => {
  return {
    type: 'choice',
    id: options.id,
    title: options.title,
    description: options.description,
    options: options.options,
    multiple: options.multiple,
    allowOther: options.allowOther,
    required: options.required,
  };
};

export const createFeedbackForm = (options: {
  id: string;
  title: string;
  description?: string;
  fields: {
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    company: boolean;
  };
  required?: boolean;
}): Question => {
  return {
    type: 'feedback',
    id: options.id,
    title: options.title,
    description: options.description,
    fields: options.fields,
    required: options.required,
  };
};
