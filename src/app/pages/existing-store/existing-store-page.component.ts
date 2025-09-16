// existing-store-page.component.ts - Shell component for Existing Store analysis
// Integrates IncomeDriversComponent and ExpensesComponent with normalized summary

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { IncomeDriversComponent } from '../../components/income-drivers/income-drivers.component';
import { ExpensesComponent, ExpensesState, ExpenseBases } from '../../components/expenses/expenses.component';
import { DashboardComponent } from '../../components/dashboard/dashboard.component';
import { Region } from '../../models/wizard.models';

// Interface for IncomeDriverData (matching IncomeDriversComponent)
interface IncomeDriverData {
  avgNetFee: number;
  taxPrepReturns: number;
  taxRushReturns: number;
  discountsPct: number;
  otherIncome: number;
  handlesTaxRush: boolean;
  hasOtherIncome: boolean;
}

// Interface for calculated revenue values from IncomeDriversComponent
interface CalculatedRevenue {
  grossFees: number;
  discounts: number;
  taxPrepIncome: number;
  taxRushIncome: number;
  otherIncome: number;
  totalRevenue: number;
}

// Normalized summary object for Dashboard consumption
export interface ExistingStoreSummary {
  // Revenue Summary
  revenue: {
    grossFees: number;
    discounts: number;
    taxPrepIncome: number;
    taxRushIncome: number;
    otherIncome: number;
    totalRevenue: number;
  };
  
  // Expense Summary
  expenses: {
    items: Array<{
      fieldId: string;
      amount: number;
      pct: number;
    }>;
    totalExpenses: number;
    valid: boolean;
  };
  
  // Key Performance Indicators
  kpis: {
    netIncome: number;
    netMarginPct: number;
    costPerReturn: number;
    totalReturns: number;
  };
  
  // Form State
  formState: {
    incomeDrivers: IncomeDriverData;
    expensesValid: boolean;
    dataComplete: boolean;
  };
}

