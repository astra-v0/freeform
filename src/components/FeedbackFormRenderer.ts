import { QuestionRenderer } from './QuestionRenderer.js';
import { FeedbackFormQuestion, UserAnswer } from '../types/index.js';

export class FeedbackFormRenderer extends QuestionRenderer {
  private inputs: Map<string, HTMLInputElement> = new Map();

  render(
    question: FeedbackFormQuestion,
    currentAnswer?: UserAnswer
  ): HTMLElement {
    const element = this.createBaseElement(question);

    const formContainer = document.createElement('div');
    formContainer.style.cssText = `
      margin-top: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    `;

    if (question.fields.firstName) {
      const firstNameField = this.createFormField(
        'First Name',
        'firstName',
        'Enter your first name'
      );
      formContainer.appendChild(firstNameField);
    }

    if (question.fields.lastName) {
      const lastNameField = this.createFormField(
        'Last Name',
        'lastName',
        'Enter your last name'
      );
      formContainer.appendChild(lastNameField);
    }

    if (question.fields.email) {
      const emailField = this.createFormField(
        'Email',
        'email',
        'Enter your email',
        'email'
      );
      formContainer.appendChild(emailField);
    }

    if (question.fields.company) {
      const companyField = this.createFormField(
        'Company',
        'company',
        'Enter company name'
      );
      formContainer.appendChild(companyField);
    }

    element.appendChild(formContainer);

    if (
      currentAnswer &&
      typeof currentAnswer.value === 'object' &&
      !Array.isArray(currentAnswer.value)
    ) {
      const savedData = currentAnswer.value as Record<string, string>;
      Object.entries(savedData).forEach(([field, value]) => {
        const input = this.inputs.get(field);
        if (input) {
          input.value = value;
        }
      });
    }

    return element;
  }

  private createFormField(
    label: string,
    fieldName: string,
    placeholder: string,
    type: string = 'text'
  ): HTMLElement {
    const fieldContainer = document.createElement('div');

    const labelElement = document.createElement('label');
    labelElement.textContent = label;
    labelElement.style.cssText = `
      display: block;
      margin-bottom: 8px;
      font-size: 16px;
      font-weight: 500;
      color: ${this.theme.textColor};
    `;

    const input = this.createInput(placeholder) as HTMLInputElement;
    input.type = type;
    input.name = fieldName;

    if (type === 'email') {
      input.pattern = '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$';
      input.addEventListener('blur', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input.value && !emailRegex.test(input.value)) {
          input.style.borderBottomColor = '#e74c3c';
        } else {
          input.style.borderBottomColor = `${this.theme.accentColor}40`;
        }
      });
    }

    this.inputs.set(fieldName, input);

    fieldContainer.appendChild(labelElement);
    fieldContainer.appendChild(input);

    return fieldContainer;
  }

  getAnswer(): UserAnswer | null {
    const formData: Record<string, string> = {};
    let isValid = true;

    this.inputs.forEach((input, fieldName) => {
      const value = input.value.trim();
      formData[fieldName] = value;

      if (!value && input.required) {
        isValid = false;
        input.style.borderBottomColor = '#e74c3c';
      } else {
        input.style.borderBottomColor = `${this.theme.accentColor}40`;
      }
    });

    if (!isValid) {
      return null;
    }

    return {
      questionId: '',
      value: formData as any,
      timestamp: new Date(),
    };
  }
}
