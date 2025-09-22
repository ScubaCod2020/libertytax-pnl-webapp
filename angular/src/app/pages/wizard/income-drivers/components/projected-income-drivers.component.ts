import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppConfigService } from '../../../../services/app-config.service';
import { SettingsService } from '../../../../services/settings.service';
import { ProjectedService, Scenario } from '../../../../services/projected.service';

@Component({
  selector: 'app-projected-income-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projected-income-drivers.component.html',
  styleUrls: ['./projected-income-drivers.component.scss'],
})
export class ProjectedIncomeDriversComponent {
  constructor(
    public appCfg: AppConfigService,
    public settings: SettingsService,
    public projSvc: ProjectedService
  ) {}

  scenarios: Scenario[] = ['Custom', 'Good', 'Better', 'Best'];
}
