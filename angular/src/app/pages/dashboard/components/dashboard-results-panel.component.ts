import { Component, Input, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculationService } from '../../../core/services/calculation.service';
import type {
  CalculationInputs,
  CalculationResults,
  Thresholds,
} from '../../../domain/types/calculation.types';
import { SettingsService, type Region } from '../../../services/settings.service';
import { DEFAULT_REGION_CONFIGS } from '../../../core/tokens/region-configs.token';
import { WizardStateService } from '../../../core/services/wizard-state.service';
import { debounceTime } from 'rxjs/operators';

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
  imports: [
    CommonModule,
    KPIStoplightsComponent,
    IncomeSummaryCardComponent,
    ExpenseBreakdownCardComponent,
    ProTipsCardComponent,
  ],
  templateUrl: './dashboard-results-panel.component.html',
  styleUrls: ['./dashboard-results-panel.component.scss'],
})
export class DashboardResultsPanelComponent {
  @Input() results: CalculationResults | null = null;
  @Input() hasOtherIncome: boolean = false;

  private readonly region = signal<Region>('US'); // Will be updated from wizard state
  readonly thresholds = computed<Thresholds>(() => {
    const cfg = DEFAULT_REGION_CONFIGS[this.region()];
    return cfg.thresholds;
  });

  readonly viewResults = signal<CalculationResults | null>(null);

  constructor(
    private readonly calc: CalculationService,
    private readonly settings: SettingsService,
    private readonly wizardState: WizardStateService
  ) {
    // PERFORMANCE FIX: Replace effect() with debounced observable to prevent excessive calculations
    this.wizardState.answers$
      .pipe(debounceTime(200)) // Wait 200ms before recalculating
      .subscribe((answers) => {
        // Update region from wizard state
        const wizardRegion = (answers.region || 'US') as Region;
        this.region.set(wizardRegion);

        // When explicit results provided, use them; otherwise compute a minimal demo
        if (this.results) {
          this.viewResults.set(this.results);
          return;
        }
        const r = this.region();
        const t = this.thresholds();

        // Use real wizard data with computed properties
        const realInputs: CalculationInputs = {
          region: r,
          scenario: 'Custom',
          avgNetFee: this.wizardState.getAvgNetFee() || 125,
          taxPrepReturns: this.wizardState.getTaxPrepReturns() || 1600,
          taxRushReturns:
            this.wizardState.getTaxRushReturns() ||
            (answers.handlesTaxRush && r === 'CA' ? 150 : 0),
          discountsPct: this.wizardState.getDiscountsPct() || 3,
          otherIncome: this.wizardState.getOtherIncome() || (answers.hasOtherIncome ? 5000 : 0),
          calculatedTotalExpenses: answers.calculatedTotalExpenses,
          salariesPct: answers.payrollPct || 25,
          empDeductionsPct: answers.empDeductionsPct || 10,
          rentPct: answers.rentPct || 18,
          telephoneAmt: answers.telephoneAmt || 0.5,
          utilitiesAmt: answers.utilitiesAmt || 1.2,
          localAdvAmt: answers.localAdvAmt || 2.0,
          insuranceAmt: answers.insuranceAmt || 0.6,
          postageAmt: answers.postageAmt || 0.4,
          suppliesPct: answers.suppliesPct || 3.5,
          duesAmt: answers.duesAmt || 0.8,
          bankFeesAmt: answers.bankFeesAmt || 0.4,
          maintenanceAmt: answers.maintenanceAmt || 0.6,
          travelEntAmt: answers.travelEntAmt || 0.8,
          royaltiesPct: answers.royaltiesPct || 14,
          advRoyaltiesPct: answers.advRoyaltiesPct || 5,
          taxRushRoyaltiesPct:
            answers.taxRushRoyaltiesPct || (answers.handlesTaxRush && r === 'CA' ? 6 : 0),
          miscPct: answers.miscPct || 1.0,
          thresholds: t,
        };
        const computedResults = this.calc.calculate(realInputs);
        this.viewResults.set(computedResults);
      });

    // React to runtime region changes
    this.settings.settings$.subscribe((s) => this.region.set(s.region));
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
