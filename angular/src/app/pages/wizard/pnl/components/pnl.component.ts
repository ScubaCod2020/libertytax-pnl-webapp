import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';

import { WizardStateService } from '../../../../core/services/wizard-state.service';
import { CalculationService } from '../../../../core/services/calculation.service';
import { PDFExportService } from '../../../../services/pdf-export.service';
import { ExcelExportService } from '../../../../services/excel-export.service';
import { WizardAnswers } from '../../../../domain/types/wizard.types';
import { CalculationResults, CalculationInputs } from '../../../../domain/types/calculation.types';

interface ReportData {
  // Configuration
  region: string;
  storeType: string;
  returns: number;
  avgNetFee: number;
  generatedDate: string;

  // KPIs
  netIncome: number;
  netMarginPct: number;
  costPerReturn: number;
  profitPerReturn: number;

  // Revenue
  grossFees: number;
  discounts: number;
  totalRevenue: number;

  // Expense breakdown by category
  personnel: { salaries: number; deductions: number };
  facility: { rent: number; telephone: number; utilities: number };
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
  franchise: { royalties: number; advRoyalties: number; taxRushRoyalties?: number };
  misc: { misc: number };
  totalExpenses: number;
  expenseRatio: number;

  // Wizard answers for detailed breakdown
  answers: WizardAnswers;
  calculationResults: CalculationResults;
}

@Component({
  selector: 'app-pnl',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe, DatePipe],
  templateUrl: './pnl.component.html',
  styleUrls: ['./pnl.component.scss'],
})
export class PnlComponent implements OnInit {
  wizardState = inject(WizardStateService);
  private calculationService = inject(CalculationService);
  private pdfExport = inject(PDFExportService);
  private excelExport = inject(ExcelExportService);
  private router = inject(Router);

  reportData$: Observable<ReportData>;

  constructor() {
    console.log('📋🔧 [P&L ANNUAL] Component constructor started');
    console.log('📋🔧 [P&L ANNUAL] Services injected:', {
      wizardState: !!this.wizardState,
      calculationService: !!this.calculationService,
      pdfExport: !!this.pdfExport,
      excelExport: !!this.excelExport,
      router: !!this.router,
    });

    // Combine wizard state and calculations for the report
    this.reportData$ = this.wizardState.answers$.pipe(
      map((answers) => {
        console.log('📋🔄 [P&L ANNUAL] Processing wizard answers:', answers);

        // Convert WizardAnswers to CalculationInputs
        const calcInputs: CalculationInputs = this.convertAnswersToInputs(answers);
        console.log('📋🔄 [P&L ANNUAL] Converted to calculation inputs:', calcInputs);

        // Calculate results
        const calcResults = this.calculationService.calculate(calcInputs);
        console.log('📋🔄 [P&L ANNUAL] Calculation results:', calcResults);

        const reportData = this.buildReportData(answers, calcResults);
        console.log('📋🔄 [P&L ANNUAL] Final report data built:', reportData);

        return reportData;
      })
    );

    console.log('📋🔧 [P&L ANNUAL] Component constructor completed');
  }

  private convertAnswersToInputs(answers: WizardAnswers): CalculationInputs {
    console.log('📋🔧 [P&L ANNUAL] Converting wizard answers to calculation inputs...');

    // Use computed properties for consistent data
    const avgNetFee = this.wizardState.getAvgNetFee() || 125;
    const taxPrepReturns = this.wizardState.getTaxPrepReturns() || 1600;
    const taxRushReturns = this.wizardState.getTaxRushReturns() || 0;
    const discountsPct = this.wizardState.getDiscountsPct() || 3;
    const otherIncome = this.wizardState.getOtherIncome() || 0;

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

    console.log('📋🔧 [P&L ANNUAL] Final calculation inputs ready');
    return calcInputs;
  }

  ngOnInit(): void {
    console.log('📋🚀 [P&L ANNUAL] Component ngOnInit started');
    console.log('📋🚀 [P&L ANNUAL] Current route:', this.router.url);

    // Trigger comprehensive debugging
    this.wizardState.getComputedPropertiesSummary();

    // Subscribe to report data for debugging
    this.reportData$.subscribe((reportData) => {
      console.log('📋🚀 [P&L ANNUAL] Annual report data updated:', reportData);
    });

    console.log('📋🚀 [P&L ANNUAL] Component ngOnInit completed');
  }

