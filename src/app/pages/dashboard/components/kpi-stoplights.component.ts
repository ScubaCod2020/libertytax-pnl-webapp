import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { CalculationResults, Thresholds } from '../../../domain/types/calculation.types';
import { statusForCPR, statusForMargin, statusForNetIncome } from '../../../domain/calculations/kpi';

/**
 * KPIStoplightsComponent
 * React parity: 3 stacked KPI cards with stoplight status.
 */
@Component({
  selector: 'app-kpi-stoplights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-stoplights.component.html',
  styleUrls: ['./kpi-stoplights.component.scss']
})
export class KPIStoplightsComponent {
  @Input() results!: CalculationResults;
  @Input() thresholds!: Thresholds;

  get netIncomeStatus() {
    return statusForNetIncome(this.results.netIncome, this.thresholds);
  }
  get marginStatus() {
    return statusForMargin(this.results.netMarginPct, this.thresholds);
  }
  get cprStatus() {
    return statusForCPR(this.results.costPerReturn, this.thresholds);
  }
}


