import { Question, UserAnswer, SurveyConfig } from '../types/index.js';
import { ConditionEvaluator } from './conditionEvaluator.js';

export class SurveyFlowUtils {
  static getNextQuestionId(
    currentQuestion: Question,
    config: SurveyConfig,
    visitedQuestions: string[]
  ): string | null {
    const currentIndex = config.questions.findIndex(
      q => q.id === currentQuestion.id
    );
    const remainingQuestions = config.questions.slice(currentIndex + 1);

    const nextQuestion = remainingQuestions.find(
      q => !visitedQuestions.includes(q.id) && !q.hidden
    );

    return nextQuestion?.id || null;
  }

  static getConditionalNextQuestionId(
    currentQuestion: Question,
    answers: Map<string, UserAnswer>
  ): string | null {
    if (!currentQuestion.nextButton?.condition) {
      return null;
    }

    const condition = currentQuestion.nextButton.condition;
    if (ConditionEvaluator.evaluate(condition, answers)) {
      return condition.action.elementId;
    }

    return null;
  }

  static isLastQuestion(
    currentQuestion: Question,
    config: SurveyConfig,
    visitedQuestions: string[]
  ): boolean {
    const remainingQuestions = config.questions.filter(
      q =>
        !visitedQuestions.includes(q.id) &&
        q.id !== currentQuestion.id &&
        !q.hidden
    );

    return remainingQuestions.length === 0;
  }
}
