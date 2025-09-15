import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { Region } from '../../models/wizard.models';
import { ExpenseField, getFieldsForRegion } from '../../models/expense.models';
import { formatCurrency, formatPercentage } from '../../utils/calculation.utils';

// Income driver field definitions following FIELDS pattern
interface IncomeDriverField {
  id: string;
  label: string;
  description?: string;
  type: 'currency' | 'number' | 'percentage';
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  regionSpecific?: 'US' | 'CA' | 'both';
  conditional?: string; // Condition for field visibility
}

// FIELDS configuration for income drivers
const INCOME_DRIVER_FIELDS: IncomeDriverField[] = [
  {
    id: 'avgNetFee',
    label: 'Average Net Fee',
    description: 'Your target average net fee per return',
    type: 'currency',
    min: 50,
    max: 500,
    step: 1,
    defaultValue: 125
  },
  {
    id: 'taxPrepReturns',
    label: 'Tax Prep Returns',
    description: 'Your target number of tax returns',
    type: 'number',
    min: 100,
    max: 10000,
    step: 1,
    defaultValue: 1600
  },
  {
    id: 'taxRushReturns',
    label: 'TaxRush Returns',
    description: 'Number of TaxRush returns (Canada only)',
    type: 'number',
    min: 0,
    max: 1000,
    step: 1,
    defaultValue: 0,
    regionSpecific: 'CA',
    conditional: 'handlesTaxRush'
  },
  {
    id: 'discountsPct',
    label: 'Customer Discounts',
    description: 'Percentage discount given to customers',
    type: 'percentage',
    min: 0,
    max: 50,
    step: 0.1,
    defaultValue: 3
  },
  {
    id: 'otherIncome',
    label: 'Other Income',
    description: 'Additional revenue sources (e.g., notary services, business consulting)',
    type: 'currency',
    min: 0,
    max: 50000,
    step: 100,
    defaultValue: 0,
    conditional: 'hasOtherIncome'
  }
];

// Schema generation for dynamic forms
function schemaFor(region: Region, conditions: Record<string, boolean> = {}): IncomeDriverField[] {
  return INCOME_DRIVER_FIELDS.filter(field => {
    // Region filtering
    if (field.regionSpecific && field.regionSpecific !== region && field.regionSpecific !== 'both') {
      return false;
    }
    
    // Conditional filtering
    if (field.conditional) {
      return conditions[field.conditional] === true;
    }
    
    return true;
  });
}

interface IncomeDriverData {
  avgNetFee: number;
  taxPrepReturns: number;
  taxRushReturns: number;
  discountsPct: number;
  otherIncome: number;
  handlesTaxRush: boolean;
  hasOtherIncome: boolean;
}

