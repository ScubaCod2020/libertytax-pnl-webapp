import { Component } from '@angular/core';
import { ReportsComponent } from './components/reports.component';

@Component({
  selector: 'app-pnl',
  standalone: true,
  imports: [ReportsComponent],
  templateUrl: './pnl.component.html',
  styleUrls: ['./pnl.component.scss'],
})
export class PnlComponent {
  constructor() {
    console.log('📋🎯 [PNL WRAPPER] PnL wrapper component loaded - delegating to ReportsComponent');
  }
}
