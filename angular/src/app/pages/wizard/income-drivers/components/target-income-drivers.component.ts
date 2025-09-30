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

  // Show TaxRush section only for Canada AND if TaxRush is enabled
  readonly showTaxRush$ = this.wizardState.answers$.pipe(
    map((answers) => answers.region === 'CA' && answers.handlesTaxRush === true)
  );

  // Show Other Income section only if enabled in Quick Start Wizard
  readonly showOtherIncome$ = this.wizardState.answers$.pipe(
    map((answers) => answers.hasOtherIncome === true)
  );

  // Regional discount default for placeholder
  readonly regionalDiscountDefault$ = this.wizardState.answers$.pipe(
    map((answers) => {
      const region = answers.region || 'US';
      return region === 'CA' ? '3.0' : '1.0';
    })
  );

  // Reactive getters for form fields
  readonly answers$ = this.wizardState.answers$;

  // Target fields (for new stores, these are goals/targets, not projections)
  readonly taxPrepReturns$ = this.answers$.pipe(map((a) => a.projectedTaxPrepReturns || null));
  readonly avgNetFee$ = this.answers$.pipe(map((a) => a.avgNetFee || null));
  readonly grossFees$ = this.answers$.pipe(map((a) => a.projectedGrossFees || null));
  readonly discountsAmt$ = this.answers$.pipe(map((a) => a.discountsAmt || null));
  readonly discountsPct$ = this.answers$.pipe(
    map((a) => {
      if (a.discountsPct !== undefined && a.discountsPct !== null) {
        return a.discountsPct;
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
  readonly taxPrepIncome$ = this.answers$.pipe(map((a) => a.projectedTaxPrepIncome || null));
  readonly otherIncome$ = this.answers$.pipe(map((a) => a.otherIncome || null));
  readonly totalExpenses$ = this.answers$.pipe(map((a) => a.projectedExpenses || null));
  readonly taxRushReturns$ = this.answers$.pipe(map((a) => a.taxRushReturns || null));
  readonly taxRushReturnsPct$ = this.answers$.pipe(map((a) => a.taxRushReturnsPct || 15.0));
  readonly taxRushAvgNetFee$ = this.answers$.pipe(map((a) => a.taxRushAvgNetFee || null));
  readonly taxRushGrossFees$ = this.answers$.pipe(map((a) => a.taxRushGrossFees || null));

  // Computed values for display
  readonly grossNetIncome$ = this.answers$.pipe(
    map((a) => {
      // Gross Net Income = Total Tax Prep Income + TaxRush Income + Other Income (only if enabled)
      const taxPrepIncome = a.projectedTaxPrepIncome || 0;
      const taxRushIncome = a.handlesTaxRush ? a.taxRushGrossFees || 0 : 0;
      const otherIncome = a.hasOtherIncome ? a.otherIncome || 0 : 0;
      return taxPrepIncome + taxRushIncome + otherIncome;
    })
  );

  readonly grossNetPerReturn$ = this.answers$.pipe(
    map((a) => {
      // Gross Net per Return = Total Tax Prep Income ÷ Tax Prep Returns
      const taxPrepIncome = a.projectedTaxPrepIncome || 0;
      const taxPrepReturns = a.projectedTaxPrepReturns || 0;
      return taxPrepReturns > 0 ? taxPrepIncome / taxPrepReturns : 0;
    })
  );

  // Form field update methods
  updateTaxPrepReturns(value: number): void {
    console.log('🎯 [Target] Tax Prep Returns changed to:', value);
    this.wizardState.updateAnswers({ projectedTaxPrepReturns: value });
  }

  updateAvgNetFee(value: number): void {
    console.log('🎯 [Target] Average Net Fee changed to:', value);
    this.wizardState.updateAnswers({ avgNetFee: value });
  }

  updateDiscountsAmt(value: number): void {
    console.log('🎯 [Target] Discount Amount changed to:', value);
    this.wizardState.updateAnswers({ discountsAmt: value });
  }

  updateDiscountsPct(value: number): void {
    console.log('🎯 [Target] Discount Percentage changed to:', value);
    this.wizardState.updateAnswers({ discountsPct: value });
  }

  updateOtherIncome(value: number): void {
    console.log('🎯 [Target] Other Income changed to:', value);
    this.wizardState.updateAnswers({ otherIncome: value });
  }

  updateTaxRushReturns(value: number): void {
    console.log('🎯 [Target] TaxRush Returns changed to:', value);
    this.wizardState.updateAnswers({ taxRushReturns: value, manualTaxRushReturns: value });
  }

  updateTaxRushReturnsPct(value: number): void {
    console.log('🎯 [Target] TaxRush Returns % changed to:', value);
    this.wizardState.updateAnswers({ taxRushReturnsPct: value, manualTaxRushReturns: undefined });
  }

  updateTaxRushAvgNetFee(value: number): void {
    console.log('🎯 [Target] TaxRush Avg Net Fee changed to:', value);
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

  resetTargetGoals(): void {
    // Reset only the target performance fields and clear all data to show placeholders
    const currentRegion = this.wizardState.answers.region || 'US';
    const regionalDiscountPct = currentRegion === 'CA' ? 3.0 : 1.0;

    this.wizardState.updateAnswers({
      _isExampleData: false, // Don't show as example data, just clear fields
      // Clear all target fields so user sees placeholders
      projectedTaxPrepReturns: undefined,
      avgNetFee: undefined,
      discountsPct: regionalDiscountPct, // Keep regional default
      discountsAmt: undefined,
      otherIncome: undefined,
      taxRushReturns: undefined,
      taxRushAvgNetFee: undefined,
      // Clear calculated fields
      projectedAvgNetFee: undefined,
      projectedGrossFees: undefined,
      projectedTaxPrepIncome: undefined,
      taxRushReturnsPct: undefined,
      taxRushGrossFees: undefined,
      projectedExpenses: undefined,
      // Clear manual overrides
      manualAvgNetFee: undefined,
      manualTaxPrepIncome: undefined,
      manualTaxRushReturns: undefined,
    });
  }

  overrideTotalExpenses(value: number): void {
    this.wizardState.updateAnswers({
      projectedExpenses: value,
      calculatedTotalExpenses: value, // Mark as manually overridden
    });
  }
}
