import { Component, Input } from '@angular/core';

export interface PriorYearMetrics {
  avgNetFee?: number;
  taxPrepReturns?: number;
  taxRushReturns?: number;
  taxRushPercentage?: number;
  taxRushFee?: number;
  grossTaxPrepFees?: number;
  discountsPct?: number;
  discountsAmt?: number;
  netTaxPrepIncome?: number;
  otherIncome?: number;
  taxRushIncome?: number;
  totalRevenue?: number;
}

@Component({
  selector: 'app-prior-year-performance',
  standalone: true,
  template: `
    <section class="prior-year-performance" *ngIf="metrics">
      <h3 class="text-base font-semibold">Prior Year Summary</h3>
      <ul class="text-sm">
        <li *ngIf="metrics.avgNetFee !== undefined">Avg Net Fee: {{ metrics.avgNetFee | number:'1.0-0' }}</li>
        <li *ngIf="metrics.taxPrepReturns !== undefined">Returns: {{ metrics.taxPrepReturns | number }}</li>
        <li *ngIf="metrics.totalRevenue !== undefined">Total Revenue: {{ metrics.totalRevenue | number:'1.0-0' }}</li>
      </ul>
    </section>
  `,
  styles: [`
    .prior-year-performance {
      padding: 0.75rem 1rem;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 0.5rem;
      background: #f8fafc;
    }
  `]
})
export class PriorYearPerformanceComponent {
  @Input() metrics?: PriorYearMetrics;
}
