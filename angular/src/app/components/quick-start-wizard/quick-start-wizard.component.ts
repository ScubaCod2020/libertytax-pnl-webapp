import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, AppSettings } from '../../services/settings.service';
import { AppConfigService } from '../../services/app-config.service';
import { WizardStateService } from '../../core/services/wizard-state.service';

@Component({
  selector: 'app-quick-start-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-start-wizard.component.html',
  styleUrls: ['./quick-start-wizard.component.scss'],
})
export class QuickStartWizardComponent {
  @Input() title = '';
  @Input() editable = false;
  @Input() subtitle = '';

  settings: AppSettings = this.settingsSvc.settings;

  constructor(
    public settingsSvc: SettingsService,
    public appCfg: AppConfigService,
    private wizardState: WizardStateService
  ) {}

  onRegionChange(v: string) {
    const region = v === 'US' ? 'US' : 'CA';
    this.settingsSvc.update({ region });
    this.settings = this.settingsSvc.settings;

    // Also update wizard state
    this.wizardState.updateAnswers({ region });
  }

  onStoreTypeChange(v: string) {
    const storeType = v === 'new' ? 'new' : 'existing';
    this.settingsSvc.update({ storeType });
    this.settings = this.settingsSvc.settings;

    // Also update wizard state
    this.wizardState.updateAnswers({ storeType });
  }

  onTaxYearChange(v: string) {
    const n = Number(v) || new Date().getFullYear();
    this.settingsSvc.update({ taxYear: n });
    this.settings = this.settingsSvc.settings;
  }

  onTaxRushChange(v: boolean) {
    this.settingsSvc.update({ taxRush: !!v });
    this.settings = this.settingsSvc.settings;

    // Also update wizard state
    this.wizardState.updateAnswers({ handlesTaxRush: !!v });
  }

  onOtherIncomeChange(v: boolean) {
    this.settingsSvc.update({ otherIncome: !!v });
    this.settings = this.settingsSvc.settings;

    // Also update wizard state
    this.wizardState.updateAnswers({ hasOtherIncome: !!v });
  }

  isComplete(): boolean {
    // Basic requirements: region and store type
    if (!this.settings.region || !this.settings.storeType) {
      return false;
    }

    // If Canada, need TaxRush decision
    if (this.settings.region === 'CA' && this.settings.taxRush === null) {
      return false;
    }

    // Need other income decision
    if (this.settings.otherIncome === null) {
      return false;
    }

    return true;
  }
}
