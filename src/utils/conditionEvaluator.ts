import { UserAnswer } from '../types/index.js';

export interface Condition {
  elementId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
  value: string | string[];
}

export class ConditionEvaluator {
  static evaluate(
    condition: Condition,
    answers: Map<string, UserAnswer>
  ): boolean {
    const answer = answers.get(condition.elementId);
    if (!answer) return false;

    const answerValue = answer.value;
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        if (Array.isArray(answerValue)) {
          return answerValue.includes(conditionValue as string);
        }
        return answerValue === conditionValue;

      case 'not_equals':
        if (Array.isArray(answerValue)) {
          return !answerValue.includes(conditionValue as string);
        }
        return answerValue !== conditionValue;

      case 'contains':
        if (Array.isArray(answerValue)) {
          return answerValue.some(v => String(v).includes(String(conditionValue)));
        }
        return String(answerValue).includes(Array.isArray(conditionValue) ? conditionValue.join(',') : String(conditionValue));

      case 'not_contains':
        if (Array.isArray(answerValue)) {
          return !answerValue.some(v => String(v).includes(String(conditionValue)));
        }
        return !String(answerValue).includes(Array.isArray(conditionValue) ? conditionValue.join(',') : String(conditionValue));

      default:
        return false;
    }
  }
}
