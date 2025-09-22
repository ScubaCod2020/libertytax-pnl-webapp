// Adapters to accept React-like shapes and map to domain inputs/outputs
import type { CalculationInputs, CalculationResults } from '../types/calculation.types';
import { calc } from './calc';
import { statusForCPR, statusForMargin, statusForNetIncome, type Light } from './kpi';

export interface ReactCalcInputsLike {
  region: 'US' | 'CA';
  scenario: 'Custom' | 'Good' | 'Better' | 'Best' | string;
  avgNetFee: number;
  taxPrepReturns: number;
  taxRushReturns: number;
  handlesTaxRush?: boolean;
  otherIncome?: number;
  discountsPct: number;
  calculatedTotalExpenses?: number;
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
  thresholds: {
    cprGreen: number;
    cprYellow: number;
    nimGreen: number;
    nimYellow: number;
    netIncomeWarn: number;
  };
}

export interface ReactCalcResultsLike extends CalculationResults {
  cprStatus: Light;
  nimStatus: Light;
  niStatus: Light;
}

export function mapReactInputsToDomain(inputs: ReactCalcInputsLike): CalculationInputs {
  return { ...inputs } as CalculationInputs;
}

export function runCalcAdapter(inputs: ReactCalcInputsLike): ReactCalcResultsLike {
  const domainInputs = mapReactInputsToDomain(inputs);
  const results = calc(domainInputs);
  const cprStatus = statusForCPR(results.costPerReturn, domainInputs.thresholds, domainInputs);
  const nimStatus = statusForMargin(results.netMarginPct, domainInputs.thresholds);
  const niStatus = statusForNetIncome(results.netIncome, domainInputs.thresholds);
  return { ...results, cprStatus, nimStatus, niStatus };
}
