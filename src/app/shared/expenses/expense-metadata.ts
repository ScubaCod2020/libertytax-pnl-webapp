import type { SharedExpenseMeta } from './expenses.types';

// Shared metadata with explicit unit/period for adapter mapping and UI hints
export const SHARED_EXPENSE_METADATA: Record<string, SharedExpenseMeta> = {
  payroll: { key: 'payroll', unit: 'percent', bidirectional: true, calculationBase: 'gross' },
  empDeductions: {
    key: 'empDeductions',
    unit: 'percent',
    bidirectional: true,
    calculationBase: 'salaries',
  },
  rent: {
    key: 'rent',
    unit: 'dollar',
    period: 'monthly',
    bidirectional: true,
    calculationBase: 'gross',
  },
  telephone: { key: 'telephone', unit: 'percent', bidirectional: true, calculationBase: 'gross' },
  utilities: { key: 'utilities', unit: 'percent', bidirectional: true, calculationBase: 'gross' },
  localAdv: { key: 'localAdv', unit: 'percent', bidirectional: true, calculationBase: 'gross' },
  insurance: {
    key: 'insurance',
    unit: 'dollar',
    period: 'annual',
    bidirectional: true,
    calculationBase: 'gross',
  },
  postage: {
    key: 'postage',
    unit: 'dollar',
    period: 'annual',
    bidirectional: true,
    calculationBase: 'gross',
  },
  supplies: { key: 'supplies', unit: 'percent', bidirectional: true, calculationBase: 'gross' },
  dues: {
    key: 'dues',
    unit: 'dollar',
    period: 'annual',
    bidirectional: true,
    calculationBase: 'gross',
  },
  bankFees: {
    key: 'bankFees',
    unit: 'dollar',
    period: 'annual',
    bidirectional: true,
    calculationBase: 'gross',
  },
  maintenance: {
    key: 'maintenance',
    unit: 'dollar',
    period: 'annual',
    bidirectional: true,
    calculationBase: 'gross',
  },
  travel: {
    key: 'travel',
    unit: 'dollar',
    period: 'annual',
    bidirectional: true,
    calculationBase: 'gross',
  },
  royalties: { key: 'royalties', unit: 'percent', bidirectional: false, calculationBase: 'gross' },
  advRoyalties: {
    key: 'advRoyalties',
    unit: 'percent',
    bidirectional: false,
    calculationBase: 'gross',
  },
  taxRushRoyalties: {
    key: 'taxRushRoyalties',
    unit: 'percent',
    bidirectional: false,
    calculationBase: 'gross',
  },
  shortages: { key: 'shortages', unit: 'percent', bidirectional: true, calculationBase: 'gross' },
  misc: { key: 'misc', unit: 'percent', bidirectional: true, calculationBase: 'gross' },
};

export const EXPENSE_KEYS = Object.keys(SHARED_EXPENSE_METADATA);
