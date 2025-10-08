// reports-page.component.ts - P&L Reports page with export functionality
// Professional P&L report with print-optimized styling and CSV/HTML export

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculationResults } from '../../components/dashboard/dashboard.component';
import { ExistingStoreSummary } from '../existing-store/existing-store-page.component';
import { Region } from '../../models/wizard.models';
import { formatCurrency, formatPercentage } from '../../utils/calculation.utils';
import { KpiService } from '../../services/kpi.service';
import { ConfigService } from '../../services/config.service';

interface ReportData {
  // Company Info
  region: Region;
  storeType: string;
  reportDate: string;
  
  // Key Metrics
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  netMarginPct: number;
  costPerReturn: number;
  totalReturns: number;
  avgNetFee: number;
  
  // Revenue Breakdown
  grossFees: number;
  discounts: number;
  taxPrepIncome: number;
  taxRushIncome: number;
  otherIncome: number;
  
  // Expense Categories
  personnel: number;
  personnelPct: number;
  facility: number;
  facilityPct: number;
  operations: number;
  operationsPct: number;
  franchise: number;
  franchisePct: number;
  misc: number;
  miscPct: number;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Print-optimized report -->
    <div class="reports-container" data-print-report>
      
      <!-- Export Controls (hidden when printing) -->
      <div class="export-section no-print">
        <div class="export-header">
          <h2>📋 P&L Report Summary</h2>
          <p class="export-description">
            Professional P&L forecast report ready for review and sharing. 
            Export to PDF or Excel for external distribution.
          </p>
        </div>
        
        <div class="export-buttons">
          <button 
            type="button" 
            class="export-btn pdf-btn"
            (click)="exportToPDF()">
            📄 Print PDF
          </button>
          <button 
            type="button" 
            class="export-btn excel-btn"
            (click)="exportToExcel()">
            📊 Export Excel
          </button>
        </div>
      </div>

