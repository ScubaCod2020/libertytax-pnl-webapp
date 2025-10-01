import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appPercentageInput]',
  standalone: true,
})
export class PercentageInputDirective implements OnInit {
  @Input() maxPercent = 100;
  @Input() allowNegative = false;
  @Input() decimalPlaces = 1;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit() {
    // Set initial attributes for percentage inputs
    this.el.nativeElement.step = this.decimalPlaces === 0 ? '1' : '0.1';
    if (!this.allowNegative) {
      this.el.nativeElement.min = '0';
    }
    this.el.nativeElement.max = this.maxPercent.toString();
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

    // Limit decimal places
    if (parts[1] && parts[1].length > this.decimalPlaces) {
      value = parts[0] + '.' + parts[1].substring(0, this.decimalPlaces);
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
      // Ensure within bounds
      if (!this.allowNegative && value < 0) {
        value = 0;
      }
      if (value > this.maxPercent) {
        value = this.maxPercent;
      }

      // Format with appropriate decimal places (remove trailing zeros)
      input.value = this.formatPercentage(value);
    }
  }

  private formatPercentage(value: number): string {
    // Format with specified decimal places, but remove trailing zeros
    const formatted = value.toFixed(this.decimalPlaces);
    return parseFloat(formatted).toString();
  }
}
