import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { RegionCode } from '../tokens/region-configs.token';
import type { WizardAnswers } from '../../domain/types/wizard.types';
import { BiDirService } from './bidir/bidir.service';
import { ProjectedService } from '../../services/projected.service';

export type StoreType = 'new' | 'existing';

export interface WizardSelections {
  region: RegionCode;
  storeType: StoreType;
  handlesTaxRush: boolean;
  hasOtherIncome: boolean;
  localAvgRent?: number;
  sqft?: number;
}

const STORAGE_KEY = 'wizard_state_v1';

@Injectable({ providedIn: 'root' })
export class WizardStateService {
  private readonly _answers$ = new BehaviorSubject<WizardAnswers>(this.loadFromStorage());
  readonly answers$ = this._answers$.asObservable();

  private selections: WizardSelections = {
    region: 'US',
    storeType: 'new',
    handlesTaxRush: false,
    hasOtherIncome: false,
  };

  constructor(
    private readonly bidir: BiDirService,
    private readonly projectedService: ProjectedService
  ) {
    // Subscribe to ProjectedService changes to trigger recalculation
    this.projectedService.targets$.subscribe(() => {
      console.log('🚀 [PROJECTED] Targets changed, recalculating...');
      this.calculateDerivedValues(this.answers);
      this.saveToStorage(this.answers);
    });

    this.projectedService.growthPct$.subscribe(() => {
      console.log('🚀 [PROJECTED] Growth percentage changed, recalculating...');
      this.calculateDerivedValues(this.answers);
      this.saveToStorage(this.answers);
    });
  }

  get answers(): WizardAnswers {
    return this._answers$.getValue();
  }

  // ============================================================================
  // COMPUTED PROPERTIES SYSTEM WITH COMPREHENSIVE DEBUGGING
  // ============================================================================
  // These methods provide clean, semantic access to values regardless of
  // Quick Start Wizard configuration. This abstracts away all the complexity
  // of different store types, regions, and other wizard settings.

  private debugEnabled = true; // Set to false to disable debugging in production

