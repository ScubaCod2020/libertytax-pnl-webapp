import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { map, filter, startWith } from 'rxjs/operators';
import { AppConfigService } from '../../services/app-config.service';
import { WizardStateService } from '../../core/services/wizard-state.service';

@Component({
  selector: 'app-quick-start-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-start-wizard.component.html',
  styleUrls: ['./quick-start-wizard.component.scss'],
})
export class QuickStartWizardComponent {
  @Input() title = '';
  @Input() editable = false;
  @Input() subtitle = '';

  // Inject dependencies FIRST (before using them in other properties)
  public appCfg = inject(AppConfigService);
  private wizardState = inject(WizardStateService);
  private router = inject(Router);

  // Now we can safely use the injected dependencies
  // Get settings from WizardStateService instead of SettingsService
  readonly settings$ = this.wizardState.answers$.pipe(
    map((answers) => ({
      region: answers.region || 'US',
      storeType: answers.storeType || 'new',
      taxYear: new Date().getFullYear(),
      taxRush: answers.handlesTaxRush || false,
      otherIncome: answers.hasOtherIncome || false,
    }))
  );

  // Detect current page to show appropriate view
  readonly currentPage$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map((e) => this.getPageFromUrl(e.urlAfterRedirects || e.url)),
    startWith(this.getPageFromUrl(this.router.url))
  );

  private getPageFromUrl(
    url: string
  ): 'income-drivers' | 'expenses' | 'pnl' | 'dashboard' | 'other' {
    const page = url.includes('/wizard/income-drivers')
      ? 'income-drivers'
      : url.includes('/wizard/expenses')
        ? 'expenses'
        : url.includes('/wizard/pnl')
          ? 'pnl'
          : url.includes('/dashboard')
            ? 'dashboard'
            : 'other';
    console.log('🧙 [Quick Start Wizard] Page detected from URL:', url, '→', page);
    return page;
  }

  onRegionChange(v: string) {
    const region = v === 'US' ? 'US' : 'CA';
    console.log('🌍 [Wizard] Region changed to:', region);
    this.wizardState.updateAnswers({ region });
  }

  onStoreTypeChange(v: string) {
    const storeType = v === 'new' ? 'new' : 'existing';
    console.log('🏪 [Wizard] Store Type changed to:', storeType);
    this.wizardState.updateAnswers({ storeType });
  }

  onTaxRushChange(v: string | boolean) {
    // Handle both string values from radio buttons and boolean values
    const boolValue = v === true || v === 'true';
    console.log('🚀 [Wizard] TaxRush changed to:', boolValue, '(from:', v, ')');
    this.wizardState.updateAnswers({ handlesTaxRush: boolValue });
  }

  onOtherIncomeChange(v: string | boolean) {
    // Handle both string values from radio buttons and boolean values
    const boolValue = v === true || v === 'true';
    console.log('💼 [Wizard] Other Income changed to:', boolValue, '(from:', v, ')');
    this.wizardState.updateAnswers({ hasOtherIncome: boolValue });
  }

  resetWizard() {
    console.log('🔄🔄🔄 [QUICK START RESET] Button clicked - resetting Quick Start Wizard only');
    console.log('🔄 [QUICK START RESET] Current URL:', window.location.href);

    // Reset ONLY Quick Start Wizard configuration settings (not target values)
    this.wizardState.updateAnswers({
      region: 'US',
      storeType: 'new',
      handlesTaxRush: false,
      hasOtherIncome: false,
      otherIncome: undefined,
      discountsPct: 1.0,
      discountsAmt: undefined,
    });

    console.log('🔄 [QUICK START RESET] Quick Start Wizard reset to defaults');
  }

  isComplete(): boolean {
    const answers = this.wizardState.answers;

    // Basic requirements: region and store type
    if (!answers.region || !answers.storeType) {
      console.log('🧙 [Quick Start Wizard] Incomplete: Missing region or storeType');
      return false;
    }

    // If Canada, need TaxRush decision
    if (answers.region === 'CA' && answers.handlesTaxRush === undefined) {
      console.log('🧙 [Quick Start Wizard] Incomplete: Canada region needs TaxRush decision');
      return false;
    }

    // Need other income decision
    if (answers.hasOtherIncome === undefined) {
      console.log('🧙 [Quick Start Wizard] Incomplete: Need other income decision');
      return false;
    }

    console.log('🧙 [Quick Start Wizard] Complete! All requirements met');
    return true;
  }
}
