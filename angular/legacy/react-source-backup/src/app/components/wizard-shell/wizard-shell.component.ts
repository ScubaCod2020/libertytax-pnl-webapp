import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Region, WizardAnswers, WizardStep } from '../../models/wizard.models';
import { PersistenceService } from '../../services/persistence.service';

@Component({
  selector: 'app-wizard-shell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wizard-container">
      <!-- Welcome Step -->
      <div *ngIf="currentStep === 'welcome'" class="welcome-step">
        <div class="welcome-header">
          <h2>Welcome – Quick Start Wizard</h2>
          <p>Create your customized P&L dashboard in just a few quick steps</p>
        </div>

        <!-- Region Selection -->
        <div class="form-field">
          <label for="region-select" class="form-label">
            Region <span class="required">*</span>
          </label>
          <p class="form-help">Affects tax calculations and available features</p>
          <select 
            id="region-select"
            [(ngModel)]="answers.region"
            (ngModelChange)="onRegionChange($event)"
            class="form-select">
            <option value="US">United States 🇺🇸</option>
            <option value="CA">Canada 🇨🇦</option>
          </select>
        </div>

        <!-- Store Type Selection -->
        <div class="form-field">
          <label for="store-type-select" class="form-label">
            Store Type <span class="required">*</span>
          </label>
          <p class="form-help">New stores use regional stats, existing stores use your historical data</p>
          <select 
            id="store-type-select"
            [(ngModel)]="answers.storeType"
            (ngModelChange)="onStoreTypeChange($event)"
            class="form-select">
            <option value="">Select store type...</option>
            <option value="new">New Store (First year)</option>
            <option value="existing">Existing Store</option>
          </select>
        </div>

        <!-- New Store Setup Banner -->
        <div *ngIf="answers.storeType === 'new'" class="setup-banner">
          <div class="banner-content">
            <span class="banner-icon">💡</span>
            <div class="banner-text">
              <h4>New Store Setup - Forecasting</h4>
              <p>Set your target performance goals below. These will be used for business planning and can be adjusted as you learn more about your market.</p>
            </div>
          </div>
        </div>

        <!-- TaxRush Section (Canada only) -->
        <div *ngIf="answers.region === 'CA' && answers.storeType" class="taxrush-section">
          <h3 class="section-title">TaxRush Returns</h3>
          <p class="section-description">
            Will your office handle TaxRush returns? (TaxRush is Liberty Tax's same-day refund service)
          </p>
          <div class="radio-group">
            <label class="radio-option">
              <input 
                type="radio" 
                name="handlesTaxRush" 
                [value]="true"
                [(ngModel)]="answers.handlesTaxRush"
                (ngModelChange)="onTaxRushChange($event)">
              <span class="radio-label">Yes, we will handle TaxRush returns</span>
            </label>
            <label class="radio-option">
              <input 
                type="radio" 
                name="handlesTaxRush" 
                [value]="false"
                [(ngModel)]="answers.handlesTaxRush"
                (ngModelChange)="onTaxRushChange($event)">
              <span class="radio-label">No, we don't handle TaxRush</span>
            </label>
          </div>
        </div>

        <!-- Additional Revenue Streams Section -->
        <div *ngIf="answers.storeType" class="revenue-streams-section">
          <h3 class="section-title">Additional Revenue Streams</h3>
          <p class="section-description">
            Does your office have additional revenue streams beyond tax preparation? (e.g., notary services, business consulting, bookkeeping)
          </p>
          <div class="radio-group">
            <label class="radio-option">
              <input 
                type="radio" 
                name="hasOtherIncome" 
                [value]="true"
                [(ngModel)]="answers.hasOtherIncome"
                (ngModelChange)="onOtherIncomeChange($event)">
              <span class="radio-label">Yes, we have other income sources</span>
            </label>
            <label class="radio-option">
              <input 
                type="radio" 
                name="hasOtherIncome" 
                [value]="false"
                [(ngModel)]="answers.hasOtherIncome"
                (ngModelChange)="onOtherIncomeChange($event)">
              <span class="radio-label">No, only tax preparation</span>
            </label>
          </div>
        </div>

        <!-- Target Performance Goals Section (New Store only) -->
        <div *ngIf="answers.storeType === 'new'" class="performance-goals-section">
          <h3 class="section-title">Target Performance Goals</h3>
          
          <div class="form-grid">
            <div class="form-field">
              <label for="avgNetFee" class="form-label">Average Net Fee *</label>
              <div class="currency-input-container">
                <span class="currency-symbol">$</span>
                <input
                  type="number"
                  id="avgNetFee"
                  [(ngModel)]="answers.avgNetFee"
                  (ngModelChange)="onFieldChange('avgNetFee', $event)"
                  placeholder="130"
                  class="currency-input"
                />
              </div>
              <p class="field-description">Your target average net fee per return</p>
            </div>

            <div class="form-field">
              <label for="taxPrepReturns" class="form-label">Tax Prep Returns *</label>
              <div class="number-input-container">
                <span class="number-symbol">#</span>
                <input
                  type="number"
                  id="taxPrepReturns"
                  [(ngModel)]="answers.taxPrepReturns"
                  (ngModelChange)="onFieldChange('taxPrepReturns', $event)"
                  placeholder="1680"
                  class="number-input"
                />
              </div>
              <p class="field-description">Your target number of tax returns</p>
            </div>

            <div class="form-field">
              <label for="customerDiscounts" class="form-label">Customer Discounts</label>
              <div class="dual-input-container">
                <div class="currency-input-container">
                  <span class="currency-symbol">$</span>
                  <input
                    type="number"
                    id="discountsAmt"
                    [(ngModel)]="answers.discountsAmt"
                    (ngModelChange)="onDiscountAmountChange($event)"
                    placeholder="6000"
                    class="currency-input"
                  />
                </div>
                <span class="dual-input-separator">=</span>
                <div class="percentage-input-container">
                  <input
                    type="number"
                    id="discountsPct"
                    [(ngModel)]="answers.discountsPct"
                    (ngModelChange)="onDiscountPercentageChange($event)"
                    placeholder="3.0"
                    step="0.1"
                    min="0"
                    max="100"
                    class="percentage-input"
                  />
                  <span class="percentage-symbol">%</span>
                </div>
              </div>
              <p class="field-description">Default: 3% • Enter either dollar amount or percentage - the other will auto-calculate</p>
            </div>

            <div class="form-field">
              <label for="grossTaxPrepFees" class="form-label">Gross Tax Prep Fees</label>
              <div class="auto-calculated-field">
                {{ formatCurrency(calculatedGrossTaxPrepFees) }}
              </div>
              <p class="field-description">Auto-calculated: Average Net Fee x Tax Prep Returns</p>
            </div>

            <div class="form-field">
              <label for="totalExpenses" class="form-label">Total Expenses</label>
              <div class="currency-input-container">
                <span class="currency-symbol">$</span>
                <input
                  type="number"
                  id="totalExpenses"
                  [(ngModel)]="answers.totalExpenses"
                  (ngModelChange)="onFieldChange('totalExpenses', $event)"
                  placeholder="152000"
                  class="currency-input"
                />
              </div>
              <p class="field-description">Industry standard: 76% of Gross Tax Prep Fees (you can override)</p>
            </div>
          </div>

          <!-- Performance Summary -->
          <div class="performance-summary">
            <div class="summary-item">
              <span class="summary-label">Target Net Income:</span>
              <span class="summary-value">{{ formatCurrency(calculatedNetIncome) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Net Margin:</span>
              <span class="summary-value">{{ calculatedNetMargin }}% (industry standard)</span>
            </div>
          </div>
        </div>

        <!-- Revenue Summary Bar -->
        <div class="revenue-summary-bar">
          <div class="summary-item">
            <span class="label">Total Revenue:</span>
            <span class="value">${{ calculatedTotalRevenue | number:'1.0-0' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Net Income:</span>
            <span class="value" [class.positive]="calculatedNetIncome > 0" [class.negative]="calculatedNetIncome < 0">
              ${{ calculatedNetIncome | number:'1.0-0' }}
            </span>
          </div>
        </div>

        <!-- Navigation -->
        <div class="wizard-navigation">
          <div class="nav-left">
            <button 
              type="button"
              (click)="onResetData()" 
              class="btn btn-danger">
              🔄 Reset Data
            </button>
            <button 
              type="button"
              (click)="onCancel()" 
              class="btn btn-secondary">
              ❌ Cancel & Exit
            </button>
          </div>
          <button 
            type="button"
            (click)="onNext()" 
            [disabled]="!canProceed()"
            class="btn btn-primary"
            [class.disabled]="!canProceed()">
            Next Step: Detailed Inputs →
          </button>
        </div>
      </div>

      <!-- Inputs Step (placeholder for now) -->
      <div *ngIf="currentStep === 'inputs'" class="inputs-step">
        <h2>Detailed Inputs</h2>
        <p>This step will contain detailed expense inputs...</p>
        <div class="wizard-navigation">
          <button (click)="goToStep('welcome')" class="btn btn-secondary">← Back</button>
          <button (click)="goToStep('review')" class="btn btn-primary">Review →</button>
        </div>
      </div>

      <!-- Review Step (placeholder for now) -->
      <div *ngIf="currentStep === 'review'" class="review-step">
        <h2>Review & Confirm</h2>
        <p>Review your inputs before creating the dashboard...</p>
        <div class="wizard-navigation">
          <button (click)="goToStep('inputs')" class="btn btn-secondary">← Back</button>
          <button (click)="onComplete()" class="btn btn-primary">Create Dashboard →</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wizard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .welcome-header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 1.5rem 0;
    }

    .welcome-header h2 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 1rem;
    }

    .welcome-header p {
      font-size: 1.1rem;
      color: #6b7280;
      line-height: 1.6;
      margin: 0;
    }

    .setup-banner {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin: 1.5rem 0;
    }

    .banner-content {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .banner-icon {
      font-size: 1.5rem;
      margin-top: 0.25rem;
    }

    .banner-text h4 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .banner-text p {
      font-size: 0.9rem;
      margin: 0;
      opacity: 0.9;
      line-height: 1.5;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .section-description {
      color: #6b7280;
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
    }

    .taxrush-section {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }

    .revenue-streams-section {
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }

    .performance-goals-section {
      background: #fdf2f8;
      border: 1px solid #ec4899;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .currency-input-container,
    .number-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency-symbol,
    .number-symbol {
      position: absolute;
      left: 0.75rem;
      color: #6b7280;
      font-weight: 500;
      z-index: 1;
    }

    .currency-input,
    .number-input {
      width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 1.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
      line-height: 1.5;
      color: #374151;
      background-color: #ffffff;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .currency-input:focus,
    .number-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .dual-input-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .dual-input-separator {
      color: #6b7280;
      font-size: 0.875rem;
      white-space: nowrap;
    }

    .percentage-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .percentage-input {
      width: 80px;
      padding: 0.5rem 1.5rem 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
      text-align: right;
    }

    .percentage-symbol {
      position: absolute;
      right: 0.75rem;
      color: #6b7280;
      font-weight: 500;
    }

    .auto-calculated-field {
      padding: 0.5rem 0.75rem;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-weight: 500;
      color: #374151;
    }

    .field-description {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0.25rem 0 0 0;
    }

    .performance-summary {
      display: flex;
      justify-content: space-between;
      background: #22c55e;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.375rem;
      margin-top: 1rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .summary-label {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .summary-value {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .radio-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background-color 0.15s ease-in-out;
    }

    .radio-option:hover {
      background-color: #f3f4f6;
    }

    .radio-option input[type="radio"] {
      margin: 0;
    }

    .radio-label {
      font-weight: 500;
      color: #374151;
    }

    .revenue-summary-bar {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin: 1.5rem 0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .revenue-summary-bar .summary-item {
      text-align: center;
    }

    .revenue-summary-bar .label {
      display: block;
      font-size: 0.875rem;
      opacity: 0.9;
      margin-bottom: 0.25rem;
    }

    .revenue-summary-bar .value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .revenue-summary-bar .value.positive {
      color: #10b981;
    }

    .revenue-summary-bar .value.negative {
      color: #ef4444;
    }

    .wizard-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 0;
      border-top: 1px solid #e5e7eb;
      margin-top: 2rem;
    }

    .nav-left {
      display: flex;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .wizard-container {
        padding: 0 1rem;
        margin: 0.5rem;
      }
      
      .wizard-navigation {
        flex-direction: column;
        gap: 1rem;
      }
      
      .wizard-navigation .nav-left {
        order: 2;
      }
      
      .wizard-navigation .btn {
        width: 100%;
        justify-content: center;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WizardShellComponent implements OnInit {
  @Input() region: Region = 'US';
  @Input() persistence?: PersistenceService;

  @Output() setRegion = new EventEmitter<Region>();
  @Output() onComplete = new EventEmitter<WizardAnswers>();
  @Output() onCancel = new EventEmitter<void>();

  currentStep: WizardStep = 'welcome';
  answers: WizardAnswers = {
    region: 'US',
    handlesTaxRush: false
  };

  ngOnInit(): void {
    // Load saved answers if available
    if (this.persistence) {
      const savedAnswers = this.persistence.loadWizardAnswers();
      if (savedAnswers) {
        console.log('🧙‍♂️ Loading saved wizard answers:', savedAnswers);
        this.answers = { ...this.answers, ...savedAnswers };
      }
    }
  }

  onRegionChange(value: Region): void {
    console.log('🐛 Region changed:', value);
    this.answers.region = value;
    this.setRegion.emit(value);
  }

  onStoreTypeChange(value: string): void {
    console.log('🐛 Store type changed:', value);
    this.answers.storeType = value as 'new' | 'existing';
  }

  onTaxRushChange(value: boolean): void {
    console.log('🐛 TaxRush changed:', value);
    this.answers.handlesTaxRush = value;
  }

  onOtherIncomeChange(value: boolean): void {
    console.log('🐛 Other income changed:', value);
    this.answers.hasOtherIncome = value;
  }

  onFieldChange(field: string, value: any): void {
    console.log('🐛 Field changed:', field, '=', value);
    (this.answers as any)[field] = value;
  }

  onDiscountAmountChange(value: number): void {
    console.log('🐛 Discount amount changed:', value);
    this.answers.discountsAmt = value;
    if (this.answers.avgNetFee && this.answers.taxPrepReturns) {
      this.answers.discountsPct = (value / (this.answers.avgNetFee * this.answers.taxPrepReturns)) * 100;
      console.log('🐛 Auto-calculated discount percentage:', this.answers.discountsPct);
    }
  }

  onDiscountPercentageChange(value: number): void {
    console.log('🐛 Discount percentage changed:', value);
    this.answers.discountsPct = value;
    if (this.answers.avgNetFee && this.answers.taxPrepReturns) {
      this.answers.discountsAmt = (this.answers.avgNetFee * this.answers.taxPrepReturns) * (value / 100);
      console.log('🐛 Auto-calculated discount amount:', this.answers.discountsAmt);
    }
  }

  onResetData(): void {
    console.log('🐛 Reset data clicked');
    this.answers = {
      region: this.region,
      handlesTaxRush: false
    };
  }

  onCancel(): void {
    console.log('🐛 Cancel clicked');
    this.onCancel.emit();
  }

  onNext(): void {
    console.log('🐛 Next clicked');
    this.goToStep('inputs');
  }

  goToStep(step: WizardStep): void {
    this.currentStep = step;
  }

  onComplete(): void {
    console.log('🐛 Complete clicked');
    this.onComplete.emit(this.answers);
  }

  canProceed(): boolean {
    const canProceed = !!(this.answers.region && this.answers.storeType);
    console.log('🐛 Can proceed:', canProceed, {region: this.answers.region, storeType: this.answers.storeType});
    return canProceed;
  }

  get calculatedGrossTaxPrepFees(): number {
    const result = (this.answers.avgNetFee || 0) * (this.answers.taxPrepReturns || 0);
    console.log('🐛 Calculated gross tax prep fees:', result);
    return result;
  }

  get calculatedTotalRevenue(): number {
    const result = this.calculatedGrossTaxPrepFees + (this.answers.hasOtherIncome ? 0 : 0);
    console.log('🐛 Calculated total revenue:', result);
    return result;
  }

  get calculatedNetIncome(): number {
    const result = this.calculatedTotalRevenue - (this.answers.totalExpenses || 0);
    console.log('🐛 Calculated net income:', result);
    return result;
  }

  get calculatedNetMargin(): number {
    if (this.calculatedTotalRevenue === 0) return 0;
    const result = (this.calculatedNetIncome / this.calculatedTotalRevenue) * 100;
    console.log('🐛 Calculated net margin:', result);
    return result;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
