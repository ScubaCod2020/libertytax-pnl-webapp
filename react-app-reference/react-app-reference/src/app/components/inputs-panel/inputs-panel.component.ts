// inputs-panel.component.ts - Dashboard inputs with sliders and expense management
// Based on React app InputsPanel component

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseField, getFieldsForRegion, getFieldsByCategory, InputsPanelData } from '../../models/expense.models';
import { formatCurrency, formatNumber } from '../../utils/calculation.utils';
import { debugLog, CalculationValidator } from '../../utils/debug.utils';

@Component({
  selector: 'app-inputs-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card inputs-panel-card">
      <div class="card-title">Inputs</div>

      <!-- Scenario Selector -->
      <div class="scenario-section">
        <label>
          <strong>Scenario:</strong>&nbsp;
          <select
            [(ngModel)]="data.scenario"
            (ngModelChange)="onScenarioChange($event)"
            class="scenario-select">
            <option value="Custom">Custom</option>
            <option value="Good">Good</option>
            <option value="Better">Better</option>
            <option value="Best">Best</option>
          </select>
        </label>
      </div>

      <!-- Income Drivers Section -->
      <div class="income-drivers-section">
        <div class="section-header">
          💰 Income Drivers
        </div>

        <!-- Average Net Fee with Slider -->
        <div class="input-with-slider">
          <div class="input-row">
            <label class="input-label">Average Net Fee</label>
            <div class="input-controls">
              <span class="currency-symbol">$</span>
              <input
                type="number"
                [(ngModel)]="data.avgNetFee"
                (ngModelChange)="onAvgNetFeeChange($event)"
                min="50"
                max="500"
                step="1"
                class="number-input">
            </div>
          </div>
          <input
            type="range"
            [(ngModel)]="data.avgNetFee"
            (ngModelChange)="onAvgNetFeeChange($event)"
            min="50"
            max="500"
            step="1"
            class="slider">
        </div>

        <!-- Tax-Prep Returns with Slider -->
        <div class="input-with-slider">
          <div class="input-row">
            <label class="input-label">Tax-Prep Returns</label>
            <div class="input-controls">
              <span class="number-symbol">#</span>
              <input
                type="number"
                [(ngModel)]="data.taxPrepReturns"
                (ngModelChange)="onTaxPrepReturnsChange($event)"
                min="100"
                max="10000"
                step="1"
                class="number-input">
            </div>
          </div>
          <input
            type="range"
            [(ngModel)]="data.taxPrepReturns"
            (ngModelChange)="onTaxPrepReturnsChange($event)"
            min="100"
            max="5000"
            step="1"
            class="slider">
        </div>

        <!-- TaxRush Returns (Canada only) with Slider -->
        <div *ngIf="data.region === 'CA'" class="taxrush-input-section">
          <div class="input-with-slider">
            <div class="input-row">
              <label class="input-label">TaxRush Returns</label>
              <div class="input-controls">
                <span class="number-symbol">#</span>
                <input
                  type="number"
                  [(ngModel)]="data.taxRushReturns"
                  (ngModelChange)="onTaxRushReturnsChange($event)"
                  min="0"
                  max="1000"
                  step="1"
                  class="number-input taxrush-input">
              </div>
            </div>
            <input
              type="range"
              [(ngModel)]="data.taxRushReturns"
              (ngModelChange)="onTaxRushReturnsChange($event)"
              min="0"
              max="1000"
              step="1"
              class="slider">
          </div>
        </div>

        <!-- Customer Discounts with Dual Input and Slider -->
        <div class="input-with-slider">
          <div class="input-row">
            <label class="input-label">Customer Discounts</label>
            <div class="dual-input-controls">
              <div class="input-group">
                <input
                  type="number"
                  [(ngModel)]="data.discountsPct"
                  (ngModelChange)="onDiscountsPctChange($event)"
                  min="0"
                  max="50"
                  step="0.1"
                  class="number-input">
                <span class="percentage-symbol">%</span>
              </div>
              <span class="equals-symbol">=</span>
              <div class="input-group">
                <span class="currency-symbol">$</span>
                <input
                  type="number"
                  [value]="discountDollarAmount"
                  (ngModelChange)="onDiscountDollarChange(+$event)"
                  min="0"
                  step="1"
                  class="number-input dollar-input">
              </div>
            </div>
          </div>
          <input
            type="range"
            [(ngModel)]="data.discountsPct"
            (ngModelChange)="onDiscountsPctChange($event)"
            min="0"
            max="25"
            step="1"
            class="slider">
        </div>

        <!-- Other Income (conditional) -->
        <div *ngIf="data.hasOtherIncome" class="input-with-slider">
          <div class="input-row">
            <label class="input-label">Other Income</label>
            <div class="input-controls">
              <button
                type="button"
                title="Additional revenue sources (e.g., notary services, business consulting)"
                class="help-button">
                ℹ️
              </button>
              <span class="currency-symbol">$</span>
              <input
                type="number"
                [(ngModel)]="data.otherIncome"
                (ngModelChange)="onOtherIncomeChange($event)"
                min="0"
                max="50000"
                step="100"
                class="number-input">
            </div>
          </div>
        </div>
      </div>

      <!-- Expense Management Section -->
      <div class="expense-management-section">
        <div class="section-header">
          📊 Expense Management
        </div>
        
        <div class="expense-fields">
          <div *ngFor="let field of expenseFields" class="expense-field" [ngClass]="getFieldStyle(field)">
            <div class="field-header">
              <label class="field-label" [class.locked]="isFieldLocked(field)">
                {{ field.label }}
                <span *ngIf="isFieldLocked(field)" class="locked-text">(Locked)</span>
              </label>
              
              <div class="field-controls">
                <button
                  *ngIf="field.description"
                  type="button"
                  [title]="field.description"
                  class="help-button">
                  ℹ️
                </button>
                
                <!-- Percentage/Fixed Amount Input -->
                <div class="input-group">
                  <span *ngIf="isFixedAmount(field)" class="currency-symbol">$</span>
                  <input
                    type="number"
                    [value]="getFieldValue(field)"
                    (ngModelChange)="onFieldValueChange(field, +$event)"
                    [min]="field.min"
                    [max]="isFixedAmount(field) ? undefined : 100"
                    [step]="field.step"
                    [disabled]="isFieldDisabled(field) || isFieldLocked(field)"
                    class="field-input"
                    [class.taxrush-field]="isTaxRushField(field)">
                  <span *ngIf="!isFixedAmount(field)" class="percentage-symbol">%</span>
                </div>

                <!-- Dollar Input for percentage-based fields -->
                <div *ngIf="!isFixedAmount(field) && !isFieldLocked(field)" class="dollar-input-group">
                  <span class="equals-symbol">=</span>
                  <div class="input-group">
                    <span class="currency-symbol">$</span>
                    <input
                      type="number"
                      [value]="getDollarValue(field)"
                      (ngModelChange)="onDollarValueChange(field, +$event)"
                      min="0"
                      step="1"
                      [disabled]="isFieldDisabled(field) || grossFees === 0"
                      class="field-input dollar-input">
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Slider for percentage-based fields -->
            <input
              *ngIf="!isFixedAmount(field) && !isFieldLocked(field)"
              type="range"
              [value]="getFieldValue(field)"
              (ngModelChange)="onFieldValueChange(field, +$event)"
              [min]="field.min"
              [max]="Math.min(field.max, 50)"
              [step]="field.step"
              [disabled]="isFieldDisabled(field)"
              class="field-slider">
            
            <div *ngIf="field.description" class="field-description">
              {{ field.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inputs-panel-card {
      min-width: 420px;
      max-width: 500px;
    }

    .scenario-section {
      margin-bottom: 1.5rem;
    }

    .scenario-select {
      padding: 0.25rem;
      border-radius: 4px;
      border: 1px solid #d1d5db;
      font-size: 0.875rem;
    }

    .income-drivers-section,
    .expense-management-section {
      margin-bottom: 1.5rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 1rem;
      background-color: #fafafa;
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      font-weight: 600;
      font-size: 1.1rem;
      border-bottom: 2px solid;
      padding-bottom: 0.25rem;
    }

    .income-drivers-section .section-header {
      color: #059669;
      border-bottom-color: #059669;
    }

    .expense-management-section .section-header {
      color: #6b7280;
      border-bottom-color: #6b7280;
    }

    .input-with-slider {
      margin-bottom: 0.75rem;
    }

    .input-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .input-label {
      font-size: 0.9rem;
      font-weight: 500;
    }

    .input-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dual-input-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .dollar-input-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .currency-symbol,
    .number-symbol,
    .percentage-symbol {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .equals-symbol {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .number-input,
    .field-input {
      width: 80px;
      padding: 0.25rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.8rem;
      text-align: right;
    }

    .dollar-input {
      width: 80px;
      background-color: #f9fafb;
    }

    .taxrush-input {
      background-color: #f0f9ff;
    }

    .slider,
    .field-slider {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .taxrush-input-section {
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 0.75rem;
      background-color: #f8fafc;
      margin-bottom: 0.75rem;
    }

    .help-button {
      background: none;
      border: none;
      color: #6b7280;
      cursor: help;
      font-size: 0.8rem;
      padding: 0;
      line-height: 1;
    }

    .expense-fields {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .expense-field {
      margin-bottom: 0.75rem;
    }

    .expense-field.taxrush-field {
      border: 2px solid #3b82f6;
      border-radius: 6px;
      padding: 0.75rem;
      background-color: #f8fafc;
    }

    .field-header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .field-label {
      font-size: 0.9rem;
      font-weight: 500;
    }

    .field-label.locked {
      color: #6b7280;
    }

    .locked-text {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .field-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .field-description {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
  `]
})
export class InputsPanelComponent implements OnInit, OnChanges {
  @Input() data!: InputsPanelData;
  @Output() dataChange = new EventEmitter<InputsPanelData>();

  expenseFields: ExpenseField[] = [];
  grossFees: number = 0;
  discountDollarAmount: number = 0;

  // Utility methods
  formatCurrency = formatCurrency;
  formatNumber = formatNumber;
  Math = Math;

  ngOnInit(): void {
    this.updateExpenseFields();
    this.calculateDerivedValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateExpenseFields();
      this.calculateDerivedValues();
    }
  }

  updateExpenseFields(): void {
    this.expenseFields = getFieldsForRegion(this.data.region).filter(field => {
      // Filter out TaxRush-related fields if handlesTaxRush is false
      const isTaxRushField = field.id === 'taxRushRoyaltiesPct' || field.id === 'taxRushShortagesPct';
      if (isTaxRushField && this.data.handlesTaxRush === false) return false;
      return true;
    });
  }

  calculateDerivedValues(): void {
    this.grossFees = this.data.avgNetFee * this.data.taxPrepReturns;
    this.discountDollarAmount = this.grossFees * (this.data.discountsPct / 100);
  }

  // Event handlers
  onScenarioChange(scenario: string): void {
    this.data.scenario = scenario as any;
    this.emitChange();
  }

  onAvgNetFeeChange(value: number): void {
    debugLog('InputsPanel', 'onAvgNetFeeChange', { oldValue: this.data.avgNetFee, newValue: value });
    this.data.avgNetFee = Math.max(50, Math.min(500, value || 50));
    this.calculateDerivedValues();
    this.emitChange();
  }

  onTaxPrepReturnsChange(value: number): void {
    this.data.taxPrepReturns = Math.max(100, Math.min(10000, value || 100));
    this.calculateDerivedValues();
    this.emitChange();
  }

  onTaxRushReturnsChange(value: number): void {
    this.data.taxRushReturns = Math.max(0, Math.min(1000, value || 0));
    this.emitChange();
  }

  onDiscountsPctChange(value: number): void {
    this.data.discountsPct = Math.max(0, Math.min(50, value || 0));
    this.calculateDerivedValues();
    this.emitChange();
  }

  onDiscountDollarChange(value: number): void {
    const validDollar = Math.max(0, value || 0);
    if (this.grossFees > 0) {
      const newPct = (validDollar / this.grossFees) * 100;
      this.data.discountsPct = Math.max(0, Math.min(50, newPct));
      this.calculateDerivedValues();
      this.emitChange();
    }
  }

  onOtherIncomeChange(value: number): void {
    this.data.otherIncome = Math.max(0, Math.min(50000, value || 0));
    this.emitChange();
  }

  onFieldValueChange(field: ExpenseField, value: number): void {
    const validValue = Math.max(field.min, Math.min(field.max, value || field.min));
    this.setFieldValue(field, validValue);
    this.emitChange();
  }

  onDollarValueChange(field: ExpenseField, value: number): void {
    const validDollar = Math.max(0, value || 0);
    if (this.isFixedAmount(field)) {
      this.setFieldValue(field, validDollar);
    } else {
      let base = 0;
      if (field.calculationBase === 'percentage_gross') {
        base = this.grossFees;
      } else if (field.calculationBase === 'percentage_tp_income') {
        base = this.grossFees - this.discountDollarAmount;
      } else if (field.calculationBase === 'percentage_salaries') {
        base = this.grossFees * this.data.salariesPct / 100;
      }
      
      if (base > 0) {
        const newPercentage = Math.round(validDollar / base * 100);
        const cappedPercentage = Math.max(field.min, Math.min(field.max, newPercentage));
        this.setFieldValue(field, cappedPercentage);
      }
    }
    this.emitChange();
  }

  // Field utility methods
  getFieldValue(field: ExpenseField): number {
    return (this.data as any)[field.id] ?? field.defaultValue;
  }

  setFieldValue(field: ExpenseField, value: number): void {
    (this.data as any)[field.id] = value;
  }

  getDollarValue(field: ExpenseField): number {
    if (this.isFixedAmount(field)) {
      return this.getFieldValue(field);
    }

    const value = this.getFieldValue(field);
    if (field.calculationBase === 'percentage_gross') {
      return Math.round(this.grossFees * value / 100);
    } else if (field.calculationBase === 'percentage_tp_income') {
      const taxPrepIncome = this.grossFees - this.discountDollarAmount;
      return Math.round(taxPrepIncome * value / 100);
    } else if (field.calculationBase === 'percentage_salaries') {
      const salariesAmount = this.grossFees * this.data.salariesPct / 100;
      return Math.round(salariesAmount * value / 100);
    }
    return 0;
  }

  isFixedAmount(field: ExpenseField): boolean {
    return field.calculationBase === 'fixed_amount';
  }

  isFieldDisabled(field: ExpenseField): boolean {
    return field.regionSpecific === 'CA' && this.data.region !== 'CA';
  }

  isFieldLocked(field: ExpenseField): boolean {
    const isFranchiseRoyalty = field.category === 'franchise' && field.id.includes('oyalties');
    return isFranchiseRoyalty;
  }

  isTaxRushField(field: ExpenseField): boolean {
    return field.id === 'taxRushRoyaltiesPct';
  }

  getFieldStyle(field: ExpenseField): string {
    return this.isTaxRushField(field) ? 'taxrush-field' : '';
  }

  private emitChange(): void {
    this.dataChange.emit(this.data);
  }
}
