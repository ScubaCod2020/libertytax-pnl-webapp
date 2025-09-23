import { Component } from '@angular/core';
import { FormToolbarComponent } from '../../components/form-toolbar/form-toolbar.component';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { DashboardResultsPanelComponent } from './components/dashboard-results-panel.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormToolbarComponent, KpiCardComponent, DashboardResultsPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {}
