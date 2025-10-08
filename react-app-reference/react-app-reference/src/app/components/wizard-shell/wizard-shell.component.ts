import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Region, WizardAnswers, WizardStep } from '../../models/wizard.models';
import { PersistenceService } from '../../services/persistence.service';
import { IncomeDriversComponent } from '../income-drivers/income-drivers.component';
import { PriorYearPerformanceComponent, PriorYearData, PriorYearMetrics } from '../prior-year-performance/prior-year-performance.component';

@Component({
  selector: 'app-wizard-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, IncomeDriversComponent, PriorYearPerformanceComponent],
  templateUrl: './wizard-shell.component.html',
  styleUrls: ['./wizard-shell.component.scss']
})
export class WizardShellComponent implements OnInit, OnChanges {
  @Input() region: Region = 'US';
  @Input() persistence?: PersistenceService;
  @Input() resetTrigger: number = 0; // This will trigger reset when changed

  @Output() setRegion = new EventEmitter<Region>();
  @Output() wizardComplete = new EventEmitter<WizardAnswers>();
  @Output() wizardCancel = new EventEmitter<void>();

  currentStep: WizardStep = 'welcome';
  answers: WizardAnswers = {
    region: 'US',
    storeType: undefined, // This should be undefined to show "Select store type..."
    handlesTaxRush: false,
    hasOtherIncome: false,
    avgNetFee: 125,
    taxPrepReturns: 1600,
    discountsPct: 3,
    otherIncome: 0,
    taxRushReturns: 0,
    taxRushPercentage: 15,
    taxRushFee: 0
  };

  // Prior year data for existing stores
  priorYearData: PriorYearData = {};
  priorYearMetrics: PriorYearMetrics = {
    taxPrepIncome: 0,
    totalRevenue: 0,
    netIncome: 0,
    discountsPct: 0,
    taxRushIncome: 0
  };


  ngOnInit(): void {
    console.log('🚀 WIZARD INIT - Starting component initialization');
    console.log('📊 Initial answers state:', JSON.stringify(this.answers, null, 2));
    
    // Load saved answers if available
    if (this.persistence) {
      const savedAnswers = this.persistence.loadWizardAnswers();
      console.log('💾 Persistence service available, saved answers:', savedAnswers);
      if (savedAnswers) {
        console.log('🧙‍♂️ Loading saved wizard answers:', savedAnswers);
        this.answers = { ...this.answers, ...savedAnswers };
        console.log('📊 Answers after loading saved data:', JSON.stringify(this.answers, null, 2));
      } else {
        console.log('💾 No saved answers found, using defaults');
      }
    } else {
      console.log('💾 No persistence service available');
    }
    
    // Initialize calculated fields on component load
    console.log('🧮 Updating calculated fields...');
    this.updateCalculatedFields();
    
    // Force validation check on load
    this.debugValidation('INIT - After component load');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 ONCHANGES - Detected changes:', changes);
    if (changes['resetTrigger']) {
      console.log('🔄 Reset triggered from parent - resetTrigger changed from', changes['resetTrigger'].previousValue, 'to', changes['resetTrigger'].currentValue);
      this.resetToDefaults();
    }
  }

  onRegionChange(value: Region): void {
    console.log('🐛 Region changed:', value);
    this.answers.region = value;
    this.setRegion.emit(value);
    this.updateCalculatedFields();
  }

  onStoreTypeChange(value: string): void {
    console.log('🏪 STORE TYPE CHANGE - New value:', value);
    console.log('📊 Answers before store type change:', JSON.stringify(this.answers, null, 2));
    
    this.answers.storeType = value as 'new' | 'existing';
    this.userInteracted.add('storeType');
    
    console.log('📊 Answers after store type change:', JSON.stringify(this.answers, null, 2));
    
    // If store type is cleared, reset to defaults
    if (!value) {
      console.log('🔄 Store type cleared, resetting to defaults');
      this.resetToDefaults();
    } else {
      console.log('✅ Store type selected, updating calculations only');
      this.updateCalculatedFields();
      this.debugValidation('STORE TYPE CHANGE - After store type selection');
    }
  }


