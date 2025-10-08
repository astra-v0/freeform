import { 
  SurveyConfig, 
  Question, 
  UserAnswer, 
  SurveyFlowState, 
  SurveyResponse,
  ConditionalQuestion 
} from '../types/index.js';
import { QuestionRenderer } from '../components/QuestionRenderer.js';
import { TextQuestionRenderer } from '../components/TextQuestionRenderer.js';
import { ChoiceQuestionRenderer } from '../components/ChoiceQuestionRenderer.js';
import { FeedbackFormRenderer } from '../components/FeedbackFormRenderer.js';

export class SurveyEngine {
  private config: SurveyConfig;
  private currentState: SurveyFlowState;
  private renderers: Map<string, QuestionRenderer> = new Map();
  private container: HTMLElement;
  private currentRenderer?: QuestionRenderer;
  private startTime: Date;
  private eventHandlers: {
    onNext?: (answer: UserAnswer) => void;
    onBack?: () => void;
    onComplete?: (response: SurveyResponse) => void;
    onError?: (error: Error) => void;
  } = {};

  constructor(config: SurveyConfig, container: HTMLElement) {
    const defaultTheme = {
      backgroundColor: '#1d1d1d',
      textColor: '#ffffff',
      accentColor: '#4A9EFF'
    };

    this.config = {
      ...config,
      theme: config.theme || defaultTheme
    };
    
    this.container = container;
    this.startTime = new Date();
    this.currentState = {
      currentQuestionId: config.startQuestionId,
      visitedQuestions: [],
      answers: new Map(),
      canGoBack: false,
      canGoNext: true
    };
    
    this.setupRenderers();
    this.renderCurrentQuestion();
  }

  private setupRenderers(): void {
    this.config.questions.forEach(question => {
      let renderer: QuestionRenderer;
      
      switch (question.type) {
        case 'text':
          renderer = new TextQuestionRenderer(this.config.theme!, this.container);
          break;
        case 'choice':
          renderer = new ChoiceQuestionRenderer(this.config.theme!, this.container);
          break;
        case 'feedback':
          renderer = new FeedbackFormRenderer(this.config.theme!, this.container);
          break;
        default:
          throw new Error(`Unsupported question type: ${question.type}`);
      }
      
      this.renderers.set(question.id, renderer);
    });
  }

  private getCurrentQuestion(): Question | undefined {
    return this.config.questions.find(q => q.id === this.currentState.currentQuestionId);
  }

  private renderCurrentQuestion(): void {
    const question = this.getCurrentQuestion();
    if (!question) {
      this.handleComplete();
      return;
    }

    this.container.innerHTML = '';
    
    const currentAnswer = this.currentState.answers.get(question.id);
    this.currentRenderer = this.renderers.get(question.id);
    if (this.currentRenderer) {
      const questionElement = this.currentRenderer.render(question, currentAnswer);
      this.container.appendChild(questionElement);
      
      this.addNavigation(question);
    }
  }

