import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WizardAnswers } from '../../../../domain/types/wizard.types';
import {
  getAdjustmentStatus,
  calculateBlendedGrowth,
  calculatePerformanceVsTarget,
  calculateFieldGrowth,
  AdjustmentStatusLike,
  PerformanceAnalysisLike
} from '../../../../domain/calculations/wizard-helpers';

interface AdjustmentDisplay {
  field: string;
  actualGrowth: number;
  variance: number;
}

@Component({
  selector: 'lt-strategic-analysis',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="adjustments.hasAdjustments"
      class="strategic-analysis"
    >
      <div class="analysis-header">
        📊 Strategic vs. Tactical Analysis
      </div>

      <div class="strategic-target">
        <strong>Strategic Target:</strong> {{ originalGrowth > 0 ? '+' : '' }}{{ originalGrowth }}% growth on all metrics
      </div>

      <div class="field-performance-header">
        <strong>Individual Field Performance:</strong>
      </div>

      <div class="adjustment-list">
        <div *ngFor="let adj of adjustmentsList" class="adjustment-item">
          • <strong>{{ adj.field }}:</strong> {{ adj.actualGrowth > 0 ? '+' : '' }}{{ adj.actualGrowth }}% 
          ({{ adj.variance > 0 ? '+' : '' }}{{ adj.variance }}% {{ adj.variance > 0 ? 'above' : 'below' }} target)
        </div>
      </div>

      <div class="performance-analysis">
        🎯 <strong>Target vs. Actual Performance:</strong>
        
        <div class="performance-details">
          💰 <strong>Revenue Performance:</strong>
          <br />• Target: ${{ formatCurrency(performance.targetRevenue) }}
          <br />• Actual: ${{ formatCurrency(performance.actualRevenue) }}
          <br />• Variance: {{ performance.variance > 0 ? '+' : '' }}{{ Math.round(performance.variance) }}% {{ performance.variance > 0 ? 'above' : 'below' }} target
          <br />
          <br />
          💸 <strong>Expense Control:</strong>
          <br />• Strategic Target: ${{ formatCurrency(expenseTarget) }}
          <br />• Current Page 2 Total: <em>Calculated on Page 2</em>
          <br />• Status: <em>Review on Page 2 for detailed breakdown</em>
        </div>

        <div 
          class="performance-status"
          [class.exceeding]="performance.variance >= 0"
          [class.missing]="performance.variance < 0"
        >
          {{ performance.variance >= 0 ? '🎉' : '⚠️' }}
          <strong>
            {{ performance.variance >= 0 ? 'Exceeding' : 'Missing' }} your strategic target
          </strong>
        </div>
      </div>

      <div class="business-lesson">
        💡 <strong>Business Lesson:</strong> Revenue = Fee × Returns. Small individual shortfalls
        can compound into larger revenue misses. Strategic planning requires considering how metrics
        multiply, not just add together.
      </div>
    </div>
  `,
  styles: [`
    .strategic-analysis {
      margin: 1rem 0;
      padding: 0.75rem;
      background-color: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 6px;
      font-size: 0.85rem;
    }

    .analysis-header {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 0.5rem;
    }

    .strategic-target,
    .field-performance-header {
      color: #92400e;
      margin-bottom: 0.5rem;
    }

    .adjustment-list {
      margin-left: 1rem;
    }

    .adjustment-item {
      color: #92400e;
      margin-bottom: 0.25rem;
    }

    .performance-analysis {
      color: #92400e;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid #f59e0b;
      font-weight: bold;
    }

    .performance-details {
      font-weight: normal;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .performance-status {
      margin-top: 0.5rem;
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid;
    }

    .performance-status.exceeding {
      background-color: #d1fae5;
      border-color: #10b981;
    }

    .performance-status.missing {
      background-color: #fee2e2;
      border-color: #ef4444;
    }

    .business-lesson {
      color: #a16207;
      margin-top: 0.5rem;
      font-style: italic;
      background-color: #fef9e7;
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #fcd34d;
    }
  `]
})
export class StrategicAnalysisComponent {
  @Input() answers: WizardAnswers = { region: 'US' };

  get adjustments(): AdjustmentStatusLike {
    return getAdjustmentStatus(this.answers);
  }

  get blendedGrowth(): number {
    return calculateBlendedGrowth(this.answers);
  }

  get originalGrowth(): number {
    return this.answers.expectedGrowthPct || 0;
  }

  get performance(): PerformanceAnalysisLike {
    return calculatePerformanceVsTarget(this.answers);
  }

  get adjustmentsList(): AdjustmentDisplay[] {
    const list: AdjustmentDisplay[] = [];

    if (this.adjustments.avgNetFeeStatus) {
      const growth = this.answers.projectedAvgNetFee && this.answers.avgNetFee
        ? Math.round(((this.answers.projectedAvgNetFee - this.answers.avgNetFee) / this.answers.avgNetFee) * 100)
        : 0;
      const variance = growth - this.originalGrowth;
      list.push({
        field: 'Average Net Fee',
        actualGrowth: growth,
        variance: variance,
      });
    }

    if (this.adjustments.taxPrepReturnsStatus) {
      const growth = this.answers.projectedTaxPrepReturns && this.answers.taxPrepReturns
        ? Math.round(((this.answers.projectedTaxPrepReturns - this.answers.taxPrepReturns) / this.answers.taxPrepReturns) * 100)
        : 0;
      const variance = growth - this.originalGrowth;
      list.push({
        field: 'Tax Prep Returns',
        actualGrowth: growth,
        variance: variance,
      });
    }

    return list;
  }

  get expenseTarget(): number {
    return Math.round(
      this.answers.expectedRevenue ? this.performance.actualRevenue - this.answers.expectedRevenue : 0
    );
  }

  formatCurrency(value: number): string {
    return Math.round(value).toLocaleString();
  }

  // Expose Math for template
  Math = Math;
}
