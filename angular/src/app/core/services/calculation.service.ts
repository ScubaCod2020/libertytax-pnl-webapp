import { Injectable } from '@angular/core';

// Domain types will be moved into domain/types
export type Region = 'US' | 'CA';

export interface Thresholds {
  cprGreen: number;
  cprYellow: number;
  nimGreen: number;
  nimYellow: number;
  netIncomeWarn: number;
}

export interface CalculationInputs {
  region: Region;
  scenario: string;
  avgNetFee: number;
  taxPrepReturns: number;
  taxRushReturns: number;
  discountsPct: number;
  otherIncome: number;
  calculatedTotalExpenses?: number;

  // 17 expense fields (placeholder types)
  salariesPct: number;
  empDeductionsPct: number;
  rentPct: number;
  telephoneAmt: number;
  utilitiesAmt: number;
  localAdvAmt: number;
  insuranceAmt: number;
  postageAmt: number;
  suppliesPct: number;
  duesAmt: number;
  bankFeesAmt: number;
  maintenanceAmt: number;
  travelEntAmt: number;
  royaltiesPct: number;
  advRoyaltiesPct: number;
  taxRushRoyaltiesPct: number;
  miscPct: number;

  thresholds: Thresholds;
}

export interface CalculationResults {
  // Minimal surface for now
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  netMarginPct: number;
}

@Injectable({ providedIn: 'root' })
export class CalculationService {
  // TODO: wire to domain calculation functions once ported
  calculate(inputs: CalculationInputs): CalculationResults {
    // Placeholder implementation to keep app building
    const grossFees = inputs.avgNetFee * inputs.taxPrepReturns;
    const discounts = grossFees * (inputs.discountsPct / 100);
    const taxPrepIncome = grossFees - discounts;
    const taxRushIncome = inputs.region === 'CA' ? inputs.avgNetFee * inputs.taxRushReturns : 0;
    const totalRevenue = taxPrepIncome + taxRushIncome + (inputs.otherIncome || 0);
    const fieldBasedExpenses =
      grossFees * (inputs.salariesPct / 100) +
      grossFees * (inputs.rentPct / 100) +
      grossFees * (inputs.suppliesPct / 100) +
      grossFees * (inputs.miscPct / 100);
    const totalExpenses = Math.round(inputs.calculatedTotalExpenses ?? fieldBasedExpenses);
    const netIncome = totalRevenue - totalExpenses;
    const netMarginPct = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
    return { totalRevenue, totalExpenses, netIncome, netMarginPct };
  }
}