@Component({
  selector: 'app-existing-store-page',
  standalone: true,
  imports: [CommonModule, IncomeDriversComponent, ExpensesComponent, DashboardComponent],
  template: `
    <div class="existing-store-container">
      <!-- Page Header -->
      <div class="page-header">
        <h2 class="page-title">📊 Existing Store Analysis</h2>
        <p class="page-description">
          Analyze your current store performance by configuring income drivers and expense categories.
          All calculations are performed in real-time to provide immediate insights.
        </p>
      </div>

      <!-- Two-Column Layout -->
      <div class="analysis-grid">
        <!-- Left Column: Income Drivers -->
        <div class="drivers-section">
          <app-income-drivers
            [region]="region"
            [initialData]="initialIncomeData"
            [handlesTaxRush]="handlesTaxRush"
            [hasOtherIncome]="hasOtherIncome"
            (dataChange)="onIncomeDriversChange($event)"
            (calculatedValues)="onCalculatedValuesChange($event)">
          </app-income-drivers>
        </div>

        <!-- Right Column: Expenses -->
        <div class="expenses-section">
          <app-expenses
            mode="existing-store"
            [region]="region"
            [storeType]="storeType"
            [bases]="expenseBases"
            (expensesState)="onExpensesStateChange($event)">
          </app-expenses>
        </div>
      </div>

      <!-- Summary Dashboard (if data is complete) -->
      <div *ngIf="summary.formState.dataComplete" class="summary-section">
        <div class="summary-header">
          <h3>📈 Performance Summary</h3>
          <div class="data-status" 
               [class.valid]="summary.formState.expensesValid"
               [class.invalid]="!summary.formState.expensesValid">
            {{ summary.formState.expensesValid ? '✅ Data Valid' : '⚠️ Review Required' }}
          </div>
        </div>

        <!-- Dashboard KPIs -->
        <app-dashboard [summaryData]="summary"></app-dashboard>

        <!-- Additional Metrics -->
        <div class="metrics-row">
          <div class="metric-item">
            <span class="metric-label">Cost per Return:</span>
            <span class="metric-value" [class]="getCostPerReturnClass()">
              {{ formatCurrency(summary.kpis.costPerReturn) }}
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Total Returns:</span>
            <span class="metric-value">{{ formatNumber(summary.kpis.totalReturns) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .existing-store-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .page-title {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1.75rem;
      font-weight: 600;
    }

    .page-description {
      color: #6b7280;
      font-size: 1rem;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .drivers-section,
    .expenses-section {
      min-height: 400px;
    }

    .summary-section {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .summary-header h3 {
      margin: 0;
      color: #374151;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .data-status {
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
    }

    .data-status.valid {
      background: #d1fae5;
      color: #047857;
    }

    .data-status.invalid {
      background: #fef3c7;
      color: #92400e;
    }

    .kpi-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 1rem;
      text-align: center;
    }

    .kpi-card.revenue {
      border-left: 4px solid #059669;
    }

    .kpi-card.expenses {
      border-left: 4px solid #dc2626;
    }

    .kpi-card.net-income.positive {
      border-left: 4px solid #059669;
    }

    .kpi-card.net-income.negative {
      border-left: 4px solid #dc2626;
    }

    .kpi-card.margin.good {
      border-left: 4px solid #059669;
    }

    .kpi-card.margin.fair {
      border-left: 4px solid #d97706;
    }

    .kpi-card.margin.poor {
      border-left: 4px solid #dc2626;
    }

    .kpi-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .kpi-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
    }

    .metrics-row {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 1rem 0;
      background: #f9fafb;
      border-radius: 6px;
    }

    .metric-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .metric-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .metric-value {
      font-size: 1rem;
      font-weight: 500;
      color: #374151;
    }

    .metric-value.good {
      color: #059669;
    }

    .metric-value.fair {
      color: #d97706;
    }

    .metric-value.poor {
      color: #dc2626;
    }

    @media (max-width: 1024px) {
      .analysis-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .kpi-cards {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
    }

    @media (max-width: 640px) {
      .existing-store-container {
        padding: 1rem;
      }

      .kpi-cards {
        grid-template-columns: 1fr;
      }

      .metrics-row {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class ExistingStorePageComponent implements OnInit, OnDestroy {
  @Input() region: Region = 'US';
  @Input() storeType?: string;
  @Input() handlesTaxRush: boolean = false;
  @Input() hasOtherIncome: boolean = false;
  @Input() initialIncomeData: Partial<IncomeDriverData> = {};
  @Input() priorYearData?: any; // For future use with prior year baseline

  @Output() summaryChange = new EventEmitter<ExistingStoreSummary>();

  private destroy$ = new Subject<void>();

  // Internal state
  currentIncomeDrivers: IncomeDriverData = {
    avgNetFee: 0,
    taxPrepReturns: 0,
    taxRushReturns: 0,
    discountsPct: 0,
    otherIncome: 0,
    handlesTaxRush: false,
    hasOtherIncome: false
  };

  currentCalculatedRevenue: CalculatedRevenue = {
    grossFees: 0,
    discounts: 0,
    taxPrepIncome: 0,
    taxRushIncome: 0,
    otherIncome: 0,
    totalRevenue: 0
  };

  currentExpensesState: ExpensesState = {
    items: [],
    total: 0,
    valid: true
  };

  // Computed properties
  get expenseBases(): ExpenseBases {
    return {
      grossFees: this.currentCalculatedRevenue.grossFees,
      taxPrepIncome: this.currentCalculatedRevenue.taxPrepIncome,
      salaries: this.calculateSalariesBase()
    };
  }

  get summary(): ExistingStoreSummary {
    return this.generateSummary();
  }

  constructor() {}

  ngOnInit(): void {
    // Initialize with any provided initial data
    if (this.initialIncomeData) {
      this.currentIncomeDrivers = { ...this.currentIncomeDrivers, ...this.initialIncomeData };
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Event Handlers
  onIncomeDriversChange(data: IncomeDriverData): void {
    this.currentIncomeDrivers = data;
    this.updateSummaryAndEmit();
  }

  onCalculatedValuesChange(calculated: CalculatedRevenue): void {
    this.currentCalculatedRevenue = calculated;
    this.updateSummaryAndEmit();
  }

  onExpensesStateChange(state: ExpensesState): void {
    this.currentExpensesState = state;
    this.updateSummaryAndEmit();
  }

  // Private calculation methods (no math in template)
  private calculateSalariesBase(): number {
    // Find salaries in expenses to calculate employee deductions base
    const salariesItem = this.currentExpensesState.items.find(item => item.fieldId === 'salariesPct');
    return salariesItem ? salariesItem.amount : 0;
  }

  private generateSummary(): ExistingStoreSummary {
    const netIncome = this.currentCalculatedRevenue.totalRevenue - this.currentExpensesState.total;
    const netMarginPct = this.currentCalculatedRevenue.totalRevenue > 0 
      ? (netIncome / this.currentCalculatedRevenue.totalRevenue) * 100 
      : 0;
    const totalReturns = this.currentIncomeDrivers.taxPrepReturns + this.currentIncomeDrivers.taxRushReturns;
    const costPerReturn = totalReturns > 0 ? this.currentExpensesState.total / totalReturns : 0;

    return {
      revenue: {
        grossFees: this.currentCalculatedRevenue.grossFees,
        discounts: this.currentCalculatedRevenue.discounts,
        taxPrepIncome: this.currentCalculatedRevenue.taxPrepIncome,
        taxRushIncome: this.currentCalculatedRevenue.taxRushIncome,
        otherIncome: this.currentCalculatedRevenue.otherIncome,
        totalRevenue: this.currentCalculatedRevenue.totalRevenue
      },
      expenses: {
        items: this.currentExpensesState.items.map(item => ({
          fieldId: item.fieldId,
          amount: item.amount,
          pct: item.pct
        })),
        totalExpenses: this.currentExpensesState.total,
        valid: this.currentExpensesState.valid
      },
      kpis: {
        netIncome,
        netMarginPct,
        costPerReturn,
        totalReturns
      },
      formState: {
        incomeDrivers: this.currentIncomeDrivers,
        expensesValid: this.currentExpensesState.valid,
        dataComplete: this.hasMinimumData()
      }
    };
  }

  private hasMinimumData(): boolean {
    return this.currentIncomeDrivers.avgNetFee > 0 && 
           this.currentIncomeDrivers.taxPrepReturns > 0 && 
           this.currentExpensesState.items.length > 0;
  }

  private updateSummaryAndEmit(): void {
    const summary = this.generateSummary();
    this.summaryChange.emit(summary);
  }

  // Template helper methods (formatting only, no calculations)
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getNetIncomeClass(): string {
    return this.summary.kpis.netIncome >= 0 ? 'positive' : 'negative';
  }

  getMarginClass(): string {
    const margin = this.summary.kpis.netMarginPct;
    if (margin >= 20) return 'good';
    if (margin >= 10) return 'fair';
    return 'poor';
  }

  getCostPerReturnClass(): string {
    const cpr = this.summary.kpis.costPerReturn;
    if (cpr <= 85) return 'good';
    if (cpr <= 100) return 'fair';
    return 'poor';
  }
}
