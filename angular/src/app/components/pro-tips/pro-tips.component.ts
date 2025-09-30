import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculationResults } from '../../domain/types/calculation.types';
import { WizardAnswers } from '../../domain/types/wizard.types';

export interface ProTip {
  id: string;
  condition: string;
  tip: string;
  category: 'critical' | 'warning' | 'suggestion';
  isActive: boolean;
}

@Component({
  selector: 'app-pro-tips',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pro-tips-card">
      <div class="pro-tips-header">
        <h2 class="pro-tips-title">💡 Automated Pro Tips</h2>
        <div class="pro-tips-subtitle">
          Smart business advice based on your current P&L performance
        </div>
      </div>

      <div class="tips-container">
        <div 
          *ngFor="let tip of activeTips; trackBy: trackByTipId"
          class="tip-item"
          [class.critical]="tip.category === 'critical'"
          [class.warning]="tip.category === 'warning'"
          [class.suggestion]="tip.category === 'suggestion'"
        >
          <div class="tip-icon">
            {{ getTipIcon(tip.category) }}
          </div>
          <div class="tip-content">
            <div class="tip-category">{{ getTipCategoryLabel(tip.category) }}</div>
            <div class="tip-text">{{ tip.tip }}</div>
          </div>
        </div>

        <div *ngIf="activeTips.length === 0" class="no-tips">
          <div class="no-tips-icon">🎉</div>
          <div class="no-tips-text">
            <strong>Great work!</strong> Your P&L metrics are performing well. 
            No immediate action items at this time.
          </div>
        </div>
      </div>

      <!-- Business Context -->
      <div class="business-context">
        <h3 class="context-title">📊 Understanding Your Tips</h3>
        <div class="context-grid">
          <div class="context-item">
            <div class="context-icon">🔴</div>
            <div class="context-label">Critical</div>
            <div class="context-description">Immediate attention required</div>
          </div>
          <div class="context-item">
            <div class="context-icon">🟡</div>
            <div class="context-label">Warning</div>
            <div class="context-description">Monitor and consider action</div>
          </div>
          <div class="context-item">
            <div class="context-icon">💡</div>
            <div class="context-label">Suggestion</div>
            <div class="context-description">Optimization opportunity</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pro-tips-card {
      max-width: 800px;
      margin: 0 auto;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .pro-tips-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #3b82f6;
    }

    .pro-tips-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 0.5rem;
    }

    .pro-tips-subtitle {
      color: #3b82f6;
      font-style: italic;
    }

    .tips-container {
      margin-bottom: 2rem;
    }

    .tip-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 8px;
      border-left: 4px solid;
      transition: all 0.3s ease;
    }

    .tip-item.critical {
      background-color: #fef2f2;
      border-left-color: #ef4444;
    }

    .tip-item.warning {
      background-color: #fffbeb;
      border-left-color: #f59e0b;
    }

    .tip-item.suggestion {
      background-color: #f0f9ff;
      border-left-color: #3b82f6;
    }

    .tip-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .tip-content {
      flex: 1;
    }

    .tip-category {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.25rem;
    }

    .tip-item.critical .tip-category {
      color: #dc2626;
    }

    .tip-item.warning .tip-category {
      color: #d97706;
    }

    .tip-item.suggestion .tip-category {
      color: #2563eb;
    }

    .tip-text {
      color: #374151;
      line-height: 1.5;
      font-size: 0.95rem;
    }

    .no-tips {
      text-align: center;
      padding: 2rem;
      background-color: #f0fdf4;
      border-radius: 8px;
      border: 1px solid #10b981;
    }

    .no-tips-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .no-tips-text {
      color: #059669;
      font-size: 1.1rem;
    }

    .business-context {
      padding: 1.5rem;
      background-color: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .context-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #475569;
      margin-bottom: 1rem;
      text-align: center;
    }

    .context-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .context-item {
      text-align: center;
      padding: 1rem;
      background-color: white;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .context-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .context-label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .context-description {
      font-size: 0.8rem;
      color: #6b7280;
    }
  `]
})
export class ProTipsComponent {
  @Input() calculationResults?: CalculationResults;
  @Input() wizardAnswers?: WizardAnswers;

  get activeTips(): ProTip[] {
    if (!this.calculationResults || !this.wizardAnswers) {
      return [];
    }

    const tips = this.getAllTips();
    return tips.filter(tip => this.evaluateTipCondition(tip));
  }

  getTipIcon(category: string): string {
    switch (category) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      case 'suggestion': return '💡';
      default: return '💡';
    }
  }

  getTipCategoryLabel(category: string): string {
    switch (category) {
      case 'critical': return 'Critical';
      case 'warning': return 'Warning';
      case 'suggestion': return 'Suggestion';
      default: return 'Tip';
    }
  }

  trackByTipId(index: number, tip: ProTip): string {
    return tip.id;
  }

  private getAllTips(): ProTip[] {
    // Pro tips from Python Excel tool, adapted for Angular
    return [
      {
        id: 'negative-net-income',
        condition: 'netIncome <= -5000',
        tip: 'Net Income is negative — review fixed costs and staffing levels. Consider reducing rent, salaries, or other major expenses.',
        category: 'critical',
        isActive: false
      },
      {
        id: 'low-net-margin',
        condition: 'netMarginPct < 10',
        tip: 'Net Margin is below caution — consider small ANF increase or reduce salaries %. Target 20%+ margin for healthy operations.',
        category: 'warning',
        isActive: false
      },
      {
        id: 'high-salaries',
        condition: 'salariesPct > 30',
        tip: 'Salaries exceed 30% of gross — consider part‑time staffing or schedule optimization. Industry benchmark is 25-28%.',
        category: 'warning',
        isActive: false
      },
      {
        id: 'high-rent',
        condition: 'rentPct > 20',
        tip: 'Rent above 20% of gross — evaluate space optimization or renegotiation. Consider shared space or smaller footprint.',
        category: 'warning',
        isActive: false
      },
      {
        id: 'high-cost-per-return',
        condition: 'costPerReturn > 35',
        tip: 'Cost/Return is high — check discounts %, supplies, and local advertising ROI. Focus on operational efficiency.',
        category: 'suggestion',
        isActive: false
      },
      {
        id: 'excellent-performance',
        condition: 'netMarginPct >= 25 && costPerReturn <= 25',
        tip: 'Excellent performance! Your margins and cost efficiency are above industry benchmarks. Consider expansion opportunities.',
        category: 'suggestion',
        isActive: false
      },
      {
        id: 'high-discounts',
        condition: 'discountsPct > 10',
        tip: 'Customer discounts are high — evaluate discount strategy impact on profitability. Consider tiered pricing instead.',
        category: 'suggestion',
        isActive: false
      },
      {
        id: 'low-returns-volume',
        condition: 'taxPrepReturns < 1000',
        tip: 'Return volume is low — focus on marketing and customer acquisition. Consider community outreach and referral programs.',
        category: 'suggestion',
        isActive: false
      }
    ];
  }

  private evaluateTipCondition(tip: ProTip): boolean {
    if (!this.calculationResults || !this.wizardAnswers) {
      return false;
    }

    const { netIncome, netMarginPct, costPerReturn } = this.calculationResults;
    const { discountsPct, taxPrepReturns } = this.wizardAnswers;
    
    // Calculate salaries and rent percentages for evaluation
    const salariesPct = this.wizardAnswers.salariesPct || 0;
    const rentPct = this.wizardAnswers.rentPct || 0;

    // Evaluate condition based on tip ID
    switch (tip.id) {
      case 'negative-net-income':
        return netIncome <= -5000;
      
      case 'low-net-margin':
        return netMarginPct < 10;
      
      case 'high-salaries':
        return salariesPct > 30;
      
      case 'high-rent':
        return rentPct > 20;
      
      case 'high-cost-per-return':
        return costPerReturn > 35;
      
      case 'excellent-performance':
        return netMarginPct >= 25 && costPerReturn <= 25;
      
      case 'high-discounts':
        return (discountsPct || 0) > 10;
      
      case 'low-returns-volume':
        return (taxPrepReturns || 0) < 1000;
      
      default:
        return false;
    }
  }
}