  onTaxRushChange(value: boolean): void {
    console.log('🐛 TaxRush changed:', value);
    this.answers.handlesTaxRush = value;
    this.updateCalculatedFields();
  }

  onTaxRushReturnsChange(value: number): void {
    console.log('🐛 TaxRush Returns changed:', value);
    this.answers.taxRushReturns = value;
    this.userInteracted.add('taxRushReturns');
    
    // Auto-calculate percentage if returns are manually entered
    if (value && this.answers.taxPrepReturns) {
      this.answers.taxRushPercentage = (value / this.answers.taxPrepReturns) * 100;
      console.log('🐛 Auto-calculated TaxRush percentage:', this.answers.taxRushPercentage);
    }
    
    this.updateCalculatedFields();
  }

  onTaxRushPercentageChange(value: number): void {
    console.log('🐛 TaxRush Percentage changed:', value);
    // Round to nearest 0.1% (one decimal place)
    this.answers.taxRushPercentage = Math.round(value * 10) / 10;
    
    // Auto-calculate returns if percentage is manually entered
    if (this.answers.taxRushPercentage && this.answers.taxPrepReturns) {
      this.answers.taxRushReturns = Math.round((this.answers.taxPrepReturns * this.answers.taxRushPercentage) / 100);
      console.log('🐛 Auto-calculated TaxRush returns:', this.answers.taxRushReturns);
    }
    
    this.updateCalculatedFields();
  }

  onOtherIncomeChange(value: boolean): void {
    console.log('🐛 Other income changed:', value);
    this.answers.hasOtherIncome = value;
    this.updateCalculatedFields();
  }

  onFieldChange(field: string, value: any): void {
    console.log('🐛 Field changed:', field, '=', value);
    (this.answers as any)[field] = value;
    this.userInteracted.add(field);
    console.log('👆 Added to userInteracted:', field, 'Set now contains:', Array.from(this.userInteracted));
    
    // Auto-calculate related fields when key fields change
    if (field === 'avgNetFee' || field === 'taxPrepReturns' || field === 'taxRushFee' || field === 'taxRushReturns' || field === 'taxRushPercentage') {
      this.updateCalculatedFields();
    }
    
    // Reset total expenses to auto-calculate when key fields change
    if (field === 'avgNetFee' || field === 'taxPrepReturns' || field === 'taxRushFee' || field === 'taxRushReturns' || field === 'taxRushPercentage') {
      this.answers.totalExpenses = undefined; // Reset to trigger auto-calculation
    }
    
    this.debugValidation(`FIELD CHANGE - After ${field} change`);
  }

  onFieldInteraction(fieldName: string): void {
    console.log('👆 User interacted with field:', fieldName);
    this.userInteracted.add(fieldName);
    this.debugValidation(`FIELD INTERACTION - After ${fieldName} interaction`);
  }

  // Income Drivers Component integration
  getIncomeDriverData(): any {
    return {
      avgNetFee: this.answers.avgNetFee || 125,
      taxPrepReturns: this.answers.taxPrepReturns || 1600,
      taxRushReturns: this.answers.taxRushReturns || 0,
      discountsPct: this.answers.discountsPct || 3,
      otherIncome: this.answers.otherIncome || 0,
      handlesTaxRush: this.answers.handlesTaxRush || false,
      hasOtherIncome: this.answers.hasOtherIncome || false
    };
  }

  onIncomeDriverChange(data: any): void {
    console.log('💰 Income driver data changed:', data);
    
    // Update wizard answers with data from IncomeDriversComponent
    this.answers.avgNetFee = data.avgNetFee;
    this.answers.taxPrepReturns = data.taxPrepReturns;
    this.answers.taxRushReturns = data.taxRushReturns;
    this.answers.discountsPct = data.discountsPct;
    this.answers.otherIncome = data.otherIncome;
    
    // Mark fields as user-interacted
    ['avgNetFee', 'taxPrepReturns', 'taxRushReturns', 'discountsPct', 'otherIncome'].forEach(field => {
      this.userInteracted.add(field);
    });

    this.updateCalculatedFields();
    this.debugValidation('INCOME DRIVER CHANGE - After income driver update');
  }

