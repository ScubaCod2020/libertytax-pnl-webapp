import { Component, OnDestroy, OnInit, signal, computed, isDevMode } from '@angular/core';
import {
  Event as RouterEvent,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
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
import { ProjectedService } from './services/projected.service';

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
  private a11yObserver?: MutationObserver;
  private onFocusIn?: (ev: FocusEvent) => void;

  // Show overlay when navigating or recalculating
  readonly showExpensesLoading = computed(() => this.pendingRoutes().size > 0);

  // Streams used by template
  recalculating$ = this.projected.recalculating$;

  // Regional watermark image based on selected region
  readonly regionalWatermark$ = this.wizardState.answers$.pipe(
    map(answers => {
      const region = answers.region || 'US';
      return region === 'CA'
        ? '/assets/brands/ca/LTCA-Leaf-ISO-Red.jpg'
        : '/assets/brands/us/LT-Torch-CMYK.png';
    })
  );

  readonly regionalBrand$ = this.wizardState.answers$.pipe(
    map(answers => {
      const region = answers.region || 'US';
      return region === 'CA'
        ? '/assets/brands/ca/LT-Canada-Logo-RGB.jpg'
        : '/assets/brands/us/LT-2022-Stack-Color-RGB.png';
    })
  );

  constructor(
    private router: Router,
    private wizardState: WizardStateService,
    private projected: ProjectedService
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
    // Apply form a11y/autofill fixups on initial render (immediately and after paint)
    this.applyFormA11yFixups();
    requestAnimationFrame(() => this.applyFormA11yFixups());
    setTimeout(() => this.applyFormA11yFixups(), 0);
    // Observe DOM mutations to re-apply fixups for dynamically inserted inputs
    try {
      this.a11yObserver?.disconnect?.();
      this.a11yObserver = new MutationObserver(() => {
        // Debounce to the next tick to batch multiple mutations
        setTimeout(() => this.applyFormA11yFixups(), 0);
      });
      this.a11yObserver.observe(document.body, { childList: true, subtree: true });
      // Ensure focused fields are labeled at focus time
      this.onFocusIn = (ev: FocusEvent) => {
        const t = ev.target as HTMLElement | null;
        if (!t) return;
        if (
          t instanceof HTMLInputElement ||
          t instanceof HTMLSelectElement ||
          t instanceof HTMLTextAreaElement
        ) {
          this.applyFormA11yFixups();
        }
      };
      document.addEventListener('focusin', this.onFocusIn as any, { capture: true });
    } catch {}
    this.navSub = this.router.events.subscribe(
      (e: RouterEvent & { url?: string; urlAfterRedirects?: string }) => {
        if (e instanceof NavigationStart) {
          const next = new Set(this.pendingRoutes());
          next.add(e.url || '');
          this.pendingRoutes.set(next);
          // Safety net: auto-clear after 5s to avoid stuck overlays
          setTimeout(() => {
            if (this.pendingRoutes().size > 0) {
              console.warn(
                '⏳ overlay watchdog: clearing pending routes after timeout',
                Array.from(this.pendingRoutes())
              );
              this.pendingRoutes.set(new Set());
            }
          }, 5000);
        }
        if (
          e instanceof NavigationEnd ||
          e instanceof NavigationCancel ||
          e instanceof NavigationError
        ) {
          // Clear all pending routes on settle to avoid mismatched URL variants
          if (this.pendingRoutes().size > 0) {
            console.log('✅ overlay cleared on navigation settle', { type: e.constructor.name });
            this.pendingRoutes.set(new Set());
          }
        }
        // Only derive and update page metadata once navigation has completed
        if (e instanceof NavigationEnd) {
          const effectiveUrl = e.urlAfterRedirects || e.url;
          const d = derive(effectiveUrl);
          this.pageTitle = d.title;
          this.pageSubtitle = d.subtitle;
          this.pageEditable = d.editable;
          this.currentPage = d.page;
          // Re-apply fixups after each successful navigation to handle new views
          setTimeout(() => this.applyFormA11yFixups(), 0);
        }
      }
    );

    // Debug-gated UI tracing (click + input changes) without capturing raw values
    try {
      const debugEnabled = isDevMode() || localStorage.getItem('debug_ui_trace') === '1';
      if (debugEnabled) {
        document.addEventListener(
          'click',
          ev => {
            const target = ev.target as HTMLElement | null;
            const id = target?.id || '';
            const cls = target?.className?.toString?.() || '';
            const role = target?.getAttribute?.('role') || '';
            const aria = target?.getAttribute?.('aria-label') || '';
            const text = (target?.textContent || '').trim().slice(0, 80);
            console.log('🖱️ click', { id, cls, role, aria, text });
          },
          { capture: true }
        );

        const logChange = (el: HTMLElement, type: string) => {
          const id = el.id || '';
          const name = (
            el.getAttribute('name') ||
            el.getAttribute('data-testid') ||
            el.tagName
          ).toLowerCase();
          const masked = '***';
          console.log('✏️ input', { type, name, id, value: masked });
        };

        document.addEventListener(
          'change',
          ev => {
            const t = ev.target as HTMLElement | null;
            if (!t) return;
            if (
              t instanceof HTMLInputElement ||
              t instanceof HTMLSelectElement ||
              t instanceof HTMLTextAreaElement
            ) {
              logChange(t, 'change');
            }
          },
          { capture: true }
        );

        document.addEventListener(
          'input',
          ev => {
            const t = ev.target as HTMLElement | null;
            if (!t) return;
            if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
              // Only log high-signal inputs when explicitly opted in
              if ((t.getAttribute('data-debug-track') || '0') === '1') {
                logChange(t, 'input');
              }
            }
          },
          { capture: true }
        );

        console.log(
          '🧭 UI trace enabled (dev mode or localStorage.debug_ui_trace = "1"). Values masked.'
        );

        // Mirror recalculating$ changes for overlay diagnosis
        this.recalculating$.subscribe((v: boolean) => {
          console.log('⏳ recalculating$ →', v);
        });
      }
    } catch {}
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe?.();
    try {
      this.a11yObserver?.disconnect?.();
    } catch {}
    try {
      if (this.onFocusIn)
        document.removeEventListener('focusin', this.onFocusIn as any, { capture: true } as any);
    } catch {}
  }

  // Minimal runtime fixups for form a11y/autofill without altering templates
  private applyFormA11yFixups(): void {
    try {
      const doc = document;
      const fields = Array.from(doc.querySelectorAll('input, select, textarea')) as Array<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >;
      let counter = 0;
      for (const el of fields) {
        if (!el.id) {
          el.id = `auto_id_${++counter}`;
        }
        if (!el.getAttribute('name')) {
          el.setAttribute('name', el.id);
        }
        if (!el.getAttribute('autocomplete')) {
          el.setAttribute('autocomplete', 'on');
        }
        // Ensure there is an associated label
        const hasFor = doc.querySelector(`label[for="${el.id}"]`);
        if (!hasFor) {
          const parentLabel = el.closest('label');
          if (parentLabel) {
            parentLabel.setAttribute('for', el.id);
          } else {
            const prev = el.previousElementSibling as HTMLLabelElement | null;
            if (prev && prev.tagName === 'LABEL' && !prev.htmlFor) {
              prev.htmlFor = el.id;
            }
          }
        }
        // If still no explicit label association, add an aria fallback
        const hasAssociatedLabel =
          !!doc.querySelector(`label[for="${el.id}"]`) || !!el.closest('label');
        if (!hasAssociatedLabel) {
          // Try to use placeholder or name as aria-label
          const candidateLabel = (
            el.getAttribute('placeholder') ||
            el.getAttribute('name') ||
            ''
          ).trim();
          if (candidateLabel) {
            if (!el.getAttribute('aria-label')) {
              el.setAttribute('aria-label', candidateLabel);
            }
          } else {
            // Create a visually hidden label for screen readers and link via aria-labelledby
            const srOnlyId = `sr_label_${el.id}`;
            if (!doc.getElementById(srOnlyId)) {
              const sr = doc.createElement('span');
              sr.id = srOnlyId;
              sr.textContent = 'Form field';
              sr.setAttribute(
                'style',
                'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;'
              );
              // Prefer placing before the field for proximity
              el.parentElement?.insertBefore(sr, el);
            }
            if (!el.getAttribute('aria-labelledby')) {
              el.setAttribute('aria-labelledby', srOnlyId);
            }
          }
        }
      }
      const labels = Array.from(doc.querySelectorAll('label')) as HTMLLabelElement[];
      for (const label of labels) {
        if (label.htmlFor) continue;
        const control = label.querySelector('input, select, textarea') as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
          | null;
        if (control) {
          if (!control.id) {
            control.id = `auto_id_${++counter}`;
            if (!control.getAttribute('name')) control.setAttribute('name', control.id);
            if (!control.getAttribute('autocomplete')) control.setAttribute('autocomplete', 'on');
          }
          label.htmlFor = control.id;
        }
      }
    } catch {}
  }
}
