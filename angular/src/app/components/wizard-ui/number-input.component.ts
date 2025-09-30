import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lt-number-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true
    }
  ],
  template: `
    <div style="display: flex; align-items: center; gap: 0.25rem;">
      <span *ngIf="prefix" style="font-weight: 500; color: #6b7280;">{{ prefix }}</span>
      <input
        type="number"
        [placeholder]="placeholder"
        [value]="value || ''"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [disabled]="disabled"
        [min]="min"
        [max]="max"
        [attr.aria-label]="ariaLabel"
        [style.width]="width"
        style="text-align: right; border: 1px solid #d1d5db; border-radius: 4px; padding: 0.5rem;"
      />
      <span *ngIf="suffix" style="font-weight: 500; color: #6b7280;">{{ suffix }}</span>
    </div>
  `,
})
export class NumberInputComponent implements ControlValueAccessor {
  @Input() value?: number;
  @Input() placeholder = '';
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() width = '140px';
  @Input() disabled = false;
  @Input() min?: number;
  @Input() max?: number;
  @Input() ariaLabel = '';
  
  @Output() valueChange = new EventEmitter<number | undefined>();

  private onChange = (value: number | undefined) => {};
  onTouched = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parsedValue = parseFloat(target.value) || undefined;
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
