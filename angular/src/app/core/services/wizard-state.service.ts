import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import type { RegionCode } from '../tokens/region-configs.token';
import type { WizardAnswers } from '../../domain/types/wizard.types';
import { BiDirService } from './bidir/bidir.service';
import { logger } from '../logger';
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

  // Main answers stream - immediate updates for UI responsiveness
  readonly answers$ = this._answers$.asObservable();

  // Debounced version for heavy calculations only
  readonly answersDebounced$ = this._answers$.asObservable().pipe(
    debounceTime(150), // Debounce only for heavy calculations
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  private readonly quickWizardLock$ = new BehaviorSubject<boolean>(false);
  readonly quickWizardLockChanges$ = this.quickWizardLock$.asObservable();

  // Performance optimization: debounce heavy calculations
  private readonly _recalculationTrigger$ = new BehaviorSubject<WizardAnswers | null>(null);
  private isCalculating = false;

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
    // Performance optimization: debounce heavy recalculations
    this._recalculationTrigger$
      .pipe(
        debounceTime(100) // Wait 100ms before recalculating
      )
      .subscribe((answers) => {
        if (answers && !this.isCalculating) {
          this.isCalculating = true;
          this.calculateDerivedValues(answers);
          this.saveToStorage(answers);

          // CRITICAL FIX: Mark wizard as complete when all required data is present
          this.checkAndMarkWizardComplete(answers);

          this.isCalculating = false;
        }
      });

    // Subscribe to ProjectedService changes with debouncing
    this.projectedService.targets$.pipe(debounceTime(50)).subscribe(() => {
      logger.debug('🚀 [PROJECTED] Targets changed, scheduling recalculation...');
      this._recalculationTrigger$.next(this.answers);
    });

    this.projectedService.growthPct$.pipe(debounceTime(50)).subscribe(() => {
      logger.debug('🚀 [PROJECTED] Growth percentage changed, scheduling recalculation...');
      this._recalculationTrigger$.next(this.answers);
    });
  }

  /**
   * CRITICAL FIX: Check if wizard has meaningful data and mark as complete
   * This fixes the dashboard access issue
   */
  private checkAndMarkWizardComplete(answers: WizardAnswers): void {
    // Check if we have the minimum required data for a complete wizard
    const hasBasicConfig = this.isWizardConfigComplete(answers);
    const hasIncomeData =
      (answers.storeType === 'new' && answers.avgNetFee && answers.projectedTaxPrepReturns) ||
      (answers.storeType === 'existing' && answers.projectedAvgNetFee && answers.pyTaxPrepReturns);
    const hasExpenseData = answers.payrollPct !== undefined && answers.rentPct !== undefined;

    const isComplete = hasBasicConfig && hasIncomeData && hasExpenseData;

    if (isComplete) {
      // Use dynamic import to avoid circular dependency
      import('../../pages/dashboard/_gate/wizard-completion.service')
        .then(({ WizardCompletionService }) => {
          // This is a bit hacky but necessary to avoid circular deps
          const completionService = new WizardCompletionService();
          if (!completionService.isComplete()) {
            completionService.markComplete();
            console.log('✅ [WIZARD] Marked as complete - dashboard access granted');
          }
        })
        .catch(() => {
          // Fallback: set localStorage directly
          try {
            localStorage.setItem('forecast.complete', 'true');
            console.log('✅ [WIZARD] Marked as complete (fallback) - dashboard access granted');
          } catch (e) {
            console.warn('Failed to mark wizard complete:', e);
          }
        });
    }
  }

  /**
   * Only run calculations if we have meaningful data to work with
   * Prevents premature expensive calculations before income drivers are set
   */
  private shouldCalculate(answers: WizardAnswers): boolean {
    // Don't calculate anything if no store type is selected
    if (!answers.storeType) {
      if (this.debugEnabled) {
        console.log('🚫 No store type selected yet');
      }
      return false;
    }

    // For NEW stores: need projected income data
    if (answers.storeType === 'new') {
      const hasProjectedData = !!(answers.projectedTaxPrepReturns && answers.avgNetFee);
      if (!hasProjectedData && this.debugEnabled) {
        console.log('🚫 NEW STORE: Waiting for projected returns & avg net fee');
      }
      return hasProjectedData;
    }

    // For EXISTING stores: need prior year data
    if (answers.storeType === 'existing') {
      const hasPriorYearData = !!(answers.pyTaxPrepReturns && answers.pyAvgNetFee);
      if (!hasPriorYearData && this.debugEnabled) {
        console.log('🚫 EXISTING STORE: Waiting for prior year returns & avg net fee');
      }
      return hasPriorYearData;
    }

    return false;
  }

  private isConfigurationChange(updates: Partial<WizardAnswers>): boolean {
    // These fields change the UI/configuration but don't need calculations
    const configFields = ['region', 'storeType', 'handlesTaxRush', 'hasOtherIncome'];
    return Object.keys(updates).some((key) => configFields.includes(key));
  }

  private isDataChange(updates: Partial<WizardAnswers>): boolean {
    // These fields contain actual financial data that needs calculations
    const dataFields = [
      'projectedTaxPrepReturns',
      'avgNetFee',
      'pyTaxPrepReturns',
      'pyAvgNetFee',
      'discountsPct',
      'discountsAmt',
      'otherIncome',
      'taxRushReturns',
      'taxRushAvgNetFee',
      'projectedTaxRushReturns',
      'projectedTaxRushAvgNetFee',
      'projectedOtherIncome',
      'projectedExpenses',
    ];
    return Object.keys(updates).some((key) => dataFields.includes(key));
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

  // Performance optimization: disable heavy debugging in production
  private debugEnabled = true; // Re-enable debug to see if state is updating

  // Robust logging that won't stop on errors
  private safeLog(message: string, data?: any) {
    try {
      if (data !== undefined) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    } catch (error) {
      // Fallback logging if console.log fails
      try {
        console.error('Logging failed:', error);
      } catch (e) {
        // Last resort - do nothing to prevent cascading errors
      }
    }
  }

  private debugComputedProperty(methodName: string, result: any, context: any = {}) {
    if (!this.debugEnabled) return;

    const config = this.getWizardConfiguration();
    logger.debug(`🧮 [COMPUTED] ${methodName}():`, {
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
    logger.info(`🧮 [COMPUTED] Debug mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
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

    logger.info('🧮 [COMPUTED] COMPREHENSIVE SUMMARY:', summary);
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

    // Cache wizard state for performance during debug logging
    const wizardStateCache = this.debugEnabled
      ? {
          isExisting: this.isExistingStore(),
          isNewStore: this.isNewStore(),
          isUS: this.isUSRegion(),
          isCanada: this.isCanadaRegion(),
          hasOtherIncome: this.hasOtherIncome(),
          hasTaxRush: this.hasTaxRush(),
        }
      : {};

    // Temporarily disable all computed logging for performance test
    if (false) {
      console.log('🎯 [COMPUTED] getValue():', {
        matchedRule,
        result,
        config: Object.keys(config),
        wizardState: wizardStateCache,
      });
    }

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
    // Heartbeat log to ensure logging is working
    this.safeLog('💓 [HEARTBEAT] updateAnswers called at', new Date().toLocaleTimeString());

    // Performance optimization: reduce console logging
    if (this.debugEnabled) {
      this.safeLog('🔄 WizardState.updateAnswers()');
      this.safeLog('📥 Input updates:', updates);
    }

    const current = this.answers;
    let next = { ...current, ...updates };

    const wasConfigComplete = this.isWizardConfigComplete(current);
    const isConfigComplete = this.isWizardConfigComplete(next);
    const hasUserInput = this.hasMeaningfulUserInput(updates, current);

    if (!isConfigComplete && this.quickWizardLock$.value) {
      this.unlockQuickWizard();
    }

    // Apply regional defaults when region changes
    if ('region' in updates && updates.region !== current.region) {
      if (this.debugEnabled) {
        console.log('🌍 Region changed from', current.region, 'to', updates.region);
      }
      next = this.applyRegionalDefaults(next);
    }

    if (current._isExampleData && ((isConfigComplete && !wasConfigComplete) || hasUserInput)) {
      if (this.debugEnabled) {
        console.log('🧹 Clearing example data after wizard completion/user input');
      }
      next = this.clearExampleData(next);
    }

    // Handle bidirectional discount calculation
    if ('discountsAmt' in updates && current.projectedGrossFees) {
      if (this.debugEnabled) {
        console.log('💰 Bidirectional: Amount changed, recalculating percentage');
      }
      const resolved = this.bidir.resolveLastEdited(
        'amount',
        current.projectedGrossFees,
        updates.discountsAmt,
        current.discountsPct
      );
      next.discountsAmt = resolved.amount;
      next.discountsPct = resolved.pct * 100; // Convert to percentage
    } else if ('discountsPct' in updates && current.projectedGrossFees) {
      if (this.debugEnabled) {
        console.log('📊 Bidirectional: Percentage changed, recalculating amount');
      }
      const resolved = this.bidir.resolveLastEdited(
        'pct',
        current.projectedGrossFees,
        current.discountsAmt,
        (updates.discountsPct || 0) / 100 // Convert from percentage
      );
      next.discountsAmt = resolved.amount;
      next.discountsPct = resolved.pct * 100;
    }

    // Update state immediately for UI responsiveness
    this._answers$.next(next);

    // CRITICAL FIX: Only trigger calculations for actual data changes
    const isConfigChange = this.isConfigurationChange(updates);
    const isDataChange = this.isDataChange(updates);

    if (isDataChange && this.shouldCalculate(next)) {
      if (this.debugEnabled) {
        console.log('✅ Triggering calculations - data change with prerequisites met');
      }
      setTimeout(() => {
        this._recalculationTrigger$.next(next);
      }, 0);
    } else if (isConfigChange) {
      if (this.debugEnabled) {
        console.log('⚙️ Configuration change only - no calculations needed');
      }
    } else {
      if (this.debugEnabled) {
        console.log('⏸️ Prerequisites not met - calculations deferred');
      }
    }

    if (this.debugEnabled) {
      console.groupEnd();
    }
  }

  private hasMeaningfulUserInput(updates: Partial<WizardAnswers>, current: WizardAnswers): boolean {
    const userInputFields: Array<keyof WizardAnswers> = [
      'projectedTaxPrepReturns',
      'avgNetFee',
      'discountsPct',
      'discountsAmt',
      'otherIncome',
      'taxRushReturns',
      'taxRushAvgNetFee',
      'projectedExpenses',
      'projectedTaxRushReturns',
      'projectedTaxRushAvgNetFee',
      'projectedTaxRushReturnsPct',
      'projectedOtherIncome',
      'pyTaxPrepReturns',
      'pyAvgNetFee',
      'pyDiscountsPct',
      'pyDiscountsAmt',
      'pyOtherIncome',
    ];

    return userInputFields.some((field) => {
      if (!(field in updates)) {
        return false;
      }
      const nextValue = (updates as any)[field];
      if (nextValue === undefined || nextValue === null) {
        return false;
      }
      const currentValue = (current as any)[field];
      return nextValue !== currentValue;
    });
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
    if (this.debugEnabled) {
      console.group('🧮 calculateDerivedValues()');
    }

    // Calculate projected gross fees
    if (answers.projectedTaxPrepReturns && answers.avgNetFee) {
      const oldGrossFees = answers.projectedGrossFees;
      answers.projectedGrossFees =
        Math.round(answers.projectedTaxPrepReturns * answers.avgNetFee * 100) / 100;
      if (this.debugEnabled) {
        console.log(
          '💰 Gross Fees:',
          `${answers.projectedTaxPrepReturns} × $${answers.avgNetFee} = $${answers.projectedGrossFees}`,
          oldGrossFees !== answers.projectedGrossFees ? '(CHANGED)' : '(same)'
        );
      }
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
    if (answers.projectedTaxPrepIncome) {
      // Use the same revenue basis as the UI: projected tax prep income + (TaxRush gross if CA & enabled) + projected other income if enabled
      const taxRush =
        answers.region === 'CA' && answers.handlesTaxRush
          ? answers.projectedTaxRushGrossFees || 0
          : 0;
      const other = answers.hasOtherIncome ? answers.projectedOtherIncome || 0 : 0;
      const totalIncome = (answers.projectedTaxPrepIncome || 0) + taxRush + other;
      const minimumExpenses = Math.round(totalIncome * 0.6);
      const maximumExpenses = Math.round(totalIncome * 0.8);
      const targetExpenses = Math.round((minimumExpenses + maximumExpenses) / 2);

      if (!answers.calculatedTotalExpenses) {
        answers.minRecommendedExpenses = minimumExpenses;
        answers.maxRecommendedExpenses = maximumExpenses;
        answers.projectedExpenses = targetExpenses;

        console.log(
          '💸 Total Expenses (Strategic Range):',
          `Recommended 60%–80% → $${minimumExpenses} – $${maximumExpenses} (target $${targetExpenses})`
        );
      }
    }

    // Seed or update frozen expense guardrail baselines when income drivers change
    // Baselines are computed from gross revenue context and only set if not already present
    // Baselines should be computed from the same total revenue used for display/guardrails
    const grossRevenue = (() => {
      const base = answers.projectedTaxPrepIncome || 0;
      const taxRush =
        answers.region === 'CA' && answers.handlesTaxRush
          ? answers.projectedTaxRushGrossFees || 0
          : 0;
      const other = answers.hasOtherIncome ? answers.projectedOtherIncome || 0 : 0;
      return base + taxRush + other;
    })();
    const nextBaselines: Record<string, number> = { ...(answers.expenseBaselines || {}) };
    const setOnce = (key: string, value: number | undefined) => {
      if (value === undefined) return;
      if (nextBaselines[key] === undefined) nextBaselines[key] = Math.round(value);
    };

    // Max-style caps (pct of gross) — choose conservative green targets (below warn bands)
    setOnce('telephone', grossRevenue * 0.01); // 1.0% (warn at 1.05%)
    setOnce('utilities', grossRevenue * 0.009); // 0.9% (warn at 1.05%)
    setOnce('localAdv', grossRevenue * 0.015); // 1.5% (warn at 1.75%)
    setOnce('supplies', grossRevenue * 0.03); // 3.0% (warn at 3.5%)

    // Min-style floors (pct of gross)
    setOnce('dues', grossRevenue * 0.0025);
    setOnce('bankFees', grossRevenue * 0.0015);
    setOnce('maintenance', grossRevenue * 0.0025);
    setOnce('travel', grossRevenue * 0.01);

    // Ranges (annual dollars)
    setOnce('insuranceMin', 4800);
    setOnce('insuranceMax', 6000);
    setOnce('miscMin', 600);
    setOnce('miscMax', 1200);

    // Shortages (% baseline)
    setOnce('shortagesPct', answers.shortagesPct ?? 2);

    if (
      Object.keys(nextBaselines).length > 0 &&
      JSON.stringify(nextBaselines) !== JSON.stringify(answers.expenseBaselines || {})
    ) {
      answers.expenseBaselines = nextBaselines;
      // Seed expense inputs to baselines on first compute only, after projected drivers are ready
      const projectedReady =
        (answers.projectedTaxPrepIncome || 0) > 0 &&
        // If CA + TaxRush is enabled, allow zero when not enabled; otherwise wait until projectedTaxRushGrossFees is resolved
        (!(answers.region === 'CA' && answers.handlesTaxRush) ||
          (answers.projectedTaxRushGrossFees || 0) >= 0);
      if (!answers.expensesSeeded && projectedReady) {
        const seeded: Partial<WizardAnswers> = {
          payrollPct: this.isCanadaRegion() ? 25 : 35,
          empDeductionsPct: 10,
          rentPct: 18,
          telephoneAmt: Math.round(nextBaselines['telephone'] || 0),
          utilitiesAmt: Math.round(nextBaselines['utilities'] || 0),
          localAdvAmt: Math.round(nextBaselines['localAdv'] || 0),
          insuranceAmt: Math.round(
            ((nextBaselines['insuranceMin'] || 4800) + (nextBaselines['insuranceMax'] || 6000)) / 2
          ),
          postageAmt: 800,
          suppliesPct: 3.5,
          duesAmt: Math.round(nextBaselines['dues'] || 0),
          bankFeesAmt: Math.round(nextBaselines['bankFees'] || 0),
          maintenanceAmt: Math.round(nextBaselines['maintenance'] || 0),
          travelEntAmt: Math.round(nextBaselines['travel'] || 0),
          expensesSeeded: true,
        };
        Object.assign(answers, seeded);
        logger.debug('💸 [SEED] Expense inputs initialized from baselines', seeded);
      }
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

    if (this.debugEnabled) {
      console.groupEnd();
    }
  }

  private calculateProjectedPerformance(answers: WizardAnswers): void {
    if (this.debugEnabled) {
      console.log('🚀 [PROJECTED] Starting projected calculations...');
    }

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

    if (this.debugEnabled) {
      console.log('🚀 [PROJECTED] Base calculations:', {
        projectedTaxPrepReturns,
        projectedAvgNetFee,
        projectedGrossFees,
      });
    }

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

    if (this.debugEnabled) {
      console.log('🚀 [PROJECTED] Completed projected calculations');
    }
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
      // DEVELOPMENT: Always start fresh - don't load from storage
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('🧹 [DEV] Starting with fresh state - localStorage ignored');
        localStorage.removeItem(STORAGE_KEY);
        return this.createInitialAnswers();
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load wizard state from storage:', error);
    }

    return this.createInitialAnswers();
  }

  private createInitialAnswers(): WizardAnswers {
    return {
      region: 'US',
      storeType: 'new',
      handlesTaxRush: false,
      hasOtherIncome: false,
      _isExampleData: true,
      projectedTaxPrepReturns: 1600,
      avgNetFee: 125,
      discountsPct: 1.0,
      otherIncome: 5000,
      taxRushReturns: 240,
      taxRushAvgNetFee: 125,
      expenseNotes: {},
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
    localStorage.removeItem(STORAGE_KEY);
    const defaults = this.createInitialAnswers();
    this._answers$.next(defaults);
    this.selections = {
      region: defaults.region || 'US',
      storeType: defaults.storeType === 'existing' ? 'existing' : 'new',
      handlesTaxRush: defaults.handlesTaxRush === true,
      hasOtherIncome: defaults.hasOtherIncome === true,
    };
    this.unlockQuickWizard();
  }

  resetQuickStartConfig(): void {
    const defaults = this.createInitialAnswers();
    const resetState: WizardAnswers = {
      ...this.answers,
      region: defaults.region,
      storeType: defaults.storeType,
      handlesTaxRush: defaults.handlesTaxRush,
      hasOtherIncome: defaults.hasOtherIncome,
      otherIncome: defaults.otherIncome,
      discountsPct: defaults.discountsPct,
      discountsAmt: undefined,
      _isExampleData: true,
    };

    this._answers$.next(resetState);
    this.saveToStorage(resetState);
    this.selections = {
      region: defaults.region as RegionCode,
      storeType: 'new',
      handlesTaxRush: defaults.handlesTaxRush === true,
      hasOtherIncome: defaults.hasOtherIncome === true,
    };
    this.unlockQuickWizard();
  }

  isWizardConfigComplete(answers: Partial<WizardAnswers>): boolean {
    if (!answers.region || !answers.storeType) {
      return false;
    }
    if (answers.region === 'CA' && answers.handlesTaxRush === undefined) {
      return false;
    }
    if (answers.hasOtherIncome === undefined) {
      return false;
    }
    return true;
  }

  resetPriorYearPerformance(): void {
    const currentRegion = this.answers.region || 'US';
    const regionalDiscountPct = currentRegion === 'CA' ? 3.0 : 1.0;

    this.updateAnswers({
      pyTaxPrepReturns: undefined,
      pyAvgNetFee: undefined,
      pyDiscountsPct: regionalDiscountPct,
      pyDiscountsAmt: undefined,
      pyOtherIncome: undefined,
      pyTaxRushReturns: undefined,
      pyTaxRushAvgNetFee: undefined,
      pyGrossFees: undefined,
      pyTaxPrepIncome: undefined,
      pyTaxRushGrossFees: undefined,
      manualPyTaxRushReturns: undefined,
    });
  }

  resetProjectedGoals(): void {
    this.updateAnswers({
      projectedTaxPrepIncome: undefined,
      projectedDiscountsAmt: undefined,
      projectedDiscountsPct: undefined,
      projectedOtherIncome: undefined,
      projectedTaxRushReturns: undefined,
      projectedTaxRushAvgNetFee: undefined,
      projectedTaxRushGrossFees: undefined,
      projectedTaxRushReturnsPct: undefined,
      manualProjectedDiscountsAmt: undefined,
      manualProjectedDiscountsPct: undefined,
      manualProjectedTaxRushReturns: undefined,
      projectedGrossFees: undefined,
      projectedTaxPrepReturns: undefined,
      projectedAvgNetFee: undefined,
      taxRushReturns: this.answers.taxRushReturns,
      taxRushAvgNetFee: this.answers.taxRushAvgNetFee,
      taxRushReturnsPct: this.answers.taxRushReturnsPct,
      // Clear frozen baselines so they regenerate from new income drivers
      expenseBaselines: undefined,
    });
  }

  resetTargetGoals(): void {
    const currentRegion = this.answers.region || 'US';
    const regionalDiscountPct = currentRegion === 'CA' ? 3.0 : 1.0;

    this.updateAnswers({
      projectedTaxPrepReturns: undefined,
      avgNetFee: undefined,
      discountsPct: regionalDiscountPct,
      discountsAmt: undefined,
      otherIncome: undefined,
      taxRushReturns: undefined,
      taxRushAvgNetFee: undefined,
      projectedAvgNetFee: undefined,
      projectedGrossFees: undefined,
      projectedTaxPrepIncome: undefined,
      taxRushReturnsPct: undefined,
      taxRushGrossFees: undefined,
      projectedExpenses: undefined,
      manualAvgNetFee: undefined,
      manualTaxPrepIncome: undefined,
      manualTaxRushReturns: undefined,
      // Clear frozen baselines so they regenerate from new income drivers
      expenseBaselines: undefined,
    });
  }

  resetExpenseDefaults(force = false): void {
    const region = this.answers.region || 'US';
    const grossRevenue =
      (this.answers.projectedTaxPrepIncome || 0) + (this.answers.otherIncome || 0);
    const b = this.answers.expenseBaselines || {};
    const insuranceSeed =
      b['insuranceMin'] !== undefined && b['insuranceMax'] !== undefined
        ? Math.round(((b['insuranceMin'] || 0) + (b['insuranceMax'] || 0)) / 2)
        : 1200;
    const miscSeedPct =
      b['miscMin'] !== undefined && b['miscMax'] !== undefined && grossRevenue > 0
        ? (((b['miscMin'] || 600) + (b['miscMax'] || 1200)) / 2 / grossRevenue) * 100
        : 1.0;

    const defaults: Partial<WizardAnswers> = {
      payrollPct: region === 'CA' ? 25 : 35,
      empDeductionsPct: 10,
      rentPct: 18,
      telephoneAmt: Math.round((b['telephone'] as number) || 1000),
      utilitiesAmt: Math.round((b['utilities'] as number) || 2400),
      localAdvAmt: Math.round((b['localAdv'] as number) || 4000),
      insuranceAmt: insuranceSeed,
      postageAmt: 800,
      suppliesPct: 3.5,
      duesAmt: Math.round((b['dues'] as number) || 0.8),
      bankFeesAmt: Math.round((b['bankFees'] as number) || 0.4),
      maintenanceAmt: Math.round((b['maintenance'] as number) || 2400),
      travelEntAmt: Math.round((b['travel'] as number) || 1800),
      royaltiesPct: 14,
      advRoyaltiesPct: 5,
      taxRushRoyaltiesPct: region === 'CA' ? 6 : 0,
      shortagesPct: 2,
      miscPct: Math.round(miscSeedPct * 10) / 10,
    };

    const updates: Partial<WizardAnswers> = {};
    (Object.keys(defaults) as Array<keyof WizardAnswers>).forEach((key) => {
      const value = defaults[key];
      if (value === undefined) {
        return;
      }
      if (force || this.answers[key] === undefined) {
        updates[key] = value;
      }
    });

    if (!this.answers.expenseNotes) {
      updates.expenseNotes = {};
    }

    if (Object.keys(updates).length > 0) {
      this.updateAnswers(updates);
    }
  }

  resetEverything(): void {
    const previousStoreType = this.answers.storeType || 'new';

    this.resetQuickStartConfig();

    if (previousStoreType === 'existing') {
      this.resetPriorYearPerformance();
      this.resetProjectedGoals();
    } else {
      this.resetTargetGoals();
    }

    this.resetExpenseDefaults(true);
    this.unlockQuickWizard();
  }

  isQuickWizardLocked(): boolean {
    return this.quickWizardLock$.value;
  }

  lockQuickWizard(): void {
    if (!this.quickWizardLock$.value) {
      this.quickWizardLock$.next(true);
    }
  }

  unlockQuickWizard(): void {
    if (this.quickWizardLock$.value) {
      this.quickWizardLock$.next(false);
    }
  }
}
