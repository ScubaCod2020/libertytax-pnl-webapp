import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DashboardComponent } from '../../components/dashboard/dashboard.component';
import { AppStateService } from '../../services/app-state.service';
import { PersistenceService } from '../../services/persistence.service';
import { buildSummary } from '../../utils/calculation.utils';
import { ExistingStoreSummary } from '../../models/calculation.models';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, DashboardComponent],
  template: `
    <div class="page-shell">
      <div class="dashboard-header">
        <h1 class="page-title">P&L Dashboard</h1>
        <p class="page-description">
          Real-time view of your store's performance metrics and key indicators.
        </p>
      </div>

      <div class="dashboard-content">
        <app-dashboard
          [summaryData]="summaryData">
        </app-dashboard>
      </div>
    </div>
  `,
  styles: [`
    .page-shell {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
      background: #f8fafc;
      min-height: calc(100vh - 120px);
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .page-title {
      font-family: 'Proxima Nova', Arial, sans-serif;
      font-size: 2rem;
      font-weight: 800;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.025em;
      line-height: 1.2;
    }

    .page-description {
      color: #6b7280;
      font-family: 'Proxima Nova', Arial, sans-serif;
      font-weight: 400;
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .dashboard-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private appState = inject(AppStateService);
  private persistence = inject(PersistenceService);

  summaryData?: ExistingStoreSummary;

  ngOnInit(): void {
    // Build summary from persisted data
    this.buildSummaryFromPersistedData();

    // Subscribe to app state changes for live updates
    this.appState.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      // Rebuild summary when state changes
      this.buildSummaryFromState(state);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildSummaryFromPersistedData(): void {
    try {
      const priorYear = this.persistence.loadGenericData('priorYear') || {};
      const projected = this.persistence.loadGenericData('projected') || {};
      const expenses = this.persistence.loadGenericData('expenses') || {};

      this.summaryData = buildSummary(priorYear, projected, expenses);
      console.log('Dashboard: Built summary from persisted data:', this.summaryData);
    } catch (error) {
      console.warn('Dashboard: Failed to build summary from persisted data:', error);
      this.summaryData = this.getEmptySummary();
    }
  }

  private buildSummaryFromState(state: any): void {
    try {
      // Extract relevant data from app state
      const stateData = {
        totalRevenue: state.avgNetFee * state.taxPrepReturns,
        totalExpenses: state.totalExpenses || 0,
        netIncome: (state.avgNetFee * state.taxPrepReturns) - (state.totalExpenses || 0)
      };

      // If we don't have complete persisted data, use state
      if (!this.summaryData || !this.summaryData.totalRevenue) {
        this.summaryData = {
          ...this.getEmptySummary(),
          ...stateData
        };
      }
    } catch (error) {
      console.warn('Dashboard: Failed to build summary from state:', error);
    }
  }

  private getEmptySummary(): ExistingStoreSummary {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      netMarginPct: 0,
      taxPrepIncome: 0,
      taxRushIncome: 0,
      otherIncome: 0,
      discounts: 0,
      expensesByCategory: {
        personnel: 0,
        facility: 0,
        operations: 0,
        franchise: 0,
        misc: 0
      }
    };
  }
}
