import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WizardFormSectionComponent } from '../../../../components/wizard-ui/wizard-form-section.component';
import { WizardFormFieldComponent } from '../../../../components/wizard-ui/wizard-form-field.component';
import { ToggleQuestionComponent } from '../../../../components/wizard-ui/toggle-question.component';
import { CurrencyInputComponent } from '../../../../components/wizard-ui/currency-input.component';
import { NumberInputComponent } from '../../../../components/wizard-ui/number-input.component';
import { NetIncomeSummaryComponent } from '../../../../components/wizard-ui/net-income-summary.component';

import { WizardAnswers, Region } from '../../../../domain/types/wizard.types';

@Component({
  selector: 'lt-new-store-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    WizardFormSectionComponent,
    WizardFormFieldComponent,
    ToggleQuestionComponent,
    CurrencyInputComponent,
    NumberInputComponent,
    NetIncomeSummaryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Information Banner -->
    <div class="info-banner">
      <div class="banner-title">
        🏪 New Store Setup - Forecasting
      </div>
      <div class="banner-text">
        Set your target performance goals below. These will be used for business planning and can
        be adjusted as you learn more about your market.
      </div>
    </div>

    <!-- Toggles -->
    <lt-toggle-question
      title="TaxRush Returns"
      description="Will your office handle TaxRush returns? (TaxRush is Liberty Tax's same-day refund service)"
      fieldName="handlesTaxRush"
      [fieldValue]="answers.handlesTaxRush"
      positiveLabel="Yes, we will handle TaxRush returns"
      negativeLabel="No, we won't handle TaxRush"
      [fieldsToeClearOnDisable]="['taxRushReturns', 'taxRushReturnsPct', 'taxRushAvgNetFee', 'taxRushGrossFees']"
      titleColor="#1e40af"
      [showOnlyWhen]="region === 'CA'"
      (valueChange)="onAnswersChange($event)"
    />

    <lt-toggle-question
      title="Additional Revenue Streams"
      description="Does your office have additional revenue streams beyond tax preparation? (e.g., notary services, business consulting, bookkeeping)"
      fieldName="hasOtherIncome"
      [fieldValue]="answers.hasOtherIncome"
      positiveLabel="Yes, we have other income sources"
      negativeLabel="No, only tax preparation"
      [fieldsToeClearOnDisable]="['otherIncome']"
      titleColor="#6b7280"
      (valueChange)="onAnswersChange($event)"
    />

    <!-- Target Performance Goals -->
    <lt-wizard-form-section
      title="Target Performance Goals"
      icon="🎯"
      background="#f8fafc"
      border="1px solid #059669"
    >
      <!-- 1. Tax Prep Returns -->
      <lt-wizard-form-field label="Tax Prep Returns" helpText="Your target number of tax returns" [required]="true">
        <lt-number-input
          [value]="answers.taxPrepReturns"
          placeholder="e.g., 1,680"
          prefix="#"
          (valueChange)="onAnswersChange({ taxPrepReturns: $event })"
        />
      </lt-wizard-form-field>

      <!-- 2. Average Net Fee -->
      <lt-wizard-form-field
        label="Average Net Fee"
        helpText="Your target average net fee per return"
        [required]="true"
      >
        <lt-currency-input
          [value]="answers.avgNetFee"
          placeholder="e.g., 130"
          (valueChange)="onAnswersChange({ avgNetFee: $event })"
        />
      </lt-wizard-form-field>

      <!-- 3. Gross Tax Prep Fees (auto; computed locally) -->
      <lt-wizard-form-field label="Gross Tax Prep Fees" helpText="Auto: Returns × Avg Net Fee">
        <lt-currency-input
          [value]="effectiveGrossFees"
          placeholder="Auto-calculated"
          backgroundColor="#f9fafb"
          [readOnly]="true"
        />
      </lt-wizard-form-field>

      <!-- 4. TaxRush (conditional) -->
      <div
        *ngIf="region === 'CA' && answers.handlesTaxRush"
        class="taxrush-section"
      >
        <lt-wizard-form-field
          label="TaxRush Returns"
          helpText="Your target TaxRush returns (≈15% of total)"
        >
          <lt-number-input
            [value]="taxRushReturnsValue"
            [placeholder]="taxRushReturnsPlaceholder"
            prefix="#"
            (valueChange)="onAnswersChange({ taxRushReturns: $event })"
          />
        </lt-wizard-form-field>

        <lt-wizard-form-field label="TaxRush Avg Net Fee" helpText="Target avg net fee per TaxRush return">
          <lt-currency-input
            [value]="answers.taxRushAvgNetFee ?? answers.avgNetFee"
            [placeholder]="(answers.avgNetFee || 125).toString()"
            (valueChange)="onAnswersChange({ taxRushAvgNetFee: $event })"
          />
        </lt-wizard-form-field>

        <lt-wizard-form-field
          label="TaxRush Gross Fees"
          helpText="Auto: Returns × Avg Net Fee (override allowed)"
        >
          <lt-currency-input
            [value]="taxRushGrossFeesValue"
            placeholder="Auto-calculated"
            [backgroundColor]="answers.taxRushGrossFees !== undefined ? 'white' : '#f9fafb'"
            (valueChange)="onAnswersChange({ taxRushGrossFees: $event })"
          />
        </lt-wizard-form-field>
      </div>

      <!-- 5. Customer Discounts (Amt + %) -->
      <lt-wizard-form-field
        label="Customer Discounts"
        helpText="Dollar amount or % of gross fees given as discounts. Enter either field; the other auto-calculates."
      >
        <div class="discount-inputs">
          <!-- Dollar Input -->
          <div class="discount-input-group">
            <span class="currency-symbol">$</span>
            <input
              type="number"
              min="0"
              step="1"
              class="discount-input"
              [placeholder]="discountAmtPlaceholder"
              [value]="discountAmtValue"
              (input)="onDiscountAmtChange($event)"
            />
          </div>

          <span class="equals">=</span>

          <!-- Percentage Input -->
          <div class="discount-input-group">
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              class="discount-input"
              placeholder="3.0"
              [value]="discountPctValue"
              (input)="onDiscountPctChange($event)"
            />
            <span class="percent-symbol">%</span>
          </div>
        </div>
        <div class="discount-help">
          Default: 3% • Enter either dollar amount or percentage — the other will auto-calc
        </div>
      </lt-wizard-form-field>

      <!-- 6. Total Tax Prep Income (Gross − Discounts, overrideable) -->
      <lt-wizard-form-field
        label="Total Tax Prep Income"
        helpText="Gross Tax Prep Fees minus Customer Discounts (you can override)"
      >
        <lt-currency-input
          [value]="answers.projectedTaxPrepIncome ?? effectiveTaxPrepIncome"
          placeholder="Auto-calculated"
          [backgroundColor]="answers.projectedTaxPrepIncome !== undefined ? 'white' : '#f9fafb'"
          (valueChange)="onAnswersChange({ projectedTaxPrepIncome: $event })"
        />
      </lt-wizard-form-field>

      <!-- 7. Other Income (optional) -->
      <lt-wizard-form-field
        *ngIf="answers.hasOtherIncome"
        label="Other Income"
        helpText="Additional revenue streams (bookkeeping, notary, etc.)"
      >
        <lt-currency-input
          [value]="answers.otherIncome"
          placeholder="5,000"
          (valueChange)="onAnswersChange({ otherIncome: $event })"
        />
      </lt-wizard-form-field>

      <!-- 8. Total Expenses (overrideable) -->
      <lt-wizard-form-field
        label="Total Expenses"
        helpText="Auto: (Total Tax Prep Income + Other Income) × 76% (you can override)"
      >
        <lt-currency-input
          [value]="answers.projectedExpenses ?? effectiveTotalExpenses"
          placeholder="Auto-calculated"
          [backgroundColor]="answers.projectedExpenses !== undefined ? 'white' : '#f9fafb'"
          (valueChange)="onAnswersChange({ projectedExpenses: $event })"
        />
      </lt-wizard-form-field>
    </lt-wizard-form-section>

    <!-- Target Net Income Summary -->
    <lt-net-income-summary
      label="Target"
      [gross]="effectiveGrossFees ?? 0"
      [discounts]="answers.discountsAmt ?? 0"
      [otherIncome]="answers.hasOtherIncome ? (answers.otherIncome ?? 0) : 0"
      [expenses]="answers.projectedExpenses ?? 0"
      color="#0369a1"
      background="#e0f2fe"
      border="2px solid #0ea5e9"
    />
  `,
  styles: [`
    .info-banner {
      padding: 1rem;
      background-color: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .banner-title {
      font-weight: bold;
      color: #0369a1;
      margin-bottom: 0.5rem;
    }

    .banner-text {
      font-size: 0.9rem;
      color: #0369a1;
    }

    .taxrush-section {
      padding: 0.75rem;
      border: 2px solid #0ea5e9;
      border-radius: 8px;
      background-color: #f0f9ff;
      margin: 0.5rem 0;
    }

    .discount-inputs {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .discount-input-group {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .currency-symbol,
    .percent-symbol {
      font-weight: 500;
      color: #6b7280;
    }

    .equals {
      color: #6b7280;
    }

    .discount-input {
      width: 80px;
      text-align: right;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 0.5rem;
    }

    .discount-help {
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #6b7280;
      font-style: italic;
    }
  `]
})
export class NewStoreSectionComponent {
  @Input() answers: WizardAnswers = { region: 'US' };
  @Input() region: Region = 'US';
  
  @Output() answersChange = new EventEmitter<Partial<WizardAnswers>>();

  // ---- Effective (live) values ----
  get effectiveGrossFees(): number | undefined {
    return this.answers.taxPrepReturns && this.answers.avgNetFee
      ? this.answers.taxPrepReturns * this.answers.avgNetFee
      : undefined;
  }

  get effectiveDiscountsAmt(): number {
    return this.answers.discountsAmt ?? 0;
  }

  get effectiveTaxPrepIncome(): number | undefined {
    return this.answers.projectedTaxPrepIncome ??
      (this.effectiveGrossFees !== undefined ? this.effectiveGrossFees - this.effectiveDiscountsAmt : undefined);
  }

  get effectiveOtherIncome(): number {
    return this.answers.hasOtherIncome ? (this.answers.otherIncome ?? 0) : 0;
  }

  get effectiveTotalExpenses(): number | undefined {
    return this.answers.projectedExpenses ??
      (this.effectiveTaxPrepIncome !== undefined
        ? Math.round((this.effectiveTaxPrepIncome + this.effectiveOtherIncome) * 0.76)
        : undefined);
  }

  // TaxRush computed values
  get taxRushReturnsValue(): number | undefined {
    return this.answers.taxRushReturns ??
      (this.answers.taxPrepReturns ? Math.round(this.answers.taxPrepReturns * 0.15) : undefined);
  }

  get taxRushReturnsPlaceholder(): string {
    return this.answers.taxPrepReturns
      ? Math.round(this.answers.taxPrepReturns * 0.15).toString()
      : '240';
  }

  get taxRushGrossFeesValue(): number | undefined {
    const anf = this.answers.taxRushAvgNetFee ?? this.answers.avgNetFee;
    if (this.answers.taxRushGrossFees !== undefined) return this.answers.taxRushGrossFees;
    if (this.answers.taxRushReturns !== undefined && anf !== undefined) {
      return this.answers.taxRushReturns * anf;
    }
    return undefined;
  }

  // Discount computed values
  get discountAmtPlaceholder(): string {
    return this.effectiveGrossFees ? Math.round(this.effectiveGrossFees * 0.03).toString() : '6,000';
  }

  get discountAmtValue(): number | string {
    return this.answers.discountsAmt ??
      (this.effectiveGrossFees ? Math.round(this.effectiveGrossFees * 0.03) : '');
  }

  get discountPctValue(): number | string {
    return this.answers.discountsPct ??
      (this.effectiveGrossFees && this.answers.discountsAmt
        ? Math.round((this.answers.discountsAmt / this.effectiveGrossFees) * 100 * 10) / 10
        : '');
  }

  onAnswersChange(updates: Partial<WizardAnswers>): void {
    this.answersChange.emit(updates);
  }

  onDiscountAmtChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newAmt = parseFloat(target.value) || undefined;
    this.onAnswersChange({ discountsAmt: newAmt });
    
    if (newAmt && this.effectiveGrossFees) {
      const pct = (newAmt / this.effectiveGrossFees) * 100;
      this.onAnswersChange({ discountsPct: Math.round(pct * 10) / 10 }); // 1 decimal place
    }
  }

  onDiscountPctChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newPct = parseFloat(target.value) || undefined;
    this.onAnswersChange({ discountsPct: newPct });
    
    if (newPct && this.effectiveGrossFees) {
      this.onAnswersChange({
        discountsAmt: Math.round(this.effectiveGrossFees * (newPct / 100)),
      });
    }
  }
}
