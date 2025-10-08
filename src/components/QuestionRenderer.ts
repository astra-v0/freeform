import { Question, UserAnswer, SurveyTheme } from '../types/index.js';

export abstract class QuestionRenderer {
  protected theme: SurveyTheme;
  protected container: HTMLElement;

  constructor(theme: SurveyTheme, container: HTMLElement) {
    this.theme = theme;
    this.container = container;
  }

  abstract render(question: Question, currentAnswer?: UserAnswer): HTMLElement;
  abstract getAnswer(): UserAnswer | null;

  protected createBaseElement(question: Question): HTMLElement {
    const element = document.createElement('div');
    element.className = 'survey-question';
    element.style.cssText = `
      width: 100%;
      max-width: 600px;
      color: ${this.theme.textColor};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const title = document.createElement('h2');
    title.textContent = question.title;
    title.style.cssText = `
      font-size: 24px;
      font-weight: 400;
      margin: 0 0 32px 0;
      color: ${this.theme.textColor};
    `;

    if (question.description) {
      const description = document.createElement('p');
      description.textContent = question.description;
      description.style.cssText = `
        font-size: 16px;
        margin: 0 0 24px 0;
        color: ${this.theme.textColor};
      `;
      element.appendChild(description);
    }

    element.appendChild(title);
    return element;
  }

  protected createInput(placeholder?: string, multiline = false): HTMLInputElement | HTMLTextAreaElement {
    const input = multiline ? document.createElement('textarea') : document.createElement('input');
    
    if (!multiline) {
      (input as HTMLInputElement).type = 'text';
    }
    
    if (placeholder) {
      input.placeholder = placeholder;
    }

    const inputStyle = `
      width: 100%;
      padding: 8px 0;
      border: none;
      border-bottom: 1px solid ${this.theme.accentColor};
      background: transparent;
      color: ${this.theme.accentColor};
      font-size: 18px;
      outline: none;
      font-family: inherit;
      resize: ${multiline ? 'vertical' : 'none'};
      min-height: ${multiline ? '100px' : 'auto'};
    `;

    input.style.cssText = inputStyle;

    return input;
  }

  protected createButton(text: string, onClick: () => void, _primary = true): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    
    const buttonStyle = `
      background: transparent;
      color: ${this.theme.accentColor};
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
}