      <!-- Professional Report Content -->
      <div class="report-document">
        <!-- Report Header -->
        <div class="report-header">
          <div class="company-info">
            <div class="logo-section">
              <img src="assets/liberty-tax-logo.png" alt="Liberty Tax" class="company-logo" 
                   onerror="this.style.display='none'">
              <div class="company-name">Liberty Tax</div>
            </div>
            <div class="report-meta">
              <h1 class="report-title">P&L Budget & Forecast Report</h1>
              <div class="config-summary">
                <div class="config-item">
                  <span class="config-label">Region:</span> 
                  <span class="config-value">{{ reportData.region === 'CA' ? 'Canada' : 'United States' }}</span>
                </div>
                <div class="config-item">
                  <span class="config-label">Store Type:</span> 
                  <span class="config-value">{{ reportData.storeType | titlecase }}</span>
                </div>
                <div class="config-item">
                  <span class="config-label">Report Date:</span> 
                  <span class="config-value">{{ reportData.reportDate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Key Performance Indicators -->
        <div class="report-section">
          <h2 class="section-title">Key Performance Indicators</h2>
          <table class="kpi-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Industry Target</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Net Income</td>
                <td class="currency">{{ formatCurrency(reportData.netIncome) }}</td>
                <td>Positive</td>
                <td [class]="getKpiStatusClass(reportData.netIncome, 'netIncome')">
                  {{ getKpiStatusText(reportData.netIncome, 'netIncome') }}
                </td>
              </tr>
              <tr>
                <td>Net Margin %</td>
                <td class="percentage">{{ formatPercentage(reportData.netMarginPct) }}</td>
                <td>≥ 20%</td>
                <td [class]="getKpiStatusClass(reportData.netMarginPct, 'netMargin')">
                  {{ getKpiStatusText(reportData.netMarginPct, 'netMargin') }}
                </td>
              </tr>
              <tr>
                <td>Cost per Return</td>
                <td class="currency">{{ formatCurrency(reportData.costPerReturn) }}</td>
                <td>≤ $85</td>
                <td [class]="getKpiStatusClass(reportData.costPerReturn, 'costPerReturn')">
                  {{ getKpiStatusText(reportData.costPerReturn, 'costPerReturn') }}
                </td>
              </tr>
              <tr>
                <td>Total Returns</td>
                <td class="number">{{ reportData.totalReturns | number:'1.0-0' }}</td>
                <td>Market-dependent</td>
                <td class="status-neutral">Target</td>
              </tr>
              <tr>
                <td>Average Net Fee</td>
                <td class="currency">{{ formatCurrency(reportData.avgNetFee) }}</td>
                <td>$120+</td>
                <td [class]="getKpiStatusClass(reportData.avgNetFee, 'avgNetFee')">
                  {{ getKpiStatusText(reportData.avgNetFee, 'avgNetFee') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Revenue Breakdown -->
        <div class="report-section">
          <h2 class="section-title">Revenue Analysis</h2>
          <table class="revenue-table">
            <thead>
              <tr>
                <th>Revenue Component</th>
                <th>Amount</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gross Fees</td>
                <td class="currency">{{ formatCurrency(reportData.grossFees) }}</td>
                <td class="percentage">{{ getRevenuePercentage(reportData.grossFees) }}%</td>
              </tr>
              <tr>
                <td>Less: Customer Discounts</td>
                <td class="currency negative">({{ formatCurrency(reportData.discounts) }})</td>
                <td class="percentage negative">({{ getRevenuePercentage(reportData.discounts) }}%)</td>
              </tr>
              <tr class="subtotal">
                <td><strong>Tax Prep Income</strong></td>
                <td class="currency"><strong>{{ formatCurrency(reportData.taxPrepIncome) }}</strong></td>
                <td class="percentage"><strong>{{ getRevenuePercentage(reportData.taxPrepIncome) }}%</strong></td>
              </tr>
              <tr *ngIf="reportData.taxRushIncome > 0">
                <td>TaxRush Income</td>
                <td class="currency">{{ formatCurrency(reportData.taxRushIncome) }}</td>
                <td class="percentage">{{ getRevenuePercentage(reportData.taxRushIncome) }}%</td>
              </tr>
              <tr *ngIf="reportData.otherIncome > 0">
                <td>Other Income</td>
                <td class="currency">{{ formatCurrency(reportData.otherIncome) }}</td>
                <td class="percentage">{{ getRevenuePercentage(reportData.otherIncome) }}%</td>
              </tr>
              <tr class="total">
                <td><strong>Total Revenue</strong></td>
                <td class="currency total-amount"><strong>{{ formatCurrency(reportData.totalRevenue) }}</strong></td>
                <td class="percentage"><strong>100.0%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Expense Category Breakdown -->
        <div class="report-section">
          <h2 class="section-title">Expense Analysis by Category</h2>
          <table class="expense-table">
            <thead>
              <tr>
                <th>Expense Category</th>
                <th>Amount</th>
                <th>% of Revenue</th>
                <th>Industry Benchmark</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>👥 Personnel</td>
                <td class="currency">{{ formatCurrency(reportData.personnel) }}</td>
                <td class="percentage">{{ reportData.personnelPct | number:'1.1-1' }}%</td>
                <td>< 35%</td>
                <td [class]="getCategoryStatusClass(reportData.personnelPct, 35, 25)">
                  {{ getCategoryStatusText(reportData.personnelPct, 35, 25) }}
                </td>
              </tr>
              <tr>
                <td>🏢 Facility</td>
                <td class="currency">{{ formatCurrency(reportData.facility) }}</td>
                <td class="percentage">{{ reportData.facilityPct | number:'1.1-1' }}%</td>
                <td>< 20%</td>
                <td [class]="getCategoryStatusClass(reportData.facilityPct, 20, 15)">
                  {{ getCategoryStatusText(reportData.facilityPct, 20, 15) }}
                </td>
              </tr>
              <tr>
                <td>⚙️ Operations</td>
                <td class="currency">{{ formatCurrency(reportData.operations) }}</td>
                <td class="percentage">{{ reportData.operationsPct | number:'1.1-1' }}%</td>
                <td>< 15%</td>
                <td [class]="getCategoryStatusClass(reportData.operationsPct, 15, 10)">
                  {{ getCategoryStatusText(reportData.operationsPct, 15, 10) }}
                </td>
              </tr>
              <tr>
                <td>🏪 Franchise</td>
                <td class="currency">{{ formatCurrency(reportData.franchise) }}</td>
                <td class="percentage">{{ reportData.franchisePct | number:'1.1-1' }}%</td>
                <td>20-25%</td>
                <td [class]="getCategoryStatusClass(reportData.franchisePct, 25, 20)">
                  {{ getCategoryStatusText(reportData.franchisePct, 25, 20) }}
                </td>
              </tr>
              <tr>
                <td>📝 Miscellaneous</td>
                <td class="currency">{{ formatCurrency(reportData.misc) }}</td>
                <td class="percentage">{{ reportData.miscPct | number:'1.1-1' }}%</td>
                <td>< 10%</td>
                <td [class]="getCategoryStatusClass(reportData.miscPct, 10, 5)">
                  {{ getCategoryStatusText(reportData.miscPct, 10, 5) }}
                </td>
              </tr>
              <tr class="total">
                <td><strong>Total Expenses</strong></td>
                <td class="currency total-amount"><strong>{{ formatCurrency(reportData.totalExpenses) }}</strong></td>
                <td class="percentage"><strong>{{ getExpenseRatio() | number:'1.1-1' }}%</strong></td>
                <td>< 75%</td>
                <td [class]="getCategoryStatusClass(getExpenseRatio(), 75, 65)">
                  {{ getCategoryStatusText(getExpenseRatio(), 75, 65) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bottom Line Summary -->
        <div class="report-section">
          <h2 class="section-title">Bottom Line Summary</h2>
          <table class="summary-table">
            <tbody>
              <tr>
                <td class="label">Total Revenue</td>
                <td class="amount positive">{{ formatCurrency(reportData.totalRevenue) }}</td>
              </tr>
              <tr>
                <td class="label">Total Expenses</td>
                <td class="amount negative">({{ formatCurrency(reportData.totalExpenses) }})</td>
              </tr>
              <tr class="net-income">
                <td class="label"><strong>Net Income</strong></td>
                <td class="amount" [class.positive]="reportData.netIncome > 0" [class.negative]="reportData.netIncome <= 0">
                  <strong>{{ formatCurrency(reportData.netIncome) }}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Management Checklist -->
        <div class="report-section management-checklist page-break-avoid">
          <h2 class="section-title">Management Action Items</h2>
          <div class="checklist-content">
            <div class="checklist-column">
              <h3>Review & Optimize</h3>
              <ul>
                <li *ngIf="reportData.personnelPct > 35">
                  ⚠️ Personnel costs high ({{ reportData.personnelPct | number:'1.1-1' }}%) - Review staffing levels
                </li>
                <li *ngIf="reportData.facilityPct > 20">
                  ⚠️ Facility costs elevated ({{ reportData.facilityPct | number:'1.1-1' }}%) - Consider space optimization
                </li>
                <li *ngIf="reportData.netMarginPct < 20">
                  📈 Margin opportunity - Consider fee increases or cost reductions
                </li>
                <li>📊 Monitor monthly actuals vs. forecast</li>
                <li>🎯 Track customer acquisition metrics</li>
              </ul>
            </div>
            <div class="checklist-column">
              <h3>Growth Opportunities</h3>
              <ul>
                <li *ngIf="reportData.avgNetFee < 120">
                  💰 Average fee below target ({{ formatCurrency(reportData.avgNetFee) }}) - Review pricing strategy
                </li>
                <li *ngIf="reportData.totalRevenue > 150000 && reportData.netMarginPct > 20">
                  🚀 Strong performance - Consider expansion opportunities
                </li>
                <li>🔍 Analyze high-margin service offerings</li>
                <li>📱 Explore digital marketing channels</li>
                <li>🤝 Develop referral programs</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Report Footer -->
        <div class="report-footer">
          <p class="footer-note">
            Report generated {{ reportData.reportDate }} • 
            Liberty Tax P&amp;L Budget &amp; Forecast Tool • 
            For management use only
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      font-family: 'Proxima Nova', Arial, sans-serif;
    }

    /* Export Section */
    .export-section {
      padding: 2rem;
      background: #f0f9ff;
      border-bottom: 1px solid #e0e7ff;
      margin-bottom: 2rem;
    }

    .export-header h2 {
      margin: 0 0 0.5rem 0;
      color: #1e40af;
      font-family: 'Proxima Nova', Arial, sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      letter-spacing: -0.025em;
    }

    .export-description {
      color: #6b7280;
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }

    .export-buttons {
      display: flex;
      gap: 1rem;
    }

    .export-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .pdf-btn {
      background: linear-gradient(45deg, #1e40af, #3b82f6);
      color: white;
    }

    .pdf-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .excel-btn {
      background: linear-gradient(45deg, #059669, #10b981);
      color: white;
    }

    .excel-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    /* Report Document */
    .report-document {
      padding: 2rem;
      line-height: 1.4;
      color: #1f2937;
    }

    /* Header */
    .report-header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }

    .company-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .company-logo {
      height: 40px;
      width: auto;
    }

    .company-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e40af;
    }

    .report-meta {
      text-align: right;
    }

    .report-title {
      font-family: 'Proxima Nova', Arial, sans-serif;
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      color: #111827;
      letter-spacing: -0.025em;
      line-height: 1.2;
    }

    .config-summary {
      font-size: 0.9rem;
    }

    .config-item {
      margin-bottom: 0.5rem;
    }

    .config-label {
      font-weight: 600;
      color: #6b7280;
    }

    .config-value {
      color: #374151;
    }

    /* Sections */
    .report-section {
      margin-bottom: 2rem;
      page-break-inside: avoid;
    }

    .section-title {
      font-family: 'Proxima Nova', Arial, sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
      letter-spacing: -0.025em;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #d1d5db;
    }

    .currency, .percentage, .number {
      text-align: right;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
    }

    .negative {
      color: #dc2626;
    }

    .positive {
      color: #059669;
    }

    .subtotal td, .total td {
      border-top: 2px solid #d1d5db;
      font-weight: 600;
    }

    .total-amount {
      font-size: 1.1rem;
    }

    /* Status indicators */
    .status-good {
      color: #059669;
      font-weight: 600;
    }

    .status-warning {
      color: #d97706;
      font-weight: 600;
    }

    .status-danger {
      color: #dc2626;
      font-weight: 600;
    }

    .status-neutral {
      color: #6b7280;
      font-weight: 500;
    }

    /* Bottom Line Summary */
    .summary-table {
      font-size: 1rem;
      max-width: 400px;
    }

    .summary-table .label {
      font-weight: 600;
    }

    .summary-table .amount {
      text-align: right;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
      font-weight: 600;
    }

    .net-income {
      border-top: 2px solid #111827;
      border-bottom: 3px double #111827;
    }

    .net-income .amount {
      font-size: 1.2rem;
    }

    /* Management Checklist */
    .management-checklist {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .checklist-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .checklist-column h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.75rem 0;
      color: #374151;
    }

    .checklist-column ul {
      margin: 0;
      padding-left: 1.25rem;
      list-style: none;
    }

    .checklist-column li {
      margin-bottom: 0.5rem;
      position: relative;
      padding-left: 1.5rem;
      line-height: 1.4;
    }

    .checklist-column li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #059669;
      font-weight: bold;
    }

    /* Footer */
    .report-footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }

    .footer-note {
      font-size: 0.8rem;
      color: #6b7280;
      margin: 0;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .export-buttons {
        flex-direction: column;
      }
      
      .company-info {
        flex-direction: column;
        gap: 1rem;
      }
      
      .report-meta {
        text-align: left;
      }
      
      .checklist-content {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      table {
        font-size: 0.8rem;
      }
      
      th, td {
        padding: 0.5rem;
      }
    }

    /* Print Styles */
    @media print {
      .no-print {
        display: none !important;
      }
      
      .reports-container {
        max-width: none;
        margin: 0;
        padding: 0;
        background: white;
        font-family: "Proxima Nova", "Times New Roman", serif;
        font-size: 10pt;
        line-height: 1.2;
        color: black;
      }
      
      .report-document {
        padding: 0.5in;
      }
      
      .page-break-avoid {
        page-break-inside: avoid;
      }
      
      table {
        font-size: 9pt;
      }
      
      th, td {
        padding: 4pt 6pt;
        border: 0.5pt solid #333;
      }
      
      th {
        background-color: #f8f8f8 !important;
        -webkit-print-color-adjust: exact;
      }
      
      .section-title {
        font-size: 12pt;
        margin-bottom: 8pt;
        margin-top: 12pt;
      }
      
      .report-title {
        font-size: 16pt;
      }
      
      .company-name {
        font-size: 14pt;
      }
      
      @page {
        size: letter;
        margin: 0.5in;
      }
    }
  `]
})
export class ReportsPageComponent implements OnInit {
  @Input() summaryData?: ExistingStoreSummary;
  @Input() region: Region = 'US';
  @Input() storeType: string = 'existing';

  reportData: ReportData = this.getEmptyReportData();

  constructor(private kpiService: KpiService, private config: ConfigService) {}

  ngOnInit(): void {
    this.generateReportData();
  }

  ngOnChanges(): void {
    this.generateReportData();
  }

  private generateReportData(): void {
    if (!this.summaryData) {
      this.reportData = this.getEmptyReportData();
      return;
    }

    // Convert summary data to calculation results format
    const results = this.kpiService.adaptSummaryToResults(this.summaryData);
    
    this.reportData = {
      region: this.region,
      storeType: this.storeType,
      reportDate: new Date().toLocaleDateString(),
      
      // Key Metrics
      totalRevenue: results.totalRevenue,
      totalExpenses: results.totalExpenses,
      netIncome: results.netIncome,
      netMarginPct: results.netMarginPct,
      costPerReturn: results.costPerReturn,
      totalReturns: results.totalReturns,
      avgNetFee: results.grossFees / results.totalReturns,
      
      // Revenue Breakdown
      grossFees: results.grossFees,
      discounts: results.discounts,
      taxPrepIncome: results.taxPrepIncome,
      taxRushIncome: results.taxRushIncome,
      otherIncome: results.otherIncome,
      
      // Expense Categories with percentages
      personnel: this.getPersonnelTotal(results),
      personnelPct: this.getCategoryPercentage(this.getPersonnelTotal(results), results.totalRevenue),
      facility: this.getFacilityTotal(results),
      facilityPct: this.getCategoryPercentage(this.getFacilityTotal(results), results.totalRevenue),
      operations: this.getOperationsTotal(results),
      operationsPct: this.getCategoryPercentage(this.getOperationsTotal(results), results.totalRevenue),
      franchise: this.getFranchiseTotal(results),
      franchisePct: this.getCategoryPercentage(this.getFranchiseTotal(results), results.totalRevenue),
      misc: results.misc,
      miscPct: this.getCategoryPercentage(results.misc, results.totalRevenue)
    };
  }

  private getEmptyReportData(): ReportData {
    return {
      region: this.region,
      storeType: this.storeType,
      reportDate: new Date().toLocaleDateString(),
      totalRevenue: 0, totalExpenses: 0, netIncome: 0, netMarginPct: 0,
      costPerReturn: 0, totalReturns: 0, avgNetFee: 0,
      grossFees: 0, discounts: 0, taxPrepIncome: 0, taxRushIncome: 0, otherIncome: 0,
      personnel: 0, personnelPct: 0, facility: 0, facilityPct: 0,
      operations: 0, operationsPct: 0, franchise: 0, franchisePct: 0,
      misc: 0, miscPct: 0
    };
  }

  // Category aggregation methods
  private getPersonnelTotal(results: CalculationResults): number {
    return results.salaries + results.empDeductions;
  }

  private getFacilityTotal(results: CalculationResults): number {
    return results.rent + results.telephone + results.utilities + results.insurance;
  }

  private getOperationsTotal(results: CalculationResults): number {
    return results.localAdv + results.postage + results.supplies + 
           results.dues + results.bankFees + results.maintenance + results.travelEnt;
  }

  private getFranchiseTotal(results: CalculationResults): number {
    return results.royalties + results.advRoyalties + results.taxRushRoyalties;
  }

  private getCategoryPercentage(amount: number, totalRevenue: number): number {
    return totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
  }

  // Template helper methods
  formatCurrency(value: number): string {
    return formatCurrency(value);
  }

  formatPercentage(value: number): string {
    return formatPercentage(value);
  }

  getRevenuePercentage(amount: number): string {
    const pct = this.reportData.totalRevenue > 0 ? (amount / this.reportData.totalRevenue) * 100 : 0;
    return pct.toFixed(1);
  }

  getExpenseRatio(): number {
    return this.reportData.totalRevenue > 0 ? (this.reportData.totalExpenses / this.reportData.totalRevenue) * 100 : 0;
  }

  getExpenseTargetRange(): string {
    const cfg = this.config.expensesPctConfig;
    return `${(cfg.greenMin*100).toFixed(1)}% - ${(cfg.greenMax*100).toFixed(1)}%`;
  }

  // KPI Status Methods
  getKpiStatusClass(value: number, type: string): string {
    switch (type) {
      case 'netIncome':
        return value > 0 ? 'status-good' : 'status-danger';
      case 'netMargin':
        if (value >= 20) return 'status-good';
        if (value >= 10) return 'status-warning';
        return 'status-danger';
      case 'costPerReturn':
        if (value <= 85) return 'status-good';
        if (value <= 100) return 'status-warning';
        return 'status-danger';
      case 'avgNetFee':
        if (value >= 120) return 'status-good';
        if (value >= 100) return 'status-warning';
        return 'status-danger';
      default:
        return 'status-neutral';
    }
  }

  getKpiStatusText(value: number, type: string): string {
    const statusClass = this.getKpiStatusClass(value, type);
    switch (statusClass) {
      case 'status-good': return 'Good';
      case 'status-warning': return 'Review';
      case 'status-danger': return 'Action Needed';
      default: return 'On Target';
    }
  }

  getCategoryStatusClass(percentage: number, highThreshold: number, goodThreshold: number): string {
    if (percentage > highThreshold) return 'status-danger';
    if (percentage > goodThreshold) return 'status-warning';
    return 'status-good';
  }

  getCategoryStatusText(percentage: number, highThreshold: number, goodThreshold: number): string {
    const statusClass = this.getCategoryStatusClass(percentage, highThreshold, goodThreshold);
    switch (statusClass) {
      case 'status-good': return 'Good';
      case 'status-warning': return 'Monitor';
      case 'status-danger': return 'High';
      default: return 'Target';
    }
  }

  // Export Methods
  exportToPDF(): void {
    // Use browser's print functionality with custom print styles
    window.print();
  }

  exportToExcel(): void {
    // Generate CSV format for Excel compatibility
    const csvData = this.generateCSVData();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `PL_Report_${this.reportData.reportDate.replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private generateCSVData(): string {
    const csv = [
      // Header
      ['Liberty Tax P&L Budget & Forecast Report'],
      [`Report Date: ${this.reportData.reportDate}`],
      [`Region: ${this.reportData.region === 'CA' ? 'Canada' : 'United States'}`],
      [`Store Type: ${this.storeType}`],
      [''],
      
      // Key Performance Indicators
      ['Key Performance Indicators'],
      ['Metric', 'Value', 'Industry Target', 'Status'],
      ['Net Income', formatCurrency(this.reportData.netIncome), 'Positive', this.getKpiStatusText(this.reportData.netIncome, 'netIncome')],
      ['Net Margin %', formatPercentage(this.reportData.netMarginPct), '≥ 20%', this.getKpiStatusText(this.reportData.netMarginPct, 'netMargin')],
      ['Cost per Return', formatCurrency(this.reportData.costPerReturn), '≤ $85', this.getKpiStatusText(this.reportData.costPerReturn, 'costPerReturn')],
      [''],
      
      // Revenue Analysis
      ['Revenue Analysis'],
      ['Revenue Component', 'Amount', '% of Total'],
      ['Gross Fees', formatCurrency(this.reportData.grossFees), `${this.getRevenuePercentage(this.reportData.grossFees)}%`],
      ['Less: Customer Discounts', `-${formatCurrency(this.reportData.discounts)}`, `-${this.getRevenuePercentage(this.reportData.discounts)}%`],
      ['Tax Prep Income', formatCurrency(this.reportData.taxPrepIncome), `${this.getRevenuePercentage(this.reportData.taxPrepIncome)}%`],
      ['Total Revenue', formatCurrency(this.reportData.totalRevenue), '100.0%'],
      [''],
      
      // Expense Analysis
      ['Expense Analysis by Category'],
      ['Category', 'Amount', '% of Revenue', 'Industry Benchmark', 'Status'],
      ['Personnel', formatCurrency(this.reportData.personnel), `${this.reportData.personnelPct.toFixed(1)}%`, '< 35%', this.getCategoryStatusText(this.reportData.personnelPct, 35, 25)],
      ['Facility', formatCurrency(this.reportData.facility), `${this.reportData.facilityPct.toFixed(1)}%`, '< 20%', this.getCategoryStatusText(this.reportData.facilityPct, 20, 15)],
      ['Operations', formatCurrency(this.reportData.operations), `${this.reportData.operationsPct.toFixed(1)}%`, '< 15%', this.getCategoryStatusText(this.reportData.operationsPct, 15, 10)],
      ['Franchise', formatCurrency(this.reportData.franchise), `${this.reportData.franchisePct.toFixed(1)}%`, '20-25%', this.getCategoryStatusText(this.reportData.franchisePct, 25, 20)],
      ['Miscellaneous', formatCurrency(this.reportData.misc), `${this.reportData.miscPct.toFixed(1)}%`, '< 10%', this.getCategoryStatusText(this.reportData.miscPct, 10, 5)],
      ['Total Expenses', formatCurrency(this.reportData.totalExpenses), `${this.getExpenseRatio().toFixed(1)}%`, '< 75%', this.getCategoryStatusText(this.getExpenseRatio(), 75, 65)],
      [''],
      
      // Bottom Line
      ['Bottom Line Summary'],
      ['Total Revenue', formatCurrency(this.reportData.totalRevenue)],
      ['Total Expenses', `-${formatCurrency(this.reportData.totalExpenses)}`],
      ['Net Income', formatCurrency(this.reportData.netIncome)]
    ];

    return csv.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
}
