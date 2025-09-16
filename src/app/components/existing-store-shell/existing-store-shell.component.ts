import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PriorYearPerformanceComponent } from '../prior-year-performance/prior-year-performance.component';
import { IncomeDriversComponent } from '../income-drivers/income-drivers.component';
import { PriorYearMetrics, PriorYearRawMetrics } from '../../existing-store/shared/prior-year.models';

interface FormStateSnapshot {
  value: Record<string, unknown>;
  valid: boolean;
  touched: boolean;
}

@Component({
  selector: 'app-existing-store-shell',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PriorYearPerformanceComponent, IncomeDriversComponent],
  template: `
    <section class="existing-shell">
      <header class="existing-shell__header">
        <h2>Existing Store Overview</h2>
        <p class="existing-shell__subtitle">Toggle region and store type to mirror production parity scenarios.</p>
      </header>

      <form [formGroup]="contextForm" class="existing-shell__context">
        <label class="existing-shell__control">
          <span>Region</span>
          <select formControlName="region" class="existing-shell__select">
            <option *ngFor="let option of regions" [value]="option">{{ option }}</option>
          </select>
        </label>

        <label class="existing-shell__control">
          <span>Store Type</span>
          <select formControlName="storeType" class="existing-shell__select">
            <option *ngFor="let option of storeTypes" [value]="option">{{ option }}</option>
          </select>
        </label>
      </form>

      <div class="existing-shell__panels">
        <app-prior-year-performance
          class="existing-shell__panel"
          [region]="region"
          [storeType]="storeType"
          [raw]="priorYearRaw"
          (metricsChange)="onPriorYearMetrics($event)"
        ></app-prior-year-performance>

        <app-income-drivers
          class="existing-shell__panel"
          [displayTitle]="'Performance Goals'"
          [mode]="'existing'"
          [region]="region"
          [storeType]="storeType"
          [priorYear]="priorYearMetrics"
          (formState)="onFormState($event)"
        ></app-income-drivers>
      </div>

      <section class="existing-shell__snapshot" *ngIf="formState">
        <h3>Goals Form Snapshot</h3>
        <p><strong>Valid:</strong> {{ formState.valid }}</p>
        <p><strong>Touched:</strong> {{ formState.touched }}</p>
        <pre>{{ formState.value | json }}</pre>
      </section>
    </section>
  `,
  styles: [
    `
      .existing-shell {
        display: grid;
        gap: 1.5rem;
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .existing-shell__header {
        display: grid;
        gap: 0.35rem;
      }

      .existing-shell__subtitle {
        color: #4b5563;
        margin: 0;
      }

      .existing-shell__context {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .existing-shell__control {
        display: grid;
        gap: 0.25rem;
        font-weight: 600;
        color: #1f2937;
      }

      .existing-shell__select {
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid #d1d5db;
        background: #ffffff;
        min-width: 160px;
      }

      .existing-shell__panels {
        display: grid;
        gap: 1.5rem;
      }

      .existing-shell__panel {
        width: 100%;
      }

      .existing-shell__snapshot {
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 1rem;
        background: #f9fafb;
        overflow: auto;
      }

      pre {
        margin: 0;
        background: transparent;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExistingStoreShellComponent {
  readonly regions = ['US', 'CA'];
  readonly storeTypes = ['Franchise', 'Company'];

  readonly contextForm: FormGroup = this.fb.group({
    region: ['US'],
    storeType: ['Franchise'],
  });

  priorYearRaw: PriorYearRawMetrics = {
    grossFees: 206000,
    discountAmount: 6180,
    otherIncome: 2500,
    expenses: 150000,
    taxPrepReturns: 1680,
    taxRushReturns: 252,
    taxRushAvgNetFee: 125,
  };

  priorYearMetrics?: PriorYearMetrics;
  formState?: FormStateSnapshot;

  constructor(private readonly fb: FormBuilder) {}

  get region(): string {
    return this.contextForm.get('region')?.value ?? 'US';
  }

  get storeType(): string {
    return this.contextForm.get('storeType')?.value ?? 'Franchise';
  }

  onPriorYearMetrics(metrics: PriorYearMetrics): void {
    this.priorYearMetrics = metrics;
  }

  onFormState(state: FormStateSnapshot): void {
    this.formState = state;
  }
}
