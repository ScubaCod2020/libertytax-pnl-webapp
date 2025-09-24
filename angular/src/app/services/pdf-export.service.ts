import { Injectable } from '@angular/core';
import { WizardAnswers } from '../domain/types/wizard.types';
import { CalculationResults } from '../domain/types/calculation.types';
import { getBrandForRegion } from '../lib/regional-branding';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  /**
   * Generate professional executive brief PDF from P&L data
   * Mirrors React WizardReview print-friendly formatting
   */
  async generateExecutiveBriefPDF(
    wizardAnswers: WizardAnswers,
    calculationResults: CalculationResults
  ): Promise<void> {
    
    // Dynamic import for better bundle size
    const jsPDF = await import('jspdf');
    const html2canvas = await import('html2canvas');
    
    // Create hidden container with document-style formatting
    const reportContainer = this.createDocumentStyleReport(wizardAnswers, calculationResults);
    
    // Temporarily add to DOM for rendering
    document.body.appendChild(reportContainer);
    
    try {
      // Capture with high quality
      const canvas = await html2canvas.default(reportContainer, {
        scale: 2, // High DPI for crisp text
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 816, // Letter width at 96 DPI
        height: 1056, // Letter height at 96 DPI
      });
      
      // Create PDF
      const pdf = new jsPDF.default({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 612; // Letter width in points
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Download PDF
      const fileName = `Liberty_Tax_PnL_Executive_Brief_${wizardAnswers.region}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } finally {
      // Clean up
      document.body.removeChild(reportContainer);
    }
  }

  /**
   * Alternative: Generate PDF using jsPDF's HTML rendering (better text quality)
   */
  async generateExecutiveBriefPDFFromHTML(
    wizardAnswers: WizardAnswers,
    calculationResults: CalculationResults
  ): Promise<void> {
    
    const jsPDF = await import('jspdf');
    require('jspdf-autotable'); // For better table formatting
    
    const brand = getBrandForRegion(wizardAnswers.region);
    const pdf = new jsPDF.default({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    });
    
    // Professional document styling
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 54; // 0.75 inch margins
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;
    
    // Header with brand logo (if available)
    pdf.setFontSize(18);
    pdf.setFont('times', 'bold');
    pdf.text('P&L Budget & Forecast Summary', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 30;
    
    // Regional branding
    pdf.setFontSize(12);
    pdf.setFont('times', 'normal');
    const regionText = wizardAnswers.region === 'CA' ? 'Liberty Tax Canada' : 'Liberty Tax Service';
    pdf.text(regionText, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Generation date
    pdf.setFontSize(10);
    const dateText = `Generated: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })}`;
    pdf.text(dateText, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 30;
    
    // Divider line
    pdf.setDrawColor(220, 38, 38); // Liberty red
    pdf.setLineWidth(2);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 25;
    
    // Key Performance Metrics Table
    pdf.setFontSize(14);
    pdf.setFont('times', 'bold');
    pdf.text('Key Performance Metrics', margin, yPosition);
    yPosition += 20;
    
    const kpiData = [
      ['Metric', 'Value', 'Status'],
      ['Net Income', this.formatCurrency(calculationResults.netIncome), this.getKPIStatus(calculationResults.netIncome, 'netIncome')],
      ['Net Margin %', `${calculationResults.netMarginPct.toFixed(1)}%`, this.getKPIStatus(calculationResults.netMarginPct, 'margin')],
      ['Cost per Return', this.formatCurrency(calculationResults.costPerReturn), this.getKPIStatus(calculationResults.costPerReturn, 'cpr')],
      ['Total Revenue', this.formatCurrency(calculationResults.totalRevenue), ''],
      ['Total Expenses', this.formatCurrency(calculationResults.totalExpenses), ''],
    ];
    
    (pdf as any).autoTable({
      startY: yPosition,
      head: [kpiData[0]],
      body: kpiData.slice(1),
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 10,
        cellPadding: 8,
      },
      headStyles: {
        fillColor: [248, 248, 248],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 120 },
        1: { halign: 'right', cellWidth: 100 },
        2: { halign: 'center', cellWidth: 80 },
      },
      margin: { left: margin, right: margin },
    });
    
    yPosition = (pdf as any).lastAutoTable.finalY + 25;
    
    // Revenue Breakdown
    pdf.setFontSize(14);
    pdf.setFont('times', 'bold');
    pdf.text('Revenue Breakdown', margin, yPosition);
    yPosition += 20;
    
    const revenueData = [
      ['Component', 'Amount', 'Percentage'],
      ['Gross Fees', this.formatCurrency(calculationResults.grossFees), '100.0%'],
      ['Less: Customer Discounts', `-${this.formatCurrency(calculationResults.discounts)}`, `(${wizardAnswers.discountsPct?.toFixed(1) || '0.0'}%)`],
      ['Tax-Prep Income', this.formatCurrency(calculationResults.taxPrepIncome), `${((calculationResults.taxPrepIncome / calculationResults.grossFees) * 100).toFixed(1)}%`],
      ['TaxRush Income', this.formatCurrency(calculationResults.taxRushIncome || 0), `${(((calculationResults.taxRushIncome || 0) / calculationResults.grossFees) * 100).toFixed(1)}%`],
      ['Other Income', this.formatCurrency(calculationResults.otherIncome || 0), `${(((calculationResults.otherIncome || 0) / calculationResults.grossFees) * 100).toFixed(1)}%`],
      ['Total Revenue', this.formatCurrency(calculationResults.totalRevenue), `${((calculationResults.totalRevenue / calculationResults.grossFees) * 100).toFixed(1)}%`],
    ];
    
    (pdf as any).autoTable({
      startY: yPosition,
      head: [revenueData[0]],
      body: revenueData.slice(1),
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 9,
        cellPadding: 6,
      },
      headStyles: {
        fillColor: [248, 248, 248],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 140 },
        1: { halign: 'right', cellWidth: 100 },
        2: { halign: 'right', cellWidth: 80 },
      },
      margin: { left: margin, right: margin },
    });
    
    yPosition = (pdf as any).lastAutoTable.finalY + 25;
    
    // Management Review Checklist
    if (yPosition > pageHeight - 200) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('times', 'bold');
    pdf.text('Management Review Checklist', margin, yPosition);
    yPosition += 20;
    
    const checklist = [
      '☐ Review expense categories for optimization opportunities',
      '☐ Validate return volume projections with marketing team',
      '☐ Assess pricing strategy and discount impact',
      '☐ Compare performance to industry benchmarks',
      '☐ Identify seasonal adjustment requirements',
      '☐ Plan staffing levels for projected volume',
    ];
    
    pdf.setFontSize(10);
    pdf.setFont('times', 'normal');
    checklist.forEach((item) => {
      pdf.text(item, margin + 10, yPosition);
      yPosition += 15;
    });
    
    // Footer
    yPosition = pageHeight - 40;
    pdf.setFontSize(8);
    pdf.setFont('times', 'italic');
    pdf.text('Confidential - For Internal Use Only', pageWidth / 2, yPosition, { align: 'center' });
    
    // Download
    const fileName = `Liberty_Tax_PnL_Executive_Brief_${wizardAnswers.region}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }

  private createDocumentStyleReport(
    wizardAnswers: WizardAnswers,
    calculationResults: CalculationResults
  ): HTMLElement {
    
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 816px;
      height: 1056px;
      background: white;
      font-family: "Times New Roman", serif;
      font-size: 12px;
      line-height: 1.4;
      color: black;
      padding: 54px;
      box-sizing: border-box;
    `;
    
    // Build HTML content matching React's print-friendly format
    container.innerHTML = this.buildReportHTML(wizardAnswers, calculationResults);
    
    return container;
  }

  private buildReportHTML(
    wizardAnswers: WizardAnswers,
    calculationResults: CalculationResults
  ): string {
    
    const brand = getBrandForRegion(wizardAnswers.region);
    const regionText = wizardAnswers.region === 'CA' ? 'Liberty Tax Canada' : 'Liberty Tax Service';
    
    return `
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #dc2626;">
        <h1 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #333;">
          P&L Budget & Forecast Summary
        </h1>
        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${regionText}</div>
        <div style="font-size: 10px; color: #666;">
          Generated: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>
      
      <!-- Key Metrics Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
        <thead>
          <tr style="background-color: #f8f8f8;">
            <th style="border: 1px solid #333; padding: 8px; text-align: left; font-weight: bold;">Metric</th>
            <th style="border: 1px solid #333; padding: 8px; text-align: right; font-weight: bold;">Value</th>
            <th style="border: 1px solid #333; padding: 8px; text-align: center; font-weight: bold;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #333; padding: 6px; font-weight: bold;">Net Income</td>
            <td style="border: 1px solid #333; padding: 6px; text-align: right;">${this.formatCurrency(calculationResults.netIncome)}</td>
            <td style="border: 1px solid #333; padding: 6px; text-align: center;">${this.getKPIStatus(calculationResults.netIncome, 'netIncome')}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #333; padding: 6px; font-weight: bold;">Net Margin %</td>
            <td style="border: 1px solid #333; padding: 6px; text-align: right;">${calculationResults.netMarginPct.toFixed(1)}%</td>
            <td style="border: 1px solid #333; padding: 6px; text-align: center;">${this.getKPIStatus(calculationResults.netMarginPct, 'margin')}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #333; padding: 6px; font-weight: bold;">Cost per Return</td>
            <td style="border: 1px solid #333; padding: 6px; text-align: right;">${this.formatCurrency(calculationResults.costPerReturn)}</td>
            <td style="border: 1px solid #333; padding: 6px; text-align: center;">${this.getKPIStatus(calculationResults.costPerReturn, 'cpr')}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Management Review Checklist -->
      <div style="margin-top: 24px;">
        <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 12px;">Management Review Checklist</h3>
        <ul style="font-size: 10px; line-height: 1.6; padding-left: 20px;">
          <li>Review expense categories for optimization opportunities</li>
          <li>Validate return volume projections with marketing team</li>
          <li>Assess pricing strategy and discount impact</li>
          <li>Compare performance to industry benchmarks</li>
          <li>Identify seasonal adjustment requirements</li>
          <li>Plan staffing levels for projected volume</li>
        </ul>
      </div>
      
      <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 8px; font-style: italic; color: #666;">
        Confidential - For Internal Use Only
      </div>
    `;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  private getKPIStatus(value: number, type: 'netIncome' | 'margin' | 'cpr'): string {
    // Simplified KPI status logic
    switch (type) {
      case 'netIncome':
        return value >= 50000 ? '🟢 Good' : value >= 0 ? '🟡 Fair' : '🔴 Poor';
      case 'margin':
        return value >= 20 ? '🟢 Good' : value >= 15 ? '🟡 Fair' : '🔴 Poor';
      case 'cpr':
        return value <= 25 ? '🟢 Good' : value <= 35 ? '🟡 Fair' : '🔴 Poor';
      default:
        return '';
    }
  }
}