  onIncomeCalculatedValues(calculatedValues: any): void {
    console.log('📊 Income calculated values updated:', calculatedValues);
    
    // The calculated values are now computed by getters based on this.answers
    // No assignment needed since getters handle the calculations
    console.log('📊 Current calculated gross fees:', this.calculatedGrossTaxPrepFees);
    console.log('📊 Current calculated net fees:', this.calculatedNetTaxPrepFees);
    console.log('📊 Current calculated rush fees:', this.calculatedGrossTaxRushFees);
  }

  isUserInteracted(fieldName: string): boolean {
    return this.userInteracted.has(fieldName);
  }

  private updateCalculatedFields(): void {
    // Auto-calculate discount amount if percentage is set but amount is not
    if (this.answers.discountsPct && !this.answers.discountsAmt && this.answers.avgNetFee && this.answers.taxPrepReturns) {
      this.answers.discountsAmt = this.calculatedGrossTaxPrepFees * (this.answers.discountsPct / 100);
      console.log('🐛 Auto-calculated discount amount:', this.answers.discountsAmt);
    }
    
    // Auto-calculate discount percentage if amount is set but percentage is not
    if (this.answers.discountsAmt && !this.answers.discountsPct && this.answers.avgNetFee && this.answers.taxPrepReturns) {
      this.answers.discountsPct = (this.answers.discountsAmt / this.calculatedGrossTaxPrepFees) * 100;
      console.log('🐛 Auto-calculated discount percentage:', this.answers.discountsPct);
    }
    
    // Auto-calculate TaxRush Returns based on percentage
    if (this.answers.region === 'CA' && this.answers.handlesTaxRush && this.answers.taxPrepReturns) {
      this.answers.taxRushReturns = this.calculatedTaxRushReturns;
      console.log('🐛 Auto-calculated TaxRush Returns:', this.answers.taxRushReturns, 'from percentage:', this.answers.taxRushPercentage);
    }
    
    // Auto-calculate total expenses using new formula: 76% of (Net Tax Prep Fees + Gross TaxRush Fees)
    // Only auto-calculate if user hasn't manually entered a value
    if (this.answers.avgNetFee && this.answers.taxPrepReturns && !this.answers.totalExpenses) {
      const netTaxPrepFees = this.calculatedNetTaxPrepFees;
      const grossTaxRushFees = this.calculatedGrossTaxRushFees;
      this.answers.totalExpenses = (netTaxPrepFees + grossTaxRushFees) * 0.76;
      console.log('🐛 Auto-calculated total expenses (new formula):', this.answers.totalExpenses, 'netTaxPrepFees:', netTaxPrepFees, 'grossTaxRushFees:', grossTaxRushFees);
    }
  }

  onDiscountAmountChange(value: number): void {
    console.log('🐛 Discount amount changed:', value);
    this.answers.discountsAmt = Math.round(value * 100) / 100; // Round to nearest cent
    if (this.answers.avgNetFee && this.answers.taxPrepReturns) {
      this.answers.discountsPct = Math.round(((this.answers.discountsAmt / (this.answers.avgNetFee * this.answers.taxPrepReturns)) * 100) * 10) / 10; // Round to nearest tenth
      console.log('🐛 Auto-calculated discount percentage:', this.answers.discountsPct);
    }
    this.updateCalculatedFields();
  }

  onDiscountPercentageChange(value: number): void {
    console.log('🐛 Discount percentage changed:', value);
    this.answers.discountsPct = Math.round(value * 10) / 10; // Round to nearest tenth
    if (this.answers.avgNetFee && this.answers.taxPrepReturns) {
      this.answers.discountsAmt = Math.round(((this.answers.avgNetFee * this.answers.taxPrepReturns) * (this.answers.discountsPct / 100)) * 100) / 100; // Round to nearest cent
      console.log('🐛 Auto-calculated discount amount:', this.answers.discountsAmt);
    }
    this.updateCalculatedFields();
  }

  onResetData(): void {
    console.log('🔄 RESET DATA BUTTON - Starting full reset');
    this.resetToDefaults();
  }

