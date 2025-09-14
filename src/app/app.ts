import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Region, WizardAnswers } from './models/wizard.models';
import { AppStateService } from './services/app-state.service';
import { CalculationService } from './services/calculation.service';
import { PersistenceService } from './services/persistence.service';
import { BrandingService } from './services/branding.service';
import { debugLog } from './utils/debug.utils';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { WizardShellComponent } from './components/wizard-shell/wizard-shell.component';
import { BrandWatermarkComponent } from './components/brand-watermark/brand-watermark.component';
import { DashboardComponent, CalculationResults } from './components/dashboard/dashboard.component';
import { InputsPanelComponent } from './components/inputs-panel/inputs-panel.component';
import { InputsPanelData } from './models/expense.models';
import { ProjectedPerformanceComponent, ProjectedPerformanceData } from './components/projected-performance/projected-performance.component';
import { DebugSystemComponent } from './components/debug-system/debug-system.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, WizardShellComponent, BrandWatermarkComponent, DashboardComponent, InputsPanelComponent, ProjectedPerformanceComponent, DebugSystemComponent],
  template: `
    <div class="app-container">
      <!-- Regional Brand Watermark -->
      <app-brand-watermark [region]="appState.region"></app-brand-watermark>
      
      <!-- Main Content -->
      <div class="main-wrapper">
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
              [resetTrigger]="resetCounter"
              (setRegion)="onSetRegion($event)"
              (wizardComplete)="onWizardComplete($event)"
              (wizardCancel)="onWizardCancel()">
            </app-wizard-shell>
          </div>

          <div *ngIf="!appState.showWizard" class="dashboard-wrapper">
            <div class="dashboard-container">
              <!-- Dashboard Grid Layout -->
              <div class="dashboard-grid">
                <!-- Left Column: Inputs Panel -->
                <div class="dashboard-left">
                  <app-inputs-panel
                    [data]="inputsData"
                    (dataChange)="onInputsChange($event)">
                  </app-inputs-panel>
                </div>

                <!-- Right Column: Dashboard and Performance -->
                <div class="dashboard-right">
                  <!-- Main Dashboard -->
                  <app-dashboard
                    [results]="calculationResults"
                    [hasOtherIncome]="inputsData.hasOtherIncome || false">
                  </app-dashboard>

                  <!-- Projected Performance Panel -->
                  <app-projected-performance
                    [data]="projectedPerformanceData">
                  </app-projected-performance>
                </div>
              </div>
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
      </div>

      <!-- Debug System -->
      <app-debug-system
        [showDebugToggle]="true"
        [region]="appState.region"
        [calculations]="calculationResults"
        [appState]="inputsData"
        (saveNow)="onDebugSaveNow()"
        (dumpStorage)="onDebugDumpStorage()"
        (copyJSON)="onDebugCopyJSON()"
        (clearStorage)="onDebugClearStorage()"
        (showWizard)="onShowWizard()"
        (thresholdsChange)="onDebugThresholdsChange($event)">
      </app-debug-system>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f8fafc;
      display: flex;
    }

    .main-wrapper {
      flex: 1;
      position: relative;
      z-index: 1; /* Ensure content is above watermark */
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

    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 420px 1fr;
      gap: 2rem;
      align-items: start;
    }

    .dashboard-left {
      position: sticky;
      top: 2rem;
    }

    .dashboard-right {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    @media (max-width: 1200px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      
      .dashboard-left {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .wizard-wrapper,
      .dashboard-wrapper {
        padding: 0 1rem;
      }
      
      .dashboard-container {
        padding: 0 1rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  appState: any = { region: 'US', showWizard: false };
  resetCounter: number = 0;
  
  // Dashboard data
  inputsData: InputsPanelData = {
    region: 'US',
    scenario: 'Custom',
    avgNetFee: 125,
    taxPrepReturns: 1600,
    taxRushReturns: 0,
    discountsPct: 3,
    otherIncome: 0,
    salariesPct: 25,
    empDeductionsPct: 15,
    rentPct: 8,
    telephoneAmt: 200,
    utilitiesAmt: 300,
    localAdvAmt: 500,
    insuranceAmt: 200,
    postageAmt: 100,
    suppliesPct: 2,
    duesAmt: 150,
    bankFeesAmt: 100,
    maintenanceAmt: 200,
    travelEntAmt: 300,
    royaltiesPct: 8,
    advRoyaltiesPct: 2,
    taxRushRoyaltiesPct: 3,
    miscPct: 1,
    handlesTaxRush: false,
    hasOtherIncome: false
  };
  
  calculationResults: CalculationResults = {
    netIncome: 0,
    netMarginPct: 0,
    costPerReturn: 0,
    grossFees: 0,
    discounts: 0,
    taxPrepIncome: 0,
    taxRushIncome: 0,
    otherIncome: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    totalReturns: 0,
    salaries: 0,
    empDeductions: 0,
    rent: 0,
    telephone: 0,
    utilities: 0,
    localAdv: 0,
    insurance: 0,
    postage: 0,
    supplies: 0,
    dues: 0,
    bankFees: 0,
    maintenance: 0,
    travelEnt: 0,
    royalties: 0,
    advRoyalties: 0,
    taxRushRoyalties: 0,
    misc: 0
  };
  
  projectedPerformanceData: ProjectedPerformanceData = {
    grossFees: 0,
    discounts: 0,
    taxPrepIncome: 0,
    taxRushIncome: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    netMarginPct: 0,
    costPerReturn: 0,
    totalReturns: 0,
    region: 'US',
    lastYearRevenue: 0,
    lastYearExpenses: 0,
    lastYearReturns: 0,
    expectedGrowthPct: 0,
    handlesTaxRush: false
  };

  constructor(
    private appStateService: AppStateService,
    private calculationService: CalculationService,
    private brandingService: BrandingService,
    public persistence: PersistenceService
  ) {}

  ngOnInit(): void {
    // Apply initial branding
    this.brandingService.applyBrand(this.appState.region || 'US');

    // Initialize dashboard data
    this.calculateDashboardResults();

    // Subscribe to app state changes
    this.appStateService.state$.subscribe(state => {
      this.appState = state;
      // Apply branding when region changes
      this.brandingService.applyBrand(state.region);
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
        this.initializeDashboardFromWizard(savedAnswers);
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
    this.resetCounter++; // Trigger wizard reset
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
    
    // Initialize dashboard data from wizard answers
    this.initializeDashboardFromWizard(answers);
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

  // Dashboard methods
  onInputsChange(newData: InputsPanelData): void {
    this.inputsData = newData;
    this.calculateDashboardResults();
  }

  initializeDashboardFromWizard(answers: WizardAnswers): void {
    // Map wizard answers to inputs data
    this.inputsData = {
      region: answers.region,
      scenario: 'Custom',
      avgNetFee: answers.avgNetFee || 125,
      taxPrepReturns: answers.taxPrepReturns || 1600,
      taxRushReturns: answers.taxRushReturns || 0,
      discountsPct: answers.discountsPct || 3,
      otherIncome: answers.otherIncome || 0,
      salariesPct: 25,
      empDeductionsPct: 15,
      rentPct: 8,
      telephoneAmt: 200,
      utilitiesAmt: 300,
      localAdvAmt: 500,
      insuranceAmt: 200,
      postageAmt: 100,
      suppliesPct: 2,
      duesAmt: 150,
      bankFeesAmt: 100,
      maintenanceAmt: 200,
      travelEntAmt: 300,
      royaltiesPct: 8,
      advRoyaltiesPct: 2,
      taxRushRoyaltiesPct: 3,
      miscPct: 1,
      handlesTaxRush: answers.handlesTaxRush || false,
      hasOtherIncome: answers.hasOtherIncome || false
    };

    this.calculateDashboardResults();
  }

  calculateDashboardResults(): void {
    const data = this.inputsData;
    
    debugLog('AppComponent', 'calculateDashboardResults_start', { 
      region: data.region,
      avgNetFee: data.avgNetFee,
      taxPrepReturns: data.taxPrepReturns,
      discountsPct: data.discountsPct,
      handlesTaxRush: data.handlesTaxRush,
      taxRushReturns: data.taxRushReturns
    });
    
    // Basic calculations
    const grossFees = data.avgNetFee * data.taxPrepReturns;
    const discounts = grossFees * (data.discountsPct / 100);
    const taxPrepIncome = grossFees - discounts;
    const taxRushIncome = data.region === 'CA' && data.handlesTaxRush ? data.taxRushReturns * 125 : 0;
    const otherIncome = data.hasOtherIncome ? data.otherIncome : 0;
    const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome;
    
    debugLog('AppComponent', 'calculateDashboardResults_revenue', {
      grossFees,
      discounts,
      taxPrepIncome,
      taxRushIncome,
      otherIncome,
      totalRevenue
    });
    
    // Calculate expenses
    const salaries = grossFees * (data.salariesPct / 100);
    const empDeductions = salaries * (data.empDeductionsPct / 100);
    const rent = taxPrepIncome * (data.rentPct / 100);
    const supplies = taxPrepIncome * (data.suppliesPct / 100);
    const royalties = taxPrepIncome * (data.royaltiesPct / 100);
    const advRoyalties = taxPrepIncome * (data.advRoyaltiesPct / 100);
    const taxRushRoyalties = data.region === 'CA' && data.handlesTaxRush ? taxPrepIncome * (data.taxRushRoyaltiesPct / 100) : 0;
    const misc = taxPrepIncome * (data.miscPct / 100);
    
    const totalExpenses = salaries + empDeductions + rent + data.telephoneAmt + data.utilitiesAmt + 
                         data.localAdvAmt + data.insuranceAmt + data.postageAmt + supplies + 
                         data.duesAmt + data.bankFeesAmt + data.maintenanceAmt + data.travelEntAmt + 
                         royalties + advRoyalties + taxRushRoyalties + misc;
    
    const netIncome = totalRevenue - totalExpenses;
    const netMarginPct = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
    const costPerReturn = data.taxPrepReturns > 0 ? totalExpenses / data.taxPrepReturns : 0;
    const totalReturns = data.taxPrepReturns + (data.taxRushReturns || 0);
    
    debugLog('AppComponent', 'calculateDashboardResults_final', {
      totalExpenses,
      netIncome,
      netMarginPct,
      costPerReturn,
      totalReturns
    });

    // Update calculation results
    this.calculationResults = {
      netIncome,
      netMarginPct,
      costPerReturn,
      grossFees,
      discounts,
      taxPrepIncome,
      taxRushIncome,
      otherIncome,
      totalRevenue,
      totalExpenses,
      totalReturns,
      salaries,
      empDeductions,
      rent,
      telephone: data.telephoneAmt,
      utilities: data.utilitiesAmt,
      localAdv: data.localAdvAmt,
      insurance: data.insuranceAmt,
      postage: data.postageAmt,
      supplies,
      dues: data.duesAmt,
      bankFees: data.bankFeesAmt,
      maintenance: data.maintenanceAmt,
      travelEnt: data.travelEntAmt,
      royalties,
      advRoyalties,
      taxRushRoyalties,
      misc
    };

    // Update projected performance data
    this.projectedPerformanceData = {
      grossFees,
      discounts,
      taxPrepIncome,
      taxRushIncome,
      totalRevenue,
      totalExpenses,
      netIncome,
      netMarginPct,
      costPerReturn,
      totalReturns,
      region: data.region,
      lastYearRevenue: 0, // TODO: Load from persistence
      lastYearExpenses: 0, // TODO: Load from persistence
      lastYearReturns: 0, // TODO: Load from persistence
      expectedGrowthPct: 0, // TODO: Load from persistence
      handlesTaxRush: data.handlesTaxRush
    };
  }

  // Debug system event handlers
  onDebugSaveNow(): void {
    console.log('🐛 Debug: Save Now requested');
    this.persistence.saveBaseline(this.appStateService.currentState);
  }

  onDebugDumpStorage(): void {
    console.log('🐛 Debug: Dump Storage requested');
    this.persistence.dumpStorage();
  }

  onDebugCopyJSON(): void {
    console.log('🐛 Debug: Copy JSON requested');
    const data = {
      appState: this.appState,
      inputsData: this.inputsData,
      calculationResults: this.calculationResults,
      projectedPerformanceData: this.projectedPerformanceData
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      console.log('✅ Debug data copied to clipboard');
    });
  }

  onDebugClearStorage(): void {
    console.log('🐛 Debug: Clear Storage requested');
    this.persistence.clearStorage();
  }

  onDebugThresholdsChange(thresholds: any): void {
    console.log('🐛 Debug: Thresholds changed', thresholds);
    // TODO: Implement threshold change handling
  }
}
