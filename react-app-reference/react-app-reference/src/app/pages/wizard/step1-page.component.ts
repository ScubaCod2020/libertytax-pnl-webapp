import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PriorYearPerformanceComponent, PriorYearData, PriorYearMetrics } from '../../components/prior-year-performance/prior-year-performance.component';
import { ProjectedPerformanceComponent } from '../../components/projected-performance/projected-performance.component';
import { AppStateService } from '../../services/app-state.service';
import { PersistenceService } from '../../services/persistence.service';
import { Region } from '../../models/wizard.models';

@Component({
  selector: 'app-step1-page',
  standalone: true,
  imports: [CommonModule, PriorYearPerformanceComponent, ProjectedPerformanceComponent],
  template: `
    <div class="page-shell">
      <div class="card">
        <h2 class="page-title">Wizard Step 1: Performance Setup</h2>
        <p class="page-description">
          Configure your store's performance baseline and projections for accurate P&L forecasting.
        </p>

        <!-- Prior Year Performance (for existing stores) -->
        <div class="step-section" *ngIf="region">
          <h3>Prior Year Performance</h3>
          <app-prior-year-performance
            [region]="region"
            [storeType]="'existing'"
            [hasOtherIncome]="false"
            [initialData]="priorYearData"
            (dataChange)="onPriorYearDataChange($event)"
            (metricsChange)="onPriorYearMetricsChange($event)">
          </app-prior-year-performance>
        </div>

        <!-- Projected Performance -->
        <div class="step-section">
          <h3>Projected Performance</h3>
          <app-projected-performance
            [region]="region"
            [priorYearMetrics]="priorYearMetrics"
            (projectionChange)="onProjectionChange($event)">
          </app-projected-performance>
        </div>

        <!-- Navigation -->
        <div class="step-nav">
          <button 
            class="btn btn-primary"
            [disabled]="!isFormValid"
            (click)="navigateToStep2()">
            Next → Step 2
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-shell {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .page-title {
      font-family: 'Proxima Nova', Arial, sans-serif;
      font-size: 1.75rem;
      font-weight: 800;
      color: #374151;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.025em;
    }

    .page-description {
      color: #6b7280;
      font-family: 'Proxima Nova', Arial, sans-serif;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    .step-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .step-section h3 {
      font-family: 'Proxima Nova', Arial, sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 1rem 0;
      letter-spacing: -0.025em;
    }

    .step-nav {
      display: flex;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn {
      font-family: 'Proxima Nova', Arial, sans-serif;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(45deg, #1e40af, #3b82f6);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(45deg, #1d4ed8, #2563eb);
      transform: translateY(-1px);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  `]
})
export class Step1PageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private appState = inject(AppStateService);
  private persistence = inject(PersistenceService);
  private router = inject(Router);

  region: Region = 'US';
  priorYearData: PriorYearData = {};
  priorYearMetrics: PriorYearMetrics = {
    taxPrepIncome: 0,
    totalRevenue: 0,
    netIncome: 0,
    discountsPct: 0,
    taxRushIncome: 0
  };
  projectedData: any = {};

  get isFormValid(): boolean {
    // Basic validation - has some prior year data or projected data
    return Object.keys(this.priorYearData).length > 0 || Object.keys(this.projectedData).length > 0;
  }

  ngOnInit(): void {
    // Subscribe to app state for region
    this.appState.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.region = state.region;
    });

    // Load persisted data
    this.loadPersistedData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPersistedData(): void {
    try {
      const persistedData = this.persistence.loadGenericData('priorYear');
      if (persistedData) {
        this.priorYearData = persistedData;
      }

      const projectedData = this.persistence.loadGenericData('projected');
      if (projectedData) {
        this.projectedData = projectedData;
      }
    } catch (error) {
      console.warn('Failed to load Step 1 persisted data:', error);
    }
  }

  onPriorYearDataChange(data: PriorYearData): void {
    this.priorYearData = data;
    this.persistence.saveGenericData('priorYear', data);
    console.log('Step 1: Prior year data updated:', data);
  }

  onPriorYearMetricsChange(metrics: PriorYearMetrics): void {
    this.priorYearMetrics = metrics;
    console.log('Step 1: Prior year metrics updated:', metrics);
  }

  onProjectionChange(projection: any): void {
    this.projectedData = projection;
    this.persistence.saveGenericData('projected', projection);
    console.log('Step 1: Projection data updated:', projection);
  }

  navigateToStep2(): void {
    if (this.isFormValid) {
      this.router.navigate(['/wizard/step-2']);
    }
  }
}
