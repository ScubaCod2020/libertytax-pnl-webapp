import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportAssemblerService } from '../../../services/report-assembler.service';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-wizard-step3-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-shell">
      <div class="card">
        <h2 class="page-title">Wizard Step 3: Reports</h2>

        <div class="actions">
          <button class="btn" (click)="print()">Print</button>
          <button class="btn" (click)="exportCsv()">Export CSV</button>
          <button class="btn" (click)="createDashboard()">Create Dashboard</button>
        </div>

        <div class="metrics">
          <div>CPR: {{ computeCPR() | number:'1.0-2' }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-shell { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
    .page-title { font-weight: 800; font-size: 1.5rem; }
    .actions { display: flex; gap: .5rem; margin: 1rem 0; }
    .btn { padding: .5rem 1rem; border: 1px solid #e5e7eb; border-radius: 6px; }
  `]
})
export class ReportsWizardPageComponent {
  private assembler = inject(ReportAssemblerService);
  private exporter = inject(ExportService);

  private snapshot = this.assembler.composeSnapshot({}, {}, { totalRevenue: 0, totalReturns: 0 }, {});

  computeCPR(): number {
    return this.assembler.computeCPR(this.snapshot.totalExpenses, this.snapshot.totalReturns);
  }

  print(): void {
    window.print();
  }

  exportCsv(): void {
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', String(this.snapshot.totalRevenue)],
      ['Total Expenses', String(this.snapshot.totalExpenses)],
      ['Net Income', String(this.snapshot.netIncome)],
      ['CPR', String(this.computeCPR())]
    ];
    this.exporter.exportCsv('wizard-report.csv', rows);
  }

  createDashboard(): void {
    const STORAGE_KEY = 'dashboardSnapshot';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshot));
  }
}


