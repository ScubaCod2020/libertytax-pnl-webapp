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
  templateUrl: './suggested-input-demo.component.html',
  styleUrl: './suggested-input-demo.component.scss',
})
export class SuggestedInputDemoComponent {
  @Input() answers: WizardAnswers = { region: 'US' };
  @Input() region: Region = 'US';

  @Output() answersChange = new EventEmitter<Partial<WizardAnswers>>();

  constructor(private suggestionEngine: SuggestionEngineService) {}

  get suggestionProfile(): SuggestionProfile {
    // Use a default profile key for demo purposes
    const profile = this.suggestionEngine.getProfile('US-new-standard');
    return profile || this.suggestionEngine.getProfile('US-new-standard')!;
  }

  get suggestions(): CalculatedSuggestions {
    // Use a default profile for demo purposes
    const profile = this.suggestionProfile;
    return this.suggestionEngine.calculateSuggestions(profile, this.answers);
  }

  onAnswersChange(updates: Partial<WizardAnswers>): void {
    this.answersChange.emit(updates);
  }

  updateField(field: keyof WizardAnswers, value: any): void {
    this.onAnswersChange({ [field]: value });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace('$', '');
  }
}
