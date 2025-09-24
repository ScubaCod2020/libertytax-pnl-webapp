import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WizardFormFieldComponent } from './wizard-form-field.component';
import { CalculatedSuggestions } from '../../domain/types/suggestion.types';

@Component({
  selector: 'lt-suggested-form-field',
  standalone: true,
  imports: [CommonModule, WizardFormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lt-wizard-form-field 
      [label]="label" 
      [helpText]="enhancedHelpText" 
      [required]="required"
    >
      <div class="suggested-field-wrapper">
        <!-- Input Field -->
        <div class="input-container">
          <ng-content></ng-content>
        </div>

        <!-- Suggestion Display -->
        <div 
          *ngIf="hasSuggestion"
          class="suggestion-container"
        >
          <!-- Suggestion Badge -->
          <div 
            class="suggestion-badge"
            [class.calculated]="isCalculated"
            [class.suggested]="!isCalculated"
          >
            {{ isCalculated ? '📊' : '💡' }} {{ formattedSuggestion }}
          </div>

          <!-- Visual flow indicator for calculated fields -->
          <div 
            *ngIf="isCalculated"
            class="flow-indicator"
          >
            ←
          </div>
        </div>
      </div>
    </lt-wizard-form-field>
  `,
  styles: [`
    .suggested-field-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .input-container {
      flex: 1;
    }

    .suggestion-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: fit-content;
    }

    .suggestion-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .suggestion-badge.calculated {
      background-color: #dbeafe;
      border: 1px solid #3b82f6;
      color: #1d4ed8;
    }

    .suggestion-badge.suggested {
      background-color: #f0f9ff;
      border: 1px solid #0ea5e9;
      color: #0369a1;
    }

    .flow-indicator {
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 500;
    }
  `]
})
export class SuggestedFormFieldComponent {
  @Input() label = '';
  @Input() helpText?: string;
  @Input() required = false;
  @Input() fieldId = '';
  @Input() suggestions?: CalculatedSuggestions | null;
  @Input() isCalculated = false;

  get suggestedValue(): number | undefined {
    if (!this.suggestions || !this.fieldId) return undefined;
    return (this.suggestions as any)[this.fieldId];
  }

  get hasSuggestion(): boolean {
    return this.suggestedValue !== undefined && this.suggestedValue !== null;
  }

  get formattedSuggestion(): string {
    if (!this.hasSuggestion) return '';
    return this.formatSuggestion(this.suggestedValue!);
  }

  get enhancedHelpText(): string {
    if (!this.hasSuggestion) return this.helpText || '';

    const suggestionText = `Suggested: ${this.formattedSuggestion}`;

    if (this.isCalculated) {
      const calculationText = 'Auto-calculated from inputs above';
      return this.helpText
        ? `${this.helpText} • ${calculationText} • ${suggestionText}`
        : `${calculationText} • ${suggestionText}`;
    }

    return this.helpText ? `${this.helpText} • ${suggestionText}` : suggestionText;
  }

  private formatSuggestion(value: number): string {
    if (typeof value !== 'number' || isNaN(value)) return '';

    // Currency fields
    if (
      this.fieldId.includes('fees') ||
      this.fieldId.includes('income') ||
      this.fieldId.includes('revenue') ||
      this.fieldId.includes('expenses') ||
      this.fieldId.includes('Amount')
    ) {
      return `$${value.toLocaleString()}`;
    }

    // Percentage fields
    if (this.fieldId.includes('Pct') || this.fieldId === 'discountsPct') {
      return `${value.toFixed(1)}%`;
    }

    // Count fields (returns)
    if (this.fieldId.includes('Returns') || this.fieldId.includes('returns')) {
      return value.toLocaleString();
    }

    // Default number formatting
    return value.toLocaleString();
  }
}
