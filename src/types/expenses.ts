// Enhanced expense structure with 17 categories from Liberty Tax P&L analysis
// Organized into logical groups with proper validation and calculation bases

export interface ExpenseField {
  id: string
  label: string
  category: ExpenseCategory
  calculationBase: 'percentage_gross' | 'percentage_salaries' | 'percentage_tp_income' | 'fixed_amount'
  defaultValue: number
  min: number
  max: number
  step: number
  description?: string
  regionSpecific?: 'US' | 'CA' | 'both'
}

export type ExpenseCategory = 'personnel' | 'facility' | 'operations' | 'franchise' | 'misc'

export const expenseCategories = {
  personnel: {
    label: 'Personnel',
    description: 'Staff-related expenses'
  },
  facility: {
    label: 'Facility',
    description: 'Office and location costs'
  },
  operations: {
    label: 'Operations', 
    description: 'Day-to-day operational expenses'
  },
  franchise: {
    label: 'Franchise',
    description: 'Franchise fees and royalties'
  },
  misc: {
    label: 'Miscellaneous',
    description: 'Other and miscellaneous expenses'
  }
} as const

// Complete 17-category expense structure
export const expenseFields: ExpenseField[] = [
  // Personnel (2 fields)
  {
    id: 'salariesPct',
    label: 'Salaries',
    category: 'personnel',
    calculationBase: 'percentage_gross',
    defaultValue: 25,
    min: 0,
    max: 60,
    step: 0.1,
    description: 'Staff salaries as % of gross fees'
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
    description: 'Payroll taxes, benefits as % of salaries'
  },

  // Facility (3 fields)
  {
    id: 'rentPct',
    label: 'Rent',
    category: 'facility', 
    calculationBase: 'percentage_gross',
    defaultValue: 18,
    min: 0,
    max: 40,
    step: 0.1,
    description: 'Office rent as % of gross fees'
  },
  {
    id: 'telephonePct',
    label: 'Telephone',
    category: 'facility',
    calculationBase: 'percentage_gross',
    defaultValue: 0.5,
    min: 0,
    max: 3,
    step: 0.1,
    description: 'Phone/internet costs as % of gross fees'
  },
  {
    id: 'utilitiesPct',
    label: 'Utilities', 
    category: 'facility',
    calculationBase: 'percentage_gross',
    defaultValue: 1.2,
    min: 0,
    max: 5,
    step: 0.1,
    description: 'Utilities (electric, gas, water) as % of gross fees'
  },

  // Operations (8 fields)
  {
    id: 'localAdvPct',
    label: 'Local Advertising',
    category: 'operations',
    calculationBase: 'percentage_gross', 
    defaultValue: 2,
    min: 0,
    max: 8,
    step: 0.1,
    description: 'Local marketing and advertising as % of gross fees'
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
    description: 'Business insurance premiums as % of gross fees'
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
    description: 'Mailing and shipping costs as % of gross fees'
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
    description: 'Office supplies as % of gross fees'
  },
  {
    id: 'duesPct',
    label: 'Dues',
    category: 'operations',
    calculationBase: 'percentage_gross',
    defaultValue: 0.8,
    min: 0,
    max: 3,
    step: 0.1,
    description: 'Professional dues and subscriptions as % of gross fees'
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
    description: 'Banking and credit card fees as % of gross fees'
  },
  {
    id: 'maintenancePct',
    label: 'Maintenance',
    category: 'operations',
    calculationBase: 'percentage_gross',
    defaultValue: 0.6,
    min: 0,
    max: 3,
    step: 0.1,
    description: 'Equipment and facility maintenance as % of gross fees'
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
    description: 'Business travel and entertainment as % of gross fees'
  },

  // Franchise (3 fields)
  {
    id: 'royaltiesPct',
    label: 'Tax Prep Royalties',
    category: 'franchise',
    calculationBase: 'percentage_tp_income',
    defaultValue: 14,
    min: 0,
    max: 25,
    step: 0.1,
    description: 'Franchise royalties on tax prep income'
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
    description: 'Franchise advertising fees on tax prep income'
  },
  {
    id: 'taxRushRoyaltiesPct',
    label: 'TaxRush Franchise',
    category: 'franchise',
    calculationBase: 'percentage_tp_income', 
    defaultValue: 0,
    min: 0,
    max: 20,
    step: 0.1,
    description: 'TaxRush franchise fees (CA only)',
    regionSpecific: 'CA'
  },

  // Miscellaneous (1 field)
  {
    id: 'miscPct',
    label: 'Miscellaneous',
    category: 'misc',
    calculationBase: 'percentage_gross',
    defaultValue: 1,
    min: 0,
    max: 5,
    step: 0.1,
    description: 'Other miscellaneous expenses as % of gross fees'
  }
]

// Helper functions for working with expense fields
export function getFieldsByCategory(category: ExpenseCategory): ExpenseField[] {
  return expenseFields.filter(field => field.category === category)
}

export function getFieldById(id: string): ExpenseField | undefined {
  return expenseFields.find(field => field.id === id)
}

export function getFieldsForRegion(region: 'US' | 'CA'): ExpenseField[] {
  return expenseFields.filter(field => 
    !field.regionSpecific || field.regionSpecific === region || field.regionSpecific === 'both'
  )
}

// Type for all expense field values (used in wizard and app state)
export type ExpenseValues = {
  // Personnel
  salariesPct: number
  empDeductionsPct: number
  
  // Facility  
  rentPct: number
  telephonePct: number
  utilitiesPct: number
  
  // Operations
  localAdvPct: number
  insurancePct: number
  postagePct: number
  suppliesPct: number
  duesPct: number
  bankFeesPct: number
  maintenancePct: number
  travelEntPct: number
  
  // Franchise
  royaltiesPct: number
  advRoyaltiesPct: number
  taxRushRoyaltiesPct: number
  
  // Miscellaneous
  miscPct: number
}

// Default expense values
export const defaultExpenseValues: ExpenseValues = expenseFields.reduce((acc, field) => {
  acc[field.id as keyof ExpenseValues] = field.defaultValue
  return acc
}, {} as ExpenseValues)