@Component({
  selector: 'app-income-drivers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="income-drivers-container">
      <div class="section-header">
        <h3>💰 Income Drivers</h3>
        <p class="section-description">Configure your income targets and revenue sources</p>
      </div>

      <form [formGroup]="incomeForm" class="income-drivers-form">
        <div class="fields-container">
          <div *ngFor="let field of visibleFields; trackBy: trackByFieldId" 
               class="field-group" 
               [ngClass]="getFieldCssClass(field)">
            
            <!-- Field Label and Description -->
            <div class="field-header">
              <label [for]="field.id" class="field-label">
                {{ field.label }}
                <span *ngIf="field.description" 
                      class="help-button" 
                      [title]="field.description">
                  ℹ️
                </span>
              </label>
              
              <!-- Calculated Display (for derived values) -->
              <div *ngIf="getDerivedValue(field.id) !== null" class="derived-value">
                {{ formatFieldValue(getDerivedValue(field.id)!, field.type) }}
              </div>
            </div>

            <!-- Input Controls -->
            <div class="input-controls">
              <!-- Currency/Number Input -->
              <div class="input-group">
                <span *ngIf="field.type === 'currency'" class="input-prefix">$</span>
                <span *ngIf="field.type === 'number'" class="input-prefix">#</span>
                
                <input
                  [id]="field.id"
                  [formControlName]="field.id"
                  type="number"
                  [min]="field.min"
                  [max]="field.max"
                  [step]="field.step"
                  [placeholder]="field.defaultValue.toString()"
                  class="field-input"
                  [class.currency-input]="field.type === 'currency'"
                  [class.number-input]="field.type === 'number'"
                  [class.percentage-input]="field.type === 'percentage'">
                
                <span *ngIf="field.type === 'percentage'" class="input-suffix">%</span>
              </div>

              <!-- Dollar Equivalent for Percentage Fields -->
              <div *ngIf="field.type === 'percentage' && field.id === 'discountsPct'" 
                   class="dollar-equivalent">
                <span class="equals-symbol">=</span>
                <div class="input-group">
                  <span class="input-prefix">$</span>
                  <input
                    type="number"
                    [value]="getDiscountDollarAmount()"
                    (input)="onDiscountDollarChange($event)"
                    class="field-input dollar-input"
                    placeholder="0">
                </div>
              </div>
            </div>

            <!-- Range Slider -->
            <input *ngIf="showSliderFor(field)"
                   type="range"
                   [formControlName]="field.id"
                   [min]="field.min"
                   [max]="getSliderMax(field)"
                   [step]="field.step"
                   class="field-slider">

            <!-- Field Description -->
            <p *ngIf="field.description" class="field-description">
              {{ field.description }}
            </p>
          </div>
        </div>

        <!-- Calculated Revenue Summary -->
        <div class="revenue-summary" *ngIf="calculatedValues.totalRevenue > 0">
          <div class="summary-row">
            <span class="summary-label">Gross Tax Prep Fees:</span>
            <span class="summary-value">{{ formatCurrency(calculatedValues.grossFees) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Less: Customer Discounts:</span>
            <span class="summary-value negative">{{ formatCurrency(calculatedValues.discounts) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Net Tax Prep Income:</span>
            <span class="summary-value">{{ formatCurrency(calculatedValues.taxPrepIncome) }}</span>
          </div>
          <div *ngIf="calculatedValues.taxRushIncome > 0" class="summary-row">
            <span class="summary-label">TaxRush Income:</span>
            <span class="summary-value">{{ formatCurrency(calculatedValues.taxRushIncome) }}</span>
          </div>
          <div *ngIf="calculatedValues.otherIncome > 0" class="summary-row">
            <span class="summary-label">Other Income:</span>
            <span class="summary-value">{{ formatCurrency(calculatedValues.otherIncome) }}</span>
          </div>
          <div class="summary-row total-row">
            <span class="summary-label">Total Revenue:</span>
            <span class="summary-value">{{ formatCurrency(calculatedValues.totalRevenue) }}</span>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .income-drivers-container {
      background: #fafafa;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .section-header h3 {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-size: 1.1rem;
      color: #059669;
      border-bottom: 2px solid #059669;
      padding-bottom: 0.25rem;
    }

    .section-description {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0 0 1.5rem 0;
    }

    .fields-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .field-group {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 1rem;
    }

    .field-group.taxrush-field {
      border: 2px solid #3b82f6;
      background-color: #f8fafc;
    }

    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .field-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .help-button {
      background: none;
      border: none;
      color: #6b7280;
      cursor: help;
      font-size: 0.8rem;
      padding: 0;
    }

    .derived-value {
      font-size: 0.875rem;
      color: #059669;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      background: #f0fdf4;
      border-radius: 4px;
    }

    .input-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .input-group {
      display: flex;
      align-items: center;
      position: relative;
    }

    .input-prefix,
    .input-suffix {
      position: absolute;
      color: #6b7280;
      font-size: 0.8rem;
      font-weight: 500;
      z-index: 1;
    }

    .input-prefix {
      left: 0.75rem;
    }

    .input-suffix {
      right: 0.75rem;
    }

    .field-input {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.9rem;
      width: 120px;
      text-align: right;
    }

    .currency-input,
    .number-input {
      padding-left: 1.5rem;
    }

    .percentage-input {
      padding-right: 1.5rem;
    }

    .field-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .dollar-equivalent {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .equals-symbol {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .dollar-input {
      background-color: #f9fafb;
      width: 100px;
    }

    .field-slider {
      width: 100%;
      margin: 0.5rem 0;
    }

    .field-description {
      font-size: 0.75rem;
      color: #6b7280;
      margin: 0.25rem 0 0 0;
      line-height: 1.4;
    }

    .revenue-summary {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 6px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.25rem 0;
    }

    .summary-label {
      font-size: 0.875rem;
      color: #374151;
    }

    .summary-value {
      font-weight: 500;
      color: #374151;
    }

    .summary-value.negative {
      color: #dc2626;
    }

    .total-row {
      border-top: 1px solid #0ea5e9;
      padding-top: 0.5rem;
      margin-top: 0.5rem;
    }

    .total-row .summary-label,
    .total-row .summary-value {
      font-weight: 600;
      font-size: 1rem;
      color: #0369a1;
    }
  `]
})
export class IncomeDriversComponent implements OnInit, OnDestroy {
  @Input() region: Region = 'US';
  @Input() initialData: Partial<IncomeDriverData> = {};
  @Input() handlesTaxRush: boolean = false;
  @Input() hasOtherIncome: boolean = false;

  @Output() dataChange = new EventEmitter<IncomeDriverData>();
  @Output() calculatedValues = new EventEmitter<any>();

  incomeForm: FormGroup;
  visibleFields: IncomeDriverField[] = [];
  
  // Calculated values for display (derived via calc.util pattern)
  calculatedValues = {
    grossFees: 0,
    discounts: 0,
    taxPrepIncome: 0,
    taxRushIncome: 0,
    otherIncome: 0,
    totalRevenue: 0
  };

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.incomeForm = this.createForm();
  }

  ngOnInit() {
    this.updateVisibleFields();
    this.initializeFormValues();
    this.setupValueChangeHandlers();
    this.calculateDerivedValues();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const formControls: Record<string, FormControl> = {};
    
    INCOME_DRIVER_FIELDS.forEach(field => {
      formControls[field.id] = new FormControl(
        this.initialData[field.id as keyof IncomeDriverData] ?? field.defaultValue
      );
    });

    return this.fb.group(formControls);
  }

  private updateVisibleFields() {
    const conditions = {
      handlesTaxRush: this.handlesTaxRush,
      hasOtherIncome: this.hasOtherIncome
    };
    
    this.visibleFields = schemaFor(this.region, conditions);
  }

  private initializeFormValues() {
    this.visibleFields.forEach(field => {
      const currentValue = this.incomeForm.get(field.id)?.value;
      if (currentValue === null || currentValue === undefined) {
        this.incomeForm.get(field.id)?.setValue(field.defaultValue);
      }
    });
  }

  private setupValueChangeHandlers() {
    // Debounced valueChanges for calc.util integration
    this.incomeForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(values => {
        this.calculateDerivedValues();
        this.emitDataChange();
      });
  }

  // Calc.util integration - derive calculated values
  private calculateDerivedValues() {
    const formValues = this.incomeForm.value;
    
    // Core calculations following calc.util pattern
    const grossFees = (formValues.avgNetFee || 0) * (formValues.taxPrepReturns || 0);
    const discounts = grossFees * ((formValues.discountsPct || 0) / 100);
    const taxPrepIncome = grossFees - discounts;
    
    // TaxRush income (Canada only)
    const taxRushIncome = this.region === 'CA' && this.handlesTaxRush ? 
      (formValues.taxRushReturns || 0) * (formValues.avgNetFee || 0) * 0.15 : 0;
    
    const otherIncome = this.hasOtherIncome ? (formValues.otherIncome || 0) : 0;
    const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome;

    // Update calculated values
    this.calculatedValues = {
      grossFees,
      discounts,
      taxPrepIncome,
      taxRushIncome,
      otherIncome,
      totalRevenue
    };

    // Emit calculated values for parent components
    this.calculatedValues.emit(this.calculatedValues);
  }

  private emitDataChange() {
    const formData = this.incomeForm.value;
    const data: IncomeDriverData = {
      avgNetFee: formData.avgNetFee || 0,
      taxPrepReturns: formData.taxPrepReturns || 0,
      taxRushReturns: formData.taxRushReturns || 0,
      discountsPct: formData.discountsPct || 0,
      otherIncome: formData.otherIncome || 0,
      handlesTaxRush: this.handlesTaxRush,
      hasOtherIncome: this.hasOtherIncome
    };

    this.dataChange.emit(data);
  }

  // Template helper methods
  trackByFieldId(index: number, field: IncomeDriverField): string {
    return field.id;
  }

  getFieldCssClass(field: IncomeDriverField): string {
    if (field.regionSpecific === 'CA' && field.id === 'taxRushReturns') {
      return 'taxrush-field';
    }
    return '';
  }

  getDerivedValue(fieldId: string): number | null {
    // Return derived/calculated values for display
    switch (fieldId) {
      case 'grossTaxPrepFees':
        return this.calculatedValues.grossFees;
      case 'netTaxPrepIncome':
        return this.calculatedValues.taxPrepIncome;
      default:
        return null;
    }
  }

  formatFieldValue(value: number, type: string): string {
    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      default:
        return value.toString();
    }
  }

  showSliderFor(field: IncomeDriverField): boolean {
    // Show sliders for main driver fields
    return ['avgNetFee', 'taxPrepReturns', 'discountsPct'].includes(field.id);
  }

  getSliderMax(field: IncomeDriverField): number {
    // Adjust slider max for better UX
    switch (field.id) {
      case 'taxPrepReturns':
        return Math.min(field.max, 5000); // Cap slider at 5000 for better granularity
      case 'discountsPct':
        return Math.min(field.max, 25); // Cap discounts at 25% for slider
      default:
        return field.max;
    }
  }

  getDiscountDollarAmount(): number {
    const discountsPct = this.incomeForm.get('discountsPct')?.value || 0;
    return this.calculatedValues.grossFees * (discountsPct / 100);
  }

  onDiscountDollarChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const dollarAmount = parseFloat(target.value) || 0;
    
    if (this.calculatedValues.grossFees > 0) {
      const newPercentage = (dollarAmount / this.calculatedValues.grossFees) * 100;
      const cappedPercentage = Math.max(0, Math.min(50, newPercentage));
      
      this.incomeForm.get('discountsPct')?.setValue(cappedPercentage, { emitEvent: true });
    }
  }

  // Expose utility functions to template
  formatCurrency = formatCurrency;
  formatPercentage = formatPercentage;
}
