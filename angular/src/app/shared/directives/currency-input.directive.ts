import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appCurrencyInput]',
  standalone: true,
})
export class CurrencyInputDirective implements OnInit {
  @Input() allowNegative = false;
  @Input() maxValue?: number;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit() {
    // Set initial attributes for currency inputs
    this.el.nativeElement.step = '0.01';
    if (!this.allowNegative) {
      this.el.nativeElement.min = '0';
    }
    if (this.maxValue) {
      this.el.nativeElement.max = this.maxValue.toString();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove any non-numeric characters except decimal point and minus (if allowed)
    const regex = this.allowNegative ? /[^0-9.-]/g : /[^0-9.]/g;
    value = value.replace(regex, '');

    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Handle negative sign (only at the beginning if allowed)
    if (this.allowNegative && value.includes('-')) {
      const minusCount = (value.match(/-/g) || []).length;
      if (minusCount > 1 || (value.indexOf('-') !== 0 && value.includes('-'))) {
        value = value.replace(/-/g, '');
        if (value.charAt(0) !== '-') {
          value = '-' + value;
        }
      }
    }

    input.value = value;
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    let value = parseFloat(input.value);

    if (!isNaN(value)) {
      // Format with 2 decimal places and commas
      input.value = this.formatCurrency(value);
    }
  }

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    // Remove formatting for editing (keep raw number)
    const numericValue = this.parseFormattedCurrency(input.value);
    if (!isNaN(numericValue)) {
      input.value = numericValue.toString();
    }
  }

  private formatCurrency(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private parseFormattedCurrency(value: string): number {
    // Remove commas and parse
    return parseFloat(value.replace(/,/g, ''));
  }
}
