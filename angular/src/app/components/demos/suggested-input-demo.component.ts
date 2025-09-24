import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WizardFormSectionComponent } from '../wizard-ui/wizard-form-section.component';
import { SuggestedFormFieldComponent } from '../wizard-ui/suggested-form-field.component';
import { SuggestedCurrencyInputComponent } from '../wizard-ui/suggested-currency-input.component';
import { SuggestedNumberInputComponent } from '../wizard-ui/suggested-number-input.component';
import { SuggestedPercentageInputComponent } from '../wizard-ui/suggested-percentage-input.component';

import { WizardAnswers, Region } from '../../domain/types/wizard.types';
import { CalculatedSuggestions, SuggestionProfile } from '../../domain/types/suggestion.types';
import { SuggestionEngineService } from '../../domain/services/suggestion-engine.service';

@Component({
  selector: 'lt-suggested-input-demo',
  standalone: true,
  imports: [
    CommonModule,
    WizardFormSectionComponent,
    SuggestedFormFieldComponent,
    SuggestedCurrencyInputComponent,
    SuggestedNumberInputComponent,
    SuggestedPercentageInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-container">
      <!-- Input Fields Section -->
      <lt-wizard-form-section
        title="💡 Income Drivers (With Suggestions)"
        icon="💰"
        [description]="'Suggestions based on: ' + suggestionProfile.name"
      >
        <!-- Average Net Fee -->
        <lt-suggested-form-field
          label="Average Net Fee"
          helpText="Fee charged per tax return (before discounts)"
          fieldId="avgNetFee"
          [suggestions]="suggestions"
          [required]="true"
        >
          <lt-suggested-currency-input
            [value]="answers.avgNetFee"
            fieldId="avgNetFee"
            [suggestions]="suggestions"
            (valueChange)="onAnswersChange({ avgNetFee: $event })"
          />
        </lt-suggested-form-field>

        <!-- Tax Prep Returns -->
        <lt-suggested-form-field
          label="Tax Prep Returns"
          helpText="Number of tax returns you plan to process"
          fieldId="taxPrepReturns"
          [suggestions]="suggestions"
          [required]="true"
        >
          <lt-suggested-number-input
            [value]="answers.taxPrepReturns"
            fieldId="taxPrepReturns"
            [suggestions]="suggestions"
            prefix="#"
            (valueChange)="onAnswersChange({ taxPrepReturns: $event })"
          />
        </lt-suggested-form-field>

        <!-- Customer Discounts -->
        <lt-suggested-form-field
          label="Customer Discounts"
          helpText="Percentage discounts given to customers"
          fieldId="discountsPct"
          [suggestions]="suggestions"
        >
          <lt-suggested-percentage-input
            [value]="answers.discountsPct"
            fieldId="discountsPct"
            [suggestions]="suggestions"
            [max]="20"
            (valueChange)="onAnswersChange({ discountsPct: $event })"
          />
        </lt-suggested-form-field>

        <!-- TaxRush fields for Canada -->
        <ng-container *ngIf="region === 'CA' && answers.handlesTaxRush">
          <lt-suggested-form-field
            label="TaxRush Returns"
            helpText="Number of TaxRush returns (typically 15% of tax prep returns)"
            fieldId="taxRushReturns"
            [suggestions]="suggestions"
          >
            <lt-suggested-number-input
              [value]="answers.taxRushReturns"
              fieldId="taxRushReturns"
              [suggestions]="suggestions"
              prefix="#"
              (valueChange)="onAnswersChange({ taxRushReturns: $event })"
            />
          </lt-suggested-form-field>

          <lt-suggested-form-field
            label="TaxRush Average Fee"
            helpText="Average fee per TaxRush return (usually lower than regular returns)"
            fieldId="taxRushAvgNetFee"
            [suggestions]="suggestions"
          >
            <lt-suggested-currency-input
              [value]="answers.taxRushAvgNetFee"
              fieldId="taxRushAvgNetFee"
              [suggestions]="suggestions"
              (valueChange)="onAnswersChange({ taxRushAvgNetFee: $event })"
            />
          </lt-suggested-form-field>
        </ng-container>

        <!-- Other Income - conditional -->
        <lt-suggested-form-field
          *ngIf="answers.hasOtherIncome"
          label="Other Income"
          helpText="Additional revenue (bookkeeping, notary, etc.)"
          fieldId="otherIncome"
          [suggestions]="suggestions"
        >
          <lt-suggested-currency-input
            [value]="answers.otherIncome"
            fieldId="otherIncome"
            [suggestions]="suggestions"
            (valueChange)="onAnswersChange({ otherIncome: $event })"
          />
        </lt-suggested-form-field>
      </lt-wizard-form-section>

      <!-- Calculated Results Section -->
      <lt-wizard-form-section
        title="📊 Calculated Results (Flow Demonstration)"
        icon="🧮"
        description="These values are calculated from your inputs above - suggestions show the flow"
      >
        <!-- Gross Fees -->
        <lt-suggested-form-field
          label="Gross Fees"
          helpText="Total fees before discounts"
          fieldId="grossFees"
          [suggestions]="suggestions"
          [isCalculated]="true"
        >
          <div class="calculated-value gross-fees">
            ${{ formatCurrency(suggestions.grossFees) }}
          </div>
        </lt-suggested-form-field>

        <!-- Discount Amount -->
        <lt-suggested-form-field
          label="Discount Amount"
          helpText="Dollar amount of discounts given"
          fieldId="discountAmount"
          [suggestions]="suggestions"
          [isCalculated]="true"
        >
          <div class="calculated-value discount-amount">
            -${{ formatCurrency(suggestions.discountAmount) }}
          </div>
        </lt-suggested-form-field>

        <!-- Tax Prep Income -->
        <lt-suggested-form-field
          label="Tax Prep Income"
          helpText="Net income after discounts"
          fieldId="taxPrepIncome"
          [suggestions]="suggestions"
          [isCalculated]="true"
        >
          <div class="calculated-value tax-prep-income">
            ${{ formatCurrency(suggestions.taxPrepIncome) }}
          </div>
        </lt-suggested-form-field>

        <!-- TaxRush Income -->
        <lt-suggested-form-field
          *ngIf="region === 'CA' && answers.handlesTaxRush && suggestions.taxRushIncome > 0"
          label="TaxRush Income"
          helpText="Revenue from TaxRush returns"
          fieldId="taxRushIncome"
          [suggestions]="suggestions"
          [isCalculated]="true"
        >
          <div class="calculated-value taxrush-income">
            ${{ formatCurrency(suggestions.taxRushIncome) }}
          </div>
        </lt-suggested-form-field>

        <!-- Total Revenue -->
        <lt-suggested-form-field
          label="Total Revenue"
          helpText="All income sources combined"
          fieldId="totalRevenue"
          [suggestions]="suggestions"
          [isCalculated]="true"
        >
          <div class="calculated-value total-revenue">
            ${{ formatCurrency(suggestions.totalRevenue) }}
          </div>
        </lt-suggested-form-field>
      </lt-wizard-form-section>

      <!-- Educational Summary -->
      <div class="educational-summary">
        <h4 class="summary-title">🎓 How This Works</h4>
        <div class="summary-content">
          <p>
            <strong>Suggestion Flow:</strong> Input field suggestions → Calculated result suggestions
          </p>
          <p>
            <strong>💡 Blue badges:</strong> Suggested input values based on {{ suggestionProfile.name }}
          </p>
          <p>
            <strong>📊 Blue badges:</strong> Calculated results showing how inputs flow to outcomes
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .calculated-value {
      padding: 0.5rem;
      border-radius: 4px;
      font-weight: 500;
      width: 140px;
      text-align: right;
    }

    .calculated-value.gross-fees {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #059669;
    }

    .calculated-value.discount-amount {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
    }

    .calculated-value.tax-prep-income {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #2563eb;
    }

    .calculated-value.taxrush-income {
      background-color: #f0f9ff;
      border: 1px solid #bae6fd;
      color: #0369a1;
    }

    .calculated-value.total-revenue {
      background-color: #f0fdf4;
      border: 2px solid #22c55e;
      color: #15803d;
      font-weight: 600;
      font-size: 1rem;
    }

    .educational-summary {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      font-size: 0.875rem;
    }

    .summary-title {
      margin: 0 0 0.5rem 0;
      color: #1e40af;
      font-weight: 600;
    }

    .summary-content {
      color: #475569;
      line-height: 1.5;
    }

    .summary-content p {
      margin: 0 0 0.5rem 0;
    }

    .summary-content p:last-child {
      margin: 0;
    }
  `]
})
export class SuggestedInputDemoComponent {
  @Input() answers: WizardAnswers = { region: 'US' };
  @Input() region: Region = 'US';
  
  @Output() answersChange = new EventEmitter<Partial<WizardAnswers>>();

  constructor(private suggestionEngine: SuggestionEngineService) {}

  get suggestionProfile(): SuggestionProfile {
    return this.suggestionEngine.getSuggestionProfile(
      this.region,
      this.answers.storeType || 'new',
      this.answers.handlesTaxRush || false
    );
  }

  get suggestions(): CalculatedSuggestions {
    return this.suggestionEngine.calculateSuggestions(this.suggestionProfile, this.answers);
  }

  onAnswersChange(updates: Partial<WizardAnswers>): void {
    this.answersChange.emit(updates);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString();
  }
}
