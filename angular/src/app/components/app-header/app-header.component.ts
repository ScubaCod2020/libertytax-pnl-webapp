import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';
import { APP_VERSION } from '../../version';
import { DebugPanelService } from '../debug-panel/debug-panel.service';
import { WizardStateService } from '../../core/services/wizard-state.service';

export interface HeaderAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;
}

export interface StoreInfo {
  name?: string;
  type: 'single' | 'multi';
  count?: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, AsyncPipe, BrandLogoComponent],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  @Input() wizardCompleted = false;
  @Input() set currentPage(value: 'income' | 'expenses' | 'reports' | 'dashboard') {
    console.log('📊 Header received currentPage:', value);
    this._currentPage = value;
  }
  get currentPage(): 'income' | 'expenses' | 'reports' | 'dashboard' {
    return this._currentPage;
  }
  private _currentPage: 'income' | 'expenses' | 'reports' | 'dashboard' = 'dashboard';
  // Optional presentational inputs to mirror React AppHeader features (no business logic here)
  @Input() breadcrumb?: Array<{ label: string; onClick?: () => void }>;
  @Input() actions?: HeaderAction[];
  @Input() storeInfo?: StoreInfo;

  // Inject dependencies FIRST (before using them in other properties)
  private router = inject(Router);
  private debugSvc = inject(DebugPanelService);
  private wizardState = inject(WizardStateService);

  // Now we can safely use the injected dependencies
  private navSub?: any;
  readonly appVersion = APP_VERSION;
  readonly debugOpen$ = this.debugSvc.open$;

  // Get region from WizardStateService for reactive updates
  readonly region$ = this.wizardState.answers$.pipe(map((answers) => answers.region || 'US'));

  ngOnInit(): void {
    const derive = (url: string): 'income' | 'expenses' | 'reports' | 'dashboard' => {
      if (url.includes('/wizard/income-drivers')) return 'income';
      if (url.includes('/wizard/expenses')) return 'expenses';
      if (url.includes('/wizard/pnl')) return 'reports';
      return 'dashboard';
    };

    this.currentPage = derive(this.router.url);
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentPage = derive(e.urlAfterRedirects || e.url);
      });
  }

  ngOnDestroy(): void {
    if (this.navSub && typeof this.navSub.unsubscribe === 'function') {
      this.navSub.unsubscribe();
    }
  }

  goIncome(): void {
    console.log('🎯 [HEADER] Navigating to income drivers...');
    this.router.navigateByUrl('/wizard/income-drivers');
  }

  goDashboard(): void {
    console.log('🎯 [HEADER] Navigating to dashboard...');
    this.router.navigateByUrl('/dashboard');
  }

  goReports(): void {
    console.log('🎯 [HEADER] Navigating to reports...');
    this.router.navigateByUrl('/wizard/pnl');
  }

  goExpenses(): void {
    console.log('🎯 [HEADER] Navigating to expenses...');
    this.router.navigateByUrl('/wizard/expenses');
  }

  resetWizard(): void {
    console.log('🔄🔄🔄 [HEADER RESET] Button clicked - starting full reset');
    console.log('🔄 [HEADER RESET] Current URL:', window.location.href);
    try {
      // Clear all wizard-related localStorage
      localStorage.removeItem('wizard_state_v1');
      localStorage.removeItem('pnl_settings_v1');
      localStorage.clear();
      console.log('🔄 [HEADER RESET] Cleared localStorage');
    } catch (e) {
      console.log('🔄 [HEADER RESET] Error clearing localStorage:', e);
    }
    // Navigate to the start of the wizard instead of refreshing
    console.log('🔄 [HEADER RESET] Navigating to /wizard/income-drivers');
    this.router.navigateByUrl('/wizard/income-drivers').then((success) => {
      console.log('🔄 [HEADER RESET] Navigation result:', success);
      console.log('🔄 [HEADER RESET] New URL:', window.location.href);
    });
  }

  toggleDebug(): void {
    this.debugSvc.toggle();
  }

  actionStyle(a?: HeaderAction['variant']): Record<string, string> {
    switch (a) {
      case 'primary':
        return { backgroundColor: '#3b82f6', color: 'white', border: '1px solid #3b82f6' };
      case 'danger':
        return { backgroundColor: '#ef4444', color: 'white', border: '1px solid #ef4444' };
      default:
        return { backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' };
    }
  }

  get hasBreadcrumb(): boolean {
    return !!this.breadcrumb && this.breadcrumb.length > 0;
  }
}
