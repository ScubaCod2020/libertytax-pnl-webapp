// expenses.test-helpers.ts - Test helpers for ExpensesComponent
// Provides mock data and seeding utilities for stable testing

import { ExpensesComponent } from '../app/components/expenses/expenses.component';
import { ExpenseField } from '../app/models/expense.models';

export const MOCK_EXPENSE_FIELDS: ExpenseField[] = [
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
    id: 'rentPct', 
    label: 'Rent',
    description: 'Monthly rent and lease payments',
    category: 'facility',
    calculationBase: 'percentage_gross',
    defaultValue: 8,
    min: 0,
    max: 20,
    step: 0.1
  },
  {
    id: 'suppliesAmt',
    label: 'Supplies',
    description: 'Office supplies and materials',
    category: 'operations',
    calculationBase: 'fixed_amount',
    defaultValue: 1200,
    min: 0,
    max: 5000,
    step: 100
  }
];

/**
 * Seeds ExpensesComponent with mock data for testing
 * Call this before detectChanges() to ensure template has data
 */
export function seedExpenses(component: ExpensesComponent): void {
  // Directly set the mock fields
  component.expenseFields = [...MOCK_EXPENSE_FIELDS];
  
  // Mock the initializeFields method to prevent it from overwriting our mock data
  const originalInitializeFields = (component as any)['initializeFields'];
  (component as any)['initializeFields'] = () => {
    // Do nothing - keep our mock data
  };
  
  // Build the form array manually using the component's private method
  (component as any)['buildFormArray']();
  
  // Set up subscriptions
  (component as any)['setupFormSubscriptions']();
}
