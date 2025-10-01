import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lt-net-income-summary',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [style.background]="background"
      [style.border]="border"
      style="border-radius:8px; padding:10px; margin-top:10px;"
    >
      <div class="small" style="font-weight:600; margin-bottom:6px;">{{ label }}</div>
      <div
        style="display:grid; grid-template-columns: 1fr auto; row-gap: 4px; align-items: center;"
      >
        <div>Gross</div>
        <div style="text-align:right;">{{ gross | number: '1.0-0' }}</div>
        <div>Discounts</div>
        <div style="text-align:right;">-{{ discounts | number: '1.0-0' }}</div>
        <div>Other Income</div>
        <div style="text-align:right;">{{ otherIncome | number: '1.0-0' }}</div>
        <div>Expenses</div>
        <div style="text-align:right;">-{{ expenses | number: '1.0-0' }}</div>
        <div
          style="border-top: 2px solid #e5e7eb; margin-top:6px; padding-top:6px; font-weight:600; color: {{
            color || '#15803d'
          }};"
        >
          Net Income
        </div>
        <div
          style="text-align:right; border-top: 2px solid #e5e7eb; margin-top:6px; padding-top:6px; font-weight:600; color: {{
            color || '#15803d'
          }};"
        >
          {{ net | number: '1.0-0' }}
        </div>
      </div>
    </div>
  `,
})
export class NetIncomeSummaryComponent {
  @Input() label = '';
  @Input() gross = 0;
  @Input() discounts = 0;
  @Input() otherIncome = 0;
  @Input() expenses = 0;
  @Input() color?: string;
  @Input() background?: string;
  @Input() border?: string;

  get net(): number {
    return Math.round(this.gross - this.discounts + this.otherIncome - this.expenses);
  }
}
