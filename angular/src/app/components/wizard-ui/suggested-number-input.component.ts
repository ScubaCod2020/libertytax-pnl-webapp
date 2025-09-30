import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { CalculatedSuggestions } from '../../domain/types/suggestion.types';

@Component({
  selector: 'lt-suggested-number-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SuggestedNumberInputComponent),
      multi: true
    }
  ],
  template: `
    <div style="display: flex; align-items: center;">
      <span 
        *ngIf="prefix" 
        style="margin-right: 0.25rem; font-weight: 500; color: #6b7280;"
      >
        {{ prefix }}
      </span>
      <input
        type="number"
        [value]="value ?? ''"
        [placeholder]="displayPlaceholder"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [disabled]="disabled"
        [style.width]="width"
        [style.background-color]="disabled ? '#f9fafb' : 'white'"
        [style.color]="disabled ? '#6b7280' : '#111827'"
        style="padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem;"
      />
    </div>
  `,
})
export class SuggestedNumberInputComponent implements ControlValueAccessor {
  @Input() value?: number;
  @Input() placeholder?: string;
  @Input() prefix?: string;
  @Input() width = '140px';
  @Input() disabled = false;
  @Input() fieldId = '';
  @Input() suggestions?: CalculatedSuggestions | null;
  
  @Output() valueChange = new EventEmitter<number | undefined>();

  private onChange = (value: number | undefined) => {};
  onTouched = () => {};

  get suggestedValue(): number | undefined {
    if (!this.suggestions || !this.fieldId) return undefined;
    return (this.suggestions as any)[this.fieldId] as number;
  }

  get displayPlaceholder(): string {
    return this.placeholder || 
           (this.suggestedValue ? `${this.suggestedValue.toLocaleString()}` : '');
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parsedValue = +target.value || undefined;
    this.value = parsedValue;
    this.onChange(parsedValue);
    this.valueChange.emit(parsedValue);
  }

  // ControlValueAccessor implementation
  writeValue(value: number | undefined): void {
    this.value = value;
  }

  registerOnChange(fn: (value: number | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
