// kpi.service.ts - KPI computation and data adaptation service
// Converts ExistingStoreSummary to CalculationResults format for Dashboard consumption

import { Injectable } from '@angular/core';
import { ExistingStoreSummary } from '../pages/existing-store/existing-store-page.component';
import { CalculationResults } from '../components/dashboard/dashboard.component';
import { getKPIStatus } from '../utils/calculation.utils';

// Enhanced KPI computation interface
export interface KPIComputationResult {
  revenue: number;
  expenses: number;
  netIncome: number;
  netMarginPct: number;
  costPerReturn: number;
  totalReturns: number;
  // KPI Status indicators
  netIncomeStatus: 'red' | 'yellow' | 'green';
  netMarginStatus: 'red' | 'yellow' | 'green'; 
  costPerReturnStatus: 'red' | 'yellow' | 'green';
}

@Injectable({
  providedIn: 'root'
})
export class KpiService {

  /**
   * Main adapter function: converts ExistingStoreSummary to CalculationResults
   * Focus on data plumbing - no template math, minimal logic
   */
  adaptSummaryToResults(summary: ExistingStoreSummary): CalculationResults {
    // Base KPI calculations (already computed in summary)
    const baseResults = {
      netIncome: summary.kpis.netIncome,
      netMarginPct: summary.kpis.netMarginPct,
      costPerReturn: summary.kpis.costPerReturn,
      totalReturns: summary.kpis.totalReturns,
      
      // Revenue breakdown (direct mapping)
      grossFees: summary.revenue.grossFees,
      discounts: summary.revenue.discounts,
      taxPrepIncome: summary.revenue.taxPrepIncome,
      taxRushIncome: summary.revenue.taxRushIncome,
      otherIncome: summary.revenue.otherIncome,
      totalRevenue: summary.revenue.totalRevenue,
      totalExpenses: summary.expenses.totalExpenses
    };

    // Map expense items to individual expense fields expected by dashboard
    const expenseBreakdown = this.mapExpenseItemsToFields(summary.expenses.items);

    return {
      ...baseResults,
      ...expenseBreakdown
    };
  }

  /**
   * Compute enhanced KPI status and metrics for dashboard consumption
   */
  computeKPIMetrics(summary: ExistingStoreSummary): KPIComputationResult {
    return {
      revenue: summary.revenue.totalRevenue,
      expenses: summary.expenses.totalExpenses,
      netIncome: summary.kpis.netIncome,
      netMarginPct: summary.kpis.netMarginPct,
      costPerReturn: summary.kpis.costPerReturn,
      totalReturns: summary.kpis.totalReturns,
      
      // Compute KPI status using existing calculation utils
      netIncomeStatus: getKPIStatus('netIncome', summary.kpis.netIncome),
      netMarginStatus: getKPIStatus('netMargin', summary.kpis.netMarginPct),
      costPerReturnStatus: getKPIStatus('costPerReturn', summary.kpis.costPerReturn)
    };
  }

  /**
   * Maps expense items array to individual expense fields for dashboard breakdown
   * Uses fieldId to map each expense to its corresponding dashboard field
   */
  private mapExpenseItemsToFields(expenseItems: Array<{fieldId: string; amount: number; pct: number}>) {
    const expenseBreakdown = {
      salaries: 0,
      empDeductions: 0,
      rent: 0,
      telephone: 0,
      utilities: 0,
      localAdv: 0,
      insurance: 0,
      postage: 0,
      supplies: 0,
      dues: 0,
      bankFees: 0,
      maintenance: 0,
      travelEnt: 0,
      royalties: 0,
      advRoyalties: 0,
      taxRushRoyalties: 0,
      misc: 0
    };

    // Map each expense item to its corresponding field
    expenseItems.forEach(item => {
      switch (item.fieldId) {
        case 'salariesPct':
          expenseBreakdown.salaries = item.amount;
          break;
        case 'empDeductionsPct':
          expenseBreakdown.empDeductions = item.amount;
          break;
        case 'rentPct':
          expenseBreakdown.rent = item.amount;
          break;
        case 'telephoneAmt':
          expenseBreakdown.telephone = item.amount;
          break;
        case 'utilitiesAmt':
          expenseBreakdown.utilities = item.amount;
          break;
        case 'localAdvAmt':
          expenseBreakdown.localAdv = item.amount;
          break;
        case 'insuranceAmt':
          expenseBreakdown.insurance = item.amount;
          break;
        case 'postageAmt':
          expenseBreakdown.postage = item.amount;
          break;
        case 'suppliesPct':
          expenseBreakdown.supplies = item.amount;
          break;
        case 'duesAmt':
          expenseBreakdown.dues = item.amount;
          break;
        case 'bankFeesAmt':
          expenseBreakdown.bankFees = item.amount;
          break;
        case 'maintenanceAmt':
          expenseBreakdown.maintenance = item.amount;
          break;
        case 'travelEntAmt':
          expenseBreakdown.travelEnt = item.amount;
          break;
        case 'royaltiesPct':
          expenseBreakdown.royalties = item.amount;
          break;
        case 'advRoyaltiesPct':
          expenseBreakdown.advRoyalties = item.amount;
          break;
        case 'taxRushRoyaltiesPct':
          expenseBreakdown.taxRushRoyalties = item.amount;
          break;
        case 'miscPct':
          expenseBreakdown.misc = item.amount;
          break;
        // Add any additional mappings as needed
        default:
          console.warn(`KpiService: Unmapped expense field: ${item.fieldId}`);
      }
    });

    return expenseBreakdown;
  }

  /**
   * Validate that minimum KPI data is available for meaningful display
   */
  isKPIDataComplete(summary: ExistingStoreSummary): boolean {
    return summary.formState.dataComplete && 
           summary.revenue.totalRevenue > 0 &&
           summary.expenses.items.length > 0;
  }

  /**
   * Get KPI badge text for display (matches existing pattern)
   */
  getKPIBadgeText(status: 'red' | 'yellow' | 'green'): string {
    switch (status) {
      case 'green': return '✓';
      case 'yellow': return '⚠';
      case 'red': return '⚠';
      default: return '';
    }
  }

  /**
   * Get KPI class name for CSS styling (matches existing .kpi-* pattern)
   */
  getKPIClassName(status: 'red' | 'yellow' | 'green'): string {
    switch (status) {
      case 'green': return 'kpi-ok';
      case 'yellow': return 'kpi-warn'; 
      case 'red': return 'kpi-bad';
      default: return '';
    }
  }
}
