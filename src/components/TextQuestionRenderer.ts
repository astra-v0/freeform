import { QuestionRenderer } from './QuestionRenderer.js';
import { TextQuestion, UserAnswer } from '../types/index.js';

export class TextQuestionRenderer extends QuestionRenderer {
  private input!: HTMLInputElement | HTMLTextAreaElement;

  render(question: TextQuestion, currentAnswer?: UserAnswer): HTMLElement {
    const element = this.createBaseElement(question);

    const inputContainer = document.createElement('div');
    inputContainer.style.marginTop = '24px';

    this.input = this.createInput(question.placeholder, question.multiline);

    if (question.maxLength) {
      this.input.maxLength = question.maxLength;
    }

    if (currentAnswer && typeof currentAnswer.value === 'string') {
      this.input.value = currentAnswer.value;
    }

    if (question.maxLength) {
      const counter = document.createElement('div');
      counter.style.cssText = `
        text-align: right;
        font-size: 12px;
        margin-top: 8px;
        opacity: 0.6;
      `;

      const updateCounter = () => {
        counter.textContent = `${this.input.value.length}/${question.maxLength}`;
      };

      this.input.addEventListener('input', updateCounter);
      updateCounter();

      inputContainer.appendChild(counter);
    }

    inputContainer.appendChild(this.input);
    element.appendChild(inputContainer);

    return element;
  }

  getAnswer(): UserAnswer | null {
    const value = this.input.value.trim();
    if (!value && this.input.required) {
      return null;
    }

    return {
      questionId: '',
      value: value,
      timestamp: new Date(),
    };
  }
}
