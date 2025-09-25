import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../services/settings.service';
import { WizardStateService } from '../../../../core/services/wizard-state.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-expenses-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesFormComponent {
  constructor(
    public settingsSvc: SettingsService,
    public wizardState: WizardStateService
  ) {
    console.log('💰 [EXPENSES FORM] Component loaded');
  }

  get settings() {
    return this.settingsSvc.settings;
  }

  // Reactive getters for income values (read-only from Step 1)
  readonly answers$ = this.wizardState.answers$;
  readonly avgNetFee$ = this.answers$.pipe(map((a) => a.avgNetFee || 125));
  readonly taxPrepReturns$ = this.answers$.pipe(
    map((a) => a.projectedTaxPrepReturns || a.taxPrepReturns || 1600)
  );
  readonly discountsPct$ = this.answers$.pipe(map((a) => a.discountsPct || 3));
  readonly grossRevenue$ = this.answers$.pipe(
    map((a) => (a.projectedTaxPrepIncome || 0) + (a.otherIncome || 0))
  );

  // Expense field getters
  readonly salariesPct$ = this.answers$.pipe(map((a) => a.salariesPct || 25));
  readonly empDeductionsPct$ = this.answers$.pipe(map((a) => a.empDeductionsPct || 10));
  readonly rentPct$ = this.answers$.pipe(map((a) => a.rentPct || 18));
  readonly telephoneAmt$ = this.answers$.pipe(map((a) => a.telephoneAmt || 0.5));
  readonly utilitiesAmt$ = this.answers$.pipe(map((a) => a.utilitiesAmt || 1.2));
  readonly localAdvAmt$ = this.answers$.pipe(map((a) => a.localAdvAmt || 2.0));
  readonly insuranceAmt$ = this.answers$.pipe(map((a) => a.insuranceAmt || 0.6));
  readonly postageAmt$ = this.answers$.pipe(map((a) => a.postageAmt || 0.4));
  readonly miscPct$ = this.answers$.pipe(map((a) => a.miscPct || 1.0));

  // Revenue breakdown for the yellow panel (dynamic based on store type)
  readonly revenueBreakdown$ = this.answers$.pipe(
    map((answers) => {
      const storeType = answers.storeType || 'new';
      const isExisting = storeType === 'existing';

      console.log('💰 [EXPENSES] Revenue breakdown calculation:', { storeType, isExisting });

      // Use projected data for existing stores, target data for new stores
      const returns = isExisting
        ? answers.projectedTaxPrepReturns || 0
        : answers.taxPrepReturns || 0;
      const avgNetFee = isExisting ? answers.projectedAvgNetFee || 0 : answers.avgNetFee || 0;
      const grossFees = isExisting ? answers.projectedGrossFees || 0 : answers.grossFees || 0;
      const discountPct = isExisting
        ? answers.projectedDiscountsPct || 0
        : answers.discountsPct || 0;
      const discountAmt = isExisting
        ? answers.projectedDiscountsAmt || 0
        : answers.discountsAmt || 0;
      const netIncome = isExisting
        ? answers.projectedTaxPrepIncome || 0
        : answers.taxPrepIncome || 0;
      const otherIncome = isExisting ? answers.projectedOtherIncome || 0 : answers.otherIncome || 0;

      const totalRevenue = netIncome + otherIncome;

      const result = {
        title: isExisting ? 'Projected Gross Revenue Breakdown' : 'Target Gross Revenue Breakdown',
        returns: returns,
        avgNetFee: avgNetFee,
        grossFees: grossFees,
        discountPct: discountPct,
        discountAmt: discountAmt,
        netIncome: netIncome,
        otherIncome: otherIncome,
        totalRevenue: totalRevenue,
        vsTarget: 0, // Calculate vs target comparison
        description: isExisting
          ? 'This is your projected gross revenue before expenses based on your historical data and growth targets.'
          : 'This is your target gross revenue before expenses based on regional benchmarks and your goals.',
      };

      console.log('💰 [EXPENSES] Revenue breakdown result:', result);
      return result;
    })
  );

  // Update methods for expense fields
  updateSalariesPct(value: number): void {
    console.log('💼 [EXPENSES] Salaries % changed to:', value);
    this.wizardState.updateAnswers({ salariesPct: value });
  }

  updateEmpDeductionsPct(value: number): void {
    console.log('👥 [EXPENSES] Employee Deductions % changed to:', value);
    this.wizardState.updateAnswers({ empDeductionsPct: value });
  }

  updateRentPct(value: number): void {
    console.log('🏢 [EXPENSES] Rent % changed to:', value);
    this.wizardState.updateAnswers({ rentPct: value });
  }

  updateTelephoneAmt(value: number): void {
    console.log('📞 [EXPENSES] Telephone amount changed to:', value);
    this.wizardState.updateAnswers({ telephoneAmt: value });
  }

  updateUtilitiesAmt(value: number): void {
    console.log('💡 [EXPENSES] Utilities amount changed to:', value);
    this.wizardState.updateAnswers({ utilitiesAmt: value });
  }

  updateLocalAdvAmt(value: number): void {
    console.log('📢 [EXPENSES] Local Advertising amount changed to:', value);
    this.wizardState.updateAnswers({ localAdvAmt: value });
  }

  updateInsuranceAmt(value: number): void {
    console.log('🛡️ [EXPENSES] Insurance amount changed to:', value);
    this.wizardState.updateAnswers({ insuranceAmt: value });
  }

  updatePostageAmt(value: number): void {
    console.log('📮 [EXPENSES] Postage amount changed to:', value);
    this.wizardState.updateAnswers({ postageAmt: value });
  }

  updateMiscPct(value: number): void {
    console.log('🔧 [EXPENSES] Miscellaneous % changed to:', value);
    this.wizardState.updateAnswers({ miscPct: value });
  }

  // Reset expenses to defaults
  resetExpensesToDefaults(): void {
    console.log('🔄 [EXPENSES] Reset to defaults button clicked');
    this.wizardState.updateAnswers({
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
      taxRushRoyaltiesPct: this.settings.region === 'CA' ? 6 : 0,
      miscPct: 1.0,
    });
  }
}
