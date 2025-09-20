export type ExpenseCategory =
  | 'personnel'
  | 'facility'
  | 'marketing'
  | 'utilities'
  | 'royalties'
  | 'misc';

export interface ExpenseLine {
  amount?: number; // $
  pct?: number; // 0..1
  lastEdited?: 'amount' | 'pct';
}

export type ExpensesModel = { [Category in ExpenseCategory]: ExpenseLine };

export const TARGET_TOTAL_PCT = 0.76; // 76%
