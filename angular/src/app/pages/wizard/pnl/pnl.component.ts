import { Component } from '@angular/core';
// Import the Annual P&L component and alias to avoid name conflict
import { PnlComponent as PnlAnnualComponent } from './components/pnl.component';

@Component({
  selector: 'app-pnl-wrapper',
  standalone: true,
  imports: [PnlAnnualComponent],
  templateUrl: './pnl.component.html',
  styleUrls: ['./pnl.component.scss'],
})
export class PnlWrapperComponent {
  constructor() {
    console.log('📋🎯 [PNL WRAPPER] Wrapper loaded - rendering Annual P&L component');
  }
}
