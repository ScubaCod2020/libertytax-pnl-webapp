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
    map(() => {
      return {
        title: this.wizardState.getDisplayLabel('storeTypeName'),
        description: this.wizardState.getValue({
          existingStore: 'Use your historical data',
          newStore: 'First year - use regional benchmarks',
          default: 'Configure your store settings',
        }),
      };
    })
  );

  constructor(private wizardState: WizardStateService) {
    console.log('💰 [Income Drivers Component] Loading...');
  }
}
