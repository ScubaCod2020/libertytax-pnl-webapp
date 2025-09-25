import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PyIncomeDriversComponent } from './components/py-income-drivers.component';
import { ProjectedIncomeDriversComponent } from './components/projected-income-drivers.component';
import { TargetIncomeDriversComponent } from './components/target-income-drivers.component';
import { QuickStartWizardComponent } from '../../../components/quick-start-wizard/quick-start-wizard.component';
import { CommonModule } from '@angular/common';
import { AppConfigService } from '../../../services/app-config.service';

@Component({
  selector: 'app-income-drivers',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PyIncomeDriversComponent,
    ProjectedIncomeDriversComponent,
    TargetIncomeDriversComponent,
    QuickStartWizardComponent,
  ],
  templateUrl: './income-drivers.component.html',
})
export class IncomeDriversComponent {
  constructor(public appCfg: AppConfigService) {}
}
