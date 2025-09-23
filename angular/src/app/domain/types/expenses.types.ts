// Expense dictionary and defaults (ported from React reference)

export interface ExpenseField {
  id: string;
  label: string;
  category: ExpenseCategory;
  calculationBase:
    | 'percentage_gross'
    | 'percentage_salaries'
    | 'percentage_tp_income'
    | 'fixed_amount';
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  description?: string;
  regionSpecific?: 'US' | 'CA' | 'both';
}

export type ExpenseCategory =
  | 'personnel'
  | 'facility'
  | 'marketing'
  | 'utilities'
  | 'franchise'
  | 'misc';

export const expenseCategories = {
  personnel: { label: 'Personnel', description: 'Staff-related expenses' },
  facility: { label: 'Facility', description: 'Office and location costs' },
  marketing: { label: 'Marketing', description: 'Local marketing and advertising' },
  utilities: { label: 'Utilities', description: 'Phone, internet, and utilities' },
  franchise: { label: 'Franchise', description: 'Franchise fees and royalties' },
  misc: { label: 'Miscellaneous', description: 'Other and miscellaneous expenses' },
} as const;

export const expenseFields: ExpenseField[] = [
  {
    id: 'salariesPct',
    label: 'Payroll',
    category: 'personnel',
    calculationBase: 'percentage_gross',
    defaultValue: 25,
    min: 0,
    max: 60,
    step: 0.1,
    description: 'Payroll as % of gross fees',
  },
  {
    id: 'empDeductionsPct',
    label: 'Employee Deductions',
    category: 'personnel',
    calculationBase: 'percentage_salaries',
    defaultValue: 10,
    min: 0,
    max: 25,
    step: 0.1,
    description: 'Payroll taxes/benefits as % of salaries',
  },

  {
    id: 'rentPct',
    label: 'Rent',
    category: 'facility',
    calculationBase: 'percentage_gross',
    defaultValue: 18,
    min: 0,
    max: 40,
    step: 0.1,
    description: 'Office rent as % of gross fees',
  },
  {
    id: 'telephonePct',
    label: 'Telephone',
    category: 'utilities',
    calculationBase: 'percentage_gross',
    defaultValue: 0.5,
    min: 0,
    max: 3,
    step: 0.1,
    description: 'Phone/internet costs as % of gross fees',
  },
  {
    id: 'utilitiesPct',
    label: 'Utilities',
    category: 'utilities',
    calculationBase: 'percentage_gross',
    defaultValue: 1.2,
    min: 0,
    max: 5,
    step: 0.1,
    description: 'Utilities as % of gross fees',
  },

  {
    id: 'localAdvPct',
    label: 'Local Advertising',
    category: 'marketing',
    calculationBase: 'percentage_gross',
    defaultValue: 2,
    min: 0,
    max: 8,
    step: 0.1,
    description: 'Local marketing as % of gross fees',
  },
  {
    id: 'insurancePct',
    label: 'Insurance',
    category: 'operations',
    calculationBase: 'percentage_gross',
    defaultValue: 0.6,
    min: 0,
    max: 3,
    step: 0.1,
    description: 'Business insurance as % of gross fees',
  },
  {
    id: 'postagePct',
    label: 'Postage',
    category: 'operations',
    calculationBase: 'percentage_gross',
    defaultValue: 0.4,
    min: 0,
    max: 2,
    step: 0.1,
    description: 'Mailing/shipping as % of gross fees',
  },
  {
    id: 'suppliesPct',
    label: 'Office Supplies',
    category: 'operations',
    calculationBase: 'percentage_gross',
    defaultValue: 3.5,
    min: 0,
    max: 10,
    step: 0.1,
    description: 'Office supplies as % of gross fees',
  },
  {
    id: 'duesPct',
    label: 'Dues',
    category: 'misc',
    calculationBase: 'percentage_gross',
    defaultValue: 0.8,
    min: 0,
    max: 3,
    step: 0.1,
    description: 'Dues/subscriptions as % of gross fees',
  },
  {
    id: 'bankFeesPct',
    label: 'Bank Fees',
    category: 'operations',
    calculationBase: 'percentage_gross',
    defaultValue: 0.4,
    min: 0,
    max: 2,
    step: 0.1,
    description: 'Bank/CC fees as % of gross fees',
  },
  {
    id: 'maintenancePct',
    label: 'Maintenance',
    category: 'facility',
    calculationBase: 'percentage_gross',
    defaultValue: 0.6,
    min: 0,
    max: 3,
    step: 0.1,
    description: 'Equipment/facility maintenance',
  },
  {
    id: 'travelEntPct',
    label: 'Travel/Entertainment',
    category: 'operations',
    calculationBase: 'percentage_gross',
    defaultValue: 0.8,
    min: 0,
    max: 4,
    step: 0.1,
    description: 'Business travel and entertainment',
  },

  {
    id: 'royaltiesPct',
    label: 'Tax Prep Royalties',
    category: 'franchise',
    calculationBase: 'percentage_tp_income',
    defaultValue: 14,
    min: 0,
    max: 25,
    step: 0.1,
    description: 'Royalties on tax prep income',
  },
  {
    id: 'advRoyaltiesPct',
    label: 'Advertising Royalties',
    category: 'franchise',
    calculationBase: 'percentage_tp_income',
    defaultValue: 5,
    min: 0,
    max: 15,
    step: 0.1,
    description: 'Advertising fees on tax prep income',
  },
  {
    id: 'taxRushShortagesPct',
    label: 'Shortages',
    category: 'misc',
    calculationBase: 'percentage_gross',
    defaultValue: 2.5,
    min: 0,
    max: 10,
    step: 0.1,
    description: 'Return processing shortages',
    regionSpecific: 'CA',
  },
  {
    id: 'taxRushRoyaltiesPct',
    label: 'TaxRush Royalties',
    category: 'franchise',
    calculationBase: 'percentage_gross',
    defaultValue: 6,
    min: 0,
    max: 15,
    step: 0.1,
    description: 'CA-only surrogate % of gross',
    regionSpecific: 'CA',
  },

  {
    id: 'miscPct',
    label: 'Miscellaneous',
    category: 'misc',
    calculationBase: 'percentage_gross',
    defaultValue: 1,
    min: 0,
    max: 5,
    step: 0.1,
    description: 'Other miscellaneous expenses as % of gross fees',
  },
];

export type ExpenseValues = {
  salariesPct: number;
  empDeductionsPct: number;
  rentPct: number;
  telephonePct: number;
  utilitiesPct: number;
  localAdvPct: number;
  insurancePct: number;
  postagePct: number;
  suppliesPct: number;
  duesPct: number;
  bankFeesPct: number;
  maintenancePct: number;
  travelEntPct: number;
  royaltiesPct: number;
  advRoyaltiesPct: number;
  taxRushRoyaltiesPct: number;
  taxRushShortagesPct: number;
  miscPct: number;
};

export const defaultExpenseValues: ExpenseValues = expenseFields.reduce((acc, field) => {
  // @ts-expect-error: id matches keys in ExpenseValues for pct fields
  acc[field.id] = field.defaultValue;
  return acc;
}, {} as ExpenseValues);
