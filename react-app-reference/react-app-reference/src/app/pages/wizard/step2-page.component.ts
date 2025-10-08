import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ExpensesComponent } from '../../components/expenses/expenses.component';
import { AppStateService } from '../../services/app-state.service';
import { PersistenceService } from '../../services/persistence.service';
import { Region } from '../../models/wizard.models';

@Component({
  selector: 'app-step2-page',
  standalone: true,
  imports: [CommonModule, ExpensesComponent],
  template: `
    <div class="page-shell">
      <div class="card">
        <h2 class="page-title">Wizard Step 2: Expense Management</h2>
        <p class="page-description">
          Configure your operating expenses using our dual-entry system. Each expense can be set as a percentage of revenue or fixed dollar amount.
        </p>

        <!-- Performance Targets Info Tiles -->
        <div class="info-tiles" *ngIf="projectedData">
          <div class="info-tile">
            <div class="tile-label">Revenue Target</div>
            <div class="tile-value">{{ formatCurrency(projectedData.targetRevenue || 0) }}</div>
          </div>
          <div class="info-tile">
            <div class="tile-label">Net Tax Income</div>
            <div class="tile-value">{{ formatCurrency(projectedData.netTaxIncome || 0) }}</div>
          </div>
          <div class="info-tile">
            <div class="tile-label">Target Returns</div>
            <div class="tile-value">{{ projectedData.targetReturns || 0 | number }}</div>
          </div>
        </div>

        <!-- Expenses Management -->
        <div class="step-section">
          <h3>Operating Expenses</h3>
          <app-expenses
            [region]="region"
            [mode]="'wizard'"
            [storeType]="'existing'"
            [bases]="expensesBases"
            (expensesState)="onExpensesStateChange($event)">
          </app-expenses>
        </div>

        <!-- Navigation -->
        <div class="step-nav">
          <button 
            class="btn btn-secondary"
            (click)="navigateToStep1()">
            ← Back
          </button>
          <button 
            class="btn btn-primary"
            [disabled]="!isFormValid"
            (click)="navigateToReports()">
            Next → Reports
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-shell {
      max-width: 1200px;
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

    .info-tiles {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .info-tile {
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border: 2px solid #22c55e;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }

    .tile-label {
      font-family: 'Proxima Nova', Arial, sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .tile-value {
      font-family: 'Proxima Nova', Arial, sans-serif;
      font-size: 1.25rem;
      font-weight: 800;
      color: #1f2937;
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
      justify-content: space-between;
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

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .ready-indicator {
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border: 2px solid #22c55e;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
      text-align: center;
      color: #059669;
      font-weight: 600;
    }
  `]
})
export class Step2PageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private appState = inject(AppStateService);
  private persistence = inject(PersistenceService);
  private router = inject(Router);

  region: Region = 'US';
  projectedData: any = {};
  expensesData: any = {};
  
  get expensesBases() {
    // Calculate bases from projected data
    const netTaxIncome = this.projectedData?.netTaxIncome || 0;
    const targetRevenue = this.projectedData?.targetRevenue || 0;
    
    return {
      grossRevenue: targetRevenue,
      netRevenue: netTaxIncome,
      taxPrepIncome: netTaxIncome * 0.85, // Estimate
      totalReturns: this.projectedData?.targetReturns || 0
    };
  }

  get isFormValid(): boolean {
    return Object.keys(this.expensesData).length > 0;
  }

  ngOnInit(): void {
    // Check if we have prior year data, if not redirect to step 1
    this.checkPriorYearData();

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

  private checkPriorYearData(): void {
    const priorYear = this.persistence.loadGenericData('priorYear');
    const projected = this.persistence.loadGenericData('projected');
    
    if (!priorYear && !projected) {
      // Show toast and redirect
      this.showToast('Please complete Step 1 first');
      this.router.navigate(['/wizard/step-1']);
    }
  }

  private loadPersistedData(): void {
    try {
      const projectedData = this.persistence.loadGenericData('projected');
      if (projectedData) {
        this.projectedData = projectedData;
      }

      const expensesData = this.persistence.loadGenericData('expenses');
      if (expensesData) {
        this.expensesData = expensesData;
      }
    } catch (error) {
      console.warn('Failed to load Step 2 persisted data:', error);
    }
  }

  private showToast(message: string): void {
    // Simple toast implementation - you could use a proper toast service
    alert(message);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  onExpensesStateChange(expensesState: any): void {
    this.expensesData = expensesState;
    this.persistence.saveGenericData('expenses', expensesState);
    console.log('Step 2: Expenses data updated:', expensesState);
  }

  navigateToStep1(): void {
    this.router.navigate(['/wizard/step-1']);
  }

  navigateToReports(): void {
    if (this.isFormValid) {
      this.router.navigate(['/wizard/step-3/reports']);
    }
  }
}
