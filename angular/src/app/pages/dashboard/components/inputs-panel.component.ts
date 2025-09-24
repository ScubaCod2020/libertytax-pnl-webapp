import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Region } from '../../../domain/types/common.types';
import { WizardAnswers } from '../../../domain/types/wizard.types';
import { ExpenseField, expenseFields } from '../../../domain/types/expenses.types';

export type Scenario = 'Custom' | 'Good' | 'Better' | 'Best';

export interface InputsPanelData {
  // Basic fields
  region: Region;
  scenario: Scenario;
  avgNetFee: number;
  taxPrepReturns: number;
  taxRushReturns: number;
  discountsPct: number;
  otherIncome: number;

  // All 17 expense fields (using consistent Pct naming from expense field definitions)
  salariesPct: number;
  empDeductionsPct: number;
  rentPct: number;
  telephonePct: number;
  utilitiesPct: number;
  localAdvPct: number;
  insurancePct: number;
  postagePct: number;
  suppliesPct: number;
  duesPct: number;
  bankFeesPct: number;
  maintenancePct: number;
  travelEntPct: number;
  royaltiesPct: number;
  advRoyaltiesPct: number;
  taxRushRoyaltiesPct: number;
  miscPct: number;

  // Feature flags
  handlesTaxRush?: boolean;
  hasOtherIncome?: boolean;
}

