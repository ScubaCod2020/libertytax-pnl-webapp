import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

import { ExpenseField } from '../../domain/types/expenses.types';
import {
  ValidationResult,
  ValidationContext,
  validateFinancialInput,
  safeParseNumber,
  getFieldDescription,
} from '../../domain/utils/validation.utils';

export interface ValidatedInputData {
  value: number;
  isValid: boolean;
}

@Component({
  selector: 'app-validated-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="validated-input-container" [class]="containerClass">
      <input
        [id]="inputId"
        type="number"
        [(ngModel)]="displayValue"
        (input)="onInputChange($event)"
        (blur)="onBlur()"
        [disabled]="disabled"
        [placeholder]="placeholder"
        [min]="field.min"
        [max]="field.max"
        [step]="field.step"
        [class]="inputClass"
        [style]="inputStyle"
        [attr.aria-label]="ariaLabel"
        [attr.aria-describedby]="ariaDescribedBy"
        [attr.aria-invalid]="!validation.isValid"
        [attr.aria-required]="required"
      />

      <!-- Error message display -->
      <div
        *ngIf="!validation.isValid && validation.error"
        [id]="errorId"
        role="alert"
        class="error-message"
      >
        <span class="error-icon" aria-hidden="true">❌</span>
        {{ validation.error }}
      </div>

      <!-- Warning message display -->
      <div
        *ngIf="validation.isValid && validation.warning"
        [id]="warningId"
        role="alert"
        aria-live="polite"
        class="warning-message"
      >
        <span class="warning-icon" aria-hidden="true">⚠️</span>
        {{ validation.warning }}
      </div>

      <!-- Helper text for field ranges -->
      <div *ngIf="validation.isValid && !validation.warning && showHelperText" class="helper-text">
        Range: {{ field.min }}–{{ field.max }}{{ fieldUnit }}
      </div>
    </div>
  `,
  styles: [
    `
      .validated-input-container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .validated-input {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 1rem;
        width: 100%;
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease;
      }

      .validated-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .validated-input:disabled {
        background-color: #f3f4f6;
        color: #9ca3af;
        cursor: not-allowed;
      }

      .validated-input.error {
        border-color: #dc2626;
        background-color: #fef2f2;
      }

      .validated-input.warning {
        border-color: #f59e0b;
        background-color: #fffbeb;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: #dc2626;
        font-size: 0.875rem;
      }

      .warning-message {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: #f59e0b;
        font-size: 0.875rem;
      }

      .helper-text {
        color: #6b7280;
        font-size: 0.75rem;
      }

      .error-icon,
      .warning-icon {
        font-size: 0.875rem;
      }

      /* Compact variant */
      .validated-input-container.compact .validated-input {
        padding: 0.375rem;
        font-size: 0.875rem;
      }

      .validated-input-container.compact .error-message,
      .validated-input-container.compact .warning-message {
        font-size: 0.8125rem;
      }

      .validated-input-container.compact .helper-text {
        font-size: 0.6875rem;
      }
    `,
  ],
})
export class ValidatedInputComponent implements OnInit, OnDestroy {
  @Input() field!: ExpenseField;
  @Input() value: number | string = '';
  @Input() disabled = false;
  @Input() placeholder?: string;
  @Input() context?: ValidationContext;
  @Input() required = false;
  @Input() showHelperText = true;
  @Input() variant: 'normal' | 'compact' = 'normal';
  @Input() customClass?: string;
  @Input() debounceMs = 300;

  @Output() valueChange = new EventEmitter<ValidatedInputData>();
  @Output() validationChange = new EventEmitter<ValidationResult>();

  validation: ValidationResult = { isValid: true };
  displayValue: string = '';

  private destroy$ = new Subject<void>();
  private inputChange$ = new Subject<string>();
  private static idCounter = 0;

  readonly inputId = `validated-input-${++ValidatedInputComponent.idCounter}`;
  readonly errorId = `error-${this.inputId}`;
  readonly warningId = `warning-${this.inputId}`;

  ngOnInit(): void {
    // Initialize display value
    this.updateDisplayValue();

    // Set up debounced input validation
    this.inputChange$
      .pipe(debounceTime(this.debounceMs), takeUntil(this.destroy$))
      .subscribe((inputValue) => {
        this.validateAndEmit(inputValue);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get containerClass(): string {
    const classes = ['validated-input-container'];
    if (this.variant === 'compact') classes.push('compact');
    if (this.customClass) classes.push(this.customClass);
    return classes.join(' ');
  }

  get inputClass(): string {
    const classes = ['validated-input'];
    if (!this.validation.isValid) classes.push('error');
    else if (this.validation.warning) classes.push('warning');
    return classes.join(' ');
  }

  get inputStyle(): Record<string, string> {
    // Allow custom styling through CSS classes
    return {};
  }

  get fieldUnit(): string {
    switch (this.field.calculationBase) {
      case 'percentage_gross':
      case 'percentage_salaries':
      case 'percentage_tp_income':
        return '%';
      case 'fixed_amount':
        return '';
      default:
        return '';
    }
  }

  get ariaLabel(): string {
    return `${this.field.label} (${getFieldDescription(this.field)})`;
  }

  get ariaDescribedBy(): string {
    const describedBy: string[] = [];

    if (!this.validation.isValid && this.validation.error) {
      describedBy.push(this.errorId);
    }

    if (this.validation.isValid && this.validation.warning) {
      describedBy.push(this.warningId);
    }

    return describedBy.join(' ') || '';
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const inputValue = target.value;
    this.displayValue = inputValue;

    // Trigger debounced validation
    this.inputChange$.next(inputValue);
  }

  onBlur(): void {
    // Immediate validation on blur for final check
    this.validateAndEmit(this.displayValue);
  }

  private updateDisplayValue(): void {
    const stringValue = typeof this.value === 'number' ? this.value.toString() : this.value;
    this.displayValue = stringValue || '';
  }

  private validateAndEmit(inputValue: string): void {
    // Validate the input
    const validationResult = validateFinancialInput({
      field: this.field,
      value: inputValue,
      context: this.context,
    });

    this.validation = validationResult;

    // Convert to number and emit
    const numericValue = safeParseNumber(inputValue, 0);

    const validatedData: ValidatedInputData = {
      value: numericValue,
      isValid: validationResult.isValid,
    };

    this.valueChange.emit(validatedData);
    this.validationChange.emit(validationResult);
  }

  // Public method for external validation trigger
  revalidate(): void {
    this.validateAndEmit(this.displayValue);
  }
}
