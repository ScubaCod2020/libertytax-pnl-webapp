import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisBlockSize, AnalysisData, AnalysisStatus } from '../../domain/types/analysis.types';

@Component({
  selector: 'lt-analysis-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      (click)="onClick?.()"
      [ngStyle]="{
        padding: sizePadding,
        fontSize: sizeFont,
        backgroundColor: colors.bg,
        border: '2px solid ' + colors.border,
        borderRadius: '8px',
        marginBottom: '1rem',
        cursor: onClick ? 'pointer' : 'default',
      }"
    >
      <div
        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; font-weight: bold;"
        [style.color]="colors.text"
      >
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span *ngIf="data?.icon" style="font-size: 1.2em">{{ data?.icon }}</span>
          {{ data?.title }}
        </div>
        <div
          *ngIf="data?.primaryMetric?.change"
          style="font-size: 0.8em; font-weight: normal; opacity: 0.8;"
        >
          {{ changePrefix }}{{ data?.primaryMetric?.change?.percentage }}%
          {{ data?.primaryMetric?.change?.period }}
        </div>
      </div>

      <div
        [style.color]="colors.text"
        [style.marginBottom]="showComparison || showInsights ? '0.75rem' : '0'"
      >
        <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 0.25rem;">
          {{ data?.primaryMetric?.label }}
        </div>
        <div style="font-size: 1.4em; font-weight: bold;">
          {{ formatValue(data?.primaryMetric?.value) }}
        </div>
      </div>

      <div
        *ngIf="data?.secondaryMetrics?.length"
        style="display: grid; gap: 0.5rem; margin-bottom: 0.75rem; font-size: 0.85em;"
        [style.gridTemplateColumns]="
          size === 'small' ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))'
        "
      >
        <div *ngFor="let metric of data?.secondaryMetrics" [style.color]="colors.text">
          <div style="opacity: 0.7">{{ metric.label }}:</div>
          <div style="font-weight: bold">
            {{ formatValue(metric.value)
            }}<ng-container *ngIf="metric.unit"> {{ metric.unit }}</ng-container>
          </div>
        </div>
      </div>

      <div
        *ngIf="showComparison && data?.comparison"
        style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background-color: rgba(255,255,255,0.5); border-radius: 4px; margin-bottom: 0.75rem; font-size: 0.85em;"
      >
        <div>
          <span style="opacity: 0.7">{{ data?.comparison?.label }}: </span>
          <span style="font-weight: bold">{{ data?.comparison?.baseline }}</span>
          <span style="margin: 0 0.5rem; opacity: 0.5">→</span>
          <span style="font-weight: bold">{{ data?.comparison?.current }}</span>
        </div>
        <div [style.fontWeight]="'bold'" [style.color]="varianceColor">
          {{ variancePrefix }}{{ data?.comparison?.variance }}%
        </div>
      </div>

      <div *ngIf="showInsights && data?.insights?.length" style="font-size: 0.8em;">
        <div
          *ngFor="let insight of data?.insights; let i = index"
          [style.color]="colors.text"
          [style.marginBottom]="i < (data?.insights?.length ?? 0) - 1 ? '0.5rem' : '0'"
          style="opacity: 0.9;"
        >
          <span style="font-weight: bold; margin-right: 0.25rem;">
            {{ iconFor(insight.type) }}
          </span>
          {{ insight.message }}
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisBlockComponent {
  @Input() data!: AnalysisData | undefined;
  @Input() size: AnalysisBlockSize = 'medium';
  @Input() showComparison = true;
  @Input() showInsights = true;
  @Input() onClick?: () => void;

  get colors() {
    return this.getStatusColor(this.data?.status ?? 'neutral');
  }

  get sizePadding(): string {
    return this.size === 'small' ? '0.75rem' : this.size === 'large' ? '1.5rem' : '1rem';
  }
  get sizeFont(): string {
    return this.size === 'small' ? '0.875rem' : this.size === 'large' ? '1.1rem' : '1rem';
  }

  get changePrefix(): string {
    const pct = this.data?.primaryMetric?.change?.percentage ?? 0;
    return pct > 0 ? '+' : '';
  }

  get variancePrefix(): string {
    const v = this.data?.comparison?.variance ?? 0;
    return v > 0 ? '+' : '';
  }

  get varianceColor(): string {
    const v = this.data?.comparison?.variance ?? 0;
    if (v > 0) return '#059669';
    if (v < 0) return '#dc2626';
    return this.colors.text;
  }

  formatValue(value: string | number | undefined): string {
    if (value === undefined || value === null) return '';
    return typeof value === 'number' ? value.toLocaleString() : String(value);
  }

  iconFor(type: 'strategic' | 'tactical' | 'warning' | 'opportunity'): string {
    switch (type) {
      case 'strategic':
        return '🎯';
      case 'tactical':
        return '⚡';
      case 'warning':
        return '⚠️';
      case 'opportunity':
        return '💡';
    }
  }

  private getStatusColor(status: AnalysisStatus) {
    switch (status) {
      case 'positive':
        return { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' };
      case 'negative':
        return { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' };
      case 'warning':
        return { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' };
      default:
        return { bg: '#f8fafc', border: '#64748b', text: '#475569' };
    }
  }
}
