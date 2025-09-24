import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormToolbarComponent } from '../../components/form-toolbar/form-toolbar.component';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { DashboardResultsPanelComponent } from './components/dashboard-results-panel.component';
import { AnalysisBlockComponent } from '../../components/analysis-block/analysis-block.component';
import { MonthlyForecastCardComponent } from './components/monthly-forecast-card.component';
import { FEATURE_FLAGS } from '../../core/tokens/feature-flags.token';
import { inject } from '@angular/core';
import { AnalysisDataAssemblerService } from '../../domain/services/analysis-data-assembler.service';
import { PerformanceCardComponent } from '../../components/performance-card/performance-card.component';
import { MetricsAssemblerService } from '../../domain/services/metrics-assembler.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormToolbarComponent,
    KpiCardComponent,
    DashboardResultsPanelComponent,
    AnalysisBlockComponent,
    PerformanceCardComponent,
    MonthlyForecastCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  readonly flags = inject(FEATURE_FLAGS);
  private readonly assembler = inject(AnalysisDataAssemblerService);
  private readonly metrics = inject(MetricsAssemblerService);

  get showAnalysis(): boolean {
    return this.flags.showAnalysisBlock === true;
  }

  get analysisData() {
    return this.assembler.buildProjectedVsPresets();
  }

  get revenueMetrics() {
    return this.metrics.buildDashboardPreviewMetrics().revenue;
  }
  get returnMetrics() {
    return this.metrics.buildDashboardPreviewMetrics().returns;
  }
  get cprMetrics() {
    return this.metrics.buildDashboardPreviewMetrics().cpr;
  }
}
