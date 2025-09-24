import { Injectable } from '@angular/core';
import { WizardAnswers } from '../domain/types/wizard.types';
import { CalculationResults } from '../domain/types/calculation.types';
import { getBrandForRegion } from '../lib/regional-branding';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {
  
  /**
   * Export P&L data to Excel with branded template formatting
   * Mirrors the Python build_pnl_tool_v5.py functionality
   */
  async exportToExcel(
    wizardAnswers: WizardAnswers, 
    calculationResults: CalculationResults
  ): Promise<void> {
    
    // Import ExcelJS dynamically for better bundle size
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.default.Workbook();
    
    // Get regional branding
    const brand = getBrandForRegion(wizardAnswers.region);
    
    // Brand colors (matching Python tool)
    const LIBERTY_BLUE = brand.colors.secondary; // "002D72"
    const LIBERTY_RED = brand.colors.primary;    // "EA0029"
    const GREEN = "C6EFCE";
    const YELLOW = "FFEB9C";
    const RED = "F4CCCC";
    const ACCENT_GREY = "F2F2F2";
    const BORDER_GREY = "DDDDDD";
    
    // Create worksheets (matching Python structure)
    const welcomeSheet = workbook.addWorksheet('Welcome');
    const inputsSheet = workbook.addWorksheet('Inputs');
    const resultsSheet = workbook.addWorksheet('Results');
    const dashboardSheet = workbook.addWorksheet('Dashboard');
    const practiceSheet = workbook.addWorksheet('Practice');
    const proTipsSheet = workbook.addWorksheet('ProTips');
    const reportSheet = workbook.addWorksheet('Report');
    
    // Welcome Sheet
    this.buildWelcomeSheet(welcomeSheet, wizardAnswers, LIBERTY_BLUE);
    
    // Inputs Sheet  
    this.buildInputsSheet(inputsSheet, wizardAnswers, LIBERTY_BLUE);
    
    // Results Sheet
    this.buildResultsSheet(resultsSheet, calculationResults, GREEN, YELLOW, RED);
    
    // Dashboard Sheet
    this.buildDashboardSheet(dashboardSheet, calculationResults, LIBERTY_BLUE, GREEN, YELLOW, RED);
    
    // Practice Sheet (NEW - from Python tool)
    this.buildPracticeSheet(practiceSheet, LIBERTY_BLUE, GREEN, YELLOW, RED);
    
    // ProTips Sheet (NEW - from Python tool)  
    this.buildProTipsSheet(proTipsSheet, LIBERTY_BLUE);
    
    // Report Sheet
    this.buildReportSheet(reportSheet, wizardAnswers, calculationResults, LIBERTY_BLUE);
    
    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Liberty_Tax_PnL_Tool_${wizardAnswers.region}_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    
    window.URL.revokeObjectURL(url);
  }
  
  private buildWelcomeSheet(sheet: any, answers: WizardAnswers, brandColor: string): void {
    // Brand header
    sheet.getCell('A1').value = 'Welcome – Quick Start';
    sheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: brandColor.replace('#', '') } };
    
    // Region
    sheet.getCell('A3').value = 'Region';
    sheet.getCell('B3').value = answers.region === 'US' ? 'U.S.' : 'Canada';
    
    // Key inputs from wizard
    const inputs = [
      ['Planned return count (2026)', answers.taxPrepReturns || 1600],
      ['Average net fee (ANF) $', answers.avgNetFee || 125],
      ['Discounts % of Gross Fees', answers.discountsPct || 3],
      ['Target Net Margin % (green)', 20],
      ['Cost/Return green threshold $', 25],
      ['Cost/Return yellow upper bound $', 35],
    ];
    
    let row = 5;
    inputs.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`B${row}`).value = value;
      sheet.getCell(`A${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } };
      row += 2;
    });
    
    // Navigation links
    sheet.getCell('D2').value = 'Go to Inputs';
    sheet.getCell('E2').value = 'Go to Dashboard';
  }
  
  private buildPracticeSheet(sheet: any, brandColor: string, green: string, yellow: string, red: string): void {
    // Header
    sheet.getCell('A1').value = 'Practice Prompts';
    sheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: brandColor.replace('#', '') } };
    
    // Practice prompts (from Python tool)
    const prompts = [
      "Increase return count by 10% — note the change in Net Income.",
      "Raise ANF by $5 — what happens to Net Margin %?",
      "Cost per Return is Yellow — which two expenses would you reduce first?",
      "Reduce Advertising by 2% — what is the trade‑off to returns?",
      "Compare Good vs Best — which is realistic for 2026 and why?",
    ];
    
    // Headers
    sheet.getCell('A3').value = 'Question';
    sheet.getCell('B3').value = 'Your notes';
    sheet.getCell('C3').value = 'Done?';
    
    ['A3', 'B3', 'C3'].forEach(cell => {
      sheet.getCell(cell).font = { name: 'Arial', bold: true };
    });
    
    // Practice questions
    let row = 4;
    prompts.forEach((prompt) => {
      sheet.getCell(`A${row}`).value = prompt;
      sheet.getCell(`B${row}`).value = ''; // User input area
      sheet.getCell(`C${row}`).value = { formula: `IF(LEN(B${row})>0,"✅","")` };
      row++;
    });
    
    // Completion tracking
    sheet.getCell('A20').value = 'Completed count';
    sheet.getCell('B20').value = { formula: 'COUNTIF(C4:C8,"✅")' };
    
    // Progress bar visualization
    sheet.getCell('E2').value = 'Practice Progress';
    sheet.getCell('E2').font = { name: 'Arial', bold: true };
    
    // Progress segments (F2:J2)
    for (let i = 0; i < 5; i++) {
      const col = String.fromCharCode(70 + i); // F, G, H, I, J
      const cell = sheet.getCell(`${col}2`);
      cell.value = '';
      cell.border = {
        top: { style: 'thin', color: { argb: 'DDDDDD' } },
        left: { style: 'thin', color: { argb: 'DDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'DDDDDD' } },
        right: { style: 'thin', color: { argb: 'DDDDDD' } }
      };
      
      // Conditional formatting rules would be applied here
      // (ExcelJS conditional formatting is more complex than openpyxl)
    }
    
    // Completion message
    sheet.getCell('A22').value = 'Status';
    sheet.getCell('B22').value = { formula: 'IF($B$20=5,"All practice questions complete! ✅","")' };
  }
  
  private buildProTipsSheet(sheet: any, brandColor: string): void {
    // Header
    sheet.getCell('A1').value = 'Automated Pro Tips';
    sheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: brandColor.replace('#', '') } };
    
    sheet.getCell('A3').value = 'Tip';
    sheet.getCell('A3').font = { name: 'Arial', bold: true };
    
    // Pro tips (from Python tool - would need to be adapted for ExcelJS formulas)
    const tips = [
      'Net Income is negative — review fixed costs and staffing levels.',
      'Net Margin is below caution — consider small ANF increase or reduce salaries %.',
      'Salaries exceed 30% of gross — consider part‑time staffing or schedule optimization.',
      'Rent above 20% of gross — evaluate space optimization or renegotiation.',
      'Cost/Return is high — check discounts %, supplies, and local advertising ROI.'
    ];
    
    let row = 4;
    tips.forEach((tip) => {
      sheet.getCell(`A${row}`).value = tip;
      row++;
    });
    
    // Set column width for readability
    sheet.getColumn('A').width = 120;
  }
  
  // Additional helper methods would be implemented here...
  private buildInputsSheet(sheet: any, answers: WizardAnswers, brandColor: string): void {
    // Implementation for inputs sheet
  }
  
  private buildResultsSheet(sheet: any, results: CalculationResults, green: string, yellow: string, red: string): void {
    // Implementation for results sheet with conditional formatting
  }
  
  private buildDashboardSheet(sheet: any, results: CalculationResults, brandColor: string, green: string, yellow: string, red: string): void {
    // Implementation for dashboard sheet with KPI visualization
  }
  
  private buildReportSheet(sheet: any, answers: WizardAnswers, results: CalculationResults, brandColor: string): void {
    // Implementation for summary report sheet
  }
}
