import { Injectable } from '@angular/core';
import { CalculationService } from '../../core/services/calculation.service';
import { SettingsService } from '../../services/settings.service';
import type { CalculationInputs, CalculationResults } from '../types/calculation.types';
import type { PerformanceMetric } from '../types/performance.types';
import { DEFAULT_REGION_CONFIGS } from '../../core/tokens/region-configs.token';
import { ProjectedService } from '../../services/projected.service';

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
    private readonly projected: ProjectedService
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
    const s = this.settings.settings;
    const thresholds = DEFAULT_REGION_CONFIGS[s.region].thresholds;

    // Demo inputs (matches DashboardResultsPanel strategy). These will be replaced
    // with real Projected vs YTD once wiring is complete.
    const demoInputs: CalculationInputs = {
      region: s.region,
      scenario: 'Custom',
      avgNetFee: 125,
      taxPrepReturns: 1600,
      taxRushReturns: s.region === 'CA' ? 150 : 0,
      discountsPct: 3,
      otherIncome: s.otherIncome ? 5000 : 0,
      calculatedTotalExpenses: undefined,
      salariesPct: 25,
      empDeductionsPct: 10,
      rentPct: 18,
      telephoneAmt: 0.5,
      utilitiesAmt: 1.2,
      localAdvAmt: 2.0,
      insuranceAmt: 0.6,
      postageAmt: 0.4,
      suppliesPct: 3.5,
      duesAmt: 0.8,
      bankFeesAmt: 0.4,
      maintenanceAmt: 0.6,
      travelEntAmt: 0.8,
      royaltiesPct: 14,
      advRoyaltiesPct: 5,
      taxRushRoyaltiesPct: s.region === 'CA' ? 6 : 0,
      miscPct: 1.0,
      thresholds,
    };

    const res: CalculationResults = this.calc.calculate(demoInputs);

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

    return { revenue, returns, cpr };
  }
}
