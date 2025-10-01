import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';

// Define data interfaces for the component
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

export interface PerformanceStatus {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'neutral';
  color: string;
  icon: string;
}

@Component({
  selector: 'app-projected-performance-panel',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="performance-panel">
      <div class="panel-header">
        <span class="panel-icon">📈</span>
        <span class="panel-title">PY Performance</span>
      </div>

      <!-- Last Year Performance Section -->
      <div 
        *ngIf="showPriorYearData"
        class="prior-year-section"
      >
        <div class="section-header">
          📅 Last Year Performance
        </div>

        <!-- Prior Year Net Margin -->
        <div 
          class="metric-card"
          [style.background-color]="pyNetMarginStatus.color + '15'"
          [style.border-color]="pyNetMarginStatus.color"
        >
          <span class="metric-icon">{{ pyNetMarginStatus.icon }}</span>
          <div class="metric-content">
            <div class="metric-label">PY Net Margin</div>
            <div 
              class="metric-value"
              [style.color]="pyNetMarginStatus.color"
            >
              {{ pyNetMarginPct | number:'1.1-1' }}%
            </div>
          </div>
        </div>

        <!-- Prior Year Cost Per Return -->
        <div 
          class="metric-card"
          [style.background-color]="pyCostPerReturnStatus.color + '15'"
          [style.border-color]="pyCostPerReturnStatus.color"
        >
          <span class="metric-icon">{{ pyCostPerReturnStatus.icon }}</span>
          <div class="metric-content">
            <div class="metric-label">PY Cost / Return</div>
            <div 
              class="metric-value"
              [style.color]="pyCostPerReturnStatus.color"
            >
              {{ pyCostPerReturn | currency }}
            </div>
          </div>
        </div>

        <!-- Prior Year Summary Details -->
        <div class="summary-details">
          <div class="detail-row">Revenue: {{ data.lastYearRevenue | currency }}</div>
          <div class="detail-row">Expenses: {{ data.lastYearExpenses | currency }}</div>
          <div class="detail-row">Returns: {{ data.lastYearReturns | number }}</div>
        </div>
      </div>

      <!-- Future Enhancement Placeholder -->
      <!-- 
      TODO: FUTURE ENHANCEMENT - Projected Performance Goals Section
      
      When transitioning from forecasting to tracking mode, restore this section:
      - Target Net Margin (Reference) with calculated projections
      - Target Cost/Return (Reference) with performance targets  
      - Performance Change display from Page 1 expectedGrowthPct
      - Static reference metrics for PY vs Projected vs Actual comparisons
      
      This will be valuable when users start entering actual numbers to compare
      against their forecasted targets and see performance variance.
      -->
    </div>
  `,
  styles: [`
    .performance-panel {
      min-width: 300px;
      max-width: 350px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1rem;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #0369a1;
      margin-bottom: 1rem;
    }

    .panel-icon {
      font-size: 1.2rem;
    }

    .panel-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
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

    .metric-card {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem;
      border: 1px solid;
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
      margin-bottom: 0.25rem;
    }

    .metric-value {
      font-size: 0.9rem;
      font-weight: bold;
    }

    .summary-details {
      font-size: 0.75rem;
      color: #6b7280;
      line-height: 1.4;
      margin-bottom: 0.5rem;
    }

    .detail-row {
      margin-bottom: 0.1rem;
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
      .performance-panel {
        min-width: auto;
        max-width: none;
      }
    }
  `]
})
export class ProjectedPerformancePanelComponent {
  @Input() data!: ProjectedPerformanceData;

  // Calculate prior year metrics
  get pyNetIncome(): number {
    return (this.data.lastYearRevenue || 0) - (this.data.lastYearExpenses || 0);
  }

  get pyNetMarginPct(): number {
    const revenue = this.data.lastYearRevenue || 0;
    return revenue > 0 ? (this.pyNetIncome / revenue) * 100 : 0;
  }

  get pyCostPerReturn(): number {
    const returns = this.data.lastYearReturns || 0;
    const expenses = this.data.lastYearExpenses || 0;
    return returns > 0 ? expenses / returns : 0;
  }

  get showPriorYearData(): boolean {
    return (this.data.lastYearRevenue || 0) > 0 && (this.data.lastYearExpenses || 0) > 0;
  }

  // Performance status calculation
  get pyNetMarginStatus(): PerformanceStatus {
    return this.getPerformanceStatus('netMargin', this.pyNetMarginPct);
  }

  get pyCostPerReturnStatus(): PerformanceStatus {
    return this.getPerformanceStatus('costPerReturn', this.pyCostPerReturn);
  }

  private getPerformanceStatus(metric: string, value: number): PerformanceStatus {
    switch (metric) {
      case 'netMargin':
        if (value >= 20) return { status: 'excellent', color: '#059669', icon: '🎯' };
        if (value >= 15) return { status: 'good', color: '#0369a1', icon: '✅' };
        if (value >= 10) return { status: 'fair', color: '#d97706', icon: '⚠️' };
        return { status: 'poor', color: '#dc2626', icon: '🚨' };

      case 'costPerReturn':
        if (value <= 85) return { status: 'excellent', color: '#059669', icon: '🎯' };
        if (value <= 100) return { status: 'good', color: '#0369a1', icon: '✅' };
        if (value <= 120) return { status: 'fair', color: '#d97706', icon: '⚠️' };
        return { status: 'poor', color: '#dc2626', icon: '🚨' };

      default:
        return { status: 'neutral', color: '#6b7280', icon: '📊' };
    }
  }
}