  private debugComputedProperty(methodName: string, result: any, context: any = {}) {
    if (!this.debugEnabled) return;

    const config = this.getWizardConfiguration();
    console.log(`🧮 [COMPUTED] ${methodName}():`, {
      result,
      wizardConfig: config,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Enable or disable computed properties debugging
   */
  setDebugMode(enabled: boolean): void {
    this.debugEnabled = enabled;
    console.log(`🧮 [COMPUTED] Debug mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Get a comprehensive summary of all computed properties
   * Useful for debugging and validation
   */
  getComputedPropertiesSummary(): any {
    const summary = {
      wizardConfiguration: this.getWizardConfiguration(),
      computedValues: {
        taxPrepIncome: this.getTaxPrepIncome(),
        taxPrepReturns: this.getTaxPrepReturns(),
        avgNetFee: this.getAvgNetFee(),
        grossFees: this.getGrossFees(),
        discountsPct: this.getDiscountsPct(),
        discountsAmt: this.getDiscountsAmt(),
        otherIncome: this.getOtherIncome(),
        taxRushReturns: this.getTaxRushReturns(),
        taxRushGrossFees: this.getTaxRushGrossFees(),
      },
      displayLabels: {
        storeTypeTitle: this.getDisplayLabel('storeTypeTitle'),
        revenueBreakdownTitle: this.getDisplayLabel('revenueBreakdownTitle'),
        grossPerReturnTitle: this.getDisplayLabel('grossPerReturnTitle'),
        regionName: this.getDisplayLabel('regionName'),
        storeTypeName: this.getDisplayLabel('storeTypeName'),
      },
      rawAnswers: {
        storeType: this.answers.storeType,
        region: this.answers.region,
        hasOtherIncome: this.answers.hasOtherIncome,
        handlesTaxRush: this.answers.handlesTaxRush,
        projectedTaxPrepReturns: this.answers.projectedTaxPrepReturns,
        avgNetFee: this.answers.avgNetFee,
        projectedAvgNetFee: this.answers.projectedAvgNetFee,
        projectedGrossFees: this.answers.projectedGrossFees,
        projectedTaxPrepIncome: this.answers.projectedTaxPrepIncome,
      },
    };

    console.log('🧮 [COMPUTED] COMPREHENSIVE SUMMARY:', summary);
    return summary;
  }

  private getWizardConfiguration() {
    return {
      storeType: this.answers.storeType || 'new',
      region: this.answers.region || 'US',
      hasOtherIncome: this.answers.hasOtherIncome || false,
      handlesTaxRush: this.answers.handlesTaxRush || false,
      isExisting: this.isExistingStore(),
      isNewStore: this.isNewStore(),
      isUS: this.isUSRegion(),
      isCanada: this.isCanadaRegion(),
      hasTaxRush: this.hasTaxRush(),
      hasOtherIncomeEnabled: this.hasOtherIncome(),
    };
  }

  // Core Business Values - Abstract away store type complexity
  getTaxPrepIncome(): number {
    const answers = this.answers;
    let result: number;
    let calculationPath: string;

    if (this.isExistingStore()) {
      result = answers.projectedTaxPrepIncome || 0;
      calculationPath = 'existing_store_projected';
      this.debugComputedProperty('getTaxPrepIncome', result, {
        path: calculationPath,
        sourceField: 'projectedTaxPrepIncome',
        sourceValue: answers.projectedTaxPrepIncome,
        fallbackUsed: !answers.projectedTaxPrepIncome,
      });
    } else {
      // For new stores, calculate from current values
      const grossFees = this.getGrossFees();
      const discountAmt = this.getDiscountsAmt();
      result = grossFees - discountAmt;
      calculationPath = 'new_store_calculated';
      this.debugComputedProperty('getTaxPrepIncome', result, {
        path: calculationPath,
        calculation: `${grossFees} - ${discountAmt} = ${result}`,
        grossFees,
        discountAmt,
      });
    }

    return result;
  }

  getTaxPrepReturns(): number {
    const answers = this.answers;
    let result: number;
    let sourceField: string;

    if (this.isExistingStore()) {
      result = answers.projectedTaxPrepReturns || 0;
      sourceField = 'projectedTaxPrepReturns';
    } else {
      result = answers.projectedTaxPrepReturns || 0; // New stores use target values
      sourceField = 'projectedTaxPrepReturns (target)';
    }

    this.debugComputedProperty('getTaxPrepReturns', result, {
      sourceField,
      sourceValue: answers.projectedTaxPrepReturns,
      fallbackUsed: !answers.projectedTaxPrepReturns,
    });

    return result;
  }

  getAvgNetFee(): number {
    const answers = this.answers;
    let result: number;
    let sourceField: string;

    if (this.isExistingStore()) {
      result = answers.projectedAvgNetFee || 0;
      sourceField = 'projectedAvgNetFee';
    } else {
      result = answers.avgNetFee || 0; // New stores use current target values
      sourceField = 'avgNetFee (target)';
    }

    this.debugComputedProperty('getAvgNetFee', result, {
      sourceField,
      sourceValue: this.isExistingStore() ? answers.projectedAvgNetFee : answers.avgNetFee,
      fallbackUsed: result === 0,
    });

    return result;
  }

  getGrossFees(): number {
    const answers = this.answers;
    let result: number;
    let calculationMethod: string;

    if (this.isExistingStore()) {
      result = answers.projectedGrossFees || 0;
      calculationMethod = 'direct_field';
      this.debugComputedProperty('getGrossFees', result, {
        method: calculationMethod,
        sourceField: 'projectedGrossFees',
        sourceValue: answers.projectedGrossFees,
        fallbackUsed: !answers.projectedGrossFees,
      });
    } else {
      const returns = this.getTaxPrepReturns();
      const avgNetFee = this.getAvgNetFee();
      result = returns * avgNetFee;
      calculationMethod = 'calculated';
      this.debugComputedProperty('getGrossFees', result, {
        method: calculationMethod,
        calculation: `${returns} × ${avgNetFee} = ${result}`,
        returns,
        avgNetFee,
      });
    }

    return result;
  }

  getDiscountsPct(): number {
    const answers = this.answers;
    if (this.isExistingStore()) {
      return answers.projectedDiscountsPct || 0;
    } else {
      return answers.discountsPct || 0;
    }
  }

  getDiscountsAmt(): number {
    const answers = this.answers;
    if (this.isExistingStore()) {
      return answers.projectedDiscountsAmt || 0;
    } else {
      return answers.discountsAmt || 0;
    }
  }

  getOtherIncome(): number {
    const answers = this.answers;
    // Other income depends on hasOtherIncome setting
    if (!this.hasOtherIncome()) {
      return 0;
    }

    if (this.isExistingStore()) {
      return answers.projectedOtherIncome || 0;
    } else {
      return answers.otherIncome || 0;
    }
  }

  // TaxRush Values - Abstract away region and taxRush settings
  getTaxRushReturns(): number {
    const answers = this.answers;
    if (!this.hasTaxRush()) {
      return 0;
    }

    if (this.isExistingStore()) {
      return answers.projectedTaxRushReturns || 0;
    } else {
      return answers.taxRushReturns || 0;
    }
  }

  getTaxRushGrossFees(): number {
    const answers = this.answers;
    if (!this.hasTaxRush()) {
      return 0;
    }

    if (this.isExistingStore()) {
      return answers.projectedTaxRushGrossFees || 0;
    } else {
      return answers.taxRushGrossFees || 0;
    }
  }

  // ============================================================================
  // QUICK START WIZARD STATE ACCESSORS
  // ============================================================================
  // These provide clean access to wizard configuration with safety nets

  isExistingStore(): boolean {
    return this.answers.storeType === 'existing';
  }

  isNewStore(): boolean {
    return this.answers.storeType === 'new' || !this.answers.storeType;
  }

  isUSRegion(): boolean {
    return this.answers.region === 'US' || !this.answers.region;
  }

  isCanadaRegion(): boolean {
    return this.answers.region === 'CA';
  }

  hasOtherIncome(): boolean {
    return this.answers.hasOtherIncome === true;
  }

  hasTaxRush(): boolean {
    // TaxRush is only available in Canada and only if explicitly enabled
    return this.isCanadaRegion() && this.answers.handlesTaxRush === true;
  }

  // ============================================================================
  // SAFETY NET SYSTEM FOR FUTURE WIZARD OPTIONS
  // ============================================================================

  /**
   * Generic method to get configuration-aware values
   * This provides a safety net for future Quick Start Wizard options
   */
  getValue<T>(config: {
    newStore?: T;
    existingStore?: T;
    us?: T;
    canada?: T;
    withOtherIncome?: T;
    withoutOtherIncome?: T;
    withTaxRush?: T;
    withoutTaxRush?: T;
    default?: T;
  }): T | undefined {
    let result: T | undefined;
    let matchedRule: string = 'none';

    // Store type takes precedence
    if (this.isExistingStore() && config.existingStore !== undefined) {
      result = config.existingStore;
      matchedRule = 'existingStore';
    } else if (this.isNewStore() && config.newStore !== undefined) {
      result = config.newStore;
      matchedRule = 'newStore';
    }
    // Region-specific values
    else if (this.isCanadaRegion() && config.canada !== undefined) {
      result = config.canada;
      matchedRule = 'canada';
    } else if (this.isUSRegion() && config.us !== undefined) {
      result = config.us;
      matchedRule = 'us';
    }
    // Other income
    else if (this.hasOtherIncome() && config.withOtherIncome !== undefined) {
      result = config.withOtherIncome;
      matchedRule = 'withOtherIncome';
    } else if (!this.hasOtherIncome() && config.withoutOtherIncome !== undefined) {
      result = config.withoutOtherIncome;
      matchedRule = 'withoutOtherIncome';
    }
    // TaxRush
    else if (this.hasTaxRush() && config.withTaxRush !== undefined) {
      result = config.withTaxRush;
      matchedRule = 'withTaxRush';
    } else if (!this.hasTaxRush() && config.withoutTaxRush !== undefined) {
      result = config.withoutTaxRush;
      matchedRule = 'withoutTaxRush';
    }
    // Fallback to default
    else {
      result = config.default;
      matchedRule = 'default';
    }

    console.log('🎯 [COMPUTED] getValue():', {
      matchedRule,
      result,
      config: Object.keys(config),
      wizardState: {
        isExisting: this.isExistingStore(),
        isNewStore: this.isNewStore(),
        isUS: this.isUSRegion(),
        isCanada: this.isCanadaRegion(),
        hasOtherIncome: this.hasOtherIncome(),
        hasTaxRush: this.hasTaxRush(),
      },
    });

    return result;
  }

  /**
   * Get display labels that adapt to wizard configuration
   */
  getDisplayLabel(key: string): string {
    const labels: Record<string, any> = {
      storeTypeTitle: this.getValue({
        existingStore: 'Projected Performance',
        newStore: 'Target Performance',
        default: 'Performance',
      }),
      revenueBreakdownTitle: this.getValue({
        existingStore: 'Projected Gross Revenue Breakdown',
        newStore: 'Target Gross Revenue Breakdown',
        default: 'Revenue Breakdown',
      }),
      grossPerReturnTitle: this.getValue({
        existingStore: 'Projected Gross per Return',
        newStore: 'Target Gross per Return',
        default: 'Gross per Return',
      }),
      regionName: this.getValue({
        us: 'United States 🇺🇸',
        canada: 'Canada 🇨🇦',
        default: 'Unknown Region',
      }),
      storeTypeName: this.getValue({
        existingStore: 'Existing Store 🏢',
        newStore: 'New Store 🏪',
        default: 'Unknown Store Type',
      }),
    };

    return labels[key] || key;
  }

  getSelections(): WizardSelections {
    return { ...this.selections };
  }

  updateSelections(update: Partial<WizardSelections>): void {
    this.selections = { ...this.selections, ...update };
  }

  updateAnswers(updates: Partial<WizardAnswers>): void {
    console.group('🔄 WizardState.updateAnswers()');
    console.log('📥 Input updates:', updates);

    const current = this.answers;
    console.log('📊 Current state before:', {
      region: current.region,
      storeType: current.storeType,
      projectedTaxPrepReturns: current.projectedTaxPrepReturns,
      avgNetFee: current.avgNetFee,
      projectedGrossFees: current.projectedGrossFees,
      discountsPct: current.discountsPct,
      discountsAmt: current.discountsAmt,
      projectedTaxPrepIncome: current.projectedTaxPrepIncome,
      taxRushReturns: current.taxRushReturns,
      taxRushAvgNetFee: current.taxRushAvgNetFee,
      taxRushGrossFees: current.taxRushGrossFees,
    });

    let next = { ...current, ...updates };
    console.log('🔄 After applying updates:', Object.keys(updates));

    // Apply regional defaults when region changes
    if ('region' in updates && updates.region !== current.region) {
      console.log('🌍 Region changed from', current.region, 'to', updates.region);
      next = this.applyRegionalDefaults(next);
    }

    // Clear example data on first user input (except for wizard config changes)
    if (current._isExampleData && this.isUserDataInput(updates)) {
      console.log('🧹 Clearing example data on first user input');
      next = this.clearExampleData(next);
    }

    // Handle bidirectional discount calculation
    if ('discountsAmt' in updates && current.projectedGrossFees) {
      console.log('💰 Bidirectional: Amount changed, recalculating percentage');
      const resolved = this.bidir.resolveLastEdited(
        'amount',
        current.projectedGrossFees,
        updates.discountsAmt,
        current.discountsPct
      );
      next.discountsAmt = resolved.amount;
      next.discountsPct = resolved.pct * 100; // Convert to percentage
      console.log('💰 Result:', { amount: resolved.amount, pct: resolved.pct * 100 });
    } else if ('discountsPct' in updates && current.projectedGrossFees) {
      console.log('📊 Bidirectional: Percentage changed, recalculating amount');
      const resolved = this.bidir.resolveLastEdited(
        'pct',
        current.projectedGrossFees,
        current.discountsAmt,
        (updates.discountsPct || 0) / 100 // Convert from percentage
      );
      next.discountsAmt = resolved.amount;
      next.discountsPct = resolved.pct * 100;
      console.log('📊 Result:', { amount: resolved.amount, pct: resolved.pct * 100 });
    }

    // Auto-calculate derived values
    console.log('🧮 Starting auto-calculations...');
    this.calculateDerivedValues(next);

    console.log('✅ Final state after:', {
      region: next.region,
      storeType: next.storeType,
      projectedTaxPrepReturns: next.projectedTaxPrepReturns,
      avgNetFee: next.avgNetFee,
      projectedGrossFees: next.projectedGrossFees,
      discountsPct: next.discountsPct,
      discountsAmt: next.discountsAmt,
      projectedTaxPrepIncome: next.projectedTaxPrepIncome,
      taxRushReturns: next.taxRushReturns,
      taxRushAvgNetFee: next.taxRushAvgNetFee,
      taxRushGrossFees: next.taxRushGrossFees,
    });

    this._answers$.next(next);
    this.saveToStorage(next);
    console.groupEnd();
  }

  private isUserDataInput(updates: Partial<WizardAnswers>): boolean {
    // Check if the update contains user input fields (not wizard config)
    const userInputFields = [
      'projectedTaxPrepReturns',
      'avgNetFee',
      'discountsPct',
      'discountsAmt',
      'otherIncome',
      'taxRushReturns',
      'taxRushAvgNetFee',
      'projectedExpenses',
    ];

    return userInputFields.some((field) => field in updates);
  }

  private applyRegionalDefaults(answers: WizardAnswers): WizardAnswers {
    // Apply region-specific defaults
    const region = answers.region || 'US';
    const regionalDiscountPct = region === 'CA' ? 3.0 : 1.0;

    return {
      ...answers,
      // Apply regional defaults to all discount fields
      discountsPct: regionalDiscountPct,
      discountsAmt: undefined, // Will be calculated
      pyDiscountsPct: regionalDiscountPct, // Prior Year
      pyDiscountsAmt: undefined,
      lastYearDiscountsPct: regionalDiscountPct, // Legacy (if still used)
      lastYearDiscountsAmt: undefined,
    };
  }

  private clearExampleData(answers: WizardAnswers): WizardAnswers {
    // Clear all example data fields but keep wizard configuration and regional defaults
    const region = answers.region || 'US';
    const regionalDiscountPct = region === 'CA' ? 3.0 : 1.0;

    return {
      ...answers,
      _isExampleData: false,
      // Clear example values but keep regional discount default
      projectedTaxPrepReturns: undefined,
      avgNetFee: undefined,
      discountsPct: regionalDiscountPct, // Keep regional default
      discountsAmt: undefined,
      // Clear other income if not enabled
      otherIncome: answers.hasOtherIncome ? answers.otherIncome : undefined,
      taxRushReturns: undefined,
      taxRushAvgNetFee: undefined,
      projectedGrossFees: undefined,
      projectedTaxPrepIncome: undefined,
      projectedExpenses: undefined,
    };
  }

  private calculateDerivedValues(answers: WizardAnswers): void {
    console.group('🧮 calculateDerivedValues()');

    // Calculate projected gross fees
    if (answers.projectedTaxPrepReturns && answers.avgNetFee) {
      const oldGrossFees = answers.projectedGrossFees;
      answers.projectedGrossFees =
        Math.round(answers.projectedTaxPrepReturns * answers.avgNetFee * 100) / 100;
      console.log(
        '💰 Gross Fees:',
        `${answers.projectedTaxPrepReturns} × $${answers.avgNetFee} = $${answers.projectedGrossFees}`,
        oldGrossFees !== answers.projectedGrossFees ? '(CHANGED)' : '(same)'
      );
    }

    // Ensure regional discount default is set if not already present
    if (answers.projectedGrossFees && (!answers.discountsPct || answers.discountsPct === 0)) {
      const region = answers.region || 'US';
      const defaultPct = region === 'CA' ? 3.0 : 1.0;
      console.log(
        '🎯 Setting regional discount default:',
        region,
        defaultPct + '%',
        'replacing:',
        answers.discountsPct
      );
      answers.discountsPct = defaultPct;
    } else {
      console.log('🔍 Discount default check:', {
        projectedGrossFees: answers.projectedGrossFees,
        discountsPct: answers.discountsPct,
        discountsPctType: typeof answers.discountsPct,
        region: answers.region,
      });
    }

    // Calculate discounts based on percentage (recalculate when gross fees or percentage changes)
    if (answers.projectedGrossFees && answers.discountsPct !== undefined) {
      const oldDiscountAmt = answers.discountsAmt;
      answers.discountsAmt =
        Math.round(answers.projectedGrossFees * (answers.discountsPct / 100) * 100) / 100;
      console.log(
        '💸 Discount Amount:',
        `$${answers.projectedGrossFees} × ${answers.discountsPct}% = $${answers.discountsAmt}`,
        oldDiscountAmt !== answers.discountsAmt ? '(CHANGED)' : '(same)'
      );
    }

    // Calculate projected tax prep income
    if (answers.projectedGrossFees && answers.discountsAmt !== undefined) {
      const oldTaxPrepIncome = answers.projectedTaxPrepIncome;
      answers.projectedTaxPrepIncome = answers.projectedGrossFees - answers.discountsAmt;
      console.log(
        '📊 Tax Prep Income:',
        `$${answers.projectedGrossFees} - $${answers.discountsAmt} = $${answers.projectedTaxPrepIncome}`,
        oldTaxPrepIncome !== answers.projectedTaxPrepIncome ? '(CHANGED)' : '(same)'
      );
    }

    // Set default TaxRush percentage for Canada
    if (answers.region === 'CA' && answers.handlesTaxRush && !answers.taxRushReturnsPct) {
      answers.taxRushReturnsPct = 15.0; // Default 15%
      console.log('🚀 TaxRush Returns %:', 'Setting default 15%', '(CHANGED)');
    }

    // Auto-calculate TaxRush returns for Canada stores with TaxRush enabled
    if (
      answers.region === 'CA' &&
      answers.handlesTaxRush &&
      answers.projectedTaxPrepReturns &&
      answers.taxRushReturnsPct &&
      !answers.manualTaxRushReturns
    ) {
      const oldTaxRushReturns = answers.taxRushReturns;
      answers.taxRushReturns = Math.round(
        answers.projectedTaxPrepReturns * (answers.taxRushReturnsPct / 100)
      );
      console.log(
        '🚀 TaxRush Returns:',
        `${answers.projectedTaxPrepReturns} × ${answers.taxRushReturnsPct}% = ${answers.taxRushReturns}`,
        oldTaxRushReturns !== answers.taxRushReturns ? '(CHANGED)' : '(same)'
      );

      // Use same average net fee for TaxRush (if not manually set)
      if (answers.avgNetFee && !answers.taxRushAvgNetFee) {
        answers.taxRushAvgNetFee = answers.avgNetFee;
        console.log(
          '🚀 TaxRush Avg Net Fee:',
          `$${answers.taxRushAvgNetFee} (copied from main)`,
          '(CHANGED)'
        );
      }
    }

    // Calculate TaxRush Gross Fees
    if (answers.taxRushReturns && answers.taxRushAvgNetFee) {
      const oldTaxRushGrossFees = answers.taxRushGrossFees;
      answers.taxRushGrossFees =
        Math.round(answers.taxRushReturns * answers.taxRushAvgNetFee * 100) / 100;
      console.log(
        '🚀 TaxRush Gross Fees:',
        `${answers.taxRushReturns} × $${answers.taxRushAvgNetFee} = $${answers.taxRushGrossFees}`,
        oldTaxRushGrossFees !== answers.taxRushGrossFees ? '(CHANGED)' : '(same)'
      );
    }

    // Calculate total expenses (auto: 76% of total income)
    if (answers.projectedTaxPrepIncome && !answers.calculatedTotalExpenses) {
      const totalIncome = (answers.projectedTaxPrepIncome || 0) + (answers.otherIncome || 0);
      const oldExpenses = answers.projectedExpenses;
      answers.projectedExpenses = Math.round(totalIncome * 0.76);
      console.log(
        '💸 Total Expenses:',
        `($${answers.projectedTaxPrepIncome} + $${answers.otherIncome || 0}) × 76% = $${answers.projectedExpenses}`,
        oldExpenses !== answers.projectedExpenses ? '(CHANGED)' : '(same)'
      );
    }

    // Prior Year calculations
    if (answers.pyTaxPrepReturns && answers.pyAvgNetFee) {
      const oldPyGrossFees = answers.pyGrossFees;
      answers.pyGrossFees = Math.round(answers.pyTaxPrepReturns * answers.pyAvgNetFee * 100) / 100;
      console.log(
        '📈 PY Gross Fees:',
        `${answers.pyTaxPrepReturns} × $${answers.pyAvgNetFee} = $${answers.pyGrossFees}`,
        oldPyGrossFees !== answers.pyGrossFees ? '(CHANGED)' : '(same)'
      );
    }

    // PY discount calculations
    if (answers.pyGrossFees && (!answers.pyDiscountsPct || answers.pyDiscountsPct === 0)) {
      const region = answers.region || 'US';
      const defaultPct = region === 'CA' ? 3.0 : 1.0;
      console.log(
        '📈 PY Setting regional discount default:',
        region,
        defaultPct + '%',
        'replacing:',
        answers.pyDiscountsPct
      );
      answers.pyDiscountsPct = defaultPct;
    }

    if (answers.pyGrossFees && answers.pyDiscountsPct !== undefined) {
      const oldPyDiscountAmt = answers.pyDiscountsAmt;
      answers.pyDiscountsAmt =
        Math.round(answers.pyGrossFees * (answers.pyDiscountsPct / 100) * 100) / 100;
      console.log(
        '📈 PY Discount Amount:',
        `$${answers.pyGrossFees} × ${answers.pyDiscountsPct}% = $${answers.pyDiscountsAmt}`,
        oldPyDiscountAmt !== answers.pyDiscountsAmt ? '(CHANGED)' : '(same)'
      );
    }

    if (answers.pyGrossFees && answers.pyDiscountsAmt !== undefined) {
      const oldPyTaxPrepIncome = answers.pyTaxPrepIncome;
      answers.pyTaxPrepIncome = answers.pyGrossFees - answers.pyDiscountsAmt;
      console.log(
        '📈 PY Tax Prep Income:',
        `$${answers.pyGrossFees} - $${answers.pyDiscountsAmt} = $${answers.pyTaxPrepIncome}`,
        oldPyTaxPrepIncome !== answers.pyTaxPrepIncome ? '(CHANGED)' : '(same)'
      );
    }

    // Set default PY TaxRush percentage for Canada
    if (answers.region === 'CA' && answers.handlesTaxRush && !answers.pyTaxRushReturnsPct) {
      answers.pyTaxRushReturnsPct = 15.0; // Default 15%
      console.log('📈 PY TaxRush Returns %:', 'Setting default 15%', '(CHANGED)');
    }

    // Auto-calculate PY TaxRush returns for Canada stores with TaxRush enabled
    if (
      answers.region === 'CA' &&
      answers.handlesTaxRush &&
      answers.pyTaxPrepReturns &&
      answers.pyTaxRushReturnsPct &&
      !answers.manualPyTaxRushReturns
    ) {
      const oldPyTaxRushReturns = answers.pyTaxRushReturns;
      answers.pyTaxRushReturns = Math.round(
        answers.pyTaxPrepReturns * (answers.pyTaxRushReturnsPct / 100)
      );
      console.log(
        '📈 PY TaxRush Returns:',
        `${answers.pyTaxPrepReturns} × ${answers.pyTaxRushReturnsPct}% = ${answers.pyTaxRushReturns}`,
        oldPyTaxRushReturns !== answers.pyTaxRushReturns ? '(CHANGED)' : '(same)'
      );

      // Use same average net fee for TaxRush (if not manually set)
      if (answers.pyAvgNetFee && !answers.pyTaxRushAvgNetFee) {
        answers.pyTaxRushAvgNetFee = answers.pyAvgNetFee;
        console.log(
          '📈 PY TaxRush Avg Net Fee:',
          `$${answers.pyTaxRushAvgNetFee} (copied from main)`,
          '(CHANGED)'
        );
      }
    }

    // PY TaxRush calculations
    if (answers.pyTaxRushReturns && answers.pyTaxRushAvgNetFee) {
      const oldPyTaxRushGrossFees = answers.pyTaxRushGrossFees;
      answers.pyTaxRushGrossFees =
        Math.round(answers.pyTaxRushReturns * answers.pyTaxRushAvgNetFee * 100) / 100;
      console.log(
        '📈 PY TaxRush Gross Fees:',
        `${answers.pyTaxRushReturns} × $${answers.pyTaxRushAvgNetFee} = $${answers.pyTaxRushGrossFees}`,
        oldPyTaxRushGrossFees !== answers.pyTaxRushGrossFees ? '(CHANGED)' : '(same)'
      );
    }

    // Bidirectional TaxRush calculations (returns ↔ percentage)
    this.calculateTaxRushBidirectional(answers);

    // Projected Performance calculations
    this.calculateProjectedPerformance(answers);

    console.groupEnd();
  }

  private calculateProjectedPerformance(answers: WizardAnswers): void {
    console.log('🚀 [PROJECTED] Starting projected calculations...');

    // Get projected values from PY + growth %
    const projectedTaxPrepReturns = this.getProjectedTaxPrepReturns(answers);
    const projectedAvgNetFee = this.getProjectedAvgNetFee(answers);
    const projectedGrossFees =
      projectedTaxPrepReturns && projectedAvgNetFee
        ? Math.round(projectedTaxPrepReturns * projectedAvgNetFee * 100) / 100
        : 0;

    // Store the projected values in the answers object
    if (projectedTaxPrepReturns !== null) {
      answers.projectedTaxPrepReturns = projectedTaxPrepReturns;
    }
    if (projectedAvgNetFee !== null) {
      answers.projectedAvgNetFee = projectedAvgNetFee;
    }
    if (projectedGrossFees > 0) {
      answers.projectedGrossFees = projectedGrossFees;
    }

    console.log('🚀 [PROJECTED] Base calculations:', {
      projectedTaxPrepReturns,
      projectedAvgNetFee,
      projectedGrossFees,
    });

    // Apply regional discount defaults if not manually set
    if (!answers.manualProjectedDiscountsPct && !answers.projectedDiscountsPct) {
      answers.projectedDiscountsPct = answers.region === 'CA' ? 3.0 : 1.0;
      console.log(
        '🚀 [PROJECTED] Setting regional discount default:',
        `${answers.region} ${answers.projectedDiscountsPct}%`,
        '(CHANGED)'
      );
    }

    // Calculate projected discounts (bidirectional)
    if (
      projectedGrossFees &&
      answers.projectedDiscountsPct &&
      !answers.manualProjectedDiscountsAmt
    ) {
      const oldProjectedDiscountsAmt = answers.projectedDiscountsAmt;
      answers.projectedDiscountsAmt =
        Math.round(projectedGrossFees * (answers.projectedDiscountsPct / 100) * 100) / 100;
      console.log(
        '🚀 [PROJECTED] Discount Amount:',
        `$${projectedGrossFees} × ${answers.projectedDiscountsPct}% = $${answers.projectedDiscountsAmt}`,
        oldProjectedDiscountsAmt !== answers.projectedDiscountsAmt ? '(CHANGED)' : '(same)'
      );
    }

    // Calculate projected tax prep income
    if (projectedGrossFees && answers.projectedDiscountsAmt) {
      const oldProjectedTaxPrepIncome = answers.projectedTaxPrepIncome;
      answers.projectedTaxPrepIncome = projectedGrossFees - answers.projectedDiscountsAmt;
      console.log(
        '🚀 [PROJECTED] Tax Prep Income:',
        `$${projectedGrossFees} - $${answers.projectedDiscountsAmt} = $${answers.projectedTaxPrepIncome}`,
        oldProjectedTaxPrepIncome !== answers.projectedTaxPrepIncome ? '(CHANGED)' : '(same)'
      );
    }

    // Projected TaxRush calculations for Canada
    if (answers.region === 'CA' && answers.handlesTaxRush && answers.projectedTaxPrepReturns) {
      // Set default TaxRush percentage if not set
      if (!answers.projectedTaxRushReturnsPct) {
        if (answers.pyTaxRushReturnsPct) {
          // Use PY percentage (no growth applied to percentage)
          answers.projectedTaxRushReturnsPct = answers.pyTaxRushReturnsPct;
          console.log(
            '🚀 [PROJECTED] TaxRush % from PY:',
            `${answers.pyTaxRushReturnsPct}%`,
            '(CHANGED)'
          );
        } else {
          // Set default percentage
          answers.projectedTaxRushReturnsPct = 15.0;
          console.log('🚀 [PROJECTED] TaxRush % default:', 'Setting default 15%', '(CHANGED)');
        }
      }

      // Calculate projected TaxRush returns from percentage (growth already applied to tax prep returns)
      if (
        !answers.manualProjectedTaxRushReturns &&
        answers.projectedTaxRushReturnsPct &&
        answers.projectedTaxPrepReturns
      ) {
        const oldProjectedTaxRushReturns = answers.projectedTaxRushReturns;
        // Ensure clean integer for returns count
        answers.projectedTaxRushReturns = Math.round(
          answers.projectedTaxPrepReturns * (answers.projectedTaxRushReturnsPct / 100)
        );
        console.log(
          '🚀 [PROJECTED] TaxRush Returns from %:',
          `${answers.projectedTaxPrepReturns} × ${answers.projectedTaxRushReturnsPct}% = ${answers.projectedTaxRushReturns}`,
          '(growth naturally applied via tax prep returns)',
          oldProjectedTaxRushReturns !== answers.projectedTaxRushReturns ? '(CHANGED)' : '(same)'
        );
      }

      // Set projected TaxRush average net fee if not manually set
      if (!answers.projectedTaxRushAvgNetFee && answers.projectedAvgNetFee) {
        answers.projectedTaxRushAvgNetFee = answers.projectedAvgNetFee;
        console.log(
          '🚀 [PROJECTED] TaxRush Avg Net Fee:',
          `$${answers.projectedTaxRushAvgNetFee} (copied from projected avg net fee)`,
          '(CHANGED)'
        );
      }

      // Calculate projected TaxRush gross fees
      if (answers.projectedTaxRushReturns && answers.projectedTaxRushAvgNetFee) {
        const oldProjectedTaxRushGrossFees = answers.projectedTaxRushGrossFees;
        // Round to nearest cent for currency values
        answers.projectedTaxRushGrossFees =
          Math.round(answers.projectedTaxRushReturns * answers.projectedTaxRushAvgNetFee * 100) /
          100;
        console.log(
          '🚀 [PROJECTED] TaxRush Gross Fees:',
          `${answers.projectedTaxRushReturns} × $${answers.projectedTaxRushAvgNetFee} = $${answers.projectedTaxRushGrossFees}`,
          oldProjectedTaxRushGrossFees !== answers.projectedTaxRushGrossFees
            ? '(CHANGED)'
            : '(same)'
        );
      }
    }

    // Projected Other Income (apply growth if checkbox is checked)
    if (answers.hasOtherIncome && answers.pyOtherIncome) {
      const targets = this.projectedService.targets;
      if (targets.otherIncome) {
        const growthPct = this.getCurrentGrowthPct();
        const oldProjectedOtherIncome = answers.projectedOtherIncome;
        answers.projectedOtherIncome = Math.round(answers.pyOtherIncome * (1 + growthPct / 100));
        console.log(
          '🚀 [PROJECTED] Other Income with growth:',
          `$${answers.pyOtherIncome} + ${growthPct}% = $${answers.projectedOtherIncome}`,
          oldProjectedOtherIncome !== answers.projectedOtherIncome ? '(CHANGED)' : '(same)'
        );
      } else {
        const oldProjectedOtherIncome = answers.projectedOtherIncome;
        answers.projectedOtherIncome = answers.pyOtherIncome; // No growth applied
        console.log(
          '🚀 [PROJECTED] Other Income without growth:',
          `$${answers.pyOtherIncome}`,
          '(no growth - checkbox unchecked)',
          oldProjectedOtherIncome !== answers.projectedOtherIncome ? '(CHANGED)' : '(same)'
        );
      }
    }

    console.log('🚀 [PROJECTED] Completed projected calculations');
  }

  private getProjectedTaxPrepReturns(answers: WizardAnswers): number | null {
    console.log('🚀 [PROJECTED] getProjectedTaxPrepReturns check:', {
      storeType: answers.storeType,
      pyTaxPrepReturns: answers.pyTaxPrepReturns,
      condition: answers.storeType === 'existing' && answers.pyTaxPrepReturns,
    });

    if (answers.storeType === 'existing' && answers.pyTaxPrepReturns) {
      const targets = this.projectedService.targets;
      if (targets.returns) {
        const growthPct = this.getCurrentGrowthPct();
        const projected = Math.round(answers.pyTaxPrepReturns * (1 + growthPct / 100));
        console.log(
          '🚀 [PROJECTED] Tax Prep Returns with growth:',
          `${answers.pyTaxPrepReturns} + ${growthPct}% = ${projected}`,
          '(growth applied)'
        );
        return projected;
      } else {
        console.log(
          '🚀 [PROJECTED] Tax Prep Returns without growth:',
          `${answers.pyTaxPrepReturns}`,
          '(no growth - checkbox unchecked)'
        );
        return answers.pyTaxPrepReturns; // No growth applied
      }
    }
    return null;
  }

  private getProjectedAvgNetFee(answers: WizardAnswers): number | null {
    console.log('🚀 [PROJECTED] getProjectedAvgNetFee check:', {
      storeType: answers.storeType,
      pyAvgNetFee: answers.pyAvgNetFee,
      condition: answers.storeType === 'existing' && answers.pyAvgNetFee,
    });

    if (answers.storeType === 'existing' && answers.pyAvgNetFee) {
      const targets = this.projectedService.targets;
      if (targets.avgNetFee) {
        const growthPct = this.getCurrentGrowthPct();
        const projected = Math.round(answers.pyAvgNetFee * (1 + growthPct / 100) * 100) / 100;
        console.log(
          '🚀 [PROJECTED] Avg Net Fee with growth:',
          `$${answers.pyAvgNetFee} + ${growthPct}% = $${projected}`,
          '(growth applied)'
        );
        return projected;
      } else {
        console.log(
          '🚀 [PROJECTED] Avg Net Fee without growth:',
          `$${answers.pyAvgNetFee}`,
          '(no growth - checkbox unchecked)'
        );
        return answers.pyAvgNetFee; // No growth applied
      }
    }
    return null;
  }

  private getCurrentGrowthPct(): number {
    const growthPct = this.projectedService.growthPct;
    console.log(
      '🚀 [PROJECTED] Using growth percentage:',
      `${growthPct}%`,
      '(from ProjectedService)'
    );
    return growthPct;
  }

  private calculateTaxRushBidirectional(answers: WizardAnswers): void {
    // Target/Projected TaxRush bidirectional
    if (answers.region === 'CA' && answers.handlesTaxRush && answers.projectedTaxPrepReturns) {
      // If TaxRush returns changed but percentage didn't, recalculate percentage
      if (answers.taxRushReturns && answers.manualTaxRushReturns && !answers.taxRushReturnsPct) {
        const calculatedPct = (answers.taxRushReturns / answers.projectedTaxPrepReturns) * 100;
        answers.taxRushReturnsPct = Math.round(calculatedPct * 10) / 10; // Round to 1 decimal
        console.log(
          '🔄 TaxRush % from Returns:',
          `${answers.taxRushReturns} ÷ ${answers.projectedTaxPrepReturns} × 100 = ${answers.taxRushReturnsPct}%`,
          '(CALCULATED)'
        );
      }
    }

    // PY TaxRush bidirectional
    if (answers.region === 'CA' && answers.handlesTaxRush && answers.pyTaxPrepReturns) {
      // If PY TaxRush returns changed but percentage didn't, recalculate percentage
      if (
        answers.pyTaxRushReturns &&
        answers.manualPyTaxRushReturns &&
        !answers.pyTaxRushReturnsPct
      ) {
        const calculatedPct = (answers.pyTaxRushReturns / answers.pyTaxPrepReturns) * 100;
        answers.pyTaxRushReturnsPct = Math.round(calculatedPct * 10) / 10; // Round to 1 decimal
        console.log(
          '🔄 PY TaxRush % from Returns:',
          `${answers.pyTaxRushReturns} ÷ ${answers.pyTaxPrepReturns} × 100 = ${answers.pyTaxRushReturnsPct}%`,
          '(CALCULATED)'
        );
      }
    }
  }

  private loadFromStorage(): WizardAnswers {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load wizard state from storage:', error);
    }

    // Return initial state with example data (will be cleared on first user input)
    return {
      region: 'US',
      storeType: 'new',
      handlesTaxRush: false,
      hasOtherIncome: false,
      // Example data - will be cleared when user starts entering data
      _isExampleData: true,
      projectedTaxPrepReturns: 1600,
      avgNetFee: 125,
      discountsPct: 1.0, // US default: 1%
      otherIncome: 5000,
      taxRushReturns: 240,
      taxRushAvgNetFee: 125,
    };
  }

  private saveToStorage(answers: WizardAnswers): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch (error) {
      console.warn('Failed to save wizard state to storage:', error);
    }
  }

  resetAnswers(): void {
    const defaultAnswers = this.loadFromStorage();
    this._answers$.next(defaultAnswers);
    localStorage.removeItem(STORAGE_KEY);
  }
}
