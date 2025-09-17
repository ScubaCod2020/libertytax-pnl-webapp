// calculation.utils.ts - Utility functions for formatting and calculations
// Based on React app calculation utilities

import { debugLog, CalculationValidator } from './debug.utils';

export function formatCurrency(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true
  }).format(value);
}

export function formatPercentage(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

export function formatNumber(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// KPI Status determination
export type KPIStatus = 'red' | 'yellow' | 'green';

export function getKPIStatus(metric: string, value: number): KPIStatus {
  debugLog('CalculationUtils', 'getKPIStatus', { metric, value });
  
  let status: KPIStatus;
  switch (metric) {
    case 'netMargin':
      if (value >= 20) status = 'green';
      else if (value >= 15) status = 'yellow';
      else status = 'red';
      break;
    
    case 'costPerReturn':
      if (value <= 85) status = 'green';
      else if (value <= 100) status = 'yellow';
      else status = 'red';
      break;
    
    case 'netIncome':
      if (value > 0) status = 'green';
      else if (value >= -5000) status = 'yellow';
      else status = 'red';
      break;
    
    default:
      status = 'red';
  }
  
  debugLog('CalculationUtils', 'getKPIStatus_result', { metric, value, status });
  return status;
}

export function getKPIStatusClass(status: KPIStatus): string {
  switch (status) {
    case 'green':
      return 'kpi-green';
    case 'yellow':
      return 'kpi-yellow';
    case 'red':
      return 'kpi-red';
    default:
      return 'kpi-red';
  }
}

// Dual-entry calculation utilities for $↔% conversions
export function amountFromPct(pct: number, base: number): number {
  if (!pct || !base || isNaN(pct) || isNaN(base)) return 0;
  return (pct / 100) * base;
}

export function pctFromAmount(amount: number, base: number): number {
  if (!amount || !base || isNaN(amount) || isNaN(base)) return 0;
  return (amount / base) * 100;
}

// Calculate calculation base from expense field type and available values
export function getCalculationBase(field: any, bases: any): number {
  switch (field.calculationBase) {
    case 'percentage_gross':
      return bases.grossFees || 0;
    case 'percentage_tp_income':
      return bases.taxPrepIncome || 0;
    case 'percentage_salaries':
      return bases.salaries || 0;
    case 'fixed_amount':
      return 1; // For fixed amounts, base is 1 (amount = amount)
    default:
      return bases.grossFees || 0;
  }
}

// Performance status for projected performance panel
export interface PerformanceStatus {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'neutral';
  color: string;
  icon: string;
}

export function getPerformanceStatus(metric: string, value: number): PerformanceStatus {
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

// Build comprehensive summary from priorYear, projected, and expenses data
export function buildSummary(priorYear: any, projected: any, expenses: any): any {
  console.log('🏗️ Building summary from:', { priorYear, projected, expenses });
  
  // Calculate revenue components
  const taxPrepIncome = projected.netTaxIncome || priorYear.taxPrepIncome || 0;
  const taxRushIncome = projected.taxRushIncome || priorYear.taxRushIncome || 0;
  const otherIncome = projected.otherIncome || priorYear.otherIncome || 0;
  const discounts = projected.discounts || priorYear.discounts || 0;
  
  const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome - discounts;
  
  // Calculate expenses by category
  const expensesByCategory = {
    personnel: (expenses.salariesTotal || 0) + (expenses.empDeductionsTotal || 0),
    facility: (expenses.rentTotal || 0) + (expenses.utilitiesTotal || 0) + (expenses.insuranceTotal || 0),
    operations: (expenses.suppliesTotal || 0) + (expenses.postageTotal || 0) + (expenses.localAdvTotal || 0),
    franchise: (expenses.royaltiesTotal || 0) + (expenses.advRoyaltiesTotal || 0) + (expenses.taxRushRoyaltiesTotal || 0),
    misc: expenses.miscTotal || 0
  };
  
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, value) => sum + value, 0);
  const netIncome = totalRevenue - totalExpenses;
  const netMarginPct = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
  
  const summary = {
    totalRevenue,
    totalExpenses,
    netIncome,
    netMarginPct,
    taxPrepIncome,
    taxRushIncome,
    otherIncome,
    discounts,
    expensesByCategory
  };
  
  console.log('📊 Built summary:', summary);
  return summary;
}
