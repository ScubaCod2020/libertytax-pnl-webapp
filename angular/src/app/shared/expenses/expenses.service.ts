import { Injectable } from '@angular/core';
import { map, Observable, Subject, distinctUntilChanged } from 'rxjs';
import type { ExpenseKey } from './expenses.types';
import { WizardStateService } from '../../core/services/wizard-state.service';
import type { WizardAnswers } from '../../domain/types/wizard.types';
import { KpiEvaluatorService } from '../../domain/services/kpi-evaluator.service';

type StatusClass = 'green' | 'yellow' | 'red' | 'neutral';

interface ExpenseFieldConfig {
  storage: 'pct' | 'amt';
  field: keyof WizardAnswers;
  calcBase: 'gross' | 'salaries' | 'none';
  period?: 'annual' | 'monthly'; // for dollar amounts
}

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private pctInput$ = new Subject<{ key: ExpenseKey; v: number | null }>();

  constructor(
    private readonly wizard: WizardStateService,
    private readonly evaluator: KpiEvaluatorService
  ) {
    this.pctInput$
      .pipe(distinctUntilChanged((a, b) => a.key === b.key && a.v === b.v))
      .subscribe(({ key, v }) => this._updatePercentImpl(key, v));
  }

  private readonly config: Record<ExpenseKey, ExpenseFieldConfig> = {
    payroll: { storage: 'pct', field: 'payrollPct', calcBase: 'gross' },
    empDeductions: { storage: 'pct', field: 'empDeductionsPct', calcBase: 'salaries' },
    rent: { storage: 'pct', field: 'rentPct', calcBase: 'gross', period: 'monthly' },
    telephone: { storage: 'amt', field: 'telephoneAmt', calcBase: 'gross' },
    utilities: { storage: 'amt', field: 'utilitiesAmt', calcBase: 'gross' },
    localAdv: { storage: 'amt', field: 'localAdvAmt', calcBase: 'gross' },
    insurance: { storage: 'amt', field: 'insuranceAmt', calcBase: 'gross', period: 'annual' },
    postage: { storage: 'amt', field: 'postageAmt', calcBase: 'gross', period: 'annual' },
    supplies: { storage: 'pct', field: 'suppliesPct', calcBase: 'gross' },
    dues: { storage: 'amt', field: 'duesAmt', calcBase: 'gross', period: 'annual' },
    bankFees: { storage: 'amt', field: 'bankFeesAmt', calcBase: 'gross', period: 'annual' },
    maintenance: { storage: 'amt', field: 'maintenanceAmt', calcBase: 'gross', period: 'annual' },
    travel: { storage: 'amt', field: 'travelEntAmt', calcBase: 'gross', period: 'annual' },
    royalties: { storage: 'pct', field: 'royaltiesPct', calcBase: 'gross' },
    advRoyalties: { storage: 'pct', field: 'advRoyaltiesPct', calcBase: 'gross' },
    taxRushRoyalties: { storage: 'pct', field: 'taxRushRoyaltiesPct', calcBase: 'gross' },
    shortages: { storage: 'pct', field: 'shortagesPct', calcBase: 'gross' },
    misc: { storage: 'pct', field: 'miscPct', calcBase: 'gross' },
  };

  private getGross(a: WizardAnswers): number {
    return this.evaluator.getExpensesRevenueTotal(a);
  }

  private getBaseAmount(cfg: ExpenseFieldConfig, a: WizardAnswers): number {
    if (cfg.calcBase === 'gross') {
      return this.getGross(a);
    }
    if (cfg.calcBase === 'salaries') {
      const gross = this.getGross(a);
      const payrollPct = a.payrollPct || 0;
      return (gross * payrollPct) / 100;
    }
    return 0;
  }

  grossRevenue$: Observable<number> = this.wizard.answers$.pipe(map((a) => this.getGross(a)));

  amount$(key: ExpenseKey): Observable<number | null> {
    const cfg = this.config[key];
    return this.wizard.answers$.pipe(
      map((a) => {
        if (!cfg) return null;
        if (cfg.storage === 'amt') {
          const val = (a[cfg.field] as number | undefined) ?? null;
          return val === undefined ? null : val;
        }
        const pct = (a[cfg.field] as number | undefined) ?? null;
        if (pct == null) return null;
        const base = this.getBaseAmount(cfg, a);
        const annual = (base * pct) / 100;
        if (cfg.period === 'monthly') return Math.round(annual / 12);
        return Math.round(annual);
      })
    );
  }

  percent$(key: ExpenseKey): Observable<number | null> {
    const cfg = this.config[key];
    return this.wizard.answers$.pipe(
      map((a) => {
        if (!cfg) return null;
        if (cfg.storage === 'pct') {
          const val = (a[cfg.field] as number | undefined) ?? null;
          return val === undefined ? null : Math.round((val ?? 0) * 10) / 10;
        }
        const amount = (a[cfg.field] as number | undefined) ?? null;
        if (amount == null) return null;
        const base = this.getBaseAmount(cfg, a);
        const annual = cfg.period === 'monthly' ? amount * 12 : amount;
        if (base <= 0) return 0;
        return Math.round((annual / base) * 100 * 10) / 10;
      })
    );
  }

  statusClass$(key: ExpenseKey): Observable<StatusClass> {
    return this.wizard.answers$.pipe(
      map((a) => {
        const statuses = this.evaluator.evaluate(a);
        return (statuses[key] as StatusClass) || 'neutral';
      })
    );
  }

  // ANF KPI streams (Average Net Fee) - FIXED: Use consistent logic
  anfValue$ = this.wizard.answers$.pipe(
    map((a) => {
      // Use same logic as KpiEvaluatorService.getEffectiveAvgNetFee()
      if (a.storeType === 'existing') {
        return a.projectedAvgNetFee ?? a.avgNetFee ?? null;
      }
      return a.avgNetFee ?? a.projectedAvgNetFee ?? null;
    })
  );

  anfStatus$ = this.wizard.answers$.pipe(map((a) => this.evaluator.getAnfStatus(a) as StatusClass));

  baselineUSD$(key: ExpenseKey): Observable<number> {
    return this.wizard.answers$.pipe(
      map((a) => {
        const b = a.expenseBaselines || {};
        if (key === 'insurance') {
          const min = (b['insuranceMin'] as number) ?? 4800;
          const max = (b['insuranceMax'] as number) ?? 6000;
          return Math.round((min + max) / 2);
        }
        if (key === 'misc') {
          const min = (b['miscMin'] as number) ?? 600;
          const max = (b['miscMax'] as number) ?? 1200;
          return Math.round((min + max) / 2);
        }
        const direct = (b[key] as number) || 0;
        if (direct) return Math.round(direct);
        const cfg = this.config[key];
        if (!cfg) return 0;
        const base = this.getBaseAmount(cfg, a);
        // fallback using typical default targets
        const defaults: Partial<Record<ExpenseKey, number>> = {
          telephone: 1.2,
          utilities: 1.05,
          localAdv: 1.75,
          supplies: 3.5,
          dues: 0.25,
          bankFees: 0.15,
          maintenance: 0.25,
          travel: 1.0,
        };
        const pct = defaults[key] ?? 0;
        return Math.round((base * pct) / 100);
      })
    );
  }

  updateAmount(key: ExpenseKey, value: number | null): void {
    const cfg = this.config[key];
    if (!cfg) return;
    const updates: Partial<WizardAnswers> = {};
    const a = this.wizard.answers;
    if (value === null) {
      (updates as any)[cfg.field] = undefined;
      this.wizard.updateAnswers(updates);
      return;
    }
    if (cfg.storage === 'amt') {
      (updates as any)[cfg.field] = value;
    } else {
      const base = this.getBaseAmount(cfg, a);
      const annual = cfg.period === 'monthly' ? value * 12 : value;
      const pct = base > 0 ? (annual / base) * 100 : 0;
      (updates as any)[cfg.field] = pct;
    }
    this.wizard.updateAnswers(updates);
  }

  updatePercent(key: ExpenseKey, value: number | null): void {
    this.pctInput$.next({ key, v: value });
  }

  private _updatePercentImpl(key: ExpenseKey, value: number | null): void {
    const cfg = this.config[key];
    if (!cfg) return;
    const updates: Partial<WizardAnswers> = {};
    const a = this.wizard.answers;
    if (value === null) {
      (updates as any)[cfg.field] = undefined;
      this.wizard.updateAnswers(updates);
      return;
    }
    if (cfg.storage === 'pct') {
      (updates as any)[cfg.field] = value;
    } else {
      const base = this.getBaseAmount(cfg, a);
      const annual = (value / 100) * base;
      const amount = cfg.period === 'monthly' ? Math.round(annual / 12) : Math.round(annual);
      (updates as any)[cfg.field] = amount;
    }
    this.wizard.updateAnswers(updates);
  }

  updateNote(key: ExpenseKey, text: string): void {
    const existing = { ...(this.wizard.answers.expenseNotes || {}) };
    existing[key] = text;
    this.wizard.updateAnswers({ expenseNotes: existing });
  }

  noteValue$(key: ExpenseKey): Observable<string> {
    return this.wizard.answers$.pipe(map((a) => a.expenseNotes?.[key] ?? ''));
  }
}
