import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WizardAnswers } from '../../../../domain/types/wizard.types';

interface AdjustmentItem {
  label: string;
  value: string;
}

interface AdjustmentStatusLike {
  hasAdjustments: boolean;
  strategicTarget: number;
  items: AdjustmentItem[];
}

interface PerformanceData {
  targetRevenue: number;
  actualRevenue: number;
  variance: number;
}

@Component({
  selector: 'lt-strategic-analysis',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './strategic-analysis.component.html',
  styleUrl: './strategic-analysis.component.scss',
})
export class StrategicAnalysisComponent {
  @Input() answers: WizardAnswers = { region: 'US' };

  get adjustments(): AdjustmentStatusLike {
    // Mock data for now - this would come from a service
    return {
      hasAdjustments: true,
      strategicTarget: 200000,
      items: [
        { label: 'Base Revenue', value: '$180,000' },
        { label: 'Growth Target', value: '+10%' },
        { label: 'Market Adjustment', value: '+$20,000' },
      ],
    };
  }

  get performance(): PerformanceData {
    // Mock data for now - this would come from calculations
    const target = this.adjustments.strategicTarget;
    const actual = (this.answers.avgNetFee || 0) * (this.answers.taxPrepReturns || 0);
    const variance = target > 0 ? ((actual - target) / target) * 100 : 0;

    return {
      targetRevenue: target,
      actualRevenue: actual,
      variance,
    };
  }

  get expenseTarget(): number {
    // Mock expense target - this would come from calculations
    return this.adjustments.strategicTarget * 0.75; // 75% of revenue
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace('$', '');
  }
}
