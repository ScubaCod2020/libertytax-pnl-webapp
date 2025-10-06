import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationStart, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { map, filter, startWith, takeUntil } from 'rxjs/operators';
import { AppConfigService } from '../../services/app-config.service';
import { WizardStateService } from '../../core/services/wizard-state.service';
import { AppMetaService } from '../../core/meta/app-meta.service';

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
  private meta = inject(AppMetaService);

  readonly settings$ = this.wizardState.answers$.pipe(
    map((answers) => {
      const settings = {
        region: answers.region || 'US',
        storeType: answers.storeType || 'new',
        taxYear: new Date().getFullYear(),
        taxRush: answers.handlesTaxRush === true, // Ensure boolean
        otherIncome: answers.hasOtherIncome === true, // Ensure boolean
      };
      console.log('🔍 [Quick Start Wizard] Settings computed:', settings);
      console.log('🔍 [Quick Start Wizard] Raw answers:', answers);
      return settings;
    })
  );

  readonly currentPage$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map((e) => this.getPageFromUrl(e.urlAfterRedirects || e.url)),
    startWith(this.getPageFromUrl(this.router.url))
  );

  ngOnInit(): void {
    this.meta.setTitle('Quick Wizard • Liberty P&L');
    this.meta.setDesc('Configure forecast inputs.');
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((evt) => {
      if (evt instanceof NavigationStart) {
        const isLeavingIncome = !evt.url.includes('/wizard/income-drivers');
        if (isLeavingIncome && this.wizardState.isWizardConfigComplete(this.wizardState.answers)) {
          this.wizardState.lockQuickWizard();
        }
      }
    });
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
  }

  onRegionLabelClick(value: string, event: Event) {
    console.log('🔍 [Debug] Region label clicked:', value);
    event.preventDefault();
    event.stopPropagation();
    this.onRegionChange(value);
  }

  onStoreTypeChange(v: string) {
    const storeType = v === 'new' ? 'new' : 'existing';
    console.log('🏪 [Wizard] Store Type changed to:', storeType);
    this.wizardState.updateAnswers({ storeType });
  }

  onTaxRushChange(v: string | boolean) {
    const boolValue = v === true || v === 'true';
    console.log('🚀 [Wizard] TaxRush changed to:', boolValue, '(from:', v, ')');
    console.log(
      '🚀 [Wizard] Current handlesTaxRush before update:',
      this.wizardState.answers.handlesTaxRush
    );
    this.wizardState.updateAnswers({ handlesTaxRush: boolValue });
    console.log(
      '🚀 [Wizard] Current handlesTaxRush after update:',
      this.wizardState.answers.handlesTaxRush
    );
  }

  onTaxRushLabelClick(value: boolean, event: Event) {
    console.log('🔍 [Debug] TaxRush label clicked:', value);
    event.preventDefault();
    event.stopPropagation();
    this.onTaxRushChange(value);
  }

  onOtherIncomeChange(v: string | boolean) {
    const boolValue = v === true || v === 'true';
    console.log('💼 [Wizard] Other Income changed to:', boolValue, '(from:', v, ')');
    this.wizardState.updateAnswers({ hasOtherIncome: boolValue });
  }

  onOtherIncomeLabelClick(value: boolean, event: Event) {
    console.log('🔍 [Debug] Other Income label clicked:', value);
    event.preventDefault();
    event.stopPropagation();
    this.onOtherIncomeChange(value);
  }

  onStoreTypeLabelClick(value: string, event: Event) {
    console.log('🔍 [Debug] Store Type label clicked:', value);
    event.preventDefault();
    event.stopPropagation();
    this.onStoreTypeChange(value);
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
