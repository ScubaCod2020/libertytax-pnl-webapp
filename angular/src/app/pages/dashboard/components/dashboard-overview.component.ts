import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormToolbarComponent } from '../../../components/form-toolbar/form-toolbar.component';
import { KpiCardComponent } from '../../../components/kpi-card/kpi-card.component';
import { AnalysisBlockComponent } from '../../../components/analysis-block/analysis-block.component';
import { MonthlyForecastCardComponent } from './monthly-forecast-card.component';
import { FEATURE_FLAGS } from '../../../core/tokens/feature-flags.token';
import { AnalysisDataAssemblerService } from '../../../domain/services/analysis-data-assembler.service';
import { PerformanceCardComponent } from '../../../components/performance-card/performance-card.component';
import { MetricsAssemblerService } from '../../../domain/services/metrics-assembler.service';
import { WizardStateService } from '../../../core/services/wizard-state.service';
import { KpiEvaluatorService } from '../../../domain/services/kpi-evaluator.service';
import { SharedExpenseTextService } from '../../../shared/expenses/expense-text.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormToolbarComponent,
    KpiCardComponent,
    AnalysisBlockComponent,
    PerformanceCardComponent,
    MonthlyForecastCardComponent,
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss'],
})
export class DashboardOverviewComponent {
  readonly flags = inject(FEATURE_FLAGS);
  private readonly assembler = inject(AnalysisDataAssemblerService);
  private readonly metrics = inject(MetricsAssemblerService);
  private readonly wizard = inject(WizardStateService);
  private readonly evaluator = inject(KpiEvaluatorService);
  readonly text = inject(SharedExpenseTextService);

  // Observable properties for the dashboard overview
  readonly anfValue$ = this.wizard.answers$.pipe(map(answers => answers.avgNetFee || 0));

  readonly anfStatus$ = this.wizard.answers$.pipe(
    map(answers => this.evaluator.evaluate('avgNetFee', answers.avgNetFee || 0))
  );

  readonly analysisData = this.assembler.assembleAnalysisData();
  readonly performanceMetrics = this.metrics.assembleMetrics();

  get showAnalysis(): boolean {
    return this.flags.showAnalysisBlock;
  }
}
