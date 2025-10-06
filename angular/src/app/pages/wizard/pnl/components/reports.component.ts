import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { QuarterlyDataPipe } from '../../../reports/pnl/_pipes/quarterly-data.pipe';
import { MoneyPipe } from '../../../reports/pnl/_pipes/money.pipe';
import { Router } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';

import { WizardStateService } from '../../../../core/services/wizard-state.service';
import { CalculationService } from '../../../../core/services/calculation.service';
import { PDFExportService } from '../../../../services/pdf-export.service';
import { ExcelExportService } from '../../../../services/excel-export.service';
import { WizardAnswers } from '../../../../domain/types/wizard.types';
import { CalculationResults, CalculationInputs } from '../../../../domain/types/calculation.types';
import { logger } from '../../../../core/logger';
import {
  MonthlyFinancials,
  calculateMonthlyBreakdown,
} from '../../../../domain/data/monthly-distribution.data';
import { sanitizeKpi } from '../../../reports/pnl/_guards/kpi-sanity.guard';
import { startTrace } from '../../../../shared/debug/calc-trace';
import { AppMetaService } from '../../../../core/meta/app-meta.service';

interface ReportData {
  // Configuration
  region: string;
  storeType: string;
  returns: number;
  avgNetFee: number;
  generatedDate: string;

  // Annual KPIs
  netIncome: number;
  netMarginPct: number;
  costPerReturn: number;
  profitPerReturn: number;

  // Annual Revenue
  grossFees: number;
  discounts: number;
  totalRevenue: number;
  totalExpenses: number;
  expenseRatio: number;

  // Monthly Breakdown
  monthlyData: MonthlyFinancials[];

  // Wizard answers for detailed breakdown
  answers: WizardAnswers;
  calculationResults: CalculationResults;

