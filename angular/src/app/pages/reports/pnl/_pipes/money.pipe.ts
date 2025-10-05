import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'money', standalone: true, pure: true })
export class MoneyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, digits: number = 2): string {
    const n = typeof value === 'string' ? Number(value) : Number(value ?? 0);
    const safe = Number.isFinite(n) ? n : 0;
    return (
      '$' +
      safe.toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    );
  }
}
