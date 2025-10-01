import { Injectable } from '@angular/core';
import { WizardAnswers } from '../domain/types/wizard.types';
import { CalculationResults } from '../domain/types/calculation.types';

@Injectable({
  providedIn: 'root',
})
export class PDFExportService {
  /**
   * Generate professional executive brief PDF from P&L data
   * TODO: Install jspdf and html2canvas packages to enable this feature
   */
  async generateExecutiveBriefPDF(
    wizardAnswers: WizardAnswers,
    calculationResults: CalculationResults
  ): Promise<void> {
    throw new Error(
      'PDF export not available. Install jspdf and html2canvas packages to enable this feature.'
    );
  }

  /**
   * Alternative PDF generation using HTML to PDF conversion
   * TODO: Install jspdf package to enable this feature
   */
  async generateExecutiveBriefPDFFromHTML(
    wizardAnswers: WizardAnswers,
    calculationResults: CalculationResults
  ): Promise<void> {
    throw new Error('PDF export not available. Install jspdf package to enable this feature.');
  }
}
