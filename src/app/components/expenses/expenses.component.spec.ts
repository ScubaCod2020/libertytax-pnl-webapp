// expenses.component.spec.ts - Unit tests for ExpensesComponent
// Tests dual-entry $↔% sync and sum totals using calc.util

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';

import { ExpensesComponent, ExpensesState, ExpenseBases } from './expenses.component';
import { amountFromPct, pctFromAmount } from '../../utils/calculation.utils';

// Test host component to test input/output behavior
@Component({
  standalone: true,
  imports: [ExpensesComponent],
  template: `
    <app-expenses
      [mode]="mode"
      [region]="region" 
      [bases]="bases"
      (expensesState)="onExpensesState($event)">
    </app-expenses>
  `
})
class TestHostComponent {
  mode = 'existing-store';
  region: 'US' | 'CA' = 'US';
  bases: ExpenseBases = {
    grossFees: 100000,
    taxPrepIncome: 90000,
    salaries: 25000
  };
  lastExpensesState?: ExpensesState;

  onExpensesState(state: ExpensesState): void {
    this.lastExpensesState = state;
  }
}

describe('ExpensesComponent', () => {
  let component: ExpensesComponent;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let expensesComponent: ExpensesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ExpensesComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    expensesComponent = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(expensesComponent).toBeTruthy();
  });

  it('should initialize with expense fields for US region', () => {
    hostComponent.region = 'US';
    fixture.detectChanges();
    
    expect(expensesComponent.expenseFields.length).toBeGreaterThan(0);
    
    // Should not include TaxRush fields for US
    const taxRushFields = expensesComponent.expenseFields.filter(f => f.id.includes('taxRush'));
    expect(taxRushFields.length).toBe(0);
  });

  it('should include TaxRush fields for CA region', () => {
    hostComponent.region = 'CA';
    fixture.detectChanges();
    
    // Should include TaxRush fields for Canada
    const taxRushFields = expensesComponent.expenseFields.filter(f => f.id.includes('taxRush'));
    expect(taxRushFields.length).toBeGreaterThan(0);
  });

  describe('Dual-entry $↔% calculations', () => {
    beforeEach(() => {
      // Set up a known state with good bases
      hostComponent.bases = {
        grossFees: 100000,
        taxPrepIncome: 90000,
        salaries: 25000
      };
      fixture.detectChanges();
    });

    it('should convert percentage to amount when percentage changes', () => {
      // Find a percentage-based field (salaries)
      const salariesIndex = expensesComponent.expenseFields.findIndex(f => f.id === 'salariesPct');
      expect(salariesIndex).toBeGreaterThan(-1);

      const formArray = expensesComponent.formArray;
      const salariesControl = formArray.at(salariesIndex);
      
      // Set percentage and mark as last edited
      salariesControl.get('pct')?.setValue(25);
      salariesControl.get('lastEdited')?.setValue('pct');
      
      // Trigger the calculation
      expensesComponent['updateDualEntryCalculations']();
      
      // Check that amount was calculated correctly
      const expectedAmount = amountFromPct(25, 100000); // 25% of gross fees
      expect(salariesControl.get('amount')?.value).toBe(expectedAmount);
    });

    it('should convert amount to percentage when amount changes', () => {
      // Find a percentage-based field (salaries)  
      const salariesIndex = expensesComponent.expenseFields.findIndex(f => f.id === 'salariesPct');
      const formArray = expensesComponent.formArray;
      const salariesControl = formArray.at(salariesIndex);
      
      // Set amount and mark as last edited
      const testAmount = 30000;
      salariesControl.get('amount')?.setValue(testAmount);
      salariesControl.get('lastEdited')?.setValue('amount');
      
      // Trigger the calculation
      expensesComponent['updateDualEntryCalculations']();
      
      // Check that percentage was calculated correctly
      const expectedPct = pctFromAmount(testAmount, 100000); // 30% of gross fees
      expect(salariesControl.get('pct')?.value).toBeCloseTo(expectedPct, 1);
    });

    it('should sync slider with percentage input', () => {
      const salariesIndex = expensesComponent.expenseFields.findIndex(f => f.id === 'salariesPct');
      const formArray = expensesComponent.formArray;
      const salariesControl = formArray.at(salariesIndex);
      
      // Set slider and mark as last edited
      salariesControl.get('sliderValue')?.setValue(30);
      salariesControl.get('lastEdited')?.setValue('slider');
      
      // Trigger the calculation
      expensesComponent['updateDualEntryCalculations']();
      
      // Check that percentage and amount were updated
      expect(salariesControl.get('pct')?.value).toBe(30);
      const expectedAmount = amountFromPct(30, 100000);
      expect(salariesControl.get('amount')?.value).toBe(expectedAmount);
    });

    it('should handle fixed amount fields correctly', () => {
      // Find a fixed amount field (telephone)
      const telephoneIndex = expensesComponent.expenseFields.findIndex(f => f.id === 'telephoneAmt');
      expect(telephoneIndex).toBeGreaterThan(-1);
      
      const formArray = expensesComponent.formArray;
      const telephoneControl = formArray.at(telephoneIndex);
      
      // Set amount for fixed field
      telephoneControl.get('amount')?.setValue(250);
      
      // Trigger calculation - should not affect percentage
      expensesComponent['updateDualEntryCalculations']();
      
      // Fixed amount fields should not have percentage calculations
      expect(expensesComponent.isFixedAmount(telephoneIndex)).toBe(true);
    });
  });

  describe('Sum totals calculation', () => {
    beforeEach(() => {
      hostComponent.bases = {
        grossFees: 100000,
        taxPrepIncome: 90000,
        salaries: 25000
      };
      fixture.detectChanges();
    });

    it('should calculate total expenses correctly', () => {
      const formArray = expensesComponent.formArray;
      
      // Set specific amounts for known fields
      const salariesIndex = expensesComponent.expenseFields.findIndex(f => f.id === 'salariesPct');
      const telephoneIndex = expensesComponent.expenseFields.findIndex(f => f.id === 'telephoneAmt');
      
      if (salariesIndex >= 0) {
        formArray.at(salariesIndex).get('amount')?.setValue(25000);
      }
      if (telephoneIndex >= 0) {
        formArray.at(telephoneIndex).get('amount')?.setValue(200);
      }
      
      // Trigger calculations
      expensesComponent['calculateTotals']();
      
      // Check total is sum of all amounts
      const expectedTotal = 25000 + 200;
      expect(expensesComponent.currentTotal).toBe(expectedTotal);
    });

    it('should emit correct expenses state with totals', (done) => {
      // Subscribe to the output
      expensesComponent.expensesState.subscribe((state: ExpensesState) => {
        expect(state).toBeDefined();
        expect(state.items).toBeDefined();
        expect(state.total).toBeDefined();
        expect(state.valid).toBeDefined();
        
        // Should have items for each field
        expect(state.items.length).toBe(expensesComponent.expenseFields.length);
        
        // Each item should have required properties
        state.items.forEach(item => {
          expect(item.fieldId).toBeDefined();
          expect(item.amount).toBeDefined();
          expect(item.pct).toBeDefined();
          expect(item.lastEdited).toBeDefined();
          // Note: kpiFlag is view-model only, should not be in emitted state
          expect(item.kpiFlag).toBeUndefined();
        });
        
        done();
      });
      
      // Trigger state emission
      expensesComponent['emitState']();
    });
  });

  describe('KPI flag calculations', () => {
    beforeEach(() => {
      hostComponent.bases = {
        grossFees: 100000,
        taxPrepIncome: 90000,
        salaries: 25000
      };
      fixture.detectChanges();
    });

    it('should set KPI flags based on expense categories', () => {
      const formArray = expensesComponent.formArray;
      
      // Find personnel field (salaries) and set high percentage
      const salariesIndex = expensesComponent.expenseFields.findIndex(f => f.id === 'salariesPct');
      if (salariesIndex >= 0) {
        const salariesControl = formArray.at(salariesIndex);
        salariesControl.get('amount')?.setValue(45000); // 45% of gross fees = high
        
        expensesComponent['updateKpiFlags']();
        
        // Should be red for high personnel percentage
        expect(salariesControl.get('kpiFlag')?.value).toBe('red');
      }
    });

    it('should show green KPI for reasonable expense levels', () => {
      const formArray = expensesComponent.formArray;
      
      // Find personnel field and set reasonable percentage  
      const salariesIndex = expensesComponent.expenseFields.findIndex(f => f.id === 'salariesPct');
      if (salariesIndex >= 0) {
        const salariesControl = formArray.at(salariesIndex);
        salariesControl.get('amount')?.setValue(25000); // 25% = good
        
        expensesComponent['updateKpiFlags']();
        
        // Should be green for reasonable personnel percentage
        expect(salariesControl.get('kpiFlag')?.value).toBe('green');
      }
    });
  });

  describe('calc.util integration', () => {
    it('should use amountFromPct utility correctly', () => {
      const result = amountFromPct(25, 100000);
      expect(result).toBe(25000);
      
      const zeroResult = amountFromPct(0, 100000);
      expect(zeroResult).toBe(0);
      
      const invalidResult = amountFromPct(NaN, 100000);
      expect(invalidResult).toBe(0);
    });

    it('should use pctFromAmount utility correctly', () => {
      const result = pctFromAmount(25000, 100000);
      expect(result).toBe(25);
      
      const zeroResult = pctFromAmount(0, 100000);
      expect(zeroResult).toBe(0);
      
      const invalidResult = pctFromAmount(25000, 0);
      expect(invalidResult).toBe(0);
    });
  });

  describe('Form validation', () => {
    it('should mark form as valid with reasonable values', () => {
      // Form should be valid by default with initial values
      expect(expensesComponent.formArray.valid).toBe(true);
    });

    it('should handle form array changes with debouncing', (done) => {
      // This tests the debounced form subscription
      const formArray = expensesComponent.formArray;
      
      // Make a change
      if (formArray.length > 0) {
        formArray.at(0).get('amount')?.setValue(1000);
      }
      
      // Should trigger debounced update after 120ms
      setTimeout(() => {
        expect(expensesComponent.currentTotal).toBeGreaterThan(0);
        done();
      }, 150);
    });
  });
});
