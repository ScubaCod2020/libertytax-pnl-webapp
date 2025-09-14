// dashboard.component.ts - Main dashboard component with KPIs and expense breakdown
// Based on React app Dashboard component

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiStoplightComponent } from '../kpi-stoplight/kpi-stoplight.component';
import { formatCurrency, formatPercentage, getKPIStatus, getKPIStatusClass } from '../../utils/calculation.utils';

export interface CalculationResults {
  netIncome: number;
  netMarginPct: number;
  costPerReturn: number;
  grossFees: number;
  discounts: number;
  taxPrepIncome: number;
  taxRushIncome: number;
  otherIncome: number;
  totalRevenue: number;
  totalExpenses: number;
  totalReturns: number;
  // Expense breakdown
  salaries: number;
  empDeductions: number;
  rent: number;
  telephone: number;
  utilities: number;
  localAdv: number;
  insurance: number;
  postage: number;
  supplies: number;
  dues: number;
  bankFees: number;
  maintenance: number;
  travelEnt: number;
  royalties: number;
  advRoyalties: number;
  taxRushRoyalties: number;
  misc: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiStoplightComponent],
  template: `
    <div class="card dashboard-card">
      <div class="card-title">Dashboard</div>

      <!-- KPI Section -->
      <div class="kpi-vertical">
        <div class="kpi-item" [ngClass]="getKPIStatusClass(niStatus)">
          <app-kpi-stoplight [active]="niStatus"></app-kpi-stoplight>
          <div class="kpi-content">
            <div class="kpi-label">Net Income</div>
            <div class="kpi-value">{{ formatCurrency(results.netIncome) }}</div>
            <div class="kpi-description">Income − Expenses</div>
          </div>
        </div>

        <div class="kpi-item" [ngClass]="getKPIStatusClass(nimStatus)">
          <app-kpi-stoplight [active]="nimStatus"></app-kpi-stoplight>
          <div class="kpi-content">
            <div class="kpi-label">Net Margin</div>
            <div class="kpi-value">{{ formatPercentage(results.netMarginPct) }}</div>
            <div class="kpi-description">Net Income ÷ Tax-Prep Income</div>
          </div>
        </div>

        <div class="kpi-item" [ngClass]="getKPIStatusClass(cprStatus)">
          <app-kpi-stoplight [active]="cprStatus"></app-kpi-stoplight>
          <div class="kpi-content">
            <div class="kpi-label">Cost / Return</div>
            <div class="kpi-value">{{ formatCurrency(results.costPerReturn) }}</div>
            <div class="kpi-description">Total Expenses ÷ Returns</div>
          </div>
        </div>
      </div>

      <!-- Pro-Tips and Income Summary Grid -->
      <div class="dashboard-grid">
        <!-- Pro-Tips Card -->
        <div class="card pro-tips-card">
          <div class="card-title">Pro-Tips</div>
          <ul class="pro-tips-list">
            <li *ngIf="cprStatus === 'red'">Cost/Return is high — review Personnel and Facility costs.</li>
            <li *ngIf="nimStatus === 'red'">Margin is low — consider raising ANF or reducing discounts.</li>
            <li *ngIf="niStatus === 'red'">Net Income negative — check Franchise fees and Operations costs.</li>
            <li *ngIf="niStatus === 'yellow'">Close to breakeven — small changes in ANF or Returns can flip green.</li>
            <li *ngIf="cprStatus === 'green' && nimStatus === 'green' && niStatus === 'green'">
              Great! Consider "Best" scenario to stress-test capacity.
            </li>
          </ul>
        </div>

        <!-- Income Summary Card -->
        <div class="card income-summary-card">
          <div class="card-title income-title">
            💰 Income Summary
          </div>
          <div class="income-breakdown">
            <!-- Tax Prep Revenue Breakdown -->
            <div class="revenue-section">
              <div class="revenue-line">
                <span>Gross Tax Prep Fees:</span>
                <strong>{{ formatCurrency(results.grossFees) }}</strong>
              </div>
              <div class="revenue-detail">
                <span>Returns: {{ getTaxPrepReturnsCount() }} @ {{ formatCurrency(getAverageNetFee()) }}</span>
              </div>
              <div class="revenue-line discount">
                <span>Less Discounts ({{ getDiscountPercentage() }}%):</span>
                <strong>-{{ formatCurrency(results.discounts) }}</strong>
              </div>
            </div>

            <!-- Tax Prep Net Revenue -->
            <div class="revenue-line net-revenue">
              <span>Tax Prep Net Revenue:</span>
              <strong>{{ formatCurrency(results.taxPrepIncome) }}</strong>
            </div>

            <!-- TaxRush Revenue (if applicable) -->
            <div *ngIf="results.taxRushIncome > 0" class="revenue-line taxrush-revenue">
              <span>TaxRush Revenue:</span>
              <strong>{{ formatCurrency(results.taxRushIncome) }}</strong>
            </div>

            <!-- Other Revenue -->
            <div *ngIf="hasOtherIncome && results.otherIncome > 0" class="revenue-line other-revenue">
              <span>Other Revenue:</span>
              <strong>{{ formatCurrency(results.otherIncome) }}</strong>
            </div>
            
            <!-- Total Gross Revenue -->
            <div class="revenue-line total-revenue">
              <span>Total Gross Revenue:</span>
              <strong>{{ formatCurrency(results.totalRevenue) }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense Breakdown -->
      <div class="expense-breakdown-section">
        <div class="card">
          <div class="card-title expense-title">
            💰 Expense Breakdown
            <span class="expense-total">(Total: {{ formatCurrency(results.totalExpenses) }})</span>
          </div>
          
          <div class="expense-categories">
            <!-- Personnel -->
            <div class="expense-category">
              <div class="category-header">
                👥 Personnel ({{ formatCurrency(results.salaries + results.empDeductions) }} • {{ getPersonnelPercentage() }}%)
              </div>
              <div class="category-details">
                <div>Salaries: {{ formatCurrency(results.salaries) }} ({{ getSalariesPercentage() }}%)</div>
                <div>Emp. Deductions: {{ formatCurrency(results.empDeductions) }} ({{ getEmpDeductionsPercentage() }}%)</div>
              </div>
            </div>

            <!-- Facility -->
            <div class="expense-category">
              <div class="category-header">
                🏢 Facility ({{ formatCurrency(results.rent + results.telephone + results.utilities) }} • {{ getFacilityPercentage() }}%)
              </div>
              <div class="category-details">
                <div>Rent: {{ formatCurrency(results.rent) }} ({{ getRentPercentage() }}%)</div>
                <div>Telephone: {{ formatCurrency(results.telephone) }} ({{ getTelephonePercentage() }}%)</div>
                <div>Utilities: {{ formatCurrency(results.utilities) }} ({{ getUtilitiesPercentage() }}%)</div>
              </div>
            </div>

            <!-- Operations -->
            <div class="expense-category">
              <div class="category-header">
                ⚙️ Operations ({{ formatCurrency(getOperationsTotal()) }} • {{ getOperationsPercentage() }}%)
              </div>
              <div class="category-details">
                <div>Local Advertising: {{ formatCurrency(results.localAdv) }} ({{ getLocalAdvPercentage() }}%)</div>
                <div>Insurance: {{ formatCurrency(results.insurance) }} ({{ getInsurancePercentage() }}%)</div>
                <div>Office Supplies: {{ formatCurrency(results.supplies) }} ({{ getSuppliesPercentage() }}%)</div>
                <div>Other Ops: {{ formatCurrency(getOtherOpsTotal()) }} ({{ getOtherOpsPercentage() }}%)</div>
              </div>
            </div>

            <!-- Franchise -->
            <div class="expense-category">
              <div class="category-header">
                🏪 Franchise ({{ formatCurrency(getFranchiseTotal()) }} • {{ getFranchisePercentage() }}%)
              </div>
              <div class="category-details">
                <div>Tax Prep Royalties: {{ formatCurrency(results.royalties) }} ({{ getRoyaltiesPercentage() }}%)</div>
                <div>Adv. Royalties: {{ formatCurrency(results.advRoyalties) }} ({{ getAdvRoyaltiesPercentage() }}%)</div>
                <div *ngIf="results.taxRushRoyalties > 0">
                  TaxRush Royalties: {{ formatCurrency(results.taxRushRoyalties) }} ({{ getTaxRushRoyaltiesPercentage() }}%)
                </div>
              </div>
            </div>
          </div>

          <!-- Miscellaneous -->
          <div *ngIf="results.misc > 0" class="misc-section">
            <div class="category-header">
              📝 Miscellaneous: {{ formatCurrency(results.misc) }} ({{ getMiscPercentage() }}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-card {
      min-width: 600px;
      width: 100%;
      max-width: 100%;
    }

    .kpi-vertical {
      margin-bottom: 1rem;
    }

    .kpi-item {
      min-height: 60px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }

    .kpi-content {
      flex: 1;
    }

    .kpi-label {
      font-size: 0.9rem;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .kpi-value {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }

    .kpi-description {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .kpi-green {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
    }

    .kpi-yellow {
      background-color: #fffbeb;
      border: 1px solid #fed7aa;
    }

    .kpi-red {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 20px;
      max-width: 100%;
    }

    .pro-tips-card {
      order: 2;
    }

    .income-summary-card {
      order: 1;
    }

    .pro-tips-list {
      font-size: 0.875rem;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .pro-tips-list li {
      margin-bottom: 0.5rem;
      padding-left: 1rem;
      position: relative;
    }

    .pro-tips-list li::before {
      content: "•";
      color: #6b7280;
      position: absolute;
      left: 0;
    }

    .income-title {
      color: #059669;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .income-breakdown {
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .revenue-section {
      margin-bottom: 1rem;
    }

    .revenue-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.3rem;
    }

    .revenue-detail {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.3rem;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .revenue-line.discount {
      color: #dc2626;
    }

    .revenue-line.net-revenue {
      font-weight: bold;
      color: #059669;
      margin-bottom: 0.5rem;
    }

    .revenue-line.taxrush-revenue {
      font-weight: bold;
      color: #0ea5e9;
      margin-bottom: 0.5rem;
    }

    .revenue-line.other-revenue {
      font-weight: bold;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .revenue-line.total-revenue {
      border-top: 2px solid #059669;
      padding-top: 0.75rem;
      margin-top: 1rem;
      font-weight: bold;
      font-size: 1rem;
      color: #059669;
    }

    .expense-breakdown-section {
      margin-top: 16px;
    }

    .expense-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .expense-total {
      font-weight: 400;
      margin-left: 8px;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .expense-categories {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 12px;
      max-width: 100%;
    }

    .expense-category {
      margin-bottom: 1rem;
    }

    .category-header {
      font-size: 14px;
      margin-bottom: 8px;
      font-weight: 600;
      color: #374151;
    }

    .category-details {
      font-size: 0.75rem;
      margin-left: 16px;
      line-height: 1.4;
    }

    .category-details div {
      margin-bottom: 0.25rem;
    }

    .misc-section {
      margin-top: 12px;
    }

    .misc-section .category-header {
      font-size: 14px;
    }
  `]
})
export class DashboardComponent {
  @Input() results!: CalculationResults;
  @Input() hasOtherIncome: boolean = false;