  onCancel(): void {
    console.log('❌ CANCEL BUTTON - Cancelling wizard');
    this.wizardCancel.emit();
  }

  onNext(): void {
    console.log('➡️ NEXT BUTTON - Proceeding to next step');
    this.goToStep('inputs');
  }

  goToStep(step: WizardStep): void {
    this.currentStep = step;
  }

  onComplete(): void {
    console.log('🐛 Complete clicked');
    this.wizardComplete.emit(this.answers);
  }


  get calculatedGrossTaxPrepFees(): number {
    // Use user-entered value if available, otherwise calculate
    if (this.answers.grossTaxPrepFees !== undefined && this.answers.grossTaxPrepFees !== null) {
      return this.answers.grossTaxPrepFees;
    }
    
    // For Canada with TaxRush: (Tax Prep Returns - TaxRush Returns) × Average Net Fee
    if (this.answers.region === 'CA' && this.answers.handlesTaxRush) {
      const taxPrepReturns = this.answers.taxPrepReturns ?? 0;
      const taxRushReturns = this.calculatedTaxRushReturns;
      const avgNetFee = this.answers.avgNetFee ?? 0;
      const result = (taxPrepReturns - taxRushReturns) * avgNetFee;
      console.log('🐛 Calculated gross tax prep fees (Canada with TaxRush):', result, 'taxPrepReturns:', taxPrepReturns, 'taxRushReturns:', taxRushReturns, 'avgNetFee:', avgNetFee);
      return result;
    }
    
    // For US or Canada without TaxRush: Average Net Fee × Tax Prep Returns
    const result = (this.answers.avgNetFee || 0) * (this.answers.taxPrepReturns || 0);
    console.log('🐛 Calculated gross tax prep fees (standard):', result);
    return result;
  }

  get calculatedNetTaxPrepFees(): number {
    // Use user-entered value if available, otherwise calculate
    if (this.answers.netTaxPrepFees !== undefined && this.answers.netTaxPrepFees !== null) {
      return this.answers.netTaxPrepFees;
    }
    const grossFees = this.calculatedGrossTaxPrepFees;
    const discountAmount = this.answers.discountsAmt || (grossFees * (this.answers.discountsPct || 3) / 100);
    const result = grossFees - discountAmount;
    console.log('🐛 Calculated net tax prep fees:', result, 'gross:', grossFees, 'discount:', discountAmount);
    return result;
  }

  get calculatedTotalRevenue(): number {
    const netTaxPrepFees = this.calculatedNetTaxPrepFees;
    const otherIncome = this.answers.hasOtherIncome ? (this.answers.otherIncome || 0) : 0;
    const result = netTaxPrepFees + otherIncome;
    console.log('🐛 Calculated total revenue:', result, 'netTaxPrep:', netTaxPrepFees, 'otherIncome:', otherIncome);
    return result;
  }

  get calculatedTaxRushReturns(): number {
    const taxPrepReturns = this.answers.taxPrepReturns ?? 0;
    const percentage = this.answers.taxRushPercentage ?? 15;
    return Math.round(taxPrepReturns * (percentage / 100));
  }

  get calculatedGrossTaxRushFees(): number {
    const taxRushReturns = this.answers.taxRushReturns ?? 0;
    const taxRushFee = this.answers.taxRushFee ?? 0;
    return taxRushReturns * taxRushFee;
  }

  get calculatedTotalExpenses(): number {
    const netTaxPrepFees = this.calculatedNetTaxPrepFees;
    const grossTaxRushFees = this.calculatedGrossTaxRushFees;
    return (netTaxPrepFees + grossTaxRushFees) * 0.76;
  }

