export type FieldType = 'number' | 'money' | 'percent' | 'text';

export interface FieldValidators {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp | string;
}

export interface FieldSpec {
  label: string;
  type: FieldType;
  unit?: string;
  help?: string;
  deriveFrom?: FieldKey[];
  validators?: FieldValidators;
}

export const FIELDS = {
  avgNetFee: {
    label: 'Average Net Fee',
    type: 'money',
    unit: 'USD',
    help: 'Average net fee you expect to collect per return',
    validators: { required: true, min: 0 }
  },
  taxPrepReturns: {
    label: 'Tax Prep Returns',
    type: 'number',
    unit: 'returns',
    help: 'Number of tax preparation returns you expect to complete',
    validators: { required: true, min: 0 }
  },
  grossTaxPrepFees: {
    label: 'Gross Tax Prep Fees',
    type: 'money',
    unit: 'USD',
    help: 'Automatically calculated as Average Net Fee × Tax Prep Returns',
    deriveFrom: ['avgNetFee', 'taxPrepReturns', 'taxRushReturns']
  },
  discountsPct: {
    label: 'Customer Discounts %',
    type: 'percent',
    unit: '%',
    help: 'Average discount percentage applied to customers',
    validators: { required: true, min: 0, max: 100 }
  },
  discountsAmt: {
    label: 'Customer Discounts ($)',
    type: 'money',
    unit: 'USD',
    help: 'Automatically calculated from gross fees and discount percentage',
    deriveFrom: ['grossTaxPrepFees', 'discountsPct']
  },
  netTaxPrepIncome: {
    label: 'Net Tax Prep Income',
    type: 'money',
    unit: 'USD',
    help: 'Gross tax prep fees minus customer discounts',
    deriveFrom: ['grossTaxPrepFees', 'discountsAmt']
  },
  taxRushReturns: {
    label: 'TaxRush Returns',
    type: 'number',
    unit: 'returns',
    help: 'Total number of TaxRush returns (Canada only)'
  },
  taxRushPercentage: {
    label: 'TaxRush % of Returns',
    type: 'percent',
    unit: '%',
    help: 'Percentage of returns that are TaxRush services',
    deriveFrom: ['taxPrepReturns', 'taxRushReturns']
  },
  taxRushFee: {
    label: 'TaxRush Average Net Fee',
    type: 'money',
    unit: 'USD',
    help: 'Average net fee collected per TaxRush return'
  },
  taxRushIncome: {
    label: 'TaxRush Income',
    type: 'money',
    unit: 'USD',
    help: 'Calculated as TaxRush Returns × TaxRush Average Net Fee',
    deriveFrom: ['taxRushReturns', 'taxRushFee']
  },
  otherIncome: {
    label: 'Other Income',
    type: 'money',
    unit: 'USD',
    help: 'Additional revenue from services beyond tax preparation',
    validators: { min: 0 }
  },
  totalRevenue: {
    label: 'Total Revenue',
    type: 'money',
    unit: 'USD',
    help: 'Net tax prep income plus TaxRush income and other income',
    deriveFrom: ['netTaxPrepIncome', 'taxRushIncome', 'otherIncome']
  }
} as const satisfies Record<string, FieldSpec>;

export type FieldKey = keyof typeof FIELDS;
