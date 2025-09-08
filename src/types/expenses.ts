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
    id: 'telephoneAmt',
    label: 'Telephone',
    category: 'facility',
    calculationBase: 'fixed_amount',
    defaultValue: 200,
    min: 0,
    max: 1000,
    step: 10,
    description: 'Monthly phone/internet costs'
  },
  {
    id: 'utilitiesAmt',
    label: 'Utilities', 
    category: 'facility',
    calculationBase: 'fixed_amount',
    defaultValue: 300,
    min: 0,
    max: 1500,
    step: 10,
    description: 'Monthly utilities (electric, gas, water)'
  },

  // Operations (8 fields)
  {
    id: 'localAdvAmt',
    label: 'Local Advertising',
    category: 'operations',
    calculationBase: 'fixed_amount', 
    defaultValue: 500,
    min: 0,
    max: 5000,
    step: 50,
    description: 'Local marketing and advertising costs'
  },
  {
    id: 'insuranceAmt',
    label: 'Insurance',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 150,
    min: 0,
    max: 1000,
    step: 10,
    description: 'Business insurance premiums'
  },
  {
    id: 'postageAmt',
    label: 'Postage',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 100,
    min: 0,
    max: 500,
    step: 10,
    description: 'Mailing and shipping costs'
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
    id: 'duesAmt',
    label: 'Dues',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 200,
    min: 0,
    max: 1000,
    step: 10,
    description: 'Professional dues and subscriptions'
  },
  {
    id: 'bankFeesAmt',
    label: 'Bank Fees',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 100,
    min: 0,
    max: 500,
    step: 10,
    description: 'Banking and credit card fees'
  },
  {
    id: 'maintenanceAmt',
    label: 'Maintenance',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 150,
    min: 0,
    max: 1000,
    step: 10,
    description: 'Equipment and facility maintenance'
  },
  {
    id: 'travelEntAmt',
    label: 'Travel/Entertainment',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 200,
    min: 0,
    max: 2000,
    step: 25,
    description: 'Business travel and entertainment'
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
    defaultValue: 2.5,
    min: 0,
    max: 10,
    step: 0.1,
    description: 'Other miscellaneous expenses'
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
  telephoneAmt: number
  utilitiesAmt: number
  
  // Operations
  localAdvAmt: number
  insuranceAmt: number
  postageAmt: number
  suppliesPct: number
  duesAmt: number
  bankFeesAmt: number
  maintenanceAmt: number
  travelEntAmt: number
  
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
