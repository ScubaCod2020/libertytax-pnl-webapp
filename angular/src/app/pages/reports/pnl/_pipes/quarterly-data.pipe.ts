import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'quarterlyData', standalone: true, pure: true })
export class QuarterlyDataPipe implements PipeTransform {
  transform<T>(monthly: T[] | null | undefined): T[][] {
    const src = Array.isArray(monthly) ? monthly : [];
    const out: T[][] = [];
    for (let i = 0; i < src.length; i += 3) out.push(src.slice(i, i + 3));
    return out;
  }
}
