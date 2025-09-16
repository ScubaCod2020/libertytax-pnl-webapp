export type FieldKey =
  | 'avgNetFee'
  | 'taxPrepReturns'
  | 'taxRushReturns'
  | 'taxRushPercentage'
  | 'taxRushFee'
  | 'grossTaxPrepFees'
  | 'grossTaxRushFees'
  | 'discountsAmt'
  | 'discountsPct'
  | 'netTaxPrepFees'
  | 'otherIncome'
  | 'totalExpenses'
  | 'lastYearGrossFees'
  | 'lastYearExpenses'
  | 'lastYearReturns'
  | 'expectedGrowthPct'
  | 'handlesTaxRush'
  | 'lastYearRevenue'
  | 'netIncome';

type FieldType = 'number' | 'money' | 'percent' | 'boolean' | 'text';

type FieldUnit = '$' | '%' | '#';

export interface FieldSpec {
  key: FieldKey;
  label: string;
  type: FieldType;
  unit?: FieldUnit;
  validators?: {
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
  };
  deriveFrom?: FieldKey[];
  aliases?: string[];
  help?: string;
}

export const FIELDS: Record<FieldKey, FieldSpec> = {
  avgNetFee: {
    key: 'avgNetFee',
    label: 'Average Net Fee',
    type: 'money',
    unit: '$',
    validators: { required: true, min: 50, max: 500, step: 1 },
    help: 'Average net fee per standard tax return.',
  },
  taxPrepReturns: {
    key: 'taxPrepReturns',
    label: 'Tax Prep Returns',
    type: 'number',
    unit: '#',
    validators: { required: true, min: 100, max: 10000, step: 1 },
    help: 'Projected number of tax prep returns.',
  },
  taxRushReturns: {
    key: 'taxRushReturns',
    label: 'TaxRush Returns',
    type: 'number',
    unit: '#',
    validators: { min: 0, max: 10000, step: 1 },
    help: 'TaxRush return volume when the product is enabled.',
  },
  taxRushPercentage: {
    key: 'taxRushPercentage',
    label: 'TaxRush % of Returns',
    type: 'percent',
    unit: '%',
    validators: { min: 0, max: 100, step: 0.1 },
    deriveFrom: ['taxRushReturns', 'taxPrepReturns'],
    help: 'Share of total returns that flow through TaxRush.',
  },
  taxRushFee: {
    key: 'taxRushFee',
    label: 'TaxRush Average Net Fee',
    type: 'money',
    unit: '$',
    validators: { min: 0, max: 500, step: 1 },
    help: 'Average fee collected per TaxRush return.',
  },
  grossTaxPrepFees: {
    key: 'grossTaxPrepFees',
    label: 'Gross Tax Prep Fees',
    type: 'money',
    unit: '$',
    deriveFrom: ['avgNetFee', 'taxPrepReturns'],
    help: 'Auto-calculated: Average Net Fee × Tax Prep Returns.',
  },
  grossTaxRushFees: {
    key: 'grossTaxRushFees',
    label: 'Gross TaxRush Fees',
    type: 'money',
    unit: '$',
    deriveFrom: ['taxRushReturns', 'taxRushFee', 'avgNetFee', 'taxPrepReturns'],
    help: 'Auto-calculated from TaxRush volume and fees.',
  },
  discountsAmt: {
    key: 'discountsAmt',
    label: 'Customer Discounts ($)',
    type: 'money',
    unit: '$',
    deriveFrom: ['grossTaxPrepFees', 'discountsPct'],
    help: 'Dollar value of discounts applied to gross fees.',
  },
  discountsPct: {
    key: 'discountsPct',
    label: 'Customer Discounts (%)',
    type: 'percent',
    unit: '%',
    validators: { min: 0, max: 100, step: 0.1 },
    help: 'Discount percentage applied to gross fees.',
  },
  netTaxPrepFees: {
    key: 'netTaxPrepFees',
    label: 'Net Tax Prep Fees',
    type: 'money',
    unit: '$',
    deriveFrom: ['grossTaxPrepFees', 'discountsAmt'],
    help: 'Gross fees minus customer discounts.',
  },
  otherIncome: {
    key: 'otherIncome',
    label: 'Other Income',
    type: 'money',
    unit: '$',
    validators: { min: 0, step: 1 },
    help: 'Additional revenue streams beyond core tax prep.',
  },
  totalExpenses: {
    key: 'totalExpenses',
    label: 'Total Expenses',
    type: 'money',
    unit: '$',
    deriveFrom: ['grossTaxPrepFees'],
    help: 'Target expenses using the 76% industry benchmark.',
  },
  lastYearGrossFees: {
    key: 'lastYearGrossFees',
    label: 'Prior-Year Gross Fees',
    type: 'money',
    unit: '$',
    validators: { min: 0, step: 1 },
    aliases: ['lastYearRevenue'],
    help: 'Recorded gross fees from the prior season.',
  },
  lastYearExpenses: {
    key: 'lastYearExpenses',
    label: 'Prior-Year Expenses',
    type: 'money',
    unit: '$',
    validators: { min: 0, step: 1 },
    help: 'Recorded expenses from the prior season.',
  },
  lastYearReturns: {
    key: 'lastYearReturns',
    label: 'Prior-Year Returns',
    type: 'number',
    unit: '#',
    validators: { min: 0, max: 10000, step: 1 },
    help: 'Return volume filed in the prior season.',
  },
  expectedGrowthPct: {
    key: 'expectedGrowthPct',
    label: 'Expected Growth %',
    type: 'percent',
    unit: '%',
    validators: { min: -50, max: 100, step: 0.5 },
    help: 'Growth assumption for forecasting future returns and fees.',
  },
  handlesTaxRush: {
    key: 'handlesTaxRush',
    label: 'Handles TaxRush',
    type: 'boolean',
    help: 'Whether the store offers the TaxRush product.',
  },
  lastYearRevenue: {
    key: 'lastYearRevenue',
    label: 'Prior-Year Revenue',
    type: 'money',
    unit: '$',
    validators: { min: 0, step: 1 },
    aliases: ['lastYearGrossFees'],
    deriveFrom: ['lastYearGrossFees'],
    help: 'Gross fees minus discounts plus other income for the prior season.',
  },
  netIncome: {
    key: 'netIncome',
    label: 'Net Income',
    type: 'money',
    unit: '$',
    deriveFrom: ['lastYearRevenue', 'lastYearExpenses'],
    help: 'Revenue minus expenses for the selected season.',
  },
};
