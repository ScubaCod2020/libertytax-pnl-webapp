import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map, shareReplay, distinctUntilChanged, startWith } from 'rxjs/operators';
import { PyIncomeDriversComponent } from './components/py-income-drivers.component';
import { ProjectedIncomeDriversComponent } from './components/projected-income-drivers.component';
import { TargetIncomeDriversComponent } from './components/target-income-drivers.component';
import { CommonModule } from '@angular/common';
import { WizardStateService } from '../../../core/services/wizard-state.service';
import { Subscription } from 'rxjs';

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
export class IncomeDriversComponent implements OnDestroy {
  private subscription = new Subscription();

  // Get store type and other settings from WizardStateService
  // Use the raw BehaviorSubject to avoid debouncing issues
  readonly storeType$ = this.wizardState['_answers$'].pipe(
    map((answers) => {
      console.log('🔄 [Income Drivers] storeType$ stream updated:', answers.storeType);
      console.log('🔄 [Income Drivers] Full answers object:', answers);
      return answers.storeType || 'new';
    }),
    distinctUntilChanged(), // Only emit when storeType actually changes
    startWith(this.wizardState.answers.storeType || 'new') // Ensure immediate emission
  );

  readonly storeTypeInfo$ = this.wizardState['_answers$'].pipe(
    map((answers) => {
      return {
        title:
          answers.storeType === 'existing'
            ? 'Existing Store Performance'
            : 'Target Performance Goals',
        description:
          answers.storeType === 'existing'
            ? 'Use your historical data'
            : 'First year - use regional benchmarks',
      };
    }),
    distinctUntilChanged((a, b) => a.title === b.title && a.description === b.description)
  );

  constructor(
    public wizardState: WizardStateService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('💰 [Income Drivers Component] Loading...');
    console.log('💰 [Income Drivers Component] Current wizard state:', this.wizardState.answers);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
