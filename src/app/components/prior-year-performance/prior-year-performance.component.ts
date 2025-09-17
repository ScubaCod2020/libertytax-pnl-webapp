// prior-year-performance.component.ts - Last Year Performance for existing stores
// Reactive form with real-time calculations and calc.util integration

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Region } from '../../models/wizard.models';

// Prior year data interface matching React WizardAnswers structure
export interface PriorYearData {
  lastYearGrossFees?: number;
  lastYearDiscountsAmt?: number;
  lastYearDiscountsPct?: number;
  lastYearTaxPrepReturns?: number;
  lastYearOtherIncome?: number;
  lastYearTaxRushReturns?: number;
  lastYearTaxRushReturnsPct?: number;
  lastYearTaxRushGrossFees?: number;
  lastYearTaxRushAvgNetFee?: number;
  lastYearExpenses?: number;
}

// Computed metrics from prior year data
export interface PriorYearMetrics {
  taxPrepIncome: number;  // grossFees - discountsAmt
  totalRevenue: number;   // taxPrepIncome + otherIncome + taxRushIncome
  netIncome: number;      // totalRevenue - expenses
  discountsPct: number;   // (discountsAmt / grossFees) * 100
  taxRushIncome: number;  // CA only - taxRushReturns * taxRushAvgNetFee
}

