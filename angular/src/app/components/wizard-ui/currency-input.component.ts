import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lt-currency-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputComponent),
      multi: true
    }
  ],
  template: `
    <div style="display: flex; align-items: center; gap: 0.25rem;">
      <span style="font-weight: 500; color: #6b7280;">$</span>
      <input
        type="text"
        [placeholder]="placeholder"
        [value]="formatValue(value)"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [disabled]="disabled"
        [readonly]="readOnly"
        [attr.aria-label]="ariaLabel"
        [style.width]="width"
        [style.background-color]="backgroundColor"
        style="text-align: right; border: 1px solid #d1d5db; border-radius: 4px; padding: 0.5rem;"
        [style.cursor]="readOnly ? 'not-allowed' : 'text'"
      />
    </div>
  `,
})
export class CurrencyInputComponent implements ControlValueAccessor {
  @Input() value?: number;
  @Input() placeholder = '';
  @Input() width = '140px';
  @Input() disabled = false;
  @Input() readOnly = false;
  @Input() backgroundColor = 'white';
  @Input() ariaLabel = '';
  
  @Output() valueChange = new EventEmitter<number | undefined>();

  private onChange = (value: number | undefined) => {};
  onTouched = () => {};

  formatValue(val: number | undefined): string {
    if (val === undefined || val === null) return '';
    return val.toLocaleString();
  }

  parseValue(inputValue: string): number | undefined {
    const cleaned = inputValue.replace(/[,$]/g, '');
    if (cleaned === '') return undefined;
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parsedValue = this.parseValue(target.value);
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
