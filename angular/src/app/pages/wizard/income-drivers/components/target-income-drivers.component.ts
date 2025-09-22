import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService } from '../../../../services/app-config.service';
import { SettingsService } from '../../../../services/settings.service';

@Component({
  selector: 'app-target-income-drivers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './target-income-drivers.component.html',
  styleUrls: ['./target-income-drivers.component.scss'],
})
export class TargetIncomeDriversComponent {
  constructor(
    public appCfg: AppConfigService,
    public settings: SettingsService
  ) {}

  // Variables we will wire to logic later (from React reference):
  // - taxPrepReturns, avgNetFee, effectiveGrossFees
  // - discountsAmt, discountsPct, projectedTaxPrepIncome
  // - taxRushReturns, taxRushAvgNetFee, taxRushGrossFees (gated by region/handlesTaxRush)
  // - otherIncome, projectedExpenses
}
