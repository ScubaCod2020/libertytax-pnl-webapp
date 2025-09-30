import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DecimalPipe, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../services/settings.service';
import { WizardStateService } from '../../../../core/services/wizard-state.service';
import type { WizardAnswers } from '../../../../domain/types/wizard.types';
import { Observable, combineLatest, map } from 'rxjs';
import { KpiEvaluatorService } from '../../../../domain/services/kpi-evaluator.service';
import { ExpenseTextService } from '../../../../domain/services/expense-text.service';
import { ExpensesService } from '../../../../shared/expenses/expenses.service';
import { SharedExpenseTextService } from '../../../../shared/expenses/expense-text.service';
import type { ExpenseKey } from '../../../../shared/expenses/expenses.types';
import { DebugLogService } from '../../../../shared/debug/debug-log.service';

// Display config for structural template rows
interface ExpenseRowCfg {
  key: ExpenseKey;
  label: string;
  placeholderAmt?: number;
  placeholderPct?: number;
  slider?: { min: number; max: number; step: number };
}
import { EXPENSE_METADATA } from '../../../../domain/expenses/expense-metadata';

type KpiStatus = 'green' | 'yellow' | 'red';

@Component({
  selector: 'app-expenses-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe, AsyncPipe],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesFormComponent implements OnInit {
  constructor(
    public settingsSvc: SettingsService,
    public wizardState: WizardStateService,
    private readonly kpiEvaluator: KpiEvaluatorService,
    public expenseText: ExpenseTextService,
    public readonly expenses: ExpensesService,
    public readonly text: SharedExpenseTextService,
    private readonly debugLog: DebugLogService,
    private readonly router: Router
  ) {
    console.log('💰 [EXPENSES FORM] Component loaded');
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    console.log('💰 [EXPENSES FORM] Scrolled to top');

    console.log('💰 [EXPENSES FORM] Loading - triggering computed properties summary...');
    this.wizardState.getComputedPropertiesSummary();

    // Ensure first-load seeding without user having to click Reset
    if (!this.wizardState.answers.expensesSeeded) {
      console.log('💰 [EXPENSES FORM] First load seeding → strategic defaults');
      this.wizardState.resetExpenseDefaults(true);
    } else if (!this.hasUserExpenseOverrides()) {
      console.log('💰 [EXPENSES FORM] No user overrides detected; applying safe defaults');
      this.wizardState.resetExpenseDefaults();
    }
  }

  goReview(): void {
    this.router.navigateByUrl('/wizard/pnl');
  }

  hasUserExpenseOverrides(): boolean {
    const answers = this.wizardState.answers as any;
    return EXPENSE_METADATA.some((m) => answers[m.key] !== undefined);
  }

  getExpenseNote(key: string): string {
    return this.wizardState.answers.expenseNotes?.[key] ?? '';
  }

  updateExpenseNote(key: string, value: string): void {
    const existing = { ...(this.wizardState.answers.expenseNotes || {}) };
    existing[key] = value;
    this.wizardState.updateAnswers({ expenseNotes: existing });
  }

  get settings() {
    return this.settingsSvc.settings;
  }

  // Reactive getters for income values (read-only from Step 1)
  readonly answers$ = this.wizardState.answers$;
  readonly avgNetFee$ = this.answers$.pipe(map((a) => a.avgNetFee || 0));
  readonly taxPrepReturns$ = this.answers$.pipe(
    map((a) => a.projectedTaxPrepReturns || a.taxPrepReturns || 0)
  );
  readonly discountsPct$ = this.answers$.pipe(map((a) => a.discountsPct || 0));
  readonly grossRevenue$ = this.answers$.pipe(
    map((a) => {
      const base = a.projectedTaxPrepIncome || 0;
      const taxRush = a.region === 'CA' && a.handlesTaxRush ? a.projectedTaxRushGrossFees || 0 : 0;
      const other = a.hasOtherIncome ? a.projectedOtherIncome || 0 : 0;
      return base + taxRush + other;
    })
  );

  readonly taxPrepGrossFees$ = this.answers$.pipe(map(() => this.wizardState.getGrossFees()));

  readonly taxRushGrossFees$ = this.answers$.pipe(
    map(() =>
      this.wizardState.isCanadaRegion() && this.wizardState.hasTaxRush()
        ? this.wizardState.getTaxRushGrossFees()
        : 0
    )
  );

  readonly expenseStatuses$: Observable<Record<string, KpiStatus>> = this.answers$.pipe(
    map((answers): Record<string, KpiStatus> => this.kpiEvaluator.evaluate(answers))
  );

  readonly needsExpenseNotes$: Observable<boolean> = this.answers$.pipe(
    map((answers) => {
      const statuses = this.kpiEvaluator.evaluate(answers);
      return Object.values(statuses).some((status) => status === 'yellow' || status === 'red');
    })
  );

  readonly totalExpenses$ = this.answers$.pipe(
    map((a) => a.calculatedTotalExpenses ?? a.projectedExpenses ?? 0)
  );

  readonly totalExpensePct$ = combineLatest([this.totalExpenses$, this.grossRevenue$]).pipe(
    map(([expenses, revenue]) => (revenue > 0 ? (expenses / revenue) * 100 : 0))
  );

  readonly costPerReturn$ = this.answers$.pipe(
    map((a) => {
      const expenses = a.calculatedTotalExpenses ?? a.projectedExpenses ?? 0;
      const totalReturns = this.wizardState.getTaxPrepReturns() + (a.taxRushReturns || 0);
      return totalReturns > 0 ? expenses / totalReturns : 0;
    })
  );

  readonly netIncome$ = combineLatest([this.grossRevenue$, this.totalExpenses$]).pipe(
    map(([revenue, expenses]) => revenue - expenses)
  );

  readonly netPerReturn$ = combineLatest([this.netIncome$, this.answers$]).pipe(
    map(([netIncome, answers]) => {
      const totalReturns = this.wizardState.getTaxPrepReturns() + (answers.taxRushReturns || 0);
      return totalReturns > 0 ? netIncome / totalReturns : 0;
    })
  );

  readonly expenseStatus$ = this.totalExpensePct$.pipe(
    map((pct) => {
      if (pct >= 60 && pct <= 80) return 'green';
      if (pct >= 55 && pct <= 90) return 'yellow';
      return 'red';
    })
  );

  readonly rows: ExpenseRowCfg[] = [
    // Facility/Major
    {
      key: 'rent',
      label: 'Rent',
      placeholderAmt: 0,
      placeholderPct: 18,
      slider: { min: 0, max: 40, step: 0.5 },
    },
    {
      key: 'telephone',
      label: 'Telephone',
      placeholderAmt: 1000,
      placeholderPct: 0.5,
      slider: { min: 0, max: 5, step: 0.1 },
    },
    {
      key: 'utilities',
      label: 'Utilities',
      placeholderAmt: 2400,
      placeholderPct: 1.2,
      slider: { min: 0, max: 10, step: 0.1 },
    },
    // Operations
    {
      key: 'localAdv',
      label: 'Local Advertising',
      placeholderAmt: 4000,
      placeholderPct: 2,
      slider: { min: 0, max: 15, step: 0.1 },
    },
    {
      key: 'insurance',
      label: 'Insurance',
      placeholderAmt: 1200,
      placeholderPct: 0.6,
      slider: { min: 0, max: 5, step: 0.1 },
    },
    {
      key: 'postage',
      label: 'Postage',
      placeholderAmt: 800,
      placeholderPct: 0.4,
      slider: { min: 0, max: 3, step: 0.1 },
    },
    {
      key: 'supplies',
      label: 'Office Supplies',
      placeholderAmt: 7000,
      placeholderPct: 3.5,
      slider: { min: 0, max: 10, step: 0.1 },
    },
    {
      key: 'bankFees',
      label: 'Bank Fees',
      placeholderAmt: 1000,
      placeholderPct: 0.5,
      slider: { min: 0, max: 5, step: 0.1 },
    },
    {
      key: 'maintenance',
      label: 'Maintenance',
      placeholderAmt: 2400,
      placeholderPct: 1.2,
      slider: { min: 0, max: 8, step: 0.1 },
    },
    {
      key: 'travel',
      label: 'Travel',
      placeholderAmt: 1800,
      placeholderPct: 0.9,
      slider: { min: 0, max: 5, step: 0.1 },
    },
    // Misc
    {
      key: 'dues',
      label: 'Dues',
      placeholderAmt: 1600,
      placeholderPct: 0.8,
      slider: { min: 0, max: 5, step: 0.1 },
    },
    {
      key: 'misc',
      label: 'Miscellaneous',
      placeholderAmt: 5000,
      placeholderPct: 1.0,
      slider: { min: 0, max: 10, step: 0.1 },
    },
  ];

  trackKey = (_: number, r: ExpenseRowCfg) => r.key;

  onAmt(key: ExpenseKey, v: any): void {
    const value = v === '' || v === null || v === undefined ? null : +v;
    this.debugLog.push({ key, type: 'amount', next: value });
    this.expenses.updateAmount(key, value);
  }

  onPct(key: ExpenseKey, v: any): void {
    const value = v === '' || v === null || v === undefined ? null : +v;
    this.debugLog.push({ key, type: 'percent', next: value });
    this.expenses.updatePercent(key, value);
  }

  onNote(key: ExpenseKey, v: string): void {
    this.debugLog.push({ key, type: 'note', next: v });
    this.expenses.updateNote(key, v ?? '');
  }

  clampPercent(e: Event, key: ExpenseKey): void {
    const input = e.target as HTMLInputElement;
    if (!input) return;
    const v = parseFloat(input.value);
    if (!Number.isFinite(v)) return;
    const { min, max } = this.getSliderBounds(key);
    if (v < min) input.value = String(min);
    if (v > max) input.value = String(max);
  }

  private getSliderBounds(key: ExpenseKey): { min: number; max: number; step: number } {
    const row = this.rows.find((r) => r.key === key);
    const slider = row?.slider;
    return { min: slider?.min ?? 0, max: slider?.max ?? 10, step: slider?.step ?? 0.1 };
  }

  onResetToBaseline(key: ExpenseKey): void {
    const sub = this.expenses.baselineUSD$(key).subscribe((baseline) => {
      const base = this.kpiEvaluator.getExpensesRevenueTotal(this.wizardState.answers);
      if (!base || base <= 0) return;
      const pct = (baseline / base) * 100;
      this.expenses.updatePercent(key, Math.round(pct * 10) / 10);
      sub.unsubscribe();
    });
  }

  readonly payrollPct$ = this.answers$.pipe(map((a) => a.payrollPct ?? 35));
  readonly payrollAmount$ = this.answers$.pipe(map((a) => this.calculatePayrollAmount(a)));
  readonly empDeductionsPct$ = this.answers$.pipe(
    map((a) => a.empDeductionsPct ?? this.settings.empDeductionsPct ?? 10)
  );
  readonly empDeductionsAmount$ = this.answers$.pipe(
    map((a) => this.calculateEmpDeductionsAmount(a))
  );
  readonly rentPct$ = this.answers$.pipe(map((a) => a.rentPct ?? 18));
  readonly rentAmount$ = this.answers$.pipe(
    map((a) => this.calculateAmountFromPercent(a.rentPct ?? 18, a))
  );
  readonly telephoneAmt$ = this.answers$.pipe(map((a) => a.telephoneAmt ?? 0));
  readonly telephonePct$ = this.answers$.pipe(
    map((a) => this.calculatePercentFromAmount(a.telephoneAmt ?? 0, a, 0.5))
  );
  readonly utilitiesAmt$ = this.answers$.pipe(map((a) => a.utilitiesAmt ?? 0));
  readonly utilitiesPct$ = this.answers$.pipe(
    map((a) => this.calculatePercentFromAmount(a.utilitiesAmt ?? 0, a, 1.2))
  );
  readonly localAdvAmt$ = this.answers$.pipe(map((a) => a.localAdvAmt ?? 0));
  readonly localAdvPct$ = this.answers$.pipe(
    map((a) => this.calculatePercentFromAmount(a.localAdvAmt ?? 0, a, 2.0))
  );
  readonly insuranceAmt$ = this.answers$.pipe(map((a) => a.insuranceAmt ?? 0));
  readonly insurancePct$ = this.answers$.pipe(
    map((a) => this.calculatePercentFromAmount(a.insuranceAmt ?? 0, a, 0.6))
  );
  readonly postageAmt$ = this.answers$.pipe(map((a) => a.postageAmt ?? 0));
  readonly postagePct$ = this.answers$.pipe(
    map((a) => this.calculatePercentFromAmount(a.postageAmt ?? 0, a, 0.4))
  );
  readonly suppliesPct$ = this.answers$.pipe(map((a) => a.suppliesPct ?? 3.5));
  readonly suppliesAmount$ = this.answers$.pipe(
    map((a) => this.calculateAmountFromPercent(a.suppliesPct ?? 3.5, a))
  );
  readonly duesAmt$ = this.answers$.pipe(map((a) => a.duesAmt ?? 0));
  readonly duesPct$ = this.answers$.pipe(
    map((a) => this.calculatePercentFromAmount(a.duesAmt ?? 0, a, 0.8))
  );
  readonly bankFeesAmt$ = this.answers$.pipe(map((a) => a.bankFeesAmt ?? 0));
  readonly bankFeesPct$ = this.answers$.pipe(
    map((a) => this.calculatePercentFromAmount(a.bankFeesAmt ?? 0, a, 0.5))
  );
  readonly maintenanceAmt$ = this.answers$.pipe(map((a) => a.maintenanceAmt ?? 0));
  readonly maintenancePct$ = this.answers$.pipe(
    map((a) => this.calculatePercentFromAmount(a.maintenanceAmt ?? 0, a, 1.2))
  );
  readonly travelAmt$ = this.answers$.pipe(map((a) => a.travelEntAmt ?? 0));
  readonly travelPct$ = this.answers$.pipe(
    map((a) => this.calculatePercentFromAmount(a.travelEntAmt ?? 0, a, 0.9))
  );
  readonly royaltiesPct$ = this.answers$.pipe(map((a) => a.royaltiesPct ?? 14));
  readonly advRoyaltiesPct$ = this.answers$.pipe(map((a) => a.advRoyaltiesPct ?? 5));
  readonly taxRushRoyaltiesPct$ = this.answers$.pipe(
    map((a) => a.taxRushRoyaltiesPct ?? (a.region === 'CA' ? 6 : 0))
  );
  readonly miscPct$ = this.answers$.pipe(map((a) => a.miscPct ?? 1));
  readonly miscAmount$ = this.answers$.pipe(
    map((a) => this.calculateAmountFromPercent(a.miscPct ?? 1, a))
  );
  readonly taxPrepRoyaltiesAmount$ = combineLatest([
    this.taxPrepGrossFees$,
    this.royaltiesPct$,
  ]).pipe(map(([grossFees, pct]) => Math.round((grossFees || 0) * ((pct || 0) / 100))));
  readonly advRoyaltiesAmount$ = combineLatest([
    this.taxPrepGrossFees$,
    this.advRoyaltiesPct$,
  ]).pipe(map(([grossFees, pct]) => Math.round((grossFees || 0) * ((pct || 0) / 100))));
  readonly taxRushRoyaltiesAmount$ = combineLatest([
    this.taxRushGrossFees$,
    this.taxRushRoyaltiesPct$,
  ]).pipe(map(([grossFees, pct]) => Math.round((grossFees || 0) * ((pct || 0) / 100))));

  // Revenue breakdown for the yellow panel (uses clean computed properties)
  readonly revenueBreakdown$ = this.answers$.pipe(
    map((answers) => {
      const storeType = answers.storeType || 'new';
      const isExisting = storeType === 'existing';

      console.log('💰 [EXPENSES] Revenue breakdown calculation:', { storeType, isExisting });

      const avgNetFee = this.wizardState.getAvgNetFee();
      const grossFees = this.wizardState.getGrossFees();
      const discountPct = this.wizardState.getDiscountsPct();
      const discountAmt = this.wizardState.getDiscountsAmt();
      const taxPrepIncome = this.wizardState.getTaxPrepIncome();
      const handlesTaxRush = answers.region === 'CA' && answers.handlesTaxRush === true;
      const taxPrepReturns = this.wizardState.getTaxPrepReturns();
      const taxRushReturns = handlesTaxRush ? this.wizardState.getTaxRushReturns() : 0;
      const taxRushReturnsPct = handlesTaxRush ? (answers.taxRushReturnsPct ?? 0) : 0;
      const taxRushAvgFee = handlesTaxRush ? (answers.taxRushAvgNetFee ?? avgNetFee) : 0;
      const taxRushGrossFees = handlesTaxRush ? this.wizardState.getTaxRushGrossFees() : 0;
      const otherIncome = this.wizardState.getOtherIncome();

      const totalReturns = taxPrepReturns + taxRushReturns;
      const totalRevenue = taxPrepIncome + taxRushGrossFees + otherIncome;

      const result = {
        title: this.wizardState.getDisplayLabel('revenueBreakdownTitle'),
        taxPrepReturns,
        avgNetFee,
        grossFees,
        discountPct,
        discountAmt,
        taxPrepIncome,
        handlesTaxRush,
        taxRushReturns,
        taxRushReturnsPct,
        taxRushAvgFee,
        taxRushGrossFees,
        otherIncome,
        totalReturns,
        totalRevenue,
        description: this.wizardState.getValue({
          existingStore:
            'This is your projected gross revenue before expenses based on your historical data and growth targets.',
          newStore:
            'This is your target gross revenue before expenses based on regional benchmarks and your goals.',
          default: 'Revenue breakdown before expenses.',
        }),
      };

      console.log('💰 [EXPENSES] Revenue breakdown result:', result);
      return result;
    })
  );

  // Update methods for expense fields
  updatePayrollPct(value: number): void {
    const numeric = Number(value) || 0;
    console.log('💼 [EXPENSES] Payroll % changed to:', numeric);
    this.wizardState.updateAnswers({ payrollPct: numeric });
  }

  updatePayrollAmount(value: number): void {
    const numericValue = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const pct = grossRevenue > 0 ? (numericValue / grossRevenue) * 100 : 0;
    console.log('💼 [EXPENSES] Payroll $ changed to:', numericValue, '→', pct, '%');
    this.wizardState.updateAnswers({ payrollPct: pct });
  }

  updateEmpDeductionsPct(value: number): void {
    const numeric = Number(value) || 0;
    console.log('👥 [EXPENSES] Employee Deductions % changed to:', numeric);
    this.wizardState.updateAnswers({ empDeductionsPct: numeric });
  }

  updateEmpDeductionsAmount(value: number): void {
    const numericValue = Number(value) || 0;
    const payrollAmount = this.calculatePayrollAmount(this.wizardState.answers);
    const pct = payrollAmount > 0 ? (numericValue / payrollAmount) * 100 : 0;
    console.log('👥 [EXPENSES] Employee Deductions $ changed to:', numericValue, '→', pct, '%');
    this.wizardState.updateAnswers({ empDeductionsPct: pct });
  }

  updateRentPct(value: number): void {
    const numeric = Number(value) || 0;
    console.log('🏢 [EXPENSES] Rent % changed to:', numeric);
    this.wizardState.updateAnswers({ rentPct: numeric });
  }

  updateRentAmount(value: number): void {
    const numericValue = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const pct = grossRevenue > 0 ? (numericValue / grossRevenue) * 100 : 0;
    console.log('🏢 [EXPENSES] Rent $ changed to:', numericValue, '→', pct, '%');
    this.wizardState.updateAnswers({ rentPct: pct });
  }

  updateTelephoneAmt(value: number): void {
    const numeric = Number(value) || 0;
    console.log('📞 [EXPENSES] Telephone amount changed to:', numeric);
    this.updateLineAmount('telephone', numeric);
  }

  updateTelephonePct(value: number): void {
    const numeric = Number(value) || 0;
    console.log('📞 [EXPENSES] Telephone % changed to:', numeric);
    this.updateLinePercent('telephone', numeric);
  }

  updateUtilitiesAmt(value: number): void {
    const numeric = Number(value) || 0;
    console.log('💡 [EXPENSES] Utilities amount changed to:', numeric);
    this.wizardState.updateAnswers({ utilitiesAmt: numeric });
  }

  updateUtilitiesPct(value: number): void {
    const numeric = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const amount = grossRevenue > 0 ? (numeric / 100) * grossRevenue : 0;
    console.log('💡 [EXPENSES] Utilities % changed to:', numeric, '→', amount);
    this.wizardState.updateAnswers({ utilitiesAmt: amount });
  }

  updateLocalAdvAmt(value: number): void {
    const numeric = Number(value) || 0;
    console.log('📢 [EXPENSES] Local Advertising amount changed to:', numeric);
    this.wizardState.updateAnswers({ localAdvAmt: numeric });
  }

  updateLocalAdvPct(value: number): void {
    const numeric = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const amount = grossRevenue > 0 ? (numeric / 100) * grossRevenue : 0;
    console.log('📢 [EXPENSES] Local Advertising % changed to:', numeric, '→', amount);
    this.wizardState.updateAnswers({ localAdvAmt: amount });
  }

  updateInsuranceAmt(value: number): void {
    const numeric = Number(value) || 0;
    console.log('🛡️ [EXPENSES] Insurance amount changed to:', numeric);
    this.wizardState.updateAnswers({ insuranceAmt: numeric });
  }

  updateInsurancePct(value: number): void {
    const numeric = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const amount = grossRevenue > 0 ? (numeric / 100) * grossRevenue : 0;
    console.log('🛡️ [EXPENSES] Insurance % changed to:', numeric, '→', amount);
    this.wizardState.updateAnswers({ insuranceAmt: amount });
  }

  updatePostageAmt(value: number): void {
    const numeric = Number(value) || 0;
    console.log('📮 [EXPENSES] Postage amount changed to:', numeric);
    this.wizardState.updateAnswers({ postageAmt: numeric });
  }

  updatePostagePct(value: number): void {
    const numeric = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const amount = grossRevenue > 0 ? (numeric / 100) * grossRevenue : 0;
    console.log('📮 [EXPENSES] Postage % changed to:', numeric, '→', amount);
    this.wizardState.updateAnswers({ postageAmt: amount });
  }

  updateSuppliesPct(value: number): void {
    const numeric = Number(value) || 0;
    console.log('📦 [EXPENSES] Supplies % changed to:', numeric);
    this.wizardState.updateAnswers({ suppliesPct: numeric });
  }

  updateSuppliesAmount(value: number): void {
    const numeric = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const pct = grossRevenue > 0 ? (numeric / grossRevenue) * 100 : 0;
    console.log('📦 [EXPENSES] Supplies $ changed to:', numeric, '→', pct, '%');
    this.wizardState.updateAnswers({ suppliesPct: pct });
  }

  updateDuesAmt(value: number): void {
    const numeric = Number(value) || 0;
    console.log('📘 [EXPENSES] Dues amount changed to:', numeric);
    this.wizardState.updateAnswers({ duesAmt: numeric });
  }

  updateDuesPct(value: number): void {
    const numeric = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const amount = grossRevenue > 0 ? (numeric / 100) * grossRevenue : 0;
    console.log('📘 [EXPENSES] Dues % changed to:', numeric, '→', amount);
    this.wizardState.updateAnswers({ duesAmt: amount });
  }

  updateBankFeesAmt(value: number): void {
    const numeric = Number(value) || 0;
    console.log('🏦 [EXPENSES] Bank fees amount changed to:', numeric);
    this.wizardState.updateAnswers({ bankFeesAmt: numeric });
  }

  updateBankFeesPct(value: number): void {
    const numeric = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const amount = grossRevenue > 0 ? (numeric / 100) * grossRevenue : 0;
    console.log('🏦 [EXPENSES] Bank fees % changed to:', numeric, '→', amount);
    this.wizardState.updateAnswers({ bankFeesAmt: amount });
  }

  updateMaintenanceAmt(value: number): void {
    const numeric = Number(value) || 0;
    console.log('🛠️ [EXPENSES] Maintenance amount changed to:', numeric);
    this.wizardState.updateAnswers({ maintenanceAmt: numeric });
  }

  updateMaintenancePct(value: number): void {
    const numeric = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const amount = grossRevenue > 0 ? (numeric / 100) * grossRevenue : 0;
    console.log('🛠️ [EXPENSES] Maintenance % changed to:', numeric, '→', amount);
    this.wizardState.updateAnswers({ maintenanceAmt: amount });
  }

  updateTravelAmt(value: number): void {
    const numeric = Number(value) || 0;
    console.log('🧳 [EXPENSES] Travel amount changed to:', numeric);
    this.wizardState.updateAnswers({ travelEntAmt: numeric });
  }

  updateTravelPct(value: number): void {
    const numeric = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const amount = grossRevenue > 0 ? (numeric / 100) * grossRevenue : 0;
    console.log('🧳 [EXPENSES] Travel % changed to:', numeric, '→', amount);
    this.wizardState.updateAnswers({ travelEntAmt: amount });
  }

  updateMiscPct(value: number): void {
    const numeric = Number(value) || 0;
    console.log('🔧 [EXPENSES] Miscellaneous % changed to:', numeric);
    this.wizardState.updateAnswers({ miscPct: numeric });
  }

  updateMiscAmount(value: number): void {
    const numeric = Number(value) || 0;
    const grossRevenue = this.getGrossRevenue(this.wizardState.answers);
    const pct = grossRevenue > 0 ? (numeric / grossRevenue) * 100 : 0;
    console.log('🔧 [EXPENSES] Miscellaneous $ changed to:', numeric, '→', pct, '%');
    this.wizardState.updateAnswers({ miscPct: pct });
  }

  // Reset expenses to defaults
  resetExpensesToDefaults(): void {
    console.log('🔄 [EXPENSES] Reset to defaults button clicked');
    this.wizardState.resetExpenseDefaults(true);
  }

  private getGrossRevenue(answers: WizardAnswers): number {
    const base = answers.projectedTaxPrepIncome ?? 0;
    const taxRush =
      answers.region === 'CA' && answers.handlesTaxRush
        ? answers.projectedTaxRushGrossFees || 0
        : 0;
    const other = answers.hasOtherIncome ? answers.projectedOtherIncome || 0 : 0;
    return base + taxRush + other;
  }

  private updateLineAmount(lineId: string, amount: number): void {
    const meta = EXPENSE_METADATA.find((m) => m.id === lineId);
    if (!meta) return;
    const updates: any = {};
    if (meta.key.endsWith('Amt')) {
      updates[meta.key] = amount;
    } else if (meta.key.endsWith('Pct')) {
      const base = this.getConversionBase(meta, this.wizardState.answers);
      const pct = base > 0 ? (amount / base) * 100 : 0;
      updates[meta.key] = pct;
    }
    this.wizardState.updateAnswers(updates);
  }

  private updateLinePercent(lineId: string, pct: number): void {
    const meta = EXPENSE_METADATA.find((m) => m.id === lineId);
    if (!meta) return;
    const updates: any = {};
    if (meta.key.endsWith('Pct')) {
      updates[meta.key] = pct;
    } else if (meta.key.endsWith('Amt')) {
      const base = this.getConversionBase(meta, this.wizardState.answers);
      const amount = base > 0 ? (pct / 100) * base : 0;
      updates[meta.key] = amount;
    }
    this.wizardState.updateAnswers(updates);
  }

  private getConversionBase(
    meta: { calculationBase: 'gross' | 'salaries' | 'none' },
    answers: WizardAnswers
  ): number {
    if (meta.calculationBase === 'gross') {
      return this.getGrossRevenue(answers);
    }
    if (meta.calculationBase === 'salaries') {
      const gross = this.getGrossRevenue(answers);
      const payrollPct = answers.payrollPct || 0;
      return (gross * payrollPct) / 100;
    }
    return 0;
  }

  private calculatePayrollAmount(answers: WizardAnswers): number {
    const grossRevenue = this.getGrossRevenue(answers);
    const pct = answers.payrollPct ?? 0;
    return Math.round((grossRevenue * pct) / 100);
  }

  private calculateEmpDeductionsAmount(answers: WizardAnswers): number {
    const payrollAmount = this.calculatePayrollAmount(answers);
    const pct = answers.empDeductionsPct ?? 0;
    return Math.round((payrollAmount * pct) / 100);
  }

  private calculateAmountFromPercent(pct: number, answers: WizardAnswers): number {
    const grossRevenue = this.getGrossRevenue(answers);
    return Math.round((grossRevenue * pct) / 100);
  }

  private calculatePercentFromAmount(
    amount: number,
    answers: WizardAnswers,
    target: number
  ): number {
    const grossRevenue = this.getGrossRevenue(answers);
    if (grossRevenue <= 0) {
      return target;
    }
    return Math.round((amount / grossRevenue) * 100 * 10) / 10;
  }

  // KPI evaluation moved to KpiEvaluatorService

  private evaluatePercent(actual: number, target: number): KpiStatus {
    const diff = Math.abs(actual - target);
    const greenTolerance = Math.max(0.5, target * 0.1);
    const yellowTolerance = Math.max(1, target * 0.25);
    if (diff <= greenTolerance) return 'green';
    if (diff <= yellowTolerance) return 'yellow';
    return 'red';
  }

  private evaluateAmountPercent(
    amount: number,
    grossRevenue: number,
    targetPct: number
  ): KpiStatus {
    if (grossRevenue <= 0) return 'green';
    const pct = (amount / grossRevenue) * 100;
    return this.evaluatePercent(pct, targetPct);
  }

  private evaluateRent(answers: WizardAnswers, grossRevenue: number): KpiStatus {
    if (grossRevenue <= 0) return 'green';
    const rentPct = answers.rentPct ?? 0;
    if ((answers.region ?? 'US') === 'CA') {
      if (rentPct <= 18) return 'green';
      if (rentPct <= 20) return 'yellow';
      return 'red';
    }
    const rentAmount = (grossRevenue * rentPct) / 100;
    const period = this.settings.rentPeriod ?? 'monthly';
    const monthly = period === 'yearly' ? rentAmount / 12 : rentAmount;
    if (monthly <= 1500) return 'green';
    if (monthly <= 1800) return 'yellow';
    return 'red';
  }

  private evaluateMisc(miscPct: number): KpiStatus {
    if (miscPct <= 3) return 'green';
    if (miscPct <= 5) return 'yellow';
    return 'red';
  }
}
