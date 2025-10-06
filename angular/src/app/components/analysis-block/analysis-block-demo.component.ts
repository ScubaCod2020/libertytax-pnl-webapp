import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisBlockComponent } from './analysis-block.component';
import { AnalysisData } from '../../domain/types/analysis.types';
import { FEATURE_FLAGS } from '../../core/tokens/feature-flags.token';

@Component({
  selector: 'lt-analysis-block-demo',
  standalone: true,
  imports: [CommonModule, AnalysisBlockComponent],
  template: `
    <div style="padding: 1rem;">
      <h2 style="margin-bottom: 1rem;">Analysis Block Demo (Dev Only)</h2>
      <ng-container *ngIf="flags.showAnalysisBlock; else hidden">
        <lt-analysis-block [data]="example" size="medium"></lt-analysis-block>
      </ng-container>
      <ng-template #hidden>
        <div style="opacity: 0.6;">Hidden by feature flag</div>
      </ng-template>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisBlockDemoComponent {
  readonly flags = inject(FEATURE_FLAGS);

  example: AnalysisData = {
    title: 'Projected Growth Impact',
    icon: '📈',
    status: 'neutral',
    primaryMetric: {
      label: 'Projected Revenue',
      value: 426800,
      change: { amount: 0, percentage: 5, period: 'vs PY' },
    },
    secondaryMetrics: [
      { label: 'Returns', value: 1600 },
      { label: 'Avg Net Fee', value: 275, unit: '$' },
    ],
    comparison: {
      label: 'Good→Custom',
      baseline: 'Good (+2%)',
      current: 'Custom (+5%)',
      variance: 3,
    },
    insights: [
      { type: 'strategic', message: 'Custom choice exceeds Good by 3 points.' },
      { type: 'tactical', message: 'Ensure expenses remain within target band.' },
    ],
  };
}