  private addNavigation(question: Question): void {
    const navigationContainer = document.createElement('div');
    navigationContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 48px;
    `;
    
    if (this.currentState.canGoBack) {
      const backButton = this.createNavigationButton('Back', false, () => this.goBack());
      navigationContainer.appendChild(backButton);
    } else {
      const spacer = document.createElement('div');
      navigationContainer.appendChild(spacer);
    }
    
    const isLastQuestion = this.isLastQuestion();
    const nextButtonText = isLastQuestion ? 'Complete' : 'Next';
    const nextButton = this.createNavigationButton(nextButtonText, true, () => this.goNext());
    navigationContainer.appendChild(nextButton);
    
    this.container.appendChild(navigationContainer);
  }

  private createNavigationButton(text: string, primary: boolean, onClick: () => void): HTMLElement {
    const button = document.createElement('button');
    button.textContent = text;
    
    const buttonStyle = `
      background: transparent;
      color: ${this.config.theme!.accentColor};
      border: none;
      padding: 12px 0;
      font-size: 16px;
      cursor: pointer;
      text-decoration: underline;
    `;

    button.style.cssText = buttonStyle;
    button.addEventListener('click', onClick);
    
    return button;
  }

  private isLastQuestion(): boolean {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion || currentQuestion.type === 'conditional') {
      return false;
    }
    
    const remainingQuestions = this.config.questions.filter(q => 
      !this.currentState.visitedQuestions.includes(q.id) && 
      q.id !== this.currentState.currentQuestionId
    );
    
    return remainingQuestions.length === 0;
  }

  private goNext(): void {
    const question = this.getCurrentQuestion();
    if (!question || !this.currentRenderer) {
      return;
    }

    const answer = this.currentRenderer.getAnswer();
    if (!answer) {
      this.showValidationError();
      return;
    }

    answer.questionId = question.id;
    this.currentState.answers.set(question.id, answer);
    this.currentState.visitedQuestions.push(question.id);

    const nextQuestionId = this.getNextQuestionId(question, answer);
    
    if (nextQuestionId) {
      this.currentState.currentQuestionId = nextQuestionId;
      this.currentState.canGoBack = true;
      this.renderCurrentQuestion();
      
      if (this.eventHandlers.onNext) {
        this.eventHandlers.onNext(answer);
      }
    } else {
      this.handleComplete();
    }
  }

  private getNextQuestionId(currentQuestion: Question, answer: UserAnswer): string | null {
    if (currentQuestion.type === 'conditional') {
      const conditionalQuestion = currentQuestion as ConditionalQuestion;
      const condition = conditionalQuestion.condition;
      
      if (this.evaluateCondition(condition, answer.value)) {
        return conditionalQuestion.thenFlow[0] || null;
      } else if (conditionalQuestion.elseFlow) {
        return conditionalQuestion.elseFlow[0] || null;
      }
    }
    
    const currentIndex = this.config.questions.findIndex(q => q.id === currentQuestion.id);
    const remainingQuestions = this.config.questions.slice(currentIndex + 1);
    
    const nextQuestion = remainingQuestions.find(q => 
      !this.currentState.visitedQuestions.includes(q.id)
    );
    
    return nextQuestion?.id || null;
  }

  private evaluateCondition(condition: ConditionalQuestion['condition'], answerValue: any): boolean {
    const { operator, value: conditionValue } = condition;
    
    switch (operator) {
      case 'equals':
        return answerValue === conditionValue;
      case 'not_equals':
        return answerValue !== conditionValue;
      case 'contains':
        if (Array.isArray(answerValue)) {
          return answerValue.includes(conditionValue);
        }
        return String(answerValue).includes(String(conditionValue));
      case 'not_contains':
        if (Array.isArray(answerValue)) {
          return !answerValue.includes(conditionValue);
        }
        return !String(answerValue).includes(String(conditionValue));
      default:
        return false;
    }
  }

  private goBack(): void {
    if (!this.currentState.canGoBack || this.currentState.visitedQuestions.length === 0) {
      return;
    }

    const previousQuestionId = this.currentState.visitedQuestions.pop();
    if (previousQuestionId) {
      this.currentState.currentQuestionId = previousQuestionId;
      this.currentState.canGoBack = this.currentState.visitedQuestions.length > 0;
      this.renderCurrentQuestion();
      
      if (this.eventHandlers.onBack) {
        this.eventHandlers.onBack();
      }
    }
  }

  private showValidationError(): void {
    const errorElement = document.createElement('div');
    errorElement.textContent = 'Please fill in the required fields';
    errorElement.style.cssText = `
      color: #e74c3c;
      text-align: center;
      margin-top: 16px;
      padding: 12px;
      background-color: #e74c3c20;
      border-radius: 8px;
      animation: shake 0.5s ease-in-out;
    `;
    
    this.container.appendChild(errorElement);
    
    setTimeout(() => {
      errorElement.remove();
    }, 3000);
  }

  private handleComplete(): void {
    const response: SurveyResponse = {
      surveyId: this.config.id,
      sessionId: this.generateSessionId(),
      answers: Array.from(this.currentState.answers.values()),
      completed: true,
      startTime: this.startTime,
      endTime: new Date(),
      metadata: this.config.metadata
    };

    this.showCompletionScreen();
    
    if (this.eventHandlers.onComplete) {
      this.eventHandlers.onComplete(response);
    }
  }

  private showCompletionScreen(): void {
    this.container.innerHTML = '';
    
    const completionElement = document.createElement('div');
    completionElement.style.cssText = `
      text-align: center;
      color: ${this.config.theme!.textColor};
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Thank you for participating!';
    title.style.cssText = `
      font-size: 24px;
      font-weight: 400;
      margin: 0;
      color: ${this.config.theme!.textColor};
    `;
    
    const message = document.createElement('p');
    message.textContent = 'Your answers have been saved successfully.';
    message.style.cssText = `
      font-size: 16px;
      margin-top: 16px;
      color: ${this.config.theme!.textColor};
    `;
    
    completionElement.appendChild(title);
    completionElement.appendChild(message);
    this.container.appendChild(completionElement);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public setEventHandlers(handlers: typeof this.eventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  public getCurrentState(): SurveyFlowState {
    return { ...this.currentState };
  }

  public getAnswers(): UserAnswer[] {
    return Array.from(this.currentState.answers.values());
  }

  public getStartTime(): Date {
    return this.startTime;
  }
}
