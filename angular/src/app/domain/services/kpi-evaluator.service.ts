import { Injectable } from '@angular/core';
import type { WizardAnswers } from '../types/wizard.types';
import {
  EXPENSE_RULES,
  ExpenseRule,
  PercentRule,
  DollarRangeRule,
  KpiStatus,
  RegionCode,
  StoreType,
} from '../expenses/expense-rules';
import { startTrace } from '../../shared/debug/calc-trace';
import { coerceJson } from '../_util/sanity.guard';

@Injectable({ providedIn: 'root' })
export class KpiEvaluatorService {
  private round1(value: number): number {
    return Math.round(value * 10) / 10;
  }

  // Unified revenue base for expense KPIs and baselines
  getExpensesRevenueTotal(a: WizardAnswers): number {
    const base = a.projectedTaxPrepIncome || 0;
    const taxRush = a.region === 'CA' && a.handlesTaxRush ? a.projectedTaxRushGrossFees || 0 : 0;
    const other = a.hasOtherIncome ? a.projectedOtherIncome || 0 : 0;
    return base + taxRush + other;
  }

  // --- ANF (Average Net Fee) KPI ---------------------------------------
  private bandedStatus(
    val: number | null | undefined,
    bands: { min?: number; max?: number; status: KpiStatus }[]
  ): KpiStatus | 'neutral' {
    if (val == null || isNaN(val as any)) return 'neutral';
    for (const b of bands) {
      const minOK = b.min == null || val >= b.min;
      const maxOK = b.max == null || val < b.max; // open interval at the top
      if (minOK && maxOK) return b.status;
    }
    return 'neutral';
  }

  private getEffectiveAvgNetFee(a: WizardAnswers): number | null {
    // pick the currently active avg net fee
    if (a.storeType === 'existing') {
      return a.projectedAvgNetFee ?? a.avgNetFee ?? null;
    }
    return a.avgNetFee ?? a.projectedAvgNetFee ?? null;
  }

  // Region-aware ANF bands
  private readonly ANF_RULES: Record<
    'US' | 'CA',
    Array<{ min?: number; max?: number; status: KpiStatus }>
  > = {
    US: [
      { max: 200, status: 'red' },
      { min: 200, max: 275, status: 'yellow' },
      { min: 275, max: 350, status: 'green' },
      { min: 350, max: 400, status: 'yellow' },
      { min: 400, status: 'red' },
    ],
    CA: [
      { max: 85, status: 'red' },
      { min: 85, max: 120, status: 'yellow' },
      { min: 120, max: 150, status: 'green' },
      { min: 150, max: 185, status: 'yellow' },
      { min: 185, status: 'red' },
    ],
  };

  getAnfStatus(a: WizardAnswers): KpiStatus | 'neutral' {
    const region: 'US' | 'CA' = (a.region as any) === 'CA' ? 'CA' : 'US';
    const anf = this.getEffectiveAvgNetFee(a);
    return this.bandedStatus(anf, this.ANF_RULES[region]);
  }

  getAnfDescriptor(a: WizardAnswers): {
    region: 'US' | 'CA';
    green: { min: number; max: number };
    bands: Array<{ min?: number; max?: number; status: KpiStatus }>;
  } {
    const region: 'US' | 'CA' = (a.region as any) === 'CA' ? 'CA' : 'US';
    const bands = this.ANF_RULES[region];
    const green = bands.find((b) => b.status === 'green')!;
    return { region, green: { min: green.min!, max: green.max! }, bands };
  }

  evaluatePercentRule(actualPct: number, rule: PercentRule): KpiStatus {
    const pct = this.round1(actualPct);
    if (rule.redAbove !== undefined && pct > rule.redAbove) return 'red';
    if (rule.yellowAbove !== undefined && pct > rule.yellowAbove) return 'yellow';
    if (rule.redBelow !== undefined && pct < rule.redBelow) return 'red';
    if (rule.yellowBelow !== undefined && pct < rule.yellowBelow) return 'yellow';
    return 'green';
  }

  evaluateDollarRange(annual: number, rule: DollarRangeRule): KpiStatus {
    if (rule.yellowMax !== undefined && annual > rule.yellowMax) return 'red';
    if (annual > rule.greenMax) return 'yellow';
    if (annual >= rule.greenMin) return 'green';
    // For now, values below greenMin are treated as green unless business rules specify otherwise
    return 'green';
  }

  getRegion(a: WizardAnswers): RegionCode {
    return (a.region as RegionCode) || 'US';
  }

  getStoreType(a: WizardAnswers): StoreType {
    return (a.storeType as StoreType) || 'new';
  }

