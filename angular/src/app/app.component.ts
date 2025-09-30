import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { DebugPanelComponent } from './components/debug-panel/debug-panel.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { AppFooterComponent } from './components/app-footer/app-footer.component';
import { QuickStartWizardComponent } from './components/quick-start-wizard/quick-start-wizard.component';
import { WizardStateService } from './core/services/wizard-state.service';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { DebugOverlayComponent } from './shared/debug/debug-overlay.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    AppHeaderComponent,
    QuickStartWizardComponent,
    AppFooterComponent,
    DebugPanelComponent,
    LoadingOverlayComponent,
    DebugOverlayComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  pageTitle = '';
  pageSubtitle = '';
  pageEditable = false;
  currentPage: 'income' | 'expenses' | 'reports' | 'dashboard' = 'income';
  private navSub?: any;
  private pendingRoutes = signal<Set<string>>(new Set());

  readonly showExpensesLoading = computed(() => this.pendingRoutes().has('/wizard/expenses'));

  // Regional watermark image based on selected region
  readonly regionalWatermark$ = this.wizardState.answers$.pipe(
    map((answers) => {
      const region = answers.region || 'US';
      return region === 'CA'
        ? '/assets/brands/ca/LTCA-Leaf-ISO-Red.jpg'
        : '/assets/brands/us/LT-Torch-CMYK.png';
    })
  );

  constructor(
    private router: Router,
    private wizardState: WizardStateService
  ) {}

  ngOnInit(): void {
    const derive = (url: string) => {
      console.log('🚀 Route detection - URL:', url);
      if (url.includes('/wizard/income-drivers')) {
        console.log('✅ Detected income-drivers page');
        return {
          title: 'Welcome – Quick Start Wizard',
          subtitle: 'Create your customized P&L dashboard in just a few quick steps',
          editable: true,
          page: 'income' as const,
        };
      }
      if (url.includes('/wizard/expenses')) {
        console.log('✅ Detected expenses page');
        return {
          title: 'Expenses',
          subtitle: 'Using your selections from the wizard',
          editable: false,
          page: 'expenses' as const,
        };
      }
      if (url.includes('/wizard/pnl')) {
        console.log('✅ Detected pnl page');
        return {
          title: 'P&L Reports',
          subtitle: 'Using your selections from the wizard',
          editable: false,
          page: 'reports' as const,
        };
      }
      if (url.includes('/dashboard')) {
        console.log('✅ Detected dashboard page');
        return {
          title: 'Dashboard',
          subtitle: 'Using your selections from the wizard',
          editable: false,
          page: 'dashboard' as const,
        };
      }
      console.log('❌ No route match, defaulting to income');
      return { title: '', subtitle: '', editable: false, page: 'income' as const };
    };
    const now = derive(this.router.url);
    this.pageTitle = now.title;
    this.pageSubtitle = now.subtitle;
    this.pageEditable = now.editable;
    this.currentPage = now.page;
    this.navSub = this.router.events.subscribe((e: Event & { url?: string }) => {
      if (e instanceof NavigationStart && e.url) {
        const next = new Set(this.pendingRoutes());
        next.add(e.url);
        this.pendingRoutes.set(next);
      }
      if ((e instanceof NavigationEnd || e instanceof NavigationCancel) && e.url) {
        const next = new Set(this.pendingRoutes());
        next.delete(e.url);
        this.pendingRoutes.set(next);
      }
      if (e?.url) {
        const d = derive(e.url);
        this.pageTitle = d.title;
        this.pageSubtitle = d.subtitle;
        this.pageEditable = d.editable;
        this.currentPage = d.page;
      }
    });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe?.();
  }
}
