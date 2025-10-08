import {
  SurveyConfig,
  SurveyResponse,
  SurveyTheme,
  Question,
} from './types/index.js';
import { SurveyEngine } from './core/SurveyEngine.js';
import { DataExporter } from './export/DataExporter.js';

export class SurveyBuilder {
  private config: SurveyConfig;
  private engine?: SurveyEngine;
  private responses: SurveyResponse[] = [];

  constructor(config: SurveyConfig) {
    this.config = config;
  }

  public render(container: HTMLElement): SurveyBuilder {
    this.engine = new SurveyEngine(this.config, container);
    this.engine.setEventHandlers({
      onNext: answer => {
        console.log('Answer received:', answer);
      },
      onComplete: response => {
        this.responses.push(response);
        console.log('Survey completed:', response);
      },
      onError: error => {
        console.error('Survey error:', error);
      },
    });

    return this;
  }

  public onComplete(
    callback: (response: SurveyResponse) => void
  ): SurveyBuilder {
    if (this.engine) {
      this.engine.setEventHandlers({
        onComplete: response => {
          this.responses.push(response);
          callback(response);
        },
      });
    }
    return this;
  }

  public onAnswer(callback: (answer: any) => void): SurveyBuilder {
    if (this.engine) {
      this.engine.setEventHandlers({
        onNext: callback,
      });
    }
    return this;
  }

  public getResponses(): SurveyResponse[] {
    return [...this.responses];
  }

  public export(
    format: 'csv' | 'json' | 'object',
    options: any = {}
  ): string | object {
    const exporter = new DataExporter(this.responses);
    return exporter.export({ format, ...options });
  }

  public download(format: 'csv' | 'json', filename?: string): void {
    const data = this.export(format) as string;
    const defaultFilename = `${this.config.id}_${new Date().toISOString().split('T')[0]}.${format}`;
    const finalFilename = filename || defaultFilename;

    const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
    DataExporter.exportToFile(data, finalFilename, mimeType);
  }

  public getCurrentState() {
    return this.engine?.getCurrentState();
  }

  public getAnswers() {
    return this.engine?.getAnswers() || [];
  }

  public getStartTime() {
    return this.engine?.getStartTime();
  }

  public static createConfig(options: {
    id: string;
    title: string;
    description?: string;
    theme?: Partial<SurveyTheme>;
  }): Partial<SurveyConfig> {
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
  }

  public static createTheme(theme: SurveyTheme): SurveyTheme {
    return theme;
  }

  public static createTextQuestion(options: {
    id: string;
    title: string;
    description?: string;
    placeholder?: string;
    multiline?: boolean;
    maxLength?: number;
    required?: boolean;
  }): Question {
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
  }

  public static createChoiceQuestion(options: {
    id: string;
    title: string;
    description?: string;
    options: Array<{ id: string; label: string; value: string }>;
    multiple?: boolean;
    allowOther?: boolean;
    required?: boolean;
  }): Question {
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
  }

  public static createFeedbackForm(options: {
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
  }): Question {
    return {
      type: 'feedback',
      id: options.id,
      title: options.title,
      description: options.description,
      fields: options.fields,
      required: options.required,
    };
  }
}
