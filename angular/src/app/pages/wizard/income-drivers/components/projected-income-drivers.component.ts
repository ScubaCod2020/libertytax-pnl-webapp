import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppConfigService } from '../../../../services/app-config.service';
import { SettingsService } from '../../../../services/settings.service';
import { ProjectedService, Scenario } from '../../../../services/projected.service';
import { AnalysisBlockComponent } from '../../../../components/analysis-block/analysis-block.component';
import { FEATURE_FLAGS } from '../../../../core/tokens/feature-flags.token';
import { inject } from '@angular/core';
import { AnalysisDataAssemblerService } from '../../../../domain/services/analysis-data-assembler.service';
import { WizardStateService } from '../../../../core/services/wizard-state.service';
import { map, combineLatest } from 'rxjs/operators';
import { combineLatest as combineLatestStatic, Observable } from 'rxjs';
import { pairwise, startWith } from 'rxjs/operators';
import { CurrencyInputDirective, PercentageInputDirective } from '../../../../shared/directives';
import { KpiEvaluatorService } from '../../../../domain/services/kpi-evaluator.service';
import { SharedExpenseTextService } from '../../../../shared/expenses/expense-text.service';
import { ExpensesService } from '../../../../shared/expenses/expenses.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-projected-income-drivers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AnalysisBlockComponent,
    CurrencyInputDirective,
    PercentageInputDirective,
  ],
  templateUrl: './projected-income-drivers.component.html',
  styleUrls: ['./projected-income-drivers.component.scss'],
})
export class ProjectedIncomeDriversComponent {
  constructor(
    public appCfg: AppConfigService,
    public settings: SettingsService,
    public projSvc: ProjectedService,
    public wizardState: WizardStateService,
    private readonly evaluator: KpiEvaluatorService,
    public readonly expenseText: SharedExpenseTextService,
    public readonly expenses: ExpensesService
  ) {}

  scenarios: Scenario[] = ['Custom', 'Good', 'Better', 'Best'];

  // Track custom mode selection independently
  isCustomSelected = false;

  // Helper methods for the new radio button UI
  selectCustomRadio(): void {
    // Auto-select custom radio when user focuses on custom input
    const customRadio = document.getElementById('custom') as HTMLInputElement;
    if (customRadio) {
      customRadio.checked = true;
    }
  }

  selectCustomMode(): void {
    console.log('📊 [Projected] Custom mode selected');
    this.isCustomSelected = true;
    // Don't change the growth percentage, just show the custom controls
  }

  selectPreset(percentage: number): void {
    console.log('📊 [Projected] Preset selected:', `${percentage}%`);
    this.isCustomSelected = false;
    this.projSvc.setGrowthPct(percentage);
  }

  getScenarioForDropdown(): string {
    const pct = this.projSvc.growthPct;
    console.log('📊 [Projected] Getting dropdown scenario for:', `${pct}%`);
    if (pct === -10) return 'decline-10';
    if (pct === -5) return 'decline-5';
    if (pct === 0) return 'no-change';
    if (pct === 5) return 'growth-5';
    if (pct === 10) return 'growth-10';
    if (pct === 15) return 'growth-15';
    if (pct === 20) return 'growth-20';
    return 'custom';
  }

  onDropdownScenarioChange(scenario: string): void {
    console.log('📊 [Projected] Dropdown scenario changed to:', scenario);
    switch (scenario) {
      case 'decline-10':
        this.projSvc.setGrowthPct(-10);
        break;
      case 'decline-5':
        this.projSvc.setGrowthPct(-5);
        break;
      case 'no-change':
        this.projSvc.setGrowthPct(0);
        break;
      case 'growth-5':
        this.projSvc.setGrowthPct(5);
        break;
      case 'growth-10':
        this.projSvc.setGrowthPct(10);
        break;
      case 'growth-15':
        this.projSvc.setGrowthPct(15);
        break;
      case 'growth-20':
        this.projSvc.setGrowthPct(20);
        break;
      case 'custom':
        console.log(
          '📊 [Projected] Custom scenario selected, keeping current percentage:',
          `${this.projSvc.growthPct}%`
        );
        break;
    }
  }

  getCurrentScenarioName(): string {
    const pct = this.projSvc.growthPct;
    if (pct === 2) return 'Good';
    if (pct === 5) return 'Better';
    if (pct === 10) return 'Best';
    return 'Custom';
  }

  private readonly flags = inject(FEATURE_FLAGS);
  private readonly assembler = inject(AnalysisDataAssemblerService);

  // Reactive getters for form fields
  readonly answers$ = this.wizardState.answers$;

  // Projected values calculated from PY + growth %
  readonly projectedTaxPrepReturns$ = combineLatestStatic([
    this.answers$,
    this.projSvc.growthPct$,
  ]).pipe(
    map(([answers, growthPct]) => {
      const pyReturns = answers.pyTaxPrepReturns || 0;
      return pyReturns > 0 ? Math.round(pyReturns * (1 + growthPct / 100)) : null;
    })
  );

