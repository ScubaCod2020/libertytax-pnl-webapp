import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardOverviewComponent } from './components/dashboard-overview.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardOverviewComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  constructor() {
    console.log('📊🎯 [DASHBOARD HUB] Dashboard navigation hub loaded');
  }
}
