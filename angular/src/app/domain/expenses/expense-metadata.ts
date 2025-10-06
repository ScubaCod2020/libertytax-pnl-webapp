// Declarative metadata for expense lines: canonical storage key and conversion base
export type CanonicalKey =
  | 'payrollPct'
  | 'empDeductionsPct'
  | 'rentPct'
  | 'telephoneAmt'
  | 'utilitiesAmt'
  | 'localAdvAmt'
  | 'insuranceAmt'
  | 'postageAmt'
  | 'suppliesPct'
  | 'duesAmt'
  | 'bankFeesAmt'
  | 'maintenanceAmt'
  | 'travelEntAmt'
  | 'royaltiesPct'
  | 'advRoyaltiesPct'
  | 'taxRushRoyaltiesPct'
  | 'shortagesPct'
  | 'miscPct';

export interface ExpenseMeta {
  id: string;
  key: CanonicalKey;
  bidirectional: boolean; // supports amount<->percent input
  calculationBase: 'gross' | 'salaries' | 'none';
}

export const EXPENSE_METADATA: ExpenseMeta[] = [
  { id: 'payroll', key: 'payrollPct', bidirectional: true, calculationBase: 'gross' },
  {
    id: 'empDeductions',
    key: 'empDeductionsPct',
    bidirectional: true,
    calculationBase: 'salaries',
  },
  { id: 'rent', key: 'rentPct', bidirectional: true, calculationBase: 'gross' },
  { id: 'telephone', key: 'telephoneAmt', bidirectional: true, calculationBase: 'gross' },
  { id: 'utilities', key: 'utilitiesAmt', bidirectional: true, calculationBase: 'gross' },
  { id: 'localAdv', key: 'localAdvAmt', bidirectional: true, calculationBase: 'gross' },
  { id: 'insurance', key: 'insuranceAmt', bidirectional: true, calculationBase: 'gross' },
  { id: 'postage', key: 'postageAmt', bidirectional: true, calculationBase: 'gross' },
  { id: 'supplies', key: 'suppliesPct', bidirectional: true, calculationBase: 'gross' },
  { id: 'dues', key: 'duesAmt', bidirectional: true, calculationBase: 'gross' },
  { id: 'bankFees', key: 'bankFeesAmt', bidirectional: true, calculationBase: 'gross' },
  { id: 'maintenance', key: 'maintenanceAmt', bidirectional: true, calculationBase: 'gross' },
  { id: 'travel', key: 'travelEntAmt', bidirectional: true, calculationBase: 'gross' },
  { id: 'royalties', key: 'royaltiesPct', bidirectional: false, calculationBase: 'gross' },
  { id: 'advRoyalties', key: 'advRoyaltiesPct', bidirectional: false, calculationBase: 'gross' },
  {
    id: 'taxRushRoyalties',
    key: 'taxRushRoyaltiesPct',
    bidirectional: false,
    calculationBase: 'gross',
  },
  { id: 'shortages', key: 'shortagesPct', bidirectional: true, calculationBase: 'gross' },
  { id: 'misc', key: 'miscPct', bidirectional: true, calculationBase: 'gross' },
];
