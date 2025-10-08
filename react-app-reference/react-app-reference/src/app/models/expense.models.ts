// expense.models.ts - Expense field definitions and data structures
// Based on React app expense field definitions

export interface ExpenseField {
  id: string;
  label: string;
  description?: string;
  category: ExpenseCategory;
  calculationBase: 'percentage_gross' | 'percentage_tp_income' | 'percentage_salaries' | 'fixed_amount';
  regionSpecific?: 'US' | 'CA' | 'both';
  defaultValue: number;
  min: number;
  max: number;
  step: number;
}

export type ExpenseCategory = 'personnel' | 'facility' | 'operations' | 'franchise' | 'misc';

export interface ExpenseCategoryInfo {
  id: ExpenseCategory;
  label: string;
  icon: string;
  description: string;
}

// Expense field definitions matching React app
export const expenseFields: ExpenseField[] = [
  // Personnel
  {
    id: 'salariesPct',
    label: 'Salaries',
    description: 'Base salary costs for tax preparers and staff',
    category: 'personnel',
    calculationBase: 'percentage_gross',
    defaultValue: 25,
    min: 0,
    max: 50,
    step: 0.5
  },
  {
    id: 'empDeductionsPct',
    label: 'Employee Deductions',
    description: 'Payroll taxes, benefits, and other employee costs',
    category: 'personnel',
    calculationBase: 'percentage_salaries',
    defaultValue: 15,
    min: 0,
    max: 25,
    step: 0.5
  },
  
  // Facility
  {
    id: 'rentPct',
    label: 'Rent',
    description: 'Office space rental costs',
    category: 'facility',
    calculationBase: 'percentage_tp_income',
    defaultValue: 8,
    min: 0,
    max: 20,
    step: 0.5
  },
  {
    id: 'telephoneAmt',
    label: 'Telephone',
    description: 'Phone and internet services',
    category: 'facility',
    calculationBase: 'fixed_amount',
    defaultValue: 200,
    min: 0,
    max: 1000,
    step: 10
  },
  {
    id: 'utilitiesAmt',
    label: 'Utilities',
    description: 'Electricity, heating, water, etc.',
    category: 'facility',
    calculationBase: 'fixed_amount',
    defaultValue: 300,
    min: 0,
    max: 1500,
    step: 25
  },
  
  // Operations
  {
    id: 'localAdvAmt',
    label: 'Local Advertising',
    description: 'Marketing and promotional costs',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 500,
    min: 0,
    max: 5000,
    step: 50
  },
  {
    id: 'insuranceAmt',
    label: 'Insurance',
    description: 'Business insurance coverage',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 200,
    min: 0,
    max: 2000,
    step: 25
  },
  {
    id: 'postageAmt',
    label: 'Postage',
    description: 'Shipping and mailing costs',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 100,
    min: 0,
    max: 1000,
    step: 10
  },
  {
    id: 'suppliesPct',
    label: 'Office Supplies',
    description: 'Paper, forms, and office materials',
    category: 'operations',
    calculationBase: 'percentage_tp_income',
    defaultValue: 2,
    min: 0,
    max: 10,
    step: 0.1
  },
  {
    id: 'duesAmt',
    label: 'Dues & Subscriptions',
    description: 'Professional memberships and software licenses',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 150,
    min: 0,
    max: 1000,
    step: 25
  },
  {
    id: 'bankFeesAmt',
    label: 'Bank Fees',
    description: 'Banking and payment processing fees',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 100,
    min: 0,
    max: 500,
    step: 10
  },
  {
    id: 'maintenanceAmt',
    label: 'Maintenance',
    description: 'Equipment and facility maintenance',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 200,
    min: 0,
    max: 1000,
    step: 25
  },
  {
    id: 'travelEntAmt',
    label: 'Travel & Entertainment',
    description: 'Business travel and client entertainment',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 300,
    min: 0,
    max: 2000,
    step: 50
  },
  
  // Franchise
  {
    id: 'royaltiesPct',
    label: 'Tax Prep Royalties',
    description: 'Franchise royalties for tax preparation services',
    category: 'franchise',
    calculationBase: 'percentage_tp_income',
    defaultValue: 8,
    min: 0,
    max: 15,
    step: 0.1
  },
  {
    id: 'advRoyaltiesPct',
    label: 'Advertising Royalties',
    description: 'Franchise advertising fund contributions',
    category: 'franchise',
    calculationBase: 'percentage_tp_income',
    defaultValue: 2,
    min: 0,
    max: 5,
    step: 0.1
  },
  {
    id: 'taxRushRoyaltiesPct',
    label: 'TaxRush Royalties',
    description: 'Franchise royalties for TaxRush services (Canada only)',
    category: 'franchise',
    calculationBase: 'percentage_tp_income',
    regionSpecific: 'CA',
    defaultValue: 3,
    min: 0,
    max: 8,
    step: 0.1
  },
  
  // Miscellaneous
  {
    id: 'miscPct',
    label: 'Miscellaneous',
    description: 'Other operating expenses not covered above',
    category: 'misc',
    calculationBase: 'percentage_tp_income',
    defaultValue: 1,
    min: 0,
    max: 5,
    step: 0.1
  }
];

