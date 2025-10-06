import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * MonthlyForecastCardComponent
 * Roadmap scaffold — shows a 12‑month target breakdown based on organizational shares.
 * Inputs (future): shares: number[12], annualTotals, region.
 */
@Component({
  selector: 'app-monthly-forecast-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-forecast-card.component.html',
  styleUrls: ['./monthly-forecast-card.component.scss'],
})
export class MonthlyForecastCardComponent {
  @Input() shares: number[] = [10, 18, 28, 40, 52, 60, 66, 72, 78, 84, 92, 100].map((v) => v / 100);
  @Input() annualRevenue = 194000; // placeholder demo
  @Input() annualExpenses = 150932; // placeholder demo
}
