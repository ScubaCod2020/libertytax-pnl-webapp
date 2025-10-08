import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeDriversComponent implements OnDestroy {
  // Simple properties instead of observables for better change detection
  storeType: string = 'new';
  storeTypeInfo: { title: string; description: string } = {
    title: 'New Store',
    description: 'First year - use regional benchmarks',
  };

  private subscription = new Subscription();

  constructor(
    private wizardState: WizardStateService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('💰 [Income Drivers Component] Loading...');

    // Subscribe to store type changes and manually trigger change detection
    this.subscription.add(
      this.wizardState.answers$
        .pipe(map(answers => answers.storeType || 'new'))
        .subscribe(storeType => {
          this.storeType = storeType;
          this.updateStoreTypeInfo();
          this.cdr.markForCheck(); // Manual change detection
        })
    );
  }

  private updateStoreTypeInfo() {
    this.storeTypeInfo = {
      title: this.wizardState.getDisplayLabel('storeTypeName'),
      description:
        this.wizardState.getValue({
          existingStore: 'Use your historical data',
          newStore: 'First year - use regional benchmarks',
          default: 'Configure your store settings',
        }) || 'Configure your store settings',
    };
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