@Component({
  selector: 'app-inputs-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inputs-panel-card">
      <!-- Hidden anchors for test continuity -->
      <h2 class="sr-only">Quick Inputs</h2>
      <div class="card-title">Inputs</div>

      <!-- Scenario Selector -->
      <div class="scenario-selector">
        <label>
          <strong>Scenario:</strong>&nbsp;
          <select 
            [(ngModel)]="data.scenario"
            (ngModelChange)="onScenarioChange($event)"
            aria-label="Scenario"
            class="scenario-select"
          >
            <option value="Custom">Custom</option>
            <option value="Good">Good</option>
            <option value="Better">Better</option>
            <option value="Best">Best</option>
          </select>
        </label>
      </div>

      <!-- Income Drivers Section -->
      <div class="income-drivers-section">
        <div class="section-header income-header">
          💰 Income Drivers
        </div>

        <!-- Average Net Fee with Slider -->
        <div class="field-with-slider">
          <div class="field-row">
            <label class="field-label">Average Net Fee</label>
            <div class="input-group">
              <span class="input-prefix">$</span>
              <input
                type="number"
                min="50"
                max="500"
                step="1"
                [(ngModel)]="data.avgNetFee"
                (ngModelChange)="onFieldChange('avgNetFee', $event)"
                title="Average Net Fee"
                aria-label="Average Net Fee"
                placeholder="125"
                class="number-input"
              />
            </div>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="1"
            [(ngModel)]="data.avgNetFee"
            (ngModelChange)="onFieldChange('avgNetFee', $event)"
            [title]="'Average Net Fee: $' + data.avgNetFee + ' (Range: $50 - $500)'"
            aria-label="ANF range"
            class="range-slider"
          />
        </div>

        <!-- Tax-Prep Returns with Slider -->
        <div class="field-with-slider">
          <div class="field-row">
            <label class="field-label">Tax-Prep Returns</label>
            <div class="input-group">
              <span class="input-prefix">#</span>
              <input
                type="number"
                min="100"
                max="10000"
                step="1"
                [(ngModel)]="data.taxPrepReturns"
                (ngModelChange)="onFieldChange('taxPrepReturns', $event)"
                title="Tax Prep Returns"
                aria-label="Tax Prep Returns"
                placeholder="1600"
                class="number-input"
              />
            </div>
          </div>
          <input
            type="range"
            min="100"
            max="5000"
            step="1"
            [(ngModel)]="data.taxPrepReturns"
            (ngModelChange)="onFieldChange('taxPrepReturns', $event)"
            [title]="'Tax-Prep Returns: ' + data.taxPrepReturns.toLocaleString() + ' (Range: 100 - 5,000)'"
            aria-label="Returns range"
            class="range-slider"
          />
        </div>

        <!-- TaxRush Returns - Always render, disabled for US -->
        <div class="field-with-slider taxrush-field">
          <div class="field-row">
            <label class="field-label">TaxRush Returns</label>
            <div class="input-group">
              <span class="input-prefix">#</span>
              <input
                type="number"
                min="0"
                max="1000"
                step="1"
                [(ngModel)]="data.taxRushReturns"
                (ngModelChange)="onFieldChange('taxRushReturns', $event)"
                title="TaxRush Returns"
                aria-label="TaxRush Returns"
                placeholder="0"
                [disabled]="data.region !== 'CA'"
                [class]="data.region === 'CA' ? 'number-input taxrush-enabled' : 'number-input taxrush-disabled'"
              />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            step="1"
            [(ngModel)]="data.taxRushReturns"
            (ngModelChange)="onFieldChange('taxRushReturns', $event)"
            [title]="'TaxRush Returns: ' + data.taxRushReturns.toLocaleString() + ' (Range: 0 - 1,000)'"
            aria-label="TaxRush range"
            [disabled]="data.region !== 'CA'"
            class="range-slider"
            [style.opacity]="data.region === 'CA' ? 1 : 0.5"
          />
        </div>

        <!-- Customer Discounts - Dual Dollar/Percentage with Slider -->
        <div class="field-with-slider">
          <div class="field-row">
            <label class="field-label">Discounts</label>
            <div class="dual-input-group">
              <div class="input-group">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  [(ngModel)]="data.discountsPct"
                  (ngModelChange)="onDiscountPctChange($event)"
                  title="Customer Discounts Percentage"
                  aria-label="Discounts %"
                  placeholder="3"
                  class="number-input small"
                />
                <span class="input-suffix">%</span>
              </div>
              <span class="equals">=</span>
              <div class="input-group">
                <span class="input-prefix">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  [ngModel]="discountDollarAmount | number:'1.0-0'"
                  (ngModelChange)="onDiscountDollarChange($event)"
                  title="Customer Discounts Dollar Amount"
                  aria-label="Customer Discounts Dollar Amount"
                  placeholder="0"
                  class="number-input dollar-input"
                />
              </div>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            step="1"
            [(ngModel)]="data.discountsPct"
            (ngModelChange)="onDiscountPctChange($event)"
            [title]="'Customer Discounts: ' + data.discountsPct + '% ($' + (discountDollarAmount | number:'1.0-0') + ') - Range: 0% - 25%'"
            aria-label="Customer Discounts slider"
            class="range-slider"
          />
        </div>

        <!-- Other Income - conditional -->
        <div *ngIf="data.hasOtherIncome" class="field-with-slider">
          <div class="field-row">
            <label class="field-label">Other Income</label>
            <div class="input-group">
              <button
                type="button"
                title="Additional revenue sources (e.g., notary services, business consulting)"
                class="info-button"
              >
                ℹ️
              </button>
              <span class="input-prefix">$</span>
              <input
                type="number"
                min="0"
                max="50000"
                step="100"
                [(ngModel)]="data.otherIncome"
                (ngModelChange)="onFieldChange('otherIncome', $event)"
                title="Other Income"
                aria-label="Other Income"
                placeholder="0"
                class="number-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Expense Management Section -->
      <div class="expense-management-section">
        <div class="section-header expense-header">
          📊 Expense Management
        </div>

        <div class="expense-fields">
          <div *ngFor="let field of filteredExpenseFields; trackBy: trackByFieldId" class="expense-field">
            <ng-container [ngSwitch]="field.id">
              <!-- Render expense field with slider for enhanced dashboard experience -->
              <div [class]="getFieldClass(field)">
                <div class="field-row">
                  <label [class]="getFieldLabelClass(field)">
                    {{ field.label }}
                    <span *ngIf="isFranchiseRoyalty(field)"> (Locked)</span>
                  </label>

                  <div class="expense-input-group">
                    <button
                      *ngIf="field.description"
                      type="button"
                      [title]="field.description"
                      class="info-button"
                    >
                      ℹ️
                    </button>

                    <!-- Percentage/Fixed Amount Input -->
                    <div class="input-group">
                      <span *ngIf="isFixed(field)" class="input-prefix">$</span>
                      <input
                        type="number"
                        [min]="0"
                        [max]="isFixed(field) ? null : 100"
                        step="1"
                        [ngModel]="getFieldValue(field)"
                        (ngModelChange)="onExpenseFieldChange(field, $event)"
                        [disabled]="isFieldDisabled(field) || isFranchiseRoyalty(field)"
                        [title]="field.label + ' ' + (isFixed(field) ? 'amount' : 'percentage')"
                        [aria-label]="field.label + ' ' + (isFixed(field) ? 'amount' : 'percentage')"
                        [class]="getFieldInputClass(field)"
                      />
                      <span *ngIf="!isFixed(field)" class="input-suffix">%</span>
                    </div>

                    <!-- Dollar Input - only for percentage-based fields -->
                    <ng-container *ngIf="!isFixed(field) && !isFranchiseRoyalty(field)">
                      <span class="equals">=</span>
                      <div class="input-group">
                        <span class="input-prefix">$</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          [ngModel]="calculateDollarValue(field) || ''"
                          (ngModelChange)="onExpenseDollarChange(field, $event)"
                          [disabled]="isFieldDisabled(field) || grossFees === 0"
                          [title]="field.label + ' dollar amount'"
                          [aria-label]="field.label + ' dollar amount'"
                          placeholder="0"
                          class="number-input dollar-input"
                        />
                      </div>
                    </ng-container>
                  </div>
                </div>

                <!-- Slider for percentage-based fields -->
                <input
                  *ngIf="!isFixed(field) && !isFranchiseRoyalty(field)"
                  type="range"
                  min="0"
                  [max]="Math.min(field.max, 50)"
                  [step]="field.step"
                  [ngModel]="getFieldValue(field)"
                  (ngModelChange)="onExpenseFieldChange(field, $event)"
                  [disabled]="isFieldDisabled(field)"
                  [title]="field.label + ': ' + getFieldValue(field) + '% ($' + (calculateDollarValue(field) | number:'1.0-0') + ') - Range: 0% - ' + Math.min(field.max, 50) + '%'"
                  [aria-label]="field.label + ' slider'"
                  class="range-slider expense-slider"
                />
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inputs-panel-card {
      min-width: 420px;
      max-width: 500px;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
    }

    .sr-only {
      position: absolute;
      left: -9999px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .scenario-selector {
      margin-bottom: 1.5rem;
    }

    .scenario-select {
      padding: 0.25rem;
      border-radius: 4px;
      border: 1px solid #d1d5db;
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

    .income-header {
      color: #059669;
      border-color: #059669;
    }

    .expense-header {
      color: #6b7280;
      border-color: #6b7280;
    }

    .field-with-slider {
      margin-bottom: 0.75rem;
    }

    .field-row {
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

    .input-group {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .dual-input-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .input-prefix,
    .input-suffix {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .equals {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .number-input {
      width: 60px;
      padding: 0.25rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.8rem;
      text-align: right;
    }

    .number-input.small {
      width: 60px;
    }

    .dollar-input {
      width: 80px;
      background-color: #f9fafb;
    }

    .range-slider {
      width: 100%;
    }

    .taxrush-field {
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 0.75rem;
      background-color: #f8fafc;
      margin-bottom: 0.75rem;
    }

    .taxrush-enabled {
      background-color: #f0f9ff;
    }

    .taxrush-disabled {
      background-color: #f3f4f6;
    }

    .info-button {
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

    .expense-field-taxrush {
      border: 2px solid #3b82f6;
      border-radius: 6px;
      padding: 0.75rem;
      background-color: #f8fafc;
    }

    .field-label-locked {
      color: #6b7280;
    }

    .expense-input-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .field-input-taxrush {
      background-color: #f0f9ff;
    }

    .field-input-disabled {
      background-color: #f3f4f6;
    }

    .expense-slider {
      margin-bottom: 0.5rem;
    }
  `]
})
export class InputsPanelComponent implements OnInit, OnDestroy {
  @Input() data!: InputsPanelData;
  @Output() dataChange = new EventEmitter<Partial<InputsPanelData>>();
  @Output() saveToWizard = new EventEmitter<Partial<WizardAnswers>>();

  // Expose Math for template
  Math = Math;
  
  private destroy$ = new Subject<void>();
  private saveToWizardSubject = new Subject<void>();

  // Computed properties
  get grossFees(): number {
    return this.data.avgNetFee * this.data.taxPrepReturns;
  }

  get discountDollarAmount(): number {
    return this.grossFees * (this.data.discountsPct / 100);
  }

  get filteredExpenseFields(): ExpenseField[] {
    return expenseFields.filter(field => {
      // First filter by region
      const regionMatch = !field.regionSpecific || 
                         field.regionSpecific === this.data.region || 
                         field.regionSpecific === 'both';
      if (!regionMatch) return false;

      // Then filter out TaxRush-related fields if handlesTaxRush is false
      const isTaxRushField = field.id === 'taxRushRoyaltiesPct' || field.id === 'taxRushShortagesPct';
      if (isTaxRushField && this.data.handlesTaxRush === false) return false;

      return true;
    });
  }

  ngOnInit(): void {
    // Set up bidirectional persistence with debouncing
    this.saveToWizardSubject
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.emitSaveToWizard();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Track by function for expense fields
  trackByFieldId(index: number, field: ExpenseField): string {
    return field.id;
  }

  // Field change handlers
  onScenarioChange(scenario: Scenario): void {
    this.dataChange.emit({ scenario });
    this.triggerSaveToWizard();
  }

  onFieldChange(fieldName: keyof InputsPanelData, value: number): void {
    this.dataChange.emit({ [fieldName]: value });
    this.triggerSaveToWizard();
  }

  onDiscountPctChange(newPct: number): void {
    const validPct = Math.max(0, Math.min(50, newPct));
    this.dataChange.emit({ discountsPct: validPct });
    this.triggerSaveToWizard();
  }

  onDiscountDollarChange(newDollar: number): void {
    const validDollar = Math.max(0, newDollar);
    if (this.grossFees > 0) {
      const newPct = (validDollar / this.grossFees) * 100;
      const validPct = Math.max(0, Math.min(50, newPct));
      this.dataChange.emit({ discountsPct: validPct });
      this.triggerSaveToWizard();
    }
  }

  onExpenseFieldChange(field: ExpenseField, value: number): void {
    const validValue = Math.max(0, Math.min(100, value));
    this.dataChange.emit({ [field.id]: validValue });
    this.triggerSaveToWizard();
  }

  onExpenseDollarChange(field: ExpenseField, newDollar: number): void {
    const validDollar = Math.max(0, newDollar);
    let base = 0;

    if (field.calculationBase === 'percentage_gross') {
      base = this.grossFees;
    } else if (field.calculationBase === 'percentage_tp_income') {
      base = this.grossFees - this.discountDollarAmount;
    } else if (field.calculationBase === 'percentage_salaries') {
      base = (this.grossFees * this.data.salariesPct) / 100;
    }

    if (base > 0) {
      const newPercentage = Math.round((validDollar / base) * 100);
      const cappedPercentage = Math.max(0, Math.min(100, newPercentage));
      this.dataChange.emit({ [field.id]: cappedPercentage });
      this.triggerSaveToWizard();
    }
  }

  // Helper methods
  getFieldValue(field: ExpenseField): number {
    return (this.data as any)[field.id] ?? field.defaultValue;
  }

  isFixed(field: ExpenseField): boolean {
    return field.calculationBase === 'fixed_amount';
  }

  isFieldDisabled(field: ExpenseField): boolean {
    return field.regionSpecific === 'CA' && this.data.region !== 'CA';
  }

  isTaxRushField(field: ExpenseField): boolean {
    return field.id === 'taxRushRoyaltiesPct';
  }

  isFranchiseRoyalty(field: ExpenseField): boolean {
    return field.category === 'franchise' && field.id.includes('oyalties');
  }

  calculateDollarValue(field: ExpenseField): number {
    const value = this.getFieldValue(field);
    
    if (this.isFixed(field)) {
      return value;
    }

    let dollarValue = 0;
    if (field.calculationBase === 'percentage_gross') {
      dollarValue = Math.round((this.grossFees * value) / 100);
    } else if (field.calculationBase === 'percentage_tp_income') {
      const taxPrepIncome = this.grossFees - this.discountDollarAmount;
      dollarValue = Math.round((taxPrepIncome * value) / 100);
    } else if (field.calculationBase === 'percentage_salaries') {
      const salariesAmount = (this.grossFees * this.data.salariesPct) / 100;
      dollarValue = Math.round((salariesAmount * value) / 100);
    }

    return dollarValue;
  }

  getFieldClass(field: ExpenseField): string {
    return this.isTaxRushField(field) ? 'expense-field-taxrush' : '';
  }

  getFieldLabelClass(field: ExpenseField): string {
    const base = 'field-label';
    return this.isFranchiseRoyalty(field) ? `${base} field-label-locked` : base;
  }

  getFieldInputClass(field: ExpenseField): string {
    let classes = 'number-input';
    
    if (this.isFieldDisabled(field)) {
      classes += ' field-input-disabled';
    } else if (this.isTaxRushField(field)) {
      classes += ' field-input-taxrush';
    }

    return classes;
  }

  private triggerSaveToWizard(): void {
    this.saveToWizardSubject.next();
  }

  private emitSaveToWizard(): void {
    const wizardUpdates: Partial<WizardAnswers> = {
      avgNetFee: this.data.avgNetFee,
      taxPrepReturns: this.data.taxPrepReturns,
      taxRushReturns: this.data.taxRushReturns,
      discountsPct: this.data.discountsPct,
      // Only include otherIncome if hasOtherIncome is enabled
      ...(this.data.hasOtherIncome && { otherIncome: this.data.otherIncome }),
      // Expense fields
      salariesPct: this.data.salariesPct,
      empDeductionsPct: this.data.empDeductionsPct,
      rentPct: this.data.rentPct,
      telephonePct: this.data.telephonePct,
      utilitiesPct: this.data.utilitiesPct,
      localAdvPct: this.data.localAdvPct,
      insurancePct: this.data.insurancePct,
      postagePct: this.data.postagePct,
      suppliesPct: this.data.suppliesPct,
      duesPct: this.data.duesPct,
      bankFeesPct: this.data.bankFeesPct,
      maintenancePct: this.data.maintenancePct,
      travelEntPct: this.data.travelEntPct,
      royaltiesPct: this.data.royaltiesPct,
      advRoyaltiesPct: this.data.advRoyaltiesPct,
      taxRushRoyaltiesPct: this.data.taxRushRoyaltiesPct,
      miscPct: this.data.miscPct,
    };

    console.log('🔄 Dashboard → Wizard: Saving changes to wizard persistence (preserving Page 2 calculatedTotalExpenses)', wizardUpdates);
    this.saveToWizard.emit(wizardUpdates);
  }
}
