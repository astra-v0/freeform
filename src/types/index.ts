export interface SurveyTheme {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export interface QuestionBase {
  id: string;
  type: 'text' | 'choice' | 'feedback' | 'conditional' | 'info' | 'social';
  title: string;
  description?: string;
  required?: boolean;
}

export interface TextQuestion extends QuestionBase {
  type: 'text';
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
}

export interface ChoiceOption {
  id: string;
  label: string;
  value: string;
}

export interface ChoiceQuestion extends QuestionBase {
  type: 'choice';
  options: ChoiceOption[];
  multiple?: boolean;
  allowOther?: boolean;
}

export interface FeedbackFormQuestion extends QuestionBase {
  type: 'feedback';
  fields: {
    firstName: boolean | { enabled: boolean; required?: boolean };
    lastName: boolean | { enabled: boolean; required?: boolean };
    email: boolean | { enabled: boolean; required?: boolean };
    company: boolean | { enabled: boolean; required?: boolean };
  };
}

export interface ConditionalQuestion extends QuestionBase {
  type: 'conditional';
  condition: {
    questionId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
    value: string | string[];
  };
  thenFlow: string[];
  elseFlow?: string[];
}

export interface InfoQuestion extends QuestionBase {
  type: 'info';
  icon?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: string;
}

export interface SocialQuestion extends QuestionBase {
  type: 'social';
  socials: SocialLink[];
}

export type Question = TextQuestion | ChoiceQuestion | FeedbackFormQuestion | ConditionalQuestion | InfoQuestion | SocialQuestion;

export interface SurveyConfig {
  id: string;
  title: string;
  description?: string;
  theme?: SurveyTheme;
  questions: Question[];
  startQuestionId: string;
  metadata?: Record<string, any>;
}
export interface UserAnswer {
  questionId: string;
  value: string | string[] | Record<string, any>;
  timestamp: Date;
}

export interface SurveyResponse {
  surveyId: string;
  sessionId: string;
  answers: UserAnswer[];
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  metadata?: Record<string, any>;
}

export interface SurveyFlowState {
  currentQuestionId: string;
  visitedQuestions: string[];
  answers: Map<string, UserAnswer>;
  canGoBack: boolean;
  canGoNext: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'object';
  includeMetadata?: boolean;
  includeTimestamps?: boolean;
}

export interface SurveyResults {
  responses: SurveyResponse[];
  summary: {
    totalResponses: number;
    completionRate: number;
    averageTime: number;
    questionStats: Record<string, {
      totalAnswers: number;
      uniqueAnswers: number;
      mostCommonAnswers: Array<{ value: string; count: number }>;
    }>;
  };
}
