// expenses.component.ts - Dual-entry expense management with FormArray
// Implements $↔% behavior, slider support, and KPI flags per requirements

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, combineLatest } from 'rxjs';

import { ExpenseField, expensesFor, ExpenseCategory } from '../../models/expense.models';
import { amountFromPct, pctFromAmount, getCalculationBase, formatCurrency, formatPercentage } from '../../utils/calculation.utils';

// Interfaces for component communication
export interface ExpenseRowData {
  fieldId: string;
  amount: number;
  pct: number;
  sliderValue?: number;
  lastEdited: 'amount' | 'pct' | 'slider';
  kpiFlag?: 'red' | 'yellow' | 'green' | null; // View-model only
}

export interface ExpensesState {
  items: ExpenseRowData[];
  total: number;
  valid: boolean;
}

export interface ExpenseBases {
  grossFees: number;
  taxPrepIncome: number;
  salaries: number;
}

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="expenses-container">
      <h3 class="expenses-title">📊 Expense Management</h3>
      
      <!-- Total Summary -->
      <div class="expenses-summary">
        <div class="total-display">
          <span class="total-label">Total Expenses:</span>
          <span class="total-amount" [class]="getTotalKpiClass()">{{ formatCurrency(currentTotal) }}</span>
        </div>
        <div class="validation-status" [class.valid]="formArray.valid" [class.invalid]="!formArray.valid">
          {{ formArray.valid ? '✅ Valid' : '❌ Invalid' }}
        </div>
      </div>

      <!-- Expense Rows -->
      <form [formGroup]="mainForm">
        <div formArrayName="expenses" class="expenses-list">
          <div *ngFor="let rowGroup of formArray.controls; let i = index" 
               [formGroupName]="i" 
               class="expense-row" 
               [class]="getRowClass(i)">
            
            <ng-container *ngIf="getField(i); let field">
            <div class="expense-row-header">
              <label class="expense-label">
                {{ field?.label || 'Unknown Field' }}
                <span class="kpi-badge" [class]="getKpiClass(i)">{{ getKpiBadge(i) }}</span>
              </label>
              <button type="button" 
                      class="help-button" 
                      [title]="field?.description || ''"
                      *ngIf="field?.description">
                ℹ️
              </button>
            </div>

              <div class="expense-controls">
              <!-- Percentage Input (for percentage-based fields) -->
              <div *ngIf="!isFixedAmount(i) && field" class="input-group">
                <input type="number"
                       formControlName="pct"
                       (focus)="onFieldFocus(i, 'pct')"
                       [min]="field?.min || 0"
                       [max]="field?.max || 100"
                       [step]="field?.step || 0.1"
                       class="pct-input">
                <span class="unit-symbol">%</span>
              </div>

              <!-- Amount Input -->
              <div class="input-group" *ngIf="field">
                <span class="unit-symbol">$</span>
                <input type="number"
                       formControlName="amount"
                       (focus)="onFieldFocus(i, 'amount')"
                       [min]="0"
                       [step]="isFixedAmount(i) ? (field?.step || 100) : 1"
                       class="amount-input">
              </div>

              <!-- Equals symbol for dual-entry -->
              <span *ngIf="!isFixedAmount(i) && field" class="equals-symbol">=</span>
            </div>

            <!-- Slider (for percentage-based fields) -->
            <div *ngIf="!isFixedAmount(i) && field" class="slider-container">
              <input type="range"
                     formControlName="sliderValue"
                     (focus)="onFieldFocus(i, 'slider')"
                     [min]="field?.min || 0"
                     [max]="Math.min(field?.max || 50, 50)"
                     [step]="field?.step || 0.1"
                     class="expense-slider">
            </div>

            <!-- Field Description -->
            <div *ngIf="field?.description" class="field-description">
              {{ field.description }}
            </div>
            </ng-container>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .expenses-container {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 1rem;
      background: #fafafa;
    }

    .expenses-title {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .expenses-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .total-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .total-label {
      font-weight: 500;
      color: #6b7280;
    }

    .total-amount {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .total-amount.kpi-ok { color: #059669; }
    .total-amount.kpi-warn { color: #d97706; }
    .total-amount.kpi-bad { color: #dc2626; }

    .validation-status {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .validation-status.valid { color: #059669; }
    .validation-status.invalid { color: #dc2626; }

    .expenses-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .expense-row {
      background: white;
      padding: 1rem;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .expense-row.taxrush-field {
      border: 2px solid #3b82f6;
      background: #f8fafc;
    }

    .expense-row-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .expense-label {
      font-weight: 500;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .kpi-badge {
      font-size: 0.75rem;
      padding: 0.125rem 0.375rem;
      border-radius: 12px;
      font-weight: 600;
    }

    .kpi-badge.kpi-ok {
      background: #d1fae5;
      color: #047857;
    }

    .kpi-badge.kpi-warn {
      background: #fef3c7;
      color: #92400e;
    }

    .kpi-badge.kpi-bad {
      background: #fee2e2;
      color: #b91c1c;
    }

    .help-button {
      background: none;
      border: none;
      color: #6b7280;
      cursor: help;
      font-size: 0.875rem;
    }

    .expense-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .unit-symbol,
    .equals-symbol {
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .pct-input,
    .amount-input {
      width: 80px;
      padding: 0.375rem 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      text-align: right;
      font-size: 0.875rem;
    }

    .pct-input:focus,
    .amount-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 1px #3b82f6;
    }

    .slider-container {
      margin-bottom: 0.5rem;
    }

    .expense-slider {
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: #e5e7eb;
      outline: none;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .expense-slider:hover {
      opacity: 1;
    }

    .field-description {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid #e5e7eb;
    }
  `]
})
export class ExpensesComponent implements OnInit, OnDestroy, OnChanges {
  @Input() mode: string = 'existing-store';
  @Input() region: 'US' | 'CA' = 'US';
  @Input() storeType?: string;
  @Input() bases: ExpenseBases = { grossFees: 0, taxPrepIncome: 0, salaries: 0 };
  
  @Output() expensesState = new EventEmitter<ExpensesState>();

  private destroy$ = new Subject<void>();
  
  mainForm: FormGroup;
  expenseFields: ExpenseField[] = [];
  currentTotal = 0;

  constructor(private fb: FormBuilder) {
    this.mainForm = this.fb.group({
      expenses: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.initializeFields();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] || changes['region'] || changes['storeType']) {
      this.initializeFields();
    }
    if (changes['bases'] && this.bases) {
      this.updateDualEntryCalculations();
    }
  }

  get formArray(): FormArray {
    return this.mainForm.get('expenses') as FormArray;
  }

  private initializeFields(): void {
    this.expenseFields = expensesFor(this.mode, this.region, this.storeType);
    this.buildFormArray();
  }

  private buildFormArray(): void {
    const controls = this.expenseFields.map(field => {
      return this.fb.group({
        fieldId: [field.id],
        amount: [0],
        pct: [field.defaultValue || 0],
        sliderValue: [field.defaultValue || 0],
        lastEdited: ['pct'] // Default to pct for initial state
      });
    });

    this.formArray.clear();
    controls.forEach(control => this.formArray.push(control));
    
    // Initialize calculations after form is built
    setTimeout(() => this.updateDualEntryCalculations(), 0);
  }

  private setupFormSubscriptions(): void {
    // Debounced value changes for dual-entry calculations
    combineLatest([
      this.formArray.valueChanges.pipe(debounceTime(120)),
      this.formArray.statusChanges.pipe(debounceTime(120))
    ]).pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe(([values, status]) => {
      this.updateDualEntryCalculations();
      this.calculateTotals();
      this.updateKpiFlags();
      this.emitState();
    });
  }

  private updateDualEntryCalculations(): void {
    this.formArray.controls.forEach((control, index) => {
      const field = this.expenseFields[index];
      const formGroup = control as FormGroup;
      const lastEdited = formGroup.get('lastEdited')?.value;
      
      if (this.isFixedAmount(index)) {
        // Fixed amounts: amount = amount, no percentage calculation
        return;
      }

      const base = getCalculationBase(field, this.bases);
      if (base === 0) return; // Skip calculations when base is not available
      
      const pctControl = formGroup.get('pct');
      const amountControl = formGroup.get('amount');
      const sliderControl = formGroup.get('sliderValue');
      
      if (!pctControl || !amountControl || !sliderControl) return;

      // Apply dual-entry logic based on last edited field
      if (lastEdited === 'pct' || lastEdited === 'slider') {
        const pctValue = lastEdited === 'slider' ? sliderControl.value : pctControl.value;
        const newAmount = amountFromPct(pctValue, base);
        
        // Use emitEvent: false to prevent circular updates
        amountControl.setValue(Math.round(newAmount), { emitEvent: false });
        if (lastEdited === 'pct') {
          sliderControl.setValue(pctValue, { emitEvent: false });
        } else {
          pctControl.setValue(pctValue, { emitEvent: false });
        }
      } else if (lastEdited === 'amount') {
        const newPct = pctFromAmount(amountControl.value, base);
        pctControl.setValue(Math.round(newPct * 10) / 10, { emitEvent: false });
        sliderControl.setValue(Math.round(newPct * 10) / 10, { emitEvent: false });
      }
    });
  }

  private calculateTotals(): void {
    this.currentTotal = this.formArray.controls.reduce((total, control) => {
      const amount = control.get('amount')?.value || 0;
      return total + amount;
    }, 0);
  }

  private updateKpiFlags(): void {
    // Update KPI flags for each row (view-model only)
    this.formArray.controls.forEach((control, index) => {
      const field = this.expenseFields[index];
      const amount = control.get('amount')?.value || 0;
      const base = getCalculationBase(field, this.bases);
      
      let kpiFlag: 'red' | 'yellow' | 'green' | null = null;
      
      if (base > 0 && amount > 0) {
        const pct = (amount / base) * 100;
        
        // Simple KPI logic based on field category and percentage
        switch (field.category) {
          case 'personnel':
            if (pct <= 30) kpiFlag = 'green';
            else if (pct <= 40) kpiFlag = 'yellow';
            else kpiFlag = 'red';
            break;
          case 'facility':
            if (pct <= 10) kpiFlag = 'green';
            else if (pct <= 15) kpiFlag = 'yellow';
            else kpiFlag = 'red';
            break;
          case 'franchise':
            if (pct <= 8) kpiFlag = 'green';
            else if (pct <= 12) kpiFlag = 'yellow';
            else kpiFlag = 'red';
            break;
          default:
            if (pct <= 5) kpiFlag = 'green';
            else if (pct <= 8) kpiFlag = 'yellow';
            else kpiFlag = 'red';
        }
      }
      
      // Store KPI flag in form for view access (not emitted to parent)
      const formGroup = control as FormGroup;
      if (!formGroup.contains('kpiFlag')) {
        formGroup.addControl('kpiFlag', new FormControl(kpiFlag));
      } else {
        formGroup.get('kpiFlag')?.setValue(kpiFlag);
      }
    });
  }

  private emitState(): void {
    const items: ExpenseRowData[] = this.formArray.controls.map((control, index) => ({
      fieldId: this.expenseFields[index].id,
      amount: control.get('amount')?.value || 0,
      pct: control.get('pct')?.value || 0,
      sliderValue: control.get('sliderValue')?.value,
      lastEdited: control.get('lastEdited')?.value || 'pct'
      // Note: kpiFlag is view-model only, not included in emitted state
    }));

    const state: ExpensesState = {
      items,
      total: this.currentTotal,
      valid: this.formArray.valid
    };

    this.expensesState.emit(state);
  }

  // Event handlers
  onFieldFocus(index: number, field: 'amount' | 'pct' | 'slider'): void {
    const control = this.formArray.at(index) as FormGroup;
    control.get('lastEdited')?.setValue(field);
  }

  // Template helper methods
  isFixedAmount(index: number): boolean {
    return this.expenseFields[index]?.calculationBase === 'fixed_amount';
  }

  getRowClass(index: number): string {
    const field = this.expenseFields[index];
    return field?.id.includes('taxRush') ? 'taxrush-field' : '';
  }

  getField(index: number): ExpenseField | undefined {
    return this.expenseFields[index];
  }

  getKpiClass(index: number): string {
    const control = this.formArray.at(index);
    const kpiFlag = control.get('kpiFlag')?.value;
    return kpiFlag ? `kpi-${kpiFlag}` : '';
  }

  getKpiBadge(index: number): string {
    const control = this.formArray.at(index);
    const kpiFlag = control.get('kpiFlag')?.value;
    switch (kpiFlag) {
      case 'green': return '✓';
      case 'yellow': return '⚠';
      case 'red': return '⚠';
      default: return '';
    }
  }

  getTotalKpiClass(): string {
    if (this.currentTotal === 0) return '';
    const totalPct = this.bases.grossFees > 0 ? (this.currentTotal / this.bases.grossFees) * 100 : 0;
    
    if (totalPct <= 75) return 'kpi-ok';
    if (totalPct <= 85) return 'kpi-warn';
    return 'kpi-bad';
  }

  formatCurrency(value: number): string {
    return formatCurrency(value);
  }
}
