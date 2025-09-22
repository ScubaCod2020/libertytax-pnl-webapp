import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService } from '../../../../services/app-config.service';
import { SettingsService } from '../../../../services/settings.service';

@Component({
  selector: 'app-py-income-drivers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './py-income-drivers.component.html',
  styleUrls: ['./py-income-drivers.component.scss'],
})
export class PyIncomeDriversComponent {
  constructor(
    public appCfg: AppConfigService,
    public settings: SettingsService
  ) {}
}
