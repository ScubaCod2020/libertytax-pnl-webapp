import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, AppSettings } from '../../services/settings.service';
import { AppConfigService } from '../../services/app-config.service';

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
    public appCfg: AppConfigService
  ) {}

  onRegionChange(v: string) {
    this.settingsSvc.update({ region: v === 'US' ? 'US' : 'CA' });
    this.settings = this.settingsSvc.settings;
  }
  onStoreTypeChange(v: string) {
    this.settingsSvc.update({ storeType: v === 'new' ? 'new' : 'existing' });
    this.settings = this.settingsSvc.settings;
  }
  onTaxYearChange(v: string) {
    const n = Number(v) || new Date().getFullYear();
    this.settingsSvc.update({ taxYear: n });
    this.settings = this.settingsSvc.settings;
  }
  onTaxRushChange(v: boolean) {
    this.settingsSvc.update({ taxRush: !!v });
    this.settings = this.settingsSvc.settings;
  }
  onOtherIncomeChange(v: boolean) {
    this.settingsSvc.update({ otherIncome: !!v });
    this.settings = this.settingsSvc.settings;
  }
}
