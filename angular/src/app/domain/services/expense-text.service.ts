import { Injectable } from '@angular/core';
import type { WizardAnswers } from '../types/wizard.types';
import { EXPENSE_RULES, DollarRangeRule } from '../expenses/expense-rules';
import { KpiEvaluatorService } from './kpi-evaluator.service';

@Injectable({ providedIn: 'root' })
export class ExpenseTextService {
  constructor(private readonly evaluator: KpiEvaluatorService) {}

  private currency(amount: number): string {
    // Minimal formatter; UI pipes will handle full formatting
    return `$${Math.round(amount).toLocaleString()}`;
  }

  // Small-note and info tooltip text built from rules + baselines
  getTelephoneNote(a: WizardAnswers): string {
    const gross = this.evaluator.getExpensesRevenueTotal(a);
    const baseline = Math.round(gross * 0.01);
    return `Phone/internet guardrail: ≤ 1.2% • Baseline: ${this.currency(baseline)} (green≈1.0%)`;
  }

  getUtilitiesNote(a: WizardAnswers): string {
    const gross = this.evaluator.getExpensesRevenueTotal(a);
    const baseline = Math.round(gross * 0.009);
    return `Utilities guardrail: ≤ 1.05% • Baseline: ${this.currency(baseline)} (green≈0.9%)`;
  }

  getLocalAdvNote(a: WizardAnswers): string {
    const gross = this.evaluator.getExpensesRevenueTotal(a);
    const baseline = Math.round(gross * 0.015);
    return `Local adv guardrail: ≤ 1.75% • Baseline: ${this.currency(baseline)} (green≈1.5%)`;
  }

  getSuppliesNote(a: WizardAnswers): string {
    const gross = this.evaluator.getExpensesRevenueTotal(a);
    const baseline = Math.round(gross * 0.03);
    return `Office supplies guardrail: ≤ 3.5% • Baseline: ${this.currency(baseline)} (green≈3.0%)`;
  }

  getDuesNote(a: WizardAnswers): string {
    const gross = this.evaluator.getExpensesRevenueTotal(a);
    const baseline = Math.round(gross * 0.0025);
    return `Dues guardrail: ≥ 0.25% • Baseline: ${this.currency(baseline)}`;
  }

  getBankFeesNote(a: WizardAnswers): string {
    const gross = this.evaluator.getExpensesRevenueTotal(a);
    const baseline = Math.round(gross * 0.0015);
    return `Bank fees guardrail: ≥ 0.15% • Baseline: ${this.currency(baseline)}`;
  }

  getMaintenanceNote(a: WizardAnswers): string {
    const gross = this.evaluator.getExpensesRevenueTotal(a);
    const baseline = Math.round(gross * 0.0025);
    return `Maintenance guardrail: ≥ 0.25% • Baseline: ${this.currency(baseline)}`;
  }

  getTravelNote(a: WizardAnswers): string {
    const gross = this.evaluator.getExpensesRevenueTotal(a);
    const baseline = Math.round(gross * 0.01);
    return `Travel guardrail: ≥ 1.0% • Baseline: ${this.currency(baseline)}`;
  }

  getInsuranceNote(a: WizardAnswers): string {
    const rule = EXPENSE_RULES['insurance'].rule as DollarRangeRule;
    return `Insurance guardrail: ${this.currency(rule.greenMin)}–${this.currency(rule.greenMax)}/yr (yellow >${this.currency(rule.greenMax)}–${this.currency(rule.yellowMax || rule.greenMax)}; red >${this.currency(rule.yellowMax || rule.greenMax)})`;
  }

  getMiscNote(a: WizardAnswers): string {
    const rule = EXPENSE_RULES['misc'].rule as DollarRangeRule;
    return `Misc guardrail: ${this.currency(rule.greenMin)}–${this.currency(rule.greenMax)}/yr`;
  }
}

// ANF tooltip/note helpers colocated for reuse
export function buildAnfTooltip(a: WizardAnswers, evaluator: KpiEvaluatorService): string {
  const d = evaluator.getAnfDescriptor(a);
  const ccy = d.region === 'CA' ? 'CAD' : 'USD';
  const fmt = (v: number) => v.toLocaleString(undefined, { style: 'currency', currency: ccy });
  return `ANF KPI (${d.region}): Green band ${fmt(d.green.min)}–${fmt(d.green.max)}`;
}

export function buildAnfNote(a: WizardAnswers, evaluator: KpiEvaluatorService): string {
  const s = evaluator.getAnfStatus(a);
  if (s === 'green') return 'Average Net Fee is within the optimal band.';
  if (s === 'yellow')
    return 'Average Net Fee is near the edges of the target band—monitor and adjust pricing/discounts.';
  if (s === 'red')
    return 'Average Net Fee is outside recommended bounds—review pricing strategy, discounting, or service mix.';
  return '';
}
