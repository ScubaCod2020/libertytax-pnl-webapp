import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceCardVariant, PerformanceMetric } from '../../domain/types/performance.types';

@Component({
  selector: 'lt-performance-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngStyle]="cardStyle" (click)="onCardClick()">
      <div
        style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;"
      >
        <h3
          [style.fontSize]="variant === 'compact' ? '0.9rem' : '1.1rem'"
          style="font-weight:600; color:#374151; margin:0;"
        >
          {{ title }}
        </h3>
        <div *ngIf="actions?.length" style="display:flex; gap:0.5rem;">
          <button
            *ngFor="let a of actions"
            (click)="a.onClick(); $event.stopPropagation()"
            [ngStyle]="actionStyle(a.variant)"
            style="padding:0.25rem 0.5rem; font-size:0.75rem; border:1px solid #d1d5db; border-radius:4px; cursor:pointer;"
          >
            {{ a.label }}
          </button>
        </div>
      </div>

      <div [ngStyle]="gridStyle">
        <div
          *ngFor="let m of metrics"
          (click)="metricClick.emit(m)"
          [ngStyle]="metricBoxStyle"
          [style.cursor]="metricClick.observed ? 'pointer' : 'default'"
        >
          <div
            [style.fontSize]="variant === 'compact' ? '0.75rem' : '0.85rem'"
            style="color:#6b7280; margin-bottom:0.25rem;"
          >
            {{ m.label }}
            <span *ngIf="m.context?.storeName" style="margin-left:0.5rem; font-weight:500;"
              >({{ m.context?.storeName }})</span
            >
          </div>
          <div
            [style.fontSize]="variant === 'compact' ? '1.1rem' : '1.4rem'"
            style="font-weight:bold; color:#111827;"
            [style.marginBottom]="showTrends || showTargets ? '0.5rem' : '0'"
          >
            {{ formatValue(m) }}
          </div>
          <div
            *ngIf="showTrends && m.trend"
            style="display:flex; align-items:center; gap:0.25rem; font-size:0.75rem;"
            [style.color]="trendColor(m.trend!.direction)"
            [style.marginBottom]="showTargets && m.target ? '0.25rem' : '0'"
          >
            <span>{{ trendIcon(m.trend!.direction) }}</span>
            <span
              >{{ m.trend!.percentage > 0 ? '+' : '' }}{{ m.trend!.percentage.toFixed(1) }}%</span
            >
            <span style="color:#9ca3af">vs {{ m.trend!.period }}</span>
          </div>
          <div
            *ngIf="showTargets && m.target"
            style="font-size:0.75rem; font-weight:500;"
            [style.color]="targetColor(m.target!.status)"
          >
            Target: {{ formatTargetValue(m) }}
            <span style="margin-left:0.25rem;">{{ targetIcon(m.target!.status) }}</span>
          </div>
          <div
            *ngIf="m.context?.period && variant !== 'compact'"
            style="font-size:0.7rem; color:#9ca3af; margin-top:0.25rem;"
          >
            {{ m.context?.period }}
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PerformanceCardComponent {
  @Input() title = '';
  @Input() metrics: PerformanceMetric[] = [];
  @Input() variant: PerformanceCardVariant = 'detailed';
  @Input() showTrends = true;
  @Input() showTargets = true;
  @Output() metricClick = new EventEmitter<PerformanceMetric>();
  @Input() actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;

  get cardStyle(): Record<string, string> {
    const padding =
      this.variant === 'compact' ? '0.75rem' : this.variant === 'dashboard' ? '1.25rem' : '1rem';
    const minHeight =
      this.variant === 'compact' ? 'auto' : this.variant === 'dashboard' ? '150px' : '120px';
    return {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'box-shadow 0.2s ease',
      padding,
      minHeight,
    } as Record<string, string>;
  }

  get gridStyle(): Record<string, string> {
    const columns =
      this.variant === 'compact'
        ? '1fr'
        : this.metrics.length > 2
          ? 'repeat(auto-fit, minmax(150px, 1fr))'
          : '1fr 1fr';
    const gap = this.variant === 'compact' ? '0.5rem' : '0.75rem';
    return { display: 'grid', gridTemplateColumns: columns, gap } as Record<string, string>;
  }

  get metricBoxStyle(): Record<string, string> {
    const padding = this.variant === 'compact' ? '0.5rem' : '0.75rem';
    return { padding, backgroundColor: '#f9fafb', borderRadius: '6px' };
  }

  formatValue(m: PerformanceMetric): string {
    switch (m.unit) {
      case 'currency':
        return `$${m.value.toLocaleString()}`;
      case 'percentage':
        return `${m.value.toFixed(1)}%`;
      case 'count':
        return m.value.toLocaleString();
      case 'custom':
        return `${m.value.toLocaleString()}${m.customUnit ? ` ${m.customUnit}` : ''}`;
      default:
        return String(m.value);
    }
  }

  trendIcon(direction: 'up' | 'down' | 'flat'): string {
    return direction === 'up' ? '📈' : direction === 'down' ? '📉' : '➡️';
  }
  trendColor(direction: 'up' | 'down' | 'flat'): string {
    return direction === 'up' ? '#059669' : direction === 'down' ? '#dc2626' : '#6b7280';
  }
  targetColor(status: 'above' | 'below' | 'on-track'): string {
    return status === 'above' ? '#059669' : status === 'below' ? '#dc2626' : '#0ea5e9';
  }
  targetIcon(status: 'above' | 'below' | 'on-track'): string {
    return status === 'above' ? '✅' : status === 'below' ? '⚠️' : '🎯';
  }

  formatTargetValue(m: PerformanceMetric): string {
    const clone: PerformanceMetric = { ...m, value: m.target?.value ?? m.value };
    return this.formatValue(clone);
  }

  onCardClick(): void {}

  actionStyle(v?: 'primary' | 'secondary'): Record<string, string> {
    return v === 'primary'
      ? { backgroundColor: '#3b82f6', color: 'white' }
      : { backgroundColor: 'transparent', color: '#6b7280' };
  }
}
