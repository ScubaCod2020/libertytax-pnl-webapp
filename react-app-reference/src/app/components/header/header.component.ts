import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Region } from '../../models/wizard.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="header-content">
        <div class="brand-section">
          <span class="brand-text">Liberty Tax {{ region === 'CA' ? 'Canada' : 'US' }}</span>
        </div>
        <div class="title-section">
          <h1>P&L Budget & Forecast v0.5 preview</h1>
        </div>
        <div class="actions-section">
          <button 
            *ngIf="!showWizard" 
            (click)="onShowWizard()" 
            class="btn btn-secondary">
            🧙‍♂️ Setup Wizard
          </button>
          <button 
            *ngIf="showWizard" 
            (click)="onShowDashboard()" 
            class="btn btn-secondary">
            📊 Dashboard
          </button>
          <button 
            (click)="onReset()" 
            class="btn btn-danger">
            🔄 Reset
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 1rem 0;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-section .brand-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e40af;
    }

    .title-section h1 {
      font-size: 1.125rem;
      font-weight: 500;
      color: #6b7280;
      margin: 0;
    }

    .actions-section {
      display: flex;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }
      
      .actions-section {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class HeaderComponent {
  @Input() region: Region = 'US';
  @Input() showWizard: boolean = true;
  @Input() wizardCompleted: boolean = false;
  @Input() currentPage: string = 'wizard';
  @Input() storeType?: string;

  @Output() setRegion = new EventEmitter<Region>();
  @Output() onReset = new EventEmitter<void>();
  @Output() onShowWizard = new EventEmitter<void>();
  @Output() onShowDashboard = new EventEmitter<void>();
  @Output() onShowReports = new EventEmitter<void>();

  onShowWizardClick(): void {
    this.onShowWizard.emit();
  }

  onShowDashboardClick(): void {
    this.onShowDashboard.emit();
  }

  onResetClick(): void {
    this.onReset.emit();
  }
}
