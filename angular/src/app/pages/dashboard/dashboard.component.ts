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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormToolbarComponent,
    KpiCardComponent,
    DashboardResultsPanelComponent,
    AnalysisBlockComponent,
    MonthlyForecastCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  readonly flags = inject(FEATURE_FLAGS);
  private readonly assembler = inject(AnalysisDataAssemblerService);

  get showAnalysis(): boolean {
    return this.flags.showAnalysisBlock === true;
  }

  get analysisData() {
    return this.assembler.buildProjectedVsPresets();
  }
}