export const expenseCategories: ExpenseCategoryInfo[] = [
  {
    id: 'personnel',
    label: 'Personnel',
    icon: '👥',
    description: 'Staff salaries and employee-related costs'
  },
  {
    id: 'facility',
    label: 'Facility',
    icon: '🏢',
    description: 'Office space and utility costs'
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: '⚙️',
    description: 'Day-to-day operational expenses'
  },
  {
    id: 'franchise',
    label: 'Franchise',
    icon: '🏪',
    description: 'Franchise fees and royalties'
  },
  {
    id: 'misc',
    label: 'Miscellaneous',
    icon: '📝',
    description: 'Other operating expenses'
  }
];

// Utility functions
export function getFieldsByCategory(category: ExpenseCategory): ExpenseField[] {
  return expenseFields.filter(field => field.category === category);
}

export function getFieldsForRegion(region: 'US' | 'CA'): ExpenseField[] {
  return expenseFields.filter(field => 
    !field.regionSpecific || 
    field.regionSpecific === region || 
    field.regionSpecific === 'both'
  );
}

export function getFieldById(id: string): ExpenseField | undefined {
  return expenseFields.find(field => field.id === id);
}

// Core function for ExpensesComponent - filters expense fields for FormArray
export function expensesFor(mode: string, region: 'US' | 'CA', storeType?: string): ExpenseField[] {
  return expenseFields.filter(field => {
    // Region filtering
    const regionMatch = !field.regionSpecific || 
      field.regionSpecific === region || 
      field.regionSpecific === 'both';
    
    if (!regionMatch) return false;
    
    // TaxRush-specific fields only for CA region
    const isTaxRushField = field.id.includes('taxRush');
    if (isTaxRushField && region !== 'CA') return false;
    
    // For existing store mode, include all relevant fields
    if (mode === 'existing-store') return true;
    
    // For wizard mode, exclude advanced fields
    if (mode === 'wizard') {
      const advancedFields = ['empDeductionsPct', 'duesAmt', 'bankFeesAmt', 'maintenanceAmt', 'travelEntAmt'];
      return !advancedFields.includes(field.id);
    }
    
    return true;
  });
}

// Inputs Panel Data Interface
export interface InputsPanelData {
  region: 'US' | 'CA';
  scenario: 'Custom' | 'Good' | 'Better' | 'Best';
  avgNetFee: number;
  taxPrepReturns: number;
  taxRushReturns: number;
  discountsPct: number;
  otherIncome: number;
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
  handlesTaxRush?: boolean;
  hasOtherIncome?: boolean;
}
