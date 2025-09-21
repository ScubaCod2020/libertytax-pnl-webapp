import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DebugPanelComponent } from './components/debug-panel/debug-panel.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { AppFooterComponent } from './components/app-footer/app-footer.component';
import { QuickStartWizardComponent } from './components/quick-start-wizard/quick-start-wizard.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeaderComponent, QuickStartWizardComponent, AppFooterComponent, DebugPanelComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  pageTitle = '';
  pageSubtitle = '';
  pageEditable = false;
  private navSub?: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const derive = (url: string) => {
      if (url.includes('/wizard/income-drivers')) return { title: 'Welcome – Quick Start Wizard', subtitle: 'Create your customized P&L dashboard in just a few quick steps', editable: true };
      if (url.includes('/wizard/expenses')) return { title: 'Expenses', subtitle: 'Using your selections from the wizard', editable: false };
      if (url.includes('/wizard/pnl')) return { title: 'P&L Reports', subtitle: 'Using your selections from the wizard', editable: false };
      if (url.includes('/dashboard')) return { title: 'Dashboard', subtitle: 'Using your selections from the wizard', editable: false };
      return { title: '', subtitle: '', editable: false };
    };
    const now = derive(this.router.url);
    this.pageTitle = now.title;
    this.pageSubtitle = now.subtitle;
    this.pageEditable = now.editable;
    this.navSub = this.router.events.subscribe((e: any) => {
      if (e?.url) {
        const d = derive(e.url);
        this.pageTitle = d.title;
        this.pageSubtitle = d.subtitle;
        this.pageEditable = d.editable;
      }
    });
  }

  ngOnDestroy(): void { this.navSub?.unsubscribe?.(); }
}
