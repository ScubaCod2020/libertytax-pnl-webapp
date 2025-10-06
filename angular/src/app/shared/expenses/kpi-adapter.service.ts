import { Injectable } from '@angular/core';
import type { WizardAnswers } from '../../domain/types/wizard.types';
import { SHARED_EXPENSE_METADATA } from './expense-metadata';
import { startTrace } from '../../shared/debug/calc-trace';
import { coerceJson, coerceNumber } from '../../domain/_util/sanity.guard';

@Injectable({ providedIn: 'root' })
export class KpiAdapterService {
  /** Unified revenue base identical to evaluator */
  private getExpensesRevenueTotal(a: WizardAnswers): number {
    const base = a.projectedTaxPrepIncome || 0;
    const taxRush = a.region === 'CA' && a.handlesTaxRush ? a.projectedTaxRushGrossFees || 0 : 0;
    const other = a.hasOtherIncome ? a.projectedOtherIncome || 0 : 0;
    return base + taxRush + other;
  }

  /** Build v2 payload with correct units/periods; derive annual where needed */
  buildPayload(a: WizardAnswers): any {
    const __trace = startTrace('expenses');
    const __safe = coerceJson<WizardAnswers>(a as unknown);
    __trace.log('inputs', __safe);
    const gross = this.getExpensesRevenueTotal(__safe);

    const getPctFromAmount = (amount: number | undefined): number | null => {
      if (!amount || amount <= 0 || gross <= 0) return null;
      return (amount / gross) * 100;
    };

    const payload: Record<string, any> = {};

    // Percent-based directly from answers
    payload['payrollPct'] = a.payrollPct ?? null;
    payload['empDeductionsPct'] = a.empDeductionsPct ?? null;
    payload['suppliesPct'] = a.suppliesPct ?? null;
    payload['shortagesPct'] = a.shortagesPct ?? null;
    payload['miscPct'] = a.miscPct ?? null;
    payload['royaltiesPct'] = a.royaltiesPct ?? null;
    payload['advRoyaltiesPct'] = a.advRoyaltiesPct ?? null;
    payload['taxRushRoyaltiesPct'] = a.taxRushRoyaltiesPct ?? null;

    // Amount rows → keep amount, also provide computed pct for v2 if helpful
    payload['telephoneAmt'] = a.telephoneAmt ?? null;
    payload['telephonePct'] = getPctFromAmount(a.telephoneAmt ?? 0);

    payload['utilitiesAmt'] = a.utilitiesAmt ?? null;
    payload['utilitiesPct'] = getPctFromAmount(a.utilitiesAmt ?? 0);

    payload['localAdvAmt'] = a.localAdvAmt ?? null;
    payload['localAdvPct'] = getPctFromAmount(a.localAdvAmt ?? 0);

    payload['insuranceAnnual'] = a.insuranceAmt ?? null;
    payload['insurancePct'] = getPctFromAmount(a.insuranceAmt ?? 0);

    payload['postageAnnual'] = a.postageAmt ?? null;
    payload['postagePct'] = getPctFromAmount(a.postageAmt ?? 0);

    payload['duesAnnual'] = a.duesAmt ?? null;
    payload['duesPct'] = getPctFromAmount(a.duesAmt ?? 0);

    payload['bankFeesAnnual'] = a.bankFeesAmt ?? null;
    payload['bankFeesPct'] = getPctFromAmount(a.bankFeesAmt ?? 0);

    payload['maintenanceAnnual'] = a.maintenanceAmt ?? null;
    payload['maintenancePct'] = getPctFromAmount(a.maintenanceAmt ?? 0);

    payload['travelAnnual'] = a.travelEntAmt ?? null;
    payload['travelPct'] = getPctFromAmount(a.travelEntAmt ?? 0);

    // Rent: treat as monthly dollar with derived annual and pct for engines that need it
    const rentMonthly = __safe.rentPct
      ? Math.round((gross * coerceNumber(__safe.rentPct)) / 100)
      : (a as any).rentMonthly;
    payload['rentMonthly'] = rentMonthly ?? null;
    payload['rentAnnual'] = rentMonthly != null ? rentMonthly * 12 : null;
    payload['rentPct'] =
      rentMonthly != null && gross > 0 ? (rentMonthly / gross) * 100 : (a.rentPct ?? null);

    // Average Net Fee passthrough for v2 engines - FIXED: Use consistent logic
    payload['averageNetFee'] =
      __safe.storeType === 'existing'
        ? (__safe.projectedAvgNetFee ?? __safe.avgNetFee ?? null)
        : (__safe.avgNetFee ?? __safe.projectedAvgNetFee ?? null);

    __trace.log('outputs', payload);
    return payload;
  }
}
