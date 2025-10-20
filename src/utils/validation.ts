import { Question, UserAnswer, TextQuestion, FeedbackFormQuestion } from '../types/index.js';

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}

export class ValidationUtils {
  static validateRequiredAnswer(
    question: Question,
    answer: UserAnswer | null
  ): ValidationResult {
    if (!question.required) {
      return { isValid: true, errorMessage: '' };
    }

    if (!answer || !answer.value) {
      return {
        isValid: false,
        errorMessage: this.getRequiredErrorMessage(question.type),
      };
    }

    if (typeof answer.value === 'string' && !answer.value.trim()) {
      return {
        isValid: false,
        errorMessage: 'Please enter an answer',
      };
    }

    if (Array.isArray(answer.value) && answer.value.length === 0) {
      return {
        isValid: false,
        errorMessage: 'Please select at least one option',
      };
    }

    return { isValid: true, errorMessage: '' };
  }

  static validateTextQuestion(
    question: TextQuestion,
    answer: UserAnswer
  ): ValidationResult {
    if (typeof answer.value !== 'string') {
      return { isValid: true, errorMessage: '' };
    }

    const trimmedValue = answer.value.trim();
    if (!trimmedValue) {
      return { isValid: true, errorMessage: '' };
    }

    if (!question.validation) {
      return { isValid: true, errorMessage: '' };
    }

    const { type, min, max, errorMessage } = question.validation;

    if (type === 'number') {
      const numValue = parseFloat(trimmedValue);
      if (isNaN(numValue)) {
        return {
          isValid: false,
          errorMessage: errorMessage || 'Please enter a valid number',
        };
      }

      if (min !== undefined && numValue < min) {
        return {
          isValid: false,
          errorMessage: errorMessage || `Value must be at least ${min}`,
        };
      }

      if (max !== undefined && numValue > max) {
        return {
          isValid: false,
          errorMessage: errorMessage || `Value must be at most ${max}`,
        };
      }
    }

    return { isValid: true, errorMessage: '' };
  }

  static validateFeedbackForm(
    question: FeedbackFormQuestion,
    answer: UserAnswer
  ): ValidationResult {
    if (typeof answer.value !== 'object' || answer.value === null) {
      return { isValid: true, errorMessage: '' };
    }

    const formData = answer.value as Record<string, string>;
    const requiredFields: string[] = [];

    const fieldNames = ['firstName', 'lastName', 'email', 'company'] as const;
    fieldNames.forEach(fieldName => {
      const field = question.fields[fieldName];
      const isEnabled = typeof field === 'boolean' ? field : field.enabled;
      const isRequired =
        typeof field === 'boolean' ? false : (field.required ?? false);

      if (
        isEnabled &&
        isRequired &&
        (!formData[fieldName] || !formData[fieldName].trim())
      ) {
        const displayName =
          fieldName.charAt(0).toUpperCase() +
          fieldName.slice(1).replace(/([A-Z])/g, ' $1');
        requiredFields.push(displayName);
      }
    });

    if (requiredFields.length > 0) {
      return {
        isValid: false,
        errorMessage: `Please fill in the required fields: ${requiredFields.join(', ')}`,
      };
    }

    // Validate email format if email field is enabled and has a value
    const emailField = question.fields.email;
    const isEmailEnabled =
      typeof emailField === 'boolean' ? emailField : emailField.enabled;
    if (isEmailEnabled && formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        return {
          isValid: false,
          errorMessage: 'Please enter a valid email address',
        };
      }
    }

    return { isValid: true, errorMessage: '' };
  }

  private static getRequiredErrorMessage(questionType: string): string {
    switch (questionType) {
      case 'choice':
        return 'Please select one of the options';
      case 'feedback':
        return 'Please fill in the required fields';
      default:
        return 'Please enter an answer';
    }
  }
}
