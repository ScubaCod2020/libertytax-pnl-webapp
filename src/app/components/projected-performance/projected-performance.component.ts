// projected-performance.component.ts - Prior Year vs Projected performance comparison
// Based on React app ProjectedPerformancePanel component

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatCurrency, formatPercentage, getPerformanceStatus, PerformanceStatus } from '../../utils/calculation.utils';

export interface ProjectedPerformanceData {
  // Projected performance (current inputs)
  grossFees: number;
  discounts: number;
  taxPrepIncome: number;
  taxRushIncome: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  netMarginPct: number;
  costPerReturn: number;
  totalReturns: number;
  region: string;
  
  // Prior Year data (from wizard answers)
  lastYearRevenue?: number;
  lastYearExpenses?: number;
  lastYearReturns?: number;
  expectedGrowthPct?: number;
  handlesTaxRush?: boolean;
}

@Component({
  selector: 'app-projected-performance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card projected-performance-card">
      <div class="card-title performance-title">
        📈 PY Performance
      </div>
      
      <!-- Last Year Performance -->
      <div *ngIf="hasPriorYearData" class="prior-year-section">
        <div class="section-header">
          📅 Last Year Performance
        </div>
        
        <div class="performance-metric" [ngStyle]="getMetricStyle(pyNetMarginStatus)">
          <span class="metric-icon">{{ pyNetMarginStatus.icon }}</span>
          <div class="metric-content">
            <div class="metric-label">PY Net Margin</div>
            <div class="metric-value" [style.color]="pyNetMarginStatus.color">
              {{ formatPercentage(pyNetMarginPct) }}
            </div>
          </div>
        </div>

        <div class="performance-metric" [ngStyle]="getMetricStyle(pyCostPerReturnStatus)">
          <span class="metric-icon">{{ pyCostPerReturnStatus.icon }}</span>
          <div class="metric-content">
            <div class="metric-label">PY Cost / Return</div>
            <div class="metric-value" [style.color]="pyCostPerReturnStatus.color">
              {{ formatCurrency(pyCostPerReturn) }}
            </div>
          </div>
        </div>
        
        <div class="prior-year-details">
          <div>Revenue: {{ formatCurrency(data.lastYearRevenue || 0) }}</div>
          <div>Expenses: {{ formatCurrency(data.lastYearExpenses || 0) }}</div>
          <div>Returns: {{ (data.lastYearReturns || 0).toLocaleString() }}</div>
        </div>
      </div>

      <!-- No Prior Year Data Message -->
      <div *ngIf="!hasPriorYearData" class="no-data-message">
        <div class="no-data-icon">📊</div>
        <div class="no-data-text">
          <strong>No Prior Year Data</strong>
          <p>Complete the wizard to set up your performance targets and start tracking.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .projected-performance-card {
      min-width: 300px;
      max-width: 350px;
    }

    .performance-title {
      color: #0369a1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .prior-year-section {
      margin-bottom: 1rem;
    }

    .section-header {
      font-weight: bold;
      font-size: 0.9rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 0.25rem;
    }

    .performance-metric {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem;
      border-radius: 6px;
      margin-bottom: 0.4rem;
    }

    .metric-icon {
      font-size: 1rem;
    }

    .metric-content {
      flex: 1;
    }

    .metric-label {
      font-size: 0.8rem;
      color: #374151;
      font-weight: 500;
    }

    .metric-value {
      font-size: 0.9rem;
      font-weight: bold;
    }

    .prior-year-details {
      font-size: 0.75rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .prior-year-details div {
      margin-bottom: 0.25rem;
    }

    .no-data-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2rem 1rem;
      color: #6b7280;
    }

    .no-data-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .no-data-text strong {
      display: block;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .no-data-text p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }
  `]
})
export class ProjectedPerformanceComponent {
  @Input() data!: ProjectedPerformanceData;

  // Prior year calculations
  get pyNetIncome(): number {
    return (this.data.lastYearRevenue || 0) - (this.data.lastYearExpenses || 0);
  }

  get pyNetMarginPct(): number {
    const revenue = this.data.lastYearRevenue || 0;
    return revenue > 0 ? (this.pyNetIncome / revenue) * 100 : 0;
  }

  get pyCostPerReturn(): number {
    const returns = this.data.lastYearReturns || 0;
    return returns > 0 ? (this.data.lastYearExpenses || 0) / returns : 0;
  }

  // Performance status indicators
  get pyNetMarginStatus(): PerformanceStatus {
    return getPerformanceStatus('netMargin', this.pyNetMarginPct);
  }

  get pyCostPerReturnStatus(): PerformanceStatus {
    return getPerformanceStatus('costPerReturn', this.pyCostPerReturn);
  }

  get hasPriorYearData(): boolean {
    return (this.data.lastYearRevenue || 0) > 0 && (this.data.lastYearExpenses || 0) > 0;
  }

  // Utility methods
  formatCurrency = formatCurrency;
  formatPercentage = formatPercentage;

  getMetricStyle(status: PerformanceStatus): any {
    return {
      backgroundColor: `${status.color}15`,
      border: `1px solid ${status.color}`
    };
  }
}
