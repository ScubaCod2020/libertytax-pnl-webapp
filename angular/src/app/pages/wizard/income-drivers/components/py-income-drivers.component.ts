import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { WizardStateService } from '../../../../core/services/wizard-state.service';
import { AppConfigService } from '../../../../services/app-config.service';

@Component({
  selector: 'app-py-income-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './py-income-drivers.component.html',
  styleUrls: ['./py-income-drivers.component.scss'],
})
export class PyIncomeDriversComponent {
  readonly answers$ = this.wizardState.answers$;

  // Individual field getters for easier template binding
  readonly taxPrepReturns$ = this.answers$.pipe(map((a) => a.pyTaxPrepReturns || null));
  readonly avgNetFee$ = this.answers$.pipe(map((a) => a.pyAvgNetFee || null));
  readonly grossFees$ = this.answers$.pipe(map((a) => a.pyGrossFees || null));
  readonly discountsAmt$ = this.answers$.pipe(map((a) => a.pyDiscountsAmt || null));
  readonly discountsPct$ = this.answers$.pipe(
    map((a) => {
      if (a.pyDiscountsPct !== undefined && a.pyDiscountsPct !== null) {
        return a.pyDiscountsPct;
      }
      // Fall back to regional default
      const region = a.region || 'US';
      return region === 'CA' ? 3.0 : 1.0;
    })
  );

  // Format percentage to show only necessary decimal places
  readonly discountsPctFormatted$ = this.discountsPct$.pipe(
    map((pct) => {
      if (pct === undefined || pct === null) return '';
      if (pct === 0) return '0';
      return (Math.round(pct * 10) / 10).toString();
    })
  );

  readonly taxPrepIncome$ = this.answers$.pipe(map((a) => a.pyTaxPrepIncome || null));
  readonly otherIncome$ = this.answers$.pipe(map((a) => a.pyOtherIncome || null));
  readonly taxRushReturns$ = this.answers$.pipe(map((a) => a.pyTaxRushReturns || null));
  readonly taxRushReturnsPct$ = this.answers$.pipe(map((a) => a.pyTaxRushReturnsPct || 15.0));
  readonly taxRushAvgNetFee$ = this.answers$.pipe(map((a) => a.pyTaxRushAvgNetFee || null));
  readonly taxRushGrossFees$ = this.answers$.pipe(map((a) => a.pyTaxRushGrossFees || null));

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

  // Computed values for display
  readonly grossNetIncome$ = this.answers$.pipe(
    map((a) => {
      // Prior Year Gross Net Income = PY Tax Prep Income + PY TaxRush Income + PY Other Income (only if enabled)
      const taxPrepIncome = a.pyTaxPrepIncome || 0;
      const taxRushIncome = a.handlesTaxRush ? a.pyTaxRushGrossFees || 0 : 0;
      const otherIncome = a.hasOtherIncome ? a.pyOtherIncome || 0 : 0;
      return taxPrepIncome + taxRushIncome + otherIncome;
    })
  );

  readonly grossNetPerReturn$ = this.answers$.pipe(
    map((a) => {
      // Gross Net per Return = PY Tax Prep Income ÷ PY Tax Prep Returns
      const taxPrepIncome = a.pyTaxPrepIncome || 0;
      const taxPrepReturns = a.pyTaxPrepReturns || 0;
      return taxPrepReturns > 0 ? taxPrepIncome / taxPrepReturns : 0;
    })
  );

  constructor(
    public appCfg: AppConfigService,
    private wizardState: WizardStateService
  ) {
    console.log('📈 [PY Income Drivers] Component instantiated');
  }

  // Form field update methods
  updateTaxPrepReturns(value: number): void {
    console.log('📈 [PY] Tax Prep Returns changed to:', value);
    this.wizardState.updateAnswers({ pyTaxPrepReturns: value });
  }

  updateAvgNetFee(value: number): void {
    console.log('📈 [PY] Average Net Fee changed to:', value);
    this.wizardState.updateAnswers({ pyAvgNetFee: value });
  }

  updateDiscountsAmt(value: number): void {
    console.log('📈 [PY] Discount Amount changed to:', value);
    this.wizardState.updateAnswers({ pyDiscountsAmt: value });
  }

  updateDiscountsPct(value: number): void {
    console.log('📈 [PY] Discount Percentage changed to:', value);
    this.wizardState.updateAnswers({ pyDiscountsPct: value });
  }

  updateOtherIncome(value: number): void {
    console.log('📈 [PY] Other Income changed to:', value);
    this.wizardState.updateAnswers({ pyOtherIncome: value });
  }

  updateTaxRushReturns(value: number): void {
    console.log('📈 [PY] TaxRush Returns changed to:', value);
    this.wizardState.updateAnswers({ pyTaxRushReturns: value, manualPyTaxRushReturns: value });
  }

  updateTaxRushReturnsPct(value: number): void {
    console.log('📈 [PY] TaxRush Returns % changed to:', value);
    this.wizardState.updateAnswers({
      pyTaxRushReturnsPct: value,
      manualPyTaxRushReturns: undefined,
    });
  }

  updateTaxRushAvgNetFee(value: number): void {
    console.log('📈 [PY] TaxRush Avg Net Fee changed to:', value);
    this.wizardState.updateAnswers({ pyTaxRushAvgNetFee: value });
  }

  resetPriorYear(): void {
    // Reset only Prior Year fields
    const currentRegion = this.wizardState.answers.region || 'US';
    const regionalDiscountPct = currentRegion === 'CA' ? 3.0 : 1.0;

    this.wizardState.updateAnswers({
      // Clear all Prior Year fields
      pyTaxPrepReturns: undefined,
      pyAvgNetFee: undefined,
      pyDiscountsPct: regionalDiscountPct,
      pyDiscountsAmt: undefined,
      pyOtherIncome: undefined,
      pyTaxRushReturns: undefined,
      pyTaxRushAvgNetFee: undefined,
      // Clear calculated fields
      pyGrossFees: undefined,
      pyTaxPrepIncome: undefined,
      pyTaxRushGrossFees: undefined,
    });
  }
}
