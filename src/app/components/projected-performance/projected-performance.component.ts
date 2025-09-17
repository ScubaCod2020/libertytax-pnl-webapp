// projected-performance.component.ts - Prior Year vs Projected performance comparison
// Based on React app ProjectedPerformancePanel component

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { formatCurrency, formatPercentage, getPerformanceStatus, PerformanceStatus } from '../../utils/calculation.utils';

export interface PriorYearSnapshot {
  lastYearRevenue: number;
  lastYearExpenses: number;
  lastYearReturns: number;
  avgNetFee: number;
}

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
  avgNetFee?: number;
  expectedGrowthPct?: number;
  handlesTaxRush?: boolean;
}

export interface PriorYearMetrics {
  taxPrepIncome: number;
  totalRevenue: number;
  netIncome: number;
  discountsPct: number;
  taxRushIncome: number;
}

@Component({
  selector: 'app-projected-performance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
export class ProjectedPerformanceComponent implements OnInit {
  @Input() region: string = 'US';
  @Input() priorYearMetrics?: PriorYearMetrics;
  @Input() data?: Partial<PriorYearSnapshot>;
  @Output() projectionChange = new EventEmitter<any>();

  projectedForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.projectedForm = this.fb.group({
      scenario: ['good'],
      growthDelta: [1],
      applyToReturns: [true],
      applyToAvgFee: [false],
      targetReturns: [1600],
      avgNetFee: [125]
    });
  }

  ngOnInit() {
    this.projectedForm.valueChanges.subscribe(value => {
      const projectionData = {
        ...value,
        calculatedRevenue: this.calculatedRevenue,
        calculatedReturns: this.calculatedReturns,
        calculatedAvgFee: this.calculatedAvgFee,
        calculatedGrowthRate: this.calculatedGrowthRate
      };
      this.projectionChange.emit(projectionData);
    });
  }

  get growthDelta(): number {
    return this.projectedForm.get('growthDelta')?.value || 0;
  }

  get calculatedRevenue(): number {
    return this.calculatedReturns * this.calculatedAvgFee;
  }

  get calculatedReturns(): number {
    const baseReturns = this.projectedForm.get('targetReturns')?.value || 1600;
    if (this.projectedForm.get('applyToReturns')?.value) {
      return baseReturns * (1 + this.growthDelta / 100);
    }
    return baseReturns;
  }

  get calculatedAvgFee(): number {
    const baseAvgFee = this.projectedForm.get('avgNetFee')?.value || 125;
    if (this.projectedForm.get('applyToAvgFee')?.value) {
      return baseAvgFee * (1 + this.growthDelta / 100);
    }
    return baseAvgFee;
  }

  get calculatedGrowthRate(): number {
    return this.growthDelta;
  }

  getMinDelta(): number {
    const scenario = this.projectedForm.get('scenario')?.value;
    switch (scenario) {
      case 'good': return 0;
      case 'better': return 2;
      case 'best': return 5;
      default: return 0;
    }
  }

  getMaxDelta(): number {
    const scenario = this.projectedForm.get('scenario')?.value;
    switch (scenario) {
      case 'good': return 2;
      case 'better': return 5;
      case 'best': return 8;
      default: return 10;
    }
  }

  private get _d(): Required<PriorYearSnapshot> {
    const d = this.data ?? {};
    return {
      lastYearRevenue: d.lastYearRevenue ?? 0,
      lastYearExpenses: d.lastYearExpenses ?? 0,
      lastYearReturns: d.lastYearReturns ?? 0,
      avgNetFee: d.avgNetFee ?? 0,
    };
  }

  // Prior year calculations
  get pyNetIncome(): number {
    return this._d.lastYearRevenue - this._d.lastYearExpenses;
  }

  get pyNetMarginPct(): number {
    return this._d.lastYearRevenue > 0 ? (this.pyNetIncome / this._d.lastYearRevenue) * 100 : 0;
  }

  get pyCostPerReturn(): number {
    return this._d.lastYearReturns > 0 ? this._d.lastYearExpenses / this._d.lastYearReturns : 0;
  }

  // Performance status indicators
  get pyNetMarginStatus(): PerformanceStatus {
    return getPerformanceStatus('netMargin', this.pyNetMarginPct);
  }

  get pyCostPerReturnStatus(): PerformanceStatus {
    return getPerformanceStatus('costPerReturn', this.pyCostPerReturn);
  }

  get hasPriorYearData(): boolean {
    return this._d.lastYearRevenue > 0 && this._d.lastYearExpenses > 0;
  }

  // Utility methods (single declaration)
  formatCurrency = formatCurrency;
  formatPercentage = formatPercentage;

  getMetricStyle(status: PerformanceStatus): any {
    return {
      backgroundColor: `${status.color}15`,
      border: `1px solid ${status.color}`
    };
  }
}
