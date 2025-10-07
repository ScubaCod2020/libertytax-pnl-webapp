import { Injectable } from '@angular/core';
import { CalculationService } from '../../core/services/calculation.service';
import { SettingsService } from '../../services/settings.service';
import type { CalculationInputs, CalculationResults } from '../types/calculation.types';
import type { PerformanceMetric } from '../types/performance.types';
import { DEFAULT_REGION_CONFIGS } from '../../core/tokens/region-configs.token';
import { ProjectedService } from '../../services/projected.service';
import { WizardStateService } from '../../core/services/wizard-state.service';
import { startTrace } from '../../shared/debug/calc-trace';
import { coerceJson } from '../_util/sanity.guard';

/**
 * MetricsAssemblerService
 * Purpose: Build PerformanceMetric[] for dashboard preview.
 * Notes:
 * - Minimal implementation: computes a demo Projected result using current settings
 *   and converts key fields (revenue, returns) into PerformanceMetric[].
 * - YTD data is not yet available in the app; this service will evolve to compare
 *   YTD vs Projected when YTD inputs/services are introduced.
 */
@Injectable({ providedIn: 'root' })
export class MetricsAssemblerService {
  constructor(
    private readonly calc: CalculationService,
    private readonly settings: SettingsService,
    private readonly projected: ProjectedService,
    private readonly wizardState: WizardStateService
  ) {}

  /**
   * Build a small set of dashboard preview metrics (Revenue, Returns).
   * Returns an object with arrays so the caller can lay them out flexibly.
   */
  buildDashboardPreviewMetrics(): {
    revenue: PerformanceMetric[];
    returns: PerformanceMetric[];
    cpr: PerformanceMetric[];
  } {
    const __t = startTrace('kpi');
    const answers = this.wizardState.answers;
    const __in = coerceJson<typeof answers>(answers as unknown);
    __t.log('inputs', __in);

    // Use wizard state region instead of settings service to avoid mismatch
    const wizardRegion = answers.region || 'US';
    const thresholds = DEFAULT_REGION_CONFIGS[wizardRegion].thresholds;

    // Use real wizard data instead of demo inputs
    const realInputs: CalculationInputs = {
      region: wizardRegion,
      scenario: 'Custom',
      avgNetFee: answers.avgNetFee || 125,
      taxPrepReturns: answers.projectedTaxPrepReturns || answers.taxPrepReturns || 1600,
      taxRushReturns:
        answers.taxRushReturns || (answers.handlesTaxRush && wizardRegion === 'CA' ? 150 : 0),
      discountsPct: answers.discountsPct || 3,
      otherIncome: answers.otherIncome || (answers.hasOtherIncome ? 5000 : 0),
      calculatedTotalExpenses: answers.calculatedTotalExpenses,
      salariesPct: answers.payrollPct || 25,
      empDeductionsPct: answers.empDeductionsPct || 10,
      rentPct: answers.rentPct || 18,
      telephoneAmt: answers.telephoneAmt || 0.5,
      utilitiesAmt: answers.utilitiesAmt || 1.2,
      localAdvAmt: answers.localAdvAmt || 2.0,
      insuranceAmt: answers.insuranceAmt || 0.6,
      postageAmt: answers.postageAmt || 0.4,
      suppliesPct: answers.suppliesPct || 3.5,
      duesAmt: answers.duesAmt || 0.8,
      bankFeesAmt: answers.bankFeesAmt || 0.4,
      maintenanceAmt: answers.maintenanceAmt || 0.6,
      travelEntAmt: answers.travelEntAmt || 0.8,
      royaltiesPct: answers.royaltiesPct || 14,
      advRoyaltiesPct: answers.advRoyaltiesPct || 5,
      taxRushRoyaltiesPct:
        answers.taxRushRoyaltiesPct || (answers.handlesTaxRush && wizardRegion === 'CA' ? 6 : 0),
      miscPct: answers.miscPct || 1.0,
      thresholds,
    };

    const res: CalculationResults = this.calc.calculate(realInputs);

    // Placeholder trend uses projected growth percent (from scenario) until we have YTD.
    const growthPct = this.projected.growthPct;

    const revenue: PerformanceMetric[] = [
      {
        id: 'totalRevenue',
        label: 'Total Revenue',
        value: Math.round(res.totalRevenue),
        unit: 'currency',
        trend: {
          direction: growthPct > 0 ? 'up' : growthPct < 0 ? 'down' : 'flat',
          percentage: growthPct,
          period: 'vs preset',
        },
        target: { value: Math.round(res.totalRevenue), status: 'on-track' },
        context: { period: 'YTD' },
      },
    ];

    const returns: PerformanceMetric[] = [
      {
        id: 'totalReturns',
        label: 'Returns',
        value: Math.round(res.totalReturns),
        unit: 'count',
        trend: {
          direction: growthPct > 0 ? 'up' : growthPct < 0 ? 'down' : 'flat',
          percentage: growthPct,
          period: 'vs preset',
        },
        target: { value: 1600, status: res.totalReturns >= 1600 ? 'on-track' : 'below' },
        context: { period: 'YTD' },
      },
    ];

    const cprValue = Math.round((res.totalExpenses || 0) / Math.max(res.totalReturns || 1, 1));
    const cpr: PerformanceMetric[] = [
      {
        id: 'cpr',
        label: 'CPR (Cost per Return)',
        value: cprValue,
        unit: 'currency',
        trend: {
          direction: growthPct > 0 ? 'up' : growthPct < 0 ? 'down' : 'flat',
          percentage: growthPct,
          period: 'vs preset',
        },
        target: { value: cprValue, status: 'on-track' },
        context: { period: 'YTD' },
      },
    ];

    const __out = { revenue, returns, cpr };
    __t.log('outputs', __out);
    return __out;
  }
}
