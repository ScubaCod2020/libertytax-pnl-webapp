import { Component, OnDestroy, OnInit, isDevMode } from '@angular/core';
import { DebugPanelService } from '../debug-panel/debug-panel.service';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MILESTONES, MilestoneItem } from '../../lib/milestones';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss'],
})
export class AppFooterComponent implements OnInit, OnDestroy {
  constructor(
    public debugSvc: DebugPanelService,
    private router: Router
  ) {}

  currentPage: 'income' | 'expenses' | 'reports' | 'dashboard' = 'dashboard';
  private navSub?: any;
  showMilestones = false;
  milestones: MilestoneItem[] = MILESTONES;

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

    const href = location.href.toLowerCase();
    const hasDebug =
      href.includes('debug=') ||
      href.includes('?debug') ||
      href.includes('#debug') ||
      this.router.url.toLowerCase().includes('debug');
    this.showMilestones = isDevMode() || hasDebug;
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe?.();
  }

  goIncome(): void {
    console.log('🦶 [FOOTER] Navigating to income drivers...');
    this.router.navigateByUrl('/wizard/income-drivers');
  }
  goExpenses(): void {
    console.log('🦶 [FOOTER] Navigating to expenses...');
    this.router.navigateByUrl('/wizard/expenses');
  }
  goReports(): void {
    console.log('🦶 [FOOTER] Navigating to reports...');
    this.router.navigateByUrl('/wizard/pnl');
  }
  goDashboard(): void {
    console.log('🦶 [FOOTER] Navigating to dashboard...');
    this.router.navigateByUrl('/dashboard');
  }

  toggleDebug(): void {
    this.debugSvc.toggle();
  }
}