  readonly projectedAvgNetFee$ = combineLatestStatic([this.answers$, this.projSvc.growthPct$]).pipe(
    map(([answers, growthPct]) => {
      const pyAvgNetFee = answers.pyAvgNetFee || 0;
      return pyAvgNetFee > 0 ? Math.round(pyAvgNetFee * (1 + growthPct / 100) * 100) / 100 : null;
    })
  );

  readonly projectedGrossFees$ = combineLatestStatic([
    this.projectedTaxPrepReturns$,
    this.projectedAvgNetFee$,
  ]).pipe(
    map(([returns, avgNetFee]) => {
      return (returns || 0) * (avgNetFee || 0);
    })
  );

  // Individual field getters for easier template binding
  readonly taxPrepReturns$ = this.answers$.pipe(
    map((a) => a.projectedTaxPrepReturns || a.taxPrepReturns || 0)
  );
  readonly avgNetFee$ = this.answers$.pipe(map((a) => a.avgNetFee || 0));

  // ANF KPI bindings
  readonly anfValue$ = this.answers$.pipe(map((a) => a.projectedAvgNetFee ?? a.avgNetFee ?? null));
  readonly anfStatus$ = this.answers$.pipe(map((a) => this.evaluator.getAnfStatus(a)));
  readonly anfTooltip$ = this.expenseText.anfTooltip$();
  readonly anfNote$ = this.expenseText.anfNote$();
  readonly recommendedAnf$ = this.answers$.pipe(
    map((a) => {
      const d = this.evaluator.getAnfDescriptor(a);
      return (d.green.min + d.green.max) / 2;
    })
  );

  recommendedAnfSnapshot(): number | null {
    let val: number | null = null;
    this.recommendedAnf$.pipe(take(1)).subscribe((v) => {
      val = v ? Math.round(v / 5) * 5 : null; // round to $5
    });
    return val;
  }

  updateAnf(value: number): void {
    // Update avgNetFee (new store) or projectedAvgNetFee (existing)
    if (this.wizardState.answers.storeType === 'existing') {
      this.wizardState.updateAnswers({ projectedAvgNetFee: value });
    } else {
      this.wizardState.updateAnswers({ avgNetFee: value });
    }
  }
  readonly grossFees$ = this.answers$.pipe(map((a) => a.projectedGrossFees || 0));
  readonly discountsAmt$ = this.answers$.pipe(map((a) => a.projectedDiscountsAmt || 0));
  readonly discountsDelta$: Observable<number> = this.discountsAmt$.pipe(
    pairwise(),
    map(([prev, curr]) => curr - prev),
    startWith(0)
  );
  readonly discountsPct$ = this.answers$.pipe(
    map((a) => {
      if (a.projectedDiscountsPct !== undefined && a.projectedDiscountsPct !== null) {
        return a.projectedDiscountsPct;
      }
      // Fall back to regional default
      const region = a.region || 'US';
      return region === 'CA' ? 3.0 : 1.0;
    })
  );

  // Format percentage to show only necessary decimal places (e.g., 1.5, 2, 3.2)
  readonly discountsPctFormatted$ = this.discountsPct$.pipe(
    map((pct) => {
      if (pct === undefined || pct === null) return '';
      if (pct === 0) return '0';
      // Show tenths only if needed (remove trailing zeros)
      return (Math.round(pct * 10) / 10).toString();
    })
  );
  readonly taxPrepIncome$ = this.answers$.pipe(map((a) => a.projectedTaxPrepIncome || 0));
  readonly taxPrepIncomeDelta$: Observable<number> = this.taxPrepIncome$.pipe(
    pairwise(),
    map(([prev, curr]) => curr - prev),
    startWith(0)
  );
  readonly otherIncome$ = this.answers$.pipe(map((a) => a.projectedOtherIncome || 0));
  readonly totalExpenses$ = this.answers$.pipe(map((a) => a.projectedExpenses || 0));
  readonly taxRushReturns$ = this.answers$.pipe(map((a) => a.projectedTaxRushReturns || null));
  readonly taxRushReturnsPct$ = this.answers$.pipe(
    map((a) => a.projectedTaxRushReturnsPct || 15.0)
  );
  readonly taxRushAvgNetFee$ = this.answers$.pipe(map((a) => a.projectedTaxRushAvgNetFee || null));
  readonly taxRushGrossFees$ = this.answers$.pipe(map((a) => a.projectedTaxRushGrossFees || null));

  // Conditional display
  readonly showTaxRush$ = this.answers$.pipe(
    map((a) => a.region === 'CA' && a.handlesTaxRush === true)
  );
  readonly showOtherIncome$ = this.answers$.pipe(map((a) => a.hasOtherIncome === true));

  // Regional discount default for placeholders
  readonly regionalDiscountDefault$ = this.answers$.pipe(
    map((a) => {
      const region = a.region || 'US';
      return region === 'CA' ? 3.0 : 1.0;
    })
  );

  // Computed values for display - PROJECTED CALCULATIONS
  readonly grossNetIncome$ = this.answers$.pipe(
    map((a) => {
      let grossNet = a.projectedTaxPrepIncome || 0;

      // Add other income if enabled
      if (a.hasOtherIncome && a.projectedOtherIncome) {
        grossNet += a.projectedOtherIncome;
      }

      // Add TaxRush gross fees if enabled for Canada
      if (a.region === 'CA' && a.handlesTaxRush && a.projectedTaxRushGrossFees) {
        grossNet += a.projectedTaxRushGrossFees;
      }

      return grossNet;
    })
  );