  // KPI Status calculations
  get niStatus() {
    return getKPIStatus('netIncome', this.results.netIncome);
  }

  get nimStatus() {
    return getKPIStatus('netMargin', this.results.netMarginPct);
  }

  get cprStatus() {
    return getKPIStatus('costPerReturn', this.results.costPerReturn);
  }

  // Utility methods
  formatCurrency = formatCurrency;
  formatPercentage = formatPercentage;
  getKPIStatusClass = getKPIStatusClass;

  getTaxPrepReturnsCount(): string {
    const taxRushReturns = this.results.taxRushIncome > 0 ? Math.round(this.results.taxRushIncome / 125) : 0;
    return (this.results.totalReturns - taxRushReturns).toLocaleString();
  }

  getAverageNetFee(): number {
    const taxRushReturns = this.results.taxRushIncome > 0 ? Math.round(this.results.taxRushIncome / 125) : 0;
    const taxPrepReturns = this.results.totalReturns - taxRushReturns;
    return taxPrepReturns > 0 ? Math.round(this.results.grossFees / taxPrepReturns) : 0;
  }

  getDiscountPercentage(): string {
    const percentage = this.results.grossFees > 0 ? (this.results.discounts / this.results.grossFees) * 100 : 0;
    return percentage.toFixed(0);
  }

