export { SurveyBuilder } from './SurveyBuilder.js';
export { DataExporter } from './export/DataExporter.js';

export { Survey } from './react/Survey.js';
export { SurveyBuilder as ReactSurveyBuilder } from './react/SurveyBuilder.js';
export { SimpleSurvey } from './react/SimpleSurvey.js';
export type {
  SimpleQuestion,
  SimpleSurveyResult,
  SimpleSurveyProps,
} from './react/SimpleSurvey.js';

import { SurveyBuilder } from './SurveyBuilder.js';
export type {
  SurveyConfig,
  SurveyTheme,
  Question,
  QuestionBase,
  TextQuestion,
  ChoiceQuestion,
  ChoiceOption,
  FeedbackFormQuestion,
  ConditionalQuestion,
  UserAnswer,
  SurveyResponse,
  SurveyFlowState,
  ExportOptions,
  SurveyResults,
} from './types/index.js';


export const createSurvey = SurveyBuilder.createConfig;
export const createTheme = SurveyBuilder.createTheme;
export const createTextQuestion = SurveyBuilder.createTextQuestion;
export const createChoiceQuestion = SurveyBuilder.createChoiceQuestion;
export const createFeedbackForm = SurveyBuilder.createFeedbackForm;

export const VERSION = '1.0.0';
