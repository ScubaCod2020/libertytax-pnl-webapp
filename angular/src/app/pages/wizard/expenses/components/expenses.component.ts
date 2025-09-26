import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../services/settings.service';
import { WizardStateService } from '../../../../core/services/wizard-state.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-expenses-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe, AsyncPipe],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesFormComponent implements OnInit {
  constructor(
    public settingsSvc: SettingsService,
    public wizardState: WizardStateService
  ) {
    console.log('💰 [EXPENSES FORM] Component loaded');
  }

  ngOnInit(): void {
    // Ensure page starts at the top when component loads
    window.scrollTo(0, 0);
    console.log('💰 [EXPENSES FORM] Scrolled to top');

    // Trigger comprehensive debugging summary on expenses page load
    console.log('💰 [EXPENSES FORM] Loading - triggering computed properties summary...');
    this.wizardState.getComputedPropertiesSummary();
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

  // Revenue breakdown for the yellow panel (uses clean computed properties)
  readonly revenueBreakdown$ = this.answers$.pipe(
    map((answers) => {
      const storeType = answers.storeType || 'new';
      const isExisting = storeType === 'existing';

      console.log('💰 [EXPENSES] Revenue breakdown calculation:', { storeType, isExisting });

      // Use clean computed properties - no more hardcoded store type logic!
      const returns = this.wizardState.getTaxPrepReturns();
      const avgNetFee = this.wizardState.getAvgNetFee();
      const grossFees = this.wizardState.getGrossFees();
      const discountPct = this.wizardState.getDiscountsPct();
      const discountAmt = this.wizardState.getDiscountsAmt();
      const netIncome = this.wizardState.getTaxPrepIncome();
      const otherIncome = this.wizardState.getOtherIncome();

      const totalRevenue = netIncome + otherIncome;

      // Calculate vs target comparison (simplified for now)
      const targetRevenue = 194000; // This should come from targets calculation
      const vsTarget =
        totalRevenue > 0 ? Math.round(((totalRevenue - targetRevenue) / targetRevenue) * 100) : 0;

      const result = {
        title: this.wizardState.getDisplayLabel('revenueBreakdownTitle'),
        returns: returns,
        avgNetFee: avgNetFee,
        grossFees: grossFees,
        discountPct: discountPct,
        discountAmt: discountAmt,
        netIncome: netIncome,
        otherIncome: otherIncome,
        totalRevenue: totalRevenue,
        vsTarget: vsTarget,
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