  get calculatedNetIncome(): number {
    const netTaxPrepFees = this.calculatedNetTaxPrepFees;
    const otherIncome = this.answers.hasOtherIncome ? (this.answers.otherIncome ?? 0) : 0;
    const grossTaxRushFees = this.calculatedGrossTaxRushFees;
    const totalRevenue = netTaxPrepFees + otherIncome + grossTaxRushFees;
    
    // Total Expenses = 76% of (Net Tax Prep Fees + Gross TaxRush Fees)
    const expenses = this.answers.totalExpenses || ((netTaxPrepFees + grossTaxRushFees) * 0.76);
    
    const result = totalRevenue - expenses;
    console.log('🐛 Calculated net income:', result, 'revenue:', totalRevenue, 'expenses:', expenses, 'netTaxPrepFees:', netTaxPrepFees, 'otherIncome:', otherIncome, 'grossTaxRushFees:', grossTaxRushFees);
    return result;
  }

  get calculatedNetMargin(): number {
    const totalRevenue = this.calculatedTotalRevenue;
    if (totalRevenue === 0) return 0;
    const result = (this.calculatedNetIncome / totalRevenue) * 100;
    console.log('🐛 Calculated net margin:', result);
    return Math.round(result);
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null || isNaN(value)) {
      return '$0';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true
    }).format(value);
  }

  // Debug validation method
  debugValidation(context: string): void {
    console.log(`🔍 VALIDATION DEBUG [${context}]:`);
    console.log('📊 Current answers state:', JSON.stringify(this.answers, null, 2));
    console.log('👆 User interacted fields:', Array.from(this.userInteracted));
    
    const storeTypeValid = this.isFieldValid('storeType');
    const taxPrepValid = this.isFieldValid('taxPrepReturns');
    const avgNetFeeValid = this.isFieldValid('avgNetFee');
    const otherIncomeValid = this.isFieldValid('otherIncome');
    const formValid = this.isFormValid();
    
    console.log('✅ Field validation results:');
    console.log(`  - storeType: ${storeTypeValid} (value: "${this.answers.storeType}", interacted: ${this.userInteracted.has('storeType')})`);
    console.log(`  - taxPrepReturns: ${taxPrepValid} (value: ${this.answers.taxPrepReturns}, interacted: ${this.userInteracted.has('taxPrepReturns')})`);
    console.log(`  - avgNetFee: ${avgNetFeeValid} (value: ${this.answers.avgNetFee}, interacted: ${this.userInteracted.has('avgNetFee')})`);
    console.log(`  - otherIncome: ${otherIncomeValid} (value: ${this.answers.otherIncome}, hasOtherIncome: ${this.answers.hasOtherIncome}, interacted: ${this.userInteracted.has('otherIncome')})`);
    console.log(`  - Overall form valid: ${formValid}`);
    console.log('---');
  }

  // Track if user has interacted with fields
  private userInteracted: Set<string> = new Set();

  // Validation methods
  isFieldValid(fieldName: string): boolean {
    // If user hasn't interacted with the field, consider it invalid for visual feedback
    if (!this.userInteracted.has(fieldName)) {
      return false;
    }

    switch (fieldName) {
      case 'storeType':
        return this.answers.storeType !== undefined && this.answers.storeType !== null;
      case 'taxPrepReturns':
        return this.answers.taxPrepReturns !== undefined && this.answers.taxPrepReturns !== null && this.answers.taxPrepReturns > 0;
      case 'avgNetFee':
        return this.answers.avgNetFee !== undefined && this.answers.avgNetFee !== null && this.answers.avgNetFee > 0;
      case 'otherIncome':
        return !this.answers.hasOtherIncome || (this.answers.otherIncome !== undefined && this.answers.otherIncome !== null && this.answers.otherIncome > 0);
      case 'taxRushReturns':
        return !this.answers.handlesTaxRush || (this.answers.taxRushReturns !== undefined && this.answers.taxRushReturns !== null && this.answers.taxRushReturns > 0);
      case 'taxRushFee':
        return !this.answers.handlesTaxRush || (this.answers.taxRushFee !== undefined && this.answers.taxRushFee !== null && this.answers.taxRushFee > 0);
      default:
        return true;
    }
  }

  isFormValid(): boolean {
    const storeTypeValid = this.isFieldValid('storeType');
    const baseValid = this.isFieldValid('taxPrepReturns') && this.isFieldValid('avgNetFee');
    
    // Only validate other income if user selected "Yes" for additional revenue streams
    const otherIncomeValid = !this.answers.hasOtherIncome || this.isFieldValid('otherIncome');
    
    // Only validate TaxRush fields if user is in Canada and selected "Yes" for TaxRush
    const taxRushValid = !(this.answers.region === 'CA' && this.answers.handlesTaxRush) || 
                        (this.isFieldValid('taxRushReturns') && this.isFieldValid('taxRushFee'));
    
    console.log('🔍 FORM VALIDATION BREAKDOWN:');
    console.log('  - storeTypeValid:', storeTypeValid);
    console.log('  - baseValid:', baseValid);
    console.log('  - otherIncomeValid:', otherIncomeValid, '(hasOtherIncome:', this.answers.hasOtherIncome, ')');
    console.log('  - taxRushValid:', taxRushValid, '(region:', this.answers.region, ', handlesTaxRush:', this.answers.handlesTaxRush, ')');
    
    return storeTypeValid && baseValid && otherIncomeValid && taxRushValid;
  }

  // Reset methods
  resetToDefaults(): void {
    console.log('🔄 RESET TO DEFAULTS - Starting full reset');
    console.log('📊 Answers before reset:', JSON.stringify(this.answers, null, 2));
    
    this.answers = {
      region: 'US',
      storeType: undefined,
      handlesTaxRush: false,
      hasOtherIncome: false,
      avgNetFee: 125,
      taxPrepReturns: 1600,
      discountsPct: 3,
      otherIncome: 0,
      taxRushReturns: 0,
      taxRushPercentage: 15,
      taxRushFee: 0
    };
    
    // Clear user interaction tracking
    this.userInteracted.clear();
    
    console.log('📊 Answers after reset:', JSON.stringify(this.answers, null, 2));
    this.updateCalculatedFields();
    
    this.debugValidation('RESET TO DEFAULTS - After reset');
  }

  resetTargetPerformance(): void {
    console.log('🔄 RESET TARGET PERFORMANCE - Starting strategic reset');
    console.log('📊 Answers before strategic reset:', JSON.stringify(this.answers, null, 2));
    
    // Reset only the target performance fields - don't clear calculated fields
    this.answers.avgNetFee = 125;
    this.answers.taxPrepReturns = 1600;
    this.answers.discountsPct = 3;
    this.answers.otherIncome = 0;
    
    // Clear user interaction tracking for these fields to show red borders
    this.userInteracted.delete('taxPrepReturns');
    this.userInteracted.delete('avgNetFee');
    this.userInteracted.delete('otherIncome');
    
    console.log('📊 Answers after strategic reset:', JSON.stringify(this.answers, null, 2));
    this.updateCalculatedFields();
    
    this.debugValidation('RESET TARGET PERFORMANCE - After strategic reset');
  }

  canProceed(): boolean {
    console.log('🔍 CAN PROCEED CHECK:');
    console.log('  - Store type:', this.answers.storeType);
    console.log('  - User interacted fields:', Array.from(this.userInteracted));
    
    // Must have store type selected
    if (!this.answers.storeType) {
      console.log('  ❌ No store type selected');
      return false;
    }
    
    // Must have all required fields filled
    const formValid = this.isFormValid();
    console.log('  - Form valid:', formValid);
    
    if (!formValid) {
      console.log('  ❌ Form validation failed');
      this.debugValidation('CAN PROCEED - Form validation failed');
    }
    
    return formValid;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatCurrencyValue(value: number): string {
    // Format currency value without $ symbol (for input placeholders)
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Prior year data handlers for existing stores
  onPriorYearDataChange(data: PriorYearData): void {
    console.log('📊 Prior year data changed:', data);
    this.priorYearData = data;
    
    // Merge prior year data into wizard answers for persistence
    Object.assign(this.answers, data);
    
    // Save to persistence if available
    if (this.persistence) {
      console.log('💾 Saving wizard answers with prior year data');
      this.persistence.saveWizardAnswers(this.answers);
    }
  }

  onPriorYearMetricsChange(metrics: PriorYearMetrics): void {
    console.log('📈 Prior year metrics updated:', metrics);
    this.priorYearMetrics = metrics;
  }
}