  private resolveRule(
    entryKey: string,
    region: RegionCode,
    storeType: StoreType
  ): ExpenseRule | undefined {
    const entry = EXPENSE_RULES[entryKey];
    if (!entry) return undefined;
    // Priority: storeType override, then region override, then base rule
    const byStore = entry.overrides?.storeType?.[storeType];
    if (byStore) return byStore;
    const byRegion = entry.overrides?.region?.[region];
    if (byRegion) return byRegion;
    return entry.rule;
  }

  evaluate(a: WizardAnswers): Record<string, KpiStatus> {
    const __t = startTrace('kpi');
    const __in = coerceJson<WizardAnswers>(a as unknown);
    __t.log('inputs', __in);
    const gross = this.getExpensesRevenueTotal(a);
    const toPct = (amount: number) => (gross > 0 ? (amount / gross) * 100 : 0);
    const region = this.getRegion(a);
    const storeType = this.getStoreType(a);

    const statuses: Record<string, KpiStatus> = {};

    // Payroll (target percent by region)
    {
      const target = region === 'CA' ? 25 : 35;
      const actual = this.round1(a.payrollPct ?? target);
      const diff = Math.abs(actual - target);
      const greenTol = Math.max(0.5, target * 0.1);
      const yellowTol = Math.max(1, target * 0.25);
      statuses['payroll'] = diff <= greenTol ? 'green' : diff <= yellowTol ? 'yellow' : 'red';
    }

    // Employee deductions (target 10%)
    {
      const target = 10;
      const actual = this.round1(a.empDeductionsPct ?? 10);
      const diff = Math.abs(actual - target);
      const greenTol = Math.max(0.5, target * 0.1);
      const yellowTol = Math.max(1, target * 0.25);
      statuses['empDeductions'] = diff <= greenTol ? 'green' : diff <= yellowTol ? 'yellow' : 'red';
    }

    // Rent (region-specific logic)
    {
      if (region === 'CA') {
        const rentPct = this.round1(a.rentPct ?? 0);
        statuses['rent'] = rentPct <= 18 ? 'green' : rentPct <= 20 ? 'yellow' : 'red';
      } else {
        const rentAmount = (gross * (a.rentPct || 0)) / 100;
        const monthly = rentAmount; // gross is annualized income, but rentPct is annual percent; comparator is a monthly cap from spec
        statuses['rent'] = monthly <= 1500 ? 'green' : monthly <= 1800 ? 'yellow' : 'red';
      }
    }

    // Amount-based fields converted to percent-of-gross
    const amountFields: Array<[keyof WizardAnswers, string]> = [
      ['telephoneAmt', 'telephone'],
      ['utilitiesAmt', 'utilities'],
      ['localAdvAmt', 'localAdv'],
      ['duesAmt', 'dues'],
      ['bankFeesAmt', 'bankFees'],
      ['maintenanceAmt', 'maintenance'],
      ['travelEntAmt', 'travel'],
    ];

    for (const [field, id] of amountFields) {
      const amount = (a[field] as number) || 0;
      const pct = this.round1(toPct(amount));
      const rule = this.resolveRule(id, region, storeType) as ExpenseRule;
      if (!rule) continue;
      if (rule.type === 'percent') {
        statuses[id] = this.evaluatePercentRule(pct, rule);
      }
    }

    // Supplies (percent field)
    {
      const rule = this.resolveRule('supplies', region, storeType) as PercentRule;
      const pct = this.round1(a.suppliesPct ?? 0);
      statuses['supplies'] = this.evaluatePercentRule(pct, rule);
    }

    // Shortages (percent field)
    {
      const rule = this.resolveRule('shortages', region, storeType) as PercentRule;
      const pct = this.round1(a.shortagesPct ?? 0);
      statuses['shortages'] = this.evaluatePercentRule(pct, rule);
    }

    // Insurance (annual dollar)
    {
      const rule = this.resolveRule('insurance', region, storeType) as DollarRangeRule;
      const annual = a.insuranceAmt || 0;
      statuses['insurance'] = this.evaluateDollarRange(annual, rule);
    }

    // Misc (percent-of-gross → annual $ → dollar band)
    {
      const rule = this.resolveRule('misc', region, storeType) as DollarRangeRule;
      const annual = gross * ((a.miscPct || 0) / 100);
      statuses['misc'] = this.evaluateDollarRange(annual, rule);
    }

    // Average Net Fee (ANF) KPI
    {
      const s = this.getAnfStatus(a);
      if (s !== 'neutral') {
        // expose under key 'anf'
        statuses['anf'] = s as KpiStatus;
      }
    }

    __t.log('outputs', statuses);
    return statuses;
  }
}
