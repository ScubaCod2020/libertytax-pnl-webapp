// debug-tool.component.ts - Dev-only route for app state snapshots
// Displays priorYear, incomeDrivers raw/formState, expensesState, dashboard KPIs

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PersistenceService } from '../../services/persistence.service';
import { AppStateService } from '../../services/app-state.service';
import { CalculationService } from '../../services/calculation.service';

interface DebugSnapshot {
  timestamp: string;
  environment: string;
  
  // Prior year data (from persistence)
  priorYear: any;
  
  // Income drivers data  
  incomeDrivers: {
    raw: any;
    formState: any;
  };
  
  // Expenses state
  expensesState: {
    items: any[];
    total: number;
    valid: boolean;
  };
  
  // Dashboard KPIs
  dashboardKPIs: {
    netIncome: number;
    netMarginPct: number;
    costPerReturn: number;
    totalRevenue: number;
    totalExpenses: number;
    totalReturns: number;
  };
  
  // Additional app state context
  appContext: {
    region: string;
    showWizard: boolean;
    wizardCompleted: boolean;
    currentRoute: string;
  };
}

@Component({
  selector: 'app-debug-tool',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-container">
      <!-- Header -->
      <div class="debug-header">
        <h1>🐛 Debug Tool - App State Snapshots</h1>
        <div class="debug-meta">
          <span class="debug-timestamp">{{ snapshot.timestamp }}</span>
          <span class="debug-env" [class]="snapshot.environment">{{ snapshot.environment.toUpperCase() }}</span>
          <button (click)="goBack()" class="back-button">← Back to App</button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="debug-actions">
        <button (click)="refreshSnapshot()" class="action-btn refresh">🔄 Refresh Data</button>
        <button (click)="exportJSON()" class="action-btn export">📄 Export JSON</button>
        <button (click)="copyToClipboard()" class="action-btn copy">📋 Copy to Clipboard</button>
      </div>

      <!-- Warning Notice -->
      <div class="debug-warning">
        <strong>⚠️ DEV ONLY:</strong> This route should not be accessible in production. 
        Contains sensitive application state data.
      </div>

      <!-- App State Sections -->
      <div class="debug-sections">
        
        <!-- App Context -->
        <div class="debug-section">
          <h2>📱 App Context</h2>
          <pre class="debug-json">{{ formatJSON(snapshot.appContext) }}</pre>
        </div>

        <!-- Prior Year Data -->
        <div class="debug-section">
          <h2>📊 Prior Year Data</h2>
          <div class="data-status" [class.has-data]="hasPriorYearData" [class.no-data]="!hasPriorYearData">
            {{ hasPriorYearData ? 'Data Available' : 'No Prior Year Data' }}
          </div>
          <pre class="debug-json">{{ formatJSON(snapshot.priorYear) }}</pre>
        </div>

        <!-- Income Drivers -->
        <div class="debug-section">
          <h2>💰 Income Drivers</h2>
          
          <div class="subsection">
            <h3>Raw Data</h3>
            <pre class="debug-json">{{ formatJSON(snapshot.incomeDrivers.raw) }}</pre>
          </div>
          
          <div class="subsection">
            <h3>Form State</h3>
            <pre class="debug-json">{{ formatJSON(snapshot.incomeDrivers.formState) }}</pre>
          </div>
        </div>

        <!-- Expenses State -->
        <div class="debug-section">
          <h2>💳 Expenses State</h2>
          <div class="data-status" [class.valid]="snapshot.expensesState.valid" [class.invalid]="!snapshot.expensesState.valid">
            {{ snapshot.expensesState.valid ? '✅ Valid' : '❌ Invalid' }}
          </div>
          <pre class="debug-json">{{ formatJSON(snapshot.expensesState) }}</pre>
        </div>

        <!-- Dashboard KPIs -->
        <div class="debug-section">
          <h2>📈 Dashboard KPIs</h2>
          
          <!-- KPI Summary Cards -->
          <div class="kpi-summary">
            <div class="kpi-card">
              <div class="kpi-label">Net Income</div>
              <div class="kpi-value" [class]="getKPIClass('netIncome')">
                {{ formatCurrency(snapshot.dashboardKPIs.netIncome) }}
              </div>
            </div>
            
            <div class="kpi-card">
              <div class="kpi-label">Net Margin</div>
              <div class="kpi-value" [class]="getKPIClass('netMargin')">
                {{ formatPercentage(snapshot.dashboardKPIs.netMarginPct) }}
              </div>
            </div>
            
            <div class="kpi-card">
              <div class="kpi-label">Cost/Return</div>
              <div class="kpi-value" [class]="getKPIClass('costPerReturn')">
                {{ formatCurrency(snapshot.dashboardKPIs.costPerReturn) }}
              </div>
            </div>
          </div>
          
          <pre class="debug-json">{{ formatJSON(snapshot.dashboardKPIs) }}</pre>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .debug-container {
      min-height: 100vh;
      background: #1a1a1a;
      color: #f0f0f0;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      padding: 2rem;
    }

    .debug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #333;
    }

    .debug-header h1 {
      margin: 0;
      color: #00ff00;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .debug-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .debug-timestamp {
      color: #888;
      font-size: 0.875rem;
    }

    .debug-env {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .debug-env.development {
      background: #fef3c7;
      color: #92400e;
    }

    .debug-env.production {
      background: #fee2e2;
      color: #b91c1c;
    }

    .back-button {
      padding: 0.5rem 1rem;
      background: #374151;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .back-button:hover {
      background: #4b5563;
    }

    .debug-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #555;
      background: #2a2a2a;
      color: #f0f0f0;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #3a3a3a;
      border-color: #777;
    }

    .action-btn.refresh {
      border-color: #059669;
      color: #10b981;
    }

    .action-btn.export {
      border-color: #0ea5e9;
      color: #38bdf8;
    }

    .action-btn.copy {
      border-color: #8b5cf6;
      color: #a78bfa;
    }

    .debug-warning {
      background: #7f1d1d;
      color: #fed7d7;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 2rem;
      border-left: 4px solid #dc2626;
    }

    .debug-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .debug-section {
      background: #2a2a2a;
      border-radius: 8px;
      padding: 1.5rem;
      border: 1px solid #404040;
    }

    .debug-section h2 {
      margin: 0 0 1rem 0;
      color: #00d4ff;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .debug-section h3 {
      margin: 1rem 0 0.5rem 0;
      color: #fbbf24;
      font-size: 1rem;
    }

    .subsection {
      margin-top: 1.5rem;
    }

    .data-status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .data-status.has-data,
    .data-status.valid {
      background: #065f46;
      color: #a7f3d0;
    }

    .data-status.no-data,
    .data-status.invalid {
      background: #7f1d1d;
      color: #fed7d7;
    }

    .debug-json {
      background: #1a1a1a;
      border: 1px solid #404040;
      border-radius: 4px;
      padding: 1rem;
      overflow-x: auto;
      font-size: 0.8rem;
      line-height: 1.4;
      color: #e5e7eb;
      max-height: 400px;
      overflow-y: auto;
    }

    .kpi-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .kpi-card {
      background: #1a1a1a;
      border: 1px solid #404040;
      border-radius: 6px;
      padding: 1rem;
      text-align: center;
    }

    .kpi-label {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-bottom: 0.5rem;
    }

    .kpi-value {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .kpi-value.good {
      color: #10b981;
    }

    .kpi-value.fair {
      color: #f59e0b;
    }

    .kpi-value.poor {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .debug-container {
        padding: 1rem;
      }

      .debug-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .debug-actions {
        flex-wrap: wrap;
      }

      .kpi-summary {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DebugToolComponent implements OnInit {
  snapshot: DebugSnapshot = this.getEmptySnapshot();

  constructor(
    private router: Router,
    private persistence: PersistenceService,
    private appStateService: AppStateService,
    private calculationService: CalculationService
  ) {}

  ngOnInit(): void {
    this.refreshSnapshot();
  }

  refreshSnapshot(): void {
    this.snapshot = this.captureAppState();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  exportJSON(): void {
    const dataStr = JSON.stringify(this.snapshot, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-snapshot-${new Date().toISOString().slice(0,19)}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  copyToClipboard(): void {
    const dataStr = JSON.stringify(this.snapshot, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      console.log('✅ Debug snapshot copied to clipboard');
    }).catch((error) => {
      console.error('❌ Failed to copy to clipboard:', error);
    });
  }

  private captureAppState(): DebugSnapshot {
    // Get current app state data
    const wizardAnswers = this.persistence.loadWizardAnswers();
    const wizardState = this.persistence.getWizardState();
    const currentResults = this.calculationService.currentResults;

    return {
      timestamp: new Date().toISOString(),
      environment: this.isProduction() ? 'production' : 'development',
      
      priorYear: {
        // Mock prior year data - would be loaded from real data source
        revenue: 0,
        expenses: 0,
        netIncome: 0,
        available: false,
        note: 'Prior year data integration pending'
      },
      
      incomeDrivers: {
        raw: {
          avgNetFee: wizardAnswers?.avgNetFee || 0,
          taxPrepReturns: wizardAnswers?.taxPrepReturns || 0,
          taxRushReturns: wizardAnswers?.taxRushReturns || 0,
          discountsPct: wizardAnswers?.discountsPct || 0,
          otherIncome: wizardAnswers?.otherIncome || 0,
          region: wizardAnswers?.region || 'US',
          handlesTaxRush: wizardAnswers?.handlesTaxRush || false
        },
        formState: {
          valid: wizardState.wizardCompleted,
          completed: wizardState.wizardCompleted,
          errors: [],
          lastUpdated: 'Unknown' // wizardState doesn't have lastSaved property
        }
      },
      
      expensesState: {
        items: [], // Would be populated from ExpensesComponent state
        total: currentResults.totalExpenses || 0,
        valid: true
      },
      
      dashboardKPIs: {
        netIncome: currentResults.netIncome || 0,
        netMarginPct: currentResults.netMarginPct || 0,
        costPerReturn: currentResults.costPerReturn || 0,
        totalRevenue: currentResults.totalRevenue || 0,
        totalExpenses: currentResults.totalExpenses || 0,
        totalReturns: currentResults.totalReturns || 0
      },
      
      appContext: {
        region: wizardAnswers?.region || 'US',
        showWizard: wizardState.wizardCompleted === false,
        wizardCompleted: wizardState.wizardCompleted,
        currentRoute: this.router.url
      }
    };
  }

  private getEmptySnapshot(): DebugSnapshot {
    return {
      timestamp: new Date().toISOString(),
      environment: 'development',
      priorYear: null,
      incomeDrivers: { raw: {}, formState: {} },
      expensesState: { items: [], total: 0, valid: false },
      dashboardKPIs: { 
        netIncome: 0, netMarginPct: 0, costPerReturn: 0, 
        totalRevenue: 0, totalExpenses: 0, totalReturns: 0 
      },
      appContext: { region: 'US', showWizard: false, wizardCompleted: false, currentRoute: '/debug' }
    };
  }

  get hasPriorYearData(): boolean {
    return this.snapshot.priorYear && this.snapshot.priorYear.available === true;
  }

  private isProduction(): boolean {
    // Simple production check - would use Angular environment in real app
    return window.location.hostname !== 'localhost';
  }

  formatJSON(data: any): string {
    if (!data) return 'null';
    return JSON.stringify(data, null, 2);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  getKPIClass(metric: string): string {
    const value = (this.snapshot.dashboardKPIs as any)[metric];
    
    switch (metric) {
      case 'netIncome':
        return value >= 0 ? 'good' : 'poor';
      case 'netMargin':
        if (value >= 20) return 'good';
        if (value >= 10) return 'fair';
        return 'poor';
      case 'costPerReturn':
        if (value <= 85) return 'good';
        if (value <= 100) return 'fair';
        return 'poor';
      default:
        return 'fair';
    }
  }
}
