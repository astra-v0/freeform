import { QuestionRenderer } from './QuestionRenderer.js';
import { ChoiceQuestion, UserAnswer } from '../types/index.js';

export class ChoiceQuestionRenderer extends QuestionRenderer {
  private selectedValues: Set<string> = new Set();
  private otherInput?: HTMLInputElement;

  render(question: ChoiceQuestion, currentAnswer?: UserAnswer): HTMLElement {
    const element = this.createBaseElement(question);
    
    if (currentAnswer) {
      if (Array.isArray(currentAnswer.value)) {
        this.selectedValues = new Set(currentAnswer.value);
      } else if (typeof currentAnswer.value === 'string') {
        this.selectedValues = new Set([currentAnswer.value]);
      }
    }
    
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = `
      margin-top: 32px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;
    
    question.options.forEach(option => {
      const optionElement = this.createOptionElement(option, question.multiple);
      optionsContainer.appendChild(optionElement);
    });
    
    if (question.allowOther) {
      const otherContainer = document.createElement('div');
      otherContainer.style.cssText = `
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid ${this.theme.accentColor}20;
      `;
      
      const otherLabel = document.createElement('label');
      otherLabel.textContent = 'Other option:';
      otherLabel.style.cssText = `
        display: block;
        margin-bottom: 8px;
        font-size: 16px;
        opacity: 0.8;
      `;
      
      this.otherInput = this.createInput('Specify your option') as HTMLInputElement;
      this.otherInput.style.cssText += `
        margin-top: 8px;
      `;
      
      if (currentAnswer && Array.isArray(currentAnswer.value)) {
        const otherValue = currentAnswer.value.find(v => !question.options.some(o => o.value === v));
        if (otherValue) {
          this.otherInput.value = otherValue;
        }
      }
      
      otherContainer.appendChild(otherLabel);
      otherContainer.appendChild(this.otherInput);
      optionsContainer.appendChild(otherContainer);
    }
    
    element.appendChild(optionsContainer);
    return element;
  }

  private createOptionElement(option: { id: string; label: string; value: string }, multiple: boolean = false): HTMLElement {
    const container = document.createElement('label');
    container.style.cssText = `
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border: 2px solid ${this.theme.accentColor}20;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: ${this.selectedValues.has(option.value) ? `${this.theme.accentColor}10` : 'transparent'};
    `;
    
    const input = document.createElement('input');
    input.type = multiple ? 'checkbox' : 'radio';
    input.name = 'choice';
    input.value = option.value;
    input.checked = this.selectedValues.has(option.value);
    
    input.style.cssText = `
      margin-right: 16px;
      accent-color: ${this.theme.accentColor};
      transform: scale(1.2);
    `;
    
    const label = document.createElement('span');
    label.textContent = option.label;
    label.style.cssText = `
      font-size: 16px;
      flex: 1;
    `;
    
    container.appendChild(input);
    container.appendChild(label);
    
    input.addEventListener('change', () => {
      if (multiple) {
        if (input.checked) {
          this.selectedValues.add(option.value);
        } else {
          this.selectedValues.delete(option.value);
        }
      } else {
        this.selectedValues.clear();
        this.selectedValues.add(option.value);
      }
      
      this.updateOptionStyles();
    });
    
    container.addEventListener('mouseenter', () => {
      if (!this.selectedValues.has(option.value)) {
        container.style.borderColor = `${this.theme.accentColor}60`;
        container.style.backgroundColor = `${this.theme.accentColor}05`;
      }
    });
    
    container.addEventListener('mouseleave', () => {
      if (!this.selectedValues.has(option.value)) {
        container.style.borderColor = `${this.theme.accentColor}20`;
        container.style.backgroundColor = 'transparent';
      }
    });
    
    return container;
  }
  
  private updateOptionStyles(): void {
    const containers = this.container.querySelectorAll('label');
    containers.forEach(container => {
      const input = container.querySelector('input') as HTMLInputElement;
      if (input && this.selectedValues.has(input.value)) {
        container.style.backgroundColor = `${this.theme.accentColor}10`;
        container.style.borderColor = this.theme.accentColor;
      } else {
        container.style.backgroundColor = 'transparent';
        container.style.borderColor = `${this.theme.accentColor}20`;
      }
    });
  }

  getAnswer(): UserAnswer | null {
    const values = Array.from(this.selectedValues);
    
    if (this.otherInput && this.otherInput.value.trim()) {
      values.push(this.otherInput.value.trim());
    }
    
    if (values.length === 0) {
      return null;
    }
    
    return {
      questionId: '',
      value: values.length === 1 ? values[0] : values,
      timestamp: new Date()
    };
  }
}
