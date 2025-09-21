import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';
import { APP_VERSION } from '../../version';
import { DebugPanelService } from '../debug-panel/debug-panel.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, BrandLogoComponent],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  @Input() region: 'US' | 'CA' = 'US';
  @Input() wizardCompleted = false;
  @Input() currentPage: 'income' | 'expenses' | 'reports' | 'dashboard' = 'dashboard';

  private navSub?: any;
  readonly appVersion = APP_VERSION;
  readonly debugOpen$ = this.debugSvc.open$;

  constructor(private router: Router, private debugSvc: DebugPanelService) {}

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
    this.router.navigateByUrl('/wizard/income-drivers');
  }

  goDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  goReports(): void {
    this.router.navigateByUrl('/wizard/pnl');
  }

  goExpenses(): void {
    this.router.navigateByUrl('/wizard/expenses');
  }

  resetWizard(): void {
    try {
      localStorage.clear();
    } catch {}
    location.reload();
  }

  toggleDebug(): void {
    this.debugSvc.toggle();
  }
}