  getPersonnelPercentage(): string {
    return this.getPercentage(this.results.salaries + this.results.empDeductions);
  }

  getSalariesPercentage(): string {
    return this.getPercentage(this.results.salaries);
  }

  getEmpDeductionsPercentage(): string {
    return this.getPercentage(this.results.empDeductions);
  }

  getFacilityPercentage(): string {
    return this.getPercentage(this.results.rent + this.results.telephone + this.results.utilities);
  }

  getRentPercentage(): string {
    return this.getPercentage(this.results.rent);
  }

  getTelephonePercentage(): string {
    return this.getPercentage(this.results.telephone);
  }

  getUtilitiesPercentage(): string {
    return this.getPercentage(this.results.utilities);
  }

  getOperationsTotal(): number {
    return this.results.localAdv + this.results.insurance + this.results.postage + 
           this.results.supplies + this.results.dues + this.results.bankFees + 
           this.results.maintenance + this.results.travelEnt;
  }

  getOperationsPercentage(): string {
    return this.getPercentage(this.getOperationsTotal());
  }

  getLocalAdvPercentage(): string {
    return this.getPercentage(this.results.localAdv);
  }

  getInsurancePercentage(): string {
    return this.getPercentage(this.results.insurance);
  }

  getSuppliesPercentage(): string {
    return this.getPercentage(this.results.supplies);
  }

  getOtherOpsTotal(): number {
    return this.results.postage + this.results.dues + this.results.bankFees + 
           this.results.maintenance + this.results.travelEnt;
  }

  getOtherOpsPercentage(): string {
    return this.getPercentage(this.getOtherOpsTotal());
  }

  getFranchiseTotal(): number {
    return this.results.royalties + this.results.advRoyalties + this.results.taxRushRoyalties;
  }

  getFranchisePercentage(): string {
    return this.getPercentage(this.getFranchiseTotal());
  }

  getRoyaltiesPercentage(): string {
    return this.getPercentage(this.results.royalties);
  }

  getAdvRoyaltiesPercentage(): string {
    return this.getPercentage(this.results.advRoyalties);
  }

  getTaxRushRoyaltiesPercentage(): string {
    return this.getPercentage(this.results.taxRushRoyalties);
  }

  getMiscPercentage(): string {
    return this.getPercentage(this.results.misc);
  }

  private getPercentage(value: number): string {
    return this.results.totalRevenue > 0 ? ((value / this.results.totalRevenue) * 100).toFixed(1) : '0.0';
  }
}
