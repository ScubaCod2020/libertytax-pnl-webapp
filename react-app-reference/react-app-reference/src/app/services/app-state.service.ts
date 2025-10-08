import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppState, Region } from '../models/wizard.models';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private stateSubject = new BehaviorSubject<AppState>({
    region: 'US',
    showWizard: true,
    scenario: 'new',
    avgNetFee: 0,
    taxPrepReturns: 0,
    taxRushReturns: 0,
    discountsPct: 3,
    otherIncome: 0,
    salariesPct: 0,
    empDeductionsPct: 0,
    rentPct: 0,
    telephoneAmt: 0,
    utilitiesAmt: 0,
    localAdvAmt: 0,
    insuranceAmt: 0,
    postageAmt: 0,
    suppliesPct: 0,
    duesAmt: 0,
    bankFeesAmt: 0,
    maintenanceAmt: 0,
    travelEntAmt: 0,
    royaltiesPct: 0,
    advRoyaltiesPct: 0,
    taxRushRoyaltiesPct: 0,
    miscPct: 0,
    thresholds: {}
  });

  public state$ = this.stateSubject.asObservable();

  get currentState(): AppState {
    return this.stateSubject.value;
  }

  setRegion(region: Region): void {
    this.updateState({ region });
  }

  setShowWizard(show: boolean): void {
    this.updateState({ showWizard: show });
  }

  setScenario(scenario: string): void {
    this.updateState({ scenario });
  }

  setANF(value: number): void {
    this.updateState({ avgNetFee: value });
  }

  setReturns(value: number): void {
    this.updateState({ taxPrepReturns: value });
  }

  setTaxRush(value: number): void {
    this.updateState({ taxRushReturns: value });
  }

  setDisc(value: number): void {
    this.updateState({ discountsPct: value });
  }

  setOtherIncome(value: number): void {
    this.updateState({ otherIncome: value });
  }

  setSal(value: number): void {
    this.updateState({ salariesPct: value });
  }

  setEmpDeductions(value: number): void {
    this.updateState({ empDeductionsPct: value });
  }

  setRent(value: number): void {
    this.updateState({ rentPct: value });
  }

  setTelephone(value: number): void {
    this.updateState({ telephoneAmt: value });
  }

  setUtilities(value: number): void {
    this.updateState({ utilitiesAmt: value });
  }

  setLocalAdv(value: number): void {
    this.updateState({ localAdvAmt: value });
  }

  setInsurance(value: number): void {
    this.updateState({ insuranceAmt: value });
  }

  setPostage(value: number): void {
    this.updateState({ postageAmt: value });
  }

  setSup(value: number): void {
    this.updateState({ suppliesPct: value });
  }

  setDues(value: number): void {
    this.updateState({ duesAmt: value });
  }

  setBankFees(value: number): void {
    this.updateState({ bankFeesAmt: value });
  }

  setMaintenance(value: number): void {
    this.updateState({ maintenanceAmt: value });
  }

  setTravelEnt(value: number): void {
    this.updateState({ travelEntAmt: value });
  }

  setRoy(value: number): void {
    this.updateState({ royaltiesPct: value });
  }

  setAdvRoy(value: number): void {
    this.updateState({ advRoyaltiesPct: value });
  }

  setTaxRushRoy(value: number): void {
    this.updateState({ taxRushRoyaltiesPct: value });
  }

  setMisc(value: number): void {
    this.updateState({ miscPct: value });
  }

  setThr(thresholds: any): void {
    this.updateState({ thresholds });
  }

  applyWizardAnswers(answers: any): void {
    console.log('🧙‍♂️ Applying wizard answers to app state:', answers);
    this.updateState({
      region: answers.region || this.currentState.region,
      avgNetFee: answers.avgNetFee || 0,
      taxPrepReturns: answers.taxPrepReturns || 0,
      taxRushReturns: answers.taxRushReturns || 0,
      discountsPct: answers.discountsPct || 3,
      otherIncome: answers.otherIncome || 0,
      salariesPct: answers.salariesPct || 0,
      empDeductionsPct: answers.empDeductionsPct || 0,
      rentPct: answers.rentPct || 0,
      telephoneAmt: answers.telephoneAmt || 0,
      utilitiesAmt: answers.utilitiesAmt || 0,
      localAdvAmt: answers.localAdvAmt || 0,
      insuranceAmt: answers.insuranceAmt || 0,
      postageAmt: answers.postageAmt || 0,
      suppliesPct: answers.suppliesPct || 0,
      duesAmt: answers.duesAmt || 0,
      bankFeesAmt: answers.bankFeesAmt || 0,
      maintenanceAmt: answers.maintenanceAmt || 0,
      travelEntAmt: answers.travelEntAmt || 0,
      royaltiesPct: answers.royaltiesPct || 0,
      advRoyaltiesPct: answers.advRoyaltiesPct || 0,
      taxRushRoyaltiesPct: answers.taxRushRoyaltiesPct || 0,
      miscPct: answers.miscPct || 0
    });
  }

  resetToDefaults(): void {
    console.log('🔄 Resetting app state to defaults');
    this.stateSubject.next({
      region: 'US',
      showWizard: true,
      scenario: 'new',
      avgNetFee: 0,
      taxPrepReturns: 0,
      taxRushReturns: 0,
      discountsPct: 3,
      otherIncome: 0,
      salariesPct: 0,
      empDeductionsPct: 0,
      rentPct: 0,
      telephoneAmt: 0,
      utilitiesAmt: 0,
      localAdvAmt: 0,
      insuranceAmt: 0,
      postageAmt: 0,
      suppliesPct: 0,
      duesAmt: 0,
      bankFeesAmt: 0,
      maintenanceAmt: 0,
      travelEntAmt: 0,
      royaltiesPct: 0,
      advRoyaltiesPct: 0,
      taxRushRoyaltiesPct: 0,
      miscPct: 0,
      thresholds: {}
    });
  }

  // Readonly signals for state management
  private priorYearSignal = signal<any>({});
  private projectedSignal = signal<any>({});
  private expensesSignal = signal<any>({});
  private summarySignal = signal<any>({});

  // Public readonly signals
  readonly priorYear = this.priorYearSignal.asReadonly();
  readonly projected = this.projectedSignal.asReadonly();
  readonly expenses = this.expensesSignal.asReadonly();
  readonly summary = this.summarySignal.asReadonly();

  // Update methods for signals
  updatePriorYear(data: any): void {
    this.priorYearSignal.set(data);
    console.log('📊 Prior year state updated:', data);
  }

  updateProjected(data: any): void {
    this.projectedSignal.set(data);
    console.log('📈 Projected state updated:', data);
  }

  updateExpenses(data: any): void {
    this.expensesSignal.set(data);
    console.log('💰 Expenses state updated:', data);
  }

  updateSummary(data: any): void {
    this.summarySignal.set(data);
    console.log('📋 Summary state updated:', data);
  }

  private updateState(updates: Partial<AppState>): void {
    const currentState = this.currentState;
    const newState = { ...currentState, ...updates };
    this.stateSubject.next(newState);
    console.log('🔄 App state updated:', updates);
  }
}