@Component({
  selector: 'app-prior-year-performance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="prior-year-card">
      <div class="card-header">
        <h3 class="card-title">
          <span class="card-icon">📊</span>
          Last Year Performance
        </h3>
        <p class="card-description">Enter your historical data for accurate projections</p>
      </div>

      <form [formGroup]="priorYearForm" class="prior-year-form">
        <!-- Two-column layout for fields -->
        <div class="form-grid">
          <!-- Column 1: Revenue Fields -->
          <div class="form-column">
            <!-- Tax Prep Gross Fees -->
            <div class="form-field">
              <label for="grossFees" class="form-label">
                Tax Prep Gross Fees <span class="required">*</span>
              </label>
              <div class="input-group">
                <span class="input-prefix">$</span>
                <input
                  id="grossFees"
                  type="number"
                  formControlName="grossFees"
                  placeholder="e.g., 206,000"
                  class="form-input"
                  min="0"
                  step="1000">
              </div>
              <p class="form-help">Total tax prep fees charged (before any discounts)</p>
            </div>

            <!-- Customer Discounts -->
            <div class="form-field">
              <label for="discountsAmt" class="form-label">Customer Discounts</label>
              <div class="dual-entry-row">
                <div class="input-group">
                  <span class="input-prefix">$</span>
                  <input
                    id="discountsAmt"
                    type="number"
                    formControlName="discountsAmt"
                    placeholder="e.g., 6,000"
                    class="form-input"
                    min="0"
                    step="100">
                </div>
                <div class="calculated-pct">
                  <span class="calc-equals">=</span>
                  <div class="pct-display">{{ metrics.discountsPct | number:'1.1-1' }}</div>
                  <span class="pct-symbol">%</span>
                </div>
              </div>
              <p class="form-help">Total discounts given to customers (percentage auto-calculated)</p>
            </div>

            <!-- Tax Prep Returns -->
            <div class="form-field">
              <label for="taxPrepReturns" class="form-label">
                Tax Prep Returns <span class="required">*</span>
              </label>
              <input
                id="taxPrepReturns"
                type="number"
                formControlName="taxPrepReturns"
                placeholder="e.g., 1,600"
                class="form-input"
                min="0"
                step="10">
              <p class="form-help">Count of returns processed last year</p>
            </div>

            <!-- Other Income (conditional) -->
            <div *ngIf="hasOtherIncome" class="form-field">
              <label for="otherIncome" class="form-label">Other Income</label>
              <div class="input-group">
                <span class="input-prefix">$</span>
                <input
                  id="otherIncome"
                  type="number"
                  formControlName="otherIncome"
                  placeholder="e.g., 5,000"
                  class="form-input"
                  min="0"
                  step="500">
              </div>
              <p class="form-help">Additional revenue streams beyond tax prep</p>
            </div>
          </div>

          <!-- Column 2: TaxRush (CA) + Expenses -->
          <div class="form-column">
            <!-- TaxRush Fields (Canada only) -->
            <div *ngIf="region === 'CA'" class="taxrush-section">
              <h4 class="section-title">🍁 TaxRush (Canada)</h4>
              
              <div class="form-field">
                <label for="taxRushReturns" class="form-label">TaxRush Returns</label>
                <input
                  id="taxRushReturns"
                  type="number"
                  formControlName="taxRushReturns"
                  placeholder="e.g., 240"
                  class="form-input"
                  min="0"
                  step="10">
                <p class="form-help">Count of TaxRush returns processed</p>
              </div>

              <div class="form-field">
                <label for="taxRushGrossFees" class="form-label">TaxRush Gross Fees</label>
                <div class="input-group">
                  <span class="input-prefix">$</span>
                  <input
                    id="taxRushGrossFees"
                    type="number"
                    formControlName="taxRushGrossFees"
                    placeholder="e.g., 12,000"
                    class="form-input"
                    min="0"
                    step="500">
                </div>
                <p class="form-help">Total TaxRush fees charged</p>
              </div>

              <div class="form-field">
                <label for="taxRushAvgNetFee" class="form-label">TaxRush Avg Net Fee</label>
                <div class="input-group">
                  <span class="input-prefix">$</span>
                  <input
                    id="taxRushAvgNetFee"
                    type="number"
                    formControlName="taxRushAvgNetFee"
                    placeholder="e.g., 50"
                    class="form-input"
                    min="0"
                    step="5">
                </div>
                <p class="form-help">Average net fee per TaxRush return</p>
              </div>
            </div>

            <!-- Last Year Expenses -->
            <div class="form-field">
              <label for="expenses" class="form-label">
                Last Year Expenses <span class="required">*</span>
              </label>
              <div class="input-group">
                <span class="input-prefix">$</span>
                <input
                  id="expenses"
                  type="number"
                  formControlName="expenses"
                  placeholder="e.g., 147,000"
                  class="form-input"
                  min="0"
                  step="1000">
              </div>
              <p class="form-help">Total operating expenses for the year</p>
            </div>
          </div>
        </div>

        <!-- Summary Totals Bar -->
        <div class="summary-totals" [class.complete]="isDataComplete">
          <div class="totals-grid">
            <div class="total-item">
              <div class="total-label">Tax Prep Income</div>
              <div class="total-value">{{ formatCurrency(metrics.taxPrepIncome) }}</div>
            </div>
            <div class="total-item">
              <div class="total-label">Total Revenue</div>
              <div class="total-value">{{ formatCurrency(metrics.totalRevenue) }}</div>
            </div>
            <div class="total-item net-income">
              <div class="total-label">Net Income</div>
              <div class="total-value" [class]="getNetIncomeClass()">
                {{ formatCurrency(metrics.netIncome) }}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .prior-year-card {
      background: #f8fafc;
      border: 1px solid #6b7280;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .card-header {
      margin-bottom: 1.5rem;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
    }

    .card-icon {
      font-size: 1.5rem;
    }

    .card-description {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }

    .form-field {
      margin-bottom: 1.25rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
      font-size: 0.9rem;
    }

    .required {
      color: #dc2626;
    }

    .input-group {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-prefix {
      position: absolute;
      left: 0.75rem;
      color: #6b7280;
      font-weight: 500;
      pointer-events: none;
      z-index: 1;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 0.75rem 0.75rem 2rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-help {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.8rem;
    }

    .dual-entry-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .calculated-pct {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    .calc-equals {
      color: #6b7280;
      font-weight: 500;
    }

    .pct-display {
      width: 50px;
      text-align: right;
      padding: 0.75rem 0.5rem;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      font-weight: 500;
      color: #374151;
    }

    .pct-symbol {
      color: #6b7280;
      font-weight: 500;
    }

    .taxrush-section {
      padding: 1rem;
      background: rgba(34, 197, 94, 0.05);
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .section-title {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #059669;
    }

    .summary-totals {
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 1rem;
      transition: all 0.3s ease;
    }

    .summary-totals.complete {
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
      border-color: #22c55e;
    }

    .totals-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    @media (max-width: 640px) {
      .totals-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
    }

    .total-item {
      text-align: center;
    }

    .total-label {
      font-size: 0.8rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .total-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
    }

    .net-income .total-value.positive {
      color: #059669;
    }

    .net-income .total-value.negative {
      color: #dc2626;
    }

    .net-income .total-value.neutral {
      color: #6b7280;
    }
  `]
})
export class PriorYearPerformanceComponent implements OnInit, OnDestroy {
  @Input() region: Region = 'US';
  @Input() storeType?: string;
  @Input() hasOtherIncome: boolean = false;
  @Input() initialData?: Partial<PriorYearData>;

  @Output() dataChange = new EventEmitter<PriorYearData>();
  @Output() metricsChange = new EventEmitter<PriorYearMetrics>();

  private destroy$ = new Subject<void>();
  priorYearForm: FormGroup;
  metrics: PriorYearMetrics = this.getEmptyMetrics();

  constructor(private fb: FormBuilder) {
    this.priorYearForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    
    // Initialize with provided data
    if (this.initialData) {
      this.priorYearForm.patchValue({
        grossFees: this.initialData.lastYearGrossFees,
        discountsAmt: this.initialData.lastYearDiscountsAmt,
        taxPrepReturns: this.initialData.lastYearTaxPrepReturns,
        otherIncome: this.initialData.lastYearOtherIncome,
        taxRushReturns: this.initialData.lastYearTaxRushReturns,
        taxRushGrossFees: this.initialData.lastYearTaxRushGrossFees,
        taxRushAvgNetFee: this.initialData.lastYearTaxRushAvgNetFee,
        expenses: this.initialData.lastYearExpenses
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      grossFees: [null, [Validators.min(0)]],
      discountsAmt: [null, [Validators.min(0)]],
      taxPrepReturns: [null, [Validators.min(0)]],
      otherIncome: [null, [Validators.min(0)]],
      taxRushReturns: [null, [Validators.min(0)]],
      taxRushGrossFees: [null, [Validators.min(0)]],
      taxRushAvgNetFee: [null, [Validators.min(0)]],
      expenses: [null, [Validators.min(0)]]
    });
  }

  private setupFormSubscriptions(): void {
    this.priorYearForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(formValue => {
        this.updateMetrics(formValue);
        this.emitData(formValue);
      });
  }

  private updateMetrics(formValue: any): void {
    const grossFees = formValue.grossFees || 0;
    const discountsAmt = formValue.discountsAmt || 0;
    const otherIncome = formValue.otherIncome || 0;
    const expenses = formValue.expenses || 0;
    
    // Tax prep income = gross fees - discounts
    const taxPrepIncome = grossFees - discountsAmt;
    
    // TaxRush income (CA only)
    const taxRushIncome = this.region === 'CA' 
      ? (formValue.taxRushReturns || 0) * (formValue.taxRushAvgNetFee || 0)
      : 0;
    
    // Total revenue = tax prep + other + taxrush
    const totalRevenue = taxPrepIncome + otherIncome + taxRushIncome;
    
    // Net income = revenue - expenses
    const netIncome = totalRevenue - expenses;
    
    // Discount percentage
    const discountsPct = grossFees > 0 ? (discountsAmt / grossFees) * 100 : 0;

    this.metrics = {
      taxPrepIncome,
      totalRevenue,
      netIncome,
      discountsPct,
      taxRushIncome
    };

    this.metricsChange.emit(this.metrics);
  }

  private emitData(formValue: any): void {
    const data: PriorYearData = {
      lastYearGrossFees: formValue.grossFees,
      lastYearDiscountsAmt: formValue.discountsAmt,
      lastYearDiscountsPct: this.metrics.discountsPct,
      lastYearTaxPrepReturns: formValue.taxPrepReturns,
      lastYearOtherIncome: formValue.otherIncome,
      lastYearTaxRushReturns: formValue.taxRushReturns,
      lastYearTaxRushGrossFees: formValue.taxRushGrossFees,
      lastYearTaxRushAvgNetFee: formValue.taxRushAvgNetFee,
      lastYearExpenses: formValue.expenses
    };

    this.dataChange.emit(data);
  }

  private getEmptyMetrics(): PriorYearMetrics {
    return {
      taxPrepIncome: 0,
      totalRevenue: 0,
      netIncome: 0,
      discountsPct: 0,
      taxRushIncome: 0
    };
  }

  get isDataComplete(): boolean {
    const form = this.priorYearForm.value;
    return !!(form.grossFees && form.taxPrepReturns && form.expenses);
  }

  formatCurrency(value: number): string {
    if (value === 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(Math.abs(value));
  }

  getNetIncomeClass(): string {
    if (this.metrics.netIncome > 0) return 'positive';
    if (this.metrics.netIncome < 0) return 'negative';
    return 'neutral';
  }
}
