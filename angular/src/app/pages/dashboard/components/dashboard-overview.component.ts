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
import { map, catchError, of } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Safe defaults for dashboard data
const DEFAULT_ANSWERS = {
  avgNetFee: 0,
  projectedAvgNetFee: 0,
  region: 'US',
  storeType: 'new',
  projectedTaxPrepReturns: 0,
  projectedGrossFees: 0,
  projectedTaxPrepIncome: 0,
  discountsPct: 0,
  discountsAmt: 0,
  otherIncome: 0,
  taxRushReturns: 0,
  taxRushAvgNetFee: 0,
  taxRushGrossFees: 0,
  handlesTaxRush: false,
  hasOtherIncome: false,
};

const DEFAULT_ANALYSIS_DATA = {
  projected: { revenue: 0, expenses: 0, netIncome: 0 },
  presets: { revenue: 0, expenses: 0, netIncome: 0 },
  variance: { revenue: 0, expenses: 0, netIncome: 0 },
};

const DEFAULT_PERFORMANCE_METRICS = [];

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

  // Safe observable properties with error handling and defaults
  readonly anfValue$: Observable<number> =
    this.wizard?.answers$?.pipe(
      map(answers => {
        const safeAnswers = answers ?? DEFAULT_ANSWERS;
        return safeAnswers.avgNetFee ?? safeAnswers.projectedAvgNetFee ?? 0;
      }),
      catchError(() => of(0))
    ) ?? of(0);

  readonly anfStatus$: Observable<string> =
    this.wizard?.answers$?.pipe(
      map(answers => {
        const safeAnswers = answers ?? DEFAULT_ANSWERS;
        const avgNetFee = safeAnswers.avgNetFee ?? safeAnswers.projectedAvgNetFee ?? 0;
        try {
          return this.evaluator?.evaluate?.('avgNetFee', avgNetFee) ?? 'neutral';
        } catch {
          return 'neutral';
        }
      }),
      catchError(() => of('neutral'))
    ) ?? of('neutral');

  // Safe analysis data with error handling
  get analysisData() {
    try {
      return this.assembler?.assembleAnalysisData?.() ?? DEFAULT_ANALYSIS_DATA;
    } catch {
      return DEFAULT_ANALYSIS_DATA;
    }
  }

  // Safe performance metrics with error handling
  get performanceMetrics() {
    try {
      return this.metrics?.assembleMetrics?.() ?? DEFAULT_PERFORMANCE_METRICS;
    } catch {
      return DEFAULT_PERFORMANCE_METRICS;
    }
  }

  // Safe feature flag check
  get showAnalysis(): boolean {
    try {
      return this.flags?.showAnalysisBlock === true;
    } catch {
      return false;
    }
  }

  // Safe text service access
  get anfTooltip$(): Observable<string> {
    try {
      return this.text?.anfTooltip$?.() ?? of('');
    } catch {
      return of('');
    }
  }

  get anfNote$(): Observable<string> {
    try {
      return this.text?.anfNote$?.() ?? of('');
    } catch {
      return of('');
    }
  }
}
