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
import { WizardStateService } from '../../core/services/wizard-state.service';
import { KpiEvaluatorService } from '../../domain/services/kpi-evaluator.service';
import { SharedExpenseTextService } from '../../shared/expenses/expense-text.service';
import { map } from 'rxjs/operators';
import { DashboardFacade } from './_facade/dashboard.facade';
import { WizardCompletionService } from './_gate/wizard-completion.service';
import { DashboardGateComponent } from './_gate/dashboard-gate.component';
import { AppMetaService } from '../../core/meta/app-meta.service';

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
    DashboardGateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  readonly flags = inject(FEATURE_FLAGS);
  private readonly assembler = inject(AnalysisDataAssemblerService);
  private readonly metrics = inject(MetricsAssemblerService);
  private readonly wizard = inject(WizardStateService);
  private readonly evaluator = inject(KpiEvaluatorService);
  readonly text = inject(SharedExpenseTextService);
  private readonly facade = inject(DashboardFacade);
  private readonly gate = inject(WizardCompletionService);
  private readonly meta = inject(AppMetaService);

  constructor() {
    this.meta.setTitle('Dashboard');
    this.meta.setDesc('Compare YTD vs forecast.');
  }

  get complete() {
    return this.gate.isComplete();
  }

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

  // ANF chip streams - FIXED: Use same logic as KPI evaluator
  readonly anfValue$ = this.wizard.answers$.pipe(
    map((a) => {
      // Use same logic as KpiEvaluatorService.getEffectiveAvgNetFee()
      if (a.storeType === 'existing') {
        return a.projectedAvgNetFee ?? a.avgNetFee ?? null;
      }
      return a.avgNetFee ?? a.projectedAvgNetFee ?? null;
    })
  );
  readonly anfStatus$ = this.wizard.answers$.pipe(map((a) => this.evaluator.getAnfStatus(a)));

  // Facade getters for template mappings if needed
  get facadeFlags() {
    return this.facade.flags;
  }
  get facadeAnfValue() {
    return this.facade.anfValue;
  }
  get facadeAnfStatus() {
    return this.facade.anfStatus();
  }
}
