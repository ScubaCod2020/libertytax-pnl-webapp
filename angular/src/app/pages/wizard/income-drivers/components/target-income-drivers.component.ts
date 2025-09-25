import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppConfigService } from '../../../../services/app-config.service';
import { SettingsService } from '../../../../services/settings.service';
import { WizardStateService } from '../../../../core/services/wizard-state.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-target-income-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './target-income-drivers.component.html',
  styleUrls: ['./target-income-drivers.component.scss'],
})
export class TargetIncomeDriversComponent {
  constructor(
    public appCfg: AppConfigService,
    public settings: SettingsService,
    public wizardState: WizardStateService
  ) {}

  // Reactive getters for form fields
  readonly answers$ = this.wizardState.answers$;

  // Target fields (for new stores, these are goals/targets, not projections)
  readonly taxPrepReturns$ = this.answers$.pipe(map((a) => a.taxPrepReturns || 0));
  readonly avgNetFee$ = this.answers$.pipe(map((a) => a.avgNetFee || 0));
  readonly grossFees$ = this.answers$.pipe(map((a) => a.projectedGrossFees || 0));
  readonly discountsAmt$ = this.answers$.pipe(map((a) => a.discountsAmt || 0));
  readonly discountsPct$ = this.answers$.pipe(map((a) => a.discountsPct || 0));
  readonly taxPrepIncome$ = this.answers$.pipe(map((a) => a.projectedTaxPrepIncome || 0));
  readonly otherIncome$ = this.answers$.pipe(map((a) => a.otherIncome || 0));
  readonly totalExpenses$ = this.answers$.pipe(map((a) => a.projectedExpenses || 0));
  readonly taxRushReturns$ = this.answers$.pipe(map((a) => a.taxRushReturns || 0));
  readonly taxRushAvgNetFee$ = this.answers$.pipe(map((a) => a.taxRushAvgNetFee || 0));

  // Computed values for display
  readonly netIncome$ = this.answers$.pipe(
    map((a) => {
      const income = (a.projectedTaxPrepIncome || 0) + (a.otherIncome || 0);
      const expenses = a.projectedExpenses || 0;
      return income - expenses;
    })
  );

  readonly netMargin$ = this.answers$.pipe(
    map((a) => {
      const income = (a.projectedTaxPrepIncome || 0) + (a.otherIncome || 0);
      const expenses = a.projectedExpenses || 0;
      const netIncome = income - expenses;
      return income > 0 ? (netIncome / income) * 100 : 0;
    })
  );

  // Form field update methods
  updateTaxPrepReturns(value: number): void {
    this.wizardState.updateAnswers({ taxPrepReturns: value });
  }

  updateAvgNetFee(value: number): void {
    this.wizardState.updateAnswers({ avgNetFee: value });
  }

  updateDiscountsAmt(value: number): void {
    this.wizardState.updateAnswers({ discountsAmt: value });
  }

  updateDiscountsPct(value: number): void {
    this.wizardState.updateAnswers({ discountsPct: value });
  }

  updateOtherIncome(value: number): void {
    this.wizardState.updateAnswers({ otherIncome: value });
  }

  updateTaxRushReturns(value: number): void {
    this.wizardState.updateAnswers({ taxRushReturns: value });
  }

  updateTaxRushAvgNetFee(value: number): void {
    this.wizardState.updateAnswers({ taxRushAvgNetFee: value });
  }

  // Manual override for auto-calculated fields
  overrideGrossFees(value: number): void {
    this.wizardState.updateAnswers({
      projectedGrossFees: value,
      manualAvgNetFee: value, // Mark as manually overridden
    });
  }

  overrideTaxPrepIncome(value: number): void {
    this.wizardState.updateAnswers({
      projectedTaxPrepIncome: value,
      manualTaxPrepIncome: value, // Mark as manually overridden
    });
  }

  overrideTotalExpenses(value: number): void {
    this.wizardState.updateAnswers({
      projectedExpenses: value,
      calculatedTotalExpenses: value, // Mark as manually overridden
    });
  }
}
