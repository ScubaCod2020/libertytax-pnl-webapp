import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { PyIncomeDriversComponent } from './components/py-income-drivers.component';
import { ProjectedIncomeDriversComponent } from './components/projected-income-drivers.component';
import { TargetIncomeDriversComponent } from './components/target-income-drivers.component';
import { CommonModule } from '@angular/common';
import { WizardStateService } from '../../../core/services/wizard-state.service';

@Component({
  selector: 'app-income-drivers',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PyIncomeDriversComponent,
    ProjectedIncomeDriversComponent,
    TargetIncomeDriversComponent,
  ],
  templateUrl: './income-drivers.component.html',
  styleUrls: ['./income-drivers.component.scss'],
})
export class IncomeDriversComponent {
  // Get store type and other settings from WizardStateService
  readonly storeType$ = this.wizardState.answers$.pipe(
    map((answers) => answers.storeType || 'new')
  );

  readonly storeTypeInfo$ = this.wizardState.answers$.pipe(
    map((answers) => {
      const storeType = answers.storeType || 'new';
      if (storeType === 'existing') {
        return {
          title: '🏢 Existing Store',
          description: 'Use your historical data',
        };
      } else {
        return {
          title: '🏪 New Store',
          description: 'First year - use regional benchmarks',
        };
      }
    })
  );

  constructor(private wizardState: WizardStateService) {
    console.log('💰 [Income Drivers Component] Loading...');
  }
}