  private buildReportData(answers: WizardAnswers, calcResults: CalculationResults): ReportData {
    console.log('📋🏗️ [P&L ANNUAL] Building annual report data...');

    const region = answers.region || 'US';
    const storeType = answers.storeType || 'new';
    const isCanada = region === 'CA';

    // Use computed properties for consistent data
    const returns = this.wizardState.getTaxPrepReturns();
    const avgNetFee = this.wizardState.getAvgNetFee();
    const grossFees = this.wizardState.getGrossFees();
    const discounts = this.wizardState.getDiscountsAmt();
    const netIncome = calcResults.netIncome || 0;
    const totalRevenue = calcResults.totalRevenue || 0;
    const totalExpenses = calcResults.totalExpenses || 0;

    // Calculate KPIs
    const netMarginPct = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
    const costPerReturn = returns > 0 ? totalExpenses / returns : 0;
    const profitPerReturn = returns > 0 ? netIncome / returns : 0;
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

    // Calculate expense breakdown
    const personnel = {
      salaries: ((answers.payrollPct || 0) / 100) * grossFees,
      deductions:
        ((answers.empDeductionsPct || 0) / 100) * (((answers.payrollPct || 0) / 100) * grossFees),
    };

    const facility = {
      rent: ((answers.rentPct || 0) / 100) * grossFees,
      telephone: answers.telephoneAmt || 0,
      utilities: answers.utilitiesAmt || 0,
    };

    const operations = {
      advertising: answers.localAdvAmt || 0,
      insurance: answers.insuranceAmt || 0,
      postage: answers.postageAmt || 0,
      supplies: ((answers.suppliesPct || 0) / 100) * grossFees,
      dues: answers.duesAmt || 0,
      bankFees: answers.bankFeesAmt || 0,
      maintenance: answers.maintenanceAmt || 0,
      travelEnt: answers.travelEntAmt || 0,
    };

    const taxPrepIncome = this.wizardState.getTaxPrepIncome();
    const franchise = {
      royalties: ((answers.royaltiesPct || 0) / 100) * taxPrepIncome,
      advRoyalties: ((answers.advRoyaltiesPct || 0) / 100) * taxPrepIncome,
      ...(isCanada && answers.handlesTaxRush
        ? {
            taxRushRoyalties: ((answers.taxRushRoyaltiesPct || 0) / 100) * taxPrepIncome,
          }
        : {}),
    };

    const misc = {
      misc: ((answers.miscPct || 0) / 100) * grossFees,
    };

    const finalReportData = {
      // Configuration
      region: this.wizardState.getDisplayLabel('regionName'),
      storeType: this.wizardState.getDisplayLabel('storeTypeName'),
      returns,
      avgNetFee,
      generatedDate: new Date().toISOString(),

      // KPIs
      netIncome,
      netMarginPct,
      costPerReturn,
      profitPerReturn,

      // Revenue
      grossFees,
      discounts,
      totalRevenue,

      // Expenses
      personnel,
      facility,
      operations,
      franchise,
      misc,
      totalExpenses,
      expenseRatio,

      // Raw data
      answers,
      calculationResults: calcResults,
    };

    console.log('📋🏗️ [P&L ANNUAL] Annual report data building completed');
    return finalReportData;
  }

  async exportToPDF(reportData: ReportData): Promise<void> {
    console.log('📄🚀 [P&L ANNUAL] PDF export button clicked');

    try {
      console.log('📄🚀 [P&L ANNUAL] Calling PDF export service...');
      await this.pdfExport.generateExecutiveBriefPDF(
        reportData.answers,
        reportData.calculationResults
      );
      console.log('📄✅ [P&L ANNUAL] PDF export completed successfully');
    } catch (error) {
      console.error('📄❌ [P&L ANNUAL] PDF export failed:', error);
      alert(
        'PDF export is not available. Install jspdf and html2canvas packages to enable this feature.'
      );
    }
  }

  async exportToExcel(reportData: ReportData): Promise<void> {
    console.log('📊🚀 [P&L ANNUAL] Excel export button clicked');

    try {
      console.log('📊🚀 [P&L ANNUAL] Calling Excel export service...');
      await this.excelExport.exportToExcel(reportData.answers, reportData.calculationResults);
      console.log('📊✅ [P&L ANNUAL] Excel export completed successfully');
    } catch (error) {
      console.error('📊❌ [P&L ANNUAL] Excel export failed:', error);
      alert('Excel export is not available. Install exceljs package to enable this feature.');
    }
  }

  viewMonthlyBreakdown(): void {
    console.log('📅🚀 [P&L ANNUAL] Monthly Breakdown button clicked');
    console.log('📅🚀 [P&L ANNUAL] Current route before navigation:', this.router.url);
    console.log('📅🚀 [P&L ANNUAL] Navigating to monthly breakdown...');

    this.router
      .navigateByUrl('/wizard/reports')
      .then((success) => {
        console.log('📅🚀 [P&L ANNUAL] Navigation to monthly breakdown result:', success);
        console.log('📅🚀 [P&L ANNUAL] New route after navigation:', this.router.url);
      })
      .catch((error) => {
        console.error('📅❌ [P&L ANNUAL] Navigation to monthly breakdown failed:', error);
      });
  }

  goBack(): void {
    console.log('🔙🚀 [P&L ANNUAL] Back button clicked');
    this.router.navigateByUrl('/wizard/expenses');
  }

  goToDashboard(): void {
    console.log('🏠🚀 [P&L ANNUAL] Dashboard button clicked');
    this.router.navigateByUrl('/dashboard');
  }
}