  readonly grossNetPerReturn$ = combineLatestStatic([
    this.grossNetIncome$,
    this.projectedTaxPrepReturns$,
  ]).pipe(
    map(([grossNet, returns]) => {
      return (returns || 0) > 0 ? grossNet / (returns || 1) : 0;
    })
  );

  readonly netIncome$ = this.answers$.pipe(
    map((a) => {
      const income = (a.projectedTaxPrepIncome || 0) + (a.projectedOtherIncome || 0);
      const expenses = a.projectedExpenses || 0;
      return income - expenses;
    })
  );

  readonly netMargin$ = this.answers$.pipe(
    map((a) => {
      const income = (a.projectedTaxPrepIncome || 0) + (a.projectedOtherIncome || 0);
      const expenses = a.projectedExpenses || 0;
      const netIncome = income - expenses;
      return income > 0 ? (netIncome / income) * 100 : 0;
    })
  );

  get showAnalysis(): boolean {
    return this.flags.showAnalysisBlock === true;
  }

  get analysisData() {
    return this.assembler.buildProjectedVsPresets();
  }

  // Form field update methods
  updateTaxPrepReturns(value: number): void {
    console.log('📊 [Projected] Tax Prep Returns changed to:', value);
    this.wizardState.updateAnswers({
      projectedTaxPrepReturns: value,
      taxPrepReturns: value, // Keep both for compatibility
    });
  }

  updateAvgNetFee(value: number): void {
    console.log('📊 [Projected] Average Net Fee changed to:', value);
    this.wizardState.updateAnswers({ avgNetFee: value });
  }

  updateDiscountsAmt(value: number): void {
    console.log('📊 [Projected] Discount Amount changed to:', value);
    this.wizardState.updateAnswers({
      projectedDiscountsAmt: value,
      manualProjectedDiscountsAmt: true,
    });
  }

  updateDiscountsPct(value: number): void {
    console.log('📊 [Projected] Discount Percentage changed to:', value);
    this.wizardState.updateAnswers({
      projectedDiscountsPct: value,
      manualProjectedDiscountsPct: true,
    });
  }

  updateOtherIncome(value: number): void {
    console.log('📊 [Projected] Other Income changed to:', value);
    this.wizardState.updateAnswers({ projectedOtherIncome: value });
  }

  updateTaxRushReturns(value: number): void {
    console.log('📊 [Projected] TaxRush Returns changed to:', value);
    this.wizardState.updateAnswers({
      projectedTaxRushReturns: value,
      manualProjectedTaxRushReturns: value,
    });
  }

  updateTaxRushReturnsPct(value: number): void {
    console.log('📊 [Projected] TaxRush Returns % changed to:', value);
    this.wizardState.updateAnswers({
      projectedTaxRushReturnsPct: value,
      manualProjectedTaxRushReturns: undefined,
    });
  }

  updateTaxRushAvgNetFee(value: number): void {
    console.log('📊 [Projected] TaxRush Avg Net Fee changed to:', value);
    this.wizardState.updateAnswers({ projectedTaxRushAvgNetFee: value });
  }

  // Reset method for projected goals with comprehensive debugging
  resetProjectedGoals(): void {
    console.log('🔄 [Projected] Reset Projected Goals called');
    console.log('🔄 [Projected] Current state before reset:', this.wizardState.answers);
    console.log('🔄 [Projected] Current growth percentage:', `${this.projSvc.growthPct}%`);
    console.log('🔄 [Projected] Current targets:', this.projSvc.targets);

    this.wizardState.updateAnswers({
      // Clear projected-specific fields
      projectedTaxPrepIncome: undefined,
      projectedDiscountsAmt: undefined,
      projectedDiscountsPct: undefined,
      projectedOtherIncome: undefined,
      projectedTaxRushReturns: undefined,
      projectedTaxRushAvgNetFee: undefined,
      projectedTaxRushGrossFees: undefined,
      projectedTaxRushReturnsPct: undefined,

      // Clear manual flags
      manualProjectedDiscountsAmt: undefined,
      manualProjectedDiscountsPct: undefined,
      manualProjectedTaxRushReturns: undefined,

      // Reload example data
      _isExampleData: true,
    });

    console.log('🔄 [Projected] Reset completed, new state will be calculated');
  }

  // Manual override for auto-calculated fields
  overrideGrossFees(value: number): void {
    console.log('📊 [Projected] Gross Fees manually overridden to:', value);
    this.wizardState.updateAnswers({
      projectedGrossFees: value,
      manualAvgNetFee: value, // Mark as manually overridden
    });
  }

  overrideTaxPrepIncome(value: number): void {
    console.log('📊 [Projected] Tax Prep Income manually overridden to:', value);
    this.wizardState.updateAnswers({
      projectedTaxPrepIncome: value,
      manualTaxPrepIncome: value, // Mark as manually overridden
    });
  }
}
