import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationStart, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { map, filter, startWith, takeUntil } from 'rxjs/operators';
import { AppConfigService } from '../../services/app-config.service';
import { WizardStateService } from '../../core/services/wizard-state.service';

@Component({
  selector: 'app-quick-start-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-start-wizard.component.html',
  styleUrls: ['./quick-start-wizard.component.scss'],
})
export class QuickStartWizardComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() editable = false;
  @Input() subtitle = '';

  public appCfg = inject(AppConfigService);
  private wizardState = inject(WizardStateService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  readonly settings$ = this.wizardState.answers$.pipe(
    map((answers) => ({
      region: answers.region || 'US',
      storeType: answers.storeType || 'new',
      taxYear: new Date().getFullYear(),
      taxRush: answers.handlesTaxRush || false,
      otherIncome: answers.hasOtherIncome || false,
    }))
  );

  readonly currentPage$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map((e) => this.getPageFromUrl(e.urlAfterRedirects || e.url)),
    startWith(this.getPageFromUrl(this.router.url))
  );

  ngOnInit(): void {
    const lockEnabled = (typeof window !== 'undefined' && localStorage.getItem('enable_wizard_lock') === '1');
    if (lockEnabled) {
      this.router.events.pipe(takeUntil(this.destroy$)).subscribe((evt) => {
        if (evt instanceof NavigationStart) {
          const isLeavingIncome = !evt.url.includes('/wizard/income-drivers');
          if (isLeavingIncome && this.wizardState.isWizardConfigComplete(this.wizardState.answers)) {
            this.wizardState.lockQuickWizard();
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
    // Safety: ensure wizard remains editable after config flips
    try {
      (this.wizardState as any).unlockQuickWizard?.();
      console.log('🔓 Wizard unlocked after region change');
    } catch {}
    // Ensure dependent flags are present to keep form editable
    if (region === 'CA' && this.wizardState.answers.handlesTaxRush === undefined) {
      this.wizardState.updateAnswers({ handlesTaxRush: false });
    }
    if (this.wizardState.answers.hasOtherIncome === undefined) {
      this.wizardState.updateAnswers({ hasOtherIncome: false });
    }
  }

  onStoreTypeChange(v: string) {
    const storeType = v === 'new' ? 'new' : 'existing';
    console.log('🏪 [Wizard] Store Type changed to:', storeType);
    this.wizardState.updateAnswers({ storeType });
    // Safety: ensure wizard remains editable after config flips
    try {
      (this.wizardState as any).unlockQuickWizard?.();
      console.log('🔓 Wizard unlocked after store type change');
    } catch {}
  }

  onTaxRushChange(v: string | boolean) {
    const boolValue = v === true || v === 'true';
    console.log('🚀 [Wizard] TaxRush changed to:', boolValue, '(from:', v, ')');
    this.wizardState.updateAnswers({ handlesTaxRush: boolValue });
  }

  onOtherIncomeChange(v: string | boolean) {
    const boolValue = v === true || v === 'true';
    console.log('💼 [Wizard] Other Income changed to:', boolValue, '(from:', v, ')');
    this.wizardState.updateAnswers({ hasOtherIncome: boolValue });
  }

  resetWizard() {
    console.log('🔄🔄🔄 [QUICK START RESET] Button clicked - resetting Quick Start Wizard only');
    console.log('🔄 [QUICK START RESET] Current URL:', window.location.href);

    this.wizardState.resetQuickStartConfig();

    console.log('🔄 [QUICK START RESET] Quick Start Wizard reset to defaults');
  }

  isComplete(): boolean {
    const answers = this.wizardState.answers;
    if (!this.wizardState.isWizardConfigComplete(answers)) {
      return false;
    }
    return this.wizardState.isQuickWizardLocked();
  }
}
