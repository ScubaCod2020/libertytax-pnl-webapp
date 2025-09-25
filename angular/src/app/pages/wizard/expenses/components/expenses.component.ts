import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../services/settings.service';
import { WizardStateService } from '../../../../core/services/wizard-state.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  constructor(
    public settingsSvc: SettingsService,
    public wizardState: WizardStateService
  ) {}

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

  // Update methods for expense fields
  updateSalariesPct(value: number): void {
    this.wizardState.updateAnswers({ salariesPct: value });
  }

  updateEmpDeductionsPct(value: number): void {
    this.wizardState.updateAnswers({ empDeductionsPct: value });
  }

  updateRentPct(value: number): void {
    this.wizardState.updateAnswers({ rentPct: value });
  }

  updateTelephoneAmt(value: number): void {
    this.wizardState.updateAnswers({ telephoneAmt: value });
  }

  updateUtilitiesAmt(value: number): void {
    this.wizardState.updateAnswers({ utilitiesAmt: value });
  }

  updateLocalAdvAmt(value: number): void {
    this.wizardState.updateAnswers({ localAdvAmt: value });
  }

  // Reset expenses to defaults
  resetExpensesToDefaults(): void {
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
