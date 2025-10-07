import { Component, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeDriversComponent implements OnDestroy {
  private subscription = new Subscription();

  // Simple property for template binding
  currentConfig: any = {
    storeType: 'new',
    region: 'US',
    title: 'Target Performance Goals',
    description: 'First year - use regional benchmarks',
  };

  // SINGLE SUBSCRIPTION: Get all configuration from one source to avoid timing issues
  readonly config$ = this.wizardState['_answers$'].pipe(
    map((answers) => {
      console.log('🔄 [Income Drivers] Config stream updated:', answers);
      return {
        storeType: answers.storeType || 'new',
        region: answers.region || 'US',
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
    // REMOVED distinctUntilChanged to ensure template always re-renders
    startWith({
      storeType: this.wizardState.answers.storeType || 'new',
      region: this.wizardState.answers.region || 'US',
      title:
        this.wizardState.answers.storeType === 'existing'
          ? 'Existing Store Performance'
          : 'Target Performance Goals',
      description:
        this.wizardState.answers.storeType === 'existing'
          ? 'Use your historical data'
          : 'First year - use regional benchmarks',
    })
  );

  constructor(
    public wizardState: WizardStateService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('💰 [Income Drivers Component] Loading...');
    console.log('💰 [Income Drivers Component] Current wizard state:', this.wizardState.answers);

    // Force change detection when config changes
    this.subscription.add(
      this.config$.subscribe((config) => {
        console.log('🎯 [Income Drivers] Config changed to:', config);
        console.log('🔄 [Income Drivers] Forcing change detection...');
        this.currentConfig = config;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      })
    );
  }

  // TrackBy function to force template re-rendering
  trackByConfig(index: number, config: any): string {
    return `${config.storeType}-${config.region}-${Date.now()}`;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
