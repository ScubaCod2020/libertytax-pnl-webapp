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
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-projected-income-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule, AnalysisBlockComponent],
  templateUrl: './projected-income-drivers.component.html',
  styleUrls: ['./projected-income-drivers.component.scss'],
})
export class ProjectedIncomeDriversComponent {
  constructor(
    public appCfg: AppConfigService,
    public settings: SettingsService,
    public projSvc: ProjectedService,
    public wizardState: WizardStateService
  ) {}

  scenarios: Scenario[] = ['Custom', 'Good', 'Better', 'Best'];

  private readonly flags = inject(FEATURE_FLAGS);
  private readonly assembler = inject(AnalysisDataAssemblerService);

  // Reactive getters for form fields
  readonly answers$ = this.wizardState.answers$;

  // Individual field getters for easier template binding
  readonly taxPrepReturns$ = this.answers$.pipe(
    map((a) => a.projectedTaxPrepReturns || a.taxPrepReturns || 0)
  );
  readonly avgNetFee$ = this.answers$.pipe(map((a) => a.avgNetFee || 0));
  readonly grossFees$ = this.answers$.pipe(map((a) => a.projectedGrossFees || 0));
  readonly discountsAmt$ = this.answers$.pipe(map((a) => a.discountsAmt || 0));
  readonly discountsPct$ = this.answers$.pipe(map((a) => a.discountsPct || 0));
  readonly taxPrepIncome$ = this.answers$.pipe(map((a) => a.projectedTaxPrepIncome || 0));
  readonly otherIncome$ = this.answers$.pipe(map((a) => a.otherIncome || 0));
  readonly totalExpenses$ = this.answers$.pipe(map((a) => a.projectedExpenses || 0));

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

  get showAnalysis(): boolean {
    return this.flags.showAnalysisBlock === true;
  }

  get analysisData() {
    return this.assembler.buildProjectedVsPresets();
  }

  // Form field update methods
  updateTaxPrepReturns(value: number): void {
    this.wizardState.updateAnswers({
      projectedTaxPrepReturns: value,
      taxPrepReturns: value, // Keep both for compatibility
    });
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
}
