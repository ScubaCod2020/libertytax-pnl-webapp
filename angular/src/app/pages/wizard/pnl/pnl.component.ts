import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnualPnlComponent } from './components/annual-pnl.component';
import { ReportsComponent } from './components/reports.component';

@Component({
  selector: 'app-pnl',
  standalone: true,
  imports: [CommonModule, AnnualPnlComponent, ReportsComponent],
  templateUrl: './pnl.component.html',
  styleUrls: ['./pnl.component.scss'],
})
export class PnlComponent {
  reportType: 'annual' | 'monthly' = 'annual';

  constructor() {
    console.log('📋🎯 [PNL HUB] P&L navigation hub loaded');
  }

  showAnnual(): void {
    this.reportType = 'annual';
    console.log('📋🎯 [PNL HUB] Switching to annual report');
  }

  showMonthly(): void {
    this.reportType = 'monthly';
    console.log('📋🎯 [PNL HUB] Switching to monthly report');
  }
}
