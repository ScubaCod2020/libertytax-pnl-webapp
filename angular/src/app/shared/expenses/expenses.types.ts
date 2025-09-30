// Shared expense types for v2 adapter and UI bindings

export type ExpenseKey =
  | 'payroll'
  | 'empDeductions'
  | 'rent'
  | 'telephone'
  | 'utilities'
  | 'localAdv'
  | 'insurance'
  | 'postage'
  | 'supplies'
  | 'dues'
  | 'bankFees'
  | 'maintenance'
  | 'travel'
  | 'royalties'
  | 'advRoyalties'
  | 'taxRushRoyalties'
  | 'shortages'
  | 'misc';

export type ExpenseUnit = 'percent' | 'dollar';
export type ExpenseDollarPeriod = 'annual' | 'monthly';

export interface SharedExpenseMeta {
  key: ExpenseKey;
  unit: ExpenseUnit;
  // Only required for dollar-unit expenses
  period?: ExpenseDollarPeriod;
  // Informational flags preserved from domain metadata
  bidirectional?: boolean;
  calculationBase?: 'gross' | 'salaries' | 'none';
}
