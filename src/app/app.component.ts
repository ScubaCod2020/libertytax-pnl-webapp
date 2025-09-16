import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Region, WizardAnswers } from './models/wizard.models';
import { AppStateService } from './services/app-state.service';
import { CalculationService } from './services/calculation.service';
import { PersistenceService } from './services/persistence.service';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { WizardShellComponent } from './components/wizard-shell/wizard-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, HeaderComponent, FooterComponent, WizardShellComponent],
  template: `
    <div class="app-container">
      <!-- Header -->
      <app-header
        [region]="appState.region"
        [showWizard]="appState.showWizard"
        [wizardCompleted]="persistence.getWizardState().wizardCompleted"
        [currentPage]="appState.showWizard ? 'wizard' : 'dashboard'"
        [storeType]="persistence.loadWizardAnswers()?.storeType"
        (setRegion)="onSetRegion($event)"
        (onReset)="onReset()"
        (onShowWizard)="onShowWizard()"
        (onShowDashboard)="onShowDashboard()"
        (onShowReports)="onShowReports()">
      </app-header>

      <!-- Main Content -->
      <main class="main-content">
        <div *ngIf="appState.showWizard" class="wizard-wrapper">
          <app-wizard-shell
            [region]="appState.region"
            [persistence]="persistence"
            (setRegion)="onSetRegion($event)"
            (wizardComplete)="onWizardComplete($event)"
            (onCancel)="onWizardCancel()">
          </app-wizard-shell>
        </div>

        <div *ngIf="!appState.showWizard" class="dashboard-wrapper">
          <div class="container responsive-grid">
            <h2>Dashboard Coming Soon...</h2>
            <p>This will contain the main P&L dashboard with calculations and charts.</p>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <app-footer
        [showWizard]="appState.showWizard"
        [wizardCompleted]="persistence.getWizardState().wizardCompleted"
        [currentPage]="appState.showWizard ? 'wizard' : 'dashboard'"
        (onNavigate)="onNavigate($event)">
      </app-footer>

      <!-- Router Outlet for additional routes like /debug -->
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f8fafc;
    }

    .main-content {
      padding: 2rem 0;
    }

    .wizard-wrapper,
    .dashboard-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .responsive-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .wizard-wrapper,
      .dashboard-wrapper {
        padding: 0 1rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  appState: any = {};

  constructor(
    private appStateService: AppStateService,
    private calculationService: CalculationService,
    public persistence: PersistenceService
  ) {}

  ngOnInit(): void {
    // Subscribe to app state changes
    this.appStateService.state$.subscribe(state => {
      this.appState = state;
      // Recalculate when state changes
      this.calculationService.calculateResults(state);
    });

    // Initialize from persistence
    const wizardState = this.persistence.getWizardState();
    if (wizardState.showWizard && !this.appState.showWizard) {
      console.log('🧙‍♂️ Restoring incomplete wizard session');
      this.appStateService.setShowWizard(true);
    }

    if (wizardState.wizardCompleted && !wizardState.showWizard) {
      const savedAnswers = this.persistence.loadWizardAnswers();
      if (savedAnswers) {
        console.log('🧙‍♂️ Loading completed wizard answers on startup:', savedAnswers);
        this.appStateService.applyWizardAnswers(savedAnswers);
      }
    }
  }

  onSetRegion(region: Region): void {
    this.appStateService.setRegion(region);
    this.persistence.saveBaseline(this.appStateService.currentState);
  }

  onReset(): void {
    console.log('🔄 Reset session');
    this.appStateService.resetToDefaults();
    this.persistence.clearStorage();
    this.appStateService.setShowWizard(true);
  }

  onShowWizard(): void {
    this.appStateService.setShowWizard(true);
  }

  onShowDashboard(): void {
    this.appStateService.setShowWizard(false);
  }

  onShowReports(): void {
    console.log('📊 Reports feature coming soon!');
  }

  onWizardComplete(answers: WizardAnswers): void {
    console.log('🧙‍♂️ Wizard completed with answers:', answers);
    this.appStateService.applyWizardAnswers(answers);
    this.persistence.saveBaseline(this.appStateService.currentState);
    this.persistence.saveWizardAnswers(answers);
    this.persistence.markWizardCompleted();
    this.appStateService.setShowWizard(false);
  }

  onWizardCancel(): void {
    console.log('🧙‍♂️ Wizard cancelled');
    this.appStateService.setShowWizard(false);
  }

  onNavigate(page: string): void {
    switch(page) {
      case 'wizard':
        this.appStateService.setShowWizard(true);
        break;
      case 'dashboard':
        if (this.persistence.getWizardState().wizardCompleted) {
          this.appStateService.setShowWizard(false);
        }
        break;
      case 'debug':
        // Navigate to debug route - open in new tab for dev tools
        window.open('/debug', '_blank');
        break;
      case 'pro-tips':
        console.log('🔮 Pro-Tips feature coming soon!');
        break;
      case 'practice':
        console.log('🎯 Practice Problems feature coming soon!');
        break;
      case 'export':
        console.log('📄 Export functionality coming soon!');
        break;
      case 'settings':
      case 'reports':
        console.log(`Navigate to ${page}`);
        break;
    }
  }
}
