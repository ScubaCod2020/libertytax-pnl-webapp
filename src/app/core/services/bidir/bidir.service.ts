import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BiDirService {
  amountFromPct(base: number, pct: number): number {
    return base * (pct ?? 0);
  }
  pctFromAmount(base: number, amount: number): number {
    return base === 0 ? 0 : (amount ?? 0) / base;
  }
  resolveLastEdited(
    last: 'amount' | 'pct',
    base: number,
    amount?: number,
    pct?: number
  ): { amount: number; pct: number } {
    if (last === 'amount') {
      const a = amount ?? 0;
      return { amount: a, pct: this.pctFromAmount(base, a) };
    } else {
      const p = pct ?? 0;
      return { amount: this.amountFromPct(base, p), pct: p };
    }
  }
}
