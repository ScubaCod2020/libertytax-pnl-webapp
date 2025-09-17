// dashboard.component.ts - Main dashboard component with KPIs and expense breakdown
// Updated to consume live data from ExistingStoreSummary via KpiService adapter

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiStoplightComponent } from '../kpi-stoplight/kpi-stoplight.component';
import { formatCurrency, formatPercentage, getKPIStatus, getKPIStatusClass } from '../../utils/calculation.utils';
import { KpiService } from '../../services/kpi.service';
import { ExistingStoreSummary } from '../../pages/existing-store/existing-store-page.component';

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
      <div *ngIf="summaryData; else noDataTemplate" class="kpi-vertical">
        <div class="kpi-item" [ngClass]="getKPIStatusClass(revenueStatus)">
          <app-kpi-stoplight [active]="revenueStatus"></app-kpi-stoplight>
          <div class="kpi-content">
            <div class="kpi-label">Revenue</div>
            <div class="kpi-value">{{ formatCurrency(currentResults.totalRevenue) }}</div>
            <div class="kpi-description">Total Income</div>
          </div>
        </div>

        <div class="kpi-item" [ngClass]="getKPIStatusClass(expensesStatus)">
          <app-kpi-stoplight [active]="expensesStatus"></app-kpi-stoplight>
          <div class="kpi-content">
            <div class="kpi-label">Expenses</div>
            <div class="kpi-value">{{ formatCurrency(currentResults.totalExpenses) }}</div>
            <div class="kpi-description">Total Costs</div>
          </div>
        </div>

        <div class="kpi-item" [ngClass]="getKPIStatusClass(niStatus)">
          <app-kpi-stoplight [active]="niStatus"></app-kpi-stoplight>
          <div class="kpi-content">
            <div class="kpi-label">Net</div>
            <div class="kpi-value">{{ formatCurrency(currentResults.netIncome) }}</div>
            <div class="kpi-description">Revenue − Expenses</div>
          </div>
        </div>

        <div class="kpi-item" [ngClass]="getKPIStatusClass(nimStatus)">
          <app-kpi-stoplight [active]="nimStatus"></app-kpi-stoplight>
          <div class="kpi-content">
            <div class="kpi-label">Margin %</div>
            <div class="kpi-value">{{ formatPercentage(currentResults.netMarginPct) }}</div>
            <div class="kpi-description">Net ÷ Revenue × 100</div>
          </div>
        </div>
      </div>

      <!-- Category Breakdown Cards -->
      <div class="category-cards-grid">
        <div class="category-card personnel" [class]="getCategoryStatusClass('personnel')">
          <div class="category-header">
            <span class="category-icon">👥</span>
            <span class="category-name">Personnel</span>
          </div>
          <div class="category-amount">{{ formatCurrency(getPersonnelTotal()) }}</div>
          <div class="category-percentage">{{ getCategoryPercentage('personnel') }}% of revenue</div>
        </div>

        <div class="category-card facility" [class]="getCategoryStatusClass('facility')">
          <div class="category-header">
            <span class="category-icon">🏢</span>
            <span class="category-name">Facility</span>
          </div>
          <div class="category-amount">{{ formatCurrency(getFacilityTotal()) }}</div>
          <div class="category-percentage">{{ getCategoryPercentage('facility') }}% of revenue</div>
        </div>

        <div class="category-card operations" [class]="getCategoryStatusClass('operations')">
          <div class="category-header">
            <span class="category-icon">⚙️</span>
            <span class="category-name">Operations</span>
          </div>
          <div class="category-amount">{{ formatCurrency(getOperationsTotal()) }}</div>
          <div class="category-percentage">{{ getCategoryPercentage('operations') }}% of revenue</div>
        </div>

        <div class="category-card franchise" [class]="getCategoryStatusClass('franchise')">
          <div class="category-header">
            <span class="category-icon">🏪</span>
            <span class="category-name">Franchise</span>
          </div>
          <div class="category-amount">{{ formatCurrency(getFranchiseTotal()) }}</div>
          <div class="category-percentage">{{ getCategoryPercentage('franchise') }}% of revenue</div>
        </div>

        <div class="category-card misc" [class]="getCategoryStatusClass('misc')">
          <div class="category-header">
            <span class="category-icon">📝</span>
            <span class="category-name">Miscellaneous</span>
          </div>
          <div class="category-amount">{{ formatCurrency(getMiscTotal()) }}</div>
          <div class="category-percentage">{{ getCategoryPercentage('misc') }}% of revenue</div>
        </div>
      </div>

      <!-- Pro-Tips and Income Summary Grid -->
      <div class="dashboard-grid">
        <!-- Pro-Tips Card -->
        <div class="card pro-tips-card">
          <div class="card-title">Pro-Tips</div>
          <ul class="pro-tips-list">
            <!-- Expense Category Tips -->
            <li *ngIf="getCategoryStatusClass('personnel') === 'category-high'">
              Personnel costs are high ({{ getCategoryPercentage('personnel') }}%) — review salary levels and employee deductions.
            </li>
            <li *ngIf="getCategoryStatusClass('facility') === 'category-high'">
              Facility costs elevated ({{ getCategoryPercentage('facility') }}%) — consider rent negotiation or space optimization.
            </li>
            <li *ngIf="getCategoryStatusClass('operations') === 'category-high'">
              Operations expenses high ({{ getCategoryPercentage('operations') }}%) — review utilities, supplies, and maintenance.
            </li>
            <li *ngIf="getCategoryStatusClass('franchise') === 'category-high'">
              Franchise fees impacting margins ({{ getCategoryPercentage('franchise') }}%) — focus on revenue growth to offset.
            </li>
            
            <!-- Overall Performance Tips -->
            <li *ngIf="expensesStatus === 'red'">
              Total expenses are high — prioritize Personnel and Facility cost reviews.
            </li>
            <li *ngIf="nimStatus === 'red'">
              Margin is low ({{ formatPercentage(currentResults.netMarginPct) }}) — consider raising fees or reducing discounts.
            </li>
            <li *ngIf="niStatus === 'red'">
              Net Income negative — check major expense categories and revenue opportunities.
            </li>
            <li *ngIf="niStatus === 'yellow'">
              Close to breakeven — small revenue increases or cost reductions can flip green.
            </li>
            
            <!-- Positive Performance Tips -->
            <li *ngIf="revenueStatus === 'green' && expensesStatus === 'green' && nimStatus === 'green' && niStatus === 'green'">
              🎉 Excellent performance across all metrics! Consider "Best" scenario to test capacity.
            </li>
            <li *ngIf="revenueStatus === 'green' && nimStatus === 'green' && getTotalExpenseRatio() < 75">
              Strong cost control — expense ratio {{ getTotalExpenseRatio() | number:'1.0-0' }}% is below 75% benchmark.
            </li>
            
            <!-- Strategic Growth Tips -->
            <li *ngIf="currentResults.totalRevenue > 150000 && nimStatus === 'green'">
              Revenue over $150K with good margins — consider expansion opportunities.
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
                <strong>{{ formatCurrency(currentResults.grossFees) }}</strong>
              </div>
              <div class="revenue-detail">
                <span>Returns: {{ getTaxPrepReturnsCount() }} @ {{ formatCurrency(getAverageNetFee()) }}</span>
              </div>
              <div class="revenue-line discount">
                <span>Less Discounts ({{ getDiscountPercentage() }}%):</span>
                <strong>-{{ formatCurrency(currentResults.discounts) }}</strong>
              </div>
            </div>

            <!-- Tax Prep Net Revenue -->
            <div class="revenue-line net-revenue">
              <span>Tax Prep Net Revenue:</span>
              <strong>{{ formatCurrency(currentResults.taxPrepIncome) }}</strong>
            </div>

            <!-- TaxRush Revenue (if applicable) -->
            <div *ngIf="currentResults.taxRushIncome > 0" class="revenue-line taxrush-revenue">
              <span>TaxRush Revenue:</span>
              <strong>{{ formatCurrency(currentResults.taxRushIncome) }}</strong>
            </div>

            <!-- Other Revenue -->
            <div *ngIf="hasOtherIncome && currentResults.otherIncome > 0" class="revenue-line other-revenue">
              <span>Other Revenue:</span>
              <strong>{{ formatCurrency(currentResults.otherIncome) }}</strong>
            </div>
            
            <!-- Total Gross Revenue -->
            <div class="revenue-line total-revenue">
              <span>Total Gross Revenue:</span>
              <strong>{{ formatCurrency(currentResults.totalRevenue) }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense Breakdown -->
      <div class="expense-breakdown-section">
        <div class="card">
          <div class="card-title expense-title">
            💰 Expense Breakdown
            <span class="expense-total">(Total: {{ formatCurrency(currentResults.totalExpenses) }})</span>
          </div>
          
          <div class="expense-categories">
            <!-- Personnel -->
            <div class="expense-category">
              <div class="category-header">
                👥 Personnel ({{ formatCurrency(currentResults.salaries + currentResults.empDeductions) }} • {{ getPersonnelPercentage() }}%)
              </div>
              <div class="category-details">
                <div>Salaries: {{ formatCurrency(currentResults.salaries) }} ({{ getSalariesPercentage() }}%)</div>
                <div>Emp. Deductions: {{ formatCurrency(currentResults.empDeductions) }} ({{ getEmpDeductionsPercentage() }}%)</div>
              </div>
            </div>

            <!-- Facility -->
            <div class="expense-category">
              <div class="category-header">
                🏢 Facility ({{ formatCurrency(currentResults.rent + currentResults.telephone + currentResults.utilities) }} • {{ getFacilityPercentage() }}%)
              </div>
              <div class="category-details">
                <div>Rent: {{ formatCurrency(currentResults.rent) }} ({{ getRentPercentage() }}%)</div>
                <div>Telephone: {{ formatCurrency(currentResults.telephone) }} ({{ getTelephonePercentage() }}%)</div>
                <div>Utilities: {{ formatCurrency(currentResults.utilities) }} ({{ getUtilitiesPercentage() }}%)</div>
              </div>
            </div>

            <!-- Operations -->
            <div class="expense-category">
              <div class="category-header">
                ⚙️ Operations ({{ formatCurrency(getOperationsTotal()) }} • {{ getOperationsPercentage() }}%)
              </div>
              <div class="category-details">
                <div>Local Advertising: {{ formatCurrency(currentResults.localAdv) }} ({{ getLocalAdvPercentage() }}%)</div>
                <div>Insurance: {{ formatCurrency(currentResults.insurance) }} ({{ getInsurancePercentage() }}%)</div>
                <div>Office Supplies: {{ formatCurrency(currentResults.supplies) }} ({{ getSuppliesPercentage() }}%)</div>
                <div>Other Ops: {{ formatCurrency(getOtherOpsTotal()) }} ({{ getOtherOpsPercentage() }}%)</div>
              </div>
            </div>

            <!-- Franchise -->
            <div class="expense-category">
              <div class="category-header">
                🏪 Franchise ({{ formatCurrency(getFranchiseTotal()) }} • {{ getFranchisePercentage() }}%)
              </div>
              <div class="category-details">
                <div>Tax Prep Royalties: {{ formatCurrency(currentResults.royalties) }} ({{ getRoyaltiesPercentage() }}%)</div>
                <div>Adv. Royalties: {{ formatCurrency(currentResults.advRoyalties) }} ({{ getAdvRoyaltiesPercentage() }}%)</div>
                <div *ngIf="currentResults.taxRushRoyalties > 0">
                  TaxRush Royalties: {{ formatCurrency(currentResults.taxRushRoyalties) }} ({{ getTaxRushRoyaltiesPercentage() }}%)
                </div>
              </div>
            </div>
          </div>

          <!-- Miscellaneous -->
          <div *ngIf="currentResults.misc > 0" class="misc-section">
            <div class="category-header">
              📝 Miscellaneous: {{ formatCurrency(currentResults.misc) }} ({{ getMiscPercentage() }}%)
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data Template -->
    <ng-template #noDataTemplate>
      <div class="no-data-message">
        <p>No data available yet. Configure income drivers and expenses to see dashboard KPIs.</p>
      </div>
    </ng-template>
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

    .no-data-message {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
      font-style: italic;
    }

    /* Category Breakdown Cards */
    .category-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }

    @media (max-width: 768px) {
      .category-cards-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .category-cards-grid {
        grid-template-columns: 1fr;
      }
    }

    .category-card {
      background: #f8fafc;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      transition: all 0.3s ease;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .category-card.category-good {
      border-color: #22c55e;
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    }

    .category-card.category-medium {
      border-color: #f59e0b;
      background: linear-gradient(135deg, #fffbeb, #fef3c7);
    }

    .category-card.category-high {
      border-color: #ef4444;
      background: linear-gradient(135deg, #fef2f2, #fecaca);
    }

    .category-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .category-icon {
      font-size: 1.25rem;
    }

    .category-name {
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }

    .category-amount {
      font-size: 1.1rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .category-percentage {
      font-size: 0.8rem;
      color: #6b7280;
      font-weight: 500;
    }

    .category-card.category-good .category-amount {
      color: #059669;
    }

    .category-card.category-medium .category-amount {
      color: #d97706;
    }

    .category-card.category-high .category-amount {
      color: #dc2626;
    }

    /* Enhanced Pro-Tips */
    .pro-tips-list li {
      margin-bottom: 0.75rem;
      line-height: 1.4;
      color: #374151;
      font-size: 0.9rem;
    }

    .pro-tips-list li:last-child {
      margin-bottom: 0;
    }
  `]
})
export class DashboardComponent implements OnChanges {
  // Legacy input for backward compatibility
  @Input() results?: CalculationResults;
  @Input() hasOtherIncome: boolean = false;
  
  // New input for live data from shell summary
  @Input() summaryData?: ExistingStoreSummary;
  
  // Internal computed results (from either input source)
  computedResults: CalculationResults = this.getEmptyResults();

  constructor(private kpiService: KpiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Priority: use summaryData if available (live data), otherwise use legacy results
    if (changes['summaryData'] && this.summaryData) {
      this.computedResults = this.kpiService.adaptSummaryToResults(this.summaryData);
    } else if (changes['results'] && this.results) {
      this.computedResults = { ...this.results };
    }
  }

  // Computed results accessor for template
  get currentResults(): CalculationResults {
    return this.computedResults;
  }

  private getEmptyResults(): CalculationResults {
    return {
      netIncome: 0, netMarginPct: 0, costPerReturn: 0, grossFees: 0, discounts: 0,
      taxPrepIncome: 0, taxRushIncome: 0, otherIncome: 0, totalRevenue: 0, totalExpenses: 0,
      totalReturns: 0, salaries: 0, empDeductions: 0, rent: 0, telephone: 0, utilities: 0,
      localAdv: 0, insurance: 0, postage: 0, supplies: 0, dues: 0, bankFees: 0,
      maintenance: 0, travelEnt: 0, royalties: 0, advRoyalties: 0, taxRushRoyalties: 0, misc: 0
    };
  }

  // KPI Status calculations using live data
  get niStatus() {
    return getKPIStatus('netIncome', this.currentResults.netIncome);
  }

  get nimStatus() {
    return getKPIStatus('netMargin', this.currentResults.netMarginPct);
  }

  get revenueStatus() {
    return getKPIStatus('totalRevenue', this.currentResults.totalRevenue);
  }

  get expensesStatus() {
    return getKPIStatus('totalExpenses', this.currentResults.totalExpenses);
  }

  // Utility methods
  formatCurrency = formatCurrency;
  formatPercentage = formatPercentage;
  getKPIStatusClass = getKPIStatusClass;

  getTaxPrepReturnsCount(): string {
    const taxRushReturns = this.currentResults.taxRushIncome > 0 ? Math.round(this.currentResults.taxRushIncome / 125) : 0;
    return (this.currentResults.totalReturns - taxRushReturns).toLocaleString();
  }

  getAverageNetFee(): number {
    const taxRushReturns = this.currentResults.taxRushIncome > 0 ? Math.round(this.currentResults.taxRushIncome / 125) : 0;
    const taxPrepReturns = this.currentResults.totalReturns - taxRushReturns;
    return taxPrepReturns > 0 ? Math.round(this.currentResults.grossFees / taxPrepReturns) : 0;
  }

  getDiscountPercentage(): string {
    const percentage = this.currentResults.grossFees > 0 ? (this.currentResults.discounts / this.currentResults.grossFees) * 100 : 0;
    return percentage.toFixed(0);
  }

  getPersonnelPercentage(): string {
    return this.getPercentage(this.currentResults.salaries + this.currentResults.empDeductions);
  }

  getSalariesPercentage(): string {
    return this.getPercentage(this.currentResults.salaries);
  }

  getEmpDeductionsPercentage(): string {
    return this.getPercentage(this.currentResults.empDeductions);
  }

  getFacilityPercentage(): string {
    return this.getPercentage(this.currentResults.rent + this.currentResults.telephone + this.currentResults.utilities);
  }

  getRentPercentage(): string {
    return this.getPercentage(this.currentResults.rent);
  }

  getTelephonePercentage(): string {
    return this.getPercentage(this.currentResults.telephone);
  }

  getUtilitiesPercentage(): string {
    return this.getPercentage(this.currentResults.utilities);
  }

  getOperationsTotal(): number {
    return this.currentResults.localAdv + this.currentResults.insurance + this.currentResults.postage + 
           this.currentResults.supplies + this.currentResults.dues + this.currentResults.bankFees + 
           this.currentResults.maintenance + this.currentResults.travelEnt;
  }

  getOperationsPercentage(): string {
    return this.getPercentage(this.getOperationsTotal());
  }

  getLocalAdvPercentage(): string {
    return this.getPercentage(this.currentResults.localAdv);
  }

  getInsurancePercentage(): string {
    return this.getPercentage(this.currentResults.insurance);
  }

  getSuppliesPercentage(): string {
    return this.getPercentage(this.currentResults.supplies);
  }

  getOtherOpsTotal(): number {
    return this.currentResults.postage + this.currentResults.dues + this.currentResults.bankFees + 
           this.currentResults.maintenance + this.currentResults.travelEnt;
  }

  getOtherOpsPercentage(): string {
    return this.getPercentage(this.getOtherOpsTotal());
  }

  getFranchiseTotal(): number {
    return this.currentResults.royalties + this.currentResults.advRoyalties + this.currentResults.taxRushRoyalties;
  }

  getFranchisePercentage(): string {
    return this.getPercentage(this.getFranchiseTotal());
  }

  getRoyaltiesPercentage(): string {
    return this.getPercentage(this.currentResults.royalties);
  }

  getAdvRoyaltiesPercentage(): string {
    return this.getPercentage(this.currentResults.advRoyalties);
  }

  getTaxRushRoyaltiesPercentage(): string {
    return this.getPercentage(this.currentResults.taxRushRoyalties);
  }

  getMiscPercentage(): string {
    return this.getPercentage(this.currentResults.misc);
  }

  private getPercentage(value: number): string {
    return this.currentResults.totalRevenue > 0 ? ((value / this.currentResults.totalRevenue) * 100).toFixed(1) : '0.0';
  }

  // Category aggregation methods for new category tiles
  getPersonnelTotal(): number {
    return this.currentResults.salaries + this.currentResults.empDeductions;
  }

  getFacilityTotal(): number {
    return this.currentResults.rent + this.currentResults.telephone + 
           this.currentResults.utilities + this.currentResults.insurance;
  }

  getOperationsTotal(): number {
    return this.currentResults.localAdv + this.currentResults.postage + 
           this.currentResults.supplies + this.currentResults.dues + 
           this.currentResults.bankFees + this.currentResults.maintenance + 
           this.currentResults.travelEnt;
  }

  getFranchiseTotal(): number {
    return this.currentResults.royalties + this.currentResults.advRoyalties + 
           this.currentResults.taxRushRoyalties;
  }

  getMiscTotal(): number {
    return this.currentResults.misc;
  }

  getCategoryPercentage(category: string): number {
    if (this.currentResults.totalRevenue === 0) return 0;
    
    let categoryTotal = 0;
    switch (category) {
      case 'personnel':
        categoryTotal = this.getPersonnelTotal();
        break;
      case 'facility':
        categoryTotal = this.getFacilityTotal();
        break;
      case 'operations':
        categoryTotal = this.getOperationsTotal();
        break;
      case 'franchise':
        categoryTotal = this.getFranchiseTotal();
        break;
      case 'misc':
        categoryTotal = this.getMiscTotal();
        break;
      default:
        return 0;
    }
    
    return (categoryTotal / this.currentResults.totalRevenue) * 100;
  }

  getCategoryStatusClass(category: string): string {
    const percentage = this.getCategoryPercentage(category);
    
    // Category-specific thresholds based on industry benchmarks
    let highThreshold = 0;
    let mediumThreshold = 0;
    
    switch (category) {
      case 'personnel':
        highThreshold = 35; // Personnel should be < 35% of revenue
        mediumThreshold = 25;
        break;
      case 'facility':
        highThreshold = 20; // Facility costs should be < 20% of revenue
        mediumThreshold = 15;
        break;
      case 'operations':
        highThreshold = 15; // Operations should be < 15% of revenue
        mediumThreshold = 10;
        break;
      case 'franchise':
        highThreshold = 25; // Franchise fees typically 20-25%
        mediumThreshold = 20;
        break;
      case 'misc':
        highThreshold = 10; // Misc should be minimal
        mediumThreshold = 5;
        break;
    }
    
    if (percentage > highThreshold) return 'category-high';
    if (percentage > mediumThreshold) return 'category-medium';
    return 'category-good';
  }

  getTotalExpenseRatio(): number {
    if (this.currentResults.totalRevenue === 0) return 0;
    return (this.currentResults.totalExpenses / this.currentResults.totalRevenue) * 100;
  }
}
