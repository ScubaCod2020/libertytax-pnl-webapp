import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppConfigService } from '../../../../services/app-config.service';
import { SettingsService } from '../../../../services/settings.service';
import { ProjectedService, Scenario } from '../../../../services/projected.service';
import { AnalysisBlockComponent } from '../../../../components/analysis-block/analysis-block.component';
import { FEATURE_FLAGS } from '../../../../core/tokens/feature-flags.token';
import { WizardStateService } from '../../../../core/services/wizard-state.service';
import { ConfigService } from '../../../../core/services/config.service';
import { CalculationService } from '../../../../core/services/calculation.service';
import type { CalculationInputs } from '../../../../domain/types/calculation.types';
import { DevTraceService } from '../../../../core/services/dev-trace.service';
import { AnalysisDataAssemblerService } from '../../../../domain/services/analysis-data-assembler.service';

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
    public projSvc: ProjectedService
  ) { }

  scenarios: Scenario[] = ['Custom', 'Good', 'Better', 'Best'];

  private readonly flags = inject(FEATURE_FLAGS);
  private readonly assembler = inject(AnalysisDataAssemblerService);
  private readonly wizard = inject(WizardStateService);
  private readonly config = inject(ConfigService);
  private readonly calc = inject(CalculationService);
  private readonly trace = inject(DevTraceService);

  // Local state for Projected section (presentational; wiring to services is planned)
  taxPrepReturns: number | undefined;
  avgNetFee: number | undefined;
  discountsAmt: number | undefined;
  discountsPct: number | undefined;
  otherIncome: number | undefined;

  get showAnalysis(): boolean {
    return this.flags.showAnalysisBlock === true;
  }

  get analysisData() {
    return this.assembler.buildProjectedVsPresets();
  }

  // Derived values
  get projectedGrossFees(): number | undefined {
    if (this.taxPrepReturns && this.avgNetFee) {
      return Math.round(this.taxPrepReturns * this.avgNetFee);
    }
    return undefined;
  }

  get projectedTaxPrepIncome(): number | undefined {
    const gross = this.projectedGrossFees ?? 0;
    const disc = this.discountsAmt ?? 0;
    if (gross > 0) return Math.round(gross - disc);
    return undefined;
  }

  // Wire: selections → effective config → calculation
  get liveResults() {
    const selections = this.wizard.getSelections();
    const eff = this.config.getEffectiveConfig();
    const inputs: CalculationInputs = {
      region: selections.region,
      scenario: 'Custom',
      avgNetFee: this.avgNetFee ?? 0,
      taxPrepReturns: this.taxPrepReturns ?? 0,
      taxRushReturns: selections.region === 'CA' ? (this.settings?.taxRushReturns ?? 0) : 0,
      handlesTaxRush: selections.region === 'CA' ? true : false,
      otherIncome: this.otherIncome ?? 0,
      discountsPct: this.discountsPct ?? 0,
      // Expenses default to 0 at this stage (Dashboard controls override later)
      salariesPct: 0,
      empDeductionsPct: 0,
      rentPct: 0,
      telephoneAmt: 0,
      utilitiesAmt: 0,
      localAdvAmt: 0,
      insuranceAmt: 0,
      postageAmt: 0,
      suppliesPct: 0,
      duesAmt: 0,
      bankFeesAmt: 0,
      maintenanceAmt: 0,
      travelEntAmt: 0,
      royaltiesPct: 0,
      advRoyaltiesPct: 0,
      taxRushRoyaltiesPct: 0,
      miscPct: 0,
      thresholds: eff.thresholds,
    };
    this.trace.trace('ProjectedIncomeDrivers.liveInputs', inputs);
    const results = this.calc.calculate(inputs);
    this.trace.trace('ProjectedIncomeDrivers.liveResults', results);
    return results;
  }

  get projectedExpenses(): number | undefined {
    const base = (this.projectedTaxPrepIncome ?? 0) + (this.otherIncome ?? 0);
    if (base > 0) return Math.round(base * 0.76);
    return undefined;
  }

  // Sync helpers for discounts bi-directional entry
  onDiscountsAmtChange(next: any): void {
    const amt = Number(next);
    this.discountsAmt = isFinite(amt) ? amt : undefined;
    const gross = this.projectedGrossFees;
    if (gross && this.discountsAmt !== undefined) {
      this.discountsPct = Math.round(((this.discountsAmt / gross) * 100) * 10) / 10;
    }
  }

  onDiscountsPctChange(next: any): void {
    const pct = Number(next);
    this.discountsPct = isFinite(pct) ? pct : undefined;
    const gross = this.projectedGrossFees;
    if (gross && this.discountsPct !== undefined) {
      this.discountsAmt = Math.round(gross * (this.discountsPct / 100));
    }
  }
}
