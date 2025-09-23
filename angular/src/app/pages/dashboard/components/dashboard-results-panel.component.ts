import { Component, Input, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculationService } from '../../../core/services/calculation.service';
import type { CalculationInputs, CalculationResults, Thresholds } from '../../../domain/types/calculation.types';
import { SettingsService, type Region } from '../../../services/settings.service';
import { DEFAULT_REGION_CONFIGS } from '../../../core/tokens/region-configs.token';

/**
 * DashboardResultsPanelComponent
 * React source parity: react-app-reference/src/components/Dashboard/Dashboard.tsx
 * Purpose: Visual results panel (KPIs, Income Summary, Expense Breakdown).
 * Notes:
 *  - Accepts an optional results input; if omitted, computes a lightweight
 *    demo result using current SettingsService region and default thresholds
 *    so the panel renders during early wiring.
 */
import { KPIStoplightsComponent } from './kpi-stoplights.component';
import { IncomeSummaryCardComponent } from './income-summary-card.component';
import { ExpenseBreakdownCardComponent } from './expense-breakdown-card.component';
import { ProTipsCardComponent } from './pro-tips-card.component';

@Component({
  selector: 'app-dashboard-results-panel',
  standalone: true,
  imports: [CommonModule, KPIStoplightsComponent, IncomeSummaryCardComponent, ExpenseBreakdownCardComponent, ProTipsCardComponent],
  templateUrl: './dashboard-results-panel.component.html',
  styleUrls: ['./dashboard-results-panel.component.scss']
})
export class DashboardResultsPanelComponent {
  @Input() results: CalculationResults | null = null;
  @Input() hasOtherIncome: boolean = false;

  private readonly region = signal<Region>(this.settings.settings.region);
  private readonly thresholds = computed<Thresholds>(() => {
    const cfg = DEFAULT_REGION_CONFIGS[this.region()];
    return cfg.thresholds;
  });

  readonly viewResults = signal<CalculationResults | null>(null);

  constructor(private readonly calc: CalculationService, private readonly settings: SettingsService) {
    effect(() => {
      // When explicit results provided, use them; otherwise compute a minimal demo
      if (this.results) {
        this.viewResults.set(this.results);
        return;
      }
      const r = this.region();
      const t = this.thresholds();
      const demo: CalculationInputs = {
        region: r,
        scenario: 'Custom',
        avgNetFee: 125,
        taxPrepReturns: 1600,
        taxRushReturns: r === 'CA' ? 150 : 0,
        discountsPct: 3,
        otherIncome: this.hasOtherIncome ? 0 : 0,
        calculatedTotalExpenses: undefined,
        // Percent vs. fixed fields — demo values chosen to match reference screenshots
        salariesPct: 25,
        empDeductionsPct: 10,
        rentPct: 18,
        telephoneAmt: 0.5,
        utilitiesAmt: 1.2,
        localAdvAmt: 2.0,
        insuranceAmt: 0.6,
        postageAmt: 0.4,
        suppliesPct: 3.5,
        duesAmt: 0.8,
        bankFeesAmt: 0.4,
        maintenanceAmt: 0.6,
        travelEntAmt: 0.8,
        royaltiesPct: 14,
        advRoyaltiesPct: 5,
        taxRushRoyaltiesPct: r === 'CA' ? 6 : 0,
        miscPct: 1.0,
        thresholds: t
      };
      const computedResults = this.calc.calculate(demo);
      this.viewResults.set(computedResults);
    });

    // React to runtime region changes
    this.settings.settings$.subscribe(s => this.region.set(s.region));
  }

  // Formatting helpers (match React helpers)
  currency(n: number): string {
    if (typeof n !== 'number' || isNaN(n)) return '$0.00';
    return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  }

  pct(n: number): string {
    if (typeof n !== 'number' || isNaN(n)) return '0.0%';
    return n.toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%';
  }
}