  // Expense breakdown sections
  personnel: {
    salaries: number;
    deductions: number;
  };
  facility: {
    rent: number;
    telephone: number;
    utilities: number;
  };
  operations: {
    advertising: number;
    insurance: number;
    postage: number;
    supplies: number;
    dues: number;
    bankFees: number;
    maintenance: number;
    travelEnt: number;
  };
  franchise: {
    royalties: number;
    advRoyalties: number;
    taxRushRoyalties?: number;
  };
  misc: {
    misc: number;
  };
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe, QuarterlyDataPipe, MoneyPipe],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  private wizardState = inject(WizardStateService);
  private calculationService = inject(CalculationService);
  private pdfExport = inject(PDFExportService);
  private excelExport = inject(ExcelExportService);
  private router = inject(Router);
  private meta = inject(AppMetaService);

  reportData$: Observable<ReportData>;

  constructor() {
    logger.debug('📋🔧 [P&L REPORTS] Component constructor started');
    logger.debug('📋🔧 [P&L REPORTS] Services injected:', {
      wizardState: !!this.wizardState,
      calculationService: !!this.calculationService,
      pdfExport: !!this.pdfExport,
      excelExport: !!this.excelExport,
      router: !!this.router,
    });

    // Combine wizard state and calculations for the report
    this.reportData$ = this.wizardState.answers$.pipe(
      map((answers) => {
        const t = startTrace('pnl');
        t.log('inputs', answers);
        logger.debug('📋🔄 [P&L REPORTS] Processing wizard answers:', answers);
        const safeAnswers = sanitizeKpi(answers as Record<string, any>);
        const calcInputs: CalculationInputs = this.convertAnswersToInputs(
          safeAnswers as WizardAnswers
        );
        const calcResults: CalculationResults = {} as CalculationResults;
        const reportData = this.buildReportData(safeAnswers as WizardAnswers, calcResults);
        t.log('outputs', { calcInputs, reportData });
        t.log('kpis', {
          netIncome: reportData.netIncome,
          netMarginPct: reportData.netMarginPct,
          costPerReturn: reportData.costPerReturn,
          profitPerReturn: reportData.profitPerReturn,
        });
        return reportData;
      })
    );

    logger.debug('📋🔧 [P&L REPORTS] Component constructor completed');
  }

  private convertAnswersToInputs(answers: WizardAnswers): CalculationInputs {
    logger.debug('📋🔧 [P&L REPORTS] Converting wizard answers to calculation inputs...');
    logger.debug('📋🔧 [P&L REPORTS] Raw wizard answers:', answers);

    // Use computed properties for consistent data
    const avgNetFee = this.wizardState.getAvgNetFee() || 125;
    const taxPrepReturns = this.wizardState.getTaxPrepReturns() || 1600;
    const taxRushReturns = this.wizardState.getTaxRushReturns() || 0;
    const discountsPct = this.wizardState.getDiscountsPct() || 3;
    const otherIncome = this.wizardState.getOtherIncome() || 0;

    logger.debug('📋🔧 [P&L REPORTS] Computed properties extracted:', {
      avgNetFee,
      taxPrepReturns,
      taxRushReturns,
      discountsPct,
      otherIncome,
    });

    const calcInputs = {
      region: answers.region || 'US',
      scenario: 'Custom',
      avgNetFee,
      taxPrepReturns,
      taxRushReturns,
      discountsPct,
      otherIncome,

      // Expense percentages
      salariesPct: answers.payrollPct || 25,
      empDeductionsPct: answers.empDeductionsPct || 10,
      rentPct: answers.rentPct || 18,
      suppliesPct: answers.suppliesPct || 2,
      royaltiesPct: answers.royaltiesPct || 14,
      advRoyaltiesPct: answers.advRoyaltiesPct || 5,
      taxRushRoyaltiesPct: answers.taxRushRoyaltiesPct || 0,
      miscPct: answers.miscPct || 2.5,

      // Fixed amounts
      telephoneAmt: answers.telephoneAmt || 0,
      utilitiesAmt: answers.utilitiesAmt || 0,
      localAdvAmt: answers.localAdvAmt || 0,
      insuranceAmt: answers.insuranceAmt || 0,
      postageAmt: answers.postageAmt || 0,
      duesAmt: answers.duesAmt || 0,
      bankFeesAmt: answers.bankFeesAmt || 0,
      maintenanceAmt: answers.maintenanceAmt || 0,
      travelEntAmt: answers.travelEntAmt || 0,

      // Standard thresholds for KPI calculations
      thresholds: {
        cprGreen: 95,
        cprYellow: 110,
        nimGreen: 20,
        nimYellow: 15,
        netIncomeWarn: 30000,
      },
    };

    logger.debug('📋🔧 [P&L REPORTS] Final calculation inputs structure:', {
      region: calcInputs.region,
      scenario: calcInputs.scenario,
      revenueInputs: { avgNetFee, taxPrepReturns, taxRushReturns, discountsPct, otherIncome },
      expensePercentages: {
        salariesPct: calcInputs.salariesPct,
        empDeductionsPct: calcInputs.empDeductionsPct,
        rentPct: calcInputs.rentPct,
        suppliesPct: calcInputs.suppliesPct,
        royaltiesPct: calcInputs.royaltiesPct,
        advRoyaltiesPct: calcInputs.advRoyaltiesPct,
        taxRushRoyaltiesPct: calcInputs.taxRushRoyaltiesPct,
        miscPct: calcInputs.miscPct,
      },
      fixedAmounts: {
        telephoneAmt: calcInputs.telephoneAmt,
        utilitiesAmt: calcInputs.utilitiesAmt,
        localAdvAmt: calcInputs.localAdvAmt,
        insuranceAmt: calcInputs.insuranceAmt,
        postageAmt: calcInputs.postageAmt,
        duesAmt: calcInputs.duesAmt,
        bankFeesAmt: calcInputs.bankFeesAmt,
        maintenanceAmt: calcInputs.maintenanceAmt,
        travelEntAmt: calcInputs.travelEntAmt,
      },
      thresholds: calcInputs.thresholds,
    });

    return calcInputs;
  }

  ngOnInit(): void {
    this.meta.setTitle('P&L Forecast');
    this.meta.setDesc('Annual & monthly projections.');
  }

  private buildReportData(answers: WizardAnswers, calcResults: CalculationResults): ReportData {
    return {
      region: 'US',
      storeType: 'new',
      returns: 0,
      avgNetFee: 0,
      generatedDate: new Date().toISOString(),
      netIncome: 0,
      netMarginPct: 0,
      costPerReturn: 0,
      profitPerReturn: 0,
      grossFees: 0,
      discounts: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      expenseRatio: 0,
      monthlyData: [],
      answers: {} as any,
      calculationResults: {} as any,
      personnel: { salaries: 0, deductions: 0 },
      facility: { rent: 0, telephone: 0, utilities: 0 },
      operations: {
        advertising: 0,
        insurance: 0,
        postage: 0,
        supplies: 0,
        dues: 0,
        bankFees: 0,
        maintenance: 0,
        travelEnt: 0,
      },
      franchise: { royalties: 0, advRoyalties: 0 },
      misc: { misc: 0 },
    };
  }

  async exportToPDF(reportData: ReportData): Promise<void> {
    logger.debug('📄🚀 [P&L REPORTS] PDF export button clicked');
    logger.debug('📄🚀 [P&L REPORTS] Report data for PDF export:', {
      hasAnswers: !!reportData.answers,
      hasCalculationResults: !!reportData.calculationResults,
      netIncome: reportData.netIncome,
      totalRevenue: reportData.totalRevenue,
      region: reportData.region,
      storeType: reportData.storeType,
    });

    try {
      logger.debug('📄🚀 [P&L REPORTS] Calling PDF export service...');
      await this.pdfExport.generateExecutiveBriefPDF(
        reportData.answers,
        reportData.calculationResults
      );
      logger.info('📄✅ [P&L REPORTS] PDF export completed successfully');
    } catch (error) {
      logger.error('📄❌ [P&L REPORTS] PDF export failed:', error);
      logger.error('📄❌ [P&L REPORTS] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
      });
      alert(
        'PDF export is not available. Install jspdf and html2canvas packages to enable this feature.'
      );
    }
  }

  async exportToExcel(reportData: ReportData): Promise<void> {
    logger.debug('📊🚀 [P&L REPORTS] Excel export button clicked');
    logger.debug('📊🚀 [P&L REPORTS] Report data for Excel export:', {
      hasAnswers: !!reportData.answers,
      hasCalculationResults: !!reportData.calculationResults,
      expenseFieldCount: Object.keys(reportData.answers).filter(
        (key) => key.includes('Pct') || key.includes('Amt')
      ).length,
      region: reportData.region,
      storeType: reportData.storeType,
    });

    try {
      logger.debug('📊🚀 [P&L REPORTS] Calling Excel export service...');
      await this.excelExport.exportToExcel(reportData.answers, reportData.calculationResults);
      logger.info('📊✅ [P&L REPORTS] Excel export completed successfully');
    } catch (error) {
      logger.error('📊❌ [P&L REPORTS] Excel export failed:', error);
      logger.error('📊❌ [P&L REPORTS] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
      });
      alert('Excel export is not available. Install exceljs package to enable this feature.');
    }
  }

  goBack(): void {
    logger.debug('🔙🚀 [P&L REPORTS] Back button clicked');
    logger.debug('🔙🚀 [P&L REPORTS] Current route before navigation:', this.router.url);
    logger.debug('🔙🚀 [P&L REPORTS] Navigating back to expenses...');

    this.router
      .navigateByUrl('/wizard/expenses')
      .then((success) => {
        logger.debug('🔙🚀 [P&L REPORTS] Navigation to expenses result:', success);
        logger.debug('🔙🚀 [P&L REPORTS] New route after navigation:', this.router.url);
      })
      .catch((error) => {
        logger.error('🔙❌ [P&L REPORTS] Navigation to expenses failed:', error);
      });
  }

  goToDashboard(): void {
    logger.debug('🏠🚀 [P&L REPORTS] Dashboard button clicked');
    logger.debug('🏠🚀 [P&L REPORTS] Current route before navigation:', this.router.url);
    logger.debug('🏠🚀 [P&L REPORTS] Navigating to dashboard...');

    this.router
      .navigateByUrl('/dashboard')
      .then((success) => {
        logger.debug('🏠🚀 [P&L REPORTS] Navigation to dashboard result:', success);
        logger.debug('🏠🚀 [P&L REPORTS] New route after navigation:', this.router.url);
      })
      .catch((error) => {
        logger.error('🏠❌ [P&L REPORTS] Navigation to dashboard failed:', error);
      });
  }

  // Navigation handler for Annual Summary button
  goBackToAnnual(): void {
    logger.debug('🔙🚀 [P&L REPORTS] Annual Summary button clicked');
    this.router
      .navigateByUrl('/wizard/pnl')
      .then((success) => logger.debug('🔙🚀 [P&L REPORTS] Navigated to annual summary:', success))
      .catch((error) => logger.error('🔙❌ [P&L REPORTS] Navigation failed:', error));
  }

  // ----- Template helper methods -----
  getSeasonClass(monthNumber: number): string {
    // Peak season roughly Jan-Apr in tax industry
    return monthNumber >= 1 && monthNumber <= 4 ? 'season-peak' : 'season-slow';
  }

  getMonthDescription(monthNumber: number): string {
    const descriptions: Record<number, string> = {
      1: 'Kickoff of peak season',
      2: 'High volume filing period',
      3: 'Peak processing period',
      4: 'Final rush before deadlines',
      5: 'Post-season wrap-up',
      6: 'Off-season operations',
      7: 'Off-season operations',
      8: 'Pre-season planning',
      9: 'Pre-season planning',
      10: 'Pre-season setup',
      11: 'Staffing and training',
      12: 'Year-end preparation',
    };
    return descriptions[monthNumber] || '';
  }

  getMarginClass(netMarginPct: number): string {
    if (netMarginPct > 20) return 'excellent';
    if (netMarginPct > 15) return 'good';
    return 'needs-improvement';
  }

  getSeasonBadgeClass(monthNumber: number): string {
    return monthNumber >= 1 && monthNumber <= 4 ? 'badge-peak' : 'badge-slow';
  }

  getSeasonLabel(monthNumber: number): string {
    return monthNumber >= 1 && monthNumber <= 4 ? 'Peak season' : 'Slow season';
  }

  getQuarterlyData(monthlyData: MonthlyFinancials[]): Array<{
    label: string;
    cumulativeReturns: number;
    cumulativeRevenue: number;
    cumulativeNetIncome: number;
  }> {
    const quarters = [
      { label: 'Q1 (Jan-Mar)', endMonth: 3 },
      { label: 'Q2 (Apr-Jun)', endMonth: 6 },
      { label: 'Q3 (Jul-Sep)', endMonth: 9 },
      { label: 'Q4 (Oct-Dec)', endMonth: 12 },
    ];

    return quarters.map((q) => {
      const upTo = monthlyData.filter((m) => m.monthNumber <= q.endMonth);
      return {
        label: q.label,
        cumulativeReturns: upTo.reduce((sum, m) => sum + (m.returns || 0), 0),
        cumulativeRevenue: upTo.reduce((sum, m) => sum + (m.netRevenue || 0), 0),
        cumulativeNetIncome: upTo.reduce((sum, m) => sum + (m.netIncome || 0), 0),
      };
    });
  }

  getPeakSeasonStats(monthlyData: MonthlyFinancials[]): {
    totalReturns: number;
    totalRevenue: number;
    percentage: number;
  } {
    const peak = monthlyData.filter((m) => m.monthNumber >= 1 && m.monthNumber <= 4);
    const totalReturns = peak.reduce((sum, m) => sum + (m.returns || 0), 0);
    const totalRevenue = peak.reduce((sum, m) => sum + (m.netRevenue || 0), 0);
    const annualReturns = monthlyData.reduce((sum, m) => sum + (m.returns || 0), 0);
    const percentage = annualReturns > 0 ? (totalReturns / annualReturns) * 100 : 0;
    return { totalReturns, totalRevenue, percentage };
  }

  getSlowSeasonStats(monthlyData: MonthlyFinancials[]): {
    totalReturns: number;
    totalRevenue: number;
    percentage: number;
  } {
    const slow = monthlyData.filter((m) => m.monthNumber >= 5 && m.monthNumber <= 12);
    const totalReturns = slow.reduce((sum, m) => sum + (m.returns || 0), 0);
    const totalRevenue = slow.reduce((sum, m) => sum + (m.netRevenue || 0), 0);
    const annualReturns = monthlyData.reduce((sum, m) => sum + (m.returns || 0), 0);
    const percentage = annualReturns > 0 ? (totalReturns / annualReturns) * 100 : 0;
    return { totalReturns, totalRevenue, percentage };
  }
}
